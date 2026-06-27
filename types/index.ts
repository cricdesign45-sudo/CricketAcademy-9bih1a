export interface Player {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  profilePhoto: string | null;
  playingRole: string;
  battingStyle: string;
  bowlingStyle: string;
  experience: string;
  joiningDate: string;
  points: number;
  monthlyPoints: number;
  yearlyPoints: number;
  level: number;
  rankTier: RankTier;
  xp: number;
  nextLevelXp: number;
  rank: number;
  badges: string[];
  isActive: boolean;
  attendancePercentage: number;
  batch: string;
  ageGroup: string;
  coachName: string;
  batting: {
    matches: number;
    runs: number;
    strikeRate: number;
    boundaries: number;
    highestScore: number;
    average: number;
  };
  bowling: {
    overs: number;
    wickets: number;
    economyRate: number;
    bestFigures: string;
    average: number;
  };
  fielding: {
    catches: number;
    runOuts: number;
    fieldingPoints: number;
    stumpings: number;
  };
  fitness: {
    speed: number;
    strength: number;
    stamina: number;
    fitnessScore: number;
  };
  skillScores: SkillScores;
  coachEvaluation: CoachEvaluation;
  previousRank: number;
  disciplinePoints: number;
}

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Elite';

export interface SkillScores {
  // Batting skills (out of 10)
  batting: {
    technique: number;
    footwork: number;
    shotSelection: number;
    coverDrive: number;
    straightDrive: number;
    pullShot: number;
    cutShot: number;
    sweepShot: number;
    frontFootPlay: number;
    backFootPlay: number;
    strikeRotation: number;
    runsBetweenWickets: number;
    boundaryPercentage: number;
    dotBallPercentage: number;
    batSpeed: number;
    matchTemperament: number;
    powerHitting: number;
    defensiveSkills: number;
    spinPlaying: number;
    pacePlaying: number;
    consistency: number;
  };
  // Bowling skills (out of 10)
  bowling: {
    action: number;
    runUp: number;
    seamPosition: number;
    swing: number;
    reverseSwing: number;
    yorkerAccuracy: number;
    bouncerAccuracy: number;
    line: number;
    length: number;
    pace: number;
    variation: number;
    spinControl: number;
    flight: number;
    drift: number;
    turn: number;
    economy: number;
    wicketTaking: number;
    deathBowling: number;
    powerplayBowling: number;
    matchConsistency: number;
  };
  // Wicketkeeping skills (out of 10)
  wicketkeeping: {
    glovesTechnique: number;
    standingUp: number;
    standingBack: number;
    catching: number;
    diving: number;
    reflexes: number;
    stumping: number;
    throwAccuracy: number;
    runOutSuccess: number;
    footwork: number;
    communication: number;
    decisionMaking: number;
    fitnessAgility: number;
    matchAwareness: number;
    leadership: number;
  };
  // All-rounder extras (out of 10)
  allRounder: {
    adaptability: number;
    matchAwareness: number;
    pressureHandling: number;
    teamContribution: number;
    leadership: number;
    fitness: number;
    runsBetweenWickets: number;
    fielding: number;
    consistency: number;
    matchImpact: number;
  };
}

export interface CoachEvaluation {
  discipline: number;
  attitude: number;
  teamwork: number;
  hardWork: number;
  learningAbility: number;
  communication: number;
  leadership: number;
  confidence: number;
  mentalStrength: number;
  matchAwareness: number;
  overallRating: number;
  remarks: string;
  evaluatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  playerId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'approved_leave' | 'early_checkout';
  pointsEarned: number;
  markedBy: string;
}

export interface Match {
  id: string;
  date: string;
  opponent: string;
  venue: string;
  result: 'won' | 'lost' | 'draw' | null;
  ourScore: string | null;
  opponentScore: string | null;
  playerOfMatch: string | null;
  description: string;
  format: string;
  isUpcoming?: boolean;
}

export interface PointsEntry {
  id: string;
  playerId: string;
  points: number;
  reason: string;
  category: 'attendance' | 'performance' | 'discipline' | 'bonus' | 'penalty' | 'training' | 'achievement';
  subCategory?: string;
  date: string;
  addedBy: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'training' | 'match' | 'points' | 'announcement' | 'general';
  sentAt: string;
  isRead: boolean;
  sentBy: string;
}

export interface Feedback {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  rating: number;
  submittedAt: string;
  adminReply: string | null;
  status: 'pending' | 'replied';
}

export interface Fee {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  feeType: 'admission' | 'monthly' | 'quarterly' | 'annual' | 'custom' | 'equipment' | 'tournament' | 'other';
  category: 'monthly' | 'registration' | 'equipment' | 'tournament' | 'other'; // legacy
  description: string;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue' | 'waived' | 'partial';
  receivedBy: string | null;
  // New fields
  paidAmount: number;
  paymentMethod: 'cash' | 'upi' | 'online' | 'bank_transfer' | null;
  paymentNotes: string;
  discountAmount: number;
  discountReason: string;
  lateFee: number;
  isScholarship: boolean;
  scholarshipPercent: number;
  receiptNumber: string | null;
  transactionId: string | null;
}

export interface FeePayment {
  id: string;
  feeId: string;
  playerId: string;
  playerName: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'online' | 'bank_transfer';
  paidDate: string;
  notes: string;
  transactionId: string;
  receivedBy: string;
}

export type UserRole = 'admin' | 'player';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  playerId?: string;
}

export type LeaderboardCategory =
  | 'overall'
  | 'attendance'
  | 'batting'
  | 'bowling'
  | 'fielding'
  | 'fitness'
  | 'wicketkeeper'
  | 'discipline'
  | 'mostImproved'
  | 'monthly'
  | 'yearly';

export interface PointRule {
  label: string;
  points: number;
  category: string;
  subCategory?: string;
}

export interface RankLevelInfo {
  tier: RankTier;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
}
