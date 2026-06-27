import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Colors, Typography, Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { config, configLoaded } = useAppConfig();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(16)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(subtitleFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.stagger(120, [
        Animated.timing(dot1, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
    ]).start();

    if (!configLoaded) return;

    const timer = setTimeout(() => {
      // Check maintenance mode
      if (config.maintenanceMode) {
        if (user && user.role === 'admin' && config.allowAdminDuringMaintenance) {
          // Logged-in admin → go to admin panel
          router.replace('/(admin)');
        } else if (user && user.role === 'player') {
          // Logged-in player → maintenance screen
          router.replace('/maintenance');
        } else if (!user && config.allowAdminDuringMaintenance) {
          // No user, admin login allowed → go to login so admin can sign in
          router.replace('/login');
        } else {
          // No user, admin login NOT allowed → show maintenance
          router.replace('/maintenance');
        }
      } else if (user) {
        router.replace(user.role === 'admin' ? '/(admin)' : '/(player)');
      } else {
        router.replace('/login');
      }
    }, 2400);

    return () => clearTimeout(timer);
  }, [user, configLoaded, config.maintenanceMode]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Subtle background accent */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.logoRing2}>
            <View style={styles.logoRing1}>
              <View style={styles.logoCore}>
                <Text style={styles.logoEmoji}>🏏</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }], alignItems: 'center' }}>
          <Text style={styles.title}>Young Warriors</Text>
          <Text style={styles.titleSub}>Cricket Club</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: subtitleFade, alignItems: 'center', marginTop: Spacing.lg }}>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Academy Management System</Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {[dot1, dot2, dot3].map((d, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { opacity: d },
                i === 1 && { backgroundColor: Colors.primary, width: 20 },
              ]}
            />
          ))}
        </View>
        <Text style={styles.version}>YWCC · Powered by OnSpace AI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCard },

  bgCircle1: {
    position: 'absolute', top: -80, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: Colors.primary + '06',
    borderWidth: 1, borderColor: Colors.primary + '10',
  },
  bgCircle2: {
    position: 'absolute', bottom: -40, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.bgSurface,
  },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  logoWrap: { marginBottom: Spacing['2xl'], alignItems: 'center' },
  logoRing2: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgDark,
  },
  logoRing1: {
    width: 106, height: 106, borderRadius: 53,
    borderWidth: 1, borderColor: Colors.primary + '30',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  logoCore: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: Colors.primary,
    borderWidth: 0,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: { fontSize: 38 },

  title: {
    fontSize: 28, fontWeight: Typography.extrabold,
    color: Colors.textPrimary, textAlign: 'center', letterSpacing: 0.2,
  },
  titleSub: {
    fontSize: Typography.base, fontWeight: Typography.semibold,
    color: Colors.primary, textAlign: 'center', letterSpacing: 2.5, marginTop: 4,
  },

  divider: {
    width: 40, height: 2, backgroundColor: Colors.primary + '50',
    borderRadius: 1, marginVertical: Spacing.md,
  },
  tagline: {
    fontSize: Typography.xs, color: Colors.textMuted,
    textAlign: 'center', letterSpacing: 1.2, textTransform: 'uppercase',
  },

  footer: { alignItems: 'center', gap: Spacing.sm },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.border,
  },
  version: { fontSize: Typography.xs, color: Colors.textMuted, letterSpacing: 0.2 },
});
