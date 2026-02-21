import { PurineLevel } from './types';
import { PURINE_THRESHOLDS, URIC_ACID_RANGES } from './constants';

/**
 * Generate a unique ID using crypto.randomUUID with a fallback.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format a date string or Date object to a human-readable format.
 * Example: "Feb 21, 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date string or Date object to a time string.
 * Example: "3:45 PM"
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date string to a relative date label.
 * Returns "Today", "Yesterday", or "X days ago".
 */
export function formatRelativeDate(date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date + 'T00:00:00');
  target.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 0) return formatDate(date);
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return formatDate(date);
}

/**
 * Determine the purine level category based on mg per 100g.
 */
export function getPurineLevel(mg: number): PurineLevel {
  if (mg <= PURINE_THRESHOLDS.low) return 'low';
  if (mg <= PURINE_THRESHOLDS.moderate) return 'moderate';
  if (mg <= PURINE_THRESHOLDS.high) return 'high';
  return 'very-high';
}

/**
 * Get a human-readable label for a purine level.
 */
export function getPurineLevelLabel(level: PurineLevel): string {
  const labels: Record<PurineLevel, string> = {
    'low': 'Low',
    'moderate': 'Moderate',
    'high': 'High',
    'very-high': 'Very High',
  };
  return labels[level];
}

/**
 * Get the CSS variable name for a uric acid value color.
 */
export function getUricAcidColor(value: number): string {
  if (value <= URIC_ACID_RANGES.normal) return 'var(--color-success)';
  if (value <= URIC_ACID_RANGES.elevated) return 'var(--color-warning)';
  if (value <= URIC_ACID_RANGES.high) return 'var(--color-danger)';
  return 'var(--color-critical)';
}

/**
 * Get a human-readable label for a uric acid reading.
 */
export function getUricAcidLabel(value: number): string {
  if (value <= URIC_ACID_RANGES.normal) return 'Normal';
  if (value <= URIC_ACID_RANGES.elevated) return 'Elevated';
  if (value <= URIC_ACID_RANGES.high) return 'High';
  return 'Critical';
}

/**
 * Calculate the number of days since a given date string (YYYY-MM-DD).
 */
export function getDaysSince(date: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date + 'T00:00:00');
  target.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - target.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Clamp a numeric value between a minimum and maximum.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
