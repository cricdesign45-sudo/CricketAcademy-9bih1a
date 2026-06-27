import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { usePlayers } from '@/hooks/usePlayers';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Player } from '@/types';

const { width } = Dimensions.get('window');

type ReportTab = 'batting' | 'bowling' | 'wicketkeeping' | 'allrounder' | 'coach' | 'insights';

export default function PlayerReport() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { players } = usePlayers();
  const { Colors } = useTheme();
  const C = Colors;
  const [activeTab, setActiveTab] = useState<ReportTab>('batting');
  const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const player = players.find(p => p.id === user?.playerId) || players[0];
  if (!player) return null;

  const ss = player.skillScores;
  const ce = player.coachEvaluation;

  // Determine which tabs are relevant based on role
  const isWicketkeeper = player.playingRole === 'Wicket-keeper';
  const isAllRounder = player.playingRole === 'All-rounder';
  const isBowler = player.playingRole.includes('Bowler');

  const TABS: { key: ReportTab; label: string; icon: string }[] = [
    { key: 'batting', label: 'Batting', icon: 'sports-cricket' },
    { key: 'bowling', label: 'Bowling', icon: 'air' },
    ...(isWicketkeeper ? [{ key: 'wicketkeeping' as ReportTab, label: 'Keeping', icon: 'sports' }] : []),
    ...(isAllRounder ? [{ key: 'allrounder' as ReportTab, label: 'Overall', icon: 'star' }] : []),
    { key: 'coach', label: 'Coach', icon: 'school' },
    { key: 'insights', label: 'AI Insights', icon: 'auto-awesome' },
  ];

  const avgSkill = (skills: Record<string, number>) => {
    const vals = Object.values(skills);
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10;
  };

  const battingRating = avgSkill(ss.batting);
  const bowlingRating = avgSkill(ss.bowling);
  const keepingRating = avgSkill(ss.wicketkeeping);
  const allRounderRating = avgSkill(ss.allRounder);

  const SkillBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <View style={sk.row}>
      <Text style={[sk.label, { color: C.textSecondary }]}>{label}</Text>
      <View style={sk.barWrap}>
        <View style={[sk.barBg, { backgroundColor: C.bgSurface }]}>
          <View style={[sk.barFill, { width: `${(value / 10) * 100}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={[sk.score, { color }]}>{value}/10</Text>
      </View>
    </View>
  );

  const RatingCircle = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <View style={[rc.wrap, { backgroundColor: C.bgCard, borderColor: C.border }]}>
      <View style={[rc.outer, { borderColor: color + '44' }]}>
        <View style={[rc.inner, { backgroundColor: color + '1A', borderColor: color }]}>
          <Text style={[rc.value, { color }]}>{value.toFixed(1)}</Text>
          <Text style={[rc.max, { color: C.textMuted }]}>/10</Text>
        </View>
      </View>
      <Text style={[rc.label, { color: C.textPrimary }]}>{label}</Text>
    </View>
  );

  const renderBatting = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <View style={s.ratingsRow}>
        <RatingCircle value={battingRating} label="Batting Rating" color={C.gold} />
        <View style={[s.miniStats, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <MiniStat label="Matches" value={player.batting.matches.toString()} C={C} />
          <MiniStat label="Runs" value={player.batting.runs.toString()} C={C} />
          <MiniStat label="Avg" value={player.batting.average.toFixed(1)} C={C} />
          <MiniStat label="SR" value={player.batting.strikeRate.toFixed(1)} C={C} />
          <MiniStat label="HS" value={player.batting.highestScore.toString()} C={C} />
          <MiniStat label="4s+6s" value={player.batting.boundaries.toString()} C={C} />
        </View>
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Technique & Fundamentals</Text>
        <SkillBar label="Technique" value={ss.batting.technique} color={C.info} />
        <SkillBar label="Footwork" value={ss.batting.footwork} color={C.info} />
        <SkillBar label="Shot Selection" value={ss.batting.shotSelection} color={C.info} />
        <SkillBar label="Match Temperament" value={ss.batting.matchTemperament} color={C.info} />
        <SkillBar label="Defensive Skills" value={ss.batting.defensiveSkills} color={C.info} />
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Shot Arsenal</Text>
        <SkillBar label="Cover Drive" value={ss.batting.coverDrive} color={C.success} />
        <SkillBar label="Straight Drive" value={ss.batting.straightDrive} color={C.success} />
        <SkillBar label="Pull Shot" value={ss.batting.pullShot} color={C.success} />
        <SkillBar label="Cut Shot" value={ss.batting.cutShot} color={C.success} />
        <SkillBar label="Sweep Shot" value={ss.batting.sweepShot} color={C.success} />
        <SkillBar label="Power Hitting" value={ss.batting.powerHitting} color={C.success} />
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Game Intelligence</Text>
        <SkillBar label="Strike Rotation" value={ss.batting.strikeRotation} color={C.chart4} />
        <SkillBar label="Running Between Wickets" value={ss.batting.runsBetweenWickets} color={C.chart4} />
        <SkillBar label="Front Foot Play" value={ss.batting.frontFootPlay} color={C.chart4} />
        <SkillBar label="Back Foot Play" value={ss.batting.backFootPlay} color={C.chart4} />
        <SkillBar label="Spin Playing" value={ss.batting.spinPlaying} color={C.chart4} />
        <SkillBar label="Pace Playing" value={ss.batting.pacePlaying} color={C.chart4} />
        <SkillBar label="Consistency" value={ss.batting.consistency} color={C.chart4} />
      </View>
    </ScrollView>
  );

  const renderBowling = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <View style={s.ratingsRow}>
        <RatingCircle value={bowlingRating} label="Bowling Rating" color={C.error} />
        <View style={[s.miniStats, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <MiniStat label="Overs" value={player.bowling.overs.toString()} C={C} />
          <MiniStat label="Wickets" value={player.bowling.wickets.toString()} C={C} />
          <MiniStat label="Economy" value={player.bowling.economyRate.toFixed(1)} C={C} />
          <MiniStat label="Best" value={player.bowling.bestFigures} C={C} />
          <MiniStat label="Avg" value={player.bowling.average > 0 ? player.bowling.average.toFixed(1) : 'N/A'} C={C} />
          <MiniStat label="W/Match" value={player.batting.matches > 0 ? (player.bowling.wickets / player.batting.matches).toFixed(1) : '0'} C={C} />
        </View>
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Mechanics</Text>
        <SkillBar label="Bowling Action" value={ss.bowling.action} color={C.error} />
        <SkillBar label="Run-up" value={ss.bowling.runUp} color={C.error} />
        <SkillBar label="Seam Position" value={ss.bowling.seamPosition} color={C.error} />
        <SkillBar label="Pace" value={ss.bowling.pace} color={C.error} />
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Variations</Text>
        <SkillBar label="Swing" value={ss.bowling.swing} color={C.chart4} />
        <SkillBar label="Reverse Swing" value={ss.bowling.reverseSwing} color={C.chart4} />
        <SkillBar label="Spin Control" value={ss.bowling.spinControl} color={C.chart4} />
        <SkillBar label="Flight" value={ss.bowling.flight} color={C.chart4} />
        <SkillBar label="Drift" value={ss.bowling.drift} color={C.chart4} />
        <SkillBar label="Turn" value={ss.bowling.turn} color={C.chart4} />
        <SkillBar label="Variation" value={ss.bowling.variation} color={C.chart4} />
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Control & Match Skills</Text>
        <SkillBar label="Line" value={ss.bowling.line} color={C.success} />
        <SkillBar label="Length" value={ss.bowling.length} color={C.success} />
        <SkillBar label="Yorker Accuracy" value={ss.bowling.yorkerAccuracy} color={C.success} />
        <SkillBar label="Bouncer Accuracy" value={ss.bowling.bouncerAccuracy} color={C.success} />
        <SkillBar label="Economy" value={ss.bowling.economy} color={C.success} />
        <SkillBar label="Death Bowling" value={ss.bowling.deathBowling} color={C.success} />
        <SkillBar label="Powerplay Bowling" value={ss.bowling.powerplayBowling} color={C.success} />
        <SkillBar label="Wicket Taking" value={ss.bowling.wicketTaking} color={C.success} />
        <SkillBar label="Match Consistency" value={ss.bowling.matchConsistency} color={C.success} />
      </View>
    </ScrollView>
  );

  const renderWicketkeeping = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <View style={s.ratingsRow}>
        <RatingCircle value={keepingRating} label="Keeping Rating" color={C.info} />
        <View style={[s.miniStats, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <MiniStat label="Catches" value={player.fielding.catches.toString()} C={C} />
          <MiniStat label="Stumpings" value={player.fielding.stumpings.toString()} C={C} />
          <MiniStat label="Run Outs" value={player.fielding.runOuts.toString()} C={C} />
          <MiniStat label="Runs" value={player.batting.runs.toString()} C={C} />
          <MiniStat label="SR" value={player.batting.strikeRate.toFixed(1)} C={C} />
          <MiniStat label="Field Pts" value={player.fielding.fieldingPoints.toString()} C={C} />
        </View>
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Gloves & Catching</Text>
        <SkillBar label="Gloves Technique" value={ss.wicketkeeping.glovesTechnique} color={C.info} />
        <SkillBar label="Standing Up Collection" value={ss.wicketkeeping.standingUp} color={C.info} />
        <SkillBar label="Standing Back Collection" value={ss.wicketkeeping.standingBack} color={C.info} />
        <SkillBar label="Catching" value={ss.wicketkeeping.catching} color={C.info} />
        <SkillBar label="Diving" value={ss.wicketkeeping.diving} color={C.info} />
        <SkillBar label="Reflexes" value={ss.wicketkeeping.reflexes} color={C.info} />
        <SkillBar label="Stumping" value={ss.wicketkeeping.stumping} color={C.info} />
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Athleticism & Leadership</Text>
        <SkillBar label="Throw Accuracy" value={ss.wicketkeeping.throwAccuracy} color={C.success} />
        <SkillBar label="Run Out Success" value={ss.wicketkeeping.runOutSuccess} color={C.success} />
        <SkillBar label="Footwork" value={ss.wicketkeeping.footwork} color={C.success} />
        <SkillBar label="Communication" value={ss.wicketkeeping.communication} color={C.success} />
        <SkillBar label="Decision Making" value={ss.wicketkeeping.decisionMaking} color={C.success} />
        <SkillBar label="Fitness & Agility" value={ss.wicketkeeping.fitnessAgility} color={C.success} />
        <SkillBar label="Match Awareness" value={ss.wicketkeeping.matchAwareness} color={C.success} />
        <SkillBar label="Leadership" value={ss.wicketkeeping.leadership} color={C.success} />
      </View>
    </ScrollView>
  );

  const renderAllRounder = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <View style={s.allRatingsRow}>
        <RatingCircle value={battingRating} label="Batting" color={C.gold} />
        <RatingCircle value={bowlingRating} label="Bowling" color={C.error} />
        <RatingCircle value={allRounderRating} label="Overall" color={C.chart4} />
      </View>
      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>All-rounder Attributes</Text>
        <SkillBar label="Adaptability" value={ss.allRounder.adaptability} color={C.chart4} />
        <SkillBar label="Match Awareness" value={ss.allRounder.matchAwareness} color={C.chart4} />
        <SkillBar label="Pressure Handling" value={ss.allRounder.pressureHandling} color={C.chart4} />
        <SkillBar label="Team Contribution" value={ss.allRounder.teamContribution} color={C.chart4} />
        <SkillBar label="Leadership" value={ss.allRounder.leadership} color={C.chart4} />
        <SkillBar label="Fitness" value={ss.allRounder.fitness} color={C.chart4} />
        <SkillBar label="Running Between Wickets" value={ss.allRounder.runsBetweenWickets} color={C.chart4} />
        <SkillBar label="Fielding" value={ss.allRounder.fielding} color={C.chart4} />
        <SkillBar label="Consistency" value={ss.allRounder.consistency} color={C.chart4} />
        <SkillBar label="Match Impact" value={ss.allRounder.matchImpact} color={C.chart4} />
      </View>
    </ScrollView>
  );

  const renderCoach = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <View style={[s.coachHeader, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <View style={[s.coachAvatar, { backgroundColor: C.primary + '22', borderColor: C.primary }]}>
          <Text style={[s.coachAvatarText, { color: C.textPrimary }]}>C</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.coachName, { color: C.textPrimary }]}>{player.coachName}</Text>
          <Text style={[s.coachDate, { color: C.textSecondary }]}>Evaluated: {new Date(ce.evaluatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          <View style={[s.overallRatingBadge, { backgroundColor: C.gold + '1A', borderColor: C.gold + '44' }]}>
            <MaterialIcons name="star" size={12} color={C.gold} />
            <Text style={[s.overallRatingText, { color: C.gold }]}>Overall: {ce.overallRating}/10</Text>
          </View>
        </View>
      </View>

      <View style={[s.skillCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <Text style={[s.skillCardTitle, { color: C.textSecondary }]}>Coach Evaluation (1–10)</Text>
        <SkillBar label="Discipline" value={ce.discipline} color={C.info} />
        <SkillBar label="Attitude" value={ce.attitude} color={C.info} />
        <SkillBar label="Teamwork" value={ce.teamwork} color={C.success} />
        <SkillBar label="Hard Work" value={ce.hardWork} color={C.success} />
        <SkillBar label="Learning Ability" value={ce.learningAbility} color={C.success} />
        <SkillBar label="Communication" value={ce.communication} color={C.chart4} />
        <SkillBar label="Leadership" value={ce.leadership} color={C.chart4} />
        <SkillBar label="Confidence" value={ce.confidence} color={C.chart4} />
        <SkillBar label="Mental Strength" value={ce.mentalStrength} color={C.warning} />
        <SkillBar label="Match Awareness" value={ce.matchAwareness} color={C.warning} />
      </View>

      <View style={[s.remarksCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <View style={s.remarksHeader}>
          <MaterialIcons name="format-quote" size={18} color={C.primary} />
          <Text style={[s.remarksTitle, { color: C.textPrimary }]}>Coach Remarks</Text>
        </View>
        <Text style={[s.remarksText, { color: C.textSecondary }]}>{ce.remarks}</Text>
      </View>
    </ScrollView>
  );

  const renderInsights = () => {
    const strengths = [
      battingRating >= 7.5 ? `Excellent batting average of ${battingRating.toFixed(1)}/10` : null,
      bowlingRating >= 7.5 ? `Strong bowling skills at ${bowlingRating.toFixed(1)}/10` : null,
      player.attendancePercentage >= 90 ? `Outstanding attendance at ${player.attendancePercentage}%` : null,
      player.fitness.fitnessScore >= 85 ? `Top fitness score of ${player.fitness.fitnessScore}` : null,
      player.disciplinePoints >= 150 ? 'Excellent discipline record' : null,
    ].filter(Boolean).slice(0, 5) as string[];

    const weaknesses = [
      battingRating < 6 ? 'Batting technique needs significant improvement' : null,
      bowlingRating < 6 ? 'Bowling skills require focused training' : null,
      player.attendancePercentage < 80 ? `Attendance at ${player.attendancePercentage}% is below 80% target` : null,
      player.fitness.fitnessScore < 75 ? 'Fitness level needs improvement' : null,
      player.disciplinePoints < 80 ? 'Discipline points need improvement' : null,
    ].filter(Boolean).slice(0, 5) as string[];

    const readinessScore = Math.round((player.attendancePercentage + player.fitness.fitnessScore + battingRating * 10 + bowlingRating * 10) / 4);
    const predictedRating = Math.round(((battingRating + bowlingRating) / 2 * 1.05) * 10) / 10;

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
        {/* Readiness Score */}
        <View style={[s.readinessCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
          <View style={[s.readinessRing, { borderColor: C.chart4 + '44' }]}>
            <View style={[s.readinessCore, { backgroundColor: C.chart4 + '1A', borderColor: C.chart4 }]}>
              <Text style={[s.readinessScore, { color: C.chart4 }]}>{readinessScore}</Text>
              <Text style={[s.readinessLabel, { color: C.textMuted }]}>READY</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.readinessTitle, { color: C.textPrimary }]}>Match Readiness Score</Text>
            <Text style={[s.readinessDesc, { color: C.textSecondary }]}>
              {readinessScore >= 80 ? 'Ready for competitive matches' : readinessScore >= 65 ? 'Nearly match-ready, minor improvements needed' : 'More training required before matches'}
            </Text>
            <View style={[s.predictedPill, { backgroundColor: C.info + '1A', borderColor: C.info + '33' }]}>
              <MaterialIcons name="timeline" size={12} color={C.info} />
              <Text style={[s.predictedText, { color: C.info }]}>Predicted rating in 3 months: {predictedRating}/10</Text>
            </View>
          </View>
        </View>

        {/* Top Strengths */}
        <View style={[s.insightCard, { backgroundColor: C.bgCard, borderColor: C.success + '33' }]}>
          <View style={s.insightHeader}>
            <View style={[s.insightIconBox, { backgroundColor: C.success + '1A' }]}>
              <MaterialIcons name="thumb-up" size={16} color={C.success} />
            </View>
            <Text style={[s.insightTitle, { color: C.textPrimary }]}>Top 5 Strengths</Text>
          </View>
          {strengths.length > 0 ? strengths.map((s2, i) => (
            <View key={i} style={[ins.item, { borderBottomColor: C.border + '44' }]}>
              <View style={[ins.dot, { backgroundColor: C.success }]} />
              <Text style={[ins.text, { color: C.textSecondary }]}>{s2}</Text>
            </View>
          )) : <Text style={[{ color: C.textMuted, fontSize: Typography.sm }]}>Keep training to unlock strengths!</Text>}
        </View>

        {/* Top Weaknesses */}
        <View style={[s.insightCard, { backgroundColor: C.bgCard, borderColor: C.warning + '33' }]}>
          <View style={s.insightHeader}>
            <View style={[s.insightIconBox, { backgroundColor: C.warning + '1A' }]}>
              <MaterialIcons name="build" size={16} color={C.warning} />
            </View>
            <Text style={[s.insightTitle, { color: C.textPrimary }]}>Areas to Improve</Text>
          </View>
          {weaknesses.length > 0 ? weaknesses.map((w, i) => (
            <View key={i} style={[ins.item, { borderBottomColor: C.border + '44' }]}>
              <View style={[ins.dot, { backgroundColor: C.warning }]} />
              <Text style={[ins.text, { color: C.textSecondary }]}>{w}</Text>
            </View>
          )) : <Text style={[{ color: C.success, fontSize: Typography.sm }]}>No major weaknesses detected. Keep it up!</Text>}
        </View>

        {/* Training Recommendations */}
        <View style={[s.insightCard, { backgroundColor: C.bgCard, borderColor: C.info + '33' }]}>
          <View style={s.insightHeader}>
            <View style={[s.insightIconBox, { backgroundColor: C.info + '1A' }]}>
              <MaterialIcons name="fitness-center" size={16} color={C.info} />
            </View>
            <Text style={[s.insightTitle, { color: C.textPrimary }]}>Personalized Training Plan</Text>
          </View>
          {[
            player.batting.strikeRate < 100 ? 'Focus on aggressive shot-making in batting nets' : null,
            player.bowling.economyRate > 8 ? 'Work on line and length drills to reduce economy' : null,
            player.fitness.fitnessScore < 80 ? 'Add 30 min cardio sessions 3x per week' : null,
            player.attendancePercentage < 85 ? 'Improve attendance consistency for better rhythm' : null,
            'Practice 15 min of mental conditioning daily',
          ].filter(Boolean).map((tip, i) => (
            <View key={i} style={[ins.item, { borderBottomColor: C.border + '44' }]}>
              <MaterialIcons name="chevron-right" size={14} color={C.info} />
              <Text style={[ins.text, { color: C.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Injury Risk */}
        <View style={[s.insightCard, { backgroundColor: C.bgCard, borderColor: C.error + '22' }]}>
          <View style={s.insightHeader}>
            <View style={[s.insightIconBox, { backgroundColor: C.error + '1A' }]}>
              <MaterialIcons name="health-and-safety" size={16} color={C.error} />
            </View>
            <Text style={[s.insightTitle, { color: C.textPrimary }]}>Injury Risk Assessment</Text>
          </View>
          <View style={[ins.riskRow, { backgroundColor: player.fitness.fitnessScore >= 80 ? C.success + '1A' : C.warning + '1A', borderColor: player.fitness.fitnessScore >= 80 ? C.success + '33' : C.warning + '33' }]}>
            <MaterialIcons name={player.fitness.fitnessScore >= 80 ? 'check-circle' : 'warning'} size={16} color={player.fitness.fitnessScore >= 80 ? C.success : C.warning} />
            <Text style={[{ color: player.fitness.fitnessScore >= 80 ? C.success : C.warning, fontSize: Typography.sm, fontWeight: Typography.semibold }]}>
              {player.fitness.fitnessScore >= 80 ? 'Low Injury Risk — Good Fitness' : 'Moderate Risk — Improve Fitness'}
            </Text>
          </View>
          <View style={[ins.item, { borderBottomColor: C.border + '44' }]}>
            <View style={[ins.dot, { backgroundColor: C.textMuted }]} />
            <Text style={[ins.text, { color: C.textSecondary }]}>Always warm up before training sessions</Text>
          </View>
          <View style={[ins.item, { borderBottomColor: C.border + '44' }]}>
            <View style={[ins.dot, { backgroundColor: C.textMuted }]} />
            <Text style={[ins.text, { color: C.textSecondary }]}>Adequate rest between intense sessions</Text>
          </View>
        </View>

        {/* Progress Comparison */}
        <View style={[s.insightCard, { backgroundColor: C.bgCard, borderColor: C.chart4 + '33' }]}>
          <View style={s.insightHeader}>
            <View style={[s.insightIconBox, { backgroundColor: C.chart4 + '1A' }]}>
              <MaterialIcons name="trending-up" size={16} color={C.chart4} />
            </View>
            <Text style={[s.insightTitle, { color: C.textPrimary }]}>Progress Summary</Text>
          </View>
          <View style={ins.progressGrid}>
            <ProgItem label="Rank" prev={`#${player.previousRank}`} curr={`#${player.rank}`} improved={player.rank < player.previousRank} C={C} />
            <ProgItem label="Points" prev="—" curr={player.points.toLocaleString()} improved={true} C={C} />
            <ProgItem label="Attendance" prev="—" curr={`${player.attendancePercentage}%`} improved={player.attendancePercentage >= 85} C={C} />
            <ProgItem label="Fitness" prev="—" curr={player.fitness.fitnessScore.toString()} improved={player.fitness.fitnessScore >= 75} C={C} />
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[s.container, { backgroundColor: C.bgDark, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <View>
          <Text style={[s.title, { color: C.textPrimary }]}>Progress Report</Text>
          <Text style={[s.subtitle, { color: C.textSecondary }]}>{player.name} · {player.playingRole}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5 }}>
          {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, { backgroundColor: C.bgCard, borderColor: C.border }, reportPeriod === p && { backgroundColor: C.primary, borderColor: C.primaryLight }]}
              onPress={() => setReportPeriod(p)}
            >
              <Text style={[s.periodText, { color: reportPeriod === p ? C.textPrimary : C.textSecondary }, reportPeriod === p && { fontWeight: Typography.bold }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Player Summary Card */}
      <View style={[s.summaryCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
        <View style={[s.summAvatar, { backgroundColor: C.primary, borderColor: C.gold + '55' }]}>
          <Text style={[s.summAvatarText, { color: C.textPrimary }]}>{player.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.summName, { color: C.textPrimary }]}>{player.name}</Text>
          <Text style={[s.summMeta, { color: C.textSecondary }]}>Batch {player.batch} · {player.ageGroup} · {player.playingRole}</Text>
          <Text style={[s.summCoach, { color: C.textMuted }]}>{player.coachName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          <View style={[s.rankBadge, { backgroundColor: C.gold + '1A', borderColor: C.gold + '33' }]}>
            <Text style={[s.rankBadgeText, { color: C.gold }]}>#{player.rank} · {player.rankTier}</Text>
          </View>
          <Text style={[s.pointsDisplay, { color: C.textPrimary }]}>{player.points.toLocaleString()} pts</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabsScroll, { borderBottomColor: C.border }]} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center', paddingVertical: 8 }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tabBtn, { backgroundColor: C.bgCard, borderColor: C.border }, activeTab === tab.key && { backgroundColor: C.primary, borderColor: C.primaryLight }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons name={tab.icon as any} size={13} color={activeTab === tab.key ? C.textPrimary : C.textMuted} />
            <Text style={[s.tabBtnText, { color: activeTab === tab.key ? C.textPrimary : C.textSecondary }, activeTab === tab.key && { fontWeight: Typography.bold }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 'batting' && renderBatting()}
      {activeTab === 'bowling' && renderBowling()}
      {activeTab === 'wicketkeeping' && renderWicketkeeping()}
      {activeTab === 'allrounder' && renderAllRounder()}
      {activeTab === 'coach' && renderCoach()}
      {activeTab === 'insights' && renderInsights()}
    </View>
  );
}

function MiniStat({ label, value, C }: { label: string; value: string; C: any }) {
  return (
    <View style={ms.item}>
      <Text style={[ms.value, { color: C.textPrimary }]}>{value}</Text>
      <Text style={[ms.label, { color: C.textMuted }]}>{label}</Text>
    </View>
  );
}

function ProgItem({ label, prev, curr, improved, C }: any) {
  return (
    <View style={[pi.item, { backgroundColor: C.bgSurface, borderColor: C.border }]}>
      <Text style={[pi.label, { color: C.textMuted }]}>{label}</Text>
      <Text style={[pi.curr, { color: improved ? C.success : C.error }]}>{curr}</Text>
      {prev !== '—' && <Text style={[pi.prev, { color: C.textMuted }]}>was {prev}</Text>}
    </View>
  );
}

const sk = StyleSheet.create({
  row: { marginBottom: Spacing.sm },
  label: { fontSize: Typography.xs, marginBottom: 3 },
  barWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg: { flex: 1, height: 7, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  score: { fontSize: Typography.xs, fontWeight: Typography.bold, minWidth: 32, textAlign: 'right' },
});

const rc = StyleSheet.create({
  wrap: { alignItems: 'center', borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, gap: 6, minWidth: 120 },
  outer: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 78, height: 78, borderRadius: 39, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  max: { fontSize: Typography.xs },
  label: { fontSize: Typography.xs, fontWeight: Typography.semibold, textAlign: 'center' },
});

const ms = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  value: { fontSize: Typography.sm, fontWeight: Typography.bold },
  label: { fontSize: 9 },
});

const ins = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 7, borderBottomWidth: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  text: { flex: 1, fontSize: Typography.xs, lineHeight: 18 },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  progressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});

const pi = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, gap: 2, minWidth: '45%' },
  label: { fontSize: Typography.xs },
  curr: { fontSize: Typography.base, fontWeight: Typography.bold },
  prev: { fontSize: Typography.xs },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.sm, borderBottomWidth: 1, gap: Spacing.sm },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold },
  subtitle: { fontSize: Typography.xs, marginTop: 1 },
  periodBtn: { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1 },
  periodText: { fontSize: Typography.xs },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, margin: Spacing.base, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  summAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  summAvatarText: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  summName: { fontSize: Typography.sm, fontWeight: Typography.bold },
  summMeta: { fontSize: Typography.xs, marginTop: 1 },
  summCoach: { fontSize: Typography.xs, marginTop: 1 },
  rankBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  rankBadgeText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  pointsDisplay: { fontSize: Typography.sm, fontWeight: Typography.bold },
  tabsScroll: { maxHeight: 50, borderBottomWidth: 1 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1 },
  tabBtnText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  tabContent: { padding: Spacing.base, paddingBottom: 40 },
  ratingsRow: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.base },
  allRatingsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base, justifyContent: 'center' },
  miniStats: { flex: 1, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  skillCard: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.base },
  skillCardTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.md },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.base },
  coachAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  coachAvatarText: { fontSize: Typography.xl, fontWeight: Typography.extrabold },
  coachName: { fontSize: Typography.base, fontWeight: Typography.bold },
  coachDate: { fontSize: Typography.xs, marginTop: 2 },
  overallRatingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1, alignSelf: 'flex-start', marginTop: 5 },
  overallRatingText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  remarksCard: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1 },
  remarksHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  remarksTitle: { fontSize: Typography.sm, fontWeight: Typography.bold },
  remarksText: { fontSize: Typography.sm, lineHeight: 22 },
  readinessCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base, borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.base },
  readinessRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  readinessCore: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  readinessScore: { fontSize: 26, fontWeight: Typography.extrabold },
  readinessLabel: { fontSize: 8, fontWeight: Typography.bold, letterSpacing: 1 },
  readinessTitle: { fontSize: Typography.sm, fontWeight: Typography.bold, marginBottom: 4 },
  readinessDesc: { fontSize: Typography.xs, lineHeight: 18, marginBottom: 6 },
  predictedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, alignSelf: 'flex-start' },
  predictedText: { fontSize: Typography.xs, fontWeight: Typography.medium },
  insightCard: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.base },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  insightIconBox: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: Typography.sm, fontWeight: Typography.bold },
});
