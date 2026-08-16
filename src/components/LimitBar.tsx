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
  /** Consecutive days (ending today) this limit has stayed under — shown only when > 0. */
  streakDays?: number;
}

export function LimitBar({ label, value, limit, formatValue, suffix, streakDays }: LimitBarProps) {
  const level = levelFor(value, limit);
  const pct = limit > 0 ? Math.min(100, (value / limit) * 100) : 0;
  const fmt = formatValue ?? ((n: number) => n.toString());

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-300">
          {label}
          {!!streakDays && streakDays > 0 && (
            <span
              className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400"
              title={`${streakDays} day${streakDays === 1 ? '' : 's'} in a row under this limit`}
            >
              🔥 {streakDays} day{streakDays === 1 ? '' : 's'}
            </span>
          )}
        </span>
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
