import React, { createContext, useState, ReactNode } from 'react';
import { Player, AttendanceRecord, PointsEntry, Notification, Feedback, Fee, RankTier } from '@/types';
import { MOCK_PLAYERS, MOCK_ATTENDANCE, MOCK_POINTS_HISTORY, MOCK_NOTIFICATIONS, MOCK_FEEDBACK, MOCK_FEES, getRankTier } from '@/constants/mockData';

interface PlayersContextType {
  players: Player[];
  attendance: AttendanceRecord[];
  pointsHistory: PointsEntry[];
  notifications: Notification[];
  feedback: Feedback[];
  fees: Fee[];
  addPlayer: (player: Omit<Player, 'id' | 'points' | 'monthlyPoints' | 'yearlyPoints' | 'level' | 'xp' | 'nextLevelXp' | 'rank' | 'previousRank' | 'badges' | 'rankTier' | 'disciplinePoints'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  markAttendance: (playerId: string, date: string, status: AttendanceRecord['status']) => void;
  addPoints: (playerId: string, points: number, reason: string, category: PointsEntry['category'], subCategory?: string) => void;
  sendNotification: (title: string, message: string, type: Notification['type']) => void;
  replyToFeedback: (feedbackId: string, reply: string) => void;
  markNotificationRead: (id: string) => void;
  addFee: (fee: Omit<Fee, 'id'>) => void;
  markFeePaid: (feeId: string, method: Fee['paymentMethod'], notes: string, transactionId: string) => void;
  markFeePartialPaid: (feeId: string, paidAmount: number, method: Fee['paymentMethod'], notes: string) => void;
  waiveFee: (feeId: string, reason: string) => void;
  applyDiscount: (feeId: string, discountAmount: number, reason: string) => void;
  applyScholarship: (feeId: string, percent: number) => void;
  applyLateFee: (feeId: string, lateFeeAmount: number) => void;
  deleteFee: (feeId: string) => void;
}

export const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

function computeLevel(xp: number): { level: number; nextLevelXp: number } {
  const thresholds = [0, 2500, 5000, 7500, 10000, 15000];
  let level = 1;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i + 1; break; }
  }
  const nextXp = thresholds[Math.min(level, thresholds.length - 1)] || 15000;
  return { level: Math.min(5, level), nextLevelXp: nextXp };
}

function recalculateRanks(players: Player[]): Player[] {
  const sorted = [...players].sort((a, b) => b.points - a.points);
  return players.map(p => {
    const newRank = sorted.findIndex(s => s.id === p.id) + 1;
    return { ...p, rank: newRank, rankTier: getRankTier(p.points) };
  });
}

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [pointsHistory, setPointsHistory] = useState<PointsEntry[]>(MOCK_POINTS_HISTORY);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [feedback, setFeedback] = useState<Feedback[]>(MOCK_FEEDBACK);
  const [fees, setFees] = useState<Fee[]>(MOCK_FEES);

  const addPlayer = (playerData: Omit<Player, 'id' | 'points' | 'monthlyPoints' | 'yearlyPoints' | 'level' | 'xp' | 'nextLevelXp' | 'rank' | 'previousRank' | 'badges' | 'rankTier' | 'disciplinePoints'> & { _presetId?: string }) => {
    const { _presetId, ...cleanData } = playerData as any;
    const newPlayer: Player = {
      ...cleanData,
      id: _presetId || `p${Date.now()}`,
      points: 0, monthlyPoints: 0, yearlyPoints: 0,
      level: 1, xp: 0, nextLevelXp: 2500,
      rank: players.length + 1, previousRank: players.length + 1,
      badges: [], rankTier: 'Bronze', disciplinePoints: 0,
    };
    setPlayers(prev => recalculateRanks([...prev, newPlayer]));
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => recalculateRanks(prev.map(p => p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => recalculateRanks(prev.filter(p => p.id !== id)));
  };

  const addPoints = (playerId: string, points: number, reason: string, category: PointsEntry['category'], subCategory?: string) => {
    const newEntry: PointsEntry = {
      id: `pt${Date.now()}`,
      playerId, points, reason, category, subCategory,
      date: new Date().toISOString().split('T')[0],
      addedBy: 'admin',
    };
    setPointsHistory(prev => [...prev, newEntry]);
    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.id === playerId) {
          const newPoints = Math.max(0, p.points + points);
          const newMonthly = Math.max(0, p.monthlyPoints + points);
          const newYearly = Math.max(0, p.yearlyPoints + points);
          const newXp = p.xp + Math.abs(points);
          const newDiscipline = category === 'discipline' ? p.disciplinePoints + points : p.disciplinePoints;
          const { level, nextLevelXp } = computeLevel(newXp);
          return {
            ...p, points: newPoints, monthlyPoints: newMonthly, yearlyPoints: newYearly,
            xp: newXp, level, nextLevelXp, disciplinePoints: Math.max(0, newDiscipline),
            rankTier: getRankTier(newPoints),
          };
        }
        return p;
      });
      return recalculateRanks(updated);
    });
  };

  const markAttendance = (playerId: string, date: string, status: AttendanceRecord['status']) => {
    const pointsMap: Record<string, number> = {
      present: 10, approved_leave: 0, absent: -10, late: -5, early_checkout: -3,
    };
    const pointsEarned = pointsMap[status] ?? 0;
    const newRecord: AttendanceRecord = {
      id: `a${Date.now()}`,
      playerId, date, status, pointsEarned, markedBy: 'admin',
    };
    setAttendance(prev => [...prev, newRecord]);
    if (pointsEarned !== 0) {
      addPoints(playerId, pointsEarned, `Attendance - ${date} (${status})`, 'attendance', status);
    }
  };

  const sendNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title, message, type,
      sentAt: new Date().toISOString(),
      isRead: false, sentBy: 'admin',
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const replyToFeedback = (feedbackId: string, reply: string) => {
    setFeedback(prev => prev.map(f => f.id === feedbackId ? { ...f, adminReply: reply, status: 'replied' as const } : f));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addFee = (feeData: Omit<Fee, 'id'>) => {
    const newFee: Fee = { ...feeData, id: `fee${Date.now()}` };
    setFees(prev => [newFee, ...prev]);
  };

  const markFeePaid = (feeId: string, method: Fee['paymentMethod'] = 'cash', notes: string = '', transactionId: string = '') => {
    const receiptNum = `REC-${Date.now()}`;
    setFees(prev => prev.map(f => f.id === feeId ? {
      ...f, status: 'paid' as const,
      paidDate: new Date().toISOString().split('T')[0],
      paidAmount: f.amount + f.lateFee - f.discountAmount,
      receivedBy: 'admin',
      paymentMethod: method,
      paymentNotes: notes,
      transactionId,
      receiptNumber: receiptNum,
    } : f));
  };

  const markFeePartialPaid = (feeId: string, paidAmount: number, method: Fee['paymentMethod'] = 'cash', notes: string = '') => {
    setFees(prev => prev.map(f => f.id === feeId ? {
      ...f, status: 'partial' as const,
      paidAmount,
      paymentMethod: method,
      paymentNotes: notes,
    } : f));
  };

  const waiveFee = (feeId: string, reason: string = '') => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: 'waived' as const, paymentNotes: reason } : f));
  };

  const applyDiscount = (feeId: string, discountAmount: number, reason: string) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, discountAmount, discountReason: reason } : f));
  };

  const applyScholarship = (feeId: string, percent: number) => {
    setFees(prev => prev.map(f => {
      if (f.id !== feeId) return f;
      const discountAmount = Math.round(f.amount * percent / 100);
      return { ...f, isScholarship: true, scholarshipPercent: percent, discountAmount, discountReason: `Merit scholarship (${percent}%)` };
    }));
  };

  const applyLateFee = (feeId: string, lateFeeAmount: number) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, lateFee: lateFeeAmount } : f));
  };

  const deleteFee = (feeId: string) => {
    setFees(prev => prev.filter(f => f.id !== feeId));
  };

  return (
    <PlayersContext.Provider value={{
      players, attendance, pointsHistory, notifications, feedback, fees,
      addPlayer, updatePlayer, deletePlayer, markAttendance, addPoints,
      sendNotification, replyToFeedback, markNotificationRead,
      addFee, markFeePaid, markFeePartialPaid, waiveFee, applyDiscount, applyScholarship, applyLateFee, deleteFee,
    }}>
      {children}
    </PlayersContext.Provider>
  );
}
