# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bangneymar/gta6-trophy-guide-app/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bangneymar/gta6-trophy-guide-app/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze) — checklist with localStorage progress, a platinum roadmap, spoiler-safe mode, filters, search, and progress export/import. No network requests at runtime; every file is local.

## What's inside

- **Checklist** — every trophy with its official name, grade and description, plus a guide in the author's own words with its sources named beside it. Tick trophies off as you earn them; progress stays in your browser.
- **Platinum roadmap** — four phases from the story (60–80 hours) to 100% completion (about 100 hours) and the Strangers &amp; Freaks cleanup, with live progress per phase and a Next up list.
- **Missable flag** — Positive Mental Attitude is the only trophy that can be missed (the Chapter 1 balcony meditation). It is flagged everywhere and warned about up front, because the game has no mission replay.
- **Spoiler-safe mode** — hides story trophies until you earn them, so the guide never spoils the campaign.
- **Filters &amp; search** — by grade, by kind (story / missable / collectibles / activities / online), by remaining, and by free text across names, descriptions and guides.
- **Export / import** — save your progress as JSON and restore it later.

## How the guide is built

Each guide was written for this entry from the cited sources (KeenGamer's trophy guide, PowerPyx, Exophase/PSNProfiles via Planet GTA 6, Output Lag). Facts that could not be verified at launch — a handful of hidden trophies whose exact trigger is still being confirmed — are marked **BELUM TERKONFIRMASI** in the guide instead of guessed. Estimated platinum time is about 200 hours at difficulty 4/10, all offline, in a single playthrough.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=98gtqxkh&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
