import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import {
  ChatConversation, ChatMessage, PlayerPresence,
  getMyConversations, getOrCreateConversation,
  sendMessage as dbSend, getMessages, getNewMessages,
  markMessagesRead, markConversationRead,
  upsertPresence, getPresence,
} from '@/services/chatService';

interface ChatContextType {
  conversations: ChatConversation[];
  totalUnread: number;
  loadingConversations: boolean;

  activeConversationId: string | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  loadingMore: boolean;

  otherPresence: PlayerPresence | null;
  isTyping: boolean;

  openConversation: (otherId: string) => Promise<string | null>;
  closeConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  setTyping: (typing: boolean) => void;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const myId = user?.playerId ?? user?.id ?? '';

  // ── Inbox state ────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  // ── Active conversation state ──────────────────────────────────────────────
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [otherPlayerId, setOtherPlayerId] = useState<string | null>(null);

  // ── Presence state ─────────────────────────────────────────────────────────
  const [otherPresence, setOtherPresence] = useState<PlayerPresence | null>(null);
  const [isTyping, setIsTypingState] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const presencePollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inboxPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageTime = useRef<string>(new Date(0).toISOString());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingSentRef = useRef(false);

  const totalUnread = conversations.reduce((s, c) => {
    const amP1 = c.player1Id === myId;
    return s + (amP1 ? c.player1Unread : c.player2Unread);
  }, 0);

  // ── Presence: go online when user exists ──────────────────────────────────
  useEffect(() => {
    if (!myId) return;

    upsertPresence(myId, true);

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      upsertPresence(myId, state === 'active');
    });

    // Heartbeat every 20s
    const heartbeat = setInterval(() => {
      upsertPresence(myId, true);
    }, 20000);

    return () => {
      sub.remove();
      clearInterval(heartbeat);
      upsertPresence(myId, false);
    };
  }, [myId]);

  // ── Inbox polling ──────────────────────────────────────────────────────────
  const refreshConversations = useCallback(async () => {
    if (!myId) return;
    setLoadingConversations(true);
    const data = await getMyConversations(myId);
    setConversations(data);
    setLoadingConversations(false);
  }, [myId]);

  useEffect(() => {
    if (!myId) return;
    refreshConversations();
    inboxPollRef.current = setInterval(refreshConversations, 5000);
    return () => { if (inboxPollRef.current) clearInterval(inboxPollRef.current); };
  }, [myId, refreshConversations]);

  // ── Open conversation ──────────────────────────────────────────────────────
  const openConversation = useCallback(async (otherId: string): Promise<string | null> => {
    if (!myId) return null;
    setLoadingMessages(true);
    setMessages([]);
    setOtherPlayerId(otherId);

    const conv = await getOrCreateConversation(myId, otherId);
    if (!conv) { setLoadingMessages(false); return null; }

    setActiveConversationId(conv.id);
    lastMessageTime.current = new Date(0).toISOString();

    // Load initial messages
    const msgs = await getMessages(conv.id, 50);
    setMessages(msgs);
    if (msgs.length) lastMessageTime.current = msgs[msgs.length - 1].createdAt;
    setLoadingMessages(false);

    // Mark as read
    const amP1 = conv.player1Id === myId;
    await markMessagesRead(conv.id, myId);
    await markConversationRead(conv.id, myId, amP1);

    return conv.id;
  }, [myId]);

  const closeConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setOtherPlayerId(null);
    setOtherPresence(null);
    setIsTypingState(false);
    if (pollRef.current) clearInterval(pollRef.current);
    if (presencePollRef.current) clearInterval(presencePollRef.current);
  }, []);

  // ── Message polling (when conversation open) ───────────────────────────────
  useEffect(() => {
    if (!activeConversationId || !myId) return;

    const poll = async () => {
      const newMsgs = await getNewMessages(activeConversationId, lastMessageTime.current);
      if (newMsgs.length) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const fresh = newMsgs.filter(m => !ids.has(m.id));
          if (!fresh.length) return prev;
          lastMessageTime.current = fresh[fresh.length - 1].createdAt;
          return [...prev, ...fresh];
        });
        // Mark incoming as read
        const conv = conversations.find(c => c.id === activeConversationId);
        if (conv) {
          await markMessagesRead(activeConversationId, myId);
          await markConversationRead(activeConversationId, myId, conv.player1Id === myId);
        }
      }
    };

    pollRef.current = setInterval(poll, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeConversationId, myId]);

  // ── Presence polling for other player ─────────────────────────────────────
  useEffect(() => {
    if (!otherPlayerId) return;

    const pollPresence = async () => {
      const results = await getPresence([otherPlayerId]);
      if (results[0]) {
        setOtherPresence(results[0]);
        // Detect typing
        setIsTypingState(
          results[0].typingInConversation === activeConversationId &&
          results[0].isOnline
        );
      }
    };

    pollPresence();
    presencePollRef.current = setInterval(pollPresence, 3000);
    return () => { if (presencePollRef.current) clearInterval(presencePollRef.current); };
  }, [otherPlayerId, activeConversationId]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || !myId || !content.trim()) return;

    const conv = conversations.find(c => c.id === activeConversationId) ||
      await getOrCreateConversation(myId, otherPlayerId ?? '');
    if (!conv) return;

    const amP1 = conv.player1Id === myId;
    const otherId = amP1 ? conv.player2Id : conv.player1Id;

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversationId: activeConversationId,
      senderId: myId,
      content: content.trim(),
      status: 'sending',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    const sent = await dbSend(activeConversationId, myId, content.trim(), otherId, amP1);
    if (sent) {
      setMessages(prev => prev.map(m => m.id === tempId ? sent : m));
      lastMessageTime.current = sent.createdAt;
      // Refresh conversations to update preview
      refreshConversations();
    } else {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  }, [activeConversationId, myId, conversations, otherPlayerId, refreshConversations]);

  // ── Load more (older messages) ────────────────────────────────────────────
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const oldest = messages[0].createdAt;
    const older = await getMessages(activeConversationId, 30, oldest);
    setMessages(prev => {
      const ids = new Set(prev.map(m => m.id));
      return [...older.filter(m => !ids.has(m.id)), ...prev];
    });
    setLoadingMore(false);
  }, [activeConversationId, loadingMore, messages]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const setTyping = useCallback((typing: boolean) => {
    if (!myId) return;
    if (typing && !isTypingSentRef.current) {
      isTypingSentRef.current = true;
      upsertPresence(myId, true, activeConversationId);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingSentRef.current = false;
      upsertPresence(myId, true, null);
    }, 2500);
  }, [myId, activeConversationId]);

  return (
    <ChatContext.Provider value={{
      conversations, totalUnread, loadingConversations,
      activeConversationId, messages, loadingMessages, loadingMore,
      otherPresence, isTyping,
      openConversation, closeConversation, sendMessage, loadMoreMessages,
      setTyping, refreshConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
