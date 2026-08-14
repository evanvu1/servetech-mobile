import { File, Paths } from "expo-file-system";
import type { PurchaseState } from "@/types/purchases";

// Local-only free-serve counter, same pattern as userStore/historyStore: a
// single JSON file under the document directory. Entitlement itself is never
// stored here — RevenueCat's CustomerInfo is the sole source of truth for
// "unlocked" (see services/purchases.ts) so this file can never drift out of
// sync with a refund or a restore on a new device.
export const FREE_SERVE_LIMIT = 5;

const purchasesFile = new File(Paths.document, "purchases.json");

export async function getPurchaseState(): Promise<PurchaseState> {
  if (!purchasesFile.exists) return { freeServesUsed: 0 };
  try {
    return JSON.parse(await purchasesFile.text()) as PurchaseState;
  } catch {
    return { freeServesUsed: 0 };
  }
}

export function savePurchaseState(state: PurchaseState) {
  purchasesFile.write(JSON.stringify(state));
}

export async function incrementFreeServesUsed(): Promise<number> {
  const state = await getPurchaseState();
  const next = { freeServesUsed: state.freeServesUsed + 1 };
  savePurchaseState(next);
  return next.freeServesUsed;
}
