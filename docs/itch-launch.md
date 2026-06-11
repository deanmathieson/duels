# HOLLOWMOOR — itch.io launch kit

Everything needed to put the game on itch.io. Creating the page needs the
account owner; this file is the copy-paste kit.

## Page setup (itch.io → Dashboard → Create new project)

- **Title**: HOLLOWMOOR — A Roguelike Card Duel
- **Project URL**: hollowmoor
- **Kind of project**: HTML *(choose "This file will be played in the browser")*
  — OR set Kind to "Web" and point the embed at the live site via an iframe;
  simplest reliable option: upload a zip of the built `.output/public` folder
  (run `npm run generate` with `NUXT_APP_BASE_URL=./` … itch serves from a
  sub-path, so a RELATIVE base build is required: test before upload), or just
  use the "external website" style page linking to https://toast.house/duels/.
- **Pricing**: Free (donations on, if desired)
- **Genre**: Card Game · Tags: `roguelike`, `deckbuilder`, `card-game`,
  `singleplayer`, `dark-fantasy`, `folk-horror`, `browser`, `free`
- **Cover image**: 630×500 — crop `public/og-image.jpg` (The Great Waking art)
- **Screenshots**: deck builder, a mythic treasure offering, the combat board,
  the codex. A 30s GIF of a mythic jackpot reveal makes the best first image.

## Short description (the one-liner)

> Draft a deck, bargain for mythic treasures, and climb to 12 wins before the
> moor keeps you. A free browser roguelike card duel with a new Daily Hunt
> every day.

## Page body (long description)

---

**Every duel is a bargain in the cursed county.**

HOLLOWMOOR is a single-player roguelike deckbuilder duel: pick one of nine
callings — Hedgewitch, Trapper, Banneret, Stargazer and worse company — draft
a 15-card deck, and fight up the 12-win ladder past elites and the moor's
three terrors. Between fights the moor makes offers: card buckets shaped by
what you're building, treasures that warp the run, and — if you're lucky or
unlucky enough — one of seventeen **mythics** that break the game open.

- **Nine callings**, unlocked one run at a time
- **150+ treasures** with synergy-aware offerings — the moor watches your deck
- **17 mythic jackpots**, discovered in play and recorded in your codex
- **The Daily Hunt** — one seeded attempt per day, same moor for everyone,
  with a shareable result
- **The Ledger** — lifetime stats, run history, best climbs
- Original folk-horror setting, fully painted card art, no ads, no accounts,
  free forever — it runs in your browser and saves locally

*Three defeats, and the moor keeps you.*

**Play now:** https://toast.house/duels/

---

## Launch checklist

1. Create the itch page with the copy above; link the live site (or upload a
   relative-base build once tested).
2. Post the page + a GIF to: r/WebGames, r/roguelites ("Feedback Friday"),
   r/incremental_games is NOT a fit; Hacker News "Show HN: Hollowmoor — a
   free browser roguelike card duel".
3. Lead with the Daily Hunt in every post — "today's moor" gives strangers a
   reason to come back tomorrow.
