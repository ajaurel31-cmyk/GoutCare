'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ShieldIcon from '@/components/icons/ShieldIcon';
import ScanIcon from '@/components/icons/ScanIcon';
import ChartIcon from '@/components/icons/ChartIcon';
import FlameIcon from '@/components/icons/FlameIcon';
import ForkKnifeIcon from '@/components/icons/ForkKnifeIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import CrownIcon from '@/components/icons/CrownIcon';

type PlanType = 'monthly' | 'annual';

interface UserProfile {
  onboardingComplete?: boolean;
  trialStartDate?: string;
  subscriptionPlan?: string;
  subscriptionActive?: boolean;
}

function isTrialActive(trialStartDate: string | undefined): boolean {
  if (!trialStartDate) return false;
  const start = new Date(trialStartDate);
  const now = new Date();
  const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user already completed onboarding and has active subscription/trial
    try {
      const stored = localStorage.getItem('goutcare_profile');
      if (stored) {
        const profile: UserProfile = JSON.parse(stored);
        if (
          profile.onboardingComplete &&
          (profile.subscriptionActive || isTrialActive(profile.trialStartDate))
        ) {
          router.replace('/');
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [router]);

  const handleStartTrial = async () => {
    setLoading(true);

    try {
      if (isNativePlatform()) {
        // Attempt native purchase via @capgo/native-purchases
        try {
          const { NativePurchases } = await import('@capgo/native-purchases');
          const productId =
            selectedPlan === 'annual'
              ? 'goutcare_annual'
              : 'goutcare_monthly';

          const transaction = await NativePurchases.purchaseProduct({
            productIdentifier: productId,
            productType: 'subs' as any,
          });

          if (transaction && transaction.isActive) {
            saveProfileAndRedirect(true);
            return;
          }

          // If native purchase flow didn't complete, fall through to web trial
          saveProfileAndRedirect(false);
        } catch (nativeError: any) {
          console.warn('Native purchase failed, falling back to web trial:', nativeError);
          saveProfileAndRedirect(false);
        }
      } else {
        // Web: Start trial by saving trial start date to localStorage
        saveProfileAndRedirect(false);
      }
    } catch (error) {
      console.error('Failed to start trial:', error);
      setLoading(false);
    }
  };

  const saveProfileAndRedirect = (subscribed: boolean) => {
    try {
      const existing = localStorage.getItem('goutcare_profile');
      const profile: UserProfile = existing ? JSON.parse(existing) : {};

      profile.trialStartDate = new Date().toISOString();
      profile.onboardingComplete = true;

      if (subscribed) {
        profile.subscriptionPlan = selectedPlan;
        profile.subscriptionActive = true;
      }

      localStorage.setItem('goutcare_profile', JSON.stringify(profile));
    } catch {
      // If localStorage fails, still redirect
    }

    router.replace('/');
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);

    try {
      if (isNativePlatform()) {
        const { NativePurchases } = await import('@capgo/native-purchases');
        await NativePurchases.restorePurchases();
        const { purchases } = await NativePurchases.getPurchases({ productType: 'subs' as any });
        const activeSub = purchases.find((p) => p.isActive);

        if (activeSub) {
          saveProfileAndRedirect(true);
          return;
        }

        alert('No previous purchases found.');
      } else {
        alert('Restore is available on the mobile app. On web, your trial is stored locally.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.inner}>
        {/* App Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logoCircle}>
            <ShieldIcon size={40} color="#ffffff" />
          </div>
        </div>

        {/* Welcome Heading */}
        <h1 style={styles.heading}>Welcome to GoutCare</h1>
        <p style={styles.subheading}>
          Your AI-powered companion for managing gout and living pain-free.
        </p>

        {/* Value Props */}
        <div style={styles.valueProps}>
          <div style={styles.valueProp}>
            <div style={styles.valuePropIcon}>
              <ScanIcon size={20} color="#93c5fd" />
            </div>
            <div>
              <p style={styles.valuePropTitle}>AI-Powered Food Scanning</p>
              <p style={styles.valuePropDesc}>Snap a photo to instantly check purine levels</p>
            </div>
          </div>
          <div style={styles.valueProp}>
            <div style={styles.valuePropIcon}>
              <ChartIcon size={20} color="#93c5fd" />
            </div>
            <div>
              <p style={styles.valuePropTitle}>Track Uric Acid Levels</p>
              <p style={styles.valuePropDesc}>Log readings and visualize trends over time</p>
            </div>
          </div>
          <div style={styles.valueProp}>
            <div style={styles.valuePropIcon}>
              <FlameIcon size={20} color="#93c5fd" />
            </div>
            <div>
              <p style={styles.valuePropTitle}>Log & Analyze Flares</p>
              <p style={styles.valuePropDesc}>Track flares to identify triggers and patterns</p>
            </div>
          </div>
          <div style={styles.valueProp}>
            <div style={styles.valuePropIcon}>
              <ForkKnifeIcon size={20} color="#93c5fd" />
            </div>
            <div>
              <p style={styles.valuePropTitle}>Personalized Meal Plans</p>
              <p style={styles.valuePropDesc}>Get AI-powered meal suggestions tailored to you</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={styles.pricingContainer}>
          {/* Monthly Card */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            style={{
              ...styles.pricingCard,
              ...(selectedPlan === 'monthly' ? styles.pricingCardSelected : {}),
            }}
          >
            <p style={styles.planName}>Monthly</p>
            <p style={styles.planPrice}>$4.99</p>
            <p style={styles.planPeriod}>per month</p>
            <p style={styles.trialBadge}>7-day free trial</p>
            {selectedPlan === 'monthly' && (
              <div style={styles.selectedCheck}>
                <CheckIcon size={16} color="#ffffff" />
              </div>
            )}
          </button>

          {/* Annual Card */}
          <button
            onClick={() => setSelectedPlan('annual')}
            style={{
              ...styles.pricingCard,
              ...styles.pricingCardFeatured,
              ...(selectedPlan === 'annual' ? styles.pricingCardSelected : {}),
            }}
          >
            <div style={styles.saveBadge}>Save 50%</div>
            <p style={styles.planName}>Annual</p>
            <p style={styles.planPrice}>$29.99</p>
            <p style={styles.planPeriod}>per year</p>
            <p style={styles.planPriceMonthly}>Just $2.50/month</p>
            <p style={styles.trialBadge}>7-day free trial</p>
            {selectedPlan === 'annual' && (
              <div style={styles.selectedCheck}>
                <CheckIcon size={16} color="#ffffff" />
              </div>
            )}
          </button>
        </div>

        {/* Start Free Trial Button */}
        <button
          onClick={handleStartTrial}
          disabled={loading}
          style={{
            ...styles.trialButton,
            ...(loading ? styles.trialButtonDisabled : {}),
          }}
        >
          <CrownIcon size={20} color="#4338ca" />
          <span>{loading ? 'Starting Trial...' : 'Start Free Trial'}</span>
        </button>

        {/* Restore Purchases */}
        <button
          onClick={handleRestorePurchases}
          disabled={restoring}
          style={styles.restoreLink}
        >
          {restoring ? 'Restoring...' : 'Restore Purchases'}
        </button>

        {/* Cancel anytime notice */}
        <p style={styles.cancelNotice}>
          Cancel anytime. No charge during trial.
        </p>

        {/* Terms and Privacy */}
        <div style={styles.legalLinks}>
          <a href="/terms" style={styles.legalLink}>Terms of Service</a>
          <span style={styles.legalSeparator}>|</span>
          <a href="/privacy" style={styles.legalLink}>Privacy Policy</a>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 40%, #4f46e5 70%, #6366f1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
  },
  inner: {
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: '24px',
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(255, 255, 255, 0.25)',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginBottom: '32px',
    lineHeight: '1.5',
    maxWidth: '340px',
  },
  valueProps: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
  },
  valueProp: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  valuePropIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valuePropTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '2px',
  },
  valuePropDesc: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.4',
  },
  pricingContainer: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginBottom: '24px',
  },
  pricingCard: {
    flex: 1,
    position: 'relative' as const,
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '20px 16px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  pricingCardFeatured: {
    background: 'rgba(255, 255, 255, 0.14)',
    border: '2px solid rgba(255, 255, 255, 0.35)',
  },
  pricingCardSelected: {
    border: '2px solid #ffffff',
    background: 'rgba(255, 255, 255, 0.18)',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
  },
  saveBadge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '12px',
    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
  },
  planName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '4px',
  },
  planPrice: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
  },
  planPeriod: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  planPriceMonthly: {
    fontSize: '12px',
    color: '#93c5fd',
    fontWeight: '600',
    marginTop: '2px',
  },
  trialBadge: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '8px',
    padding: '3px 10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.06)',
  },
  selectedCheck: {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialButton: {
    width: '100%',
    padding: '16px 24px',
    borderRadius: '14px',
    background: '#ffffff',
    color: '#4338ca',
    fontSize: '17px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    marginBottom: '16px',
  },
  trialButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  restoreLink: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
    marginBottom: '12px',
  },
  cancelNotice: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginBottom: '24px',
  },
  legalLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legalLink: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.35)',
    textDecoration: 'underline',
  },
  legalSeparator: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.2)',
  },
};
