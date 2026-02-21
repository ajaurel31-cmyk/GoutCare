'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CrownIcon } from '@/components/icons';
import { useSubscription } from '@/hooks/useSubscription';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, feature }: PremiumGateProps) {
  const { isPremium, loading } = useSubscription();
  const router = useRouter();

  // While loading subscription state, show children with a slight opacity
  // to avoid layout flicker
  if (loading) {
    return <div style={{ opacity: 0.5 }}>{children}</div>;
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="premium-gate">
      <div className="premium-gate-content">
        {children}
      </div>
      <div className="premium-gate-overlay">
        <div className="premium-gate-card">
          <div className="premium-gate-icon">
            <CrownIcon size={48} color="var(--color-premium, #f59e0b)" />
          </div>
          <h3 className="premium-gate-heading">Premium Feature</h3>
          {feature && (
            <p className="premium-gate-description">{feature}</p>
          )}
          <button
            className="premium-gate-button"
            onClick={() => router.push('/premium')}
            type="button"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
