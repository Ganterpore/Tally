import { formatStandards } from './standards';

export interface RotatingStat {
  key: string;
  text: string;
}

export interface RotatingStatsInput {
  /** The "X hours/days since your last drink" text, or null to leave it out of the pool — e.g. no
   * drink history yet, or today is already a drinking day (shown as a fixed message instead). */
  sinceLastDrinkText: string | null;
  averagePerWeek: number | null;
  averagePerDay: number | null;
  averagePerDrinkingDay: number | null;
  averageDailyStreakLength: number | null;
  averageWeeklyStreakLength: number | null;
}

/**
 * The pool of stat lines the Log page's header rotates through. Each stat is included only once
 * it has enough data to report — e.g. a streak-length average needs at least one completed
 * under-limit run — so the rotation never lands on a broken or misleading value.
 */
export function buildRotatingStats(input: RotatingStatsInput): RotatingStat[] {
  const stats: RotatingStat[] = [];

  if (input.sinceLastDrinkText !== null) {
    stats.push({ key: 'sinceLastDrink', text: input.sinceLastDrinkText });
  }

  if (input.averagePerWeek !== null) {
    stats.push({ key: 'perWeek', text: `Average ${formatStandards(input.averagePerWeek)} standards per week` });
  }

  if (input.averagePerDay !== null && input.averagePerDrinkingDay !== null) {
    stats.push({
      key: 'perDay',
      text: `Average ${formatStandards(input.averagePerDay)} standards per day, ${formatStandards(input.averagePerDrinkingDay)} on days you drank`,
    });
  }

  if (input.averageDailyStreakLength !== null) {
    stats.push({
      key: 'streakDaily',
      text: `Average streak length of ${formatStandards(input.averageDailyStreakLength)} days for standards per day`,
    });
  }

  if (input.averageWeeklyStreakLength !== null) {
    stats.push({
      key: 'streakWeekly',
      text: `Average streak length of ${formatStandards(input.averageWeeklyStreakLength)} days for standards per week`,
    });
  }

  return stats;
}

/**
 * Picks a random entry from `keys`, favouring one other than `exclude` when there's more than one
 * option — so the header's 30-second rotation doesn't land back on the stat it's already showing.
 */
export function pickRandomStatKey(keys: string[], exclude?: string): string | undefined {
  if (keys.length === 0) return undefined;
  const pool = keys.length > 1 && exclude !== undefined ? keys.filter((k) => k !== exclude) : keys;
  return pool[Math.floor(Math.random() * pool.length)];
}
