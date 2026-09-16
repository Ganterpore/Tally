import type { DrinkEntry } from '../types';
import { dayKey } from './dates';

export function groupByDay(drinks: DrinkEntry[]): Map<string, DrinkEntry[]> {
  const map = new Map<string, DrinkEntry[]>();
  for (const d of drinks) {
    const key = dayKey(d.timestamp);
    const arr = map.get(key);
    if (arr) arr.push(d);
    else map.set(key, [d]);
  }
  return map;
}

export function sumStandards(drinks: DrinkEntry[]): number {
  return drinks.reduce((sum, d) => sum + d.standards, 0);
}

export function countDrinkingDays(drinks: DrinkEntry[]): number {
  return groupByDay(drinks).size;
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Average standard drinks per week across the app's whole lifetime, from `floor` (when tracking
 * started) through `now`. Elapsed time is floored at a day so a fresh install doesn't produce a
 * wildly inflated rate off just a few hours of data. Returns null when there's no floor yet (no
 * settings/drinks at all), matching how the rest of the lifetime stats report "nothing yet".
 */
export function averageStandardsPerWeek(drinks: DrinkEntry[], floor: Date | null, now: Date): number | null {
  if (!floor) return null;
  const msElapsed = Math.max(now.getTime() - floor.getTime(), 24 * 60 * 60 * 1000);
  return sumStandards(drinks) / (msElapsed / MS_PER_WEEK);
}

export type LimitLevel = 'ok' | 'warning' | 'over';

/**
 * ok < 80% of limit, warning 80-100% (inclusive — landing exactly on the limit is a caution, not
 * a breach), over only once strictly past it. A zero/undefined limit is always "ok".
 */
export function levelFor(value: number, limit: number): LimitLevel {
  if (!limit || limit <= 0) return 'ok';
  const ratio = value / limit;
  if (ratio > 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}
