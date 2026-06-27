import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Player } from '@/types';

const ROLES = ['All', 'Batsman', 'Fast Bowler', 'Spin Bowler', 'All-rounder', 'Wicket-keeper'];
const AGE_GROUPS = ['All', 'Under-17', 'Under-19', 'Under-21', 'Under-23'];
const BATCHES = ['All', 'A', 'B', 'C'];

type SortKey = 'points' | 'name' | 'attendance' | 'rank';

export default function PlayersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players, deletePlayer } = usePlayers();
  const { showAlert } = useAlert();
  const { Colors } = useTheme();
  const C = Colors;

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedAge, setSelectedAge] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [showInactive, setShowInactive] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [showFilters, setShowFilters] = useState(false);

  const LEVEL_COLORS = ['', C.level1, C.level2, C.level3, C.level4, C.level5];

  const filtered = useMemo(() => {
    return players
      .filter(p => {
        const q = search.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.playingRole.toLowerCase().includes(q);
        const matchesRole = selectedRole === 'All' || p.playingRole === selectedRole;
        const matchesAge = selectedAge === 'All' || p.ageGroup === selectedAge;
        const matchesBatch = selectedBatch === 'All' || p.batch === selectedBatch;
        const matchesActive = showInactive ? true : p.isActive;
        return matchesSearch && matchesRole && matchesAge && matchesBatch && matchesActive;
      })
      .sort((a, b) => {
        if (sortKey === 'points') return b.points - a.points;
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        if (sortKey === 'attendance') return b.attendancePercentage - a.attendancePercentage;
        if (sortKey === 'rank') return a.rank - b.rank;
        return 0;
      });
  }, [players, search, selectedRole, selectedAge, selectedBatch, showInactive, sortKey]);

  const activeCnt = players.filter(p => p.isActive).length;
  const avgAtt = players.length > 0
    ? Math.round(players.reduce((s, p) => s + p.attendancePercentage, 0) / players.length)
    : 0;

  const handleDelete = (player: Player) => {
    showAlert(`Delete ${player.name}?`, 'This action cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlayer(player.id) },
    ]);
  };

  const renderPlayer = ({ item, index }: { item: Player; index: number }) => {
    const levelColor = LEVEL_COLORS[item.level] || C.textMuted;
    const xpPct = Math.min(100, (item.xp / item.nextLevelXp) * 100);
    const attColor = item.attendancePercentage >= 85 ? C.success : item.attendancePercentage >= 70 ? C.warning : C.error;

    return (
      <TouchableOpacity
        style={[
          styles.playerCard,
          { backgroundColor: C.bgCard, borderColor: C.border },
          !item.isActive && { opacity: 0.6 },
        ]}
        onPress={() => router.push({ pathname: '/player-detail', params: { id: item.id } })}
        activeOpacity={0.78}
      >
        {/* Rank + Avatar */}
        <View style={styles.leftCol}>
          <Text style={[styles.rankNum, { color: C.textMuted }]}>#{index + 1}</Text>
          <View style={[styles.avatarRing, { borderColor: levelColor + '77' }]}>
            <View style={[styles.avatar, { backgroundColor: item.isActive ? C.primary : C.bgSurface }]}>
              <Text style={[styles.avatarText, { color: C.textPrimary }]}>{item.name[0]}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.playerName, { color: C.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelColor + '1A', borderColor: levelColor + '55' }]}>
              <Text style={[styles.levelText, { color: levelColor }]}>L{item.level}</Text>
            </View>
            {!item.isActive && (
              <View style={[styles.inactivePill, { backgroundColor: C.error + '18' }]}>
                <Text style={[styles.inactivePillText, { color: C.error }]}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={[styles.roleText, { color: C.textSecondary }]}>
            {item.playingRole} · Batch {item.batch} · {item.ageGroup}
          </Text>

          {/* Stats Row */}
          <View style={styles.miniStatsRow}>
            <View style={styles.miniStat}>
              <MaterialIcons name="star" size={10} color={C.gold} />
              <Text style={[styles.miniStatVal, { color: C.gold }]}>{item.points.toLocaleString()}</Text>
              <Text style={[styles.miniStatLbl, { color: C.textMuted }]}>pts</Text>
            </View>
            <View style={styles.miniStat}>
              <MaterialIcons name="event-available" size={10} color={attColor} />
              <Text style={[styles.miniStatVal, { color: attColor }]}>{item.attendancePercentage}%</Text>
            </View>
            <View style={styles.miniStat}>
              <MaterialIcons name="sports-cricket" size={10} color={C.info} />
              <Text style={[styles.miniStatVal, { color: C.textSecondary }]}>{item.batting.runs}r</Text>
            </View>
            <View style={styles.miniStat}>
              <MaterialIcons name="adjust" size={10} color={C.chart4} />
              <Text style={[styles.miniStatVal, { color: C.textSecondary }]}>{item.bowling.wickets}w</Text>
            </View>
          </View>

          {/* XP Bar */}
          <View style={[styles.xpBar, { backgroundColor: C.bgSurface }]}>
            <View style={[styles.xpFill, { width: `${xpPct}%` as any, backgroundColor: levelColor }]} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.info + '18' }]}
            onPress={() => router.push({ pathname: '/player-detail', params: { id: item.id } })}
          >
            <MaterialIcons name="visibility" size={15} color={C.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.gold + '18' }]}
            onPress={() => router.push({ pathname: '/add-points', params: { playerId: item.id } })}
          >
            <MaterialIcons name="star" size={15} color={C.gold} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.error + '18' }]}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete-outline" size={15} color={C.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View>
          <Text style={[styles.title, { color: C.textPrimary }]}>Players</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>
            {activeCnt} active · {avgAtt}% avg attendance
          </Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.filterToggleBtn, { backgroundColor: showFilters ? C.primary : C.bgCard, borderColor: showFilters ? C.primaryLight : C.border }]}
            onPress={() => setShowFilters(v => !v)}
          >
            <MaterialIcons name="filter-list" size={16} color={showFilters ? C.textPrimary : C.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: C.primary }]}
            onPress={() => router.push('/add-player')}
          >
            <MaterialIcons name="person-add" size={16} color={C.textPrimary} />
            <Text style={[styles.addBtnText, { color: C.textPrimary }]}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <MaterialIcons name="search" size={18} color={C.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: C.textPrimary }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, role..."
          placeholderTextColor={C.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="cancel" size={16} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          {/* Sort */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: C.textMuted }]}>Sort by</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {([
                { key: 'points', label: 'Points' },
                { key: 'rank', label: 'Rank' },
                { key: 'attendance', label: 'Attendance' },
                { key: 'name', label: 'Name' },
              ] as { key: SortKey; label: string }[]).map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sortChip, { backgroundColor: sortKey === s.key ? C.primary : C.bgSurface, borderColor: sortKey === s.key ? C.primaryLight : C.border }]}
                  onPress={() => setSortKey(s.key)}
                >
                  <Text style={[styles.chipText, { color: sortKey === s.key ? C.textPrimary : C.textSecondary }]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Role filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: C.textMuted }]}>Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.sortChip, { backgroundColor: selectedRole === r ? C.primary : C.bgSurface, borderColor: selectedRole === r ? C.primaryLight : C.border }]}
                  onPress={() => setSelectedRole(r)}
                >
                  <Text style={[styles.chipText, { color: selectedRole === r ? C.textPrimary : C.textSecondary }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Age Group filter */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterLabel, { color: C.textMuted }]}>Age Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {AGE_GROUPS.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.sortChip, { backgroundColor: selectedAge === a ? C.info : C.bgSurface, borderColor: selectedAge === a ? C.info + 'AA' : C.border }]}
                  onPress={() => setSelectedAge(a)}
                >
                  <Text style={[styles.chipText, { color: selectedAge === a ? C.textPrimary : C.textSecondary }]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Batch + Show Inactive */}
          <View style={[styles.filterGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {BATCHES.map(b => (
                <TouchableOpacity
                  key={b}
                  style={[styles.sortChip, { backgroundColor: selectedBatch === b ? C.gold + '20' : C.bgSurface, borderColor: selectedBatch === b ? C.gold : C.border }]}
                  onPress={() => setSelectedBatch(b)}
                >
                  <Text style={[styles.chipText, { color: selectedBatch === b ? C.gold : C.textSecondary }]}>{b === 'All' ? 'All Batches' : `Batch ${b}`}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.sortChip, { backgroundColor: showInactive ? C.error + '18' : C.bgSurface, borderColor: showInactive ? C.error : C.border }]}
              onPress={() => setShowInactive(v => !v)}
            >
              <MaterialIcons name={showInactive ? 'visibility' : 'visibility-off'} size={12} color={showInactive ? C.error : C.textMuted} />
              <Text style={[styles.chipText, { color: showInactive ? C.error : C.textSecondary }]}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results count */}
      <View style={[styles.resultsBar, { backgroundColor: C.bgSurface, borderBottomColor: C.border }]}>
        <Text style={[styles.resultsText, { color: C.textMuted }]}>
          Showing {filtered.length} of {players.length} players
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/add-player')}
          style={[styles.importHint, { borderColor: C.border }]}
        >
          <MaterialIcons name="upload" size={12} color={C.textMuted} />
          <Text style={[styles.importHintText, { color: C.textMuted }]}>Import CSV</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏏</Text>
            <Text style={[styles.emptyTitle, { color: C.textSecondary }]}>No players found</Text>
            <Text style={[styles.emptyHint, { color: C.textMuted }]}>Try adjusting your search or filters</Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: C.primary }]}
              onPress={() => router.push('/add-player')}
            >
              <MaterialIcons name="person-add" size={16} color={C.textPrimary} />
              <Text style={[styles.emptyAddText, { color: C.textPrimary }]}>Add First Player</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.xs, marginTop: 1 },
  headerBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  filterToggleBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 9, borderRadius: Radius.md,
  },
  addBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: Radius.md,
    marginHorizontal: Spacing.base, marginTop: Spacing.md, marginBottom: 4,
    paddingHorizontal: Spacing.md,
  },
  searchInput: { flex: 1, fontSize: Typography.base, paddingVertical: 11 },
  filtersPanel: {
    marginHorizontal: Spacing.base, borderRadius: Radius.lg,
    borderWidth: 1, padding: Spacing.md, marginBottom: 4,
  },
  filterGroup: { marginBottom: Spacing.sm },
  filterLabel: {
    fontSize: Typography.xs, fontWeight: Typography.semibold,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6,
  },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1,
  },
  chipText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  resultsBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: 7, borderBottomWidth: 1,
  },
  resultsText: { fontSize: Typography.xs },
  importHint: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1,
  },
  importHintText: { fontSize: 10 },
  list: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 24 },
  playerCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, gap: Spacing.sm,
  },
  leftCol: { alignItems: 'center', gap: 4 },
  rankNum: { fontSize: 10, fontWeight: Typography.bold },
  avatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography.lg, fontWeight: Typography.bold },
  playerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  playerName: { fontSize: Typography.sm, fontWeight: Typography.bold, flex: 1 },
  levelBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 1 },
  levelText: { fontSize: 9, fontWeight: Typography.bold },
  inactivePill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.full },
  inactivePillText: { fontSize: 9, fontWeight: Typography.bold },
  roleText: { fontSize: Typography.xs, marginBottom: 6 },
  miniStatsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: 6 },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniStatVal: { fontSize: 10, fontWeight: Typography.semibold },
  miniStatLbl: { fontSize: 9 },
  xpBar: { height: 3, borderRadius: 2, overflow: 'hidden' },
  xpFill: { height: 3, borderRadius: 2 },
  actions: { gap: 6 },
  actionBtn: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: Typography.base, fontWeight: Typography.semibold },
  emptyHint: { fontSize: Typography.sm },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.xl, paddingVertical: 12,
    borderRadius: Radius.md, marginTop: Spacing.sm,
  },
  emptyAddText: { fontSize: Typography.sm, fontWeight: Typography.bold },
});
