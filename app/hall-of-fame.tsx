import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { MOCK_ACHIEVEMENTS } from '@/constants/mockData';

const HALL_CATEGORIES = [
  { key: 'allTime', label: 'All-Time Best', icon: 'emoji-events', color: '#FFD700' },
  { key: 'batting', label: 'Best Batsman', icon: 'sports-cricket', color: '#58A6FF' },
  { key: 'bowling', label: 'Best Bowler', icon: 'air', color: '#3FB950' },
  { key: 'attendance', label: 'Most Dedicated', icon: 'event-available', color: '#FF7B00' },
  { key: 'mostImproved', label: 'Most Improved', icon: 'trending-up', color: '#DA3633' },
  { key: 'allRounder', label: 'Best All-Rounder', icon: 'military-tech', color: '#9E6FFF' },
] as const;

type HallCategory = (typeof HALL_CATEGORIES)[number]['key'];

const MILESTONES = [
  { icon: '🏆', label: '500 Points Club', color: '#FFD700' },
  { icon: '⭐', label: '90%+ Attendance', color: '#3FB950' },
  { icon: '🎯', label: '100 Runs Scored', color: '#58A6FF' },
  { icon: '🎳', label: '10+ Wickets', color: '#FF7B00' },
  { icon: '💪', label: 'Fitness Score 80+', color: '#DA3633' },
  { icon: '🏅', label: 'Level 4+ Achiever', color: '#9E6FFF' },
];

const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];
const LEVEL_COLORS = ['', '#8B949E', '#58A6FF', '#3FB950', '#FFD700', '#FF7B00'];

export default function HallOfFameScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players } = usePlayers();
  const { Colors } = useTheme();
  const C = Colors;
  const [activeTab, setActiveTab] = useState<HallCategory>('allTime');

  const honorees = useMemo(() => {
    switch (activeTab) {
      case 'allTime':
        return [...players].sort((a, b) => b.points - a.points).slice(0, 5);
      case 'batting':
        return [...players].sort((a, b) => b.batting.runs - a.batting.runs).slice(0, 5);
      case 'bowling':
        return [...players].sort((a, b) => b.bowling.wickets - a.bowling.wickets).slice(0, 5);
      case 'attendance':
        return [...players].sort((a, b) => b.attendancePercentage - a.attendancePercentage).slice(0, 5);
      case 'mostImproved':
        return [...players].sort((a, b) => (b.previousRank - b.rank) - (a.previousRank - a.rank)).slice(0, 5);
      case 'allRounder':
        return [...players].sort((a, b) => {
          const scoreA = a.batting.runs + a.bowling.wickets * 20 + a.fielding.fieldingPoints;
          const scoreB = b.batting.runs + b.bowling.wickets * 20 + b.fielding.fieldingPoints;
          return scoreB - scoreA;
        }).slice(0, 5);
      default:
        return [...players].sort((a, b) => b.points - a.points).slice(0, 5);
    }
  }, [players, activeTab]);

  const topPlayer = honorees[0];
  const catConfig = HALL_CATEGORIES.find(c => c.key === activeTab)!;

  const milestoneHolders = useMemo(() => {
    return [
      players.filter(p => p.points >= 500),
      players.filter(p => p.attendancePercentage >= 90),
      players.filter(p => p.batting.runs >= 100),
      players.filter(p => p.bowling.wickets >= 10),
      players.filter(p => p.fitness.fitnessScore >= 80),
      players.filter(p => p.level >= 4),
    ];
  }, [players]);

  const legendPlayers = players.filter(p => p.level === 5);
  const totalAchievements = players.reduce((s, p) => s + p.badges.length, 0);

  return (
    <View style={[styles.container, { backgroundColor: C.bgDark }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>🏛️ Hall of Fame</Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>Cricket Academy Legends</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>

        {/* Stats Banner */}
        <View style={[styles.statsBanner, { backgroundColor: C.bgCard, borderBottomColor: C.border }]}>
          {[
            { label: 'Total Players', value: players.length, icon: 'people', color: C.info },
            { label: 'Legends (Lv5)', value: legendPlayers.length, icon: 'auto-awesome', color: '#FF7B00' },
            { label: 'Achievements', value: totalAchievements, icon: 'workspace-premium', color: C.gold },
            { label: 'Categories', value: HALL_CATEGORIES.length, icon: 'category', color: C.success },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <MaterialIcons name={s.icon as any} size={16} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLbl, { color: C.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {HALL_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catTab,
                { backgroundColor: C.bgCard, borderColor: C.border },
                activeTab === cat.key && { backgroundColor: cat.color + '18', borderColor: cat.color },
              ]}
              onPress={() => setActiveTab(cat.key)}
            >
              <MaterialIcons name={cat.icon as any} size={14} color={activeTab === cat.key ? cat.color : C.textMuted} />
              <Text style={[
                styles.catTabText,
                { color: activeTab === cat.key ? cat.color : C.textSecondary },
                activeTab === cat.key && { fontWeight: Typography.bold },
              ]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Champion Podium */}
        {topPlayer && (
          <View style={styles.podiumSection}>
            {/* #1 Champion */}
            <View style={[styles.championCard, { backgroundColor: C.bgCard, borderColor: catConfig.color + '44' }]}>
              <View style={[styles.champAccent, { backgroundColor: catConfig.color }]} />
              <View style={styles.champCrown}>
                <Text style={styles.crownEmoji}>👑</Text>
              </View>
              <View style={[styles.champAvatarRing, { borderColor: catConfig.color }]}>
                <View style={[styles.champAvatar, { backgroundColor: catConfig.color + '22' }]}>
                  <Text style={[styles.champAvatarText, { color: C.textPrimary }]}>{topPlayer.name[0]}</Text>
                </View>
              </View>
              <Text style={[styles.champName, { color: C.textPrimary }]}>{topPlayer.name}</Text>
              <Text style={[styles.champRole, { color: C.textSecondary }]}>{topPlayer.playingRole}</Text>
              <View style={[styles.champLevelBadge, { backgroundColor: LEVEL_COLORS[topPlayer.level] + '18', borderColor: LEVEL_COLORS[topPlayer.level] + '44' }]}>
                <Text style={[styles.champLevelText, { color: LEVEL_COLORS[topPlayer.level] }]}>
                  {LEVEL_NAMES[topPlayer.level]} · Lv {topPlayer.level}
                </Text>
              </View>
              <View style={styles.champStats}>
                <View style={styles.champStatItem}>
                  <Text style={[styles.champStatVal, { color: catConfig.color }]}>{topPlayer.points.toLocaleString()}</Text>
                  <Text style={[styles.champStatLbl, { color: C.textSecondary }]}>Points</Text>
                </View>
                <View style={[styles.champStatDiv, { backgroundColor: C.border }]} />
                <View style={styles.champStatItem}>
                  <Text style={[styles.champStatVal, { color: C.textPrimary }]}>{topPlayer.batting.runs}</Text>
                  <Text style={[styles.champStatLbl, { color: C.textSecondary }]}>Runs</Text>
                </View>
                <View style={[styles.champStatDiv, { backgroundColor: C.border }]} />
                <View style={styles.champStatItem}>
                  <Text style={[styles.champStatVal, { color: C.textPrimary }]}>{topPlayer.attendancePercentage}%</Text>
                  <Text style={[styles.champStatLbl, { color: C.textSecondary }]}>Att.</Text>
                </View>
              </View>
              <View style={styles.champBadgesRow}>
                {MOCK_ACHIEVEMENTS.filter(a => topPlayer.badges.includes(a.id)).slice(0, 5).map(ach => (
                  <Text key={ach.id} style={styles.champBadgeEmoji}>{ach.icon}</Text>
                ))}
                {topPlayer.badges.length > 5 && (
                  <View style={[styles.badgeMore, { backgroundColor: C.bgSurface }]}>
                    <Text style={[styles.badgeMoreText, { color: C.textSecondary }]}>+{topPlayer.badges.length - 5}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Runner-up podium: #2 and #3 */}
            {honorees.length >= 2 && (
              <View style={styles.podiumRow}>
                {[honorees[1], honorees[2]].filter(Boolean).map((p, i) => (
                  <View key={p.id} style={[styles.podiumCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                    <Text style={styles.podiumMedal}>{i === 0 ? '🥈' : '🥉'}</Text>
                    <View style={[styles.podiumAvatar, { backgroundColor: catConfig.color + '18', borderColor: catConfig.color + '44' }]}>
                      <Text style={[styles.podiumAvatarText, { color: C.textPrimary }]}>{p.name[0]}</Text>
                    </View>
                    <Text style={[styles.podiumName, { color: C.textPrimary }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.podiumPts, { color: catConfig.color }]}>{p.points.toLocaleString()} pts</Text>
                    <Text style={[styles.podiumLevel, { color: LEVEL_COLORS[p.level] }]}>Lv {p.level}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Full Rankings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Full Rankings — {catConfig.label}</Text>
          {honorees.map((p, idx) => (
            <View key={p.id} style={[styles.rankRow, { backgroundColor: C.bgCard, borderColor: C.border }]}>
              <Text style={styles.rankMedal}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </Text>
              <View style={[styles.rankAvatar, { backgroundColor: LEVEL_COLORS[p.level] + '22', borderColor: LEVEL_COLORS[p.level] + '55' }]}>
                <Text style={[styles.rankAvatarText, { color: C.textPrimary }]}>{p.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rankName, { color: C.textPrimary }]}>{p.name}</Text>
                <Text style={[styles.rankRole, { color: C.textSecondary }]}>{p.playingRole} · {LEVEL_NAMES[p.level]}</Text>
              </View>
              <View style={styles.rankRight}>
                <Text style={[styles.rankPts, { color: catConfig.color }]}>{p.points.toLocaleString()}</Text>
                <Text style={[styles.rankPtsLabel, { color: C.textMuted }]}>points</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Milestone Wall */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>🎯 Milestone Wall</Text>
          <Text style={[styles.sectionSub, { color: C.textSecondary }]}>Players who achieved special milestones</Text>
          {MILESTONES.map((ms, i) => {
            const holders = milestoneHolders[i];
            if (!holders || holders.length === 0) return null;
            return (
              <View key={i} style={[styles.milestoneCard, { backgroundColor: C.bgCard, borderColor: C.border, borderLeftColor: ms.color }]}>
                <View style={styles.milestoneTop}>
                  <Text style={styles.msIcon}>{ms.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.msLabel, { color: ms.color }]}>{ms.label}</Text>
                    <Text style={[styles.msCount, { color: C.textSecondary }]}>{holders.length} player{holders.length !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={styles.msAvatarsRow}>
                  {holders.slice(0, 8).map(p => (
                    <View key={p.id} style={[styles.msAvatar, { backgroundColor: ms.color + '22', borderColor: ms.color + '55' }]}>
                      <Text style={[styles.msAvatarText, { color: C.textPrimary }]}>{p.name[0]}</Text>
                    </View>
                  ))}
                  {holders.length > 8 && (
                    <View style={[styles.msAvatar, { backgroundColor: C.bgSurface, borderColor: C.border }]}>
                      <Text style={[styles.msAvatarText, { color: C.textMuted }]}>+{holders.length - 8}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend Wall — Level 5 players */}
        {legendPlayers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>⚡ Legends — Level 5 Elite</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
              {legendPlayers.map(p => (
                <View key={p.id} style={[styles.legendCard, { backgroundColor: C.bgCard, borderColor: '#FF7B00' + '44' }]}>
                  <View style={[styles.legendAvatarRing, { borderColor: '#FF7B00' }]}>
                    <View style={[styles.legendAvatar, { backgroundColor: '#FF7B00' + '22' }]}>
                      <Text style={[styles.legendAvatarText, { color: C.textPrimary }]}>{p.name[0]}</Text>
                    </View>
                  </View>
                  <Text style={[styles.legendName, { color: C.textPrimary }]} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.legendBadge, { backgroundColor: '#FF7B00' + '18', borderColor: '#FF7B00' + '44' }]}>
                    <Text style={[styles.legendBadgeText, { color: '#FF7B00' }]}>⚡ Legend</Text>
                  </View>
                  <Text style={[styles.legendPts, { color: C.gold }]}>{p.points.toLocaleString()} pts</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.extrabold },
  headerSub: { fontSize: Typography.xs, marginTop: 1 },
  statsBanner: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: Spacing.md },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontSize: Typography.md, fontWeight: Typography.extrabold },
  statLbl: { fontSize: 9, textAlign: 'center' },
  tabsRow: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: 8, flexDirection: 'row' },
  catTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1,
  },
  catTabText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  podiumSection: { paddingHorizontal: Spacing.base, marginBottom: Spacing.xl },
  championCard: {
    borderRadius: Radius.xl, borderWidth: 1.5,
    alignItems: 'center', marginBottom: Spacing.md,
    overflow: 'hidden', paddingBottom: Spacing.base,
  },
  champAccent: { height: 4, width: '100%', marginBottom: Spacing.base },
  champCrown: { position: 'absolute', top: Spacing.md, zIndex: 1 },
  crownEmoji: { fontSize: 28 },
  champAvatarRing: { width: 84, height: 84, borderRadius: 42, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  champAvatar: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  champAvatarText: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold },
  champName: { fontSize: Typography.xl, fontWeight: Typography.extrabold, marginBottom: 2 },
  champRole: { fontSize: Typography.xs, marginBottom: Spacing.sm },
  champLevelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, marginBottom: Spacing.md },
  champLevelText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  champStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginBottom: Spacing.sm },
  champStatItem: { alignItems: 'center' },
  champStatVal: { fontSize: Typography.lg, fontWeight: Typography.extrabold },
  champStatLbl: { fontSize: Typography.xs },
  champStatDiv: { width: 1, height: 28 },
  champBadgesRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: Spacing.md },
  champBadgeEmoji: { fontSize: 20 },
  badgeMore: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeMoreText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  podiumRow: { flexDirection: 'row', gap: Spacing.sm },
  podiumCard: { flex: 1, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, alignItems: 'center', gap: 4 },
  podiumMedal: { fontSize: 20 },
  podiumAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  podiumAvatarText: { fontSize: Typography.base, fontWeight: Typography.bold },
  podiumName: { fontSize: Typography.xs, fontWeight: Typography.semibold, textAlign: 'center' },
  podiumPts: { fontSize: Typography.xs, fontWeight: Typography.bold },
  podiumLevel: { fontSize: 10, fontWeight: Typography.medium },
  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, marginBottom: 4 },
  sectionSub: { fontSize: Typography.xs, marginBottom: Spacing.md },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  rankMedal: { fontSize: 18, width: 36, textAlign: 'center' },
  rankAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  rankAvatarText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  rankName: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  rankRole: { fontSize: Typography.xs },
  rankRight: { alignItems: 'flex-end' },
  rankPts: { fontSize: Typography.sm, fontWeight: Typography.extrabold },
  rankPtsLabel: { fontSize: Typography.xs },
  milestoneCard: { borderRadius: Radius.lg, borderWidth: 1, borderLeftWidth: 3, padding: Spacing.md, marginBottom: Spacing.sm },
  milestoneTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  msIcon: { fontSize: 24 },
  msLabel: { fontSize: Typography.sm, fontWeight: Typography.bold },
  msCount: { fontSize: Typography.xs, marginTop: 1 },
  msAvatarsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  msAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  msAvatarText: { fontSize: 11, fontWeight: Typography.bold },
  legendCard: { width: 110, borderRadius: Radius.xl, borderWidth: 1.5, padding: Spacing.md, alignItems: 'center', gap: 5 },
  legendAvatarRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  legendAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  legendAvatarText: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  legendName: { fontSize: Typography.xs, fontWeight: Typography.semibold, textAlign: 'center' },
  legendBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  legendBadgeText: { fontSize: 9, fontWeight: Typography.bold },
  legendPts: { fontSize: Typography.xs, fontWeight: Typography.extrabold },
});
