import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types';

const TYPE_ICONS: Record<string, any> = { training: 'fitness-center', match: 'sports-cricket', points: 'star', announcement: 'campaign', general: 'notifications' };
const TYPE_COLORS: Record<string, string> = { training: Colors.success, match: Colors.info, points: Colors.gold, announcement: Colors.chart4, general: Colors.textSecondary };

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { notifications, sendNotification, markNotificationRead } = usePlayers();
  const { showAlert } = useAlert();
  const { hasPermission, sendInstantNotification } = useNotifications();
  const [tab, setTab] = useState<'list' | 'send'>('list');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<Notification['type']>('announcement');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) { showAlert('Missing Fields', 'Title and message are required'); return; }
    sendNotification(title, message, type);
    // Fire real device push notification
    sendInstantNotification(title, message, { type }, type === 'training' ? 'training' : 'announcement');
    showAlert('Sent!', 'Notification sent to all players', [{ text: 'OK', onPress: () => { setTitle(''); setMessage(''); setTab('list'); } }]);
  };

  const sortedNotifs = [...notifications].sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {user?.role === 'admin' && (
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'list' && styles.tabActive]} onPress={() => setTab('list')}>
            <Text style={[styles.tabText, tab === 'list' && styles.tabTextActive]}>All Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'send' && styles.tabActive]} onPress={() => setTab('send')}>
            <Text style={[styles.tabText, tab === 'send' && styles.tabTextActive]}>Send New</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'list' ? (
        <FlatList
          data={sortedNotifs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No notifications yet</Text></View>}
          renderItem={({ item }) => {
            const color = TYPE_COLORS[item.type] || Colors.textSecondary;
            return (
              <TouchableOpacity style={[styles.notifCard, !item.isRead && styles.unreadCard]} onPress={() => markNotificationRead(item.id)} activeOpacity={0.7}>
                <View style={[styles.notifIcon, { backgroundColor: color + '22' }]}>
                  <MaterialIcons name={TYPE_ICONS[item.type] || 'notifications'} size={18} color={color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !item.isRead && { color: Colors.textPrimary, fontWeight: Typography.bold }]}>{item.title}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMsg}>{item.message}</Text>
                  <Text style={styles.notifTime}>{new Date(item.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <View style={styles.sendForm}>
          <Text style={styles.fieldLabel}>Notification Type</Text>
          <View style={styles.typeRow}>
            {(['announcement', 'training', 'match', 'general'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.typeChip, type === t && styles.typeChipActive]} onPress={() => setType(t)}>
                <MaterialIcons name={TYPE_ICONS[t]} size={14} color={type === t ? Colors.textPrimary : Colors.textSecondary} />
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Notification title" placeholderTextColor={Colors.textMuted} />
          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={message} onChangeText={setMessage} placeholder="Write your message here..." placeholderTextColor={Colors.textMuted} multiline />
          <View style={styles.pushBadge}>
            <MaterialIcons
              name={hasPermission ? 'notifications-active' : 'notifications-off'}
              size={14}
              color={hasPermission ? Colors.success : Colors.textMuted}
            />
            <Text style={[styles.pushBadgeText, { color: hasPermission ? Colors.success : Colors.textMuted }]}>
              {hasPermission ? 'Push notification will fire on device' : 'Enable notifications in Settings for push delivery'}
            </Text>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <MaterialIcons name="send" size={18} color={Colors.textInverse} />
            <Text style={styles.sendBtnText}>Send to All Players</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  tabs: { flexDirection: 'row', gap: 3, marginHorizontal: Spacing.base, marginTop: Spacing.sm, marginBottom: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  tabTextActive: { color: Colors.textPrimary, fontWeight: Typography.bold },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 20, paddingTop: Spacing.sm },
  notifCard: { flexDirection: 'row', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: Colors.gold },
  notifIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold },
  notifMsg: { fontSize: Typography.sm, color: Colors.textPrimary, marginBottom: 4, lineHeight: 20 },
  notifTime: { fontSize: Typography.xs, color: Colors.textMuted },
  empty: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: Typography.base, color: Colors.textSecondary },
  sendForm: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm },
  fieldLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.base, fontWeight: Typography.medium },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryLight },
  typeText: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  typeTextActive: { color: Colors.textPrimary, fontWeight: Typography.semibold },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, color: Colors.textPrimary, fontSize: Typography.base },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, marginTop: Spacing.xl },
  sendBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  pushBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bgCard, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.sm },
  pushBadgeText: { fontSize: Typography.xs, flex: 1 },
});
