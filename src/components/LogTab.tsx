import { useSettings } from '../hooks/useSettings';
import { usePresets } from '../hooks/usePresets';
import { useAddDrink, useDeleteDrink, useDrinksInRange } from '../hooks/useDrinks';
import { useNow } from '../hooks/useNow';
import { useStreaks } from '../hooks/useStreaks';
import { last24h, last7d, last28d } from '../lib/dates';
import { calcStandards, roundStandards, formatStandards } from '../lib/standards';
import { sumStandards, countDrinkingDays, levelFor } from '../lib/stats';
import { LimitBar } from './LimitBar';
import { AddDrinkForm, type NewDrink } from './AddDrinkForm';
import { DrinkList } from './DrinkList';

export function LogTab() {
  const now = useNow();
  const window24h = last24h(now);
  const window7d = last7d(now);
  const window28d = last28d(now);

  const settings = useSettings();
  const presets = usePresets();
  const streaks = useStreaks(now);
  const last24hDrinks = useDrinksInRange(window24h.start, window24h.end);
  const last7dDrinks = useDrinksInRange(window7d.start, window7d.end);
  const last28dDrinks = useDrinksInRange(window28d.start, window28d.end);

  const addDrink = useAddDrink();
  const deleteDrink = useDeleteDrink();

  const total24h = sumStandards(last24hDrinks);
  const total7d = sumStandards(last7dDrinks);
  const drinkingDays7d = countDrinkingDays(last7dDrinks);
  const drinkingDays28d = countDrinkingDays(last28dDrinks);

  const breaches = [
    levelFor(total24h, settings.dailyStandardsLimit) === 'over' && 'your last-24-hour standard drinks limit',
    levelFor(total7d, settings.weeklyStandardsLimit) === 'over' && 'your last-7-day standard drinks limit',
    levelFor(drinkingDays7d, settings.weeklyDrinkingDaysLimit) === 'over' &&
      'your last-7-day drinking-days limit',
    levelFor(drinkingDays28d, settings.monthlyDrinkingDaysLimit) === 'over' &&
      'your last-28-day drinking-days limit',
  ].filter(Boolean) as string[];

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
          label="Last 24 hours"
          value={roundStandards(total24h)}
          limit={settings.dailyStandardsLimit}
          formatValue={formatStandards}
          suffix="standards"
          streakDays={streaks.daily}
        />
        <LimitBar
          label="Last 7 days"
          value={roundStandards(total7d)}
          limit={settings.weeklyStandardsLimit}
          formatValue={formatStandards}
          suffix="standards"
          streakDays={streaks.weeklyStandards}
        />
        <LimitBar
          label="Drinking days (7d)"
          value={drinkingDays7d}
          limit={settings.weeklyDrinkingDaysLimit}
          suffix="days"
          streakDays={streaks.weeklyDrinkingDays}
        />
        <LimitBar
          label="Drinking days (28d)"
          value={drinkingDays28d}
          limit={settings.monthlyDrinkingDaysLimit}
          suffix="days"
          streakDays={streaks.monthlyDrinkingDays}
        />
      </section>

      <section>
        <div style={{ height: '100px' }}/>
      </section>
      <hr className="border-slate-800" />

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Add a drink</h2>
        <AddDrinkForm presets={presets} targetDay={now} showTimePicker={false} onAdd={handleAdd} />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Last 24 hours ({last24hDrinks.length})
        </h2>
        <DrinkList
          drinks={last24hDrinks}
          onDelete={deleteDrink}
          emptyText="Nothing logged in the last 24 hours."
          showDate
        />
      </section>
    </div>
  );
}
