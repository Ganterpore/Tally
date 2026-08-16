import { startOfDay, subDays } from 'date-fns';
import type { DrinkEntry } from '../types';
import { dayKey } from './dates';
import { groupByDay, sumStandards } from './stats';

/** dayKey ('yyyy-MM-dd') -> total standard drinks consumed that calendar day. */
export function dailyTotalsMap(drinks: DrinkEntry[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const [key, dayDrinks] of groupByDay(drinks)) {
    totals.set(key, sumStandards(dayDrinks));
  }
  return totals;
}

function trailingTotal(totals: Map<string, number>, dayEnd: Date, windowDays: number): number {
  let sum = 0;
  for (let i = 0; i < windowDays; i++) {
    sum += totals.get(dayKey(subDays(dayEnd, i).getTime())) ?? 0;
  }
  return sum;
}

function trailingDrinkingDays(totals: Map<string, number>, dayEnd: Date, windowDays: number): number {
  let count = 0;
  for (let i = 0; i < windowDays; i++) {
    if ((totals.get(dayKey(subDays(dayEnd, i).getTime())) ?? 0) > 0) count++;
  }
  return count;
}

export interface StreakContext {
  /** dayKey -> total standards, from dailyTotalsMap(). */
  totals: Map<string, number>;
  today: Date;
  /** The earliest day we actually have any tracking data for — the streak can't extend before this. */
  floor: Date | null;
}

/**
 * Walks backward from today one calendar day at a time, counting how many consecutive days
 * stayed at or under `limit`. Stops at the first breach, or at `floor` (we have no idea what
 * happened before tracking started, so those days aren't credited). A limit of 0/undefined is
 * treated the same way it is everywhere else in the app — "not set" — so it never produces a
 * streak.
 *
 * `today` is checked against `todayValue`, not `metricFor` — the on-screen bars use an exact
 * rolling window ending *now* (e.g. "the last 7×24 hours"), which can touch one more calendar day
 * than `metricFor`'s calendar-aligned window does for fully-elapsed past days. Reusing the same
 * rolling value the bar shows keeps "today" in the streak consistent with whether the bar is
 * currently rendered as over the limit — otherwise a bar could read "over" while its streak badge
 * still counted today as a good day.
 */
function computeStreak(
  limit: number,
  floor: Date | null,
  today: Date,
  todayValue: number,
  metricFor: (dayEnd: Date) => number,
): number {
  if (!floor || !Number.isFinite(limit) || limit <= 0) return 0;
  if (todayValue > limit) return 0;

  const floorStart = startOfDay(floor).getTime();
  let day = subDays(startOfDay(today), 1);
  let streak = 1; // today already passed the check above
  while (day.getTime() >= floorStart) {
    if (metricFor(day) > limit) break;
    streak++;
    day = subDays(day, 1);
  }
  return streak;
}

export function dailyStandardsStreak(
  { totals, today, floor }: StreakContext,
  limit: number,
  todayValue: number,
): number {
  return computeStreak(limit, floor, today, todayValue, (day) => totals.get(dayKey(day.getTime())) ?? 0);
}

export function weeklyStandardsStreak(
  { totals, today, floor }: StreakContext,
  limit: number,
  todayValue: number,
): number {
  return computeStreak(limit, floor, today, todayValue, (day) => trailingTotal(totals, day, 7));
}

export function weeklyDrinkingDaysStreak(
  { totals, today, floor }: StreakContext,
  limit: number,
  todayValue: number,
): number {
  return computeStreak(limit, floor, today, todayValue, (day) => trailingDrinkingDays(totals, day, 7));
}

export function monthlyDrinkingDaysStreak(
  { totals, today, floor }: StreakContext,
  limit: number,
  todayValue: number,
): number {
  return computeStreak(limit, floor, today, todayValue, (day) => trailingDrinkingDays(totals, day, 30));
}
