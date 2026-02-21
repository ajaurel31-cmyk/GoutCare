'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CrownIcon from '@/components/icons/CrownIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import ShieldIcon from '@/components/icons/ShieldIcon';

type PlanType = 'monthly' | 'annual';

interface UserProfile {
  onboardingComplete?: boolean;
  trialStartDate?: string;
  subscriptionPlan?: string;
  subscriptionActive?: boolean;
}

interface FeatureRow {
  name: string;
  free: string;
  premium: string;
}

const features: FeatureRow[] = [
  { name: 'Food search', free: 'Basic', premium: 'Full 530+ database' },
  { name: 'AI scans', free: '3/day', premium: 'Unlimited' },
  { name: 'Uric acid tracking', free: 'Manual logging', premium: 'Trends & analytics' },
  { name: 'Flare logging', free: 'Basic', premium: 'Calendar + analytics' },
  { name: 'Meal suggestions', free: 'No', premium: 'AI-powered' },
  { name: 'PDF reports', free: 'No', premium: 'Yes' },
  { name: 'Water tracking', free: 'Yes', premium: 'Yes' },
];

function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

function isTrialActive(trialStartDate: string | undefined): boolean {
  if (!trialStartDate) return false;
  const start = new Date(trialStartDate);
  const now = new Date();
  const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setMounted(true);

    try {
      const stored = localStorage.getItem('goutcare_profile');
      if (stored) {
        const profile: UserProfile = JSON.parse(stored);
        setCurrentProfile(profile);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const getCurrentPlanDisplay = (): string | null => {
    if (!currentProfile) return null;
    if (currentProfile.subscriptionActive && currentProfile.subscriptionPlan) {
      return currentProfile.subscriptionPlan === 'annual'
        ? 'Annual Premium'
        : 'Monthly Premium';
    }
    if (isTrialActive(currentProfile.trialStartDate)) {
      return 'Free Trial (active)';
    }
    if (currentProfile.trialStartDate && !isTrialActive(currentProfile.trialStartDate)) {
      return 'Trial Expired';
    }
    return 'Free Plan';
  };

  const handlePurchase = async () => {
    setLoading(true);

    try {
      if (isNativePlatform()) {
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
            saveSubscription();
            alert('Premium unlocked! Enjoy all features.');
            router.back();
            return;
          }

          alert('Purchase could not be completed. Please try again.');
        } catch (nativeError: any) {
          if (nativeError?.code === 'USER_CANCELLED' || nativeError?.code === '1') {
            // User cancelled, do nothing
          } else {
            console.error('Purchase error:', nativeError);
            alert('Purchase failed. Please try again later.');
          }
        }
      } else {
        // Web fallback: show app store message
        alert(
          'To subscribe, please download GoutCare from the App Store or Google Play. On web, you can start a 7-day free trial from the onboarding screen.'
        );
      }
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSubscription = () => {
    try {
      const existing = localStorage.getItem('goutcare_profile');
      const profile: UserProfile = existing ? JSON.parse(existing) : {};

      profile.subscriptionPlan = selectedPlan;
      profile.subscriptionActive = true;
      profile.onboardingComplete = true;

      localStorage.setItem('goutcare_profile', JSON.stringify(profile));
      setCurrentProfile(profile);
    } catch {
      // Ignore storage errors
    }
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
          saveSubscription();
          alert('Purchases restored successfully!');
          router.back();
          return;
        }

        alert('No previous purchases found.');
      } else {
        alert('Restore is available on the mobile app.');
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

  const currentPlan = getCurrentPlanDisplay();
  const isSubscribed = currentProfile?.subscriptionActive === true;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => router.back()} style={styles.backButton}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      <div style={styles.inner}>
        {/* Crown Icon + Heading */}
        <div style={styles.crownContainer}>
          <div style={styles.crownCircle}>
            <CrownIcon size={36} color="#f59e0b" />
          </div>
        </div>

        <h1 style={styles.heading}>Unlock Premium</h1>
        <p style={styles.subheading}>
          Get unlimited access to all GoutCare features and take full control of your gout management.
        </p>

        {/* Current Plan Display */}
        {currentPlan && (
          <div style={styles.currentPlanBadge}>
            <ShieldIcon size={14} color={isSubscribed ? '#22c55e' : '#f59e0b'} />
            <span>Current plan: {currentPlan}</span>
          </div>
        )}

        {/* Feature Comparison Table */}
        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <div style={{ ...styles.tableCell, ...styles.featureNameCell }}>Feature</div>
            <div style={{ ...styles.tableCell, ...styles.tableCellCenter }}>Free</div>
            <div
              style={{
                ...styles.tableCell,
                ...styles.tableCellCenter,
                ...styles.premiumHeader,
              }}
            >
              Premium
            </div>
          </div>
          {features.map((feature, index) => (
            <div
              key={feature.name}
              style={{
                ...styles.tableRow,
                ...(index % 2 === 0 ? styles.tableRowEven : {}),
              }}
            >
              <div style={{ ...styles.tableCell, ...styles.featureNameCell }}>
                {feature.name}
              </div>
              <div style={{ ...styles.tableCell, ...styles.tableCellCenter, ...styles.freeValue }}>
                {feature.free === 'No' ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : feature.free === 'Yes' ? (
                  <CheckIcon size={16} color="#22c55e" />
                ) : (
                  feature.free
                )}
              </div>
              <div
                style={{
                  ...styles.tableCell,
                  ...styles.tableCellCenter,
                  ...styles.premiumValue,
                }}
              >
                {feature.premium === 'Yes' ? (
                  <CheckIcon size={16} color="#22c55e" />
                ) : (
                  feature.premium
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        {!isSubscribed && (
          <>
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
                {selectedPlan === 'monthly' && (
                  <div style={styles.selectedIndicator} />
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
                <p style={styles.planPriceMonthly}>$2.50/month</p>
                {selectedPlan === 'annual' && (
                  <div style={styles.selectedIndicator} />
                )}
              </button>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={loading}
              style={{
                ...styles.purchaseButton,
                ...(loading ? styles.purchaseButtonDisabled : {}),
              }}
            >
              <CrownIcon size={20} color="#ffffff" />
              <span>
                {loading
                  ? 'Processing...'
                  : isNativePlatform()
                    ? 'Subscribe Now'
                    : 'Download App to Subscribe'}
              </span>
            </button>

            {/* Restore Purchases */}
            <button
              onClick={handleRestorePurchases}
              disabled={restoring}
              style={styles.restoreLink}
            >
              {restoring ? 'Restoring...' : 'Restore Purchases'}
            </button>

            <p style={styles.cancelNotice}>
              Cancel anytime. No charge during trial period.
            </p>
          </>
        )}

        {isSubscribed && (
          <div style={styles.subscribedMessage}>
            <CheckIcon size={24} color="#22c55e" />
            <p style={styles.subscribedText}>
              You are subscribed to {currentProfile?.subscriptionPlan === 'annual' ? 'Annual' : 'Monthly'} Premium.
              Thank you for your support!
            </p>
          </div>
        )}

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
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
    paddingBottom: '40px',
  },
  header: {
    padding: '16px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#93c5fd',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '4px 0',
  },
  inner: {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  crownContainer: {
    marginBottom: '16px',
    marginTop: '8px',
  },
  crownCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.2))',
    border: '2px solid rgba(245, 158, 11, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: '1.5',
    marginBottom: '20px',
    maxWidth: '360px',
  },
  currentPlanBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '13px',
    marginBottom: '24px',
  },
  tableContainer: {
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '28px',
  },
  tableHeader: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '10px 0',
  },
  tableRow: {
    display: 'flex',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  tableRowEven: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableCell: {
    flex: 1,
    padding: '0 12px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
  },
  featureNameCell: {
    flex: 1.3,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tableCellCenter: {
    justifyContent: 'center',
    textAlign: 'center',
  },
  premiumHeader: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  freeValue: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
  },
  premiumValue: {
    color: '#93c5fd',
    fontSize: '12px',
    fontWeight: '500',
  },
  pricingContainer: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginBottom: '20px',
  },
  pricingCard: {
    flex: 1,
    position: 'relative' as const,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    padding: '18px 14px',
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  pricingCardFeatured: {
    background: 'rgba(245, 158, 11, 0.08)',
    border: '2px solid rgba(245, 158, 11, 0.3)',
  },
  pricingCardSelected: {
    border: '2px solid #f59e0b',
    background: 'rgba(245, 158, 11, 0.12)',
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)',
  },
  saveBadge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '10px',
    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  planName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '4px',
  },
  planPrice: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#ffffff',
  },
  planPeriod: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  planPriceMonthly: {
    fontSize: '12px',
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: '4px',
  },
  selectedIndicator: {
    position: 'absolute' as const,
    top: '8px',
    left: '8px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#f59e0b',
  },
  purchaseButton: {
    width: '100%',
    padding: '16px 24px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
    marginBottom: '14px',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  restoreLink: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px',
    textDecoration: 'underline',
    marginBottom: '10px',
  },
  cancelNotice: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    marginBottom: '24px',
  },
  subscribedMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    borderRadius: '16px',
    background: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    marginBottom: '24px',
    width: '100%',
  },
  subscribedText: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  legalLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  legalLink: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.25)',
    textDecoration: 'underline',
  },
  legalSeparator: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.15)',
  },
};
