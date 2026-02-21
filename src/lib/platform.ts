/**
 * Platform detection utilities for Capacitor native integration.
 */

/**
 * Check if the app is running as a native Capacitor app.
 */
export function isNative(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Check if the app is running on iOS via Capacitor.
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as any).Capacitor?.getPlatform?.() === 'ios';
}

/**
 * Check if the app is running on Android via Capacitor.
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as any).Capacitor?.getPlatform?.() === 'android';
}

/**
 * Check if the app is running in a web browser (not native).
 */
export function isWeb(): boolean {
  return !isNative();
}

/**
 * Get the current platform string.
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'web';
}
