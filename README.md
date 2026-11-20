# GTA 6 Trophy Guide — Leonida Checklist

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/zalana28/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/zalana28/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, a guide in our own words with cited sources for each trophy, a six-stage roadmap to the platinum, missable-trophy flags built from the official descriptions, and a checklist that saves in the browser with export and import. A spoiler-safe mode hides story trophies until they are earned.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network needed — the app is static files under `app/` and works with the network off.

## What's inside

- `app/index.html` — the single page: checklist, roadmap and missable views.
- `app/app.js` — rendering and state.
- `app/filters.js` — search and filter logic (grade, kind, missable, hidden, earned).
- `app/storage.js` — localStorage progress plus JSON export/import.
- `app/roadmap.js` — the six roadmap stages to the platinum.
- `app/style.css` — the dark "Leonida nights" look, system fonts only.
- `app/data/trophies.json` — all 55 trophies with guides, sources, kind, missable and hidden flags, and roadmap stage.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `screenshots/` — real renders of the app.

## Notes

- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; no online trophies. One playthrough is enough, about 200 hours.
- Only one trophy may be missable (Positive Mental Attitude — meditate at every spot, including a one-time Chapter 1 moment). Five trophies were still unconfirmed when this was written (20 November 2026) and their guides say so instead of guessing.
- Unofficial fan guide, not affiliated with Rockstar Games. No official artwork or logos are used.
