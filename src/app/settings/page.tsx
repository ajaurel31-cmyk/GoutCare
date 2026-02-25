'use client';

import { SettingsIcon } from '@/components/icons';

export default function SettingsPage() {
  return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-icon">
        <SettingsIcon size={28} />
      </div>
      <div className="empty-title">Settings</div>
      <div className="empty-text">
        Profile, goals, and preferences — coming in Phase 8.
      </div>
    </div>
  );
}
