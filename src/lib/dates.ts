import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

/** A specific calendar day, used for browsing/backdating history — not for limit tracking. */
export function dayRange(date: Date) {
  return { start: startOfDay(date).getTime(), end: endOfDay(date).getTime() };
}

/**
 * A rolling window of `hours`, ending at `end` (defaults to now). Limits are tracked against
 * these rather than calendar day/week/month boundaries, so "last 24 hours" actually means the
 * last 24 hours, not "since midnight".
 */
export function rollingWindow(hours: number, end: Date = new Date()) {
  const endMs = end.getTime();
  return { start: endMs - hours * 60 * 60 * 1000, end: endMs };
}

export const last24h = (end?: Date) => rollingWindow(24, end);
export const last7d = (end?: Date) => rollingWindow(24 * 7, end);
export const last28d = (end?: Date) => rollingWindow(24 * 28, end);

export function dayKey(timestamp: number): string {
  return format(timestamp, 'yyyy-MM-dd');
}

/** Monday-start weeks, used only for laying out the History calendar grid. */
const WEEK_OPTS = { weekStartsOn: 1 as const };
export { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format };
export const weekStartsOn = WEEK_OPTS.weekStartsOn;
