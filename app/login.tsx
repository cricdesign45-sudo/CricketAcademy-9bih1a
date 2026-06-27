import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      triggerShake();
      showAlert('Missing Fields', 'Please enter your email and password');
      return;
    }
    const result = await login(email.trim(), password.trim());
    if (result.success) {
      router.replace(result.role === 'admin' ? '/(admin)' : '/(player)');
    } else {
      triggerShake();
      showAlert('Sign In Failed', result.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.bgDark }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Subtle background */}
      <View style={s.bgAccent1} />
      <View style={s.bgAccent2} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={s.logoArea}>
          <View style={s.logoRing}>
            <View style={s.logoCore}>
              <Text style={s.logoEmoji}>🏏</Text>
            </View>
          </View>
          <Text style={s.appName}>Young Warriors</Text>
          <Text style={s.appCode}>CRICKET CLUB · YWCC</Text>
        </View>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Sign In</Text>
          <Text style={s.cardSubtitle}>Enter your YWCC credentials</Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            {/* Email Field */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Email</Text>
              <View style={[
                s.inputBox,
                focusedField === 'email' && s.inputBoxFocused,
              ]}>
                <MaterialIcons name="mail-outline" size={16} color={focusedField === 'email' ? Colors.primary : Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialIcons name="close" size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Password Field */}
            <View style={s.fieldWrap}>
              <Text style={s.fieldLabel}>Password</Text>
              <View style={[
                s.inputBox,
                focusedField === 'pass' && s.inputBoxFocused,
              ]}>
                <MaterialIcons name="lock-outline" size={16} color={focusedField === 'pass' ? Colors.primary : Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('pass')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={s.forgotBtn}
            onPress={() => showAlert('Password Reset', 'Please contact your academy administrator to reset your password.')}
          >
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.ctaBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={s.ctaBtnText}>Sign In</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerLabel}>OR</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Register */}
        <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/register')}>
          <Text style={s.registerText}>Request Academy Access</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[s.footerText, { paddingBottom: insets.bottom + 32 }]}>
          Young Warriors Cricket Club © 2024
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  bgAccent1: {
    position: 'absolute', top: -60, right: -40,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: Colors.primary + '07',
  },
  bgAccent2: {
    position: 'absolute', bottom: -30, left: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.bgSurface,
  },

  scroll: { paddingHorizontal: Spacing.base },

  logoArea: { alignItems: 'center', marginBottom: Spacing['2xl'] },
  logoRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgDark, marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  logoCore: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 34 },
  appName: {
    fontSize: Typography['2xl'], fontWeight: Typography.extrabold,
    color: Colors.textPrimary, letterSpacing: 0.2,
  },
  appCode: {
    fontSize: Typography.xs, color: Colors.primary,
    fontWeight: Typography.semibold, letterSpacing: 2.5, marginTop: 4,
  },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  cardSubtitle: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 3, marginBottom: Spacing.xl },

  fieldWrap: { marginBottom: Spacing.md },
  fieldLabel: {
    fontSize: Typography.xs, fontWeight: Typography.semibold,
    color: Colors.textSecondary, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingLeft: Spacing.md, paddingRight: Spacing.sm,
  },
  inputBoxFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.bgCard,
  },
  input: {
    flex: 1, fontSize: Typography.base,
    color: Colors.textPrimary, paddingVertical: 13,
  },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.xl, marginTop: -4 },
  forgotText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.medium },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary,
    borderRadius: Radius.md, paddingVertical: 15,
  },
  ctaBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel: { fontSize: Typography.xs, color: Colors.textMuted, fontWeight: Typography.medium },

  registerBtn: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.bgCard,
  },
  registerText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.textSecondary },

  footerText: {
    textAlign: 'center', fontSize: Typography.xs,
    color: Colors.textMuted, marginTop: Spacing.xl,
  },
});
