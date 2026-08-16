import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useSettings } from './useSettings';
import { last24h, last7d, last30d } from '../lib/dates';
import { sumStandards, countDrinkingDays } from '../lib/stats';
import {
  dailyTotalsMap,
  dailyStandardsStreak,
  weeklyStandardsStreak,
  weeklyDrinkingDaysStreak,
  monthlyDrinkingDaysStreak,
  type StreakContext,
} from '../lib/streaks';
import type { DrinkEntry } from '../types';

export interface Streaks {
  daily: number;
  weeklyStandards: number;
  weeklyDrinkingDays: number;
  monthlyDrinkingDays: number;
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
    const w30 = last30d(now);
    const todayDaily = sumStandards(inWindow(allDrinks, w24.start, w24.end));
    const todayWeeklyStandards = sumStandards(inWindow(allDrinks, w7.start, w7.end));
    const todayWeeklyDrinkingDays = countDrinkingDays(inWindow(allDrinks, w7.start, w7.end));
    const todayMonthlyDrinkingDays = countDrinkingDays(inWindow(allDrinks, w30.start, w30.end));

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
    };
  }, [allDrinks, settings, now]);
}
