import { useEffect, useMemo, useState } from 'react';
import { pickRandomStatKey } from '../lib/rotatingStats';

/**
 * Picks a random key from `keysSignature` (a comma-joined list, so the effect deps stay stable
 * across renders that don't actually change the available set) on mount and every `intervalMs`
 * after that, favouring a different key than the current one when more than one is available.
 */
export function useRotatingStatKey(keysSignature: string, intervalMs = 30_000): string | undefined {
  const keys = useMemo(() => keysSignature.split(',').filter(Boolean), [keysSignature]);
  const [selected, setSelected] = useState<string | undefined>(() => pickRandomStatKey(keys));

  useEffect(() => {
    setSelected((prev) => (prev !== undefined && keys.includes(prev) ? prev : pickRandomStatKey(keys)));
  }, [keys]);

  useEffect(() => {
    if (keys.length === 0) return;
    const id = setInterval(() => {
      setSelected((prev) => pickRandomStatKey(keys, prev));
    }, intervalMs);
    return () => clearInterval(id);
  }, [keys, intervalMs]);

  return selected;
}
