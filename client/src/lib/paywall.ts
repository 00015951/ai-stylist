/**
 * Paywall utility – client-side trial & PRO state (localStorage).
 * Use alongside server subscription for instant UX and offline-first mini-app support.
 */

const KEY_FREE_TRIAL_USED = "free_trial_used";
const KEY_IS_PRO = "is_pro";

/** Check if user has used their single free trial */
export function checkTrial(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_FREE_TRIAL_USED) === "true";
}

/** Check if user has PRO (localStorage) */
export function isPro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_IS_PRO) === "true";
}

/** Mark free trial as used (call after first successful generation) */
export function markTrialUsed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_FREE_TRIAL_USED, "true");
}

/** Grant PRO status (call after successful payment) */
export function unlockPro(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_IS_PRO, "true");
}

/** Whether user can generate (no paywall) – PRO or first free use */
export function canGenerate(): boolean {
  if (isPro()) return true;
  return !checkTrial();
}

/** Show paywall? – trial used and not PRO */
export function shouldShowPaywall(): boolean {
  return checkTrial() && !isPro();
}
