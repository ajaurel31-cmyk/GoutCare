import {
  UserProfile,
  DailyLog,
  FoodEntry,
  UricAcidReading,
  GoutFlare,
  WaterIntake,
  WaterEntry,
  Medication,
  DoseLog,
  SubscriptionStatus,
  ReminderSettings,
} from './types';
import {
  DEFAULT_PURINE_TARGET,
  DEFAULT_WATER_GOAL,
} from './constants';
import { generateId, getToday } from './utils';

// ─── Storage Keys ───────────────────────────────────────────────────────────

const KEYS = {
  USER_PROFILE: 'goutcare_user_profile',
  DAILY_LOG_PREFIX: 'goutcare_daily_log_',
  URIC_ACID_READINGS: 'goutcare_uric_acid_readings',
  GOUT_FLARES: 'goutcare_gout_flares',
  WATER_INTAKE_PREFIX: 'goutcare_water_intake_',
  MEDICATIONS: 'goutcare_medications',
  DOSE_LOG_PREFIX: 'goutcare_dose_log_',
  SCAN_COUNT_PREFIX: 'goutcare_scan_count_',
  SUBSCRIPTION: 'goutcare_subscription',
  MEAL_FAVORITES: 'goutcare_meal_favorites',
  REMINDERS: 'goutcare_reminders',
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

// ─── UserProfile ────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  goutStage: 'intercritical',
  medications: [],
  restrictions: [],
  purineTarget: DEFAULT_PURINE_TARGET,
  waterGoal: DEFAULT_WATER_GOAL,
  theme: 'dark',
  onboardingComplete: false,
  notificationsEnabled: false,
};

export function getUserProfile(): UserProfile {
  const profile = getItem<UserProfile>(KEYS.USER_PROFILE);
  return profile ? { ...DEFAULT_PROFILE, ...profile } : { ...DEFAULT_PROFILE };
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getUserProfile();
  const updated = { ...current, ...updates };
  setItem(KEYS.USER_PROFILE, updated);
  return updated;
}

// ─── DailyLog ───────────────────────────────────────────────────────────────

export function getDailyLog(date: string): DailyLog {
  const key = KEYS.DAILY_LOG_PREFIX + date;
  const log = getItem<DailyLog>(key);
  return log ?? { date, foods: [], totalPurine: 0 };
}

export function addFoodEntry(date: string, entry: Omit<FoodEntry, 'id' | 'timestamp'>): DailyLog {
  const log = getDailyLog(date);
  const newEntry: FoodEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  log.foods.push(newEntry);
  log.totalPurine = log.foods.reduce((sum, f) => sum + f.purineContent, 0);
  setItem(KEYS.DAILY_LOG_PREFIX + date, log);
  return log;
}

export function removeFoodEntry(date: string, entryId: string): DailyLog {
  const log = getDailyLog(date);
  log.foods = log.foods.filter((f) => f.id !== entryId);
  log.totalPurine = log.foods.reduce((sum, f) => sum + f.purineContent, 0);
  setItem(KEYS.DAILY_LOG_PREFIX + date, log);
  return log;
}

// ─── UricAcidReadings ───────────────────────────────────────────────────────

export function getUricAcidReadings(): UricAcidReading[] {
  return getItem<UricAcidReading[]>(KEYS.URIC_ACID_READINGS) ?? [];
}

export function addUricAcidReading(reading: Omit<UricAcidReading, 'id'>): UricAcidReading[] {
  const readings = getUricAcidReadings();
  const newReading: UricAcidReading = {
    ...reading,
    id: generateId(),
  };
  readings.unshift(newReading);
  // Sort by date descending
  readings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  setItem(KEYS.URIC_ACID_READINGS, readings);
  return readings;
}

export function deleteUricAcidReading(id: string): UricAcidReading[] {
  let readings = getUricAcidReadings();
  readings = readings.filter((r) => r.id !== id);
  setItem(KEYS.URIC_ACID_READINGS, readings);
  return readings;
}

// ─── GoutFlares ─────────────────────────────────────────────────────────────

export function getGoutFlares(): GoutFlare[] {
  return getItem<GoutFlare[]>(KEYS.GOUT_FLARES) ?? [];
}

export function addGoutFlare(flare: Omit<GoutFlare, 'id'>): GoutFlare[] {
  const flares = getGoutFlares();
  const newFlare: GoutFlare = {
    ...flare,
    id: generateId(),
  };
  flares.unshift(newFlare);
  // Sort by date descending
  flares.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  setItem(KEYS.GOUT_FLARES, flares);
  return flares;
}

export function deleteGoutFlare(id: string): GoutFlare[] {
  let flares = getGoutFlares();
  flares = flares.filter((f) => f.id !== id);
  setItem(KEYS.GOUT_FLARES, flares);
  return flares;
}

// ─── WaterIntake ────────────────────────────────────────────────────────────

export function getWaterIntake(date: string): WaterIntake {
  const key = KEYS.WATER_INTAKE_PREFIX + date;
  const intake = getItem<WaterIntake>(key);
  const profile = getUserProfile();
  return intake ?? { date, entries: [], total: 0, goal: profile.waterGoal };
}

export function addWaterEntry(date: string, amount: number): WaterIntake {
  const intake = getWaterIntake(date);
  const newEntry: WaterEntry = {
    id: generateId(),
    amount,
    timestamp: new Date().toISOString(),
  };
  intake.entries.push(newEntry);
  intake.total = intake.entries.reduce((sum, e) => sum + e.amount, 0);
  setItem(KEYS.WATER_INTAKE_PREFIX + date, intake);
  return intake;
}

// ─── Medications ────────────────────────────────────────────────────────────

export function getMedications(): Medication[] {
  return getItem<Medication[]>(KEYS.MEDICATIONS) ?? [];
}

export function addMedication(medication: Omit<Medication, 'id'>): Medication[] {
  const medications = getMedications();
  const newMedication: Medication = {
    ...medication,
    id: generateId(),
  };
  medications.push(newMedication);
  setItem(KEYS.MEDICATIONS, medications);
  return medications;
}

export function updateMedication(id: string, updates: Partial<Medication>): Medication[] {
  const medications = getMedications();
  const index = medications.findIndex((m) => m.id === id);
  if (index !== -1) {
    medications[index] = { ...medications[index], ...updates };
    setItem(KEYS.MEDICATIONS, medications);
  }
  return medications;
}

export function deleteMedication(id: string): Medication[] {
  let medications = getMedications();
  medications = medications.filter((m) => m.id !== id);
  setItem(KEYS.MEDICATIONS, medications);
  return medications;
}

// ─── DoseLog ────────────────────────────────────────────────────────────────

export function getDoseLogs(date: string): DoseLog[] {
  const key = KEYS.DOSE_LOG_PREFIX + date;
  return getItem<DoseLog[]>(key) ?? [];
}

export function logDose(dose: DoseLog): DoseLog[] {
  const logs = getDoseLogs(dose.date);
  // Check if a log already exists for this medication on this date
  const existingIndex = logs.findIndex(
    (l) => l.medicationId === dose.medicationId && l.time === dose.time
  );
  if (existingIndex !== -1) {
    logs[existingIndex] = dose;
  } else {
    logs.push(dose);
  }
  setItem(KEYS.DOSE_LOG_PREFIX + dose.date, logs);
  return logs;
}

// ─── ScanCount ──────────────────────────────────────────────────────────────

export function getScanCount(date?: string): number {
  const d = date ?? getToday();
  const key = KEYS.SCAN_COUNT_PREFIX + d;
  return getItem<number>(key) ?? 0;
}

export function incrementScanCount(date?: string): number {
  const d = date ?? getToday();
  const key = KEYS.SCAN_COUNT_PREFIX + d;
  const current = getScanCount(d);
  const newCount = current + 1;
  setItem(key, newCount);
  return newCount;
}

// ─── SubscriptionStatus ─────────────────────────────────────────────────────

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  isActive: false,
  plan: 'free',
  expiresAt: null,
  isTrial: false,
};

export function getSubscriptionStatus(): SubscriptionStatus {
  const status = getItem<SubscriptionStatus>(KEYS.SUBSCRIPTION);
  return status ?? { ...DEFAULT_SUBSCRIPTION };
}

export function setSubscriptionStatus(status: SubscriptionStatus): void {
  setItem(KEYS.SUBSCRIPTION, status);
}

// ─── Meal Favorites ─────────────────────────────────────────────────────────

export function getMealFavorites(): string[] {
  return getItem<string[]>(KEYS.MEAL_FAVORITES) ?? [];
}

export function toggleMealFavorite(mealId: string): string[] {
  const favorites = getMealFavorites();
  const index = favorites.indexOf(mealId);
  if (index !== -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(mealId);
  }
  setItem(KEYS.MEAL_FAVORITES, favorites);
  return favorites;
}

// ─── Reminders ─────────────────────────────────────────────────────────────

const DEFAULT_REMINDERS: ReminderSettings = {
  waterEnabled: false,
  waterIntervalHours: 2,
  waterStartTime: '08:00',
  waterEndTime: '22:00',

  mealsEnabled: false,
  breakfastTime: '08:00',
  lunchTime: '12:00',
  dinnerTime: '18:00',

  medicationEnabled: false,
  medicationTimes: ['09:00'],

  uricAcidEnabled: false,
  uricAcidFrequency: 'weekly',
  uricAcidDay: 1, // Monday
  uricAcidTime: '09:00',
};

export function getReminderSettings(): ReminderSettings {
  const settings = getItem<ReminderSettings>(KEYS.REMINDERS);
  return settings ? { ...DEFAULT_REMINDERS, ...settings } : { ...DEFAULT_REMINDERS };
}

export function updateReminderSettings(updates: Partial<ReminderSettings>): ReminderSettings {
  const current = getReminderSettings();
  const updated = { ...current, ...updates };
  setItem(KEYS.REMINDERS, updated);
  return updated;
}

// ─── Export All Data ────────────────────────────────────────────────────────

export function exportAllData(): string {
  if (typeof window === 'undefined') return '{}';

  const data: Record<string, unknown> = {};

  // Collect all localStorage items with our prefix
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('goutcare_')) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          data[key] = JSON.parse(raw);
        }
      } catch {
        // Skip malformed entries
      }
    }
  }

  return JSON.stringify(data, null, 2);
}
