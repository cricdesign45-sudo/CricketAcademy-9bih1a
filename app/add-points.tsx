import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { PointsEntry } from '@/types';
import {
  ATTENDANCE_POINTS, ATTENDANCE_BONUSES, TRAINING_POINTS,
  DISCIPLINE_POINTS, PENALTY_POINTS, ACHIEVEMENT_BONUS_POINTS,
} from '@/constants/mockData';

const RULE_GROUPS = [
  { label: 'Attendance', color: Colors.info, rules: ATTENDANCE_POINTS },
  { label: 'Attendance Bonuses', color: Colors.success, rules: ATTENDANCE_BONUSES },
  { label: 'Training Performance', color: Colors.gold, rules: TRAINING_POINTS },
  { label: 'Discipline', color: Colors.chart4, rules: DISCIPLINE_POINTS },
  { label: 'Penalties', color: Colors.error, rules: PENALTY_POINTS },
  { label: 'Achievement Awards', color: Colors.chart3, rules: ACHIEVEMENT_BONUS_POINTS },
];

export default function AddPointsScreen() {
  const { playerId: paramPlayerId } = useLocalSearchParams<{ playerId?: string }>();
  const insets = useSafeAreaInsets();
  const { players, addPoints, pointsHistory } = usePlayers();
  const { showAlert } = useAlert();

  const [selectedPlayer, setSelectedPlayer] = useState(paramPlayerId || '');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState<PointsEntry['category']>('performance');
  const [subCategory, setSubCategory] = useState('');
  const [tab, setTab] = useState<'add' | 'rules' | 'history'>('add');
  const [openGroup, setOpenGroup] = useState<string | null>('Training Performance');

  const handleAdd = () => {
    if (!selectedPlayer) { showAlert('Select Player', 'Please select a player'); return; }
    const pts = parseInt(points);
    if (isNaN(pts)) { showAlert('Invalid Points', 'Enter a valid number'); return; }
    if (!reason.trim()) { showAlert('Add Reason', 'Please enter a reason for the points'); return; }
    const player = players.find(p => p.id === selectedPlayer);
    addPoints(selectedPlayer, pts, reason, category, subCategory || undefined);
    showAlert(pts >= 0 ? 'Points Awarded!' : 'Penalty Applied', `${pts} points for ${player?.name}`, [
      { text: 'OK', onPress: () => { setPoints(''); setReason(''); setSubCategory(''); } },
    ]);
  };

  const applyRule = (label: string, pts: number, cat: string, sub?: string) => {
    setReason(label);
    setPoints(pts.toString());
    setCategory(cat as PointsEntry['category']);
    setSubCategory(sub || '');
    setTab('add');
  };

  const recentHistory = [...pointsHistory].reverse().slice(0, 30);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.tabs}>
        {([
          { key: 'add', label: 'Award Points' },
          { key: 'rules', label: 'Point Rules' },
          { key: 'history', label: 'History' },
        ] as const).map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'add' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Select Player</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.base }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {players.filter(p => p.isActive).map(p => (
                <TouchableOpacity key={p.id} style={[styles.playerChip, selectedPlayer === p.id && styles.playerChipActive]} onPress={() => setSelectedPlayer(p.id)}>
                  <View style={[styles.playerAvatar, selectedPlayer === p.id && { backgroundColor: Colors.gold + '33' }]}>
                    <Text style={styles.playerAvatarText}>{p.name[0]}</Text>
                  </View>
                  <Text style={[styles.playerChipName, selectedPlayer === p.id && { color: Colors.gold }]}>{p.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Points Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Points Amount (use negative for penalty)</Text>
            <TextInput
              style={styles.input} value={points} onChangeText={setPoints}
              placeholder="e.g. 50 or -20" placeholderTextColor={Colors.textMuted} keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reason</Text>
            <TextInput
              style={styles.input} value={reason} onChangeText={setReason}
              placeholder="Reason for awarding points" placeholderTextColor={Colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
              {(['performance', 'attendance', 'discipline', 'bonus', 'training', 'achievement', 'penalty'] as const).map(c => (
                <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.hintBox, { backgroundColor: Colors.info + '0E', borderColor: Colors.info + '33' }]}>
            <MaterialIcons name="lightbulb" size={14} color={Colors.info} />
            <Text style={[styles.hintText, { color: Colors.info }]}>Use Point Rules tab to browse and apply predefined rules.</Text>
          </View>

          <TouchableOpacity style={styles.awardBtn} onPress={handleAdd} activeOpacity={0.8}>
            <MaterialIcons name="star" size={18} color={Colors.textInverse} />
            <Text style={styles.awardBtnText}>Award Points</Text>
          </TouchableOpacity>
          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      )}

      {tab === 'rules' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {RULE_GROUPS.map(group => (
            <View key={group.label} style={[styles.ruleGroup, { borderColor: group.color + '44' }]}>
              <TouchableOpacity style={[styles.ruleGroupHeader, { backgroundColor: group.color + '12' }]} onPress={() => setOpenGroup(openGroup === group.label ? null : group.label)} activeOpacity={0.8}>
                <View style={[styles.ruleGroupDot, { backgroundColor: group.color }]} />
                <Text style={[styles.ruleGroupLabel, { color: group.color }]}>{group.label}</Text>
                <Text style={[styles.ruleCount, { color: group.color }]}>{group.rules.length} rules</Text>
                <MaterialIcons name={openGroup === group.label ? 'expand-less' : 'expand-more'} size={18} color={group.color} />
              </TouchableOpacity>
              {openGroup === group.label && group.rules.map((rule, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.ruleRow, { borderTopColor: Colors.border }]}
                  onPress={() => applyRule(rule.label, rule.points, rule.category, rule.subCategory)}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleLabel}>{rule.label}</Text>
                    <Text style={styles.ruleCat}>{rule.category}{rule.subCategory ? ` · ${rule.subCategory}` : ''}</Text>
                  </View>
                  <View style={[styles.rulePts, { backgroundColor: rule.points >= 0 ? Colors.success + '1A' : Colors.error + '1A' }]}>
                    <Text style={[styles.rulePtsText, { color: rule.points >= 0 ? Colors.success : Colors.error }]}>
                      {rule.points >= 0 ? '+' : ''}{rule.points}
                    </Text>
                  </View>
                  <View style={[styles.applyBtn, { backgroundColor: group.color + '18', borderColor: group.color + '44' }]}>
                    <Text style={[styles.applyBtnText, { color: group.color }]}>Apply</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {tab === 'history' && (
        <FlatList
          data={recentHistory}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const player = players.find(p => p.id === item.playerId);
            return (
              <View style={styles.historyRow}>
                <View style={[styles.historyIcon, { backgroundColor: item.points > 0 ? Colors.success + '22' : Colors.error + '22' }]}>
                  <MaterialIcons name={item.points > 0 ? 'star' : 'remove-circle'} size={16} color={item.points > 0 ? Colors.success : Colors.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyPlayer}>{player?.name || 'Unknown'}</Text>
                  <Text style={styles.historyReason}>{item.reason}</Text>
                  <Text style={styles.historyMeta}>{item.date} · {item.category}{item.subCategory ? ` · ${item.subCategory}` : ''}</Text>
                </View>
                <Text style={[styles.historyPoints, { color: item.points > 0 ? Colors.success : Colors.error }]}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  tabs: { flexDirection: 'row', gap: 3, marginHorizontal: Spacing.base, marginTop: Spacing.sm, marginBottom: Spacing.base, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: 3 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  tabTextActive: { color: Colors.textPrimary, fontWeight: Typography.bold },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 20 },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  playerChip: { alignItems: 'center', gap: 4, padding: 8, borderRadius: Radius.md, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, minWidth: 70 },
  playerChipActive: { borderColor: Colors.gold, backgroundColor: Colors.gold + '11' },
  playerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  playerAvatarText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  playerChipName: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  inputGroup: { marginBottom: Spacing.base },
  inputLabel: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, color: Colors.textPrimary, fontSize: Typography.base },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryLight },
  catChipText: { fontSize: Typography.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  catChipTextActive: { color: Colors.textPrimary, fontWeight: Typography.semibold },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.base },
  hintText: { fontSize: Typography.xs, flex: 1 },
  awardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.gold, borderRadius: Radius.md, paddingVertical: 16, marginTop: Spacing.sm },
  awardBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textInverse },
  ruleGroup: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.md },
  ruleGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  ruleGroupDot: { width: 10, height: 10, borderRadius: 5 },
  ruleGroupLabel: { flex: 1, fontSize: Typography.sm, fontWeight: Typography.bold },
  ruleCount: { fontSize: Typography.xs, fontWeight: Typography.medium },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderTopWidth: 1, backgroundColor: Colors.bgCard },
  ruleLabel: { fontSize: Typography.sm, color: Colors.textPrimary, fontWeight: Typography.medium },
  ruleCat: { fontSize: Typography.xs, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  rulePts: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  rulePtsText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  applyBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  applyBtnText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  historyPlayer: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textPrimary },
  historyReason: { fontSize: Typography.xs, color: Colors.textSecondary },
  historyMeta: { fontSize: Typography.xs, color: Colors.textMuted, textTransform: 'capitalize' },
  historyPoints: { fontSize: Typography.base, fontWeight: Typography.bold },
});
