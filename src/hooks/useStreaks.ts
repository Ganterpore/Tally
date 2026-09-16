import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useSettings } from './useSettings';
import { last24h, last7d, last28d } from '../lib/dates';
import {
  sumStandards,
  countDrinkingDays,
  averageStandardsPerWeek,
  averageStandardsPerDay,
  averageStandardsPerDrinkingDay,
} from '../lib/stats';
import {
  dailyTotalsMap,
  dailyStandardsStreak,
  weeklyStandardsStreak,
  weeklyDrinkingDaysStreak,
  monthlyDrinkingDaysStreak,
  averageDailyStandardsStreakLength,
  averageWeeklyStandardsStreakLength,
  type StreakContext,
} from '../lib/streaks';
import type { DrinkEntry } from '../types';

export interface Streaks {
  daily: number;
  weeklyStandards: number;
  weeklyDrinkingDays: number;
  monthlyDrinkingDays: number;
  /** Lifetime average standard drinks/week, from first use to now. Null until there's a floor. */
  averagePerWeek: number | null;
  /** Lifetime average standard drinks/day, including dry days. Null until there's a floor. */
  averagePerDay: number | null;
  /** Lifetime average standard drinks on days that had any. Null until there's a drinking day. */
  averagePerDrinkingDay: number | null;
  /** Average length of every under-limit daily-standards run. Null until one has occurred. */
  averageDailyStreakLength: number | null;
  /** Average length of every under-limit weekly-standards run. Null until one has occurred. */
  averageWeeklyStreakLength: number | null;
}

function inWindow(drinks: DrinkEntry[], start: number, end: number): DrinkEntry[] {
  return drinks.filter((d) => d.timestamp >= start && d.timestamp <= end);
}

/** Current under-the-limit streaks for all four limits, as of `now`. */
export function useStreaks(now: Date): Streaks {
  const settings = useSettings();
  const allDrinks = useLiveQuery(() => db.drinks.toArray(), []) ?? [];

  return useMemo(() => {
    const totals = dailyTotalsMap(allDrinks);
    const earliestDrinkMs = allDrinks.reduce((min, d) => Math.min(min, d.timestamp), Infinity);
    const floorMs = Math.min(settings.createdAt, earliestDrinkMs);
    const floor = Number.isFinite(floorMs) ? new Date(floorMs) : null;
    const ctx: StreakContext = { totals, today: now, floor };

    // Exactly the same rolling windows the bars themselves show, so "today" in the streak can
    // never disagree with whether the bar is currently drawn as over the limit.
    const w24 = last24h(now);
    const w7 = last7d(now);
    const w28 = last28d(now);
    const todayDaily = sumStandards(inWindow(allDrinks, w24.start, w24.end));
    const todayWeeklyStandards = sumStandards(inWindow(allDrinks, w7.start, w7.end));
    const todayWeeklyDrinkingDays = countDrinkingDays(inWindow(allDrinks, w7.start, w7.end));
    const todayMonthlyDrinkingDays = countDrinkingDays(inWindow(allDrinks, w28.start, w28.end));

    return {
      daily: dailyStandardsStreak(ctx, settings.dailyStandardsLimit, todayDaily),
      weeklyStandards: weeklyStandardsStreak(ctx, settings.weeklyStandardsLimit, todayWeeklyStandards),
      weeklyDrinkingDays: weeklyDrinkingDaysStreak(
        ctx,
        settings.weeklyDrinkingDaysLimit,
        todayWeeklyDrinkingDays,
      ),
      monthlyDrinkingDays: monthlyDrinkingDaysStreak(
        ctx,
        settings.monthlyDrinkingDaysLimit,
        todayMonthlyDrinkingDays,
      ),
      averagePerWeek: averageStandardsPerWeek(allDrinks, floor, now),
      averagePerDay: averageStandardsPerDay(allDrinks, floor, now),
      averagePerDrinkingDay: averageStandardsPerDrinkingDay(allDrinks),
      averageDailyStreakLength: averageDailyStandardsStreakLength(ctx, settings.dailyStandardsLimit),
      averageWeeklyStreakLength: averageWeeklyStandardsStreakLength(ctx, settings.weeklyStandardsLimit),
    };
  }, [allDrinks, settings, now]);
}
