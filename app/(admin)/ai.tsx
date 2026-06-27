import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlayers } from '@/hooks/usePlayers';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { analyzePlayer, generateWeeklySummary, AIAnalysisType } from '@/services/aiService';
import { Player } from '@/types';

type AdminAITab = 'weekly' | 'players' | 'analysis';

const ANALYSIS_CARDS: { type: AIAnalysisType; label: string; icon: string; color: string; desc: string }[] = [
  { type: 'performance', label: 'Performance Analysis', icon: 'bar-chart', color: '#58A6FF', desc: 'Batting, bowling & overall assessment' },
  { type: 'training', label: 'Training Plan', icon: 'fitness-center', color: '#3FB950', desc: 'Personalized weekly training schedule' },
  { type: 'fitness', label: 'Fitness Assessment', icon: 'directions-run', color: '#FF7B00', desc: 'Fitness score, risks & targets' },
  { type: 'attendance', label: 'Attendance Insights', icon: 'event-available', color: '#FFD700', desc: 'Patterns, impact & action plan' },
  { type: 'fee_prediction', label: 'Fee Prediction', icon: 'payments', color: '#C77DFF', desc: 'Payment behavior & scholarship info' },
  { type: 'injury_risk', label: 'Injury Risk', icon: 'health-and-safety', color: '#F85149', desc: 'Risk assessment & prevention protocol' },
];

export default function AdminAIHub() {
  const insets = useSafeAreaInsets();
  const { players, fees } = usePlayers();
  const { Colors } = useTheme();
  const C = Colors;

  const [activeTab, setActiveTab] = useState<AdminAITab>('weekly');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysisType | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weeklyContent, setWeeklyContent] = useState('');
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyError, setWeeklyError] = useState('');

  const activePlayers = players.filter(p => p.isActive);

  const handleWeeklySummary = async () => {
    setWeeklyLoading(true);
    setWeeklyError('');
    setWeeklyContent('');
    const res = await generateWeeklySummary(players, fees);
    if (res.error) setWeeklyError(res.error);
    else setWeeklyContent(res.content);
    setWeeklyLoading(false);
  };

  const handleAnalyze = async () => {
    if (!selectedPlayer || !selectedAnalysis) return;
    setLoading(true);
    setError('');
    setResult('');
    const res = await analyzePlayer(selectedPlayer, selectedAnalysis, players);
    if (res.error) setError(res.error);
    else setResult(res.content);
    setLoading(false);
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return <Text key={i} style={[md.h2, { color: C.textPrimary }]}>{line.replace(/^#{1,2} /, '')}</Text>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={i} style={[md.bold, { color: C.textPrimary }]}>{line.replace(/\*\*/g, '')}</Text>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <View key={i} style={md.bullet}>
            <View style={[md.dot, { backgroundColor: C.primary }]} />
            <Text style={[md.bulletText, { color: C.textSecondary }]}>
              {line.replace(/^[•\-] /, '').replace(/\*\*/g, '')}
            </Text>
          </View>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <View key={i} style={md.bullet}>
            <Text style={[md.num, { color: C.primary }]}>{line.match(/^\d+/)?.[0]}.</Text>
            <Text style={[md.bulletText, { color: C.textSecondary }]}>
              {line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
            </Text>
          </View>
        );
      }
      if (line.trim() === '') return <View key={i} style={{ height: 8 }} />;
      return <Text key={i} style={[md.body, { color: C.textSecondary }]}>{line.replace(/\*\*/g, '')}</Text>;
    });
  };

  return (
    <View style={[s.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <View style={[s.headerIcon, { backgroundColor: C.info + '1A' }]}>
          <MaterialIcons name="auto-awesome" size={20} color={C.info} />
        </View>
        <View>
          <Text style={[s.title, { color: C.textPrimary }]}>AI Hub</Text>
          <Text style={[s.subtitle, { color: C.textSecondary }]}>Powered by Gemini AI</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[s.tabBar, { borderBottomColor: C.border }]}>
        {[
          { key: 'weekly', label: 'Weekly Summary', icon: 'summarize' },
          { key: 'players', label: 'Player Select', icon: 'person-search' },
          { key: 'analysis', label: 'Analysis', icon: 'insights' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, activeTab === t.key && { borderBottomColor: C.info, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(t.key as AdminAITab)}
          >
            <MaterialIcons name={t.icon as any} size={14} color={activeTab === t.key ? C.info : C.textMuted} />
            <Text style={[s.tabTxt, { color: activeTab === t.key ? C.info : C.textMuted },
              activeTab === t.key && { fontWeight: Typography.bold }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Weekly Summary Tab ─── */}
      {activeTab === 'weekly' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.padContent}>
          {/* Academy Stats Preview */}
          <View style={[s.statsRow, { gap: Spacing.sm }]}>
            {[
              { label: 'Players', value: players.length, icon: 'people', color: C.info },
              { label: 'Avg Att.', value: `${Math.round(activePlayers.reduce((s, p) => s + p.attendancePercentage, 0) / (activePlayers.length || 1))}%`, icon: 'event-available', color: C.success },
              { label: 'Overdue Fees', value: fees.filter(f => f.status === 'overdue').length, icon: 'warning', color: C.error },
            ].map((stat, i) => (
              <View key={i} style={[s.miniStat, { backgroundColor: C.bgCard, borderColor: C.border }]}>
                <MaterialIcons name={stat.icon as any} size={16} color={stat.color} />
                <Text style={[s.miniStatVal, { color: C.textPrimary }]}>{stat.value}</Text>
                <Text style={[s.miniStatLbl, { color: C.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[s.genBtn, { backgroundColor: C.info, opacity: weeklyLoading ? 0.7 : 1 }]}
            onPress={handleWeeklySummary}
            disabled={weeklyLoading}
            activeOpacity={0.85}
          >
            {weeklyLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialIcons name="auto-awesome" size={18} color="#fff" />
            )}
            <Text style={s.genBtnTxt}>{weeklyLoading ? 'Generating Summary...' : 'Generate Weekly Summary'}</Text>
          </TouchableOpacity>

          {weeklyError ? (
            <View style={[s.errorBox, { backgroundColor: C.error + '12', borderColor: C.error + '33' }]}>
              <MaterialIcons name="error-outline" size={16} color={C.error} />
              <Text style={[s.errorTxt, { color: C.error }]}>{weeklyError}</Text>
            </View>
          ) : null}

          {weeklyContent ? (
            <View style={[s.resultCard, { backgroundColor: C.bgCard, borderColor: C.info + '33' }]}>
              <View style={s.resultHeader}>
                <MaterialIcons name="auto-awesome" size={14} color={C.info} />
                <Text style={[s.resultLabel, { color: C.info }]}>AI Weekly Report</Text>
              </View>
              {renderMarkdown(weeklyContent)}
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* ─── Player Select Tab ─── */}
      {activeTab === 'players' && (
        <FlatList
          data={activePlayers}
          keyExtractor={p => p.id}
          contentContainerStyle={s.padContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[s.sectionLabel, { color: C.textSecondary }]}>
              Select a player to analyze
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                s.playerRow,
                { backgroundColor: C.bgCard, borderColor: C.border },
                selectedPlayer?.id === item.id && { borderColor: C.info, backgroundColor: C.info + '0E' },
              ]}
              onPress={() => { setSelectedPlayer(item); setResult(''); setActiveTab('analysis'); }}
              activeOpacity={0.8}
            >
              <View style={[s.playerAvatar, { backgroundColor: C.primary }]}>
                <Text style={[s.playerAvatarTxt, { color: C.textPrimary }]}>{item.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.playerName, { color: C.textPrimary }]}>{item.name}</Text>
                <Text style={[s.playerMeta, { color: C.textSecondary }]}>
                  {item.playingRole} · Rank #{item.rank} · {item.points.toLocaleString()} pts
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* ─── Analysis Tab ─── */}
      {activeTab === 'analysis' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.padContent}>
          {/* Selected Player */}
          {selectedPlayer ? (
            <View style={[s.selectedCard, { backgroundColor: C.bgCard, borderColor: C.info + '44' }]}>
              <View style={[s.playerAvatar, { backgroundColor: C.primary }]}>
                <Text style={[s.playerAvatarTxt, { color: C.textPrimary }]}>{selectedPlayer.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.playerName, { color: C.textPrimary }]}>{selectedPlayer.name}</Text>
                <Text style={[s.playerMeta, { color: C.textSecondary }]}>{selectedPlayer.playingRole} · #{selectedPlayer.rank}</Text>
              </View>
              <TouchableOpacity
                style={[s.changeBtn, { borderColor: C.border }]}
                onPress={() => setActiveTab('players')}
              >
                <Text style={[s.changeBtnTxt, { color: C.info }]}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.selectPrompt, { backgroundColor: C.bgCard, borderColor: C.info + '33' }]}
              onPress={() => setActiveTab('players')}
            >
              <MaterialIcons name="person-search" size={22} color={C.info} />
              <Text style={[s.selectPromptTxt, { color: C.textSecondary }]}>Tap to select a player</Text>
            </TouchableOpacity>
          )}

          {/* Analysis Type Grid */}
          <Text style={[s.sectionLabel, { color: C.textSecondary }]}>Choose analysis type</Text>
          <View style={s.analysisGrid}>
            {ANALYSIS_CARDS.map(card => (
              <TouchableOpacity
                key={card.type}
                style={[
                  s.analysisCard,
                  { backgroundColor: C.bgCard, borderColor: C.border },
                  selectedAnalysis === card.type && { borderColor: card.color, backgroundColor: card.color + '0E' },
                ]}
                onPress={() => { setSelectedAnalysis(card.type); setResult(''); }}
                activeOpacity={0.8}
              >
                <View style={[s.analysisIcon, { backgroundColor: card.color + '1A' }]}>
                  <MaterialIcons name={card.icon as any} size={20} color={card.color} />
                </View>
                <Text style={[s.analysisLabel, { color: C.textPrimary }]}>{card.label}</Text>
                <Text style={[s.analysisDesc, { color: C.textMuted }]}>{card.desc}</Text>
                {selectedAnalysis === card.type && (
                  <View style={[s.analysisCheck, { backgroundColor: card.color }]}>
                    <MaterialIcons name="check" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Run Analysis */}
          <TouchableOpacity
            style={[
              s.genBtn,
              { backgroundColor: C.info, marginTop: Spacing.sm, opacity: (!selectedPlayer || !selectedAnalysis || loading) ? 0.5 : 1 },
            ]}
            onPress={handleAnalyze}
            disabled={!selectedPlayer || !selectedAnalysis || loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <MaterialIcons name="auto-awesome" size={18} color="#fff" />}
            <Text style={s.genBtnTxt}>{loading ? 'Analyzing...' : 'Run AI Analysis'}</Text>
          </TouchableOpacity>

          {error ? (
            <View style={[s.errorBox, { backgroundColor: C.error + '12', borderColor: C.error + '33' }]}>
              <MaterialIcons name="error-outline" size={16} color={C.error} />
              <Text style={[s.errorTxt, { color: C.error }]}>{error}</Text>
            </View>
          ) : null}

          {result ? (
            <View style={[s.resultCard, { backgroundColor: C.bgCard, borderColor: C.info + '33' }]}>
              <View style={s.resultHeader}>
                <MaterialIcons name="auto-awesome" size={14} color={C.info} />
                <Text style={[s.resultLabel, { color: C.info }]}>
                  {ANALYSIS_CARDS.find(c => c.type === selectedAnalysis)?.label} — {selectedPlayer?.name}
                </Text>
              </View>
              {renderMarkdown(result)}
            </View>
          ) : null}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const md = StyleSheet.create({
  h2: { fontSize: Typography.sm, fontWeight: Typography.bold, marginTop: Spacing.sm, marginBottom: 4 },
  bold: { fontSize: Typography.sm, fontWeight: Typography.bold, marginBottom: 2 },
  body: { fontSize: Typography.xs, lineHeight: 20, marginBottom: 2 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4, paddingLeft: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  num: { fontSize: Typography.xs, fontWeight: Typography.bold, marginRight: 2, minWidth: 16 },
  bulletText: { flex: 1, fontSize: Typography.xs, lineHeight: 18 },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  headerIcon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.xs, marginTop: 1 },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1,
    paddingHorizontal: Spacing.base,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabTxt: { fontSize: 11, fontWeight: Typography.medium },
  padContent: { padding: Spacing.base },
  statsRow: { flexDirection: 'row', marginBottom: Spacing.base },
  miniStat: {
    flex: 1, alignItems: 'center', gap: 4, borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1,
  },
  miniStatVal: { fontSize: Typography.base, fontWeight: Typography.extrabold },
  miniStatLbl: { fontSize: 10 },
  genBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: Radius.xl, paddingVertical: 14, marginBottom: Spacing.base,
  },
  genBtnTxt: { fontSize: Typography.base, fontWeight: Typography.bold, color: '#fff' },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.base,
  },
  errorTxt: { flex: 1, fontSize: Typography.xs, lineHeight: 18 },
  resultCard: {
    borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1,
    marginBottom: Spacing.base,
  },
  resultHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: Spacing.md, paddingBottom: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(88,166,255,0.2)',
  },
  resultLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, flex: 1 },
  sectionLabel: { fontSize: Typography.xs, fontWeight: Typography.medium, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  playerRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, marginBottom: Spacing.sm,
  },
  playerAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  playerAvatarTxt: { fontSize: Typography.base, fontWeight: Typography.bold },
  playerName: { fontSize: Typography.sm, fontWeight: Typography.semibold },
  playerMeta: { fontSize: Typography.xs, marginTop: 1 },
  selectedCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5, marginBottom: Spacing.base,
  },
  changeBtn: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.md, borderWidth: 1 },
  changeBtnTxt: { fontSize: Typography.xs, fontWeight: Typography.semibold },
  selectPrompt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.xl, borderRadius: Radius.xl,
    borderWidth: 1.5, borderStyle: 'dashed', marginBottom: Spacing.base,
  },
  selectPromptTxt: { fontSize: Typography.sm },
  analysisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  analysisCard: {
    width: '48%', borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1.5, position: 'relative',
  },
  analysisIcon: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  analysisLabel: { fontSize: Typography.xs, fontWeight: Typography.bold, marginBottom: 3 },
  analysisDesc: { fontSize: 10, lineHeight: 14 },
  analysisCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
});
