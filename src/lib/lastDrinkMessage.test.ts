import { describe, expect, it } from 'vitest';
import { isDaytime, lastDrinkMessage } from './lastDrinkMessage';

describe('isDaytime', () => {
  it('is true from 6am up to (not including) 6pm', () => {
    expect(isDaytime(new Date(2026, 7, 17, 6, 0))).toBe(true);
    expect(isDaytime(new Date(2026, 7, 17, 17, 59))).toBe(true);
  });

  it('is false outside that range', () => {
    expect(isDaytime(new Date(2026, 7, 17, 5, 59))).toBe(false);
    expect(isDaytime(new Date(2026, 7, 17, 18, 0))).toBe(false);
    expect(isDaytime(new Date(2026, 7, 17, 23, 0))).toBe(false);
  });
});

describe('lastDrinkMessage', () => {
  const now = new Date(2026, 7, 17, 15, 0); // 17 Aug 2026, 3pm

  it('returns null when there is no drink history', () => {
    expect(lastDrinkMessage(undefined, now)).toBeNull();
  });

  it('nudges to enjoy the day when the last drink was earlier today, during the day', () => {
    const earlierToday = new Date(2026, 7, 17, 10, 0).getTime();
    expect(lastDrinkMessage(earlierToday, now)).toBe('Enjoy your day responsibly.');
  });

  it('nudges to enjoy the night when the last drink was earlier today, at night', () => {
    const lateNight = new Date(2026, 7, 17, 22, 0);
    const earlierToday = new Date(2026, 7, 17, 20, 0).getTime();
    expect(lastDrinkMessage(earlierToday, lateNight)).toBe('Enjoy your night responsibly.');
  });

  it('reports hours when the last drink was yesterday but under 24 hours ago', () => {
    // Last drink 11pm yesterday, now just past midnight today — different calendar days, <24h apart.
    const justAfterMidnight = new Date(2026, 7, 17, 0, 30);
    const lastNight = new Date(2026, 7, 16, 23, 0).getTime();
    expect(lastDrinkMessage(lastNight, justAfterMidnight)).toBe('1 hour since your last drink.');
  });

  it('pluralizes hours', () => {
    const justAfterMidnight = new Date(2026, 7, 17, 0, 30);
    const twoAndAHalfHoursAgo = new Date(2026, 7, 16, 22, 0).getTime();
    expect(lastDrinkMessage(twoAndAHalfHoursAgo, justAfterMidnight)).toBe('2 hours since your last drink.');
  });

  it('reports days once 24 hours or more have passed', () => {
    const twoDaysAgo = new Date(2026, 7, 15, 15, 0).getTime();
    expect(lastDrinkMessage(twoDaysAgo, now)).toBe('2 days since your last drink.');
  });

  it('uses singular "day" for exactly one day', () => {
    const oneDayAgo = new Date(2026, 7, 16, 12, 0).getTime();
    expect(lastDrinkMessage(oneDayAgo, now)).toBe('1 day since your last drink.');
  });
});
