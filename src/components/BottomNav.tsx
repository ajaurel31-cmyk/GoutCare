'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ScanIcon, SearchIcon, ChartIcon, SettingsIcon } from '@/components/icons';

const tabs = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Scan', href: '/scanner', icon: ScanIcon },
  { label: 'Foods', href: '/database', icon: SearchIcon },
  { label: 'Tracker', href: '/uric-acid', icon: ChartIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} className={`nav-item${active ? ' active' : ''}`}>
            <Icon size={22} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
