import { describe, expect, it } from 'vitest';
import { buildRotatingStats, pickRandomStatKey, type RotatingStatsInput } from './rotatingStats';

const EMPTY: RotatingStatsInput = {
  sinceLastDrinkText: null,
  averagePerWeek: null,
  averagePerDay: null,
  averagePerDrinkingDay: null,
  averageDailyStreakLength: null,
  averageWeeklyStreakLength: null,
};

describe('buildRotatingStats', () => {
  it('is empty when nothing has data yet', () => {
    expect(buildRotatingStats(EMPTY)).toEqual([]);
  });

  it('includes the since-last-drink text verbatim when provided', () => {
    const stats = buildRotatingStats({ ...EMPTY, sinceLastDrinkText: '3 hours since your last drink.' });
    expect(stats).toEqual([{ key: 'sinceLastDrink', text: '3 hours since your last drink.' }]);
  });

  it('formats the weekly average to 1 decimal place', () => {
    const stats = buildRotatingStats({ ...EMPTY, averagePerWeek: 4.567 });
    expect(stats).toEqual([{ key: 'perWeek', text: 'Average 4.6 standards per week' }]);
  });

  it('only includes the per-day stat once both the overall and drinking-day averages are known', () => {
    expect(buildRotatingStats({ ...EMPTY, averagePerDay: 1.2 })).toEqual([]);
    expect(buildRotatingStats({ ...EMPTY, averagePerDrinkingDay: 2.5 })).toEqual([]);

    const stats = buildRotatingStats({ ...EMPTY, averagePerDay: 1.2, averagePerDrinkingDay: 2.5 });
    expect(stats).toEqual([
      { key: 'perDay', text: 'Average 1.2 standards per day, 2.5 on days you drank' },
    ]);
  });

  it('offers the daily and weekly streak-length stats as separate pool entries', () => {
    const stats = buildRotatingStats({ ...EMPTY, averageDailyStreakLength: 3, averageWeeklyStreakLength: 5.5 });
    expect(stats).toEqual([
      { key: 'streakDaily', text: 'Average streak length of 3.0 days for standards per day' },
      { key: 'streakWeekly', text: 'Average streak length of 5.5 days for standards per week' },
    ]);
  });

  it('includes every available stat together', () => {
    const stats = buildRotatingStats({
      sinceLastDrinkText: '2 days since your last drink.',
      averagePerWeek: 5,
      averagePerDay: 1,
      averagePerDrinkingDay: 3,
      averageDailyStreakLength: 4,
      averageWeeklyStreakLength: 2,
    });
    expect(stats.map((s) => s.key)).toEqual([
      'sinceLastDrink',
      'perWeek',
      'perDay',
      'streakDaily',
      'streakWeekly',
    ]);
  });
});

describe('pickRandomStatKey', () => {
  it('is undefined with no keys', () => {
    expect(pickRandomStatKey([])).toBeUndefined();
  });

  it('returns the only key when there is just one, even if it is also excluded', () => {
    expect(pickRandomStatKey(['a'], 'a')).toBe('a');
  });

  it('never returns the excluded key when an alternative exists', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickRandomStatKey(['a', 'b'], 'a')).toBe('b');
    }
  });

  it('can return any key when nothing is excluded', () => {
    const seen = new Set<string | undefined>();
    for (let i = 0; i < 100; i++) seen.add(pickRandomStatKey(['a', 'b', 'c']));
    expect(seen).toEqual(new Set(['a', 'b', 'c']));
  });
});
