'use client';

import { ScanIcon } from '@/components/icons';

export default function ScannerPage() {
  return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-icon">
        <ScanIcon size={28} />
      </div>
      <div className="empty-title">Food Scanner</div>
      <div className="empty-text">
        AI-powered food analysis coming in Phase 4.
      </div>
    </div>
  );
}
