'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ScanIcon, SearchIcon, ChartIcon, SettingsIcon } from '@/components/icons';

interface NavTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

const tabs: NavTab[] = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Scan', href: '/scanner', icon: ScanIcon },
  { label: 'Database', href: '/database', icon: SearchIcon },
  { label: 'Track', href: '/uric-acid', icon: ChartIcon },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`bottom-nav-item${active ? ' active' : ''}`}
          >
            <Icon size={22} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
