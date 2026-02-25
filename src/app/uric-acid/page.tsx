'use client';

import { ChartIcon } from '@/components/icons';

export default function TrackerPage() {
  return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-icon">
        <ChartIcon size={28} />
      </div>
      <div className="empty-title">Uric Acid Tracker</div>
      <div className="empty-text">
        Track readings and trends — coming in Phase 6.
      </div>
    </div>
  );
}
