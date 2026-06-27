import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─── Android Channels ────────────────────────────────────────────────────────

async function setupAndroidChannels() {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFD700',
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('fees', {
    name: 'Fee Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 200, 300],
    lightColor: '#FF6B6B',
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('training', {
    name: 'Training Alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#4CAF50',
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('announcement', {
    name: 'Announcements',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2196F3',
    sound: 'default',
  });
}

// ─── Permission ──────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') {
    if (Platform.OS === 'android') await setupAndroidChannels();
    return true;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') await setupAndroidChannels();
  return true;
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as 'granted' | 'denied' | 'undetermined';
}

// ─── Send Instant Push ───────────────────────────────────────────────────────

export async function sendLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {},
  channelId = 'default'
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: null, // fire immediately
  });
}

// ─── Schedule Delayed Push ───────────────────────────────────────────────────

export async function scheduleDelayedNotification(
  title: string,
  body: string,
  seconds: number,
  data: Record<string, any> = {},
  channelId = 'default'
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: { seconds } as any,
  });
}

// ─── Daily Repeating Reminder ────────────────────────────────────────────────

export async function scheduleDailyRepeatNotification(
  title: string,
  body: string,
  hour: number,
  minute: number,
  channelId = 'training'
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: { hour, minute, repeats: true } as any,
  });
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}
