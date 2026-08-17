import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useSettings, updateSettings } from '../hooks/useSettings';
import { calcStandards, formatStandards } from '../lib/standards';
import type { Settings } from '../types';

function NumberField({
  label,
  value,
  onCommit,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
  step?: number;
  suffix: string;
}) {
  const [local, setLocal] = useState(String(value));

  // `value` starts out as DEFAULT_SETTINGS (a placeholder) and is replaced moments later once the
  // real settings row loads from IndexedDB — resync so the field doesn't get stuck showing the
  // placeholder that happened to be there on first render.
  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  function commit() {
    const n = parseFloat(local);
    if (Number.isFinite(n) && n >= 0) {
      onCommit(n);
    } else {
      setLocal(String(value));
    }
  }

  return (
    <label className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-right text-slate-100 focus:border-brand focus:outline-none"
        />
        <span className="w-14 text-xs text-slate-500">{suffix}</span>
      </span>
    </label>
  );
}

function LimitsSection() {
  const settings = useSettings();

  function set(patch: Partial<Omit<Settings, 'id'>>) {
    updateSettings(patch);
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Limits</h2>
      <p className="mb-2 text-xs text-slate-500">
        Australia's alcohol guidelines suggest no more than 4 standard drinks in any 24 hours and no
        more than 10 in any 7 days, to reduce lifetime health risk. These are guides, not rules — set
        what's right for you. All of these track on a rolling basis (e.g. "last 24 hours"), not
        calendar days/weeks/months.
      </p>
      <div className="divide-y divide-slate-800">
        <NumberField
          label="Standard drinks per 24h"
          value={settings.dailyStandardsLimit}
          step={0.5}
          suffix="standards"
          onCommit={(n) => set({ dailyStandardsLimit: n })}
        />
        <NumberField
          label="Standard drinks per 7d"
          value={settings.weeklyStandardsLimit}
          step={0.5}
          suffix="standards"
          onCommit={(n) => set({ weeklyStandardsLimit: n })}
        />
        <NumberField
          label="Drinking days per 7d"
          value={settings.weeklyDrinkingDaysLimit}
          step={1}
          suffix="days"
          onCommit={(n) => set({ weeklyDrinkingDaysLimit: n })}
        />
        <NumberField
          label="Drinking days per 30d"
          value={settings.monthlyDrinkingDaysLimit}
          step={1}
          suffix="days"
          onCommit={(n) => set({ monthlyDrinkingDaysLimit: n })}
        />
      </div>
    </section>
  );
}

function PresetForm({ onAdd }: { onAdd: (label: string, volumeMl: number, abvPercent: number) => void }) {
  const [label, setLabel] = useState('');
  const [volume, setVolume] = useState('');
  const [abv, setAbv] = useState('');

  const volumeMl = parseFloat(volume);
  const abvPercent = parseFloat(abv);
  const canAdd = label.trim().length > 0 && volumeMl > 0 && abvPercent > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(label.trim(), volumeMl, abvPercent);
    setLabel('');
    setVolume('');
    setAbv('');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-slate-800 pt-3">
      <input
        type="text"
        placeholder="Preset name, e.g. Pint of lager"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-brand focus:outline-none"
      />
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          placeholder="mL"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-brand focus:outline-none"
        />
        <input
          type="number"
          inputMode="decimal"
          placeholder="ABV %"
          value={abv}
          onChange={(e) => setAbv(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canAdd}
          className="shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </form>
  );
}

function PresetsSection() {
  const presets = useLiveQuery(() => db.presets.toArray(), []) ?? [];

  async function addPreset(label: string, volumeMl: number, abvPercent: number) {
    await db.presets.add({ label, volumeMl, abvPercent });
  }

  async function deletePreset(id?: number) {
    if (id === undefined) return;
    await db.presets.delete(id);
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Quick-add presets
      </h2>
      <ul className="divide-y divide-slate-800">
        {presets.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-200">{p.label}</p>
              <p className="text-xs text-slate-500">
                {p.volumeMl}mL @ {p.abvPercent}% · {formatStandards(calcStandards(p.volumeMl, p.abvPercent))}{' '}
                standards
              </p>
            </div>
            <button
              type="button"
              onClick={() => deletePreset(p.id)}
              className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
              aria-label={`Remove ${p.label}`}
            >
              ✕
            </button>
          </li>
        ))}
        {presets.length === 0 && <li className="py-2 text-sm text-slate-500">No presets yet.</li>}
      </ul>
      <PresetForm onAdd={addPreset} />
    </section>
  );
}

function DataSection() {
  const [confirming, setConfirming] = useState(false);

  async function exportData() {
    const [drinks, settings, presets] = await Promise.all([
      db.drinks.toArray(),
      db.settings.toArray(),
      db.presets.toArray(),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      drinks,
      settings,
      presets,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tally-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function clearAll() {
    await db.drinks.clear();
    setConfirming(false);
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Your data</h2>
      <p className="mb-3 text-xs text-slate-500">
        Everything stays on this device — nothing is sent anywhere. Export a backup any time.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={exportData}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-brand hover:text-brand"
        >
          Export all data (JSON)
        </button>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-rose-900/60 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-950/40"
          >
            Clear drink history
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              Confirm delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function SettingsTab() {
  return (
    <div className="mx-auto max-w-md space-y-5 px-4 pb-24 pt-6">
      <header>
        <p className="text-sm text-slate-400">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-100">Configure Tally</h1>
      </header>
      <LimitsSection />
      <PresetsSection />
      <DataSection />
    </div>
  );
}
