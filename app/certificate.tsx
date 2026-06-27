import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Share, Dimensions, TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CERT_W = Math.min(width - 32, 360);
const CERT_H = CERT_W * 0.72;

const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];
const LEVEL_COLORS = ['', '#8B949E', '#58A6FF', '#3FB950', '#FFD700', '#FF7B00'];

type CertType = 'participation' | 'excellence' | 'topScorer' | 'mostImproved' | 'attendance' | 'custom';

const CERT_TYPES: { key: CertType; label: string; icon: string; color: string; title: string; subtitle: string }[] = [
  { key: 'participation', label: 'Participation', icon: 'sports-cricket', color: '#58A6FF', title: 'Certificate of Participation', subtitle: 'for active participation in Cricket Academy training program' },
  { key: 'excellence', label: 'Excellence', icon: 'workspace-premium', color: '#FFD700', title: 'Certificate of Excellence', subtitle: 'for outstanding performance and dedication in Cricket Academy' },
  { key: 'topScorer', label: 'Top Scorer', icon: 'trending-up', color: '#FF7B00', title: 'Top Scorer Award', subtitle: 'for achieving the highest batting score in the academy' },
  { key: 'mostImproved', label: 'Most Improved', icon: 'auto-awesome', color: '#3FB950', title: 'Most Improved Player', subtitle: 'for showing remarkable improvement in skills and rankings' },
  { key: 'attendance', label: 'Full Attendance', icon: 'event-available', color: '#9E6FFF', title: 'Perfect Attendance Award', subtitle: 'for maintaining outstanding attendance throughout the season' },
  { key: 'custom', label: 'Custom', icon: 'edit', color: '#DA3633', title: 'Special Recognition', subtitle: 'for exceptional contribution to Cricket Academy' },
];

export default function CertificateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players } = usePlayers();
  const { showAlert } = useAlert();
  const { Colors } = useTheme();
  const C = Colors;

  const [selectedPlayerId, setSelectedPlayerId] = useState(id || (players[0]?.id ?? ''));
  const [certType, setCertType] = useState<CertType>('excellence');
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [signatoryName, setSignatoryName] = useState('Head Coach');
  const [academyName, setAcademyName] = useState('Cricket Academy');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [showCustomForm, setShowCustomForm] = useState(false);

  const player = players.find(p => p.id === selectedPlayerId) || players[0];
  if (!player) return null;

  const certConfig = CERT_TYPES.find(c => c.key === certType)!;
  const displayTitle = certType === 'custom' && customTitle ? customTitle : certConfig.title;
  const displaySubtitle = certType === 'custom' && customSubtitle ? customSubtitle : certConfig.subtitle;
  const accentColor = certConfig.color;

  const handleShare = () => {
    Share.share({
      title: `${displayTitle} — ${player.name}`,
      message: `${academyName}\n\n${displayTitle}\n\nThis is to certify that\n${player.name}\n${displaySubtitle}\n\n${signatoryName} | ${year}`,
    });
  };

  const handlePrint = () => {
    showAlert('Print Certificate', 'PDF generation will be available in the published app. The certificate will be sent to the registered email.');
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bgDark }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Certificate Generator</Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>Create & share player certificates</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={[styles.backBtn, { backgroundColor: C.bgCard }]}>
          <MaterialIcons name="share" size={18} color={C.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>

        {/* Certificate Type */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Certificate Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {CERT_TYPES.map(ct => (
            <TouchableOpacity
              key={ct.key}
              style={[
                styles.typeChip,
                { backgroundColor: C.bgCard, borderColor: C.border },
                certType === ct.key && { backgroundColor: ct.color + '18', borderColor: ct.color },
              ]}
              onPress={() => {
                setCertType(ct.key);
                setShowCustomForm(ct.key === 'custom');
              }}
            >
              <MaterialIcons name={ct.icon as any} size={14} color={certType === ct.key ? ct.color : C.textMuted} />
              <Text style={[styles.typeChipText, { color: certType === ct.key ? ct.color : C.textSecondary }, certType === ct.key && { fontWeight: Typography.bold }]}>
                {ct.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Player Selector */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Select Player</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playerRow}>
          {players.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.playerChip,
                { backgroundColor: C.bgCard, borderColor: C.border },
                selectedPlayerId === p.id && { borderColor: accentColor, backgroundColor: accentColor + '11' },
              ]}
              onPress={() => setSelectedPlayerId(p.id)}
            >
              <View style={[styles.pAvatar, { backgroundColor: LEVEL_COLORS[p.level] + '22' }]}>
                <Text style={[styles.pAvatarText, { color: C.textPrimary }]}>{p.name[0]}</Text>
              </View>
              <Text style={[styles.pName, { color: selectedPlayerId === p.id ? accentColor : C.textSecondary }, selectedPlayerId === p.id && { fontWeight: Typography.semibold }]}>
                {p.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Custom form */}
        {showCustomForm && (
          <View style={[styles.customForm, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <Text style={[styles.customFormTitle, { color: C.textPrimary }]}>Customize Certificate</Text>
            <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
              value={customTitle} onChangeText={setCustomTitle}
              placeholder="Certificate title..." placeholderTextColor={C.textMuted}
            />
            <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary, height: 72, textAlignVertical: 'top' }]}
              value={customSubtitle} onChangeText={setCustomSubtitle}
              placeholder="Achievement description..." placeholderTextColor={C.textMuted}
              multiline
            />
          </View>
        )}

        {/* Signatory Settings */}
        <View style={[styles.signatoryCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[styles.signatoryTitle, { color: C.textPrimary }]}>Certificate Details</Text>
          <View style={styles.sigRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Academy Name</Text>
              <TextInput
                style={[styles.inputSmall, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
                value={academyName} onChangeText={setAcademyName}
                placeholderTextColor={C.textMuted}
              />
            </View>
            <View style={{ width: 90 }}>
              <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Year</Text>
              <TextInput
                style={[styles.inputSmall, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
                value={year} onChangeText={setYear}
                keyboardType="numeric" placeholderTextColor={C.textMuted}
              />
            </View>
          </View>
          <Text style={[styles.fieldLabel, { color: C.textSecondary }]}>Signatory Name</Text>
          <TextInput
            style={[styles.inputSmall, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
            value={signatoryName} onChangeText={setSignatoryName}
            placeholderTextColor={C.textMuted}
          />
        </View>

        {/* Certificate Preview */}
        <Text style={[styles.sectionLabel, { color: C.textSecondary }]}>Preview</Text>
        <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
          <View style={[styles.certWrapper, { width: CERT_W, height: CERT_H, backgroundColor: '#FEFEFE', borderColor: accentColor + '55' }]}>
            {/* Outer border decorative */}
            <View style={[styles.certOuterBorder, { borderColor: accentColor + '33' }]} />

            {/* Top ribbon */}
            <View style={[styles.certTopRibbon, { backgroundColor: accentColor }]} />

            <View style={styles.certContent}>
              {/* Academy + icon */}
              <View style={styles.certHeaderRow}>
                <View style={[styles.certLogoCircle, { backgroundColor: accentColor + '18', borderColor: accentColor + '33' }]}>
                  <Text style={styles.certLogoEmoji}>🏏</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.certAcademyName, { color: accentColor }]}>{academyName}</Text>
                  <Text style={styles.certAcademySub}>Est. 2020</Text>
                </View>
                <View style={[styles.certLogoCircle, { backgroundColor: accentColor + '18', borderColor: accentColor + '33' }]}>
                  <MaterialIcons name={certConfig.icon as any} size={16} color={accentColor} />
                </View>
              </View>

              {/* "This is to certify" */}
              <Text style={styles.certIntro}>This is to certify that</Text>

              {/* Player name */}
              <Text style={[styles.certPlayerName, { color: accentColor, borderBottomColor: accentColor + '55' }]}>{player.name}</Text>

              {/* Title */}
              <Text style={[styles.certTitle, { color: '#1A1A1A' }]}>{displayTitle}</Text>

              {/* Description */}
              <Text style={styles.certDesc} numberOfLines={2}>{displaySubtitle}</Text>

              {/* Stats row */}
              <View style={[styles.certStatsRow, { borderTopColor: accentColor + '22', borderBottomColor: accentColor + '22' }]}>
                <View style={styles.certStatItem}>
                  <Text style={[styles.certStatVal, { color: accentColor }]}>{player.points}</Text>
                  <Text style={styles.certStatLbl}>Points</Text>
                </View>
                <View style={[styles.certStatDiv, { backgroundColor: accentColor + '33' }]} />
                <View style={styles.certStatItem}>
                  <Text style={[styles.certStatVal, { color: accentColor }]}>#{player.rank}</Text>
                  <Text style={styles.certStatLbl}>Rank</Text>
                </View>
                <View style={[styles.certStatDiv, { backgroundColor: accentColor + '33' }]} />
                <View style={styles.certStatItem}>
                  <Text style={[styles.certStatVal, { color: accentColor }]}>{player.attendancePercentage}%</Text>
                  <Text style={styles.certStatLbl}>Att.</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.certFooter}>
                <View style={styles.certSignatory}>
                  <View style={[styles.certSignLine, { backgroundColor: accentColor + '44' }]} />
                  <Text style={styles.certSignatoryName}>{signatoryName}</Text>
                  <Text style={styles.certSignatoryRole}>Head Coach</Text>
                </View>
                <Text style={[styles.certYear, { color: accentColor }]}>{year}</Text>
                <View style={styles.certSignatory}>
                  <View style={[styles.certSignLine, { backgroundColor: accentColor + '44' }]} />
                  <Text style={styles.certSignatoryName}>Director</Text>
                  <Text style={styles.certSignatoryRole}>{academyName}</Text>
                </View>
              </View>
            </View>

            {/* Bottom ribbon */}
            <View style={[styles.certBottomRibbon, { backgroundColor: accentColor }]} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: accentColor }]} onPress={handleShare}>
            <MaterialIcons name="share" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Share Certificate</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handlePrint}>
            <MaterialIcons name="print" size={16} color={C.info} />
            <Text style={[styles.secondaryBtnText, { color: C.info }]}>Print / Save PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: C.bgCard, borderColor: C.border }]}
            onPress={() => showAlert('Email Sent', `Certificate emailed to ${player.email}`)}
          >
            <MaterialIcons name="email" size={16} color={C.success} />
            <Text style={[styles.secondaryBtnText, { color: C.success }]}>Email Player</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.base, fontWeight: Typography.bold },
  headerSub: { fontSize: Typography.xs, marginTop: 1 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  typeRow: { gap: 8, flexDirection: 'row', paddingBottom: Spacing.md },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1 },
  typeChipText: { fontSize: Typography.xs },
  playerRow: { gap: 8, flexDirection: 'row', paddingBottom: Spacing.md },
  playerChip: { alignItems: 'center', gap: 4, padding: 8, borderRadius: Radius.md, borderWidth: 1, minWidth: 65 },
  pAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pAvatarText: { fontSize: Typography.sm, fontWeight: Typography.bold },
  pName: { fontSize: 10 },
  customForm: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.md },
  customFormTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, marginBottom: Spacing.sm },
  fieldLabel: { fontSize: Typography.xs, marginBottom: Spacing.xs, marginTop: Spacing.sm, fontWeight: Typography.medium },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.sm },
  signatoryCard: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.md },
  signatoryTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, marginBottom: Spacing.sm },
  sigRow: { flexDirection: 'row', gap: 8 },
  inputSmall: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 8, fontSize: Typography.sm },
  certWrapper: {
    borderRadius: Radius.xl, borderWidth: 2, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  certOuterBorder: { position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderRadius: Radius.lg, borderWidth: 1 },
  certTopRibbon: { height: 6, width: '100%' },
  certBottomRibbon: { height: 6, width: '100%' },
  certContent: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'space-between' },
  certHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  certLogoCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  certLogoEmoji: { fontSize: 14 },
  certAcademyName: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  certAcademySub: { fontSize: 8, color: '#888', letterSpacing: 1 },
  certIntro: { textAlign: 'center', fontSize: 9, color: '#666', marginTop: 4 },
  certPlayerName: { textAlign: 'center', fontSize: 18, fontWeight: '800', paddingBottom: 3, borderBottomWidth: 1.5, marginHorizontal: 20, marginBottom: 4 },
  certTitle: { textAlign: 'center', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  certDesc: { textAlign: 'center', fontSize: 8, color: '#666', lineHeight: 12 },
  certStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 5, borderTopWidth: 1, borderBottomWidth: 1 },
  certStatItem: { alignItems: 'center' },
  certStatVal: { fontSize: 11, fontWeight: '800' },
  certStatLbl: { fontSize: 7, color: '#888' },
  certStatDiv: { width: 1, height: 18 },
  certFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 4 },
  certSignatory: { alignItems: 'center', gap: 2 },
  certSignLine: { width: 60, height: 1, marginBottom: 3 },
  certSignatoryName: { fontSize: 7, fontWeight: '700', color: '#333' },
  certSignatoryRole: { fontSize: 6, color: '#888' },
  certYear: { fontSize: 14, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.lg, paddingVertical: 14 },
  primaryBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: '#fff' },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.lg, paddingVertical: 12, borderWidth: 1 },
  secondaryBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
});
