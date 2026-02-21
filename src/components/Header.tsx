'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronIcon } from '@/components/icons';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="page-header">
      <div className="page-header-left">
        {showBack && (
          <button
            className="page-header-back"
            onClick={() => router.back()}
            aria-label="Go back"
            type="button"
          >
            <ChevronIcon direction="left" size={24} />
          </button>
        )}
      </div>

      <h1 className="page-header-title">{title}</h1>

      <div className="page-header-right">
        {rightAction || null}
      </div>
    </header>
  );
}
