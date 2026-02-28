/**
 * Local notification scheduling for GoutCare reminders.
 * Uses @capacitor/local-notifications on native and Web Notifications API on web.
 */

import { isNative } from './platform';
import { getReminderSettings } from './storage';
import type { ReminderSettings } from './types';

// Notification ID ranges to avoid collisions
const ID_WATER_BASE = 1000;
const ID_MEALS_BASE = 2000;
const ID_MEDICATION_BASE = 3000;
const ID_URIC_ACID = 4000;

// ─── Permission ────────────────────────────────────────────────────────────

export async function requestPermission(): Promise<boolean> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch {
      return false;
    }
  }
  // Web fallback
  if (typeof Notification !== 'undefined') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export async function checkPermission(): Promise<boolean> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch {
      return false;
    }
  }
  if (typeof Notification !== 'undefined') {
    return Notification.permission === 'granted';
  }
  return false;
}

// ─── Scheduling ────────────────────────────────────────────────────────────

export async function scheduleAllReminders(): Promise<void> {
  const settings = getReminderSettings();
  // Cancel existing before rescheduling
  await cancelAllReminders();

  if (isNative()) {
    await scheduleNativeReminders(settings);
  }
  // Web notifications are sent via a setInterval approach in the hook,
  // since the Web Notifications API doesn't support future scheduling.
}

async function scheduleNativeReminders(settings: ReminderSettings): Promise<void> {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const notifications: any[] = [];

    // Water reminders — recurring every N hours between start and end time
    if (settings.waterEnabled) {
      const [startH] = settings.waterStartTime.split(':').map(Number);
      const [endH] = settings.waterEndTime.split(':').map(Number);
      let idx = 0;
      for (let h = startH; h <= endH; h += settings.waterIntervalHours) {
        const [, startM] = settings.waterStartTime.split(':').map(Number);
        const schedule = new Date();
        schedule.setHours(h, idx === 0 ? startM : 0, 0, 0);
        if (schedule <= new Date()) schedule.setDate(schedule.getDate() + 1);

        notifications.push({
          id: ID_WATER_BASE + idx,
          title: 'Time to Hydrate',
          body: 'Log your water intake — staying hydrated helps lower uric acid.',
          schedule: {
            on: { hour: h, minute: idx === 0 ? startM : 0 },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_stat_drop',
          largeIcon: 'ic_launcher',
          sound: 'default',
        });
        idx++;
      }
    }

    // Meal reminders — breakfast, lunch, dinner
    if (settings.mealsEnabled) {
      const meals = [
        { time: settings.breakfastTime, label: 'Breakfast', body: 'Log what you ate for breakfast to track your purine intake.' },
        { time: settings.lunchTime, label: 'Lunch', body: 'Don\'t forget to log your lunch — keep your purine count accurate.' },
        { time: settings.dinnerTime, label: 'Dinner', body: 'Log your dinner to see your daily purine total.' },
      ];
      meals.forEach((meal, i) => {
        const [h, m] = meal.time.split(':').map(Number);
        notifications.push({
          id: ID_MEALS_BASE + i,
          title: `Log ${meal.label}`,
          body: meal.body,
          schedule: {
            on: { hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_stat_food',
          largeIcon: 'ic_launcher',
          sound: 'default',
        });
      });
    }

    // Medication reminders
    if (settings.medicationEnabled && settings.medicationTimes.length > 0) {
      settings.medicationTimes.forEach((time, i) => {
        const [h, m] = time.split(':').map(Number);
        notifications.push({
          id: ID_MEDICATION_BASE + i,
          title: 'Medication Reminder',
          body: 'Time to take your medication.',
          schedule: {
            on: { hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_stat_pill',
          largeIcon: 'ic_launcher',
          sound: 'default',
        });
      });
    }

    // Uric acid check reminder
    if (settings.uricAcidEnabled) {
      const [h, m] = settings.uricAcidTime.split(':').map(Number);
      if (settings.uricAcidFrequency === 'weekly') {
        notifications.push({
          id: ID_URIC_ACID,
          title: 'Uric Acid Check',
          body: 'Time for your weekly uric acid reading. Track your levels to stay on top of your health.',
          schedule: {
            on: { weekday: settings.uricAcidDay + 1, hour: h, minute: m }, // Capacitor weekday: 1=Sunday
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_stat_chart',
          largeIcon: 'ic_launcher',
          sound: 'default',
        });
      } else {
        // Monthly — schedule on the Nth day
        notifications.push({
          id: ID_URIC_ACID,
          title: 'Uric Acid Check',
          body: 'Time for your monthly uric acid reading. Track your levels to stay on top of your health.',
          schedule: {
            on: { day: settings.uricAcidDay, hour: h, minute: m },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_stat_chart',
          largeIcon: 'ic_launcher',
          sound: 'default',
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // Notification scheduling failed — likely permissions not granted
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch {
      // Silently fail
    }
  }
}

// ─── Web fallback: send a notification right now ───────────────────────────

export function sendWebNotification(title: string, body: string): void {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
    });
  }
}
