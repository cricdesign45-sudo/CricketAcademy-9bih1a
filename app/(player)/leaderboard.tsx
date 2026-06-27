import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Player, LeaderboardCategory } from '@/types';
import { RANK_LEVELS, getRankInfo } from '@/constants/mockData';

const LEADERBOARD_TABS: { key: LeaderboardCategory; label: string; icon: string }[] = [
  { key: 'overall', label: 'Overall', icon: 'emoji-events' },
  { key: 'monthly', label: 'Monthly', icon: 'calendar-today' },
  { key: 'attendance', label: 'Attendance', icon: 'event-available' },
  { key: 'batting', label: 'Batting', icon: 'sports-cricket' },
  { key: 'bowling', label: 'Bowling', icon: 'air' },
  { key: 'fielding', label: 'Fielding', icon: 'catching-pokemon' },
  { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
  { key: 'discipline', label: 'Discipline', icon: 'military-tech' },
  { key: 'mostImproved', label: 'Improved', icon: 'trending-up' },
];

type SortedPlayer = Player & { rank: number; displayValue: string; displayLabel: string };

export default function PlayerLeaderboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { players } = usePlayers();
  const { Colors } = useTheme();
  const C = Colors;
  const [activeTab, setActiveTab] = useState<LeaderboardCategory>('overall');

  const LEVEL_COLORS = ['', C.level1, C.level2, C.level3, C.level4, C.level5];

  const sorted: SortedPlayer[] = useMemo(() => {
    const arr = [...players];
    switch (activeTab) {
      case 'overall':
        return arr.sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.points.toLocaleString(), displayLabel: 'pts' }));
      case 'monthly':
        return arr.sort((a, b) => b.monthlyPoints - a.monthlyPoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.monthlyPoints.toLocaleString(), displayLabel: 'monthly pts' }));
      case 'attendance':
        return arr.sort((a, b) => b.attendancePercentage - a.attendancePercentage).map((p, i) => ({ ...p, rank: i + 1, displayValue: `${p.attendancePercentage}%`, displayLabel: 'attendance' }));
      case 'batting':
        return arr.filter(p => p.batting.matches > 0).sort((a, b) => b.batting.runs - a.batting.runs).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.batting.runs.toString(), displayLabel: 'runs' }));
      case 'bowling':
        return arr.filter(p => p.bowling.wickets > 0).sort((a, b) => b.bowling.wickets - a.bowling.wickets).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.bowling.wickets.toString(), displayLabel: 'wickets' }));
      case 'fielding':
        return arr.sort((a, b) => b.fielding.fieldingPoints - a.fielding.fieldingPoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.fielding.fieldingPoints.toString(), displayLabel: 'field pts' }));
      case 'fitness':
        return arr.sort((a, b) => b.fitness.fitnessScore - a.fitness.fitnessScore).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.fitness.fitnessScore.toString(), displayLabel: 'fitness' }));
      case 'discipline':
        return arr.sort((a, b) => b.disciplinePoints - a.disciplinePoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.disciplinePoints.toString(), displayLabel: 'discipline' }));
      case 'mostImproved':
        return arr.sort((a, b) => (b.previousRank - b.rank) - (a.previousRank - a.rank)).map((p, i) => {
          const change = p.previousRank - p.rank;
          return { ...p, rank: i + 1, displayValue: change >= 0 ? `+${change}` : `${change}`, displayLabel: 'rank change' };
        });
      default:
        return arr.sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.points.toLocaleString(), displayLabel: 'pts' }));
    }
  }, [players, activeTab]);

  const myRank = sorted.findIndex(p => p.id === user?.playerId) + 1;
  const myPlayer = sorted.find(p => p.id === user?.playerId);
  const playerAbove = myRank > 1 ? sorted[myRank - 2] : null;

  const renderItem = ({ item }: { item: SortedPlayer }) => {
    const isMe = item.id === user?.playerId;
    const levelColor = LEVEL_COLORS[item.level] || C.textMuted;
    const rankInfo = getRankInfo(item.rankTier);
    const rankChange = item.previousRank - item.rank;

    return (
      <View style={[s.row, { backgroundColor: C.bgCard, borderColor: C.border }, isMe && { borderColor: C.gold + '55', backgroundColor: C.gold + '0C' }]}>
        <View style={s.rankCol}>
          {item.rank <= 3 ? (
            <Text style={s.rankEmoji}>{item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}</Text>
          ) : (
            <Text style={[s.rankNum, { color: isMe ? C.gold : C.textMuted }]}>#{item.rank}</Text>
          )}
        </View>
        <View style={[s.avatar, { backgroundColor: levelColor + '28', borderColor: levelColor + '55' }]}>
          <Text style={[s.avatarText, { color: C.textPrimary }]}>{item.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={[s.name, { color: C.textPrimary }, isMe && { color: C.gold }]}>
              {item.name}{isMe ? ' (You)' : ''}
            </Text>
            <Text style={{ fontSize: 12 }}>{rankInfo.icon}</Text>
          </View>
          <View style={[s.tierRow]}>
            <View style={[s.tierPill, { backgroundColor: rankInfo.color + '18', borderColor: rankInfo.color + '33' }]}>
              <Text style={[s.tierText, { color: rankInfo.color }]}>{item.rankTier}</Text>
            </View>
            {rankChange !== 0 && (
              <View style={[s.changePill, { backgroundColor: rankChange > 0 ? C.success + '1A' : C.error + '1A' }]}>
                <MaterialIcons name={rankChange > 0 ? 'arrow-upward' : 'arrow-downward'} size={9} color={rankChange > 0 ? C.success : C.error} />
                <Text style={[s.changeText, { color: rankChange > 0 ? C.success : C.error }]}>{Math.abs(rankChange)}</Text>
              </View>
            )}
          </View>
          <View style={[s.xpBar, { backgroundColor: C.bgSurface }]}>
            <View style={[s.xpFill, { width: `${Math.min(100, (item.xp / item.nextLevelXp) * 100)}%` as any, backgroundColor: isMe ? C.gold : levelColor }]} />
          </View>
        </View>
        <View style={s.rightCol}>
          <Text style={[s.points, { color: isMe ? C.gold : C.textPrimary }]}>{item.displayValue}</Text>
          <Text style={[s.ptLabel, { color: C.textSecondary }]}>{item.displayLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[s.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <Text style={[s.title, { color: C.textPrimary }]}>Leaderboard</Text>
        <Text style={[s.subtitle, { color: C.textSecondary }]}>Your Rank: #{myRank} of {players.length}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 54, borderBottomWidth: 1, borderBottomColor: C.border }} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center', paddingVertical: 8 }}>
        {LEADERBOARD_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tabChip, { backgroundColor: C.bgCard, borderColor: C.border }, activeTab === tab.key && { backgroundColor: C.primary, borderColor: C.primaryLight }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons name={tab.icon as any} size={12} color={activeTab === tab.key ? C.textPrimary : C.textMuted} />
            <Text style={[s.tabText, { color: activeTab === tab.key ? C.textPrimary : C.textSecondary }, activeTab === tab.key && { fontWeight: Typography.bold }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Rank tier quick guide */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50 }} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.xs, alignItems: 'center', paddingVertical: 6 }}>
        {RANK_LEVELS.map(rl => (
          <View key={rl.tier} style={[s.tierCard, { backgroundColor: C.bgCard, borderColor: rl.color + '44' }]}>
            <Text style={{ fontSize: 10 }}>{rl.icon}</Text>
            <Text style={[s.tierCardText, { color: rl.color }]}>{rl.tier}</Text>
          </View>
        ))}
      </ScrollView>

      {myRank > 0 && (
        <View style={[s.myBanner, { backgroundColor: C.primary + '1A', borderColor: C.primary + '44' }]}>
          <Text style={s.bannerEmoji}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.bannerTitle, { color: C.textPrimary }]}>
              {'Ranked '}
              <Text style={[{ color: C.gold, fontWeight: Typography.extrabold }]}>#{myRank}</Text>
              {' in the academy'}
            </Text>
            {playerAbove && (
              <Text style={[s.bannerHint, { color: C.textSecondary }]}>
                Chase {playerAbove.name.split(' ')[0]} · {playerAbove.displayValue} {playerAbove.displayLabel}
              </Text>
            )}
          </View>
          {myPlayer && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[s.myPtsNum, { color: C.gold }]}>{myPlayer.displayValue}</Text>
              <Text style={[s.myPtsLabel, { color: C.textMuted }]}>{myPlayer.displayLabel}</Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.sm, marginTop: 1 },
  tabChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  tabText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  tierCard: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  tierCardText: { fontSize: 9, fontWeight: Typography.bold },
  myBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, marginHorizontal: Spacing.base, marginBottom: Spacing.md, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
  bannerEmoji: { fontSize: 22 },
  bannerTitle: { fontSize: Typography.sm, fontWeight: Typography.medium },
  bannerHint: { fontSize: Typography.xs, marginTop: 2 },
  myPtsNum: { fontSize: Typography.lg, fontWeight: Typography.extrabold },
  myPtsLabel: { fontSize: Typography.xs },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  rankCol: { width: 40, alignItems: 'center' },
  rankEmoji: { fontSize: 22 },
  rankNum: { fontSize: Typography.sm, fontWeight: Typography.bold },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText: { fontSize: Typography.base, fontWeight: Typography.bold },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  name: { fontSize: Typography.sm, fontWeight: Typography.semibold, flex: 1 },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  tierPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  tierText: { fontSize: 9, fontWeight: Typography.bold },
  changePill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 4, paddingVertical: 2, borderRadius: Radius.full },
  changeText: { fontSize: 9, fontWeight: Typography.bold },
  xpBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: 3, borderRadius: 2 },
  rightCol: { alignItems: 'flex-end' },
  points: { fontSize: Typography.base, fontWeight: Typography.bold },
  ptLabel: { fontSize: Typography.xs },
});
