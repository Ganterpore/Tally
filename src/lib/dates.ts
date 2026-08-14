import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns';

/** Weeks start Monday, matching how the NHMRC weekly drinking guideline is usually framed. */
const WEEK_OPTS = { weekStartsOn: 1 as const };

export function dayRange(date: Date) {
  return { start: startOfDay(date).getTime(), end: endOfDay(date).getTime() };
}

export function weekRange(date: Date) {
  return {
    start: startOfWeek(date, WEEK_OPTS).getTime(),
    end: endOfWeek(date, WEEK_OPTS).getTime(),
  };
}

export function monthRange(date: Date) {
  return { start: startOfMonth(date).getTime(), end: endOfMonth(date).getTime() };
}

export function dayKey(timestamp: number): string {
  return format(timestamp, 'yyyy-MM-dd');
}

export { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format };
export const weekStartsOn = WEEK_OPTS.weekStartsOn;
