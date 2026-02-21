import { SubscriptionStatus } from './types';
import { PRODUCT_IDS, TRIAL_DAYS } from './constants';
import { isNative } from './platform';
import {
  getSubscriptionStatus,
  setSubscriptionStatus,
  getUserProfile,
  updateUserProfile,
} from './storage';
import { getDaysSince, getToday } from './utils';

// ─── Initialize Purchases ───────────────────────────────────────────────────

/**
 * Initialize the native purchases SDK.
 * On web, this is a no-op.
 */
export async function initializePurchases(): Promise<void> {
  if (!isNative()) return;

  try {
    // @capgo/native-purchases is auto-registered as a Capacitor plugin
    // No configure() step needed — it uses the native StoreKit/Play config
    await import('@capgo/native-purchases');
  } catch (error) {
    console.error('Failed to initialize purchases:', error);
  }
}

// ─── Get Products ───────────────────────────────────────────────────────────

/**
 * Fetch available subscription products.
 * On web, returns an empty array.
 */
export async function getProducts(): Promise<any[]> {
  if (!isNative()) return [];

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [PRODUCT_IDS.monthly, PRODUCT_IDS.annual],
      productType: 'subs' as any,
    });
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

// ─── Purchase Product ───────────────────────────────────────────────────────

/**
 * Initiate a purchase for a given product ID.
 * On web, shows a message to download from the App Store.
 */
export async function purchaseProduct(productId: string): Promise<boolean> {
  if (!isNative()) {
    alert(
      'Subscriptions are only available in the GoutCare iOS app. Please download from the App Store to subscribe.'
    );
    return false;
  }

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: productId,
      productType: 'subs' as any,
    });

    if (transaction) {
      const isMonthly = productId === PRODUCT_IDS.monthly;
      const plan = isMonthly ? 'monthly' : 'annual';

      setSubscriptionStatus({
        isActive: true,
        plan,
        expiresAt: transaction.expirationDate ?? null,
        isTrial: transaction.isTrialPeriod ?? false,
      });
      return true;
    }

    return false;
  } catch (error: any) {
    if (error?.code === 'PURCHASE_CANCELLED') {
      return false;
    }
    console.error('Purchase failed:', error);
    return false;
  }
}

// ─── Restore Purchases ─────────────────────────────────────────────────────

/**
 * Restore previous purchases.
 * On web, this is a no-op that returns false.
 */
export async function restorePurchases(): Promise<boolean> {
  if (!isNative()) {
    alert(
      'Purchase restoration is only available in the GoutCare iOS app. Please download from the App Store.'
    );
    return false;
  }

  try {
    const { NativePurchases } = await import('@capgo/native-purchases');
    await NativePurchases.restorePurchases();

    // Check purchases after restore
    const { purchases } = await NativePurchases.getPurchases({
      productType: 'subs' as any,
    });

    const activeSub = purchases.find((p) => p.isActive);
    if (activeSub) {
      const plan = activeSub.productIdentifier === PRODUCT_IDS.annual ? 'annual' : 'monthly';
      setSubscriptionStatus({
        isActive: true,
        plan,
        expiresAt: activeSub.expirationDate ?? null,
        isTrial: activeSub.isTrialPeriod ?? false,
      });
      return true;
    }

    setSubscriptionStatus({
      isActive: false,
      plan: 'free',
      expiresAt: null,
      isTrial: false,
    });
    return false;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return false;
  }
}

// ─── Check Subscription Status ──────────────────────────────────────────────

/**
 * Check the current subscription status.
 * Uses localStorage cache and native SDK status when available.
 */
export async function checkSubscriptionStatus(): Promise<SubscriptionStatus> {
  const cached = getSubscriptionStatus();

  if (isNative()) {
    try {
      const { NativePurchases } = await import('@capgo/native-purchases');
      const { purchases } = await NativePurchases.getPurchases({
        productType: 'subs' as any,
      });

      const activeSub = purchases.find((p) => p.isActive);
      if (activeSub) {
        const plan = activeSub.productIdentifier === PRODUCT_IDS.annual ? 'annual' : 'monthly';
        const status: SubscriptionStatus = {
          isActive: true,
          plan,
          expiresAt: activeSub.expirationDate ?? null,
          isTrial: activeSub.isTrialPeriod ?? false,
        };
        setSubscriptionStatus(status);
        return status;
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  }

  if (isTrialActive()) {
    const trialStatus: SubscriptionStatus = {
      isActive: true,
      plan: 'trial',
      expiresAt: null,
      isTrial: true,
    };
    setSubscriptionStatus(trialStatus);
    return trialStatus;
  }

  if (cached.isActive && cached.expiresAt) {
    const expiryDate = new Date(cached.expiresAt);
    if (expiryDate < new Date()) {
      const expired: SubscriptionStatus = {
        isActive: false,
        plan: 'free',
        expiresAt: null,
        isTrial: false,
      };
      setSubscriptionStatus(expired);
      return expired;
    }
  }

  return cached;
}

// ─── Trial Management ───────────────────────────────────────────────────────

export function isTrialActive(): boolean {
  const profile = getUserProfile();
  if (!profile.trialStartDate) return false;
  const daysSinceTrialStart = getDaysSince(profile.trialStartDate);
  return daysSinceTrialStart < TRIAL_DAYS && daysSinceTrialStart >= 0;
}

export function isSubscribed(): boolean {
  if (isTrialActive()) return true;
  const status = getSubscriptionStatus();
  if (!status.isActive) return false;
  if (status.expiresAt) {
    const expiryDate = new Date(status.expiresAt);
    if (expiryDate < new Date()) return false;
  }
  return true;
}

export function startTrial(): void {
  updateUserProfile({ trialStartDate: getToday() });
  setSubscriptionStatus({
    isActive: true,
    plan: 'trial',
    expiresAt: null,
    isTrial: true,
  });
}

export function getTrialDaysRemaining(): number {
  const profile = getUserProfile();
  if (!profile.trialStartDate) return 0;
  const daysSinceTrialStart = getDaysSince(profile.trialStartDate);
  const remaining = TRIAL_DAYS - daysSinceTrialStart;
  return Math.max(0, remaining);
}
