'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemPreference() ? 'dark' : 'light';
  }
  return theme;
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem('goutcare_profile');
    if (stored) {
      const profile = JSON.parse(stored);
      if (profile.theme && ['light', 'dark', 'system'].includes(profile.theme)) {
        return profile.theme as Theme;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return 'system';
}

function persistTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem('goutcare_profile');
    const profile = stored ? JSON.parse(stored) : {};
    profile.theme = theme;
    localStorage.setItem('goutcare_profile', JSON.stringify(profile));
  } catch {
    // Ignore storage errors
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    const resolved = resolveTheme(storedTheme);
    setIsDark(resolved === 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const resolved = resolveTheme('system');
        setIsDark(resolved === 'dark');
        document.documentElement.setAttribute('data-theme', resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'goutcare_profile') {
        const newTheme = getStoredTheme();
        setThemeState(newTheme);
        const resolved = resolveTheme(newTheme);
        setIsDark(resolved === 'dark');
        document.documentElement.setAttribute('data-theme', resolved);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
    const resolved = resolveTheme(newTheme);
    setIsDark(resolved === 'dark');
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = isDark ? 'light' : 'dark';
    setTheme(next);
  }, [isDark, setTheme]);

  return { theme, setTheme, toggleTheme, isDark };
}
