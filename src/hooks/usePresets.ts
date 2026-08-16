import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Preset } from '../types';

export function usePresets(): Preset[] {
  return useLiveQuery(() => db.presets.toArray(), []) ?? [];
}
