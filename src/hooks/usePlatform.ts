'use client';

import { useState, useEffect } from 'react';

interface UsePlatformReturn {
  isNative: boolean;
  isIOS: boolean;
  isWeb: boolean;
}

export function usePlatform(): UsePlatformReturn {
  const [platform, setPlatform] = useState<UsePlatformReturn>({
    isNative: false,
    isIOS: false,
    isWeb: true,
  });

  useEffect(() => {
    async function detectPlatform() {
      try {
        const capacitor = await import('@capacitor/core');
        const { Capacitor } = capacitor;

        if (Capacitor && typeof Capacitor.isNativePlatform === 'function') {
          const isNative = Capacitor.isNativePlatform();
          const currentPlatform = Capacitor.getPlatform();

          setPlatform({
            isNative,
            isIOS: currentPlatform === 'ios',
            isWeb: currentPlatform === 'web',
          });
          return;
        }
      } catch {
        // Capacitor is not available; this is a web-only environment
      }

      // Fallback: detect iOS via user agent for web browsers on iOS
      const isIOSBrowser =
        typeof navigator !== 'undefined' &&
        /iPad|iPhone|iPod/.test(navigator.userAgent);

      setPlatform({
        isNative: false,
        isIOS: isIOSBrowser,
        isWeb: true,
      });
    }

    detectPlatform();
  }, []);

  return platform;
}
