import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Engine tests are pure TypeScript and import from /game and /data with
// relative paths — no Nuxt/Vue needed. The `~` alias mirrors Nuxt's so store
// modules (stores/run.ts) can be imported by tests too. happy-dom is available
// for any component tests added later.
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.spec.ts']
  }
})
