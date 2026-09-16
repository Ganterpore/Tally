import { useEffect, useRef, useState } from 'react';

const FLIP_DURATION_MS = 260;

interface RotatingHeaderProps {
  /** Identifies which stat is showing. The flip animation only fires when this changes — a value
   * ticking under the same stat (e.g. "3 hours" becoming "4 hours") updates silently. */
  statKey: string | undefined;
  text: string;
}

/**
 * The Log page's big header line. Flips like a clock-turnover card whenever the app rotates to a
 * different stat, revealing the new text underneath as the old one falls away.
 */
export function RotatingHeader({ statKey, text }: RotatingHeaderProps) {
  const [current, setCurrent] = useState(text);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const prevKeyRef = useRef(statKey);

  useEffect(() => {
    if (statKey === prevKeyRef.current) {
      setCurrent(text);
      return;
    }
    prevKeyRef.current = statKey;
    setOutgoing(current);
    setCurrent(text);
    const id = setTimeout(() => setOutgoing(null), FLIP_DURATION_MS);
    return () => clearTimeout(id);
    // `current` is deliberately excluded: we want the value from just before this change, which
    // is exactly what the closure captures the moment statKey/text actually change.
  }, [statKey, text]);

  return (
    <div className="relative [perspective:400px]">
      <h1 className="text-2xl font-semibold text-slate-100">{current}</h1>
      {outgoing !== null && (
        <h1
          aria-hidden
          className="absolute inset-0 origin-top animate-flip-down bg-slate-950 text-2xl font-semibold text-slate-100 [backface-visibility:hidden]"
        >
          {outgoing}
        </h1>
      )}
    </div>
  );
}
