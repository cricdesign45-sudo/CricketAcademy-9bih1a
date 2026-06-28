import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { ChatMessage } from '@/services/chatService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
}

function formatLastSeen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'Last seen just now';
  if (diff < 3600) return `Last seen ${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `Last seen at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return `Last seen ${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}`;
}

// Status tick icon
function StatusIcon({ status, color }: { status: ChatMessage['status']; color: string }) {
  if (status === 'sending') return <MaterialIcons name="schedule" size={11} color={color} />;
  if (status === 'sent') return <MaterialIcons name="check" size={11} color={color} />;
  if (status === 'delivered') return <MaterialIcons name="done-all" size={11} color={color} />;
  if (status === 'read') return <MaterialIcons name="done-all" size={11} color="#4FC3F7" />;
  return null;
}

// Typing bubble
function TypingBubble({ C }: { C: any }) {
  return (
    <View style={[tb.wrap, { backgroundColor: C.bgSurface }]}>
      <View style={tb.dot} />
      <View style={[tb.dot, { opacity: 0.6 }]} />
      <View style={[tb.dot, { opacity: 0.3 }]} />
    </View>
  );
}
const tb = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 4, padding: 10, borderRadius: 16, alignSelf: 'flex-start', marginLeft: Spacing.base, marginBottom: Spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ conversationId: string; otherId: string }>();
  const { user } = useAuth();
  const { players } = usePlayers();
  const { Colors: C } = useTheme();
  const {
    messages, loadingMessages, loadingMore, isTyping,
    otherPresence, openConversation, closeConversation,
    sendMessage, loadMoreMessages, setTyping,
  } = useChat();

  const myId = user?.playerId ?? user?.id ?? '';
  const otherId = params.otherId ?? '';
  const otherPlayer = useMemo(() => players.find(p => p.id === otherId), [players, otherId]);

  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const isInitialized = useRef(false);

  // Open conversation on mount if not already open
  useEffect(() => {
    if (!isInitialized.current && otherId) {
      isInitialized.current = true;
      openConversation(otherId);
    }
    return () => { closeConversation(); };
  }, [otherId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setInputText('');
    setSending(true);
    setTyping(false);
    await sendMessage(text);
    setSending(false);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [inputText, sending, sendMessage, setTyping]);

  const handleChangeText = useCallback((t: string) => {
    setInputText(t);
    if (t.length > 0) setTyping(true);
  }, [setTyping]);

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const items: ({ type: 'day'; label: string; key: string } | { type: 'msg'; msg: ChatMessage; key: string })[] = [];
    let lastDay = '';
    messages.forEach(msg => {
      const day = new Date(msg.createdAt).toDateString();
      if (day !== lastDay) {
        items.push({ type: 'day', label: formatDayLabel(msg.createdAt), key: `day-${day}` });
        lastDay = day;
      }
      items.push({ type: 'msg', msg, key: msg.id });
    });
    if (isTyping) items.push({ type: 'msg', msg: { id: 'typing', conversationId: '', senderId: otherId, content: '', status: 'sent', createdAt: '' }, key: 'typing-bubble' });
    return items;
  }, [messages, isTyping, otherId]);

  const onlineStatus = useMemo(() => {
    if (!otherPresence) return '';
    if (otherPresence.isOnline) return 'Online';
    return formatLastSeen(otherPresence.lastSeen);
  }, [otherPresence]);

  const AVATAR_COLORS = ['#1B5E20', '#1565C0', '#6A1B9A', '#BF360C', '#004D40', '#E65100'];
  const avatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
  const otherName = otherPlayer?.name ?? otherId;
  const otherColor = avatarColor(otherName);

  return (
    <KeyboardAvoidingView
      style={[st.root, { backgroundColor: C.bgDark }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View style={[st.header, { paddingTop: insets.top + 8, backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={C.textPrimary} />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={[st.headerAvatar, { backgroundColor: otherColor + '20' }]}>
          <Text style={[st.headerAvatarTxt, { color: otherColor }]}>{otherName[0]?.toUpperCase()}</Text>
          {otherPresence?.isOnline ? (
            <View style={[st.onlineDot, { backgroundColor: '#22C55E', borderColor: C.bgCard }]} />
          ) : null}
        </View>

        <View style={st.headerInfo}>
          <Text style={[st.headerName, { color: C.textPrimary }]} numberOfLines={1}>{otherName}</Text>
          {isTyping ? (
            <Text style={[st.headerStatus, { color: C.primary }]}>typing…</Text>
          ) : onlineStatus ? (
            <Text style={[st.headerStatus, { color: otherPresence?.isOnline ? '#22C55E' : C.textMuted }]}>
              {onlineStatus}
            </Text>
          ) : null}
        </View>

        <View style={st.headerActions}>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: C.bgSurface }]}>
            <MaterialIcons name="videocam" size={18} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[st.headerBtn, { backgroundColor: C.bgSurface }]}>
            <MaterialIcons name="call" size={18} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Messages ── */}
      {loadingMessages ? (
        <View style={st.loadWrap}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[st.loadTxt, { color: C.textMuted }]}>Loading messages…</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={groupedMessages}
          keyExtractor={item => item.key}
          contentContainerStyle={[st.msgList, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          onStartReached={loadMoreMessages}
          onStartReachedThreshold={0.2}
          ListHeaderComponent={loadingMore ? <ActivityIndicator color={C.primary} style={{ marginVertical: 8 }} /> : null}
          renderItem={({ item }) => {
            if (item.type === 'day') {
              return (
                <View style={st.dayWrap}>
                  <View style={[st.dayLine, { backgroundColor: C.border }]} />
                  <Text style={[st.dayLabel, { color: C.textMuted, backgroundColor: C.bgDark }]}>{item.label}</Text>
                  <View style={[st.dayLine, { backgroundColor: C.border }]} />
                </View>
              );
            }

            const msg = item.msg;

            // Typing bubble
            if (msg.id === 'typing') return <TypingBubble C={C} />;

            const isMe = msg.senderId === myId;

            return (
              <View style={[st.msgRow, isMe && st.msgRowMe]}>
                {!isMe ? (
                  <View style={[st.avatarSm, { backgroundColor: otherColor + '20' }]}>
                    <Text style={[st.avatarSmTxt, { color: otherColor }]}>{otherName[0]?.toUpperCase()}</Text>
                  </View>
                ) : null}

                <View style={[
                  st.bubble,
                  isMe
                    ? { backgroundColor: C.primary, borderBottomRightRadius: 4 }
                    : { backgroundColor: C.bgCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
                ]}>
                  <Text style={[st.bubbleTxt, { color: isMe ? '#fff' : C.textPrimary }]}>
                    {msg.content}
                  </Text>
                  <View style={st.bubbleMeta}>
                    <Text style={[st.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.6)' : C.textMuted }]}>
                      {msg.createdAt ? formatMsgTime(msg.createdAt) : ''}
                    </Text>
                    {isMe ? <StatusIcon status={msg.status} color={isMe ? 'rgba(255,255,255,0.7)' : C.textMuted} /> : null}
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ── Input ── */}
      <View style={[st.inputBar, { backgroundColor: C.bgCard, borderTopColor: C.border, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={[st.attachBtn, { backgroundColor: C.bgSurface }]}>
          <MaterialIcons name="attach-file" size={20} color={C.textSecondary} />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={[st.input, { backgroundColor: C.bgSurface, color: C.textPrimary, borderColor: C.border }]}
          value={inputText}
          onChangeText={handleChangeText}
          placeholder="Type a message…"
          placeholderTextColor={C.textMuted}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />

        <TouchableOpacity
          style={[
            st.sendBtn,
            { backgroundColor: inputText.trim() ? C.primary : C.bgSurface },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size={18} color="#fff" />
          ) : (
            <MaterialIcons
              name="send"
              size={18}
              color={inputText.trim() ? '#fff' : C.textMuted}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 2 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  headerAvatarTxt: { fontSize: Typography.base, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5, borderWidth: 1.5,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: Typography.sm, fontWeight: '700' },
  headerStatus: { fontSize: 10, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerBtn: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },

  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadTxt: { fontSize: Typography.sm },

  msgList: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },

  dayWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: Spacing.md },
  dayLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dayLabel: { fontSize: 10, fontWeight: '600', paddingHorizontal: 6 },

  msgRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 6,
    marginBottom: 6, maxWidth: '85%',
  },
  msgRowMe: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },

  avatarSm: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarSmTxt: { fontSize: 11, fontWeight: '700' },

  bubble: {
    borderRadius: 18, paddingHorizontal: 13, paddingTop: 8, paddingBottom: 6,
    maxWidth: '100%',
  },
  bubbleTxt: { fontSize: Typography.sm, lineHeight: 20 },
  bubbleMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2, alignSelf: 'flex-end' },
  bubbleTime: { fontSize: 9 },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: Spacing.base, paddingTop: 10,
    borderTopWidth: 1,
  },
  attachBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1, borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 14, paddingTop: 9, paddingBottom: 9,
    fontSize: Typography.sm, maxHeight: 120, minHeight: 38,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
});
