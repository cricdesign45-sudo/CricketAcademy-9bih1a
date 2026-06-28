import { getSupabaseClient } from '@/template';

const supabase = getSupabaseClient();

export interface ChatConversation {
  id: string;
  player1Id: string;
  player2Id: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  player1Unread: number;
  player2Unread: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface PlayerPresence {
  playerId: string;
  isOnline: boolean;
  lastSeen: string;
  typingInConversation: string | null;
}

// ─── Presence ────────────────────────────────────────────────────────────────

export async function upsertPresence(playerId: string, isOnline: boolean, typingInConversation?: string | null) {
  await supabase.from('player_presence').upsert({
    player_id: playerId,
    is_online: isOnline,
    last_seen: new Date().toISOString(),
    typing_in_conversation: typingInConversation ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function getPresence(playerIds: string[]): Promise<PlayerPresence[]> {
  if (!playerIds.length) return [];
  const { data } = await supabase
    .from('player_presence')
    .select('*')
    .in('player_id', playerIds);
  return (data ?? []).map(rowToPresence);
}

function rowToPresence(r: any): PlayerPresence {
  return {
    playerId: r.player_id,
    isOnline: r.is_online ?? false,
    lastSeen: r.last_seen ?? new Date().toISOString(),
    typingInConversation: r.typing_in_conversation ?? null,
  };
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function getOrCreateConversation(myId: string, otherId: string): Promise<ChatConversation | null> {
  // Normalize order so player1_id < player2_id lexicographically
  const [p1, p2] = [myId, otherId].sort();

  // Try to find existing
  const { data: existing } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('player1_id', p1)
    .eq('player2_id', p2)
    .single();

  if (existing) return rowToConversation(existing);

  // Create new
  const { data: created, error } = await supabase
    .from('chat_conversations')
    .insert({ player1_id: p1, player2_id: p2 })
    .select()
    .single();

  if (error || !created) return null;
  return rowToConversation(created);
}

export async function getMyConversations(myId: string): Promise<ChatConversation[]> {
  const { data } = await supabase
    .from('chat_conversations')
    .select('*')
    .or(`player1_id.eq.${myId},player2_id.eq.${myId}`)
    .order('last_message_at', { ascending: false });
  return (data ?? []).map(rowToConversation);
}

export async function markConversationRead(conversationId: string, myId: string, amPlayer1: boolean) {
  const field = amPlayer1 ? 'player1_unread' : 'player2_unread';
  await supabase
    .from('chat_conversations')
    .update({ [field]: 0 })
    .eq('id', conversationId);
}

function rowToConversation(r: any): ChatConversation {
  return {
    id: r.id,
    player1Id: r.player1_id,
    player2Id: r.player2_id,
    lastMessage: r.last_message ?? '',
    lastMessageAt: r.last_message_at ?? r.created_at,
    lastMessageSenderId: r.last_message_sender_id ?? '',
    player1Unread: r.player1_unread ?? 0,
    player2Unread: r.player2_unread ?? 0,
    createdAt: r.created_at,
  };
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  receiverId: string,
  amPlayer1: boolean
): Promise<ChatMessage | null> {
  // Insert message
  const { data: msg, error } = await supabase
    .from('chat_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content, status: 'sent' })
    .select()
    .single();

  if (error || !msg) return null;

  // Update conversation meta + increment receiver unread
  const unreadField = amPlayer1 ? 'player2_unread' : 'player1_unread';
  const { data: conv } = await supabase
    .from('chat_conversations')
    .select(unreadField)
    .eq('id', conversationId)
    .single();

  const currentUnread = conv ? (conv[unreadField] ?? 0) : 0;

  await supabase.from('chat_conversations').update({
    last_message: content.length > 80 ? content.slice(0, 80) + '…' : content,
    last_message_at: msg.created_at,
    last_message_sender_id: senderId,
    [unreadField]: currentUnread + 1,
  }).eq('id', conversationId);

  return rowToMessage(msg);
}

export async function getMessages(conversationId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
  let q = supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) q = q.lt('created_at', before);

  const { data } = await q;
  return (data ?? []).reverse().map(rowToMessage);
}

export async function getNewMessages(conversationId: string, since: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .gt('created_at', since)
    .order('created_at', { ascending: true });
  return (data ?? []).map(rowToMessage);
}

export async function markMessagesDelivered(conversationId: string, myId: string) {
  await supabase
    .from('chat_messages')
    .update({ status: 'delivered' })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myId)
    .eq('status', 'sent');
}

export async function markMessagesRead(conversationId: string, myId: string) {
  await supabase
    .from('chat_messages')
    .update({ status: 'read' })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myId)
    .in('status', ['sent', 'delivered']);
}

function rowToMessage(r: any): ChatMessage {
  return {
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    content: r.content,
    status: r.status ?? 'sent',
    createdAt: r.created_at,
  };
}
