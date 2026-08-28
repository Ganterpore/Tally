import { describe, expect, it } from 'vitest';
import { dayKey, dayRange, last24h, last7d, last28d, rollingWindow } from './dates';

describe('dayRange', () => {
  it('spans local midnight to just before the next midnight', () => {
    const { start, end } = dayRange(new Date(2026, 7, 17, 14, 30)); // 17 Aug 2026, 2:30pm
    const startDate = new Date(start);
    const endDate = new Date(end);

    expect(startDate.getHours()).toBe(0);
    expect(startDate.getMinutes()).toBe(0);
    expect(startDate.getSeconds()).toBe(0);
    expect(startDate.getMilliseconds()).toBe(0);
    expect(endDate.getDate()).toBe(startDate.getDate());
    expect(end - start).toBe(24 * 60 * 60 * 1000 - 1);
  });

  it('is unaffected by the time-of-day passed in', () => {
    const morning = dayRange(new Date(2026, 7, 17, 0, 1));
    const night = dayRange(new Date(2026, 7, 17, 23, 59));
    expect(morning).toEqual(night);
  });
});

describe('rollingWindow', () => {
  it('spans exactly `hours` hours ending at `end`', () => {
    const end = new Date(2026, 7, 17, 15, 0);
    const { start, end: endMs } = rollingWindow(24, end);
    expect(endMs).toBe(end.getTime());
    expect(endMs - start).toBe(24 * 60 * 60 * 1000);
  });

  it('defaults `end` to now when omitted', () => {
    const before = Date.now();
    const { end } = rollingWindow(1);
    const after = Date.now();
    expect(end).toBeGreaterThanOrEqual(before);
    expect(end).toBeLessThanOrEqual(after);
  });

  it('is pure elapsed time, not calendar-aware', () => {
    // A "last 24 hours" ending mid-afternoon does NOT align with calendar-day boundaries —
    // this is the deliberate rolling-window behaviour the app relies on (as opposed to dayRange).
    const end = new Date(2026, 7, 17, 15, 0);
    const { start } = rollingWindow(24, end);
    const startDate = new Date(start);
    expect(startDate.getHours()).toBe(15);
    expect(startDate.getDate()).toBe(16);
  });
});

describe('last24h / last7d / last28d', () => {
  const end = new Date(2026, 7, 17, 15, 0);

  it('use the expected hour multiples', () => {
    expect(last24h(end).end - last24h(end).start).toBe(24 * 60 * 60 * 1000);
    expect(last7d(end).end - last7d(end).start).toBe(24 * 7 * 60 * 60 * 1000);
    expect(last28d(end).end - last28d(end).start).toBe(24 * 28 * 60 * 60 * 1000);
  });

  it('all end at the same instant', () => {
    expect(last24h(end).end).toBe(end.getTime());
    expect(last7d(end).end).toBe(end.getTime());
    expect(last28d(end).end).toBe(end.getTime());
  });
});

describe('dayKey', () => {
  it('is stable across the whole calendar day', () => {
    const midnight = new Date(2026, 7, 17, 0, 0, 0, 0).getTime();
    const noon = new Date(2026, 7, 17, 12, 0).getTime();
    const almostNextDay = new Date(2026, 7, 17, 23, 59, 59, 999).getTime();

    expect(dayKey(midnight)).toBe('2026-08-17');
    expect(dayKey(noon)).toBe('2026-08-17');
    expect(dayKey(almostNextDay)).toBe('2026-08-17');
  });

  it('changes at the midnight boundary', () => {
    const justBefore = new Date(2026, 7, 17, 23, 59, 59, 999).getTime();
    const justAfter = new Date(2026, 7, 18, 0, 0, 0, 0).getTime();
    expect(dayKey(justBefore)).not.toBe(dayKey(justAfter));
  });
});
