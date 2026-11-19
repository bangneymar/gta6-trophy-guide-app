# gta6-trophy-guide-app

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bangneymar/gta6-trophy-guide-app/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bangneymar/gta6-trophy-guide-app/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Offline GTA 6 trophy guide and tracker for all 55 PS5 trophies — checklist with localStorage progress, a roadmap to Platinum, spoiler-safe mode, filters, search, and progress export/import. No network requests at runtime; all files are local.

## What's inside

- **All 55 trophies** — official names, descriptions and grades as published by PlayStation (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), each with a guide in our own words that cites its sources.
- **Tracker** — tick trophies off as you earn them; progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Roadmap to the Platinum** — five stages in order, from the story chapters through collectibles and activities to 100% completion.
- **Missable flags** — trophies you can miss are flagged in the list and warned about in the detail panel, so you can plan around them.
- **Spoiler-safe mode** — hides story trophy names and descriptions until you earn them.
- **Filters & search** — by kind (story, missable, collectibles, activities, 100% & Platinum), grade, earned status, and free-text search (press `/` to jump to search).
- **Fully offline** — static files under `app/`; nothing is fetched from the network at run time.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.

## How the guide is built

`app/data/trophies.json` holds the official list and the guides. `app/app.js` loads it and wires the tracker; `app/state.js` handles saved progress and export/import; `app/filters.js` handles filtering, search and spoiler-hiding; `app/render.js` draws the progress header, roadmap, checklist and detail panel. `main.ts` is the make.fun entry program: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=98gtqxkh&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
