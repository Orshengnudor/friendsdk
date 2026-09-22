/** Official Generations ladder + Hunt xRF coupons.
 *  Numbers from https://rarefriends.com/docs/generations
 *
 *  xRF is a coupon, never cash. 40% off tier upgrades only.
 *  Promote is always full RF. Skip world = 1000 RF burn per world jumped.
 */

export const XRF_PER_HUNT = 5;
export const UPGRADE_DISCOUNT = 0.4;
export const SKIP_RF_PER_WORLD = 1000;
export const TIMER_FAIL_GROWTH = 5;

/** xRF from a finished hunt on this world. L1 = 5, L2 = 10, … L30 = 150. */
export function xrfForHunt(level: number): number {
  return XRF_PER_HUNT * Math.max(1, Math.min(30, Math.round(level)));
}
export const MAX_TIER = 4;
export const MAX_GEN = 6;
export const MIN_GEN = 1;

export const HARDWIRE_RF: Record<number, number> = {
  1: 100_000,
  2: 10_000,
  3: 1_000,
  4: 100,
  5: 10,
  6: 1,
};

/** Pay to move gen → gen-1. Tier resets to 0. No xRF coupon. */
export const PROMOTE_RF: Record<number, number> = {
  6: 9,
  5: 90,
  4: 900,
  3: 9_000,
  2: 90_000,
};

/** List price for 0→1, 1→2, 2→3, 3→4 inside that generation. */
export const UPGRADE_RF: Record<number, readonly [number, number, number, number]> = {
  1: [50_000, 75_000, 112_500, 168_750],
  2: [5_000, 7_500, 11_250, 16_875],
  3: [500, 750, 1_125, 1_687.5],
  4: [50, 75, 112.5, 168.75],
  5: [5, 7.5, 11.25, 16.875],
  6: [0.5, 0.75, 1.125, 1.6875],
};

export function upgradeListPrice(gen: number, tier: number): number | null {
  if (tier < 0 || tier >= MAX_TIER) return null;
  return UPGRADE_RF[gen]?.[tier] ?? null;
}

export function promoteListPrice(gen: number): number | null {
  if (gen <= MIN_GEN) return null;
  return PROMOTE_RF[gen] ?? null;
}

export function xrfNeeded(listPrice: number): number {
  return listPrice;
}

export function upgradePayRf(listPrice: number): number {
  return roundRf(listPrice * (1 - UPGRADE_DISCOUNT));
}

export function canCoupon(xrf: number, listPrice: number): boolean {
  return xrf + 1e-9 >= listPrice;
}

export function huntsToFill(listPrice: number): number {
  return Math.max(1, Math.ceil(listPrice / XRF_PER_HUNT - 1e-9));
}

export function huntRfToFill(listPrice: number): number {
  return huntsToFill(listPrice);
}

export function pocketTotal(listPrice: number): number {
  return roundRf(huntRfToFill(listPrice) + upgradePayRf(listPrice));
}

export function pocketSaved(listPrice: number): number {
  return roundRf(listPrice - pocketTotal(listPrice));
}

export function skipCost(fromLevel: number, toLevel: number): number {
  const delta = toLevel - fromLevel;
  return delta > 0 ? delta * SKIP_RF_PER_WORLD : 0;
}

export function roundRf(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

export function formatRfAmount(value: number): string {
  const n = roundRf(value);
  if (Math.abs(n - Math.round(n)) < 1e-9) return Math.round(n).toLocaleString("en-US");
  return n.toLocaleString("en-US", { maximumFractionDigits: 4, minimumFractionDigits: 0 });
}

export function genLabel(gen: number, tier: number): string {
  return `Gen ${gen} · T${tier}`;
}

export function allUpgradeSum(gen: number): number {
  const row = UPGRADE_RF[gen];
  if (!row) return 0;
  return row.reduce((sum, value) => sum + value, 0);
}

export function maxPathRf(): number {
  let total = HARDWIRE_RF[6] ?? 1;
  for (let gen = 6; gen >= 1; gen--) {
    total += allUpgradeSum(gen);
    if (gen > 1) total += PROMOTE_RF[gen] ?? 0;
  }
  return total;
}
