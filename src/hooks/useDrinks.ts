import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { DrinkEntry } from '../types';

/** Live list of drinks with timestamp in [startMs, endMs], oldest first. */
export function useDrinksInRange(startMs: number, endMs: number): DrinkEntry[] {
  return (
    useLiveQuery(
      () => db.drinks.where('timestamp').between(startMs, endMs, true, true).sortBy('timestamp'),
      [startMs, endMs],
    ) ?? []
  );
}

export function useAddDrink() {
  return async (entry: Omit<DrinkEntry, 'id'>) => {
    await db.drinks.add(entry);
  };
}

export function useDeleteDrink() {
  return async (id: number) => {
    await db.drinks.delete(id);
  };
}
