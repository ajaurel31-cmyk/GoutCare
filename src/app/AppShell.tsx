'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import BottomNav from '@/components/BottomNav';

const HIDE_NAV = ['/onboarding', '/paywall', '/terms', '/privacy', '/eula', '/support'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV.includes(pathname);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setOverlaysWebView({ overlay: true });
    }
  }, []);

  return (
    <>
      <main className={showNav ? 'page' : 'page-full'}>{children}</main>
      {showNav && <BottomNav />}
    </>
  );
}
