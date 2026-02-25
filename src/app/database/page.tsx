'use client';

import { SearchIcon } from '@/components/icons';

export default function DatabasePage() {
  return (
    <div className="empty-state" style={{ minHeight: '70vh' }}>
      <div className="empty-icon">
        <SearchIcon size={28} />
      </div>
      <div className="empty-title">Food Database</div>
      <div className="empty-text">
        Search and browse purine content — coming in Phase 5.
      </div>
    </div>
  );
}
