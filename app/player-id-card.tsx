import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Share, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useAlert } from '@/template';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width - 48, 340);

const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];
const LEVEL_COLORS = ['', '#8B949E', '#58A6FF', '#3FB950', '#FFD700', '#FF7B00'];

type CardDesign = 'classic' | 'modern' | 'elite';

const DESIGNS: { key: CardDesign; label: string; icon: string }[] = [
  { key: 'classic', label: 'Classic', icon: 'credit-card' },
  { key: 'modern', label: 'Modern', icon: 'style' },
  { key: 'elite', label: 'Elite', icon: 'workspace-premium' },
];

function QRCodePlaceholder({ value, size, color }: { value: string; size: number; color: string }) {
  // Renders a visual QR-like grid pattern as a placeholder
  const cellSize = Math.floor(size / 9);
  const qrPattern = [
    [1,1,1,1,1,1,1,0,1,0,0,0,0,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,0,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,1,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0],
    [1,0,1,1,0,1,0,0,0,1,0,0,1,1,0,1,1,0,1,0,1],
    [0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1],
    [1,1,0,0,1,1,0,0,0,1,1,0,1,1,0,1,1,0,0,1,0],
    [0,1,0,1,1,0,1,0,0,0,0,1,0,0,1,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,1,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,0,1,0,0,1,0,0,1,0,0,1,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,1,0,1,1,0,0],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,0],
    [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,1,1,0,1],
    [1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0],
  ];
  const cellW = size / 21;
  return (
    <View style={{ width: size, height: size * 0.86, backgroundColor: 'white', padding: 4, borderRadius: 6, overflow: 'hidden' }}>
      {qrPattern.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', height: cellW }}>
          {row.map((cell, ci) => (
            <View key={ci} style={{ width: cellW, height: cellW, backgroundColor: cell ? color : 'transparent' }} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function PlayerIDCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players } = usePlayers();
  const { showAlert } = useAlert();
  const { Colors } = useTheme();
  const C = Colors;
  const [design, setDesign] = useState<CardDesign>('modern');
  const [flipped, setFlipped] = useState(false);

  const player = id ? players.find(p => p.id === id) : players[0];
  if (!player) return null;

  const levelColor = LEVEL_COLORS[player.level];
  const accentColor = levelColor;

  const handleShare = () => {
    Share.share({
      title: `${player.name} — Cricket Academy ID`,
      message: `Player: ${player.name}\nID: ${player.id}\nRole: ${player.playingRole}\nLevel: ${LEVEL_NAMES[player.level]}\nPoints: ${player.points}\nRank: #${player.rank}`,
    });
  };

  const handleDownload = () => {
    showAlert('Download ID Card', 'The ID card will be saved to your device gallery. (Requires expo-media-library in production)');
  };

  const CardFront = () => (
    <View style={[
      styles.idCard,
      { width: CARD_W },
      design === 'classic' && { backgroundColor: '#1B5E20', borderColor: '#FFD700' },
      design === 'modern' && { backgroundColor: C.bgCard, borderColor: accentColor + '66' },
      design === 'elite' && { backgroundColor: '#0D1117', borderColor: '#FFD700' },
    ]}>
      {/* Top accent bar */}
      <View style={[styles.cardAccentBar, {
        backgroundColor: design === 'elite' ? '#FFD700' : accentColor,
      }]} />

      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.cardLogoCircle, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
          <Text style={styles.cardLogoEmoji}>🏏</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardAcademyName, {
            color: design === 'classic' ? '#FFD700' : design === 'elite' ? '#FFD700' : C.gold,
          }]}>Cricket Academy</Text>
          <Text style={[styles.cardAcademySub, {
            color: design === 'classic' ? 'rgba(255,255,255,0.7)' : C.textSecondary,
          }]}>Official Player Identity Card</Text>
        </View>
        <View style={[styles.cardYearTag, { backgroundColor: accentColor + '22', borderColor: accentColor + '44' }]}>
          <Text style={[styles.cardYear, { color: accentColor }]}>2025</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.cardDivider, { backgroundColor: design === 'classic' ? 'rgba(255,255,255,0.2)' : accentColor + '33' }]} />

      {/* Player Info */}
      <View style={styles.cardBody}>
        {/* Avatar */}
        <View style={[styles.cardAvatarRing, { borderColor: accentColor }]}>
          <View style={[styles.cardAvatar, { backgroundColor: accentColor + '22' }]}>
            <Text style={[styles.cardAvatarText, { color: design === 'classic' ? '#fff' : C.textPrimary }]}>
              {player.name[0]}
            </Text>
          </View>
        </View>

        {/* Info block */}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.cardPlayerName, { color: design === 'classic' ? '#fff' : C.textPrimary }]}>
            {player.name}
          </Text>
          <Text style={[styles.cardPlayerRole, { color: design === 'classic' ? 'rgba(255,255,255,0.7)' : C.textSecondary }]}>
            {player.playingRole} · {player.battingStyle}
          </Text>

          <View style={styles.cardBadgeRow}>
            <View style={[styles.cardLevelBadge, { backgroundColor: accentColor + '1A', borderColor: accentColor + '44' }]}>
              <Text style={[styles.cardLevelText, { color: accentColor }]}>
                {LEVEL_NAMES[player.level]}
              </Text>
            </View>
            <View style={[styles.cardRankBadge, {
              backgroundColor: design === 'classic' ? 'rgba(255,215,0,0.18)' : C.gold + '18',
              borderColor: design === 'classic' ? 'rgba(255,215,0,0.44)' : C.gold + '44',
            }]}>
              <MaterialIcons name="emoji-events" size={10} color={design === 'classic' ? '#FFD700' : C.gold} />
              <Text style={[styles.cardRankText, { color: design === 'classic' ? '#FFD700' : C.gold }]}>#{player.rank}</Text>
            </View>
          </View>

          <View style={styles.cardMiniStats}>
            <View style={styles.cardMiniStat}>
              <Text style={[styles.cardMiniStatVal, { color: design === 'classic' ? '#FFD700' : accentColor }]}>{player.points}</Text>
              <Text style={[styles.cardMiniStatLbl, { color: design === 'classic' ? 'rgba(255,255,255,0.6)' : C.textMuted }]}>pts</Text>
            </View>
            <View style={[styles.cardMiniDiv, { backgroundColor: design === 'classic' ? 'rgba(255,255,255,0.2)' : C.border }]} />
            <View style={styles.cardMiniStat}>
              <Text style={[styles.cardMiniStatVal, { color: design === 'classic' ? '#fff' : C.textPrimary }]}>{player.attendancePercentage}%</Text>
              <Text style={[styles.cardMiniStatLbl, { color: design === 'classic' ? 'rgba(255,255,255,0.6)' : C.textMuted }]}>att</Text>
            </View>
            <View style={[styles.cardMiniDiv, { backgroundColor: design === 'classic' ? 'rgba(255,255,255,0.2)' : C.border }]} />
            <View style={styles.cardMiniStat}>
              <Text style={[styles.cardMiniStatVal, { color: design === 'classic' ? '#fff' : C.textPrimary }]}>{player.batting.runs}</Text>
              <Text style={[styles.cardMiniStatLbl, { color: design === 'classic' ? 'rgba(255,255,255,0.6)' : C.textMuted }]}>runs</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom ID bar */}
      <View style={[styles.cardFooter, {
        backgroundColor: design === 'classic' ? 'rgba(0,0,0,0.25)' : design === 'elite' ? '#FFD700' + '14' : C.bgSurface,
        borderTopColor: design === 'classic' ? 'rgba(255,255,255,0.15)' : accentColor + '22',
      }]}>
        <View>
          <Text style={[styles.cardIdLabel, { color: design === 'classic' ? 'rgba(255,255,255,0.5)' : C.textMuted }]}>Player ID</Text>
          <Text style={[styles.cardIdValue, { color: design === 'classic' ? 'rgba(255,255,255,0.85)' : C.textSecondary }]}>
            {player.id.toUpperCase().slice(0, 10)}
          </Text>
        </View>
        <View style={[styles.cardStatusDot, { backgroundColor: player.isActive ? '#3FB950' : '#F85149' }]}>
          <Text style={styles.cardStatusText}>{player.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
        </View>
      </View>
    </View>
  );

  const CardBack = () => (
    <View style={[
      styles.idCard,
      { width: CARD_W },
      design === 'classic' && { backgroundColor: '#0A3D0A', borderColor: '#FFD700' },
      design === 'modern' && { backgroundColor: C.bgCard, borderColor: accentColor + '66' },
      design === 'elite' && { backgroundColor: '#0D1117', borderColor: '#FFD700' },
    ]}>
      <View style={[styles.cardAccentBar, {
        backgroundColor: design === 'elite' ? '#FFD700' : accentColor,
      }]} />

      <View style={{ padding: Spacing.base, alignItems: 'center' }}>
        <Text style={[styles.backTitle, { color: design === 'classic' ? '#FFD700' : C.gold }]}>
          Scan to Verify
        </Text>

        {/* QR Code */}
        <View style={[styles.qrContainer, { backgroundColor: 'white', borderColor: accentColor + '55' }]}>
          <QRCodePlaceholder value={`CRICKET_ACADEMY|${player.id}|${player.name}`} size={140} color="#0D1117" />
        </View>

        <Text style={[styles.qrHint, { color: design === 'classic' ? 'rgba(255,255,255,0.6)' : C.textSecondary }]}>
          Scan to view full player profile
        </Text>

        {/* Key stats grid */}
        <View style={[styles.backStatsGrid, { borderColor: design === 'classic' ? 'rgba(255,255,255,0.15)' : C.border }]}>
          {[
            { label: 'Batting', value: `${player.batting.runs} runs` },
            { label: 'Bowling', value: `${player.bowling.wickets} wkts` },
            { label: 'Fitness', value: `${player.fitness.fitnessScore}/100` },
            { label: 'Discipline', value: `${player.disciplinePoints} pts` },
            { label: 'Matches', value: `${player.batting.matches}` },
            { label: 'Batting Avg', value: `${(player.batting.runs / Math.max(1, player.batting.matches)).toFixed(1)}` },
          ].map((s, i) => (
            <View key={i} style={[styles.backStatCell, {
              borderColor: design === 'classic' ? 'rgba(255,255,255,0.1)' : C.border + '66',
            }]}>
              <Text style={[styles.backStatVal, { color: design === 'classic' ? '#FFD700' : accentColor }]}>{s.value}</Text>
              <Text style={[styles.backStatLbl, { color: design === 'classic' ? 'rgba(255,255,255,0.6)' : C.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.backFooterText, { color: design === 'classic' ? 'rgba(255,255,255,0.4)' : C.textMuted }]}>
          This card is the property of Cricket Academy.{'\n'}Not transferable.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.bgDark }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>Player ID Card</Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>{player.name}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={[styles.backBtn, { backgroundColor: C.bgCard }]}>
          <MaterialIcons name="share" size={18} color={C.gold} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>

        {/* Design selector */}
        <View style={styles.designRow}>
          {DESIGNS.map(d => (
            <TouchableOpacity
              key={d.key}
              style={[styles.designChip, { backgroundColor: C.bgCard, borderColor: C.border }, design === d.key && { backgroundColor: C.primary, borderColor: C.primaryLight }]}
              onPress={() => setDesign(d.key)}
            >
              <MaterialIcons name={d.icon as any} size={13} color={design === d.key ? C.textPrimary : C.textMuted} />
              <Text style={[styles.designChipText, { color: design === d.key ? C.textPrimary : C.textSecondary }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Flip toggle */}
        <View style={styles.flipRow}>
          <TouchableOpacity
            style={[styles.flipBtn, { backgroundColor: C.bgCard, borderColor: !flipped ? accentColor : C.border }]}
            onPress={() => setFlipped(false)}
          >
            <Text style={[styles.flipBtnText, { color: !flipped ? accentColor : C.textSecondary }]}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flipBtn, { backgroundColor: C.bgCard, borderColor: flipped ? accentColor : C.border }]}
            onPress={() => setFlipped(true)}
          >
            <Text style={[styles.flipBtnText, { color: flipped ? accentColor : C.textSecondary }]}>Back (QR)</Text>
          </TouchableOpacity>
        </View>

        {/* The Card */}
        <View style={{ alignItems: 'center', marginVertical: Spacing.xl }}>
          {flipped ? <CardBack /> : <CardFront />}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handleShare}>
            <MaterialIcons name="share" size={18} color={C.info} />
            <Text style={[styles.actionBtnText, { color: C.info }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handleDownload}>
            <MaterialIcons name="file-download" size={18} color={C.success} />
            <Text style={[styles.actionBtnText, { color: C.success }]}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={() => setFlipped(v => !v)}>
            <MaterialIcons name="flip" size={18} color={C.gold} />
            <Text style={[styles.actionBtnText, { color: C.gold }]}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Player Quick Info */}
        <View style={[styles.infoCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[styles.infoCardTitle, { color: C.textPrimary }]}>Quick Info</Text>
          {[
            { label: 'Age', value: `${player.age} yrs` },
            { label: 'Gender', value: player.gender },
            { label: 'Email', value: player.email },
            { label: 'Phone', value: player.phone },
            { label: 'Coach', value: player.coachName },
            { label: 'Batch', value: player.batch },
            { label: 'Joined', value: new Date(player.joiningDate).toLocaleDateString('en-IN') },
            { label: 'Experience', value: player.experience },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: C.border + '55' }]}>
              <Text style={[styles.infoLabel, { color: C.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: C.textPrimary }]}>{row.value}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.base, fontWeight: Typography.bold },
  headerSub: { fontSize: Typography.xs, marginTop: 1 },
  content: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md },
  designRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  designChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  designChipText: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  flipRow: { flexDirection: 'row', gap: 8 },
  flipBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, alignItems: 'center' },
  flipBtnText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  idCard: {
    borderRadius: Radius.xl, borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  cardAccentBar: { height: 4, width: '100%' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  cardLogoCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cardLogoEmoji: { fontSize: 18 },
  cardAcademyName: { fontSize: Typography.sm, fontWeight: Typography.extrabold },
  cardAcademySub: { fontSize: 9, marginTop: 1 },
  cardYearTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  cardYear: { fontSize: Typography.xs, fontWeight: Typography.bold },
  cardDivider: { height: 1, marginHorizontal: Spacing.base, marginBottom: Spacing.md },
  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, paddingHorizontal: Spacing.base, paddingBottom: Spacing.md },
  cardAvatarRing: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardAvatar: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  cardAvatarText: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold },
  cardPlayerName: { fontSize: Typography.base, fontWeight: Typography.extrabold, marginBottom: 2 },
  cardPlayerRole: { fontSize: Typography.xs, marginBottom: 5 },
  cardBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 7 },
  cardLevelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  cardLevelText: { fontSize: 9, fontWeight: Typography.bold },
  cardRankBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  cardRankText: { fontSize: 9, fontWeight: Typography.bold },
  cardMiniStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardMiniStat: { alignItems: 'center' },
  cardMiniStatVal: { fontSize: Typography.sm, fontWeight: Typography.extrabold },
  cardMiniStatLbl: { fontSize: 9 },
  cardMiniDiv: { width: 1, height: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1 },
  cardIdLabel: { fontSize: 9, letterSpacing: 0.5 },
  cardIdValue: { fontSize: Typography.xs, fontWeight: Typography.bold, fontFamily: 'monospace' },
  cardStatusDot: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  cardStatusText: { fontSize: 9, fontWeight: Typography.extrabold, color: '#fff', letterSpacing: 0.5 },
  backTitle: { fontSize: Typography.sm, fontWeight: Typography.extrabold, marginBottom: Spacing.md, letterSpacing: 1 },
  qrContainer: { borderRadius: 10, padding: 8, borderWidth: 1, marginBottom: Spacing.sm },
  qrHint: { fontSize: 10, marginBottom: Spacing.md, textAlign: 'center' },
  backStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.md, width: '100%' },
  backStatCell: { width: '33.33%', padding: 10, alignItems: 'center', borderRightWidth: 1, borderBottomWidth: 1 },
  backStatVal: { fontSize: Typography.xs, fontWeight: Typography.extrabold },
  backStatLbl: { fontSize: 9, marginTop: 2 },
  backFooterText: { fontSize: 9, textAlign: 'center', lineHeight: 14 },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1 },
  actionBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  infoCard: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1 },
  infoCardTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  infoLabel: { fontSize: Typography.xs },
  infoValue: { fontSize: Typography.xs, fontWeight: Typography.semibold },
});
