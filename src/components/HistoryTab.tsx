import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useSettings } from '../hooks/useSettings';
import { usePresets } from '../hooks/usePresets';
import { useAddDrink, useDeleteDrink, useDrinksInRange } from '../hooks/useDrinks';
import { useNow } from '../hooks/useNow';
import { dayRange, last7d, last30d, weekStartsOn, dayKey } from '../lib/dates';
import { calcStandards, roundStandards, formatStandards } from '../lib/standards';
import { groupByDay, sumStandards, countDrinkingDays, levelFor, type LimitLevel } from '../lib/stats';
import { LimitBar } from './LimitBar';
import { DrinkList } from './DrinkList';
import { AddDrinkForm, type NewDrink } from './AddDrinkForm';

const DOT_COLOR: Record<LimitLevel, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-rose-500',
};

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HistoryTab() {
  const now = useNow();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  const settings = useSettings();
  const presets = usePresets();
  const addDrink = useAddDrink();
  const deleteDrink = useDeleteDrink();

  const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn });
  const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn });
  const gridDays = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd],
  );

  const monthDrinksForGrid = useDrinksInRange(gridStart.getTime(), gridEnd.getTime());
  const byDay = useMemo(() => groupByDay(monthDrinksForGrid), [monthDrinksForGrid]);

  const window7d = last7d(now);
  const window30d = last30d(now);
  const selectedRange = dayRange(selectedDay);

  const last7dDrinks = useDrinksInRange(window7d.start, window7d.end);
  const last30dDrinks = useDrinksInRange(window30d.start, window30d.end);
  const selectedDayDrinks = useDrinksInRange(selectedRange.start, selectedRange.end);

  const total7d = sumStandards(last7dDrinks);
  const drinkingDays7d = countDrinkingDays(last7dDrinks);
  const drinkingDays30d = countDrinkingDays(last30dDrinks);

  const isFutureDay = isAfter(startOfDay(selectedDay), startOfDay(now));

  async function handleAdd(entry: NewDrink) {
    await addDrink({
      timestamp: entry.timestamp,
      volumeMl: entry.volumeMl,
      abvPercent: entry.abvPercent,
      standards: roundStandards(calcStandards(entry.volumeMl, entry.abvPercent)),
      label: entry.label,
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 pb-24 pt-6">
      <header>
        <p className="text-sm text-slate-400">History</p>
        <h1 className="text-2xl font-semibold text-slate-100">Calendar</h1>
      </header>

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <LimitBar
          label="Last 7 days"
          value={roundStandards(total7d)}
          limit={settings.weeklyStandardsLimit}
          formatValue={formatStandards}
          suffix="standards"
        />
        <LimitBar label="Drinking days (7d)" value={drinkingDays7d} limit={settings.weeklyDrinkingDaysLimit} suffix="days" />
        <LimitBar label="Drinking days (30d)" value={drinkingDays30d} limit={settings.monthlyDrinkingDaysLimit} suffix="days" />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, -1))}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 className="text-sm font-semibold text-slate-200">{format(cursor, 'MMMM yyyy')}</h2>
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((day) => {
            const key = dayKey(day.getTime());
            const drinksThatDay = byDay.get(key) ?? [];
            const total = sumStandards(drinksThatDay);
            const level = levelFor(total, settings.dailyStandardsLimit);
            const inMonth = isSameMonth(day, cursor);
            const selected = isSameDay(day, selectedDay);

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  selected ? 'bg-brand text-white' : 'hover:bg-slate-800'
                } ${inMonth ? 'text-slate-200' : 'text-slate-600'}`}
              >
                <span className={isToday(day) && !selected ? 'font-semibold text-brand' : ''}>
                  {format(day, 'd')}
                </span>
                {drinksThatDay.length > 0 && (
                  <span
                    className={`mt-0.5 h-1.5 w-1.5 rounded-full ${selected ? 'bg-white' : DOT_COLOR[level]}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isToday(selectedDay) ? 'Today' : format(selectedDay, 'EEEE d MMMM')} ·{' '}
          {formatStandards(sumStandards(selectedDayDrinks))} standards
        </h2>
        <DrinkList drinks={selectedDayDrinks} onDelete={deleteDrink} emptyText="No drinks logged this day." />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Add a drink for {isToday(selectedDay) ? 'today' : format(selectedDay, 'd MMMM')}
        </h2>
        {isFutureDay ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-500">
            Pick today or a past day to log a drink.
          </p>
        ) : (
          <AddDrinkForm presets={presets} targetDay={selectedDay} showTimePicker onAdd={handleAdd} />
        )}
      </section>
    </div>
  );
}
