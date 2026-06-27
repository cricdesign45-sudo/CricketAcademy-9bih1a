import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { config } = useAppConfig();

  return (
    <View style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      {/* Background accents */}
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Illustration / Image */}
        <View style={s.imageWrap}>
          {config.maintenanceImageUri ? (
            <Image
              source={{ uri: config.maintenanceImageUri }}
              style={s.customImage}
              contentFit="contain"
            />
          ) : (
            <View style={s.defaultIllustration}>
              <View style={s.gearOuter}>
                <View style={s.gearInner}>
                  <MaterialIcons name="build" size={48} color={Colors.primary} />
                </View>
              </View>
              {/* Orbiting gear */}
              <View style={s.gearSmall}>
                <MaterialIcons name="settings" size={24} color={Colors.primary + '80'} />
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={s.content}>
          {/* Badge */}
          <View style={s.badge}>
            <View style={[s.badgeDot, { backgroundColor: Colors.warning }]} />
            <Text style={s.badgeText}>SCHEDULED MAINTENANCE</Text>
          </View>

          <Text style={s.title}>{config.maintenanceTitle}</Text>
          <Text style={s.message}>{config.maintenanceMessage}</Text>

          {/* Info cards */}
          <View style={s.cards}>
            <View style={[s.infoCard, { borderColor: Colors.info + '33', backgroundColor: Colors.info + '0A' }]}>
              <MaterialIcons name="access-time" size={20} color={Colors.info} />
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTitle, { color: Colors.textPrimary }]}>Estimated Duration</Text>
                <Text style={[s.cardDesc, { color: Colors.textSecondary }]}>Usually completed within a few hours</Text>
              </View>
            </View>
            <View style={[s.infoCard, { borderColor: Colors.success + '33', backgroundColor: Colors.success + '0A' }]}>
              <MaterialIcons name="check-circle" size={20} color={Colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTitle, { color: Colors.textPrimary }]}>Your Data is Safe</Text>
                <Text style={[s.cardDesc, { color: Colors.textSecondary }]}>All player records and stats are preserved</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Admin login link */}
          {config.allowAdminDuringMaintenance ? (
            <TouchableOpacity
              style={[s.adminLoginBtn, { borderColor: Colors.primary + '44', backgroundColor: Colors.primary + '0A' }]}
              onPress={() => router.replace('/login')}
            >
              <MaterialIcons name="admin-panel-settings" size={15} color={Colors.primary} />
              <Text style={[s.adminLoginTxt, { color: Colors.primary }]}>Admin Login</Text>
            </TouchableOpacity>
          ) : null}

          {/* Academy info */}
          <View style={s.footer}>
            <View style={s.logoMark}>
              <Text style={s.logoEmoji}>🏏</Text>
            </View>
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={s.academyName}>{config.academyName}</Text>
              <Text style={s.copyright}>{config.copyrightText}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgCard },
  bgCircle1: {
    position: 'absolute', top: -80, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: Colors.primary + '06',
    borderWidth: 1, borderColor: Colors.primary + '10',
  },
  bgCircle2: {
    position: 'absolute', bottom: 0, left: -80,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: Colors.bgSurface,
  },
  scroll: {
    flexGrow: 1, alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingTop: 48,
  },
  imageWrap: { marginBottom: Spacing['2xl'], alignItems: 'center' },
  defaultIllustration: { position: 'relative', width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  gearOuter: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 2, borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bgDark,
  },
  gearInner: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1.5, borderColor: Colors.primary + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  gearSmall: {
    position: 'absolute', top: 10, right: 0,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgCard,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  customImage: { width: 200, height: 200 },

  content: { width: '100%', alignItems: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.warning + '12',
    borderWidth: 1, borderColor: Colors.warning + '33',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    marginBottom: Spacing.xl,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: {
    fontSize: 11, fontWeight: Typography.bold,
    color: Colors.warning, letterSpacing: 1.2,
  },
  title: {
    fontSize: 26, fontWeight: Typography.extrabold,
    color: Colors.textPrimary, textAlign: 'center',
    marginBottom: Spacing.md, letterSpacing: 0.2,
  },
  message: {
    fontSize: Typography.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
    marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.sm,
  },
  cards: { width: '100%', gap: Spacing.sm, marginBottom: Spacing['2xl'] },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.md,
  },
  cardTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, marginBottom: 2 },
  cardDesc: { fontSize: Typography.xs, lineHeight: 18 },
  divider: { width: 40, height: 1, backgroundColor: Colors.border, marginBottom: Spacing['2xl'] },
  adminLoginBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg, paddingVertical: 10,
    marginBottom: Spacing.xl,
  },
  adminLoginTxt: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  footer: { alignItems: 'center', gap: Spacing.md },
  logoMark: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },
  academyName: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  copyright: { fontSize: Typography.xs, color: Colors.textMuted },
});
