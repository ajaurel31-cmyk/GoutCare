export type PurineLevel = 'low' | 'moderate' | 'high' | 'very-high';
export type PurineCategory = 'Meats' | 'Seafood' | 'Vegetables' | 'Dairy' | 'Grains' | 'Beverages' | 'Fruits' | 'Nuts & Seeds' | 'Legumes' | 'Condiments' | 'Snacks' | 'Organ Meats' | 'Alcohol';
export type GoutStage = 'acute' | 'intercritical' | 'chronic';
export type Joint = 'big-toe' | 'ankle' | 'knee' | 'wrist' | 'finger' | 'elbow' | 'other';
export type Trigger = 'food' | 'alcohol' | 'dehydration' | 'stress' | 'injury' | 'medication-change' | 'weather' | 'other';
export type Treatment = 'colchicine' | 'nsaids' | 'prednisone' | 'ice' | 'rest' | 'elevation' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DietaryPreference = 'all' | 'vegetarian' | 'dairy-free' | 'gluten-free';

export interface FoodItem {
  id: string;
  name: string;
  category: PurineCategory;
  purineContent: number; // mg per 100g
  purineLevel: PurineLevel;
  servingSize: string;
  description?: string;
  warnings?: string[];
}

export interface FoodEntry {
  id: string;
  foodId: string;
  name: string;
  servingSize: string;
  purineContent: number;
  timestamp: string;
}

export interface DailyLog {
  date: string;
  foods: FoodEntry[];
  totalPurine: number;
}

export interface UricAcidReading {
  id: string;
  date: string;
  value: number; // mg/dL
  notes: string;
}

export interface GoutFlare {
  id: string;
  date: string;
  time: string;
  joints: Joint[];
  painLevel: number; // 1-10
  durationHours: number;
  durationDays: number;
  triggers: Trigger[];
  treatments: Treatment[];
  notes: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  reminderTimes: string[];
  isActive: boolean;
}

export interface DoseLog {
  medicationId: string;
  date: string;
  time: string;
  taken: boolean;
}

export interface WaterEntry {
  id: string;
  amount: number; // oz
  timestamp: string;
}

export interface WaterIntake {
  date: string;
  entries: WaterEntry[];
  total: number;
  goal: number;
}

export interface UserProfile {
  goutStage: GoutStage;
  medications: string[];
  restrictions: string[];
  purineTarget: number;
  waterGoal: number;
  theme: 'light' | 'dark' | 'system';
  onboardingComplete: boolean;
  trialStartDate: string | null;
  notificationsEnabled: boolean;
}

export interface ScanResult {
  foods: string[];
  purineLevel: PurineLevel;
  estimatedPurine: number;
  explanation: string;
  alternatives: string[];
  safetyDuringFlare: string;
  riskFactors: string[];
  benefits: string[];
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'free' | 'monthly' | 'annual' | 'trial';
  expiresAt: string | null;
  isTrial: boolean;
}

export interface MealSuggestion {
  id: string;
  name: string;
  type: MealType;
  estimatedPurine: number;
  ingredients: string[];
  instructions: string;
  dietaryTags: DietaryPreference[];
  isFavorite: boolean;
}

export interface ReminderSettings {
  waterEnabled: boolean;
  waterIntervalHours: number;
  waterStartTime: string;
  waterEndTime: string;

  mealsEnabled: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;

  medicationEnabled: boolean;
  medicationTimes: string[];

  uricAcidEnabled: boolean;
  uricAcidFrequency: 'weekly' | 'monthly';
  uricAcidDay: number;
  uricAcidTime: string;
}
