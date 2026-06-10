import { defineConfig } from 'vitest/config'

// Engine tests are pure TypeScript and import from /game and /data with
// relative paths — no Nuxt/Vue needed. happy-dom is available for any
// component tests added later.
export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.spec.ts']
  }
})
