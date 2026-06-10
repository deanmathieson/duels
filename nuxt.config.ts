// Nuxt config — static-generated (prerendered + hydrated) for GitHub Pages.
// The game is fully client-side once booted; the pure engine in /game has no Nuxt deps.
//
// SSR strategy:
//  - `nuxt dev`: builder SSR stays ON (a top-level `ssr:false` triggers a dev-server
//    "No entry found in rollupOptions.input" crash with this Nuxt + Vite combo), but
//    every route renders client-only via routeRules so dev behaves like the SPA.
//  - `nuxt generate`: SSR ON with no client-only routeRules, so Nitro prerenders a
//    REAL HTML shell for each route (which then hydrates). A pure SPA build
//    (`ssr:false`) instead emits useless 16-byte "Redirecting…" stub pages here,
//    which break static hosting. Prerendering also makes deep links / hard refreshes
//    (e.g. /duels/run) resolve to a real file on GitHub Pages.
// Detected via process.argv (reliable at config-load time, unlike NODE_ENV).
const isSpaBuild = process.argv.includes('generate') || process.argv.includes('build')
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  ssr: true,
  routeRules: isSpaBuild ? {} : { '/**': { ssr: false } },

  // When deploying under a sub-path (baseURL = '/duels/'), the prerender crawler
  // starts at '/', which only redirects to the base — so the real app shell never
  // gets written. List the base-prefixed routes explicitly so Nitro prerenders a
  // real, hydratable HTML file for each (entry + deep-link refresh targets).
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [baseURL, `${baseURL}run`].map((p) => p.replace(/\/{2,}/g, '/')),
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // Auto-import components by BARE filename (no directory prefix), so a component
  // in components/board/GameBoard.vue is usable as <GameBoard/> everywhere.
  // All component filenames in this project are unique, so collisions can't occur.
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],

  // GitHub Pages serves a project site under a sub-path. The deploy workflow
  // sets NUXT_APP_BASE_URL=/hearthstone-duels/. Defaults to '/' for local dev.
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'Duels — A Hearthstone Roguelike',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'A roguelike deckbuilder card game inspired by Hearthstone Duels. Fan project, not affiliated with Blizzard.'
        }
      ],
      htmlAttrs: { lang: 'en' }
    }
  },

  // Auto-import Pinia stores from /stores.
  pinia: { storesDirs: ['./stores/**'] }
})
