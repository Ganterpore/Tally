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

export type LimitLevel = 'ok' | 'warning' | 'over';

/** ok < 80% of limit, warning 80-100%, over 100%+. A zero/undefined limit is always "ok". */
export function levelFor(value: number, limit: number): LimitLevel {
  if (!limit || limit <= 0) return 'ok';
  const ratio = value / limit;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}
