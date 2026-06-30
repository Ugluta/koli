/**
 * How a membership purchase is billed.
 * - MONTHLY  : recurring monthly price, ~30 day period
 * - YEARLY   : recurring yearly price, ~365 day period (discounted vs monthly)
 * - ONE_TIME : single lifetime payment, no expiry
 */
export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ONE_TIME = 'one_time',
}

/** Period length in days for a cycle, or null for lifetime (no expiry). */
export const BILLING_CYCLE_DAYS: Record<BillingCycle, number | null> = {
  [BillingCycle.MONTHLY]: 30,
  [BillingCycle.YEARLY]: 365,
  [BillingCycle.ONE_TIME]: null,
};
