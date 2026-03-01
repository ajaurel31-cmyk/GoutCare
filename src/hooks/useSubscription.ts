'use client';

import { useState, useEffect } from 'react';

interface UseSubscriptionReturn {
  isSubscribed: boolean;
  isPremium: boolean;
  isTrial: boolean;
  trialDaysRemaining: number;
  plan: 'free' | 'monthly' | 'annual' | 'trial';
  loading: boolean;
}

function getSubscriptionFromStorage(): {
  isSubscribed: boolean;
  isTrial: boolean;
  trialDaysRemaining: number;
  plan: 'free' | 'monthly' | 'annual' | 'trial';
} {
  if (typeof window === 'undefined') {
    return { isSubscribed: false, isTrial: false, trialDaysRemaining: 0, plan: 'free' };
  }

  try {
    const subStr = localStorage.getItem('goutcare_subscription');
    if (!subStr) return { isSubscribed: false, isTrial: false, trialDaysRemaining: 0, plan: 'free' };

    const sub = JSON.parse(subStr);

    if (!sub.isActive) return { isSubscribed: false, isTrial: false, trialDaysRemaining: 0, plan: 'free' };

    // Check if subscription has expired
    if (sub.expiresAt) {
      const expiresAt = new Date(sub.expiresAt);
      if (expiresAt < new Date()) {
        return { isSubscribed: false, isTrial: false, trialDaysRemaining: 0, plan: 'free' };
      }

      // Calculate days remaining for trial
      if (sub.isTrial) {
        const diffMs = expiresAt.getTime() - Date.now();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        return { isSubscribed: true, isTrial: true, trialDaysRemaining: daysRemaining, plan: 'trial' };
      }
    }

    // Active paid subscription
    const plan = sub.plan === 'monthly' || sub.plan === 'annual' ? sub.plan : 'monthly';
    return { isSubscribed: true, isTrial: sub.isTrial ?? false, trialDaysRemaining: 0, plan };
  } catch {
    return { isSubscribed: false, isTrial: false, trialDaysRemaining: 0, plan: 'free' };
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

  const refresh = () => {
    const sub = getSubscriptionFromStorage();
    setState({
      isSubscribed: sub.isSubscribed,
      isPremium: sub.isSubscribed,
      isTrial: sub.isTrial,
      trialDaysRemaining: sub.trialDaysRemaining,
      plan: sub.plan,
      loading: false,
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  // Listen for storage changes (e.g., subscription purchased in another tab)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'goutcare_subscription') {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return state;
}
