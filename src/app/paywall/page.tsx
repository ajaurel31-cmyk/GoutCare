'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, CrownIcon } from '@/components/icons';
import { purchaseProduct } from '@/lib/subscription';
import { PRODUCT_IDS } from '@/lib/constants';

type Plan = 'monthly' | 'annual';

export default function PaywallPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const productId = selected === 'monthly' ? PRODUCT_IDS.monthly : PRODUCT_IDS.annual;
      const success = await purchaseProduct(productId);
      if (success) {
        router.replace('/');
      }
    } catch {
      // Purchase failed — stay on paywall
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Logo — blue square with white droplet + G */}
        <div style={styles.logo}>
          <svg width="44" height="52" viewBox="0 0 20 24">
            <path d="M10 0 C10 0 0 12 0 16 C0 20.4 4.5 24 10 24 C15.5 24 20 20.4 20 16 C20 12 10 0 10 0Z" fill="#fff" />
            <path d="M12.2 17 L12.2 18.6 C11.5 19.2 10.6 19.6 9.6 19.6 C7.2 19.6 5.6 17.6 5.6 15.2 C5.6 12.8 7.2 10.8 9.6 10.8 C10.8 10.8 11.7 11.2 12.3 11.8 L11.3 13 C10.8 12.5 10.3 12.2 9.6 12.2 C8.1 12.2 7.2 13.4 7.2 15.2 C7.2 17 8.1 18.2 9.6 18.2 C10.2 18.2 10.7 18 11 17.6 L11 16.8 L9.8 16.8 L9.8 15.6 L12.2 15.6 Z" fill="#1e3a5f"/>
          </svg>
        </div>

        <h1 style={styles.heading}>Your Free Trial Has Ended</h1>
        <p style={styles.sub}>
          Subscribe to continue tracking your gout, scanning foods with AI, and managing your health.
        </p>

        {/* Features list */}
        <div style={styles.features}>
          {['AI-powered food scanning', 'Unlimited purine tracking', 'Uric acid trends & insights', 'Flare logging & analysis'].map((feat) => (
            <div key={feat} style={styles.featureRow}>
              <div style={styles.featureCheck}>
                <CheckIcon size={12} color="#fff" />
              </div>
              <span style={styles.featureText}>{feat}</span>
            </div>
          ))}
        </div>

        {/* Plan Cards */}
        <div style={styles.plans}>
          {/* Monthly */}
          <button
            onClick={() => setSelected('monthly')}
            style={{ ...styles.planCard, ...(selected === 'monthly' ? styles.planSelected : {}) }}
          >
            <div style={styles.planTop}>
              <span style={styles.planName}>Monthly</span>
              {selected === 'monthly' && <div style={styles.check}><CheckIcon size={14} color="#fff" /></div>}
            </div>
            <span style={styles.planPrice}>$4.99<span style={styles.planPeriod}>/month</span></span>
            <span style={styles.planDetail}>Billed monthly, cancel anytime</span>
          </button>

          {/* Annual */}
          <button
            onClick={() => setSelected('annual')}
            style={{ ...styles.planCard, ...(selected === 'annual' ? styles.planSelected : {}) }}
          >
            <div style={styles.saveBadge}>Save 50%</div>
            <div style={styles.planTop}>
              <span style={styles.planName}>Annual</span>
              {selected === 'annual' && <div style={styles.check}><CheckIcon size={14} color="#fff" /></div>}
            </div>
            <span style={styles.planPrice}>$29.99<span style={styles.planPeriod}>/year</span></span>
            <span style={styles.planDetail}>Just $2.50/month — best value</span>
          </button>
        </div>

        {/* CTA */}
        <button onClick={handleSubscribe} disabled={loading} style={styles.cta}>
          <CrownIcon size={20} color="#1e3a5f" />
          <span>{loading ? 'Processing...' : 'Subscribe Now'}</span>
        </button>

        <p style={styles.cancel}>Cancel anytime. Subscription renews automatically.</p>

        <div style={styles.legal}>
          <span style={styles.legalLink}>Terms of Service</span>
          <span style={styles.legalSep}>|</span>
          <span style={styles.legalLink}>Privacy Policy</span>
          <span style={styles.legalSep}>|</span>
          <span style={styles.legalLink}>Restore Purchases</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #0a1628 0%, #0f1f3d 40%, #162a52 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  inner: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: 80, height: 80,
    borderRadius: 24,
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    boxShadow: '0 8px 32px rgba(59,130,246,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: { fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' as const },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center' as const, marginBottom: 24, lineHeight: 1.5, maxWidth: 320 },
  features: { width: '100%', marginBottom: 28, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  featureRow: { display: 'flex', alignItems: 'center', gap: 12 },
  featureCheck: {
    width: 22, height: 22, borderRadius: '50%', background: '#22c55e',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: 500 },
  plans: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: 12, marginBottom: 24 },
  planCard: {
    position: 'relative' as const,
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '18px 20px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    color: '#fff',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  planSelected: {
    border: '2px solid #3b82f6',
    background: 'rgba(59,130,246,0.1)',
    boxShadow: '0 0 20px rgba(59,130,246,0.15)',
  },
  planTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  planName: { fontSize: 16, fontWeight: 600 },
  planPrice: { fontSize: 24, fontWeight: 800, marginTop: 4 },
  planPeriod: { fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)' },
  planDetail: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  check: {
    width: 24, height: 24, borderRadius: '50%', background: '#3b82f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  saveBadge: {
    position: 'absolute' as const,
    top: -10, right: 14,
    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
    color: '#fff', fontSize: 11, fontWeight: 700,
    padding: '3px 10px', borderRadius: 20,
  },
  cta: {
    width: '100%',
    padding: '16px 24px',
    borderRadius: 14,
    background: '#ffffff',
    color: '#1e3a5f',
    fontSize: 17, fontWeight: 700,
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    marginBottom: 16,
    transition: 'opacity 0.2s',
  },
  cancel: { fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' as const, marginBottom: 24 },
  legal: { display: 'flex', alignItems: 'center', gap: 8 },
  legalLink: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', cursor: 'pointer' },
  legalSep: { fontSize: 12, color: 'rgba(255,255,255,0.15)' },
};
