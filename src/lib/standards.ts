/**
 * Australian standard drink calculations.
 *
 * A standard drink contains 10g of pure alcohol. Pure alcohol has a density
 * of ~0.789 g/mL, so:
 *
 *   standard drinks = volume(L) x %ABV x 0.789
 *
 * e.g. a 375mL can of 4.8% beer: 0.375 x 4.8 x 0.789 ≈ 1.4 standard drinks,
 * matching the figure printed on Australian packaging.
 */
const ETHANOL_DENSITY = 0.789;

export function calcStandards(volumeMl: number, abvPercent: number): number {
  if (!Number.isFinite(volumeMl) || !Number.isFinite(abvPercent)) return 0;
  if (volumeMl <= 0 || abvPercent <= 0) return 0;
  return (volumeMl / 1000) * abvPercent * ETHANOL_DENSITY;
}

/** Round to 1 decimal place for display (and for storage, so totals stay tidy). */
export function roundStandards(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatStandards(value: number): string {
  return roundStandards(value).toFixed(1);
}
