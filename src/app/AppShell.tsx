'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const HIDE_NAV = ['/onboarding', '/paywall'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV.includes(pathname);

  return (
    <>
      <main className={showNav ? 'page' : 'page-full'}>{children}</main>
      {showNav && <BottomNav />}
    </>
  );
}
