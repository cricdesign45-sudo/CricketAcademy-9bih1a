import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { ATTENDANCE_CHART_DATA, PERFORMANCE_CHART_DATA, POINTS_CHART_DATA } from '@/constants/mockData';

function AnimatedCounter({ target, color, style }: { target: number; color: string; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    Animated.timing(anim, { toValue: target, duration: 900, useNativeDriver: false }).start();
    const id = anim.addListener(({ value }) => {
      setDisplay(target >= 1000 ? (value / 1000).toFixed(1) + 'K' : Math.round(value).toString());
    });
    return () => anim.removeListener(id);
  }, [target]);
  return <Text style={style}>{display}</Text>;
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { players, notifications, fees, attendance } = usePlayers();
  const { Colors: C } = useTheme();
  const [activeChart, setActiveChart] = useState<'attendance' | 'performance' | 'points'>('attendance');

  const activePlayers = players.filter(p => p.isActive).length;
  const avgAttendance = players.length > 0
    ? Math.round(players.reduce((s, p) => s + p.attendancePercentage, 0) / players.length) : 0;
  const top5 = [...players].sort((a, b) => b.points - a.points).slice(0, 5);
  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue').length;
  const overdueFees = fees.filter(f => f.status === 'overdue').length;
  const collectedFees = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.paidAmount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'present').length;

  const chartData = activeChart === 'attendance' ? ATTENDANCE_CHART_DATA
    : activeChart === 'performance' ? PERFORMANCE_CHART_DATA : POINTS_CHART_DATA;
  const chartMax = activeChart === 'attendance' ? 100 : activeChart === 'performance' ? 1000 : 10000;
  const getVal = (item: any) => activeChart === 'attendance' ? item.percentage : activeChart === 'performance' ? item.runs : item.points;
  const chartColor = activeChart === 'attendance' ? C.success : activeChart === 'performance' ? C.info : C.gold;
  const fmtVal = (val: number) => activeChart === 'attendance' ? `${val}%` : val >= 1000 ? `${(val / 1000).toFixed(1)}K` : `${val}`;

  const handleNav = useCallback((route: any) => router.push(route), [router]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
        <View style={[styles.academyMark, { backgroundColor: C.primary }]}>
          <Text style={styles.academyEmoji}>🏏</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: C.textMuted }]}>{greeting}</Text>
          <Text style={[styles.adminName, { color: C.textPrimary }]}>{user?.name ?? 'Admin'}</Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.bgDark, borderColor: C.border, borderWidth: 1 }]} onPress={() => handleNav('/notifications')}>
            <MaterialIcons name="notifications-none" size={19} color={C.textSecondary} />
            {unreadNotifs > 0 && (
              <View style={[styles.badge, { backgroundColor: C.error }]}>
                <Text style={styles.badgeText}>{unreadNotifs}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.bgDark, borderColor: C.border, borderWidth: 1 }]} onPress={logout}>
            <MaterialIcons name="logout" size={17} color={C.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Live strip */}
        {presentToday > 0 && (
          <View style={[styles.liveStrip, { backgroundColor: C.success + '0E', borderColor: C.success + '33' }]}>
            <View style={[styles.liveDot, { backgroundColor: C.success }]} />
            <Text style={[styles.liveText, { color: C.success }]}>
              {presentToday} present today · {activePlayers} active players
            </Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'people', label: 'Players', value: players.length, sub: `${activePlayers} active`, color: C.info, route: '/(admin)/players' },
            { icon: 'event-available', label: 'Attendance', value: avgAttendance, sub: 'avg %', color: C.success, route: '/(admin)/attendance' },
            { icon: 'payments', label: 'Collected', value: collectedFees, sub: `${overdueFees} overdue`, color: C.gold, route: '/(admin)/fees' },
            { icon: 'emoji-events', label: 'Leaderboard', value: players.length, sub: 'ranked', color: C.primary, route: '/(admin)/leaderboard' as any },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.statCard, { backgroundColor: C.bgCard, borderColor: C.border }]}
              onPress={() => router.push(s.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.statIcon, { backgroundColor: s.color + '12' }]}>
                <MaterialIcons name={s.icon as any} size={17} color={s.color} />
              </View>
              <AnimatedCounter target={s.value} color={C.textPrimary} style={[styles.statValue, { color: C.textPrimary }]} />
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>{s.label}</Text>
              <Text style={[styles.statSub, { color: C.textMuted }]}>{s.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overdue alert */}
        {overdueFees > 0 && (
          <TouchableOpacity
            style={[styles.alertRow, { backgroundColor: C.bgCard, borderColor: C.error + '30', borderLeftColor: C.error }]}
            onPress={() => router.push('/(admin)/fees')}
          >
            <MaterialIcons name="warning-amber" size={16} color={C.error} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: C.textPrimary }]}>{overdueFees} overdue payment{overdueFees > 1 ? 's' : ''}</Text>
              <Text style={[styles.alertSub, { color: C.textSecondary }]}>{pendingFees} total pending · Tap to manage</Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={C.textMuted} />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'person-add', label: 'Add Player', color: C.info, route: '/add-player' },
              { icon: 'star', label: 'Award Points', color: C.gold, route: '/add-points' },
              { icon: 'event-available', label: 'Attendance', color: C.success, route: '/(admin)/attendance' },
              { icon: 'payments', label: 'Fees', color: C.warning, route: '/(admin)/fees' },
              { icon: 'campaign', label: 'Announce', color: C.chart4, route: '/notifications' },
              { icon: 'emoji-events', label: 'Rankings', color: C.gold, route: '/(admin)/leaderboard' },
              { icon: 'auto-awesome', label: 'AI Tools', color: C.info, route: '/(admin)/ai' },
              { icon: 'settings', label: 'Settings', color: C.textSecondary, route: '/(admin)/settings' },
            ].map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.qaBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.75}
              >
                <View style={[styles.qaIcon, { backgroundColor: a.color + '12' }]}>
                  <MaterialIcons name={a.icon as any} size={20} color={a.color} />
                </View>
                <Text style={[styles.qaLabel, { color: C.textSecondary }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analytics Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Academy Analytics</Text>
          <View style={[styles.chartCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <View style={[styles.chartTabBar, { borderBottomColor: C.border }]}>
              {([
                { key: 'attendance', label: 'Attendance' },
                { key: 'performance', label: 'Performance' },
                { key: 'points', label: 'Points' },
              ] as const).map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.chartTab, activeChart === tab.key && { borderBottomColor: C.primary, borderBottomWidth: 2 }]}
                  onPress={() => setActiveChart(tab.key)}
                >
                  <Text style={[styles.chartTabText, { color: activeChart === tab.key ? C.primary : C.textMuted },
                    activeChart === tab.key && { fontWeight: Typography.semibold }]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.barChart}>
              {chartData.map((item: any, i: number) => {
                const val = getVal(item);
                const barH = Math.max(4, (val / chartMax) * 90);
                const isLast = i === chartData.length - 1;
                return (
                  <View key={i} style={styles.barItem}>
                    <Text style={[styles.barVal, { color: isLast ? chartColor : C.textMuted }]}>{fmtVal(val)}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { height: barH, backgroundColor: isLast ? chartColor : chartColor + '30' }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: isLast ? C.textSecondary : C.textMuted }]}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Top Players */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Top Players</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/leaderboard')} style={styles.seeAll}>
              <Text style={[styles.seeAllText, { color: C.primary }]}>See all</Text>
              <MaterialIcons name="arrow-forward" size={12} color={C.primary} />
            </TouchableOpacity>
          </View>
          {top5.map((player, idx) => (
            <TouchableOpacity
              key={player.id}
              style={[styles.leaderRow, { backgroundColor: C.bgCard, borderColor: C.border }]}
              onPress={() => router.push({ pathname: '/player-detail', params: { id: player.id } })}
              activeOpacity={0.75}
            >
              <Text style={[styles.leaderRank, { color: idx === 0 ? C.gold : C.textMuted }]}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
              </Text>
              <View style={[styles.leaderAvatar, { backgroundColor: C.primary }]}>
                <Text style={styles.leaderAvatarText}>{player.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.leaderName, { color: C.textPrimary }]}>{player.name}</Text>
                <Text style={[styles.leaderRole, { color: C.textMuted }]}>{player.playingRole} · {player.ageGroup}</Text>
              </View>
              <View style={styles.leaderRight}>
                <Text style={[styles.leaderPts, { color: idx === 0 ? C.gold : C.textSecondary }]}>{player.points.toLocaleString()}</Text>
                <Text style={[styles.leaderPtsLabel, { color: C.textMuted }]}>pts</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Academy Features</Text>
          <View style={styles.featGrid}>
            {[
              { emoji: '🏛️', label: 'Hall of Fame', route: '/hall-of-fame' },
              { emoji: '🎓', label: 'Certificates', route: '/certificate' },
              { emoji: '🃏', label: 'Player ID', route: '/player-id-card' },
              { emoji: '💬', label: 'Feedback', route: '/feedback' },
            ].map((f, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.featBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
                onPress={() => router.push(f.route as any)}
              >
                <Text style={styles.featEmoji}>{f.emoji}</Text>
                <Text style={[styles.featLabel, { color: C.textSecondary }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  academyMark: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  academyEmoji: { fontSize: 20 },
  greeting: { fontSize: Typography.xs },
  adminName: { fontSize: Typography.base, fontWeight: Typography.bold },
  headerBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 8, color: '#fff', fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  liveStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderRadius: Radius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 9, marginBottom: Spacing.base,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  statCard: {
    width: '48%', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  statLabel: { fontSize: Typography.xs, marginTop: 2 },
  statSub: { fontSize: 10, marginTop: 1 },
  alertRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1,
    borderLeftWidth: 3, marginBottom: Spacing.xl,
  },
  alertTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  alertSub: { fontSize: Typography.xs, marginTop: 1 },
  section: { marginBottom: Spacing.xl },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, marginBottom: Spacing.md },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: Spacing.md },
  seeAllText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  qaBtn: {
    width: '22%', alignItems: 'center', gap: 6,
    borderRadius: Radius.lg, borderWidth: 1, paddingVertical: Spacing.md,
  },
  qaIcon: { width: 46, height: 46, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 10, fontWeight: Typography.semibold, textAlign: 'center' },
  chartCard: {
    borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden',
  },
  chartTabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: Spacing.base },
  chartTab: {
    flex: 1, paddingVertical: Spacing.sm, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  chartTabText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, padding: Spacing.base, paddingTop: Spacing.sm },
  barItem: { flex: 1, alignItems: 'center', gap: 4 },
  barVal: { fontSize: 9 },
  barTrack: { height: 90, justifyContent: 'flex-end', width: '65%' },
  bar: { borderRadius: 3, width: '100%' },
  barLabel: { fontSize: Typography.xs },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1,
  },
  leaderRank: { fontSize: Typography.base, fontWeight: Typography.bold, minWidth: 28, textAlign: 'center' },
  leaderAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  leaderAvatarText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#fff' },
  leaderName: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  leaderRole: { fontSize: Typography.xs, marginTop: 1 },
  leaderRight: { alignItems: 'flex-end' },
  leaderPts: { fontSize: Typography.sm, fontWeight: Typography.bold },
  leaderPtsLabel: { fontSize: 9, marginTop: 1 },
  featGrid: { flexDirection: 'row', gap: Spacing.sm },
  featBtn: { flex: 1, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, alignItems: 'center', gap: 6 },
  featEmoji: { fontSize: 26 },
  featLabel: { fontSize: Typography.xs, fontWeight: Typography.medium, textAlign: 'center' },
});
