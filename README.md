# Duels — A Hearthstone Roguelike

A fan recreation of Hearthstone's retired **Duels** game mode: pick a hero, a hero power and a
signature treasure, build a 15-card deck, then fight a gauntlet of AI opponents. Between fights you
pick card "buckets" and powerful **treasures** until you reach **12 wins or 3 losses**.

This first release focuses on the **Druid** hero **Forest Warden Omu**.

## Tech

- **Nuxt 3** (SPA / static) · **Vue 3** `<script setup lang="ts">` · **Pinia** · **Tailwind CSS** · **GSAP**
- The game rules live in **`/game`** as a pure, framework-agnostic, deterministic TypeScript engine
  (`applyAction(state, action) → { state, events }`). The Vue layer only renders state and dispatches
  actions — which keeps the door open for server-authoritative **PvP** later.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # engine unit tests (vitest)
npm run scrape-art   # download card/hero art into public/assets (run once)
npm run generate     # static build for GitHub Pages
```

## Deploy (GitHub Pages)

A workflow at `.github/workflows/deploy.yml` builds the static SPA and publishes it to
GitHub Pages on every push to `main`. To go live:

1. Create a GitHub repo and push this project.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually). The site deploys from `.output/public`.

The build targets a **root-served** site (`baseURL '/'`), which is fully working. Host it at a
domain root — a user/org Pages site (`<user>.github.io`) or a project repo with a **custom domain**
(add a `public/CNAME`). A bare project sub-path (`<user>.github.io/<repo>/`) needs
`NUXT_APP_BASE_URL=/<repo>/`, but this Nuxt 3.21 + Vite 7 version has a SPA-generate bug with a
non-root `baseURL`, so prefer root / custom-domain hosting.

> SSR note: `nuxt dev` runs with builder SSR on + per-route client rendering (top-level `ssr:false`
> crashes the Vite 7 dev server in this version); `nuxt generate` switches to a true SPA build. This
> is handled automatically in `nuxt.config.ts` via `process.argv` detection.

## Architecture

- `game/types.ts` — the frozen data contract (cards, effects, state, actions).
- `game/` — engine, combat, effect interpreter, AI, run/reward logic.
- `data/` — cards, heroes, treasures, enemies (all expressed as `EffectSpec` data).
- `stores/`, `components/`, `pages/` — the Vue/Nuxt presentation layer.

## Disclaimer

This is a non-commercial **fan project** for personal/educational use. Hearthstone and all related
card names, art and assets are trademarks and copyright of **Blizzard Entertainment**. This project is
**not affiliated with, endorsed by, or sponsored by Blizzard**.
