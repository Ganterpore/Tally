import { useCallback, useEffect, useMemo, useState } from 'react';
import { pickRandomStatKey } from '../lib/rotatingStats';

/**
 * Picks a random key from `keysSignature` (a comma-joined list, so the effect deps stay stable
 * across renders that don't actually change the available set) on mount and every `intervalMs`
 * after that, favouring a different key than the current one when more than one is available.
 * `next` steps to the following key in order and restarts the timer, so a manual tap isn't
 * immediately followed by an automatic rotation.
 */
export function useRotatingStatKey(
  keysSignature: string,
  intervalMs = 30_000,
): { selectedKey: string | undefined; next: () => void } {
  const keys = useMemo(() => keysSignature.split(',').filter(Boolean), [keysSignature]);
  const [selected, setSelected] = useState<string | undefined>(() => pickRandomStatKey(keys));
  const [manualTaps, setManualTaps] = useState(0);

  useEffect(() => {
    setSelected((prev) => (prev !== undefined && keys.includes(prev) ? prev : pickRandomStatKey(keys)));
  }, [keys]);

  useEffect(() => {
    if (keys.length === 0) return;
    const id = setInterval(() => {
      setSelected((prev) => pickRandomStatKey(keys, prev));
    }, intervalMs);
    return () => clearInterval(id);
  }, [keys, intervalMs, manualTaps]);

  const next = useCallback(() => {
    setSelected((prev) => {
      if (keys.length === 0) return undefined;
      const i = prev === undefined ? -1 : keys.indexOf(prev);
      return keys[(i + 1) % keys.length];
    });
    setManualTaps((n) => n + 1);
  }, [keys]);

  return { selectedKey: selected, next };
}
