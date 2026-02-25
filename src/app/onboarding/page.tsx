'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldIcon, CheckIcon, CrownIcon } from '@/components/icons';
import { updateUserProfile } from '@/lib/storage';
import { startTrial, purchaseProduct } from '@/lib/subscription';
import { PRODUCT_IDS } from '@/lib/constants';

type Plan = 'trial' | 'monthly' | 'annual';

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Plan>('trial');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      if (selected === 'trial') {
        startTrial();
      } else if (selected === 'monthly') {
        await purchaseProduct(PRODUCT_IDS.monthly);
      } else {
        await purchaseProduct(PRODUCT_IDS.annual);
      }
      updateUserProfile({ onboardingComplete: true });
      router.replace('/');
    } catch {
      // On failure still mark onboarding and proceed
      updateUserProfile({ onboardingComplete: true });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* Logo */}
        <div style={styles.logoCircle}>
          <ShieldIcon size={40} color="#ffffff" />
        </div>

        <h1 style={styles.heading}>Welcome to GoutCare</h1>
        <p style={styles.sub}>Your AI-powered companion for gout management</p>

        {/* Plan Cards */}
        <div style={styles.plans}>
          {/* 7-day trial */}
          <button
            onClick={() => setSelected('trial')}
            style={{ ...styles.planCard, ...(selected === 'trial' ? styles.planSelected : {}) }}
          >
            <div style={styles.planTop}>
              <span style={styles.planName}>7-Day Free Trial</span>
              {selected === 'trial' && <div style={styles.check}><CheckIcon size={14} color="#fff" /></div>}
            </div>
            <span style={styles.planPrice}>$0.00</span>
            <span style={styles.planDetail}>Full access for 7 days, cancel anytime</span>
          </button>

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
            <span style={styles.planDetail}>Billed monthly</span>
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
            <span style={styles.planDetail}>Just $2.50/month</span>
          </button>
        </div>

        {/* CTA */}
        <button onClick={handleContinue} disabled={loading} style={styles.cta}>
          <CrownIcon size={20} color="#1e3a5f" />
          <span>{loading ? 'Loading...' : selected === 'trial' ? 'Start Free Trial' : 'Subscribe Now'}</span>
        </button>

        <p style={styles.cancel}>Cancel anytime. No charge during trial.</p>

        <div style={styles.legal}>
          <span style={styles.legalLink}>Terms of Service</span>
          <span style={styles.legalSep}>|</span>
          <span style={styles.legalLink}>Privacy Policy</span>
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
  logoCircle: {
    width: 80, height: 80,
    borderRadius: '50%',
    background: 'rgba(59,130,246,0.2)',
    border: '2px solid rgba(59,130,246,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: { fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32, lineHeight: 1.5 },
  plans: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  planCard: {
    position: 'relative',
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '18px 20px',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#fff',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
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
    position: 'absolute',
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
  cancel: { fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: 24 },
  legal: { display: 'flex', alignItems: 'center', gap: 8 },
  legalLink: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', cursor: 'pointer' },
  legalSep: { fontSize: 12, color: 'rgba(255,255,255,0.15)' },
};
