'use client';

import { useState, useEffect } from 'react';
import { TRIAL_DAYS } from '@/lib/constants';

interface UseSubscriptionReturn {
  isSubscribed: boolean;
  isPremium: boolean;
  isTrial: boolean;
  trialDaysRemaining: number;
  plan: 'free' | 'monthly' | 'annual' | 'trial';
  loading: boolean;
}

function getTrialInfo(): { isTrial: boolean; daysRemaining: number } {
  if (typeof window === 'undefined') {
    return { isTrial: false, daysRemaining: 0 };
  }

  try {
    const profileStr = localStorage.getItem('goutcare_profile');
    if (!profileStr) return { isTrial: false, daysRemaining: 0 };

    const profile = JSON.parse(profileStr);
    const trialStartDate = profile.trialStartDate;

    if (!trialStartDate) return { isTrial: false, daysRemaining: 0 };

    const start = new Date(trialStartDate + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const elapsedMs = now.getTime() - start.getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, TRIAL_DAYS - elapsedDays);

    return {
      isTrial: daysRemaining > 0,
      daysRemaining,
    };
  } catch {
    return { isTrial: false, daysRemaining: 0 };
  }
}

function getSubscriptionStatus(): { isSubscribed: boolean; plan: 'free' | 'monthly' | 'annual' | 'trial' } {
  if (typeof window === 'undefined') {
    return { isSubscribed: false, plan: 'free' };
  }

  try {
    const subStr = localStorage.getItem('goutcare_subscription');
    if (!subStr) return { isSubscribed: false, plan: 'free' };

    const sub = JSON.parse(subStr);

    if (!sub.isActive) return { isSubscribed: false, plan: 'free' };

    // Check if subscription has expired
    if (sub.expiresAt) {
      const expiresAt = new Date(sub.expiresAt);
      if (expiresAt < new Date()) {
        return { isSubscribed: false, plan: 'free' };
      }
    }

    const plan = sub.plan === 'monthly' || sub.plan === 'annual' ? sub.plan : 'monthly';
    return { isSubscribed: true, plan };
  } catch {
    return { isSubscribed: false, plan: 'free' };
  }
}

export function useSubscription(): UseSubscriptionReturn {
  const [state, setState] = useState<UseSubscriptionReturn>({
    isSubscribed: false,
    isPremium: false,
    isTrial: false,
    trialDaysRemaining: 0,
    plan: 'free',
    loading: true,
  });

  useEffect(() => {
    const trialInfo = getTrialInfo();
    const subStatus = getSubscriptionStatus();

    const isTrial = !subStatus.isSubscribed && trialInfo.isTrial;
    const isPremium = subStatus.isSubscribed || trialInfo.isTrial;

    let plan: 'free' | 'monthly' | 'annual' | 'trial';
    if (subStatus.isSubscribed) {
      plan = subStatus.plan;
    } else if (isTrial) {
      plan = 'trial';
    } else {
      plan = 'free';
    }

    setState({
      isSubscribed: subStatus.isSubscribed,
      isPremium,
      isTrial,
      trialDaysRemaining: trialInfo.daysRemaining,
      plan,
      loading: false,
    });
  }, []);

  // Listen for storage changes (e.g., subscription purchased in another tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'goutcare_subscription' || e.key === 'goutcare_profile') {
        const trialInfo = getTrialInfo();
        const subStatus = getSubscriptionStatus();

        const isTrial = !subStatus.isSubscribed && trialInfo.isTrial;
        const isPremium = subStatus.isSubscribed || trialInfo.isTrial;

        let plan: 'free' | 'monthly' | 'annual' | 'trial';
        if (subStatus.isSubscribed) {
          plan = subStatus.plan;
        } else if (isTrial) {
          plan = 'trial';
        } else {
          plan = 'free';
        }

        setState({
          isSubscribed: subStatus.isSubscribed,
          isPremium,
          isTrial,
          trialDaysRemaining: trialInfo.daysRemaining,
          plan,
          loading: false,
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return state;
}
