import { describe, expect, it } from 'vitest';
import { countDrinkingDays, groupByDay, levelFor, sumStandards } from './stats';
import type { DrinkEntry } from '../types';

function drink(timestamp: number, standards: number): DrinkEntry {
  return { timestamp, standards, volumeMl: 0, abvPercent: 0 };
}

const AUG17_9AM = new Date(2026, 7, 17, 9, 0).getTime();
const AUG17_9PM = new Date(2026, 7, 17, 21, 0).getTime();
const AUG18_9AM = new Date(2026, 7, 18, 9, 0).getTime();

describe('groupByDay', () => {
  it('returns an empty map for no drinks', () => {
    expect(groupByDay([]).size).toBe(0);
  });

  it('groups same-day drinks together regardless of time', () => {
    const drinks = [drink(AUG17_9AM, 1), drink(AUG17_9PM, 2), drink(AUG18_9AM, 3)];
    const grouped = groupByDay(drinks);

    expect(grouped.size).toBe(2);
    expect(grouped.get('2026-08-17')).toHaveLength(2);
    expect(grouped.get('2026-08-18')).toHaveLength(1);
  });
});

describe('sumStandards', () => {
  it('sums to 0 for no drinks', () => {
    expect(sumStandards([])).toBe(0);
  });

  it('sums standard drinks across entries', () => {
    expect(sumStandards([drink(AUG17_9AM, 1.4), drink(AUG17_9PM, 0.9)])).toBeCloseTo(2.3, 10);
  });
});

describe('countDrinkingDays', () => {
  it('is 0 for no drinks', () => {
    expect(countDrinkingDays([])).toBe(0);
  });

  it('counts distinct calendar days, not entries', () => {
    const drinks = [drink(AUG17_9AM, 1), drink(AUG17_9PM, 1), drink(AUG18_9AM, 1)];
    expect(countDrinkingDays(drinks)).toBe(2);
  });
});

describe('levelFor', () => {
  it('treats an unset (<=0) limit as always ok', () => {
    expect(levelFor(100, 0)).toBe('ok');
    expect(levelFor(100, -5)).toBe('ok');
  });

  it('is ok below 80% of the limit', () => {
    expect(levelFor(7.9, 10)).toBe('ok');
  });

  it('is warning from 80% up to and including 100% — landing exactly on the limit is a caution, not a breach', () => {
    expect(levelFor(8, 10)).toBe('warning');
    expect(levelFor(9.9, 10)).toBe('warning');
    expect(levelFor(10, 10)).toBe('warning');
  });

  it('is over only once strictly past the limit', () => {
    expect(levelFor(10.1, 10)).toBe('over');
    expect(levelFor(15, 10)).toBe('over');
  });
});
