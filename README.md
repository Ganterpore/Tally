# Tally — Standard Drinks Tracker

A local-first Progressive Web App for tracking Australian standard drinks. Log a
drink's volume (mL) and ABV (%), and Tally works out how many standard drinks
that is, tracks it against limits you set, and keeps a history — all fully
offline, with your data staying on your device.

## Features

- **Log drinks** by volume + ABV, or one tap on a quick-add preset (beer,
  wine, spirits — fully customisable).
- **Australian standard drink formula**: `standards = (mL / 1000) × ABV% × 0.789`.
- **Limits** you configure yourself:
  - Daily standard drinks
  - Weekly standard drinks
  - Drinking days per week
  - Drinking days per month
- Soft warnings (progress bars turn amber near a limit, red over it) —
  nothing is ever blocked.
- **Calendar history** with a colour-coded dot per day, week/month rollups.
- **Local-first storage** via [Dexie](https://dexie.org/) (IndexedDB) —
  works offline, no account, no server, no network calls.
- **Installable PWA** (add to home screen on iOS/Android, or install on
  desktop) via `vite-plugin-pwa`.
- Export your data as JSON any time from Settings.

## Stack

- React + TypeScript + Vite
- Dexie / `dexie-react-hooks` for a reactive local IndexedDB database
- Tailwind CSS
- `vite-plugin-pwa` (Workbox) for the service worker + manifest
- `date-fns` for date/week/month arithmetic

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` type-checks with `tsc -b` and outputs a production build
(including the service worker) to `dist/`.

## Data model

Three Dexie tables in the `tally-db` database:

- `drinks` — every logged entry (`timestamp`, `volumeMl`, `abvPercent`,
  precomputed `standards`, optional `label`)
- `settings` — a single row holding your four limits
- `presets` — your quick-add shortcuts

Nothing leaves the device; there is no backend.
