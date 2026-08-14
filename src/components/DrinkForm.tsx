import { useState } from 'react';
import { calcStandards, formatStandards } from '../lib/standards';

interface DrinkFormProps {
  onAdd: (volumeMl: number, abvPercent: number, label?: string) => void;
}

export function DrinkForm({ onAdd }: DrinkFormProps) {
  const [volume, setVolume] = useState('');
  const [abv, setAbv] = useState('');
  const [label, setLabel] = useState('');

  const volumeMl = parseFloat(volume);
  const abvPercent = parseFloat(abv);
  const preview = calcStandards(volumeMl, abvPercent);
  const canAdd = volumeMl > 0 && abvPercent > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(volumeMl, abvPercent, label.trim() || undefined);
    setVolume('');
    setAbv('');
    setLabel('');
  }

  return (
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
  );
}
