import { useEffect, useState } from 'react';

/**
 * A Date that ticks forward periodically, so rolling windows (last 24h/7d/30d) stay accurate
 * while the app is left open rather than freezing at whenever it happened to mount.
 */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
