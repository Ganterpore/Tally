import { levelFor, type LimitLevel } from '../lib/stats';

const BAR_COLOR: Record<LimitLevel, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-rose-500',
};

const TEXT_COLOR: Record<LimitLevel, string> = {
  ok: 'text-emerald-400',
  warning: 'text-amber-400',
  over: 'text-rose-400',
};

interface LimitBarProps {
  label: string;
  value: number;
  limit: number;
  /** How to render the numbers, e.g. "1.4" vs "1" for whole-day counts. */
  formatValue?: (n: number) => string;
  suffix?: string;
}

export function LimitBar({ label, value, limit, formatValue, suffix }: LimitBarProps) {
  const level = levelFor(value, limit);
  const pct = limit > 0 ? Math.min(100, (value / limit) * 100) : 0;
  const fmt = formatValue ?? ((n: number) => n.toString());

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={`font-medium tabular-nums ${TEXT_COLOR[level]}`}>
          {fmt(value)} <span className="text-slate-500">/ {fmt(limit)}{suffix ? ` ${suffix}` : ''}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${BAR_COLOR[level]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
