import { subDays } from 'date-fns';
import { describe, expect, it } from 'vitest';
import type { DrinkEntry } from '../types';
import { dayKey } from './dates';
import {
  dailyStandardsStreak,
  dailyTotalsMap,
  monthlyDrinkingDaysStreak,
  weeklyDrinkingDaysStreak,
  weeklyStandardsStreak,
  type StreakContext,
} from './streaks';

// Deliberately mid-afternoon, not midnight — the whole point of the streak fix below is that
// "today" is a partial day, not a clean calendar boundary.
const TODAY = new Date(2026, 7, 17, 15, 0);

function keyFor(daysAgo: number): string {
  return dayKey(subDays(TODAY, daysAgo).getTime());
}

/** Build a dayKey -> standards map from {daysAgo: standards} entries. */
function totalsMap(entries: Record<number, number>): Map<string, number> {
  const map = new Map<string, number>();
  for (const [daysAgo, standards] of Object.entries(entries)) {
    map.set(keyFor(Number(daysAgo)), standards);
  }
  return map;
}

function ctx(totals: Map<string, number>, floorDaysAgo: number | null): StreakContext {
  return {
    totals,
    today: TODAY,
    floor: floorDaysAgo === null ? null : subDays(TODAY, floorDaysAgo),
  };
}

describe('dailyTotalsMap', () => {
  it('is empty for no drinks', () => {
    expect(dailyTotalsMap([]).size).toBe(0);
  });

  it('sums multiple drinks on the same calendar day', () => {
    const drinks: DrinkEntry[] = [
      { timestamp: subDays(TODAY, 0).getTime(), standards: 1.4, volumeMl: 0, abvPercent: 0 },
      { timestamp: subDays(TODAY, 0).getTime() - 1000, standards: 0.9, volumeMl: 0, abvPercent: 0 },
      { timestamp: subDays(TODAY, 1).getTime(), standards: 2, volumeMl: 0, abvPercent: 0 },
    ];
    const map = dailyTotalsMap(drinks);
    expect(map.get(keyFor(0))).toBeCloseTo(2.3, 10);
    expect(map.get(keyFor(1))).toBe(2);
  });
});

describe('dailyStandardsStreak', () => {
  const limit = 4;

  it('is 0 when the limit is not set', () => {
    expect(dailyStandardsStreak(ctx(totalsMap({}), 30), 0, 0)).toBe(0);
  });

  it('is 0 when there is no floor (no tracking data at all)', () => {
    expect(dailyStandardsStreak(ctx(totalsMap({}), null), limit, 0)).toBe(0);
  });

  it('is 0 when today itself breaches the limit', () => {
    expect(dailyStandardsStreak(ctx(totalsMap({}), 10), limit, 5)).toBe(0);
  });

  it('is zero-based: a single day under the limit (today, with no prior data) shows no streak yet', () => {
    // floor = today, i.e. this is the very first day we have any data for. Being under the limit
    // today alone isn't "a day in a row" yet — nothing to show until a full day has elapsed.
    expect(dailyStandardsStreak(ctx(totalsMap({}), 0), limit, 1)).toBe(0);
  });

  it('shows 1 day once a single full day under the limit has actually elapsed', () => {
    const totals = totalsMap({ 1: 2 }); // yesterday was under the limit
    expect(dailyStandardsStreak(ctx(totals, 1), limit, 1)).toBe(1);
  });

  it('counts complete days under the limit back to the floor, not including today', () => {
    const totals = totalsMap({ 1: 2, 2: 3, 3: 1 });
    expect(dailyStandardsStreak(ctx(totals, 3), limit, 0)).toBe(3); // day-1, day-2, day-3 (= floor)
  });

  it('stops at the first past-day breach', () => {
    const totals = totalsMap({ 1: 2, 2: 5, 3: 1 }); // day-2 breaches (5 > 4)
    expect(dailyStandardsStreak(ctx(totals, 10), limit, 0)).toBe(1); // day-1 only
  });

  it('does not extend past the floor even when earlier days were also fine', () => {
    const totals = totalsMap({ 1: 1, 2: 1, 3: 1, 4: 1 });
    expect(dailyStandardsStreak(ctx(totals, 2), limit, 0)).toBe(2); // day-1, day-2 (= floor)
  });
});

describe('weeklyStandardsStreak', () => {
  const limit = 10;

  it('walks back through consistently-under trailing-7-day totals to the floor', () => {
    const entries: Record<number, number> = {};
    for (let d = 1; d <= 29; d++) entries[d] = 1; // 1 standard/day -> any 7-day window sums to 7
    const totals = totalsMap(entries);
    expect(weeklyStandardsStreak(ctx(totals, 29), limit, 7)).toBe(29); // day-1..day-29 (= floor)
  });

  it('stops once a trailing 7-day window is pushed over by a single heavy day', () => {
    const entries: Record<number, number> = {};
    for (let d = 1; d <= 20; d++) entries[d] = 1;
    entries[10] = 20; // one big session 10 days ago
    const totals = totalsMap(entries);

    // A 7-day window ending on day-D covers days D..D+6, so it first reaches back far enough to
    // include day-10's spike once D=4 (4..10). That window sums to 6*1 + 20 = 26 > 10, so the walk
    // breaches there, after 3 clean days (day-1..day-3).
    expect(weeklyStandardsStreak(ctx(totals, 25), limit, 5)).toBe(3);
  });
});

describe('weeklyDrinkingDaysStreak', () => {
  const limit = 6;

  it('walks back while every trailing 7-day window stays at or under the limit', () => {
    const entries: Record<number, number> = {};
    for (let d = 1; d <= 6; d++) entries[d] = 1; // drank on exactly 6 of the last however-many days
    const totals = totalsMap(entries);
    // Every 7-day window from day-1 onward contains at most these same 6 drinking days.
    expect(weeklyDrinkingDaysStreak(ctx(totals, 6), limit, 3)).toBe(6); // day-1..day-6 (= floor)
  });

  it('stops as soon as a trailing 7-day window exceeds the limit', () => {
    const entries: Record<number, number> = {};
    for (let d = 1; d <= 20; d++) entries[d] = 1; // drank every day for 20 days straight
    const totals = totalsMap(entries);
    // The very first past-day check (day-1) covers days 1..7, all drinking days: 7 > 6 — breaches
    // immediately, so there's no complete day to show yet even though today itself is fine.
    expect(weeklyDrinkingDaysStreak(ctx(totals, 25), limit, 3)).toBe(0);
  });

  it('regression: a rolling week that touched 8 distinct drinking days must not show a streak', () => {
    // This is the exact bug found after shipping streaks: the "Drinking days (7d)" bar uses an
    // exact rolling window ending *now*, which — whenever "now" isn't midnight — can touch 8
    // distinct calendar dates instead of 7. A calendar-only view of "today" (drank on exactly the
    // last 7 calendar days) would say 7, i.e. not over a limit of 7. The live rolling value the
    // bar actually shows, however, is 8 (over). The streak must follow the bar, not the
    // calendar-only approximation.
    const totals = totalsMap({ 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 }); // 7 calendar days
    const todayRollingValue = 8; // what the bar itself is showing right now

    expect(weeklyDrinkingDaysStreak(ctx(totals, 6), 7, todayRollingValue)).toBe(0);
  });
});

describe('monthlyDrinkingDaysStreak', () => {
  const limit = 25;

  it('walks back while every trailing 30-day window stays at or under the limit', () => {
    const entries: Record<number, number> = {};
    for (let d = 1; d <= 10; d++) entries[d] = 1; // only 10 distinct drinking days, well under 25
    const totals = totalsMap(entries);
    expect(monthlyDrinkingDaysStreak(ctx(totals, 15), limit, 10)).toBe(15); // day-1..day-15 (= floor)
  });

  it('stops as soon as a trailing 30-day window exceeds the limit', () => {
    const entries: Record<number, number> = {};
    for (let d = 1; d <= 40; d++) entries[d] = 1; // drank every day for 40 days straight
    const totals = totalsMap(entries);
    // First past-day check (day-1) covers days 1..30, all drinking days: 30 > 25 — breaches
    // immediately.
    expect(monthlyDrinkingDaysStreak(ctx(totals, 45), limit, 20)).toBe(0);
  });
});
