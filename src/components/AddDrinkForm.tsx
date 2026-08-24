import { useState } from 'react';
import { calcStandards, formatStandards } from '../lib/standards';
import type { Preset } from '../types';

export interface NewDrink {
  volumeMl: number;
  abvPercent: number;
  label?: string;
  timestamp: number;
}

interface AddDrinkFormProps {
  presets: Preset[];
  /** The calendar day this entry should be attributed to. */
  targetDay: Date;
  /** Show an explicit time-of-day picker (for backdating); otherwise every add uses "now". */
  showTimePicker: boolean;
  onAdd: (entry: NewDrink) => void;
}

function timeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function combineDayAndTime(day: Date, time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(day);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined.getTime();
}

export function AddDrinkForm({ presets, targetDay, showTimePicker, onAdd }: AddDrinkFormProps) {
  const [time, setTime] = useState(() => timeString(new Date()));
  const [volume, setVolume] = useState('');
  const [abv, setAbv] = useState('');
  const [label, setLabel] = useState('');

  function timestampNow(): number {
    return showTimePicker ? combineDayAndTime(targetDay, time) : Date.now();
  }

  function addPreset(p: Preset) {
    onAdd({ volumeMl: p.volumeMl, abvPercent: p.abvPercent, label: p.label, timestamp: timestampNow() });
  }

  const volumeMl = parseFloat(volume);
  const abvPercent = parseFloat(abv);
  const preview = calcStandards(volumeMl, abvPercent);
  const canAdd = volumeMl > 0 && abvPercent > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd({ volumeMl, abvPercent, label: label.trim() || undefined, timestamp: timestampNow() });
    setVolume('');
    setAbv('');
    setLabel('');
  }

  return (
    <div className="space-y-3">
      {showTimePicker && (
        <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <span className="text-sm text-slate-300">
            Time on {targetDay.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
          </span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 focus:border-brand focus:outline-none"
          />
        </label>
      )}

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addPreset(p)}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-brand hover:text-brand"
            >
              {p.label} <i className="text-slate-500">({p.volumeMl}ml, {p.abvPercent}%)</i>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-400">Volume (mL)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              placeholder="375"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-brand focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-400">ABV (%)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              placeholder="4.8"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-brand focus:outline-none"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-400">Label (optional)</span>
          <input
            type="text"
            placeholder="e.g. Pint at the pub"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-600 focus:border-brand focus:outline-none"
          />
        </label>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-slate-400">
            {canAdd ? (
              <>
                ≈ <span className="font-semibold text-slate-200">{formatStandards(preview)}</span> standard
                drinks
              </>
            ) : (
              'Enter volume and ABV'
            )}
          </span>
          <button
            type="submit"
            disabled={!canAdd}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add drink
          </button>
        </div>
      </form>
    </div>
  );
}
