import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Fast Bowler', 'Spin Bowler'];
const BATTING = ['Right-handed', 'Left-handed'];
const BOWLING = ['Right-arm fast', 'Right-arm medium', 'Right-arm off-spin', 'Left-arm fast', 'Left-arm spin', 'N/A'];

export default function AddPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPlayer } = usePlayers();
  const { registerPlayerCredentials } = useAuth();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male', phone: '', email: '', address: '',
    playingRole: 'Batsman', battingStyle: 'Right-handed', bowlingStyle: 'Right-arm medium',
    experience: '', joiningDate: new Date().toISOString().split('T')[0],
    password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) {
      showAlert('Missing Fields', 'Name and email are required');
      return;
    }
    if (!form.password.trim() || form.password.length < 6) {
      showAlert('Weak Password', 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match');
      return;
    }
    const playerId = `p${Date.now()}`;
    addPlayer({
      ...form,
      _presetId: playerId,
      age: parseInt(form.age) || 18,
      profilePhoto: null,
      isActive: true,
      attendancePercentage: 0,
      batch: 'A',
      ageGroup: 'Under-19',
      coachName: 'Coach',
      batting: { matches: 0, runs: 0, strikeRate: 0, boundaries: 0, highestScore: 0, average: 0 },
      bowling: { overs: 0, wickets: 0, economyRate: 0, bestFigures: '0/0', average: 0 },
      fielding: { catches: 0, runOuts: 0, fieldingPoints: 0, stumpings: 0 },
      fitness: { speed: 70, strength: 70, stamina: 70, fitnessScore: 70 },
      skillScores: {
        batting: { technique: 5, footwork: 5, shotSelection: 5, coverDrive: 5, straightDrive: 5, pullShot: 5, cutShot: 5, sweepShot: 5, frontFootPlay: 5, backFootPlay: 5, strikeRotation: 5, runsBetweenWickets: 5, boundaryPercentage: 5, dotBallPercentage: 5, batSpeed: 5, matchTemperament: 5, powerHitting: 5, defensiveSkills: 5, spinPlaying: 5, pacePlaying: 5, consistency: 5 },
        bowling: { action: 5, runUp: 5, seamPosition: 5, swing: 5, reverseSwing: 5, yorkerAccuracy: 5, bouncerAccuracy: 5, line: 5, length: 5, pace: 5, variation: 5, spinControl: 5, flight: 5, drift: 5, turn: 5, economy: 5, wicketTaking: 5, deathBowling: 5, powerplayBowling: 5, matchConsistency: 5 },
        wicketkeeping: { glovesTechnique: 5, standingUp: 5, standingBack: 5, catching: 5, diving: 5, reflexes: 5, stumping: 5, throwAccuracy: 5, runOutSuccess: 5, footwork: 5, communication: 5, decisionMaking: 5, fitnessAgility: 5, matchAwareness: 5, leadership: 5 },
        allRounder: { adaptability: 5, matchAwareness: 5, pressureHandling: 5, teamContribution: 5, leadership: 5, fitness: 5, runsBetweenWickets: 5, fielding: 5, consistency: 5, matchImpact: 5 },
      },
      coachEvaluation: { discipline: 7, attitude: 7, teamwork: 7, hardWork: 7, learningAbility: 7, communication: 7, leadership: 6, confidence: 7, mentalStrength: 6, matchAwareness: 6, overallRating: 7, remarks: 'New player', evaluatedAt: new Date().toISOString().split('T')[0] },
    } as any);
    registerPlayerCredentials(playerId, form.name.trim(), form.email.trim(), form.password);
    showAlert('Player Added!', `${form.name} can now log in with their email and password`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={[styles.container, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Field label="Full Name *" value={form.name} onChange={v => update('name', v)} placeholder="Player full name" />
        <Field label="Email * (used for login)" value={form.email} onChange={v => update('email', v)} placeholder="player@academy.com" keyboardType="email-address" />
        <Field label="Phone" value={form.phone} onChange={v => update('phone', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
        <Field label="Age" value={form.age} onChange={v => update('age', v)} placeholder="Age in years" keyboardType="numeric" />
        <Field label="Address" value={form.address} onChange={v => update('address', v)} placeholder="City, State" />
        <Field label="Experience" value={form.experience} onChange={v => update('experience', v)} placeholder="e.g. 2 years" />

        {/* Login Credentials Section */}
        <View style={styles.credSection}>
          <View style={styles.credHeader}>
            <MaterialIcons name="lock" size={16} color={Colors.primary} />
            <Text style={styles.credTitle}>Login Credentials</Text>
          </View>
          <Text style={styles.credSubtitle}>Player will use these to access their dashboard</Text>

          <View style={fs.group}>
            <Text style={fs.label}>Password * (min. 6 characters)</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={[fs.input, styles.passwordInput]}
                value={form.password}
                onChangeText={v => update('password', v)}
                placeholder="Set login password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={fs.group}>
            <Text style={fs.label}>Confirm Password *</Text>
            <View style={styles.passwordBox}>
              <TextInput
                style={[fs.input, styles.passwordInput]}
                value={form.confirmPassword}
                onChangeText={v => update('confirmPassword', v)}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name={showConfirm ? 'visibility-off' : 'visibility'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
              <View style={styles.mismatchRow}>
                <MaterialIcons name="error-outline" size={13} color={Colors.error} />
                <Text style={styles.mismatchText}>Passwords do not match</Text>
              </View>
            )}
            {form.confirmPassword.length > 0 && form.password === form.confirmPassword && form.password.length >= 6 && (
              <View style={styles.matchRow}>
                <MaterialIcons name="check-circle" size={13} color={Colors.success} />
                <Text style={styles.matchText}>Passwords match</Text>
              </View>
            )}
          </View>
        </View>

        <SelectField label="Gender" value={form.gender} options={['Male', 'Female', 'Other']} onChange={v => update('gender', v)} />
        <SelectField label="Playing Role" value={form.playingRole} options={ROLES} onChange={v => update('playingRole', v)} />
        <SelectField label="Batting Style" value={form.battingStyle} options={BATTING} onChange={v => update('battingStyle', v)} />
        <SelectField label="Bowling Style" value={form.bowlingStyle} options={BOWLING} onChange={v => update('bowlingStyle', v)} />

        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>Add Player to Academy</Text>
        </TouchableOpacity>
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType }: any) {
  return (
    <View style={fs.group}>
      <Text style={fs.label}>{label}</Text>
      <TextInput style={fs.input} value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={Colors.textMuted} keyboardType={keyboardType || 'default'} autoCapitalize="none" />
    </View>
  );
}
function SelectField({ label, value, options, onChange }: any) {
  return (
    <View style={fs.group}>
      <Text style={fs.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {options.map((o: string) => (
            <TouchableOpacity key={o} style={[fs.chip, value === o && fs.chipActive]} onPress={() => onChange(o)}>
              <Text style={[fs.chipText, value === o && fs.chipTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const fs = StyleSheet.create({
  group: { marginBottom: Spacing.base },
  label: { fontSize: Typography.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: Typography.medium },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.base, paddingVertical: 14, color: Colors.textPrimary, fontSize: Typography.base },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryLight },
  chipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipTextActive: { color: Colors.textPrimary },
});
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  credSection: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.primary + '33',
    padding: Spacing.base, marginBottom: Spacing.xl,
  },
  credHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  credTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  credSubtitle: { fontSize: Typography.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  passwordBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingRight: Spacing.sm,
  },
  passwordInput: { flex: 1, borderWidth: 0, marginBottom: 0 },
  eyeBtn: { padding: Spacing.sm },
  mismatchRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  mismatchText: { fontSize: Typography.xs, color: Colors.error },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  matchText: { fontSize: Typography.xs, color: Colors.success },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.primaryLight, marginTop: Spacing.sm },
  addBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
});
