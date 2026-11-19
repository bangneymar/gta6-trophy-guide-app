# gta6-trophy-guide-app

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bangneymar/gta6-trophy-guide-app/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bangneymar/gta6-trophy-guide-app/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze. Every trophy has its official name and description, a guide written for this entry in its own words with its sources named, a roadmap to the platinum in five stages, and a missable flag (only Positive Mental Attitude can be missed — meditate with Lucia in Chapter 1). The tracker is a checklist saved in the browser with export and import, filters by grade and kind, search, and a spoiler setting that hides story trophies until they are earned. Five hidden trophies are marked unconfirmed because no guide has pinned down their method yet.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the app is plain static files under `app/` and works with the network off.

To hand the guide in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library. It only ever empties the output directory's contents, never the directory itself, so it also runs in the grader's sandbox (read-only repository at `/bot`, writable `/output`).

---

<sub>Entered on [make.fun](https://make.fun/?ref=98gtqxkh&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
