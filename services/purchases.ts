import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, type PurchasesOffering, type PurchasesPackage } from "react-native-purchases";

// RevenueCat is the sole source of truth for entitlement — see
// purchaseStore.ts for why "unlocked" is never persisted locally. These are
// RevenueCat's public SDK keys (safe to ship in client code, not secrets);
// fill in after creating the project in the RevenueCat dashboard.
const REVENUECAT_API_KEY_IOS = "appl_gnHqCARuPzFwqWwXdqQqFCmfdFB";
const REVENUECAT_API_KEY_ANDROID = "";
const ENTITLEMENT_ID = "Serve Goat Pro";

export function configurePurchases() {
  const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey });
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchaseUnlock(pkg: PurchasesPackage): Promise<{ unlocked: boolean; userCancelled: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { unlocked: !!customerInfo.entitlements.active[ENTITLEMENT_ID], userCancelled: false };
  } catch (err: any) {
    if (err?.userCancelled) return { unlocked: false, userCancelled: true };
    throw err;
  }
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
}

// Fails closed: any error here (not-yet-configured, network hiccup) reports
// locked rather than risk silently bypassing the paywall.
export async function isUnlocked(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  } catch {
    return false;
  }
}
