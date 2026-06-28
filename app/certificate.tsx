import React, { useState, useCallback, memo } from 'react';
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
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Typography, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CERT_W = Math.min(width - 32, 380);
const CERT_H = CERT_W * 0.71;

const LEVEL_COLORS = ['', '#8B949E', '#58A6FF', '#3FB950', '#FFD700', '#FF7B00'];

type CertType = 'participation' | 'excellence' | 'topScorer' | 'mostImproved' | 'attendance' | 'merit' | 'custom';

const CERT_TYPES: { key: CertType; label: string; icon: string; color: string; title: string; subtitle: string }[] = [
  { key: 'excellence', label: 'Excellence', icon: 'workspace-premium', color: '#C9A227', title: 'Certificate of Excellence', subtitle: 'for outstanding performance and dedication in Cricket Academy training' },
  { key: 'participation', label: 'Participation', icon: 'sports-cricket', color: '#1565C0', title: 'Certificate of Participation', subtitle: 'for active participation in the Cricket Academy training program' },
  { key: 'topScorer', label: 'Top Scorer', icon: 'trending-up', color: '#BF360C', title: 'Top Scorer Award', subtitle: 'for achieving the highest batting score in the academy this season' },
  { key: 'mostImproved', label: 'Most Improved', icon: 'auto-awesome', color: '#1B5E20', title: 'Most Improved Player', subtitle: 'for showing remarkable improvement in skills and performance rankings' },
  { key: 'attendance', label: 'Attendance', icon: 'event-available', color: '#4527A0', title: 'Perfect Attendance Award', subtitle: 'for maintaining outstanding attendance discipline throughout the season' },
  { key: 'merit', label: 'Merit', icon: 'military-tech', color: '#AD1457', title: 'Certificate of Merit', subtitle: 'for exceptional conduct, sportsmanship and contribution to the academy' },
  { key: 'custom', label: 'Custom', icon: 'edit', color: '#37474F', title: 'Special Recognition', subtitle: 'for exceptional contribution to the Cricket Academy' },
];

// ─── Certificate Preview ──────────────────────────────────────────────────────
const CertPreview = memo(function CertPreview({
  player, certConfig, displayTitle, displaySubtitle,
  signatoryName, academyName, year, accentColor,
}: {
  player: any; certConfig: any; displayTitle: string; displaySubtitle: string;
  signatoryName: string; academyName: string; year: string; accentColor: string;
}) {
  return (
    <View style={[cert.wrapper, { width: CERT_W, height: CERT_H, borderColor: accentColor + '44' }]}>
      {/* Decorative inner frame */}
      <View style={[cert.innerFrame, { borderColor: accentColor + '20' }]} />
      {/* Corner ornaments */}
      <View style={[cert.cornerTL, { borderColor: accentColor + '55' }]} />
      <View style={[cert.cornerTR, { borderColor: accentColor + '55' }]} />
      <View style={[cert.cornerBL, { borderColor: accentColor + '55' }]} />
      <View style={[cert.cornerBR, { borderColor: accentColor + '55' }]} />

      {/* Top banner */}
      <View style={[cert.topBanner, { backgroundColor: accentColor }]}>
        <Text style={cert.topBannerText}>{academyName.toUpperCase()}</Text>
      </View>

      <View style={cert.body}>
        {/* Icon + header */}
        <View style={cert.iconRow}>
          <View style={[cert.iconWrap, { backgroundColor: accentColor + '14', borderColor: accentColor + '30' }]}>
            <MaterialIcons name={certConfig.icon as any} size={20} color={accentColor} />
          </View>
          <View style={cert.headerCenter}>
            <Text style={[cert.certTitleMain, { color: '#1A1A1A' }]} numberOfLines={1}>{displayTitle}</Text>
            <View style={[cert.dividerLine, { backgroundColor: accentColor }]} />
          </View>
          <View style={[cert.iconWrap, { backgroundColor: accentColor + '14', borderColor: accentColor + '30' }]}>
            <Text style={{ fontSize: 16 }}>🏏</Text>
          </View>
        </View>

        {/* Presented to */}
        <Text style={cert.presentedTo}>This is to certify that</Text>
        <Text style={[cert.playerName, { color: accentColor }]}>{player.name}</Text>

        {/* Subtitle */}
        <Text style={cert.certSubtitle} numberOfLines={2}>{displaySubtitle}</Text>

        {/* Stats strip */}
        <View style={[cert.statsStrip, { borderColor: accentColor + '25', backgroundColor: accentColor + '07' }]}>
          {[
            { val: String(player.points), lbl: 'Points' },
            { val: `#${player.rank}`, lbl: 'Rank' },
            { val: `${player.attendancePercentage}%`, lbl: 'Attendance' },
            { val: `${player.batting.runs}`, lbl: 'Runs' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[cert.statsDivider, { backgroundColor: accentColor + '30' }]} />}
              <View style={cert.statItem}>
                <Text style={[cert.statVal, { color: accentColor }]}>{s.val}</Text>
                <Text style={cert.statLbl}>{s.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Footer */}
        <View style={cert.footer}>
          <View style={cert.signatoryCol}>
            <View style={[cert.sigLine, { backgroundColor: accentColor + '50' }]} />
            <Text style={cert.sigName}>{signatoryName}</Text>
            <Text style={cert.sigRole}>Head Coach</Text>
          </View>
          <Text style={[cert.yearText, { color: accentColor }]}>{year}</Text>
          <View style={cert.signatoryCol}>
            <View style={[cert.sigLine, { backgroundColor: accentColor + '50' }]} />
            <Text style={cert.sigName}>Director</Text>
            <Text style={cert.sigRole}>{academyName}</Text>
          </View>
        </View>
      </View>

      {/* Bottom ribbon */}
      <View style={[cert.bottomBanner, { backgroundColor: accentColor }]}>
        <Text style={cert.bottomBannerText}>EXCELLENCE IN CRICKET · {year}</Text>
      </View>
    </View>
  );
});

// ─── Player Chip ──────────────────────────────────────────────────────────────
const PlayerChip = memo(function PlayerChip({ p, selected, accentColor, onPress, C }: any) {
  return (
    <TouchableOpacity
      style={[
        st.playerChip,
        { backgroundColor: C.bgCard, borderColor: C.border },
        selected && { borderColor: accentColor, backgroundColor: accentColor + '10' },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[st.pAvatar, { backgroundColor: LEVEL_COLORS[p.level] + '22' }]}>
        <Text style={[st.pAvatarText, { color: C.textPrimary }]}>{p.name[0]}</Text>
      </View>
      <Text style={[st.pName, { color: selected ? accentColor : C.textSecondary }, selected && { fontWeight: '600' }]}>
        {p.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
});

export default function CertificateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players } = usePlayers();
  const { showAlert } = useAlert();
  const { Colors: C } = useTheme();
  const { config } = useAppConfig();

  const [selectedPlayerId, setSelectedPlayerId] = useState(id || (players[0]?.id ?? ''));
  const [certType, setCertType] = useState<CertType>('excellence');
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [signatoryName, setSignatoryName] = useState('Head Coach');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const player = players.find(p => p.id === selectedPlayerId) || players[0];
  if (!player) return null;

  const certConfig = CERT_TYPES.find(c => c.key === certType)!;
  const displayTitle = certType === 'custom' && customTitle ? customTitle : certConfig.title;
  const displaySubtitle = certType === 'custom' && customSubtitle ? customSubtitle : certConfig.subtitle;
  const accentColor = certConfig.color;
  const academyName = config.academyName;

  const handleShare = useCallback(() => {
    Share.share({
      title: `${displayTitle} — ${player.name}`,
      message: `${academyName}\n\n${displayTitle}\n\nThis is to certify that\n${player.name}\n${displaySubtitle}\n\n${signatoryName} | ${year}`,
    });
  }, [displayTitle, player, academyName, displaySubtitle, signatoryName, year]);

  const handlePrint = useCallback(() => {
    showAlert('Print Certificate', 'PDF export will be available in the published app.');
  }, [showAlert]);

  const handleEmail = useCallback(() => {
    showAlert('Email Sent', `Certificate emailed to ${player.email}`);
  }, [showAlert, player.email]);

  return (
    <View style={[st.container, { backgroundColor: C.bgDark }]}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8, borderBottomColor: C.border, backgroundColor: C.bgCard }]}>
        <TouchableOpacity onPress={() => router.back()} style={[st.headerBtn, { backgroundColor: C.bgSurface }]}>
          <MaterialIcons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[st.headerTitle, { color: C.textPrimary }]}>Certificate Generator</Text>
          <Text style={[st.headerSub, { color: C.textMuted }]}>{academyName}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={[st.headerBtn, { backgroundColor: C.bgSurface }]}>
          <MaterialIcons name="share" size={18} color={accentColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[st.scroll, { paddingBottom: insets.bottom + 40 }]}>

        {/* Certificate Type */}
        <Text style={[st.sectionLabel, { color: C.textMuted }]}>Certificate Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row}>
          {CERT_TYPES.map(ct => (
            <TouchableOpacity
              key={ct.key}
              style={[
                st.typeChip,
                { backgroundColor: C.bgCard, borderColor: C.border },
                certType === ct.key && { backgroundColor: ct.color + '15', borderColor: ct.color },
              ]}
              onPress={() => setCertType(ct.key)}
              activeOpacity={0.75}
            >
              <MaterialIcons name={ct.icon as any} size={13} color={certType === ct.key ? ct.color : C.textMuted} />
              <Text style={[st.typeChipText, { color: certType === ct.key ? ct.color : C.textSecondary },
                certType === ct.key && { fontWeight: '700' }]}>
                {ct.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Player Selector */}
        <Text style={[st.sectionLabel, { color: C.textMuted }]}>Select Player</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row}>
          {players.map(p => (
            <PlayerChip
              key={p.id}
              p={p}
              selected={selectedPlayerId === p.id}
              accentColor={accentColor}
              C={C}
              onPress={() => setSelectedPlayerId(p.id)}
            />
          ))}
        </ScrollView>

        {/* Custom form */}
        {certType === 'custom' && (
          <View style={[st.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <Text style={[st.cardTitle, { color: C.textPrimary }]}>Custom Content</Text>
            <Text style={[st.fieldLabel, { color: C.textSecondary }]}>Title</Text>
            <TextInput
              style={[st.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
              value={customTitle} onChangeText={setCustomTitle}
              placeholder="Certificate title..." placeholderTextColor={C.textMuted}
            />
            <Text style={[st.fieldLabel, { color: C.textSecondary }]}>Description</Text>
            <TextInput
              style={[st.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary, height: 72, textAlignVertical: 'top' }]}
              value={customSubtitle} onChangeText={setCustomSubtitle}
              placeholder="Achievement description..." placeholderTextColor={C.textMuted}
              multiline
            />
          </View>
        )}

        {/* Certificate Details */}
        <View style={[st.card, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[st.cardTitle, { color: C.textPrimary }]}>Certificate Details</Text>
          <Text style={[st.fieldLabel, { color: C.textSecondary }]}>Signatory Name</Text>
          <TextInput
            style={[st.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary }]}
            value={signatoryName} onChangeText={setSignatoryName}
            placeholderTextColor={C.textMuted}
          />
          <Text style={[st.fieldLabel, { color: C.textSecondary }]}>Year</Text>
          <TextInput
            style={[st.input, { backgroundColor: C.bgSurface, borderColor: C.border, color: C.textPrimary, width: 100 }]}
            value={year} onChangeText={setYear}
            keyboardType="numeric" placeholderTextColor={C.textMuted}
          />
        </View>

        {/* Certificate Preview */}
        <Text style={[st.sectionLabel, { color: C.textMuted }]}>Preview</Text>
        <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
          <CertPreview
            player={player}
            certConfig={certConfig}
            displayTitle={displayTitle}
            displaySubtitle={displaySubtitle}
            signatoryName={signatoryName}
            academyName={academyName}
            year={year}
            accentColor={accentColor}
          />
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={[st.primaryBtn, { backgroundColor: accentColor }]} onPress={handleShare}>
          <MaterialIcons name="share" size={18} color="#fff" />
          <Text style={st.primaryBtnText}>Share Certificate</Text>
        </TouchableOpacity>
        <View style={st.secondaryRow}>
          <TouchableOpacity style={[st.secondaryBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handlePrint}>
            <MaterialIcons name="picture-as-pdf" size={16} color={C.info} />
            <Text style={[st.secondaryBtnText, { color: C.info }]}>Save PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.secondaryBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handleEmail}>
            <MaterialIcons name="email" size={16} color={C.success} />
            <Text style={[st.secondaryBtnText, { color: C.success }]}>Email Player</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Certificate Styles ───────────────────────────────────────────────────────
const cert = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.xl, borderWidth: 2, overflow: 'hidden',
    backgroundColor: '#FEFDF8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20, elevation: 10,
  },
  innerFrame: {
    position: 'absolute', top: 10, left: 10, right: 10, bottom: 10,
    borderRadius: Radius.lg, borderWidth: 1,
  },
  // Corner ornaments
  cornerTL: { position: 'absolute', top: 6, left: 6, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#C9A227' },
  cornerTR: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#C9A227' },
  cornerBL: { position: 'absolute', bottom: 6, left: 6, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#C9A227' },
  cornerBR: { position: 'absolute', bottom: 6, right: 6, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#C9A227' },

  topBanner: { paddingVertical: 5, paddingHorizontal: 16, alignItems: 'center' },
  topBannerText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },

  body: { flex: 1, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'space-between' },

  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  certTitleMain: { fontSize: 11, fontWeight: '800', textAlign: 'center', letterSpacing: 0.3 },
  dividerLine: { height: 1.5, width: 80, borderRadius: 2 },

  presentedTo: { textAlign: 'center', fontSize: 8, color: '#888', letterSpacing: 0.5, marginTop: 2 },
  playerName: { textAlign: 'center', fontSize: 19, fontWeight: '800', fontStyle: 'italic', marginVertical: 2, letterSpacing: 0.2 },
  certSubtitle: { textAlign: 'center', fontSize: 8, color: '#666', lineHeight: 12, paddingHorizontal: 10 },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    borderRadius: Radius.sm, borderWidth: 1, paddingVertical: 6, marginVertical: 6,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 11, fontWeight: '800' },
  statLbl: { fontSize: 7, color: '#888', marginTop: 1 },
  statsDivider: { width: 1, height: 20 },

  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  signatoryCol: { alignItems: 'center', gap: 2 },
  sigLine: { width: 56, height: 1, marginBottom: 3 },
  sigName: { fontSize: 7, fontWeight: '700', color: '#333' },
  sigRole: { fontSize: 6, color: '#888' },
  yearText: { fontSize: 15, fontWeight: '900' },

  bottomBanner: { paddingVertical: 4, alignItems: 'center' },
  bottomBannerText: { fontSize: 7, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.2 },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md, borderBottomWidth: 1,
  },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.base, fontWeight: '700' },
  headerSub: { fontSize: Typography.xs, marginTop: 1 },
  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },
  sectionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  row: { gap: 8, paddingBottom: Spacing.md },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  typeChipText: { fontSize: Typography.xs },
  playerChip: { alignItems: 'center', gap: 5, padding: 8, borderRadius: Radius.md, borderWidth: 1, minWidth: 64 },
  pAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  pAvatarText: { fontSize: Typography.sm, fontWeight: '700' },
  pName: { fontSize: 10 },
  card: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.md },
  cardTitle: { fontSize: Typography.sm, fontWeight: '700', marginBottom: Spacing.sm },
  fieldLabel: { fontSize: Typography.xs, marginBottom: 4, marginTop: Spacing.sm, fontWeight: '500' },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: Typography.sm },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radius.lg, paddingVertical: 15, marginBottom: Spacing.sm },
  primaryBtnText: { fontSize: Typography.sm, fontWeight: '700', color: '#fff' },
  secondaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.lg, paddingVertical: 12, borderWidth: 1 },
  secondaryBtnText: { fontSize: Typography.sm, fontWeight: '600' },
});
