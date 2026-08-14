import Dexie, { type EntityTable } from 'dexie';
import type { DrinkEntry, Preset, Settings } from '../types';
import { DEFAULT_PRESETS, DEFAULT_SETTINGS } from '../types';

class TallyDB extends Dexie {
  drinks!: EntityTable<DrinkEntry, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  presets!: EntityTable<Preset, 'id'>;

  constructor() {
    super('tally-db');
    this.version(1).stores({
      drinks: '++id, timestamp',
      settings: 'id',
      presets: '++id',
    });
  }
}

export const db = new TallyDB();

/** Seed the settings row and default presets the first time the app runs. Safe to call repeatedly. */
export async function seedDefaults(): Promise<void> {
  await db.transaction('rw', db.settings, db.presets, async () => {
    const existingSettings = await db.settings.get(1);
    if (!existingSettings) {
      await db.settings.put(DEFAULT_SETTINGS);
    }

    const presetCount = await db.presets.count();
    if (presetCount === 0) {
      await db.presets.bulkAdd(DEFAULT_PRESETS);
    }
  });
}
