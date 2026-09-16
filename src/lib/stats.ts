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

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

/**
 * Average standard drinks per `periodMs` across the app's whole lifetime, from `floor` (when
 * tracking started) through `now`. Elapsed time is floored at a day so a fresh install doesn't
 * produce a wildly inflated rate off just a few hours of data. Returns null when there's no floor
 * yet (no settings/drinks at all), matching how the rest of the lifetime stats report "nothing
 * yet".
 */
function averageStandardsPerPeriod(
  drinks: DrinkEntry[],
  floor: Date | null,
  now: Date,
  periodMs: number,
): number | null {
  if (!floor) return null;
  const msElapsed = Math.max(now.getTime() - floor.getTime(), MS_PER_DAY);
  return sumStandards(drinks) / (msElapsed / periodMs);
}

export function averageStandardsPerWeek(drinks: DrinkEntry[], floor: Date | null, now: Date): number | null {
  return averageStandardsPerPeriod(drinks, floor, now, MS_PER_WEEK);
}

export function averageStandardsPerDay(drinks: DrinkEntry[], floor: Date | null, now: Date): number | null {
  return averageStandardsPerPeriod(drinks, floor, now, MS_PER_DAY);
}

/**
 * Average standard drinks on days that had any — i.e. excluding dry days, unlike
 * averageStandardsPerDay. Returns null until there's at least one drinking day to average.
 */
export function averageStandardsPerDrinkingDay(drinks: DrinkEntry[]): number | null {
  const drinkingDays = countDrinkingDays(drinks);
  if (drinkingDays === 0) return null;
  return sumStandards(drinks) / drinkingDays;
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
