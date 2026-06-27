import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const PLAYING_ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Fast Bowler', 'Spin Bowler'];
const BATTING_STYLES = ['Right-handed', 'Left-handed'];
const BOWLING_STYLES = ['Right-arm fast', 'Right-arm medium', 'Right-arm off-spin', 'Left-arm fast', 'Left-arm spin', 'N/A'];

const ROLE_ICONS: Record<string, any> = {
  'Batsman': 'sports-cricket',
  'Bowler': 'air',
  'All-rounder': 'star',
  'Wicket-keeper': 'sports',
  'Fast Bowler': 'bolt',
  'Spin Bowler': 'refresh',
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();
  const { showAlert } = useAlert();
  const [step, setStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', phone: '', playingRole: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm medium',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        showAlert('Missing Fields', 'Please fill all required fields');
        return;
      }
      if (form.password !== form.confirmPassword) {
        showAlert('Password Mismatch', 'Passwords do not match');
        return;
      }
      setStep(2);
    }
  };

  const handleRegister = async () => {
    const result = await register(form);
    if (result.success) {
      showAlert('Registration Successful!', 'Your account is under review. Admin will activate it soon.', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } else {
      showAlert('Error', result.error || 'Registration failed');
    }
  };

  const InputField = ({ icon, label, value, onChange, placeholder, secure, keyboardType, fieldKey }: any) => (
    <View style={reg.fieldGroup}>
      <Text style={reg.label}>{label}</Text>
      <View style={[reg.inputWrap, focusedField === fieldKey && reg.inputFocused]}>
        <MaterialIcons
          name={icon}
          size={16}
          color={focusedField === fieldKey ? Colors.primaryLight : Colors.textMuted}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={reg.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[reg.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={reg.header}>
          <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={reg.backBtn}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={reg.headerTitle}>Player Registration</Text>
            <Text style={reg.headerSub}>Step {step} of 2</Text>
          </View>
          <View style={reg.stepIndicator}>
            <View style={[reg.stepDot, step >= 1 && reg.stepDotDone]} />
            <View style={[reg.stepDot, step >= 2 && reg.stepDotDone]} />
          </View>
        </View>

        {/* Progress bar */}
        <View style={reg.progressBg}>
          <View style={[reg.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={reg.content}>
          {step === 1 ? (
            <>
              <View style={reg.stepIntro}>
                <View style={[reg.stepIcon, { backgroundColor: Colors.primary + '22', borderColor: Colors.primary + '44' }]}>
                  <MaterialIcons name="person" size={24} color={Colors.primary} />
                </View>
                <View>
                  <Text style={reg.stepTitle}>Account Details</Text>
                  <Text style={reg.stepSub}>Create your login credentials</Text>
                </View>
              </View>

              <InputField icon="person-outline" label="Full Name *" value={form.name} onChange={(v: string) => update('name', v)} placeholder="Enter your full name" fieldKey="name" />
              <InputField icon="email" label="Email Address *" value={form.email} onChange={(v: string) => update('email', v)} placeholder="your@email.com" keyboardType="email-address" fieldKey="email" />
              <InputField icon="lock-outline" label="Password *" value={form.password} onChange={(v: string) => update('password', v)} placeholder="Minimum 6 characters" secure fieldKey="pass1" />
              <InputField icon="lock" label="Confirm Password *" value={form.confirmPassword} onChange={(v: string) => update('confirmPassword', v)} placeholder="Re-enter password" secure fieldKey="pass2" />
              <InputField icon="phone" label="Phone Number" value={form.phone} onChange={(v: string) => update('phone', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" fieldKey="phone" />
              <InputField icon="cake" label="Age" value={form.age} onChange={(v: string) => update('age', v)} placeholder="Your age" keyboardType="numeric" fieldKey="age" />

              <TouchableOpacity style={reg.cta} onPress={handleNext}>
                <Text style={reg.ctaText}>Continue to Cricket Profile</Text>
                <MaterialIcons name="arrow-forward" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={reg.stepIntro}>
                <View style={[reg.stepIcon, { backgroundColor: Colors.gold + '22', borderColor: Colors.gold + '44' }]}>
                  <MaterialIcons name="sports-cricket" size={24} color={Colors.gold} />
                </View>
                <View>
                  <Text style={reg.stepTitle}>Cricket Profile</Text>
                  <Text style={reg.stepSub}>Tell us about your playing style</Text>
                </View>
              </View>

              <Text style={reg.sectionLabel}>Playing Role</Text>
              <View style={reg.roleGrid}>
                {PLAYING_ROLES.map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[reg.roleCard, form.playingRole === role && reg.roleCardActive]}
                    onPress={() => update('playingRole', role)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={ROLE_ICONS[role] || 'sports-cricket'}
                      size={18}
                      color={form.playingRole === role ? Colors.primaryLight : Colors.textMuted}
                    />
                    <Text style={[reg.roleLabel, form.playingRole === role && reg.roleLabelActive]}>{role}</Text>
                    {form.playingRole === role && (
                      <View style={reg.roleCheckDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[reg.sectionLabel, { marginTop: Spacing.base }]}>Batting Style</Text>
              <View style={reg.styleRow}>
                {BATTING_STYLES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[reg.styleBtn, form.battingStyle === s && reg.styleBtnActive]}
                    onPress={() => update('battingStyle', s)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="sports-cricket" size={14} color={form.battingStyle === s ? Colors.textPrimary : Colors.textMuted} />
                    <Text style={[reg.styleBtnText, form.battingStyle === s && { color: Colors.textPrimary, fontWeight: Typography.bold }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[reg.sectionLabel, { marginTop: Spacing.base }]}>Bowling Style</Text>
              <View style={reg.chipRow}>
                {BOWLING_STYLES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[reg.chip, form.bowlingStyle === s && reg.chipActive]}
                    onPress={() => update('bowlingStyle', s)}
                    activeOpacity={0.8}
                  >
                    <Text style={[reg.chipText, form.bowlingStyle === s && reg.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={reg.cta} onPress={handleRegister} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={Colors.textPrimary} />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={18} color={Colors.textPrimary} />
                    <Text style={reg.ctaText}>Submit Registration</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
          <View style={{ height: insets.bottom + 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const reg = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs, marginRight: 4 },
  headerTitle: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  headerSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  stepIndicator: { flexDirection: 'row', gap: 5 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  stepDotDone: { backgroundColor: Colors.primary, width: 20, borderRadius: 4 },
  progressBg: { height: 3, backgroundColor: Colors.bgSurface },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.xl },
  stepIntro: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  stepIcon: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  stepTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  stepSub: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  fieldGroup: { marginBottom: Spacing.base },
  label: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  sectionLabel: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, paddingLeft: Spacing.md,
  },
  inputFocused: { borderColor: Colors.primaryLight, backgroundColor: Colors.primary + '0C' },
  input: { flex: 1, color: Colors.textPrimary, fontSize: Typography.base, paddingVertical: 13, paddingRight: Spacing.md },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  roleCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    position: 'relative',
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '14' },
  roleLabel: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium, flex: 1 },
  roleLabelActive: { color: Colors.textPrimary, fontWeight: Typography.semibold },
  roleCheckDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.success,
    position: 'absolute', top: 8, right: 8,
  },
  styleRow: { flexDirection: 'row', gap: Spacing.sm },
  styleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  styleBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  styleBtnText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryLight },
  chipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipTextActive: { color: Colors.textPrimary, fontWeight: Typography.semibold },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary,
    borderRadius: Radius.md, paddingVertical: 16,
    marginTop: Spacing.xl, borderWidth: 1, borderColor: Colors.primaryLight,
  },
  ctaText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
});
