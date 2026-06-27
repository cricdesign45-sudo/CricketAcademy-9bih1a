import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayers } from '@/hooks/usePlayers';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { Feedback } from '@/types';

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { feedback, replyToFeedback, players } = usePlayers();
  const { showAlert } = useAlert();
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleReply = (feedbackId: string) => {
    const reply = replyText[feedbackId];
    if (!reply?.trim()) { showAlert('Empty Reply', 'Please write a reply'); return; }
    replyToFeedback(feedbackId, reply);
    setReplyText(p => ({ ...p, [feedbackId]: '' }));
    showAlert('Reply Sent!', 'Your reply has been sent to the player');
  };

  const renderStars = (rating: number) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  const renderItem = ({ item }: { item: Feedback }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpandedId(expandedId === item.id ? null : item.id)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.playerAvatar}>
            <Text style={styles.playerAvatarText}>{item.playerName[0]}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.playerName}>{item.playerName}</Text>
            <Text style={styles.stars}>{renderStars(item.rating)}</Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'replied' ? styles.repliedBadge : styles.pendingBadge]}>
            <Text style={styles.statusText}>{item.status === 'replied' ? '✓ Replied' : '⏳ Pending'}</Text>
          </View>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{new Date(item.submittedAt).toLocaleDateString('en-IN')}</Text>
      </TouchableOpacity>

      {item.adminReply && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Admin Reply:</Text>
          <Text style={styles.replyText}>{item.adminReply}</Text>
        </View>
      )}

      {user?.role === 'admin' && !item.adminReply && expandedId === item.id && (
        <View style={styles.replyForm}>
          <TextInput
            style={styles.replyInput}
            value={replyText[item.id] || ''}
            onChangeText={t => setReplyText(p => ({ ...p, [item.id]: t }))}
            placeholder="Write your reply..."
            placeholderTextColor={Colors.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.replyBtn} onPress={() => handleReply(item.id)}>
            <Text style={styles.replyBtnText}>Send Reply</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.summary}>{feedback.filter(f => f.status === 'pending').length} pending · {feedback.filter(f => f.status === 'replied').length} replied</Text>
      </View>
      <FlatList
        data={feedback}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No feedback yet</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summary: { fontSize: Typography.sm, color: Colors.textSecondary },
  list: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base, paddingBottom: 20 },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.base, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  playerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  playerAvatarText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  cardInfo: { flex: 1 },
  playerName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  stars: { fontSize: Typography.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  repliedBadge: { backgroundColor: Colors.success + '22' },
  pendingBadge: { backgroundColor: Colors.warning + '22' },
  statusText: { fontSize: 10, fontWeight: Typography.bold, color: Colors.textPrimary },
  message: { fontSize: Typography.sm, color: Colors.textPrimary, lineHeight: 20, marginBottom: 4 },
  date: { fontSize: Typography.xs, color: Colors.textMuted },
  replyBox: { marginTop: Spacing.sm, backgroundColor: Colors.bgSurface, borderRadius: Radius.md, padding: Spacing.sm, borderLeftWidth: 2, borderLeftColor: Colors.success },
  replyLabel: { fontSize: Typography.xs, color: Colors.success, fontWeight: Typography.semibold, marginBottom: 2 },
  replyText: { fontSize: Typography.sm, color: Colors.textSecondary },
  replyForm: { marginTop: Spacing.sm },
  replyInput: { backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, color: Colors.textPrimary, fontSize: Typography.sm, height: 80, textAlignVertical: 'top', marginBottom: Spacing.sm },
  replyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center' },
  replyBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: Typography.base, color: Colors.textSecondary },
});
