import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { DEFAULT_SETTINGS, type Settings } from '../types';

/** Live settings, falling back to defaults until the seeded row loads. */
export function useSettings(): Settings {
  const settings = useLiveQuery(() => db.settings.get(1), []);
  return settings ?? DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  const current = (await db.settings.get(1)) ?? DEFAULT_SETTINGS;
  await db.settings.put({ ...current, ...patch, id: 1 });
}
