import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  getPermissionStatus,
  sendLocalNotification,
  scheduleDelayedNotification,
  scheduleDailyRepeatNotification,
  cancelNotification,
  cancelAllNotifications,
} from '@/services/notificationService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScheduledReminder {
  localId: string;
  notifId: string;
  type: 'daily_training' | 'fee_reminder' | 'custom';
  label: string;
  detail: string;
}

interface NotificationContextType {
  hasPermission: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  requestPermissions: () => Promise<boolean>;
  sendInstantNotification: (title: string, body: string, data?: Record<string, any>, channelId?: string) => Promise<void>;
  scheduleFeeReminder: (playerName: string, amount: number, secondsDelay: number) => Promise<string | null>;
  setDailyTrainingReminder: (hour: number, minute: number) => Promise<string | null>;
  cancelReminder: (notifId: string) => Promise<void>;
  clearAllReminders: () => Promise<void>;
  scheduledReminders: ScheduledReminder[];
  dailyTrainingReminderId: string | null;
  dailyTrainingTime: { hour: number; minute: number } | null;
  lastNotification: Notifications.Notification | null;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [dailyTrainingReminderId, setDailyTrainingReminderId] = useState<string | null>(null);
  const [dailyTrainingTime, setDailyTrainingTime] = useState<{ hour: number; minute: number } | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  const notifListenerRef = useRef<Notifications.Subscription | null>(null);
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  // Initialize on mount
  useEffect(() => {
    initPermissions();

    // Listen for notifications while app is in foreground
    notifListenerRef.current = Notifications.addNotificationReceivedListener(notification => {
      setLastNotification(notification);
    });

    // Listen for user tapping a notification
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Could be extended to navigate based on notification type
      console.log('[Notification tapped]', data);
    });

    return () => {
      if (notifListenerRef.current) {
        Notifications.removeNotificationSubscription(notifListenerRef.current);
      }
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current);
      }
    };
  }, []);

  const initPermissions = async () => {
    const status = await getPermissionStatus();
    setPermissionStatus(status);
    setHasPermission(status === 'granted');
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const requestPermissions = async (): Promise<boolean> => {
    const granted = await requestNotificationPermissions();
    const status = await getPermissionStatus();
    setPermissionStatus(status);
    setHasPermission(granted);
    return granted;
  };

  const sendInstantNotification = async (
    title: string,
    body: string,
    data?: Record<string, any>,
    channelId?: string
  ): Promise<void> => {
    if (!hasPermission) return;
    await sendLocalNotification(title, body, data, channelId);
  };

  const scheduleFeeReminder = async (
    playerName: string,
    amount: number,
    secondsDelay: number
  ): Promise<string | null> => {
    if (!hasPermission) return null;
    try {
      const notifId = await scheduleDelayedNotification(
        'Fee Payment Due',
        `Please follow up: ₹${amount} from ${playerName} is overdue.`,
        secondsDelay,
        { type: 'fee', playerName, amount },
        'fees'
      );
      const reminder: ScheduledReminder = {
        localId: `fee-${Date.now()}`,
        notifId,
        type: 'fee_reminder',
        label: `Fee: ${playerName}`,
        detail: `₹${amount} · in ${Math.round(secondsDelay / 3600)}h`,
      };
      setScheduledReminders(prev => [...prev, reminder]);
      return notifId;
    } catch {
      return null;
    }
  };

  const setDailyTrainingReminder = async (hour: number, minute: number): Promise<string | null> => {
    if (!hasPermission) return null;
    try {
      // Cancel previous daily reminder if exists
      if (dailyTrainingReminderId) {
        await cancelNotification(dailyTrainingReminderId);
        setScheduledReminders(prev => prev.filter(r => r.type !== 'daily_training'));
      }

      const hh = hour.toString().padStart(2, '0');
      const mm = minute.toString().padStart(2, '0');

      const notifId = await scheduleDailyRepeatNotification(
        'Training Session',
        'Your cricket session starts soon. Stay focused and give your best!',
        hour,
        minute,
        'training'
      );

      const reminder: ScheduledReminder = {
        localId: `daily-${Date.now()}`,
        notifId,
        type: 'daily_training',
        label: 'Daily Training Reminder',
        detail: `Every day at ${hh}:${mm}`,
      };

      setDailyTrainingReminderId(notifId);
      setDailyTrainingTime({ hour, minute });
      setScheduledReminders(prev => [
        ...prev.filter(r => r.type !== 'daily_training'),
        reminder,
      ]);
      return notifId;
    } catch {
      return null;
    }
  };

  const cancelReminder = async (notifId: string): Promise<void> => {
    await cancelNotification(notifId);
    setScheduledReminders(prev => prev.filter(r => r.notifId !== notifId));
    if (notifId === dailyTrainingReminderId) {
      setDailyTrainingReminderId(null);
      setDailyTrainingTime(null);
    }
  };

  const clearAllReminders = async (): Promise<void> => {
    await cancelAllNotifications();
    setScheduledReminders([]);
    setDailyTrainingReminderId(null);
    setDailyTrainingTime(null);
  };

  return (
    <NotificationContext.Provider value={{
      hasPermission,
      permissionStatus,
      requestPermissions,
      sendInstantNotification,
      scheduleFeeReminder,
      setDailyTrainingReminder,
      cancelReminder,
      clearAllReminders,
      scheduledReminders,
      dailyTrainingReminderId,
      dailyTrainingTime,
      lastNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
