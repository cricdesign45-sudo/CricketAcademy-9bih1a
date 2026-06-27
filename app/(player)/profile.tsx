import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { MOCK_ACHIEVEMENTS } from '@/constants/mockData';

const INFO_ICONS: Record<string, any> = {
  'Age': 'cake',
  'Gender': 'person',
  'Phone': 'phone',
  'Email': 'email',
  'Address': 'place',
  'Joined': 'calendar-today',
  'Playing Role': 'sports-cricket',
  'Batting Style': 'adjust',
  'Bowling Style': 'air',
  'Experience': 'timeline',
};

export default function PlayerProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { players } = usePlayers();
  const { Colors } = useTheme();
  const C = Colors;

  const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];
  const LEVEL_COLORS = ['', C.level1, C.level2, C.level3, C.level4, C.level5];

  const player = players.find(p => p.id === user?.playerId) || players[0];
  if (!player) return null;

  const levelColor = LEVEL_COLORS[player.level];
  const xpPct = (player.xp / player.nextLevelXp) * 100;
  const myAchievements = MOCK_ACHIEVEMENTS.filter(a => player.badges.includes(a.id));

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={[s.infoRow, { borderBottomColor: C.border + '66' }]}>
      <View style={s.infoLabelRow}>
        <MaterialIcons name={INFO_ICONS[label] || 'info'} size={14} color={C.textMuted} />
        <Text style={[s.infoLabel, { color: C.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[s.infoValue, { color: C.textPrimary }]} numberOfLines={2}>{value}</Text>
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* Profile Header */}
        <View style={[s.profileHeader, { borderBottomColor: C.border }]}>
          <View style={[s.profileBgCircle1, { borderColor: levelColor + '22' }]} />
          <View style={[s.profileBgCircle2, { borderColor: C.gold + '18' }]} />

          <View style={[s.avatarRing3, { borderColor: levelColor + '33' }]}>
            <View style={[s.avatarRing2, { borderColor: levelColor + '66' }]}>
              <View style={[s.avatar, { backgroundColor: levelColor + '22', borderColor: levelColor }]}>
                <Text style={[s.avatarText, { color: C.textPrimary }]}>{player.name[0]}</Text>
              </View>
            </View>
          </View>

          <Text style={[s.playerName, { color: C.textPrimary }]}>{player.name}</Text>
          <Text style={[s.playerRole, { color: C.textSecondary }]}>{player.playingRole} · {player.battingStyle}</Text>

          <View style={[s.levelBadge, { backgroundColor: levelColor + '1A', borderColor: levelColor + '55' }]}>
            <Text style={[s.levelBadgeText, { color: levelColor }]}>
              Level {player.level} · {LEVEL_NAMES[player.level]}
            </Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: C.textPrimary }]}>{player.points.toLocaleString()}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>Points</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: C.textPrimary }]}>#{player.rank}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>Rank</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: C.textPrimary }]}>{player.attendancePercentage}%</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>Attendance</Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: C.border }]} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: C.textPrimary }]}>{myAchievements.length}</Text>
              <Text style={[s.statLabel, { color: C.textSecondary }]}>Badges</Text>
            </View>
          </View>
        </View>

        {/* XP Progress */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <MaterialIcons name="auto-awesome" size={16} color={levelColor} />
            <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Level Progress</Text>
          </View>
          <View style={[s.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <View style={[s.xpLevels, { padding: Spacing.base, paddingBottom: 0 }]}>
              <Text style={[s.xpLevel, { color: levelColor }]}>Level {player.level}</Text>
              <Text style={[s.xpValue, { color: C.textMuted }]}>{player.xp.toLocaleString()} / {player.nextLevelXp.toLocaleString()} XP</Text>
              <Text style={[s.xpLevel, { color: C.textSecondary }]}>Level {player.level + 1}</Text>
            </View>
            <View style={{ paddingHorizontal: Spacing.base, paddingBottom: Spacing.md }}>
              <View style={[s.xpBarBg, { backgroundColor: C.bgSurface }]}>
                <View style={[s.xpBarFill, { width: `${xpPct}%` as any, backgroundColor: levelColor }]} />
              </View>
              <Text style={[s.xpRemaining, { color: C.textMuted }]}>
                {(player.nextLevelXp - player.xp).toLocaleString()} XP remaining to next level
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Info */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <MaterialIcons name="person" size={16} color={C.info} />
            <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Personal Information</Text>
          </View>
          <View style={[s.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <InfoRow label="Age" value={`${player.age} years old`} />
            <InfoRow label="Gender" value={player.gender} />
            <InfoRow label="Phone" value={player.phone} />
            <InfoRow label="Email" value={player.email} />
            <InfoRow label="Address" value={player.address} />
            <InfoRow label="Joined" value={new Date(player.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
          </View>
        </View>

        {/* Cricket Profile */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <MaterialIcons name="sports-cricket" size={16} color={C.gold} />
            <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Cricket Profile</Text>
          </View>
          <View style={[s.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <InfoRow label="Playing Role" value={player.playingRole} />
            <InfoRow label="Batting Style" value={player.battingStyle} />
            <InfoRow label="Bowling Style" value={player.bowlingStyle} />
            <InfoRow label="Experience" value={player.experience} />
          </View>
        </View>

        {/* Achievements */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <MaterialIcons name="military-tech" size={16} color={C.chart4} />
            <Text style={[s.sectionTitle, { color: C.textPrimary }]}>Achievements ({myAchievements.length}/{MOCK_ACHIEVEMENTS.length})</Text>
          </View>
          <View style={s.badgesGrid}>
            {MOCK_ACHIEVEMENTS.map(ach => {
              const unlocked = player.badges.includes(ach.id);
              return (
                <View key={ach.id} style={[s.achCard, { backgroundColor: C.bgCard, borderColor: unlocked ? C.gold + '33' : C.border }, !unlocked && { backgroundColor: C.bgCardAlt }]}>
                  <Text style={[s.achIcon, !unlocked && { opacity: 0.3 }]}>{ach.icon}</Text>
                  <Text style={[s.achName, { color: unlocked ? C.textPrimary : C.textMuted }]}>{ach.name}</Text>
                  {unlocked ? (
                    <View style={s.achUnlockedBadge}>
                      <MaterialIcons name="check" size={9} color={C.success} />
                      <Text style={[s.achUnlockedText, { color: C.success }]}>Unlocked</Text>
                    </View>
                  ) : (
                    <Text style={[s.achLocked, { color: C.textMuted }]}>Locked</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={[s.logoutBtn, { backgroundColor: C.error + '14', borderColor: C.error + '44' }]} onPress={logout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={18} color={C.error} />
          <Text style={[s.logoutText, { color: C.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  profileHeader: {
    alignItems: 'center', paddingVertical: Spacing.xl,
    borderBottomWidth: 1, marginBottom: Spacing.xl, position: 'relative', overflow: 'hidden',
  },
  profileBgCircle1: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, borderWidth: 1 },
  profileBgCircle2: { position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: 100, borderWidth: 1 },
  avatarRing3: { width: 110, height: 110, borderRadius: 55, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarRing2: { width: 96, height: 96, borderRadius: 48, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5 },
  avatarText: { fontSize: 36, fontWeight: Typography.extrabold },
  playerName: { fontSize: Typography.xl, fontWeight: Typography.extrabold, marginBottom: 2 },
  playerRole: { fontSize: Typography.sm, marginBottom: Spacing.sm },
  levelBadge: { paddingHorizontal: Spacing.md, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, marginBottom: Spacing.xl },
  levelBadgeText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: Typography.lg, fontWeight: Typography.extrabold },
  statLabel: { fontSize: Typography.xs },
  statDivider: { width: 1, height: 36 },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold },
  card: { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: Spacing.base, borderBottomWidth: 1,
  },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  infoLabel: { fontSize: Typography.sm },
  infoValue: { fontSize: Typography.sm, fontWeight: Typography.medium, flex: 1.2, textAlign: 'right' },
  xpLevels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpLevel: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  xpValue: { fontSize: Typography.xs, textAlign: 'center', flex: 1 },
  xpBarBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: '100%', borderRadius: 5 },
  xpRemaining: { fontSize: Typography.xs, textAlign: 'center' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  achCard: { borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 1, minWidth: 90, gap: 4, flex: 1 },
  achIcon: { fontSize: 26 },
  achName: { fontSize: 10, fontWeight: Typography.semibold, textAlign: 'center' },
  achUnlockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  achUnlockedText: { fontSize: 9, fontWeight: Typography.semibold },
  achLocked: { fontSize: 9 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.lg, paddingVertical: 16, borderWidth: 1 },
  logoutText: { fontSize: Typography.base, fontWeight: Typography.semibold },
});
