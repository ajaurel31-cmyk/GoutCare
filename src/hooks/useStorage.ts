'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = T | ((prev: T) => T);

export function useStorage<T>(key: string, defaultValue: T): [T, (value: SetValue<T>) => void] {
  // Track whether we are on the client
  const isClient = typeof window !== 'undefined';

  // Use a ref to hold the default value stably
  const defaultRef = useRef(defaultValue);

  const readValue = useCallback((): T => {
    if (!isClient) return defaultRef.current;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultRef.current;
      return JSON.parse(item) as T;
    } catch {
      return defaultRef.current;
    }
  }, [key, isClient]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    // During SSR, return the default value
    if (!isClient) return defaultValue;
    return readValue();
  });

  // Hydrate on mount if SSR returned default
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore =
          value instanceof Function ? value(readValue()) : value;

        setStoredValue(valueToStore);

        if (isClient) {
          localStorage.setItem(key, JSON.stringify(valueToStore));

          // Dispatch a custom event so other hook instances in the same tab can sync
          window.dispatchEvent(
            new CustomEvent('goutcare-storage', { detail: { key } })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, isClient, readValue]
  );

  // Listen for cross-tab storage events
  useEffect(() => {
    if (!isClient) return;

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };

    // Listen for same-tab custom events
    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === key) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('goutcare-storage', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('goutcare-storage', handleCustomEvent);
    };
  }, [key, isClient, readValue]);

  return [storedValue, setValue];
}
