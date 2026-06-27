import { Player, AttendanceRecord, PointsEntry, Achievement, Notification, Feedback, Fee, SkillScores, CoachEvaluation, RankTier, PointRule, RankLevelInfo } from '@/types';

// ─── POINTS RULES ────────────────────────────────────────────────────────────
export const ATTENDANCE_POINTS: PointRule[] = [
  { label: 'Present', points: 10, category: 'attendance', subCategory: 'present' },
  { label: 'Approved Leave', points: 0, category: 'attendance', subCategory: 'approved_leave' },
  { label: 'Absent', points: -10, category: 'attendance', subCategory: 'absent' },
  { label: 'Late Arrival', points: -5, category: 'attendance', subCategory: 'late' },
  { label: 'Early Check-out', points: -3, category: 'attendance', subCategory: 'early_checkout' },
];

export const ATTENDANCE_BONUSES: PointRule[] = [
  { label: 'Full Month Attendance', points: 500, category: 'bonus', subCategory: 'full_month' },
  { label: '15 Consecutive Days', points: 100, category: 'bonus', subCategory: 'consecutive_15' },
  { label: 'Weekly Perfect Attendance', points: 50, category: 'bonus', subCategory: 'weekly_perfect' },
  { label: '3 Months Perfect Attendance', points: 1500, category: 'bonus', subCategory: 'perfect_3m' },
  { label: '6 Months Perfect Attendance', points: 3500, category: 'bonus', subCategory: 'perfect_6m' },
  { label: '12 Months Perfect Attendance', points: 8000, category: 'bonus', subCategory: 'perfect_12m' },
];

export const TRAINING_POINTS: PointRule[] = [
  { label: 'Batting - Excellent', points: 40, category: 'training', subCategory: 'batting_excellent' },
  { label: 'Batting - Good', points: 25, category: 'training', subCategory: 'batting_good' },
  { label: 'Batting - Average', points: 15, category: 'training', subCategory: 'batting_average' },
  { label: 'Batting - Poor', points: 5, category: 'training', subCategory: 'batting_poor' },
  { label: 'Bowling - Excellent', points: 40, category: 'training', subCategory: 'bowling_excellent' },
  { label: 'Bowling - Good', points: 25, category: 'training', subCategory: 'bowling_good' },
  { label: 'Bowling - Average', points: 15, category: 'training', subCategory: 'bowling_average' },
  { label: 'Bowling - Poor', points: 5, category: 'training', subCategory: 'bowling_poor' },
  { label: 'Fielding - Excellent', points: 30, category: 'training', subCategory: 'fielding_excellent' },
  { label: 'Fielding - Good', points: 20, category: 'training', subCategory: 'fielding_good' },
  { label: 'Fielding - Average', points: 10, category: 'training', subCategory: 'fielding_average' },
  { label: 'Fielding - Poor', points: 5, category: 'training', subCategory: 'fielding_poor' },
  { label: 'Fitness - Completed', points: 20, category: 'training', subCategory: 'fitness_completed' },
  { label: 'Fitness - Missed', points: -15, category: 'training', subCategory: 'fitness_missed' },
];

export const DISCIPLINE_POINTS: PointRule[] = [
  { label: 'Good Behaviour', points: 20, category: 'discipline', subCategory: 'good_behaviour' },
  { label: 'Helping Teammates', points: 10, category: 'discipline', subCategory: 'helping' },
  { label: 'Academy Event Participation', points: 20, category: 'discipline', subCategory: 'event' },
  { label: 'Won Internal Competition', points: 50, category: 'discipline', subCategory: 'competition_win' },
  { label: 'Captain Leadership Bonus', points: 30, category: 'discipline', subCategory: 'captain' },
];

export const PENALTY_POINTS: PointRule[] = [
  { label: 'Misconduct', points: -50, category: 'penalty', subCategory: 'misconduct' },
  { label: 'Argument with Coach', points: -30, category: 'penalty', subCategory: 'argument' },
  { label: 'Uniform Violation', points: -10, category: 'penalty', subCategory: 'uniform' },
  { label: 'Mobile Phone During Practice', points: -20, category: 'penalty', subCategory: 'mobile' },
  { label: 'Late Fee Payment', points: -20, category: 'penalty', subCategory: 'late_fee' },
];

export const ACHIEVEMENT_BONUS_POINTS: PointRule[] = [
  { label: 'Player of the Week', points: 100, category: 'achievement', subCategory: 'potw' },
  { label: 'Player of the Month', points: 500, category: 'achievement', subCategory: 'potm' },
  { label: 'Best Batsman', points: 250, category: 'achievement', subCategory: 'best_batsman' },
  { label: 'Best Bowler', points: 250, category: 'achievement', subCategory: 'best_bowler' },
  { label: 'Best All-rounder', points: 300, category: 'achievement', subCategory: 'best_allrounder' },
  { label: 'Best Wicketkeeper', points: 250, category: 'achievement', subCategory: 'best_wk' },
  { label: 'Fastest Improvement', points: 200, category: 'achievement', subCategory: 'most_improved' },
  { label: 'Tournament MVP', points: 1000, category: 'achievement', subCategory: 'tournament_mvp' },
];

export const ALL_POINT_RULES: PointRule[] = [
  ...ATTENDANCE_POINTS,
  ...ATTENDANCE_BONUSES,
  ...TRAINING_POINTS,
  ...DISCIPLINE_POINTS,
  ...PENALTY_POINTS,
  ...ACHIEVEMENT_BONUS_POINTS,
];

// ─── RANK LEVELS ─────────────────────────────────────────────────────────────
export const RANK_LEVELS: RankLevelInfo[] = [
  { tier: 'Bronze', minPoints: 0, maxPoints: 999, color: '#CD7F32', icon: '🥉' },
  { tier: 'Silver', minPoints: 1000, maxPoints: 2499, color: '#C0C0C0', icon: '🥈' },
  { tier: 'Gold', minPoints: 2500, maxPoints: 4999, color: '#FFD700', icon: '🥇' },
  { tier: 'Platinum', minPoints: 5000, maxPoints: 9999, color: '#58A6FF', icon: '💎' },
  { tier: 'Diamond', minPoints: 10000, maxPoints: 19999, color: '#C77DFF', icon: '💠' },
  { tier: 'Elite', minPoints: 20000, maxPoints: Infinity, color: '#FF7B00', icon: '👑' },
];

export function getRankTier(points: number): RankTier {
  for (const r of RANK_LEVELS) {
    if (points >= r.minPoints && points <= r.maxPoints) return r.tier;
  }
  return 'Bronze';
}

export function getRankInfo(tier: RankTier): RankLevelInfo {
  return RANK_LEVELS.find(r => r.tier === tier) || RANK_LEVELS[0];
}

// ─── DEFAULT SKILL SCORES ────────────────────────────────────────────────────
function makeDefaultSkills(): SkillScores {
  return {
    batting: {
      technique: 7, footwork: 6, shotSelection: 7, coverDrive: 8, straightDrive: 7,
      pullShot: 6, cutShot: 7, sweepShot: 5, frontFootPlay: 7, backFootPlay: 6,
      strikeRotation: 7, runsBetweenWickets: 7, boundaryPercentage: 6, dotBallPercentage: 5,
      batSpeed: 7, matchTemperament: 7, powerHitting: 6, defensiveSkills: 7, spinPlaying: 6, pacePlaying: 6, consistency: 7,
    },
    bowling: {
      action: 7, runUp: 7, seamPosition: 6, swing: 5, reverseSwing: 4, yorkerAccuracy: 6,
      bouncerAccuracy: 6, line: 7, length: 7, pace: 6, variation: 6, spinControl: 5,
      flight: 5, drift: 4, turn: 5, economy: 7, wicketTaking: 6, deathBowling: 5,
      powerplayBowling: 6, matchConsistency: 6,
    },
    wicketkeeping: {
      glovesTechnique: 7, standingUp: 6, standingBack: 7, catching: 7, diving: 6,
      reflexes: 7, stumping: 6, throwAccuracy: 6, runOutSuccess: 5, footwork: 6,
      communication: 7, decisionMaking: 7, fitnessAgility: 7, matchAwareness: 7, leadership: 6,
    },
    allRounder: {
      adaptability: 7, matchAwareness: 7, pressureHandling: 6, teamContribution: 7,
      leadership: 6, fitness: 7, runsBetweenWickets: 7, fielding: 7, consistency: 6, matchImpact: 7,
    },
  };
}

function makeCoachEval(remarks: string, base: number = 7): CoachEvaluation {
  const v = (n: number) => Math.min(10, Math.max(1, base + n));
  return {
    discipline: v(0), attitude: v(1), teamwork: v(0), hardWork: v(1), learningAbility: v(-1),
    communication: v(0), leadership: v(-1), confidence: v(1), mentalStrength: v(0), matchAwareness: v(1),
    overallRating: base,
    remarks,
    evaluatedAt: '2025-01-20',
  };
}

// ─── PLAYERS ─────────────────────────────────────────────────────────────────
export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1', name: 'Arjun Sharma', age: 19, gender: 'Male',
    phone: '+91 98765 43210', email: 'arjun@academy.com', address: 'Mumbai, Maharashtra',
    profilePhoto: null, playingRole: 'Batsman', battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm medium', experience: '3 years', joiningDate: '2022-01-15',
    points: 3200, monthlyPoints: 480, yearlyPoints: 3200, level: 4, rankTier: 'Gold',
    xp: 8200, nextLevelXp: 10000, rank: 1, previousRank: 2, badges: ['century_club', 'fast_learner', 'team_player'],
    isActive: true, attendancePercentage: 92, batch: 'A', ageGroup: 'Under-21', coachName: 'Coach Ravi',
    batting: { matches: 24, runs: 1240, strikeRate: 118.5, boundaries: 142, highestScore: 115, average: 51.6 },
    bowling: { overs: 12, wickets: 4, economyRate: 7.2, bestFigures: '2/18', average: 28.5 },
    fielding: { catches: 18, runOuts: 3, fieldingPoints: 210, stumpings: 0 },
    fitness: { speed: 88, strength: 82, stamina: 90, fitnessScore: 87 },
    disciplinePoints: 180,
    skillScores: { ...makeDefaultSkills(), batting: { ...makeDefaultSkills().batting, technique: 8, shotSelection: 9, coverDrive: 9, matchTemperament: 8, consistency: 8 } },
    coachEvaluation: makeCoachEval('Exceptional batsman with great temperament. Needs to improve bowling.', 8),
  },
  {
    id: 'p2', name: 'Priya Patel', age: 17, gender: 'Female',
    phone: '+91 87654 32109', email: 'priya@academy.com', address: 'Ahmedabad, Gujarat',
    profilePhoto: null, playingRole: 'All-rounder', battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm off-spin', experience: '2 years', joiningDate: '2022-06-10',
    points: 2800, monthlyPoints: 520, yearlyPoints: 2800, level: 4, rankTier: 'Gold',
    xp: 7100, nextLevelXp: 10000, rank: 2, previousRank: 1, badges: ['accurate_bowler', 'fitness_champ'],
    isActive: true, attendancePercentage: 96, batch: 'A', ageGroup: 'Under-19', coachName: 'Coach Ravi',
    batting: { matches: 20, runs: 890, strikeRate: 108.2, boundaries: 98, highestScore: 89, average: 44.5 },
    bowling: { overs: 45, wickets: 22, economyRate: 6.8, bestFigures: '4/23', average: 18.2 },
    fielding: { catches: 12, runOuts: 5, fieldingPoints: 170, stumpings: 0 },
    fitness: { speed: 84, strength: 78, stamina: 92, fitnessScore: 85 },
    disciplinePoints: 220,
    skillScores: { ...makeDefaultSkills(), bowling: { ...makeDefaultSkills().bowling, spinControl: 9, flight: 8, economy: 9, variation: 8 } },
    coachEvaluation: makeCoachEval('Outstanding all-rounder. Best discipline record in the academy.', 9),
  },
  {
    id: 'p3', name: 'Rahul Mehta', age: 21, gender: 'Male',
    phone: '+91 76543 21098', email: 'rahul@academy.com', address: 'Pune, Maharashtra',
    profilePhoto: null, playingRole: 'Fast Bowler', battingStyle: 'Left-handed',
    bowlingStyle: 'Right-arm fast', experience: '4 years', joiningDate: '2021-03-20',
    points: 2100, monthlyPoints: 310, yearlyPoints: 2100, level: 3, rankTier: 'Silver',
    xp: 5800, nextLevelXp: 7500, rank: 3, previousRank: 3, badges: ['fast_bowler', 'hat_trick_hero'],
    isActive: true, attendancePercentage: 88, batch: 'B', ageGroup: 'Under-23', coachName: 'Coach Suresh',
    batting: { matches: 22, runs: 320, strikeRate: 95.2, boundaries: 38, highestScore: 45, average: 14.5 },
    bowling: { overs: 88, wickets: 54, economyRate: 7.8, bestFigures: '6/32', average: 14.2 },
    fielding: { catches: 8, runOuts: 2, fieldingPoints: 100, stumpings: 0 },
    fitness: { speed: 94, strength: 88, stamina: 86, fitnessScore: 90 },
    disciplinePoints: 90,
    skillScores: { ...makeDefaultSkills(), bowling: { ...makeDefaultSkills().bowling, pace: 9, bouncerAccuracy: 9, yorkerAccuracy: 8, action: 9 } },
    coachEvaluation: makeCoachEval('Express pace bowler. Needs to work on discipline and line/length.', 7),
  },
  {
    id: 'p4', name: 'Sneha Joshi', age: 18, gender: 'Female',
    phone: '+91 65432 10987', email: 'sneha@academy.com', address: 'Jaipur, Rajasthan',
    profilePhoto: null, playingRole: 'Wicket-keeper', battingStyle: 'Right-handed',
    bowlingStyle: 'N/A', experience: '2 years', joiningDate: '2023-01-05',
    points: 1850, monthlyPoints: 290, yearlyPoints: 1850, level: 3, rankTier: 'Silver',
    xp: 5200, nextLevelXp: 7500, rank: 4, previousRank: 5, badges: ['team_player', 'century_club'],
    isActive: true, attendancePercentage: 94, batch: 'A', ageGroup: 'Under-19', coachName: 'Coach Ravi',
    batting: { matches: 18, runs: 780, strikeRate: 112.4, boundaries: 88, highestScore: 78, average: 43.3 },
    bowling: { overs: 0, wickets: 0, economyRate: 0, bestFigures: 'N/A', average: 0 },
    fielding: { catches: 24, runOuts: 7, fieldingPoints: 310, stumpings: 12 },
    fitness: { speed: 82, strength: 75, stamina: 88, fitnessScore: 82 },
    disciplinePoints: 200,
    skillScores: { ...makeDefaultSkills(), wicketkeeping: { ...makeDefaultSkills().wicketkeeping, stumping: 9, reflexes: 9, catching: 8, standingUp: 8 } },
    coachEvaluation: makeCoachEval('Excellent wicketkeeper. Very reliable behind the stumps.', 8),
  },
  {
    id: 'p5', name: 'Karan Singh', age: 20, gender: 'Male',
    phone: '+91 54321 09876', email: 'karan@academy.com', address: 'Delhi, NCR',
    profilePhoto: null, playingRole: 'Spin Bowler', battingStyle: 'Left-handed',
    bowlingStyle: 'Left-arm spin', experience: '3 years', joiningDate: '2022-08-12',
    points: 1550, monthlyPoints: 220, yearlyPoints: 1550, level: 3, rankTier: 'Silver',
    xp: 4800, nextLevelXp: 7500, rank: 5, previousRank: 4, badges: ['accurate_bowler'],
    isActive: true, attendancePercentage: 85, batch: 'B', ageGroup: 'Under-21', coachName: 'Coach Suresh',
    batting: { matches: 20, runs: 480, strikeRate: 102.1, boundaries: 52, highestScore: 62, average: 24 },
    bowling: { overs: 72, wickets: 38, economyRate: 5.9, bestFigures: '5/28', average: 19.5 },
    fielding: { catches: 14, runOuts: 4, fieldingPoints: 180, stumpings: 0 },
    fitness: { speed: 78, strength: 72, stamina: 84, fitnessScore: 78 },
    disciplinePoints: 120,
    skillScores: makeDefaultSkills(),
    coachEvaluation: makeCoachEval('Good spin bowler with excellent economy. Needs to be more consistent.', 7),
  },
  {
    id: 'p6', name: 'Ananya Reddy', age: 16, gender: 'Female',
    phone: '+91 43210 98765', email: 'ananya@academy.com', address: 'Hyderabad, Telangana',
    profilePhoto: null, playingRole: 'Batsman', battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm medium', experience: '1 year', joiningDate: '2024-02-18',
    points: 1020, monthlyPoints: 190, yearlyPoints: 1020, level: 2, rankTier: 'Silver',
    xp: 2800, nextLevelXp: 5000, rank: 6, previousRank: 6, badges: ['first_match'],
    isActive: true, attendancePercentage: 90, batch: 'C', ageGroup: 'Under-17', coachName: 'Coach Meena',
    batting: { matches: 12, runs: 420, strikeRate: 98.5, boundaries: 48, highestScore: 58, average: 35 },
    bowling: { overs: 8, wickets: 2, economyRate: 8.5, bestFigures: '1/22', average: 44 },
    fielding: { catches: 6, runOuts: 1, fieldingPoints: 70, stumpings: 0 },
    fitness: { speed: 76, strength: 68, stamina: 80, fitnessScore: 74 },
    disciplinePoints: 160,
    skillScores: makeDefaultSkills(),
    coachEvaluation: makeCoachEval('Promising young batsman. Fastest improving player this month.', 7),
  },
  {
    id: 'p7', name: 'Dev Kapoor', age: 22, gender: 'Male',
    phone: '+91 32109 87654', email: 'dev@academy.com', address: 'Kolkata, West Bengal',
    profilePhoto: null, playingRole: 'All-rounder', battingStyle: 'Right-handed',
    bowlingStyle: 'Right-arm medium-fast', experience: '5 years', joiningDate: '2020-11-01',
    points: 920, monthlyPoints: 100, yearlyPoints: 920, level: 2, rankTier: 'Bronze',
    xp: 2200, nextLevelXp: 5000, rank: 7, previousRank: 7, badges: ['first_match'],
    isActive: false, attendancePercentage: 72, batch: 'B', ageGroup: 'Under-23', coachName: 'Coach Suresh',
    batting: { matches: 28, runs: 680, strikeRate: 105.8, boundaries: 78, highestScore: 72, average: 24.3 },
    bowling: { overs: 52, wickets: 28, economyRate: 8.2, bestFigures: '3/35', average: 24.1 },
    fielding: { catches: 10, runOuts: 3, fieldingPoints: 130, stumpings: 0 },
    fitness: { speed: 80, strength: 82, stamina: 78, fitnessScore: 80 },
    disciplinePoints: 40,
    skillScores: makeDefaultSkills(),
    coachEvaluation: makeCoachEval('Inconsistent attendance affecting performance. Needs improvement in attitude.', 6),
  },
  {
    id: 'p8', name: 'Riya Nair', age: 17, gender: 'Female',
    phone: '+91 21098 76543', email: 'riya@academy.com', address: 'Kochi, Kerala',
    profilePhoto: null, playingRole: 'Batsman', battingStyle: 'Left-handed',
    bowlingStyle: 'N/A', experience: '1 year', joiningDate: '2024-07-22',
    points: 580, monthlyPoints: 95, yearlyPoints: 580, level: 1, rankTier: 'Bronze',
    xp: 1400, nextLevelXp: 2500, rank: 8, previousRank: 8, badges: [],
    isActive: true, attendancePercentage: 82, batch: 'C', ageGroup: 'Under-19', coachName: 'Coach Meena',
    batting: { matches: 8, runs: 220, strikeRate: 88.4, boundaries: 24, highestScore: 42, average: 27.5 },
    bowling: { overs: 0, wickets: 0, economyRate: 0, bestFigures: 'N/A', average: 0 },
    fielding: { catches: 4, runOuts: 0, fieldingPoints: 40, stumpings: 0 },
    fitness: { speed: 72, strength: 65, stamina: 76, fitnessScore: 71 },
    disciplinePoints: 100,
    skillScores: makeDefaultSkills(),
    coachEvaluation: makeCoachEval('New to the academy. Showing good potential and attitude.', 6),
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', playerId: 'p1', date: '2025-01-15', status: 'present', pointsEarned: 10, markedBy: 'admin' },
  { id: 'a2', playerId: 'p1', date: '2025-01-16', status: 'present', pointsEarned: 10, markedBy: 'admin' },
  { id: 'a3', playerId: 'p1', date: '2025-01-17', status: 'absent', pointsEarned: -10, markedBy: 'admin' },
  { id: 'a4', playerId: 'p2', date: '2025-01-15', status: 'present', pointsEarned: 10, markedBy: 'admin' },
  { id: 'a5', playerId: 'p2', date: '2025-01-16', status: 'present', pointsEarned: 10, markedBy: 'admin' },
  { id: 'a6', playerId: 'p3', date: '2025-01-15', status: 'late', pointsEarned: -5, markedBy: 'admin' },
];

// Matches removed — match management feature deprecated

export const MOCK_POINTS_HISTORY: PointsEntry[] = [
  { id: 'pt1', playerId: 'p1', points: 250, reason: 'Best Batsman Award - January', category: 'achievement', subCategory: 'best_batsman', date: '2025-01-31', addedBy: 'admin' },
  { id: 'pt2', playerId: 'p1', points: 10, reason: 'Attendance - Jan 20', category: 'attendance', date: '2025-01-20', addedBy: 'system' },
  { id: 'pt3', playerId: 'p2', points: 300, reason: 'Best All-rounder Award', category: 'achievement', subCategory: 'best_allrounder', date: '2025-01-31', addedBy: 'admin' },
  { id: 'pt4', playerId: 'p3', points: 250, reason: 'Best Bowler Award', category: 'achievement', subCategory: 'best_bowler', date: '2025-01-31', addedBy: 'admin' },
  { id: 'pt5', playerId: 'p1', points: 30, reason: 'Captain Leadership Bonus', category: 'discipline', subCategory: 'captain', date: '2025-01-18', addedBy: 'admin' },
  { id: 'pt6', playerId: 'p2', points: 500, reason: 'Full Month Attendance Bonus', category: 'bonus', subCategory: 'full_month', date: '2025-01-01', addedBy: 'system' },
  { id: 'pt7', playerId: 'p4', points: 250, reason: 'Best Wicketkeeper Award', category: 'achievement', subCategory: 'best_wk', date: '2025-01-31', addedBy: 'admin' },
  { id: 'pt8', playerId: 'p6', points: 200, reason: 'Fastest Improvement Award', category: 'achievement', subCategory: 'most_improved', date: '2025-01-31', addedBy: 'admin' },
  { id: 'pt9', playerId: 'p3', points: -30, reason: 'Argument with Coach', category: 'penalty', subCategory: 'argument', date: '2025-01-10', addedBy: 'admin' },
  { id: 'pt10', playerId: 'p1', points: 40, reason: 'Batting Session - Excellent', category: 'training', subCategory: 'batting_excellent', date: '2025-01-22', addedBy: 'admin' },
  { id: 'pt11', playerId: 'p2', points: 40, reason: 'Bowling Session - Excellent', category: 'training', subCategory: 'bowling_excellent', date: '2025-01-22', addedBy: 'admin' },
  { id: 'pt12', playerId: 'p5', points: -10, reason: 'Uniform Violation', category: 'penalty', subCategory: 'uniform', date: '2025-01-14', addedBy: 'admin' },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_match', name: 'First Match', icon: '🏏', description: 'Played your first academy match', unlockedAt: '2024-12-01', rarity: 'common', xpReward: 200 },
  { id: 'century_club', name: '100 Runs Club', icon: '💯', description: 'Scored 100+ runs in a single innings', unlockedAt: '2025-01-20', rarity: 'rare', xpReward: 500 },
  { id: 'fast_bowler', name: 'Fast Bowler', icon: '⚡', description: 'Consistently bowl at 130+ km/h', unlockedAt: '2024-11-15', rarity: 'rare', xpReward: 400 },
  { id: 'accurate_bowler', name: 'Accurate Bowler', icon: '🎯', description: 'Economy rate below 6 for 10+ overs', unlockedAt: '2024-10-20', rarity: 'uncommon', xpReward: 300 },
  { id: 'fitness_champ', name: 'Fitness Champion', icon: '💪', description: 'Achieve fitness score above 90', unlockedAt: '2025-01-10', rarity: 'uncommon', xpReward: 350 },
  { id: 'hat_trick_hero', name: 'Hat-trick Hero', icon: '🎩', description: 'Took 3 wickets in consecutive balls', unlockedAt: '2024-12-28', rarity: 'epic', xpReward: 800 },
  { id: 'team_player', name: 'Team Player', icon: '🤝', description: 'Maximum discipline points in a month', unlockedAt: '2025-01-01', rarity: 'uncommon', xpReward: 300 },
  { id: 'fast_learner', name: 'Fast Learner', icon: '🚀', description: 'Level up twice in one month', unlockedAt: '2024-12-15', rarity: 'rare', xpReward: 600 },
  { id: 'academy_legend', name: 'Academy Legend', icon: '👑', description: 'Reach Level 5 - Cricket Legend', unlockedAt: null, rarity: 'legendary', xpReward: 2000 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Training Tomorrow', message: 'Net practice at 7 AM - Bring full kit', type: 'training', sentAt: '2025-01-21T18:00:00', isRead: false, sentBy: 'admin' },
  { id: 'n2', title: 'Match Reminder', message: 'Championship match vs Legends CC on Feb 15', type: 'match', sentAt: '2025-01-20T10:00:00', isRead: true, sentBy: 'admin' },
  { id: 'n3', title: 'Points Awarded', message: 'You earned 250 points for Best Batsman!', type: 'points', sentAt: '2025-01-20T16:00:00', isRead: true, sentBy: 'system' },
  { id: 'n4', title: 'Academy Announcement', message: 'Annual sports day on Feb 28. All players must participate', type: 'announcement', sentAt: '2025-01-19T09:00:00', isRead: false, sentBy: 'admin' },
];

export const MOCK_FEEDBACK: Feedback[] = [
  { id: 'f1', playerId: 'p1', playerName: 'Arjun Sharma', message: 'Can we have more batting drills?', rating: 4, submittedAt: '2025-01-18', adminReply: 'Great suggestion! Adding extra batting sessions on Wednesdays.', status: 'replied' },
  { id: 'f2', playerId: 'p2', playerName: 'Priya Patel', message: 'The new training schedule is excellent!', rating: 5, submittedAt: '2025-01-17', adminReply: null, status: 'pending' },
  { id: 'f3', playerId: 'p3', playerName: 'Rahul Mehta', message: 'Need better bowling machine facilities', rating: 3, submittedAt: '2025-01-15', adminReply: null, status: 'pending' },
];

function makeFee(id: string, playerId: string, playerName: string, amount: number, feeType: Fee['feeType'], category: Fee['category'], description: string, dueDate: string, status: Fee['status'], paidDate: string | null, receivedBy: string | null, extra?: Partial<Fee>): Fee {
  return {
    id, playerId, playerName, amount, feeType, category, description, dueDate,
    paidDate, status, receivedBy,
    paidAmount: status === 'paid' ? amount : status === 'partial' ? (extra?.paidAmount || 0) : 0,
    paymentMethod: paidDate ? (extra?.paymentMethod || 'cash') : null,
    paymentNotes: extra?.paymentNotes || '',
    discountAmount: extra?.discountAmount || 0,
    discountReason: extra?.discountReason || '',
    lateFee: extra?.lateFee || 0,
    isScholarship: extra?.isScholarship || false,
    scholarshipPercent: extra?.scholarshipPercent || 0,
    receiptNumber: paidDate ? (extra?.receiptNumber || `REC-${id.toUpperCase()}`) : null,
    transactionId: extra?.transactionId || null,
  };
}

export const MOCK_FEES: Fee[] = [
  makeFee('fee1', 'p1', 'Arjun Sharma', 2000, 'monthly', 'monthly', 'Monthly Fee - January 2025', '2025-01-05', 'paid', '2025-01-04', 'admin', { paymentMethod: 'upi', receiptNumber: 'REC-FEE001', transactionId: 'UPI-001' }),
  makeFee('fee2', 'p2', 'Priya Patel', 2000, 'monthly', 'monthly', 'Monthly Fee - January 2025', '2025-01-05', 'paid', '2025-01-06', 'admin', { paymentMethod: 'cash', receiptNumber: 'REC-FEE002' }),
  makeFee('fee3', 'p3', 'Rahul Mehta', 2000, 'monthly', 'monthly', 'Monthly Fee - January 2025', '2025-01-05', 'overdue', null, null),
  makeFee('fee4', 'p4', 'Sneha Joshi', 2000, 'monthly', 'monthly', 'Monthly Fee - January 2025', '2025-01-05', 'paid', '2025-01-05', 'admin', { paymentMethod: 'online', receiptNumber: 'REC-FEE003' }),
  makeFee('fee5', 'p5', 'Karan Singh', 2000, 'monthly', 'monthly', 'Monthly Fee - January 2025', '2025-01-05', 'pending', null, null),
  makeFee('fee6', 'p1', 'Arjun Sharma', 5000, 'admission', 'registration', 'Admission Fee 2024', '2024-01-10', 'paid', '2024-01-10', 'admin', { paymentMethod: 'bank_transfer', receiptNumber: 'REC-ADM001' }),
  makeFee('fee7', 'p6', 'Ananya Reddy', 1200, 'monthly', 'monthly', 'Monthly Fee - Jan 2025', '2025-01-05', 'partial', null, null, { paidAmount: 600, paymentNotes: 'Partial payment, rest pending' }),
  makeFee('fee8', 'p2', 'Priya Patel', 6000, 'quarterly', 'monthly', 'Quarterly Fee - Q1 2025', '2025-01-10', 'paid', '2025-01-08', 'admin', { paymentMethod: 'upi', discountAmount: 500, discountReason: 'Performance bonus discount', receiptNumber: 'REC-Q001' }),
  makeFee('fee9', 'p4', 'Sneha Joshi', 1600, 'monthly', 'monthly', 'Monthly Fee - Feb 2025', '2025-02-05', 'pending', null, null, { isScholarship: true, scholarshipPercent: 20, discountAmount: 400, discountReason: 'Merit scholarship (20%)' }),
  makeFee('fee10', 'p3', 'Rahul Mehta', 200, 'custom', 'other', 'Late fee fine - Jan 2025', '2025-01-20', 'pending', null, null, { lateFee: 200 }),
];

export const ATTENDANCE_CHART_DATA = [
  { month: 'Aug', percentage: 78 }, { month: 'Sep', percentage: 82 }, { month: 'Oct', percentage: 88 },
  { month: 'Nov', percentage: 85 }, { month: 'Dec', percentage: 90 }, { month: 'Jan', percentage: 91 },
];

export const PERFORMANCE_CHART_DATA = [
  { month: 'Aug', runs: 420, wickets: 18 }, { month: 'Sep', runs: 580, wickets: 22 },
  { month: 'Oct', runs: 650, wickets: 28 }, { month: 'Nov', runs: 720, wickets: 32 },
  { month: 'Dec', runs: 810, wickets: 38 }, { month: 'Jan', runs: 890, wickets: 42 },
];

export const POINTS_CHART_DATA = [
  { month: 'Aug', points: 1200 }, { month: 'Sep', points: 2100 }, { month: 'Oct', points: 3400 },
  { month: 'Nov', points: 4800 }, { month: 'Dec', points: 6200 }, { month: 'Jan', points: 8100 },
];
