'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const NO_NAV_ROUTES = ['/onboarding', '/terms', '/privacy', '/disclaimer', '/premium'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !NO_NAV_ROUTES.includes(pathname);

  return (
    <>
      <main className={showNav ? 'page-content' : 'page-content-full'}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  );
}
