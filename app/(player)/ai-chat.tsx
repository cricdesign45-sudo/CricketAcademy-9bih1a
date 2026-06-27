import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { sendChatMessage, analyzePlayer, AIAnalysisType } from '@/services/aiService';
import { ChatMessage } from '@/services/aiService';

const QUICK_PROMPTS = [
  { label: 'My batting tips', msg: 'Give me personalized batting improvement tips based on my stats.' },
  { label: 'Training plan', msg: 'Create a weekly training plan tailored to my role and current skill level.' },
  { label: 'Injury prevention', msg: 'What injury prevention exercises should I do for my position?' },
  { label: 'Mental tips', msg: 'Give me mental strength and concentration tips for cricket matches.' },
  { label: 'Nutrition advice', msg: 'What should a cricket player like me eat for peak performance?' },
  { label: 'Improve fielding', msg: 'How can I improve my fielding? What drills should I practice?' },
];

const ANALYSIS_SHORTCUTS: { type: AIAnalysisType; label: string; icon: string }[] = [
  { type: 'performance', label: 'Performance Report', icon: 'bar-chart' },
  { type: 'training', label: 'My Training Plan', icon: 'fitness-center' },
  { type: 'injury_risk', label: 'Injury Risk Check', icon: 'health-and-safety' },
];

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { players } = usePlayers();
  const { Colors } = useTheme();
  const C = Colors;

  const player = players.find(p => p.id === user?.playerId) || players[0];
  const sessionId = useRef(generateSessionId()).current;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState<AIAnalysisType | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: `Hey ${player?.name?.split(' ')[0] ?? 'there'}! 👋 I am your personal cricket AI coach. I can help you with performance analysis, training plans, nutrition, mental tips, and anything cricket-related. What would you like to know?`,
    }]);
  }, []);

  const sendMessage = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || sending) return;
    setInput('');

    const newUserMsg: ChatMessage = { role: 'user', content: msgText };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setSending(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const { reply, error } = await sendChatMessage(
      updatedMessages,
      player || null,
      sessionId
    );

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: error ? `Sorry, I encountered an issue: ${error}. Please try again.` : reply,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setSending(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const runQuickAnalysis = async (type: AIAnalysisType, label: string) => {
    if (!player || analysisLoading) return;
    setAnalysisLoading(type);

    const userMsg: ChatMessage = { role: 'user', content: `Run ${label} for me` };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const res = await analyzePlayer(player, type);

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: res.error ? `Could not generate ${label}: ${res.error}` : res.content,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setAnalysisLoading(null);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! I am ready to help you again, ${player?.name?.split(' ')[0] ?? 'Player'}. What would you like to know?`,
    }]);
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === 'user';
    const lines = item.content.split('\n');

    return (
      <View style={[s.msgRow, isUser ? s.msgRowUser : s.msgRowAI]}>
        {!isUser && (
          <View style={[s.aiAvatar, { backgroundColor: C.info + '1A', borderColor: C.info + '33' }]}>
            <MaterialIcons name="auto-awesome" size={14} color={C.info} />
          </View>
        )}
        <View style={[
          s.bubble,
          isUser
            ? [s.bubbleUser, { backgroundColor: C.primary }]
            : [s.bubbleAI, { backgroundColor: C.bgCard, borderColor: C.border }],
        ]}>
          {lines.map((line, li) => {
            if (!line.trim()) return <View key={li} style={{ height: 4 }} />;
            const isBold = line.startsWith('**') && line.endsWith('**');
            const isBullet = line.startsWith('- ') || line.startsWith('• ');
            const isNum = /^\d+\./.test(line);

            if (isBold) {
              return <Text key={li} style={[s.bubbleBold, { color: isUser ? '#fff' : C.textPrimary }]}>{line.replace(/\*\*/g, '')}</Text>;
            }
            if (isBullet) {
              return (
                <View key={li} style={s.bulletRow}>
                  <View style={[s.bulletDot, { backgroundColor: isUser ? 'rgba(255,255,255,0.7)' : C.info }]} />
                  <Text style={[s.bubbleText, { color: isUser ? '#fff' : C.textSecondary }]}>
                    {line.replace(/^[•\-] /, '').replace(/\*\*/g, '')}
                  </Text>
                </View>
              );
            }
            if (isNum) {
              return (
                <View key={li} style={s.bulletRow}>
                  <Text style={[s.numLabel, { color: isUser ? 'rgba(255,255,255,0.8)' : C.info }]}>{line.match(/^\d+/)?.[0]}.</Text>
                  <Text style={[s.bubbleText, { color: isUser ? '#fff' : C.textSecondary }]}>
                    {line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
                  </Text>
                </View>
              );
            }
            return (
              <Text key={li} style={[s.bubbleText, { color: isUser ? '#fff' : C.textSecondary }]}>
                {line.replace(/\*\*/g, '')}
              </Text>
            );
          })}
        </View>
        {isUser && (
          <View style={[s.userAvatar, { backgroundColor: C.primary }]}>
            <Text style={[s.userAvatarTxt, { color: C.textPrimary }]}>{player?.name?.[0] ?? 'P'}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[s.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: C.border }]}>
          <View style={[s.aiAvatarLg, { backgroundColor: C.info + '18', borderColor: C.info + '33' }]}>
            <MaterialIcons name="auto-awesome" size={20} color={C.info} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.title, { color: C.textPrimary }]}>AI Cricket Coach</Text>
            <View style={s.onlineRow}>
              <View style={[s.onlineDot, { backgroundColor: C.success }]} />
              <Text style={[s.onlineTxt, { color: C.success }]}>Online · Powered by Gemini</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.clearBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
            onPress={clearChat}
          >
            <MaterialIcons name="refresh" size={16} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Quick Analysis Shortcuts */}
        <View style={[s.shortcutBar, { borderBottomColor: C.border }]}>
          {ANALYSIS_SHORTCUTS.map(s2 => (
            <TouchableOpacity
              key={s2.type}
              style={[shortcut.btn, { backgroundColor: C.bgCard, borderColor: C.border },
                analysisLoading === s2.type && { borderColor: C.info, backgroundColor: C.info + '0E' }]}
              onPress={() => runQuickAnalysis(s2.type, s2.label)}
              disabled={!!analysisLoading || sending}
            >
              {analysisLoading === s2.type ? (
                <ActivityIndicator size="small" color={C.info} />
              ) : (
                <MaterialIcons name={s2.icon as any} size={13} color={C.info} />
              )}
              <Text style={[shortcut.txt, { color: C.textSecondary }]}>{s2.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderMessage}
          contentContainerStyle={s.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            sending ? (
              <View style={s.typingRow}>
                <View style={[s.aiAvatar, { backgroundColor: C.info + '1A', borderColor: C.info + '33' }]}>
                  <MaterialIcons name="auto-awesome" size={14} color={C.info} />
                </View>
                <View style={[s.typingBubble, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                  <ActivityIndicator size="small" color={C.info} />
                  <Text style={[s.typingTxt, { color: C.textMuted }]}>AI is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <View style={[s.quickSection, { borderTopColor: C.border }]}>
            <Text style={[s.quickLabel, { color: C.textMuted }]}>Quick starts</Text>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={q => q.label}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[qp.chip, { backgroundColor: C.bgCard, borderColor: C.border }]}
                  onPress={() => sendMessage(item.msg)}
                >
                  <Text style={[qp.txt, { color: C.textSecondary }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input */}
        <View style={[s.inputRow, { backgroundColor: C.bgCard, borderTopColor: C.border, paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={[s.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your AI cricket coach..."
            placeholderTextColor={C.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: input.trim() ? C.info : C.bgSurface }]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            <MaterialIcons name="send" size={18} color={input.trim() ? '#fff' : C.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const qp = StyleSheet.create({
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  txt: { fontSize: Typography.xs, fontWeight: Typography.medium },
});

const shortcut = StyleSheet.create({
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  txt: { fontSize: 10, fontWeight: Typography.medium },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  aiAvatarLg: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.base, fontWeight: Typography.bold },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineTxt: { fontSize: Typography.xs },
  clearBtn: { width: 36, height: 36, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shortcutBar: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  messageList: { padding: Spacing.base, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: Spacing.sm },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarTxt: { fontSize: 11, fontWeight: Typography.bold },
  bubble: { maxWidth: '78%', borderRadius: Radius.lg, padding: Spacing.md },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: Typography.xs, lineHeight: 18 },
  bubbleBold: { fontSize: Typography.xs, fontWeight: Typography.bold, marginBottom: 2 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 2 },
  bulletDot: { width: 4, height: 4, borderRadius: 2, marginTop: 6, flexShrink: 0 },
  numLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, marginRight: 2, minWidth: 14 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: Spacing.sm },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: Radius.lg, borderBottomLeftRadius: 4, padding: Spacing.md, borderWidth: 1 },
  typingTxt: { fontSize: Typography.xs },
  quickSection: { borderTopWidth: 1, paddingTop: Spacing.sm, paddingBottom: 4 },
  quickLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing.base, marginBottom: Spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1, borderRadius: Radius.xl, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingTop: 10, paddingBottom: 10,
    fontSize: Typography.sm, maxHeight: 100,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
