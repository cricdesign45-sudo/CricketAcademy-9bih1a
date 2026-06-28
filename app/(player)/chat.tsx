import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function AvatarCircle({ name, size = 44, color }: { name: string; size?: number; color: string }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontSize: size * 0.4, fontWeight: '700', color }}>{name[0]?.toUpperCase()}</Text>
    </View>
  );
}

export default function ChatInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { players } = usePlayers();
  const { conversations, totalUnread, loadingConversations, openConversation, refreshConversations } = useChat();
  const { Colors: C } = useTheme();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'chats' | 'people'>('chats');
  const [opening, setOpening] = useState<string | null>(null);

  const myId = user?.playerId ?? user?.id ?? '';

  // Other active players (exclude self)
  const otherPlayers = useMemo(() =>
    players.filter(p => p.isActive && p.id !== myId),
    [players, myId]
  );

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return otherPlayers;
    const q = search.toLowerCase();
    return otherPlayers.filter(p =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
  }, [otherPlayers, search]);

  const enrichedConvos = useMemo(() => {
    return conversations.map(c => {
      const otherId = c.player1Id === myId ? c.player2Id : c.player1Id;
      const player = players.find(p => p.id === otherId);
      const unread = c.player1Id === myId ? c.player1Unread : c.player2Unread;
      return { ...c, otherId, player, unread };
    }).filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return c.player?.name.toLowerCase().includes(q) || c.otherId.toLowerCase().includes(q);
    });
  }, [conversations, myId, players, search]);

  const handleOpen = useCallback(async (otherId: string) => {
    setOpening(otherId);
    const convId = await openConversation(otherId);
    setOpening(null);
    if (convId) {
      router.push({ pathname: '/chat-conversation', params: { conversationId: convId, otherId } });
    }
  }, [openConversation, router]);

  const AVATAR_COLORS = ['#1B5E20', '#1565C0', '#6A1B9A', '#BF360C', '#004D40', '#E65100'];
  const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <View style={[st.root, { paddingTop: insets.top, backgroundColor: C.bgDark }]}>
      {/* Header */}
      <View style={[st.header, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
        <View>
          <Text style={[st.title, { color: C.textPrimary }]}>Messages</Text>
          {totalUnread > 0 ? (
            <Text style={[st.subtitle, { color: C.primary }]}>{totalUnread} unread</Text>
          ) : (
            <Text style={[st.subtitle, { color: C.textMuted }]}>Chat with teammates</Text>
          )}
        </View>
        <TouchableOpacity
          style={[st.newBtn, { backgroundColor: C.primary + '12', borderColor: C.primary + '40' }]}
          onPress={() => { setTab('people'); setSearch(''); }}
        >
          <MaterialIcons name="edit" size={16} color={C.primary} />
          <Text style={[st.newBtnTxt, { color: C.primary }]}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[st.searchWrap, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <MaterialIcons name="search" size={16} color={C.textMuted} />
        <TextInput
          style={[st.searchInput, { color: C.textPrimary }]}
          value={search}
          onChangeText={setSearch}
          placeholder={tab === 'chats' ? 'Search conversations…' : 'Search by name or ID…'}
          placeholderTextColor={C.textMuted}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={16} color={C.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tabs */}
      <View style={[st.tabs, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
        {(['chats', 'people'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[st.tab, tab === t && { borderBottomColor: C.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
          >
            <Text style={[st.tabTxt, { color: tab === t ? C.primary : C.textMuted }, tab === t && { fontWeight: '700' }]}>
              {t === 'chats' ? `Chats${conversations.length ? ` (${conversations.length})` : ''}` : 'All Players'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === 'chats' ? (
        <FlatList
          data={enrichedConvos}
          keyExtractor={c => c.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={st.list}
          onRefresh={refreshConversations}
          refreshing={loadingConversations}
          renderItem={({ item: c }) => {
            const name = c.player?.name ?? c.otherId;
            const color = avatarColor(name);
            const isMe = c.lastMessageSenderId === myId;
            return (
              <TouchableOpacity
                style={[st.convoRow, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}
                onPress={() => handleOpen(c.otherId)}
                activeOpacity={0.75}
              >
                {opening === c.otherId ? (
                  <ActivityIndicator size={44} color={C.primary} />
                ) : (
                  <AvatarCircle name={name} size={48} color={color} />
                )}
                <View style={st.convoInfo}>
                  <View style={st.convoTopRow}>
                    <Text style={[st.convoName, { color: C.textPrimary }]} numberOfLines={1}>{name}</Text>
                    <Text style={[st.convoTime, { color: c.unread > 0 ? C.primary : C.textMuted }]}>
                      {c.lastMessageAt ? formatTime(c.lastMessageAt) : ''}
                    </Text>
                  </View>
                  <View style={st.convoBottomRow}>
                    <Text style={[st.convoPreview, { color: c.unread > 0 ? C.textSecondary : C.textMuted }]} numberOfLines={1}>
                      {isMe ? 'You: ' : ''}{c.lastMessage || 'No messages yet'}
                    </Text>
                    {c.unread > 0 ? (
                      <View style={[st.badge, { backgroundColor: C.primary }]}>
                        <Text style={st.badgeTxt}>{c.unread > 9 ? '9+' : c.unread}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[st.convoRole, { color: C.textMuted }]}>{c.player?.playingRole ?? ''}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={st.empty}>
              <MaterialIcons name="chat-bubble-outline" size={52} color={C.border} />
              <Text style={[st.emptyTitle, { color: C.textPrimary }]}>No conversations yet</Text>
              <Text style={[st.emptyDesc, { color: C.textMuted }]}>Tap "All Players" to start a chat</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={p => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={st.list}
          renderItem={({ item: p }) => {
            const color = avatarColor(p.name);
            const isOpening = opening === p.id;
            return (
              <TouchableOpacity
                style={[st.convoRow, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}
                onPress={() => handleOpen(p.id)}
                activeOpacity={0.75}
                disabled={isOpening}
              >
                {isOpening ? (
                  <ActivityIndicator size={44} color={C.primary} />
                ) : (
                  <AvatarCircle name={p.name} size={48} color={color} />
                )}
                <View style={st.convoInfo}>
                  <Text style={[st.convoName, { color: C.textPrimary }]}>{p.name}</Text>
                  <Text style={[st.convoRole, { color: C.textMuted }]}>{p.playingRole} · {p.batch}</Text>
                  <Text style={[st.convoId, { color: C.textMuted }]}>ID: {p.id}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={st.empty}>
              <MaterialIcons name="person-search" size={52} color={C.border} />
              <Text style={[st.emptyTitle, { color: C.textPrimary }]}>
                {search ? 'No players found' : 'No players available'}
              </Text>
              <Text style={[st.emptyDesc, { color: C.textMuted }]}>
                {search ? 'Try a different name or ID' : 'Active teammates will appear here'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: { fontSize: Typography.lg, fontWeight: '700' },
  subtitle: { fontSize: Typography.xs, marginTop: 1 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1,
  },
  newBtnTxt: { fontSize: Typography.sm, fontWeight: '600' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.base, marginTop: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: Radius.xl, borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, fontSize: Typography.sm, paddingVertical: 10 },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.base,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabTxt: { fontSize: Typography.sm, fontWeight: '600' },

  list: { paddingBottom: 32 },

  convoRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  convoInfo: { flex: 1, gap: 2 },
  convoTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convoBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convoName: { fontSize: Typography.sm, fontWeight: '600', flex: 1 },
  convoPreview: { fontSize: Typography.xs, flex: 1 },
  convoRole: { fontSize: 10, marginTop: 1 },
  convoId: { fontSize: 10 },
  convoTime: { fontSize: 10, fontWeight: '500', marginLeft: 8 },

  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeTxt: { fontSize: 9, color: '#fff', fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 64, gap: Spacing.sm },
  emptyTitle: { fontSize: Typography.base, fontWeight: '700' },
  emptyDesc: { fontSize: Typography.sm, textAlign: 'center' },
});
