import { differenceInHours, differenceInDays } from 'date-fns';
import { dayRange } from './dates';

/** Roughly 6am-6pm counts as day; outside that, night. Used only for phrasing, never for tracking. */
export function isDaytime(now: Date): boolean {
  const hour = now.getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Whether the most recent drink falls on today's calendar day. Deliberately keyed off the
 * calendar day rather than the rolling 24h window the limit bars use, since "today" is what reads
 * naturally in the messaging that uses this.
 */
export function hasDrinkToday(lastDrinkTimestamp: number | undefined, now: Date): boolean {
  if (lastDrinkTimestamp === undefined) return false;
  return lastDrinkTimestamp >= dayRange(now).start;
}

/**
 * The encouragement line shown on the Log page below the limit bars: a nudge about how long it's
 * been since the last drink, or — if today's calendar day already has one — a reminder to pace
 * responsibly. Returns null when there's no drink history to talk about yet.
 */
export function lastDrinkMessage(lastDrinkTimestamp: number | undefined, now: Date): string | null {
  if (lastDrinkTimestamp === undefined) return null;

  if (hasDrinkToday(lastDrinkTimestamp, now)) {
    return `Enjoy your ${isDaytime(now) ? 'day' : 'night'} responsibly.`;
  }

  const hours = differenceInHours(now, lastDrinkTimestamp);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} since your last drink.`;
  }

  const days = differenceInDays(now, lastDrinkTimestamp);
  return `${days} day${days === 1 ? '' : 's'} since your last drink.`;
}
