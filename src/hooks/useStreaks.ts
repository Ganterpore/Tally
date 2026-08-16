import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useSettings } from './useSettings';
import {
  dailyTotalsMap,
  dailyStandardsStreak,
  weeklyStandardsStreak,
  weeklyDrinkingDaysStreak,
  monthlyDrinkingDaysStreak,
  type StreakContext,
} from '../lib/streaks';

export interface Streaks {
  daily: number;
  weeklyStandards: number;
  weeklyDrinkingDays: number;
  monthlyDrinkingDays: number;
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

    return {
      daily: dailyStandardsStreak(ctx, settings.dailyStandardsLimit),
      weeklyStandards: weeklyStandardsStreak(ctx, settings.weeklyStandardsLimit),
      weeklyDrinkingDays: weeklyDrinkingDaysStreak(ctx, settings.weeklyDrinkingDaysLimit),
      monthlyDrinkingDays: monthlyDrinkingDaysStreak(ctx, settings.monthlyDrinkingDaysLimit),
    };
  }, [allDrinks, settings, now]);
}
