import React, { useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { MOCK_ACHIEVEMENTS } from '@/constants/mockData';

const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];

export default function PlayerDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { players, pointsHistory, notifications, attendance } = usePlayers();
  const { Colors: C } = useTheme();

  const currentPlayer = players.find(p => p.id === user?.playerId) || players[0];
  const myPoints = pointsHistory.filter(pt => pt.playerId === currentPlayer?.id);
  const myNotifs = notifications.filter(n => !n.isRead);
  const myAchievements = MOCK_ACHIEVEMENTS.filter(a => currentPlayer?.badges.includes(a.id));

  if (!currentPlayer) return null;

  const LEVEL_COLORS = ['', C.level1, C.level2, C.level3, C.level4, C.level5];
  const levelColor = LEVEL_COLORS[currentPlayer.level];
  const xpPct = Math.min(100, (currentPlayer.xp / currentPlayer.nextLevelXp) * 100);

  const handleNav = useCallback((route: any) => router.push(route), [router]);

  const CATEGORY_ICON: Record<string, any> = {
    attendance: 'event-available',
    performance: 'sports-cricket',
    discipline: 'military-tech',
    bonus: 'card-giftcard',
    penalty: 'remove-circle',
  };

  const attColor = currentPlayer.attendancePercentage >= 85 ? C.success : currentPlayer.attendancePercentage >= 70 ? C.warning : C.error;

  return (
    <View style={[{ flex: 1, backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl }}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <View>
            <Text style={[styles.greeting, { color: C.textMuted }]}>Welcome back</Text>
            <Text style={[styles.playerName, { color: C.textPrimary }]}>{currentPlayer.name}</Text>
          </View>
          <View style={styles.headerRight}>
            {myNotifs.length > 0 && (
              <TouchableOpacity style={[styles.notifChip, { backgroundColor: C.bgSurface, borderColor: C.border }]} onPress={() => handleNav('/notifications')}>
                <MaterialIcons name="notifications" size={15} color={C.primary} />
                <Text style={[styles.notifCount, { color: C.primary }]}>{myNotifs.length}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: C.bgSurface }]} onPress={logout}>
              <MaterialIcons name="logout" size={16} color={C.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Player Card */}
        <View style={[styles.playerCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={[styles.cardAccent, { backgroundColor: levelColor }]} />
          <View style={styles.cardBody}>
            <View style={[styles.avatarWrap, { borderColor: levelColor + '40' }]}>
              <View style={[styles.avatar, { backgroundColor: levelColor + '18' }]}>
                <Text style={[styles.avatarText, { color: levelColor }]}>{currentPlayer.name[0]}</Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <View style={[styles.levelPill, { backgroundColor: levelColor + '12', borderColor: levelColor + '30' }]}>
                <Text style={[styles.levelPillText, { color: levelColor }]}>
                  L{currentPlayer.level} · {LEVEL_NAMES[currentPlayer.level]}
                </Text>
              </View>
              <View style={styles.rankRow}>
                <Text style={[styles.rankNum, { color: C.textPrimary }]}>#{currentPlayer.rank}</Text>
                <Text style={[styles.rankLabel, { color: C.textMuted }]}> Academy Rank</Text>
              </View>
              <Text style={[styles.roleText, { color: C.textSecondary }]}>{currentPlayer.playingRole} · Batch {currentPlayer.batch}</Text>
            </View>
            <View style={styles.ptsBox}>
              <Text style={[styles.ptsVal, { color: C.textPrimary }]}>{currentPlayer.points.toLocaleString()}</Text>
              <Text style={[styles.ptsLabel, { color: C.textMuted }]}>points</Text>
            </View>
          </View>
          {/* XP Bar */}
          <View style={styles.xpArea}>
            <View style={styles.xpTopRow}>
              <Text style={[styles.xpLabel, { color: C.textMuted }]}>XP Progress</Text>
              <Text style={[styles.xpLabel, { color: C.textMuted }]}>{currentPlayer.xp.toLocaleString()} / {currentPlayer.nextLevelXp.toLocaleString()}</Text>
            </View>
            <View style={[styles.xpTrack, { backgroundColor: C.bgSurface }]}>
              <View style={[styles.xpFill, { width: `${xpPct}%` as any, backgroundColor: levelColor }]} />
            </View>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Attendance', value: `${currentPlayer.attendancePercentage}%`, icon: 'event-available', color: attColor },
            { label: 'Matches', value: currentPlayer.batting.matches.toString(), icon: 'sports-cricket', color: C.info },
            { label: 'Runs', value: currentPlayer.batting.runs.toString(), icon: 'trending-up', color: C.gold },
            { label: 'Wickets', value: currentPlayer.bowling.wickets.toString(), icon: 'adjust', color: C.chart4 },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: C.bgCard, borderColor: C.border, borderTopColor: stat.color }]}>
              <MaterialIcons name={stat.icon as any} size={13} color={stat.color} />
              <Text style={[styles.statVal, { color: C.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: C.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Notifications */}
        {myNotifs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Notifications</Text>
              <View style={[styles.badge, { backgroundColor: C.error + '12', borderColor: C.error + '25' }]}>
                <Text style={[styles.badgeText, { color: C.error }]}>{myNotifs.length} new</Text>
              </View>
            </View>
            {myNotifs.slice(0, 2).map(n => {
              const iconColor = n.type === 'match' ? C.info : n.type === 'training' ? C.success : C.gold;
              const iconName = n.type === 'match' ? 'sports-cricket' : n.type === 'training' ? 'fitness-center' : 'campaign';
              return (
                <View key={n.id} style={[styles.notifCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                  <View style={[styles.notifIcon, { backgroundColor: iconColor + '12' }]}>
                    <MaterialIcons name={iconName as any} size={14} color={iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitle, { color: C.textPrimary }]}>{n.title}</Text>
                    <Text style={[styles.notifMsg, { color: C.textSecondary }]} numberOfLines={1}>{n.message}</Text>
                  </View>
                  <View style={[styles.unreadDot, { backgroundColor: C.primary }]} />
                </View>
              );
            })}
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Achievements</Text>
            <Text style={[styles.sectionMeta, { color: C.textMuted }]}>{myAchievements.length}/{MOCK_ACHIEVEMENTS.length}</Text>
          </View>
          {myAchievements.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: C.bgCard, borderColor: C.border }]}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>Complete challenges to earn achievements</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
              {myAchievements.map(ach => (
                <View key={ach.id} style={[styles.achCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                  <Text style={styles.achIcon}>{ach.icon}</Text>
                  <Text style={[styles.achName, { color: C.textSecondary }]}>{ach.name}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Recent Activity</Text>
          {myPoints.slice(-5).reverse().map(pt => (
            <View key={pt.id} style={[styles.ptRow, { backgroundColor: C.bgCard, borderColor: C.border }]}>
              <View style={[styles.ptIcon, { backgroundColor: pt.points > 0 ? C.success + '12' : C.error + '12' }]}>
                <MaterialIcons
                  name={CATEGORY_ICON[pt.category] || 'star'}
                  size={13}
                  color={pt.points > 0 ? C.success : C.error}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ptReason, { color: C.textPrimary }]}>{pt.reason}</Text>
                <Text style={[styles.ptDate, { color: C.textMuted }]}>{pt.date}</Text>
              </View>
              <Text style={[styles.ptAmount, { color: pt.points > 0 ? C.success : C.error }]}>
                {pt.points > 0 ? '+' : ''}{pt.points}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.md, borderBottomWidth: 1, marginBottom: Spacing.base,
  },
  greeting: { fontSize: Typography.xs, marginBottom: 2 },
  playerName: { fontSize: Typography.lg, fontWeight: Typography.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
  },
  notifCount: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  logoutBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  playerCard: {
    borderRadius: Radius.xl, borderWidth: 1, marginBottom: Spacing.base,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardAccent: { height: 3 },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  avatarWrap: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  cardMeta: { flex: 1 },
  levelPill: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: Radius.full, borderWidth: 1, marginBottom: 5,
  },
  levelPillText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  rankRow: { flexDirection: 'row', alignItems: 'baseline' },
  rankNum: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  rankLabel: { fontSize: Typography.xs },
  roleText: { fontSize: Typography.xs, marginTop: 2 },
  ptsBox: { alignItems: 'flex-end' },
  ptsVal: { fontSize: Typography.lg, fontWeight: Typography.extrabold },
  ptsLabel: { fontSize: Typography.xs, marginTop: 1 },
  xpArea: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  xpTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  xpLabel: { fontSize: Typography.xs },
  xpTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 3 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: {
    flex: 1, borderRadius: Radius.lg, padding: Spacing.sm,
    borderWidth: 1, borderTopWidth: 2.5, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statVal: { fontSize: Typography.md, fontWeight: Typography.extrabold },
  statLabel: { fontSize: 10, textAlign: 'center' },

  section: { marginBottom: Spacing.xl },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold },
  sectionMeta: { fontSize: Typography.xs },
  badge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1,
  },
  badgeText: { fontSize: Typography.xs, fontWeight: Typography.semibold },

  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1,
  },
  notifIcon: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  notifTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, marginBottom: 1 },
  notifMsg: { fontSize: Typography.xs },
  unreadDot: { width: 6, height: 6, borderRadius: 3 },

  emptyBox: {
    borderRadius: Radius.lg, padding: Spacing.xl,
    alignItems: 'center', gap: Spacing.sm, borderWidth: 1,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: { fontSize: Typography.sm, textAlign: 'center' },

  achCard: {
    borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, gap: 5, minWidth: 80,
  },
  achIcon: { fontSize: 24 },
  achName: { fontSize: 10, fontWeight: Typography.medium, textAlign: 'center' },

  ptRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1,
  },
  ptIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ptReason: { fontSize: Typography.sm, fontWeight: Typography.medium },
  ptDate: { fontSize: Typography.xs, marginTop: 1 },
  ptAmount: { fontSize: Typography.sm, fontWeight: Typography.bold },
});
