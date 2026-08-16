/** A single logged drink. */
export interface DrinkEntry {
  id?: number;
  /** Epoch milliseconds when the drink was (or is recorded as being) consumed. */
  timestamp: number;
  volumeMl: number;
  abvPercent: number;
  /** Standard drinks, precomputed at write time so history stays stable if the formula ever changes. */
  standards: number;
  /** Optional free-text label, e.g. "Schooner of XPA". */
  label?: string;
}

/** Singleton row (id is always 1) holding the user's configured limits. */
export interface Settings {
  id: 1;
  dailyStandardsLimit: number;
  weeklyStandardsLimit: number;
  weeklyDrinkingDaysLimit: number;
  monthlyDrinkingDaysLimit: number;
  /** When tracking started, in epoch ms — the floor for streak calculations (we have no data before this). */
  createdAt: number;
}

/** A quick-add shortcut for a common drink. */
export interface Preset {
  id?: number;
  label: string;
  volumeMl: number;
  abvPercent: number;
}

/** Fallback shown only before the real settings row has loaded from the DB. */
export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  dailyStandardsLimit: 4,
  weeklyStandardsLimit: 10,
  weeklyDrinkingDaysLimit: 7,
  monthlyDrinkingDaysLimit: 31,
  createdAt: Date.now(),
};

export const DEFAULT_PRESETS: Omit<Preset, 'id'>[] = [
  { label: 'Full-strength beer (375mL can, 4.8%)', volumeMl: 375, abvPercent: 4.8 },
  { label: 'Mid-strength beer (375mL can, 3.5%)', volumeMl: 375, abvPercent: 3.5 },
  { label: 'Glass of wine (150mL, 13%)', volumeMl: 150, abvPercent: 13 },
  { label: 'Spirit nip (30mL, 40%)', volumeMl: 30, abvPercent: 40 },
  { label: 'Glass of champagne (150mL, 12%)', volumeMl: 150, abvPercent: 12 },
];
