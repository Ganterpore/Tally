import { format } from 'date-fns';
import type { DrinkEntry } from '../types';
import { formatStandards } from '../lib/standards';

interface DrinkListProps {
  drinks: DrinkEntry[];
  onDelete: (id: number) => void;
  emptyText?: string;
}

export function DrinkList({ drinks, onDelete, emptyText = 'Nothing logged yet.' }: DrinkListProps) {
  if (drinks.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-500">{emptyText}</p>;
  }

  // Most recent first.
  const sorted = [...drinks].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <ul className="divide-y divide-slate-800">
      {sorted.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-200">
              {d.label || `${d.volumeMl}mL @ ${d.abvPercent}%`}
            </p>
            <p className="text-xs text-slate-500">
              {format(d.timestamp, 'h:mm a')} · {d.volumeMl}mL @ {d.abvPercent}%
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-300">
            {formatStandards(d.standards)}
          </span>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => d.id !== undefined && onDelete(d.id)}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
