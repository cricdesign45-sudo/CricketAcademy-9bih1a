import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Player, LeaderboardCategory, RankTier } from '@/types';
import { MOCK_ACHIEVEMENTS, RANK_LEVELS, getRankInfo } from '@/constants/mockData';

const { width } = Dimensions.get('window');

const LEADERBOARD_TABS: { key: LeaderboardCategory; label: string; icon: string }[] = [
  { key: 'overall', label: 'Overall', icon: 'emoji-events' },
  { key: 'monthly', label: 'Monthly', icon: 'calendar-today' },
  { key: 'yearly', label: 'Yearly', icon: 'date-range' },
  { key: 'attendance', label: 'Attendance', icon: 'event-available' },
  { key: 'batting', label: 'Batting', icon: 'sports-cricket' },
  { key: 'bowling', label: 'Bowling', icon: 'air' },
  { key: 'fielding', label: 'Fielding', icon: 'catching-pokemon' },
  { key: 'fitness', label: 'Fitness', icon: 'fitness-center' },
  { key: 'wicketkeeper', label: 'Wicketkeeper', icon: 'sports' },
  { key: 'discipline', label: 'Discipline', icon: 'military-tech' },
  { key: 'mostImproved', label: 'Most Improved', icon: 'trending-up' },
];

const AGE_GROUPS = ['All', 'Under-17', 'Under-19', 'Under-21', 'Under-23'];
const BATCHES = ['All', 'A', 'B', 'C'];
const PLAYING_ROLES = ['All', 'Batsman', 'Fast Bowler', 'Spin Bowler', 'All-rounder', 'Wicket-keeper'];

type SortedPlayer = Player & { rank: number; displayValue: string; displayLabel: string };

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const { Colors } = useTheme();
  const C = Colors;
  const router = useRouter();
  const { players } = usePlayers();

  const [activeTab, setActiveTab] = useState<LeaderboardCategory>('overall');
  const [ageFilter, setAgeFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const LEVEL_COLORS = ['', C.level1, C.level2, C.level3, C.level4, C.level5];

  const filtered = useMemo(() => {
    return players.filter(p => {
      if (ageFilter !== 'All' && p.ageGroup !== ageFilter) return false;
      if (batchFilter !== 'All' && p.batch !== batchFilter) return false;
      if (roleFilter !== 'All' && p.playingRole !== roleFilter) return false;
      return true;
    });
  }, [players, ageFilter, batchFilter, roleFilter]);

  const sorted: SortedPlayer[] = useMemo(() => {
    const arr = [...filtered];
    let sorted: SortedPlayer[];
    switch (activeTab) {
      case 'overall':
        sorted = arr.sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.points.toLocaleString(), displayLabel: 'pts' }));
        break;
      case 'monthly':
        sorted = arr.sort((a, b) => b.monthlyPoints - a.monthlyPoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.monthlyPoints.toLocaleString(), displayLabel: 'monthly pts' }));
        break;
      case 'yearly':
        sorted = arr.sort((a, b) => b.yearlyPoints - a.yearlyPoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.yearlyPoints.toLocaleString(), displayLabel: 'yearly pts' }));
        break;
      case 'attendance':
        sorted = arr.sort((a, b) => b.attendancePercentage - a.attendancePercentage).map((p, i) => ({ ...p, rank: i + 1, displayValue: `${p.attendancePercentage}%`, displayLabel: 'attendance' }));
        break;
      case 'batting':
        sorted = arr.filter(p => p.batting.matches > 0).sort((a, b) => b.batting.runs - a.batting.runs).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.batting.runs.toString(), displayLabel: 'runs' }));
        break;
      case 'bowling':
        sorted = arr.filter(p => p.bowling.wickets > 0).sort((a, b) => b.bowling.wickets - a.bowling.wickets).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.bowling.wickets.toString(), displayLabel: 'wickets' }));
        break;
      case 'fielding':
        sorted = arr.sort((a, b) => b.fielding.fieldingPoints - a.fielding.fieldingPoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.fielding.fieldingPoints.toString(), displayLabel: 'field pts' }));
        break;
      case 'fitness':
        sorted = arr.sort((a, b) => b.fitness.fitnessScore - a.fitness.fitnessScore).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.fitness.fitnessScore.toString(), displayLabel: 'fitness' }));
        break;
      case 'wicketkeeper':
        sorted = arr.filter(p => p.playingRole === 'Wicket-keeper').sort((a, b) => b.fielding.stumpings - a.fielding.stumpings).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.fielding.stumpings.toString(), displayLabel: 'stumpings' }));
        break;
      case 'discipline':
        sorted = arr.sort((a, b) => b.disciplinePoints - a.disciplinePoints).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.disciplinePoints.toString(), displayLabel: 'discipline' }));
        break;
      case 'mostImproved':
        sorted = arr.sort((a, b) => (b.rank - b.previousRank) - (a.rank - a.previousRank)).map((p, i) => {
          const change = p.previousRank - p.rank;
          return { ...p, rank: i + 1, displayValue: change >= 0 ? `+${change}` : `${change}`, displayLabel: 'rank change' };
        });
        break;
      default:
        sorted = arr.sort((a, b) => b.points - a.points).map((p, i) => ({ ...p, rank: i + 1, displayValue: p.points.toLocaleString(), displayLabel: 'pts' }));
    }
    return sorted;
  }, [filtered, activeTab]);

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const getRarityColor = (rarity: string) => {
    const map: Record<string, string> = { common: C.textSecondary, uncommon: C.success, rare: C.info, epic: C.chart4, legendary: C.gold };
    return map[rarity] || C.textSecondary;
  };

  const renderPlayerRow = ({ item }: { item: SortedPlayer }) => {
    const levelColor = LEVEL_COLORS[item.level] || C.textMuted;
    const rankInfo = getRankInfo(item.rankTier);
    const rankChange = item.previousRank - item.rank;
    return (
      <TouchableOpacity
        style={[s.row, { backgroundColor: C.bgCard, borderColor: C.border }]}
        onPress={() => router.push({ pathname: '/player-detail', params: { id: item.id } })}
        activeOpacity={0.78}
      >
        <View style={s.rankCol}>
          <Text style={[s.rankNum, { color: C.textMuted }]}>#{item.rank}</Text>
        </View>
        <View style={[s.avatar, { backgroundColor: levelColor + '2A', borderColor: levelColor + '55' }]}>
          <Text style={[s.avatarText, { color: C.textPrimary }]}>{item.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={[s.playerName, { color: C.textPrimary }]}>{item.name}</Text>
            <Text style={{ fontSize: 14 }}>{rankInfo.icon}</Text>
          </View>
          <View style={s.subRow}>
            <View style={[s.tierPill, { backgroundColor: rankInfo.color + '18', borderColor: rankInfo.color + '33' }]}>
              <Text style={[s.tierText, { color: rankInfo.color }]}>{item.rankTier}</Text>
            </View>
            <Text style={[s.roleTag, { color: C.textMuted }]}>{item.playingRole}</Text>
          </View>
          <View style={[s.xpBar, { backgroundColor: C.bgSurface }]}>
            <View style={[s.xpFill, { width: `${Math.min(100, (item.xp / item.nextLevelXp) * 100)}%` as any, backgroundColor: levelColor }]} />
          </View>
        </View>
        <View style={s.rightCol}>
          <Text style={[s.displayValue, { color: C.gold }]}>{item.displayValue}</Text>
          <Text style={[s.displayLabel, { color: C.textMuted }]}>{item.displayLabel}</Text>
          {rankChange !== 0 && (
            <View style={[s.rankChangePill, { backgroundColor: rankChange > 0 ? C.success + '1A' : C.error + '1A' }]}>
              <MaterialIcons name={rankChange > 0 ? 'arrow-upward' : 'arrow-downward'} size={10} color={rankChange > 0 ? C.success : C.error} />
              <Text style={[s.rankChangeText, { color: rankChange > 0 ? C.success : C.error }]}>{Math.abs(rankChange)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <View>
          <Text style={[s.title, { color: C.textPrimary }]}>Leaderboards</Text>
          <Text style={[s.subtitle, { color: C.textSecondary }]}>{sorted.length} players ranked</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[s.filterBtn, { backgroundColor: C.gold + '18', borderColor: C.gold + '44' }]}
            onPress={() => router.push('/hall-of-fame')}
          >
            <Text style={{ fontSize: 14 }}>🏛️</Text>
            <Text style={[s.filterBtnText, { color: C.gold }]}>Fame</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.filterBtn, { backgroundColor: showFilters ? C.primary : C.bgCard, borderColor: showFilters ? C.primaryLight : C.border }]}
            onPress={() => setShowFilters(v => !v)}
          >
            <MaterialIcons name="filter-list" size={18} color={showFilters ? C.textPrimary : C.textSecondary} />
            <Text style={[s.filterBtnText, { color: showFilters ? C.textPrimary : C.textSecondary }]}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leaderboard Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabsScroll, { borderBottomColor: C.border }]} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.sm }}>
        {LEADERBOARD_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tabChip, { backgroundColor: C.bgCard, borderColor: C.border }, activeTab === tab.key && { backgroundColor: C.primary, borderColor: C.primaryLight }]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.78}
          >
            <MaterialIcons name={tab.icon as any} size={13} color={activeTab === tab.key ? C.textPrimary : C.textMuted} />
            <Text style={[s.tabChipText, { color: activeTab === tab.key ? C.textPrimary : C.textSecondary }, activeTab === tab.key && { fontWeight: Typography.bold }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filters Panel */}
      {showFilters && (
        <View style={[s.filtersPanel, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <FilterRow label="Age Group" options={AGE_GROUPS} value={ageFilter} onChange={setAgeFilter} C={C} />
          <FilterRow label="Batch" options={BATCHES} value={batchFilter} onChange={setBatchFilter} C={C} />
          <FilterRow label="Role" options={PLAYING_ROLES} value={roleFilter} onChange={setRoleFilter} C={C} />
        </View>
      )}

      <FlatList
        data={rest}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={() => (
          <>
            {/* Podium */}
            {top3.length >= 3 && (
              <View style={[s.podiumWrap, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, idx) => {
                  const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const medals = ['🥈', '🥇', '🥉'];
                  const ht = [50, 76, 36][idx];
                  const medalColors = ['#C0C0C0', C.gold, '#CD7F32'];
                  const mt = [32, 0, 48];
                  return (
                    <View key={p.id} style={[s.podiumCol, { marginTop: mt[idx] }]}>
                      {actualRank === 1 && <Text style={s.crown}>👑</Text>}
                      <View style={[s.podiumAvatar, { borderColor: medalColors[idx], backgroundColor: medalColors[idx] + '18', width: actualRank === 1 ? 68 : 54, height: actualRank === 1 ? 68 : 54, borderRadius: actualRank === 1 ? 34 : 27 }]}>
                        <Text style={[s.podiumAvatarTxt, { color: C.textPrimary, fontSize: actualRank === 1 ? Typography.xl : Typography.lg }]}>{p.name[0]}</Text>
                      </View>
                      <Text style={s.podiumMedal}>{medals[idx]}</Text>
                      <Text style={[s.podiumName, { color: actualRank === 1 ? C.gold : C.textPrimary }]} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
                      <Text style={[s.podiumVal, { color: actualRank === 1 ? C.gold : C.textSecondary }]}>{p.displayValue}</Text>
                      <View style={[s.podiumBase, { height: ht, backgroundColor: medalColors[idx] + '18', borderColor: medalColors[idx] + '44' }]}>
                        <Text style={[s.podiumRankTxt, { color: C.textSecondary }]}>#{actualRank}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Rank Tier Legend */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.xl }} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' }}>
              {RANK_LEVELS.map(rl => (
                <View key={rl.tier} style={[s.tierCard, { backgroundColor: C.bgCard, borderColor: rl.color + '44' }]}>
                  <Text style={{ fontSize: 14 }}>{rl.icon}</Text>
                  <Text style={[s.tierCardName, { color: rl.color }]}>{rl.tier}</Text>
                  <Text style={[s.tierCardRange, { color: C.textMuted }]}>{rl.minPoints.toLocaleString()}{rl.maxPoints === Infinity ? '+' : `–${rl.maxPoints.toLocaleString()}`}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Achievements Gallery */}
            <View style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.xl }}>
              <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Achievements Gallery</Text>
              <View style={s.achGrid}>
                {MOCK_ACHIEVEMENTS.map(ach => (
                  <View key={ach.id} style={[s.achCard, { backgroundColor: C.bgCard, borderColor: getRarityColor(ach.rarity) + '44' }]}>
                    <Text style={s.achIcon}>{ach.icon}</Text>
                    <Text style={[s.achName, { color: C.textPrimary }]}>{ach.name}</Text>
                    <View style={[s.rarityPill, { backgroundColor: getRarityColor(ach.rarity) + '1A' }]}>
                      <Text style={[s.rarityText, { color: getRarityColor(ach.rarity) }]}>{ach.rarity}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <Text style={[s.sectionTitle, { color: C.textPrimary, paddingHorizontal: Spacing.base, marginBottom: Spacing.md }]}>Full Rankings</Text>
          </>
        )}
        renderItem={renderPlayerRow}
      />
    </View>
  );
}

function FilterRow({ label, options, value, onChange, C }: any) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={[{ fontSize: Typography.xs, fontWeight: Typography.semibold, color: C.textSecondary, marginBottom: Spacing.xs }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs, flexDirection: 'row' }}>
        {options.map((o: string) => (
          <TouchableOpacity
            key={o}
            style={[{ paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 }, value === o ? { backgroundColor: C.primary, borderColor: C.primaryLight } : { backgroundColor: C.bgSurface, borderColor: C.border }]}
            onPress={() => onChange(o)}
          >
            <Text style={[{ fontSize: Typography.xs, fontWeight: Typography.medium }, { color: value === o ? C.textPrimary : C.textSecondary }]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.xs, marginTop: 1 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  filterBtnText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  tabsScroll: { borderBottomWidth: 1, maxHeight: 56 },
  tabChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  tabChipText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  filtersPanel: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  podiumWrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.sm, marginHorizontal: Spacing.base, borderRadius: Radius.xl, borderWidth: 1, marginBottom: Spacing.xl, marginTop: Spacing.md, paddingTop: Spacing.base },
  podiumCol: { flex: 1, alignItems: 'center' },
  crown: { fontSize: 22, marginBottom: 2 },
  podiumAvatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 4 },
  podiumAvatarTxt: { fontWeight: Typography.bold },
  podiumMedal: { fontSize: 16, marginBottom: 3 },
  podiumName: { fontSize: Typography.xs, fontWeight: Typography.semibold, marginBottom: 2, textAlign: 'center' },
  podiumVal: { fontSize: Typography.xs, marginBottom: 6, textAlign: 'center' },
  podiumBase: { width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.sm, borderWidth: 1 },
  podiumRankTxt: { fontSize: Typography.sm, fontWeight: Typography.bold },
  tierCard: { alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, gap: 2 },
  tierCardName: { fontSize: Typography.xs, fontWeight: Typography.bold },
  tierCardRange: { fontSize: 9 },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  achCard: { borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', width: '30%', borderWidth: 1, gap: 3 },
  achIcon: { fontSize: 22 },
  achName: { fontSize: 9, fontWeight: Typography.semibold, textAlign: 'center' },
  rarityPill: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: Radius.full },
  rarityText: { fontSize: 9, fontWeight: Typography.bold, textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, marginHorizontal: Spacing.base, marginBottom: Spacing.sm, borderWidth: 1 },
  rankCol: { width: 32, alignItems: 'center' },
  rankNum: { fontSize: Typography.xs, fontWeight: Typography.bold },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText: { fontSize: Typography.base, fontWeight: Typography.bold },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  playerName: { fontSize: Typography.sm, fontWeight: Typography.semibold, flex: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  tierPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  tierText: { fontSize: 9, fontWeight: Typography.bold },
  roleTag: { fontSize: 10 },
  xpBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: 3, borderRadius: 2 },
  rightCol: { alignItems: 'flex-end', gap: 2 },
  displayValue: { fontSize: Typography.base, fontWeight: Typography.bold },
  displayLabel: { fontSize: Typography.xs },
  rankChangePill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: Radius.full },
  rankChangeText: { fontSize: 9, fontWeight: Typography.bold },
});
