import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Player } from '@/types';

export default function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { players, attendance, markAttendance } = usePlayers();
  const { showAlert } = useAlert();
  const { Colors } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'mark' | 'history'>('mark');

  const C = Colors;
  const todayAttendance = attendance.filter(a => a.date === selectedDate);
  const getPlayerStatus = (playerId: string) => todayAttendance.find(a => a.playerId === playerId)?.status || null;

  const handleMark = (player: Player, status: 'present' | 'absent' | 'late') => {
    const existing = todayAttendance.find(a => a.playerId === player.id);
    if (existing) {
      showAlert('Already Marked', `${player.name} is already marked as ${existing.status} for today`);
      return;
    }
    markAttendance(player.id, selectedDate, status);
  };

  const activePlayers = players.filter(p => p.isActive);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const unmarkedCount = activePlayers.length - presentCount - absentCount - lateCount;

  const dateDisplay = new Date(selectedDate);
  const dayName = dateDisplay.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateStr = dateDisplay.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const STATUS_CONFIG = {
    present: { color: C.success, icon: 'check-circle', label: 'Present', bg: C.success + '15' },
    absent: { color: C.error, icon: 'cancel', label: 'Absent', bg: C.error + '15' },
    late: { color: C.warning, icon: 'access-time', label: 'Late', bg: C.warning + '15' },
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View>
          <Text style={[styles.title, { color: C.textPrimary }]}>Attendance</Text>
          <Text style={[styles.subtitle, { color: C.textSecondary }]}>{dayName}, {dateStr}</Text>
        </View>
        <View style={[styles.totalBadge, { backgroundColor: C.info + '18', borderColor: C.info + '44' }]}>
          <Text style={[styles.totalText, { color: C.info }]}>{activePlayers.length} Players</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {([
          { label: 'Present', count: presentCount, color: C.success, icon: 'check-circle' },
          { label: 'Absent', count: absentCount, color: C.error, icon: 'cancel' },
          { label: 'Late', count: lateCount, color: C.warning, icon: 'access-time' },
          { label: 'Unmarked', count: unmarkedCount, color: C.textMuted, icon: 'radio-button-unchecked' },
        ] as any[]).map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: C.bgCard, borderColor: C.border, borderTopColor: s.color }]}>
            <MaterialIcons name={s.icon} size={16} color={s.color} />
            <Text style={[styles.statCount, { color: s.count > 0 ? s.color : C.textMuted }]}>{s.count}</Text>
            <Text style={[styles.statLabel, { color: C.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tabWrap, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <TouchableOpacity
          style={[styles.tab, view === 'mark' && { backgroundColor: C.primary }]}
          onPress={() => setView('mark')}
        >
          <MaterialIcons name="assignment" size={14} color={view === 'mark' ? C.textPrimary : C.textMuted} />
          <Text style={[styles.tabText, { color: view === 'mark' ? C.textPrimary : C.textSecondary }, view === 'mark' && { fontWeight: Typography.bold }]}>Mark Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, view === 'history' && { backgroundColor: C.primary }]}
          onPress={() => setView('history')}
        >
          <MaterialIcons name="history" size={14} color={view === 'history' ? C.textPrimary : C.textMuted} />
          <Text style={[styles.tabText, { color: view === 'history' ? C.textPrimary : C.textSecondary }, view === 'history' && { fontWeight: Typography.bold }]}>History</Text>
        </TouchableOpacity>
      </View>

      {view === 'mark' ? (
        <FlatList
          data={activePlayers}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const status = getPlayerStatus(item.id);
            const cfg = status ? (STATUS_CONFIG as any)[status] : null;
            return (
              <View style={[styles.attRow, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                <View style={[styles.attAvatar, { backgroundColor: C.primary, borderColor: C.primaryLight + '44' }]}>
                  <Text style={[styles.attAvatarText, { color: C.textPrimary }]}>{item.name[0]}</Text>
                </View>
                <View style={styles.attInfo}>
                  <Text style={[styles.attName, { color: C.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.attRole, { color: C.textSecondary }]}>{item.playingRole}</Text>
                </View>
                {status && cfg ? (
                  <View style={[styles.markedBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
                    <MaterialIcons name={cfg.icon} size={13} color={cfg.color} />
                    <Text style={[styles.markedText, { color: cfg.color }]}>{status.toUpperCase()}</Text>
                  </View>
                ) : (
                  <View style={styles.markBtns}>
                    <TouchableOpacity style={[styles.markBtn, { backgroundColor: C.success + '22', borderColor: C.success + '44' }]} onPress={() => handleMark(item, 'present')}>
                      <MaterialIcons name="check" size={14} color={C.success} />
                      <Text style={[styles.markBtnLabel, { color: C.success }]}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.markBtn, { backgroundColor: C.warning + '22', borderColor: C.warning + '44' }]} onPress={() => handleMark(item, 'late')}>
                      <MaterialIcons name="access-time" size={14} color={C.warning} />
                      <Text style={[styles.markBtnLabel, { color: C.warning }]}>L</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.markBtn, { backgroundColor: C.error + '22', borderColor: C.error + '44' }]} onPress={() => handleMark(item, 'absent')}>
                      <MaterialIcons name="close" size={14} color={C.error} />
                      <Text style={[styles.markBtnLabel, { color: C.error }]}>A</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={[styles.histTitle, { color: C.textPrimary }]}>Attendance Summary</Text>
          {players.map(player => {
            const playerAtt = attendance.filter(a => a.playerId === player.id);
            const presentDays = playerAtt.filter(a => a.status === 'present').length;
            const totalDays = playerAtt.length;
            const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
            const color = pct >= 80 ? C.success : pct >= 60 ? C.warning : C.error;
            return (
              <View key={player.id} style={[styles.histRow, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                <View style={[styles.attAvatar, { backgroundColor: C.primary, borderColor: C.primaryLight + '44' }]}>
                  <Text style={[styles.attAvatarText, { color: C.textPrimary }]}>{player.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.histNameRow}>
                    <Text style={[styles.histName, { color: C.textPrimary }]}>{player.name}</Text>
                    <Text style={[styles.histPct, { color }]}>{pct}%</Text>
                  </View>
                  <Text style={[styles.histDays, { color: C.textSecondary }]}>{presentDays} of {totalDays} sessions</Text>
                  <View style={[styles.histBar, { backgroundColor: C.bgSurface }]}>
                    <View style={[styles.histBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
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
  totalBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 5 },
  totalText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  statCard: {
    flex: 1, borderRadius: Radius.md, padding: Spacing.sm, borderTopWidth: 2,
    alignItems: 'center', gap: 3, borderWidth: 1,
  },
  statCount: { fontSize: Typography.lg, fontWeight: Typography.extrabold },
  statLabel: { fontSize: 10 },
  tabWrap: {
    flexDirection: 'row', marginHorizontal: Spacing.base, marginBottom: Spacing.md,
    borderRadius: Radius.md, padding: 3, borderWidth: 1,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: Radius.sm,
  },
  tabText: { fontSize: Typography.sm, fontWeight: Typography.medium },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 20 },
  attRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1,
  },
  attAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  attAvatarText: { fontSize: Typography.base, fontWeight: Typography.bold },
  attInfo: { flex: 1 },
  attName: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  attRole: { fontSize: Typography.xs, marginTop: 1 },
  markBtns: { flexDirection: 'row', gap: 5 },
  markBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, gap: 1,
  },
  markBtnLabel: { fontSize: 9, fontWeight: Typography.extrabold },
  markedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1,
  },
  markedText: { fontSize: 11, fontWeight: Typography.bold },
  histTitle: { fontSize: Typography.base, fontWeight: Typography.bold, marginBottom: Spacing.md },
  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1,
  },
  histNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  histName: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  histPct: { fontSize: Typography.sm, fontWeight: Typography.bold },
  histDays: { fontSize: Typography.xs, marginBottom: 6 },
  histBar: { height: 5, borderRadius: 3, overflow: 'hidden' },
  histBarFill: { height: 5, borderRadius: 3 },
});
