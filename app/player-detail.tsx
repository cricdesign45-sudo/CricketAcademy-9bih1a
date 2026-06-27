import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { MOCK_ACHIEVEMENTS } from '@/constants/mockData';

const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];
const LEVEL_COLORS = ['', Colors.level1, Colors.level2, Colors.level3, Colors.level4, Colors.level5];

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players, deletePlayer } = usePlayers();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'overview' | 'batting' | 'bowling' | 'fitness'>('overview');

  const player = players.find(p => p.id === id);
  if (!player) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Player not found</Text>
      </View>
    );
  }

  const levelColor = LEVEL_COLORS[player.level];
  const myAchievements = MOCK_ACHIEVEMENTS.filter(a => player.badges.includes(a.id));

  const handleDelete = () => {
    showAlert(
      `Delete ${player.name}?`,
      'This will permanently remove the player',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { deletePlayer(player.id); router.back(); } },
      ]
    );
  };

  const handleIDCard = () => {
    router.push({ pathname: '/player-id-card', params: { id: player.id } });
  };

  const handleCertificate = () => {
    router.push({ pathname: '/certificate', params: { id: player.id } });
  };

  const StatRow = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Hero */}
      <View style={[styles.hero, { borderBottomColor: levelColor + '66' }]}>
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => showAlert('Edit Player', 'Player editing coming soon')}>
            <MaterialIcons name="edit" size={18} color={Colors.info} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push({ pathname: '/add-points', params: { playerId: player.id } })}>
            <MaterialIcons name="star" size={18} color={Colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleIDCard}>
            <MaterialIcons name="badge" size={18} color={Colors.success} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCertificate}>
            <MaterialIcons name="workspace-premium" size={18} color={Colors.chart4} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
            <MaterialIcons name="delete" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>

        <View style={[styles.avatar, { borderColor: levelColor }]}>
          <Text style={styles.avatarText}>{player.name[0]}</Text>
        </View>
        <Text style={styles.playerName}>{player.name}</Text>
        <Text style={styles.playerRole}>{player.playingRole} · {player.battingStyle}</Text>
        <View style={[styles.levelBadge, { backgroundColor: levelColor + '22', borderColor: levelColor + '55' }]}>
          <Text style={[styles.levelText, { color: levelColor }]}>
            Level {player.level} — {LEVEL_NAMES[player.level]}
          </Text>
        </View>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{player.points.toLocaleString()}</Text>
            <Text style={styles.heroStatLabel}>Points</Text>
          </View>
          <View style={styles.heroStatDiv} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>#{player.rank}</Text>
            <Text style={styles.heroStatLabel}>Rank</Text>
          </View>
          <View style={styles.heroStatDiv} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{player.attendancePercentage}%</Text>
            <Text style={styles.heroStatLabel}>Attendance</Text>
          </View>
          <View style={styles.heroStatDiv} />
          <View style={styles.heroStat}>
            <View style={[styles.statusDot, { backgroundColor: player.isActive ? Colors.success : Colors.error }]} />
            <Text style={styles.heroStatLabel}>{player.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${(player.xp / player.nextLevelXp) * 100}%` as any, backgroundColor: levelColor }]} />
          </View>
          <Text style={styles.xpText}>{player.xp.toLocaleString()} / {player.nextLevelXp.toLocaleString()} XP</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['overview', 'batting', 'bowling', 'fitness'] as const).map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeTab === 'overview' && (
          <>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.card}>
              <StatRow label="Age" value={`${player.age} years`} />
              <StatRow label="Gender" value={player.gender} />
              <StatRow label="Phone" value={player.phone} />
              <StatRow label="Email" value={player.email} />
              <StatRow label="Address" value={player.address} />
              <StatRow label="Experience" value={player.experience} />
              <StatRow label="Bowling Style" value={player.bowlingStyle} />
              <StatRow label="Joined" value={new Date(player.joiningDate).toLocaleDateString('en-IN')} />
            </View>

            <Text style={styles.sectionTitle}>Achievements</Text>
            {myAchievements.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>No achievements yet</Text></View>
            ) : (
              <View style={styles.achRow}>
                {myAchievements.map(ach => (
                  <View key={ach.id} style={styles.achBadge}>
                    <Text style={styles.achIcon}>{ach.icon}</Text>
                    <Text style={styles.achName}>{ach.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'batting' && (
          <>
            <Text style={styles.sectionTitle}>Batting Statistics</Text>
            <View style={styles.card}>
              <StatRow label="Matches Played" value={player.batting.matches} />
              <StatRow label="Total Runs" value={player.batting.runs} />
              <StatRow label="Strike Rate" value={player.batting.strikeRate.toFixed(1)} />
              <StatRow label="Boundaries" value={player.batting.boundaries} />
              <StatRow label="Highest Score" value={player.batting.highestScore} />
              <StatRow label="Average" value={(player.batting.runs / Math.max(1, player.batting.matches)).toFixed(1)} />
            </View>
          </>
        )}

        {activeTab === 'bowling' && (
          <>
            <Text style={styles.sectionTitle}>Bowling Statistics</Text>
            <View style={styles.card}>
              <StatRow label="Overs Bowled" value={player.bowling.overs} />
              <StatRow label="Wickets Taken" value={player.bowling.wickets} />
              <StatRow label="Economy Rate" value={player.bowling.economyRate.toFixed(1)} />
              <StatRow label="Best Figures" value={player.bowling.bestFigures} />
            </View>
            <Text style={styles.sectionTitle}>Fielding Statistics</Text>
            <View style={styles.card}>
              <StatRow label="Catches" value={player.fielding.catches} />
              <StatRow label="Run Outs" value={player.fielding.runOuts} />
              <StatRow label="Fielding Points" value={player.fielding.fieldingPoints} />
            </View>
          </>
        )}

        {activeTab === 'fitness' && (
          <>
            <Text style={styles.sectionTitle}>Fitness Assessment</Text>
            <View style={styles.fitnessCard}>
              <Text style={styles.fitnessScore}>{player.fitness.fitnessScore}</Text>
              <Text style={styles.fitnessScoreLabel}>Overall Fitness Score</Text>
            </View>
            <View style={styles.card}>
              <StatRow label="Speed" value={`${player.fitness.speed}/100`} />
              <StatRow label="Strength" value={`${player.fitness.strength}/100`} />
              <StatRow label="Stamina" value={`${player.fitness.stamina}/100`} />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgDark },
  notFoundText: { color: Colors.textSecondary, fontSize: Typography.base },
  hero: {
    backgroundColor: Colors.bgCard, borderBottomWidth: 1,
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, alignItems: 'center',
  },
  heroActions: { flexDirection: 'row', gap: Spacing.sm, alignSelf: 'flex-end', marginBottom: Spacing.sm },
  actionBtn: {
    width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.bgSurface,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: 32, fontWeight: Typography.bold, color: Colors.textPrimary },
  playerName: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.textPrimary, marginBottom: 2 },
  playerRole: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  levelBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, marginBottom: Spacing.md },
  levelText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  heroStatLabel: { fontSize: 10, color: Colors.textSecondary },
  heroStatDiv: { width: 1, height: 28, backgroundColor: Colors.border },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  xpSection: { width: '100%' },
  xpBar: { height: 6, backgroundColor: Colors.bgSurface, borderRadius: 3, overflow: 'hidden', marginBottom: 3 },
  xpFill: { height: '100%', borderRadius: 3 },
  xpText: { fontSize: Typography.xs, color: Colors.textSecondary, textAlign: 'right' },
  tabRow: {
    flexDirection: 'row', gap: 3, backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: Radius.sm, backgroundColor: Colors.bgSurface },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 11, color: Colors.textSecondary, fontWeight: Typography.medium },
  tabTextActive: { color: Colors.textPrimary, fontWeight: Typography.bold },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.base },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.base, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.base },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border + '55' },
  statLabel: { fontSize: Typography.sm, color: Colors.textSecondary },
  statValue: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.semibold },
  achRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  achBadge: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.gold + '33', minWidth: 72,
  },
  achIcon: { fontSize: 22 },
  achName: { fontSize: 10, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  emptyCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.base, alignItems: 'center' },
  emptyText: { fontSize: Typography.sm, color: Colors.textSecondary },
  fitnessCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.xl,
    alignItems: 'center', marginBottom: Spacing.base, borderWidth: 1, borderColor: Colors.border,
  },
  fitnessScore: { fontSize: 56, fontWeight: Typography.extrabold, color: Colors.gold },
  fitnessScoreLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginTop: 4 },
});
