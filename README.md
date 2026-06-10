# HOLLOWMOOR — A Roguelike Card Duel

An original roguelike deckbuilder set in **Hollowmoor**: a cursed county of crooked woods,
peat bogs and candlelit villages where every duel is a bargain and the dead never stop
talking. Pick one of nine callings (Hedgewitch, Trapper, Stargazer, Lamplighter, Vicar,
Cutpurse, Augur, Bargainer, Banneret), take a hero power and a signature treasure, build a
15-card deck, then fight a seeded 12-fight gauntlet — locals, elites with bonus treasure,
and one of the moor's three terrors at the end. **12 wins or 3 losses.**

The project began as a study of roguelike-deckbuilder run structure and has since grown
into a fully original game: its own world, cards, archetypes (including the **Haunt**
deathrattle economy), and a bawdy folk-horror voice.

## Tech

- **Nuxt 3** (SPA / static) · **Vue 3** `<script setup lang="ts">` · **Pinia** · **Tailwind CSS** · **GSAP**
- The game rules live in **`/game`** as a pure, framework-agnostic, deterministic TypeScript engine
  (`applyAction(state, action) → { state, events }`). The Vue layer only renders state and dispatches
  actions — which keeps the door open for server-authoritative **PvP** later.

## Develop

```bash
npm install
npm run dev                 # http://localhost:3000
npm run test                # engine + content tests (vitest)
npm run gen-art-prompts     # emit per-card AI art prompts (scripts/art-prompts.json)
npm run build-art-manifest  # wire generated images in public/assets into the manifest
npm run generate            # static build for GitHub Pages
```

### Art pipeline

Card art is generated, not bundled: `gen-art-prompts` emits one Hollowmoor-styled prompt
per content id; render them with any image model, drop the results into
`public/assets/{cards,heroes,treasures}/<id>.jpg`, and run `build-art-manifest`. Ids
without an image fall back to the styled placeholder frame, so partial batches are always
safe.

## Deploy (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds the static SPA and publishes it to
GitHub Pages on every push to `main`. To go live:

1. Create a GitHub repo and push this project.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site deploys from `.output/public`.

The workflow builds with `NUXT_APP_BASE_URL=/duels/` for the project-site sub-path — the repo
is named `duels`, so the site serves at `toast.house/duels/` (the user site's custom domain;
project sites are served under it). The prerender route seeding in `nuxt.config.ts` makes
sub-path generation emit real, hydratable HTML shells (entry + `/run` deep link). For a
differently named repo, change the env value to `/<repo>/`; for a root-served site, drop the
env so `baseURL` defaults to `/`.

> SSR note: `nuxt dev` runs with builder SSR on + per-route client rendering (top-level `ssr:false`
> crashes the Vite 7 dev server in this version); `nuxt generate` switches to a true SPA build. This
> is handled automatically in `nuxt.config.ts` via `process.argv` detection.

## Architecture

- `game/types.ts` — the frozen data contract (cards, effects, state, actions).
- `game/` — engine, combat, effect interpreter, AI, run/reward logic.
- `data/` — cards, heroes, treasures, enemies (all expressed as `EffectSpec` data).
- `data/terms.ts` — the Hollowmoor dictionary: every player-facing term in one place.
- `stores/`, `components/`, `pages/` — the Vue/Nuxt presentation layer.
- `tests/original-ip.spec.ts` — regression guard: no third-party IP in any display field.

## License & content

All game content (names, text, flavor, world) is original. Code and content
© the project author.
