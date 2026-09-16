import { useCallback, useEffect, useState } from 'react';

export interface UseNowResult {
  now: Date;
  /**
   * Force an immediate refresh. Rolling windows (last 24h/7d/28d) end at `now`, so a drink written
   * with `Date.now()` a moment after mount can land just past that stale boundary and silently
   * drop out of every "last N" total until the next periodic tick. Call this right after writing
   * a "now"-timestamped drink so the windows immediately widen to include it.
   */
  refreshNow: () => void;
}

/**
 * A Date that ticks forward periodically, so rolling windows (last 24h/7d/28d) stay accurate
 * while the app is left open rather than freezing at whenever it happened to mount.
 */
export function useNow(intervalMs = 60_000): UseNowResult {
  const [now, setNow] = useState(() => new Date());
  const refreshNow = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const id = setInterval(refreshNow, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refreshNow]);

  return { now, refreshNow };
}
