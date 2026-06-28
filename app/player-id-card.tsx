import React, { useState, useCallback, memo } from 'react';
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
import { useAppConfig } from '@/contexts/AppConfigContext';
import { Typography, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(width - 40, 340);
const CARD_H = CARD_W * 0.62;

const LEVEL_NAMES = ['', 'Beginner', 'Rising Star', 'Skilled', 'Professional', 'Legend'];
const LEVEL_COLORS = ['', '#8B949E', '#58A6FF', '#3FB950', '#FFD700', '#FF7B00'];

type CardTheme = 'classic' | 'modern' | 'dark' | 'elite';

const THEMES: { key: CardTheme; label: string; icon: string }[] = [
  { key: 'modern', label: 'Modern', icon: 'style' },
  { key: 'classic', label: 'Classic', icon: 'credit-card' },
  { key: 'dark', label: 'Dark', icon: 'dark-mode' },
  { key: 'elite', label: 'Elite', icon: 'workspace-premium' },
];

// ─── QR Placeholder ───────────────────────────────────────────────────────────
const QRPattern = memo(function QRPattern({ size, color }: { size: number; color: string }) {
  const qr = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
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
    <View style={{ width: size, height: size * 0.86, backgroundColor: '#fff', borderRadius: 4, overflow: 'hidden', padding: 3 }}>
      {qr.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', height: cellW }}>
          {row.map((cell, ci) => (
            <View key={ci} style={{ width: cellW, height: cellW, backgroundColor: cell ? color : 'transparent' }} />
          ))}
        </View>
      ))}
    </View>
  );
});

// ─── Card Front ───────────────────────────────────────────────────────────────
const CardFront = memo(function CardFront({ player, theme, accentColor, levelColor, academyName, C }: any) {
  const isDark = theme === 'dark' || theme === 'elite';
  const isClassic = theme === 'classic';
  const isElite = theme === 'elite';

  const bg = isClassic ? '#1B5E20' : isElite ? '#0D0D1A' : isDark ? '#111827' : C.bgCard;
  const borderC = isElite ? '#C9A227' : isClassic ? '#C9A227' : accentColor + '55';
  const textH = (isDark || isClassic) ? '#F9FAFB' : C.textPrimary;
  const textS = (isDark || isClassic) ? 'rgba(255,255,255,0.65)' : C.textSecondary;
  const textM = (isDark || isClassic) ? 'rgba(255,255,255,0.4)' : C.textMuted;
  const divC = (isDark || isClassic) ? 'rgba(255,255,255,0.12)' : C.border;
  const stripBg = isElite ? 'rgba(201,162,39,0.08)' : isClassic ? 'rgba(0,0,0,0.2)' : isDark ? 'rgba(255,255,255,0.04)' : C.bgSurface;

  return (
    <View style={[card.wrap, { width: CARD_W, height: CARD_H, backgroundColor: bg, borderColor: borderC }]}>
      {/* Accent top bar */}
      <View style={[card.topBar, { backgroundColor: isElite ? '#C9A227' : accentColor }]} />

      {/* Header row */}
      <View style={card.headerRow}>
        <View style={[card.logoCircle, { backgroundColor: (isElite ? '#C9A227' : accentColor) + '18', borderColor: (isElite ? '#C9A227' : accentColor) + '44' }]}>
          <Text style={card.logoEmoji}>🏏</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 8 }}>
          <Text style={[card.academyName, { color: isElite || isClassic ? '#C9A227' : accentColor }]} numberOfLines={1}>
            {academyName}
          </Text>
          <Text style={[card.academySub, { color: textS }]}>Official Player ID</Text>
        </View>
        <View style={[card.yearTag, { backgroundColor: (isElite ? '#C9A227' : accentColor) + '18', borderColor: (isElite ? '#C9A227' : accentColor) + '33' }]}>
          <Text style={[card.yearText, { color: isElite ? '#C9A227' : accentColor }]}>2025</Text>
        </View>
      </View>

      <View style={[card.divider, { backgroundColor: divC }]} />

      {/* Body */}
      <View style={card.body}>
        {/* Avatar */}
        <View style={[card.avatarRing, { borderColor: isElite ? '#C9A227' : accentColor }]}>
          <View style={[card.avatar, { backgroundColor: (isElite ? '#C9A227' : accentColor) + '1A' }]}>
            <Text style={[card.avatarText, { color: isElite ? '#C9A227' : accentColor }]}>{player.name[0]}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[card.playerName, { color: textH }]} numberOfLines={1}>{player.name}</Text>
          <Text style={[card.playerRole, { color: textS }]}>{player.playingRole} · {player.battingStyle}</Text>

          <View style={card.badgeRow}>
            <View style={[card.levelBadge, { backgroundColor: (isElite ? '#C9A227' : levelColor) + '18', borderColor: (isElite ? '#C9A227' : levelColor) + '44' }]}>
              <Text style={[card.levelText, { color: isElite ? '#C9A227' : levelColor }]}>{LEVEL_NAMES[player.level]}</Text>
            </View>
            <View style={[card.rankBadge, { backgroundColor: (isElite ? '#C9A227' : C.gold) + '18', borderColor: (isElite ? '#C9A227' : C.gold) + '44' }]}>
              <MaterialIcons name="emoji-events" size={9} color={isElite ? '#C9A227' : C.gold} />
              <Text style={[card.rankText, { color: isElite ? '#C9A227' : C.gold }]}>#{player.rank}</Text>
            </View>
          </View>

          <View style={card.miniStats}>
            {[
              { val: String(player.points), lbl: 'pts' },
              { val: `${player.attendancePercentage}%`, lbl: 'att' },
              { val: String(player.batting.runs), lbl: 'runs' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={[card.miniDiv, { backgroundColor: divC }]} />}
                <View style={card.miniStat}>
                  <Text style={[card.miniStatVal, { color: isElite ? '#C9A227' : accentColor }]}>{s.val}</Text>
                  <Text style={[card.miniStatLbl, { color: textM }]}>{s.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      {/* Footer strip */}
      <View style={[card.footer, { backgroundColor: stripBg, borderTopColor: divC }]}>
        <View>
          <Text style={[card.idLabel, { color: textM }]}>Player ID</Text>
          <Text style={[card.idValue, { color: textS }]}>{player.id.toUpperCase().slice(0, 12)}</Text>
        </View>
        <View style={[card.statusPill, { backgroundColor: player.isActive ? '#16A34A' : '#DC2626' }]}>
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' }} />
          <Text style={card.statusText}>{player.isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
        </View>
      </View>
    </View>
  );
});

// ─── Card Back ────────────────────────────────────────────────────────────────
const CardBack = memo(function CardBack({ player, theme, accentColor, C }: any) {
  const isDark = theme === 'dark' || theme === 'elite';
  const isClassic = theme === 'classic';
  const isElite = theme === 'elite';

  const bg = isClassic ? '#0A3D0A' : isElite ? '#0D0D1A' : isDark ? '#111827' : C.bgCard;
  const borderC = isElite ? '#C9A227' : isClassic ? '#C9A227' : accentColor + '55';
  const qrColor = isElite ? '#C9A227' : isClassic ? '#C9A227' : isDark ? '#fff' : '#0D1117';
  const textH = (isDark || isClassic) ? '#F9FAFB' : C.textPrimary;
  const textS = (isDark || isClassic) ? 'rgba(255,255,255,0.6)' : C.textSecondary;
  const textM = (isDark || isClassic) ? 'rgba(255,255,255,0.35)' : C.textMuted;
  const divC = (isDark || isClassic) ? 'rgba(255,255,255,0.1)' : C.border;
  const hlC = isElite ? '#C9A227' : accentColor;

  const stats = [
    { lbl: 'Batting', val: `${player.batting.runs} runs` },
    { lbl: 'Bowling', val: `${player.bowling.wickets} wkts` },
    { lbl: 'Fitness', val: `${player.fitness.fitnessScore}/100` },
    { lbl: 'Matches', val: String(player.batting.matches) },
    { lbl: 'SR', val: `${player.batting.strikeRate}` },
    { lbl: 'Avg', val: `${(player.batting.runs / Math.max(1, player.batting.matches)).toFixed(1)}` },
  ];

  return (
    <View style={[card.wrap, { width: CARD_W, height: CARD_H, backgroundColor: bg, borderColor: borderC }]}>
      <View style={[card.topBar, { backgroundColor: isElite ? '#C9A227' : accentColor }]} />

      <View style={card.backContent}>
        {/* QR side */}
        <View style={card.qrSide}>
          <Text style={[card.backScanTxt, { color: isElite ? '#C9A227' : textS }]}>Scan to Verify</Text>
          <View style={[card.qrWrap, { borderColor: divC, backgroundColor: '#fff' }]}>
            <QRPattern size={90} color={qrColor} />
          </View>
          <Text style={[card.backIdTxt, { color: textM }]}>{player.id.toUpperCase().slice(0, 8)}</Text>
        </View>

        {/* Stats side */}
        <View style={[card.statsGrid, { borderLeftColor: divC }]}>
          {stats.map((s, i) => (
            <View key={i} style={[card.statCell, { borderBottomColor: divC }]}>
              <Text style={[card.statCellVal, { color: hlC }]}>{s.val}</Text>
              <Text style={[card.statCellLbl, { color: textS }]}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[card.footer, { backgroundColor: 'rgba(0,0,0,0.12)', borderTopColor: divC }]}>
        <Text style={[{ fontSize: 7, color: textM }]}>Property of the Academy. Not transferable.</Text>
        <Text style={[{ fontSize: 7, color: hlC, fontWeight: '700' }]}>2025</Text>
      </View>
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PlayerIDCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { players } = usePlayers();
  const { showAlert } = useAlert();
  const { Colors: C } = useTheme();
  const { config } = useAppConfig();

  const [theme, setTheme] = useState<CardTheme>('modern');
  const [flipped, setFlipped] = useState(false);
  const [selectedId, setSelectedId] = useState(id || players[0]?.id || '');

  const player = players.find(p => p.id === selectedId) || players[0];
  if (!player) return null;

  const levelColor = LEVEL_COLORS[player.level];
  const accentColor = levelColor;
  const academyName = config.shortAppName || config.academyName;

  const handleShare = useCallback(() => {
    Share.share({
      title: `${player.name} — ${academyName} ID`,
      message: `Player: ${player.name}\nID: ${player.id}\nRole: ${player.playingRole}\nLevel: ${LEVEL_NAMES[player.level]}\nPoints: ${player.points}\nRank: #${player.rank}`,
    });
  }, [player, academyName]);

  const handleDownload = useCallback(() => {
    showAlert('Download ID Card', 'The ID card will be saved to your device gallery in the published app.');
  }, [showAlert]);

  return (
    <View style={[st.container, { backgroundColor: C.bgDark }]}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 8, borderBottomColor: C.border, backgroundColor: C.bgCard }]}>
        <TouchableOpacity onPress={() => router.back()} style={[st.headerBtn, { backgroundColor: C.bgSurface }]}>
          <MaterialIcons name="arrow-back" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[st.headerTitle, { color: C.textPrimary }]}>Player ID Card</Text>
          <Text style={[st.headerSub, { color: C.textMuted }]}>{player.name}</Text>
        </View>
        <TouchableOpacity onPress={handleShare} style={[st.headerBtn, { backgroundColor: C.bgSurface }]}>
          <MaterialIcons name="share" size={18} color={accentColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[st.scroll, { paddingBottom: insets.bottom + 32 }]}>

        {/* Player picker */}
        <Text style={[st.sectionLabel, { color: C.textMuted }]}>Select Player</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row}>
          {players.map(p => {
            const lc = LEVEL_COLORS[p.level];
            const sel = selectedId === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[st.playerChip, { backgroundColor: C.bgCard, borderColor: C.border }, sel && { borderColor: lc, backgroundColor: lc + '10' }]}
                onPress={() => setSelectedId(p.id)}
                activeOpacity={0.75}
              >
                <View style={[st.pAvatar, { backgroundColor: lc + '20' }]}>
                  <Text style={[st.pAvatarTxt, { color: sel ? lc : C.textPrimary }]}>{p.name[0]}</Text>
                </View>
                <Text style={[st.pName, { color: sel ? lc : C.textMuted }, sel && { fontWeight: '700' }]}>
                  {p.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Theme selector */}
        <Text style={[st.sectionLabel, { color: C.textMuted }]}>Card Design</Text>
        <View style={st.themeRow}>
          {THEMES.map(d => (
            <TouchableOpacity
              key={d.key}
              style={[st.themeChip, { backgroundColor: C.bgCard, borderColor: C.border }, theme === d.key && { backgroundColor: C.primary + '12', borderColor: C.primary }]}
              onPress={() => setTheme(d.key)}
              activeOpacity={0.75}
            >
              <MaterialIcons name={d.icon as any} size={13} color={theme === d.key ? C.primary : C.textMuted} />
              <Text style={[st.themeChipText, { color: theme === d.key ? C.primary : C.textSecondary }, theme === d.key && { fontWeight: '700' }]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Front/Back toggle */}
        <View style={st.flipRow}>
          <TouchableOpacity
            style={[st.flipBtn, { backgroundColor: C.bgCard, borderColor: !flipped ? accentColor : C.border }]}
            onPress={() => setFlipped(false)}
          >
            <MaterialIcons name="credit-card" size={14} color={!flipped ? accentColor : C.textMuted} />
            <Text style={[st.flipBtnText, { color: !flipped ? accentColor : C.textSecondary }, !flipped && { fontWeight: '700' }]}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[st.flipBtn, { backgroundColor: C.bgCard, borderColor: flipped ? accentColor : C.border }]}
            onPress={() => setFlipped(true)}
          >
            <MaterialIcons name="qr-code" size={14} color={flipped ? accentColor : C.textMuted} />
            <Text style={[st.flipBtnText, { color: flipped ? accentColor : C.textSecondary }, flipped && { fontWeight: '700' }]}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* The Card */}
        <View style={{ alignItems: 'center', marginVertical: Spacing.xl }}>
          {flipped
            ? <CardBack player={player} theme={theme} accentColor={accentColor} C={C} />
            : <CardFront player={player} theme={theme} accentColor={accentColor} levelColor={levelColor} academyName={academyName} C={C} />}
        </View>

        {/* Actions */}
        <View style={st.actionRow}>
          <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handleShare}>
            <MaterialIcons name="share" size={17} color={C.info} />
            <Text style={[st.actionBtnText, { color: C.info }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={handleDownload}>
            <MaterialIcons name="file-download" size={17} color={C.success} />
            <Text style={[st.actionBtnText, { color: C.success }]}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[st.actionBtn, { backgroundColor: C.bgCard, borderColor: C.border }]} onPress={() => setFlipped(v => !v)}>
            <MaterialIcons name="flip" size={17} color={accentColor} />
            <Text style={[st.actionBtnText, { color: accentColor }]}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Info */}
        <View style={[st.infoCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <Text style={[st.infoCardTitle, { color: C.textPrimary }]}>Player Details</Text>
          {[
            { label: 'Age', value: `${player.age} years` },
            { label: 'Gender', value: player.gender },
            { label: 'Email', value: player.email },
            { label: 'Phone', value: player.phone },
            { label: 'Coach', value: player.coachName },
            { label: 'Batch', value: player.batch },
            { label: 'Joined', value: new Date(player.joiningDate).toLocaleDateString('en-IN') },
            { label: 'Experience', value: player.experience },
          ].map((row, i, arr) => (
            <View key={i} style={[st.infoRow, { borderBottomColor: i < arr.length - 1 ? C.border + '55' : 'transparent' }]}>
              <Text style={[st.infoLabel, { color: C.textSecondary }]}>{row.label}</Text>
              <Text style={[st.infoValue, { color: C.textPrimary }]}>{row.value}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Card Styles ──────────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    borderRadius: Radius.xl, borderWidth: 1.5, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  topBar: { height: 5, width: '100%' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  logoCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 18 },
  academyName: { fontSize: Typography.sm, fontWeight: '800' },
  academySub: { fontSize: 9, marginTop: 1 },
  yearTag: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  yearText: { fontSize: 10, fontWeight: '800' },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: Spacing.base, marginBottom: Spacing.sm },
  body: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm, flex: 1 },
  avatarRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography['2xl'], fontWeight: '800' },
  playerName: { fontSize: Typography.base, fontWeight: '800', marginBottom: 2 },
  playerRole: { fontSize: Typography.xs, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  levelText: { fontSize: 9, fontWeight: '700' },
  rankBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  rankText: { fontSize: 9, fontWeight: '700' },
  miniStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniStat: { alignItems: 'center' },
  miniStatVal: { fontSize: Typography.sm, fontWeight: '800' },
  miniStatLbl: { fontSize: 8 },
  miniDiv: { width: 1, height: 16 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 7, borderTopWidth: 1 },
  idLabel: { fontSize: 8, letterSpacing: 0.5 },
  idValue: { fontSize: Typography.xs, fontWeight: '700', fontFamily: 'monospace' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  statusText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Back
  backContent: { flex: 1, flexDirection: 'row' },
  qrSide: { width: 110, alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: Spacing.sm },
  backScanTxt: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  qrWrap: { borderRadius: 6, borderWidth: 1, padding: 4 },
  backIdTxt: { fontSize: 7, letterSpacing: 0.5, fontFamily: 'monospace' },
  statsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', borderLeftWidth: 1, paddingLeft: 2 },
  statCell: { width: '50%', paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  statCellVal: { fontSize: Typography.xs, fontWeight: '800' },
  statCellLbl: { fontSize: 8, marginTop: 1 },
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
  playerChip: { alignItems: 'center', gap: 4, padding: 8, borderRadius: Radius.md, borderWidth: 1, minWidth: 62 },
  pAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pAvatarTxt: { fontSize: Typography.sm, fontWeight: '700' },
  pName: { fontSize: 10 },
  themeRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  themeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  themeChipText: { fontSize: Typography.xs, fontWeight: '600' },
  flipRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  flipBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5 },
  flipBtnText: { fontSize: Typography.xs, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1 },
  actionBtnText: { fontSize: Typography.sm, fontWeight: '600' },
  infoCard: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1 },
  infoCardTitle: { fontSize: Typography.sm, fontWeight: '700', marginBottom: Spacing.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabel: { fontSize: Typography.xs },
  infoValue: { fontSize: Typography.xs, fontWeight: '600' },
});
