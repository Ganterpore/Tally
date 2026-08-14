import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useSettings } from '../hooks/useSettings';
import { useAddDrink, useDeleteDrink, useDrinksInRange } from '../hooks/useDrinks';
import { dayRange, weekRange } from '../lib/dates';
import { calcStandards, roundStandards, formatStandards } from '../lib/standards';
import { sumStandards, countDrinkingDays, levelFor } from '../lib/stats';
import { LimitBar } from './LimitBar';
import { DrinkForm } from './DrinkForm';
import { DrinkList } from './DrinkList';

export function LogTab() {
  const now = new Date();
  const today = dayRange(now);
  const week = weekRange(now);

  const settings = useSettings();
  const presets = useLiveQuery(() => db.presets.toArray(), []) ?? [];
  const todaysDrinks = useDrinksInRange(today.start, today.end);
  const weeksDrinks = useDrinksInRange(week.start, week.end);

  const addDrink = useAddDrink();
  const deleteDrink = useDeleteDrink();

  const todayTotal = sumStandards(todaysDrinks);
  const weekTotal = sumStandards(weeksDrinks);
  const weekDrinkingDays = countDrinkingDays(weeksDrinks);

  const breaches = [
    levelFor(todayTotal, settings.dailyStandardsLimit) === 'over' && 'today’s standard drinks limit',
    levelFor(weekTotal, settings.weeklyStandardsLimit) === 'over' && 'this week’s standard drinks limit',
    levelFor(weekDrinkingDays, settings.weeklyDrinkingDaysLimit) === 'over' && 'this week’s drinking-days limit',
  ].filter(Boolean) as string[];

  async function handleAdd(volumeMl: number, abvPercent: number, label?: string) {
    await addDrink({
      timestamp: Date.now(),
      volumeMl,
      abvPercent,
      standards: roundStandards(calcStandards(volumeMl, abvPercent)),
      label,
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 pb-24 pt-6">
      <header>
        <p className="text-sm text-slate-400">Today</p>
        <h1 className="text-2xl font-semibold text-slate-100">
          {now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h1>
      </header>

      {breaches.length > 0 && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
          Over {breaches.join(' and ')}.
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <LimitBar
          label="Today"
          value={roundStandards(todayTotal)}
          limit={settings.dailyStandardsLimit}
          formatValue={formatStandards}
          suffix="standards"
        />
        <LimitBar
          label="This week"
          value={roundStandards(weekTotal)}
          limit={settings.weeklyStandardsLimit}
          formatValue={formatStandards}
          suffix="standards"
        />
        <LimitBar
          label="Drinking days this week"
          value={weekDrinkingDays}
          limit={settings.weeklyDrinkingDaysLimit}
          suffix="days"
        />
      </section>

      {presets.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick add</h2>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAdd(p.volumeMl, p.abvPercent, p.label)}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-brand hover:text-brand"
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Custom drink</h2>
        <DrinkForm onAdd={handleAdd} />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Logged today ({todaysDrinks.length})
        </h2>
        <DrinkList drinks={todaysDrinks} onDelete={deleteDrink} emptyText="No drinks logged today yet." />
      </section>
    </div>
  );
}
