import { applyArtManifest, initializeContent } from '~/data/registry'

/**
 * Startup plugin (client-only): register all cards / hero powers / treasures with
 * the engine, then patch downloaded art paths (prefixed with the app base URL so
 * they resolve under a GitHub Pages sub-path). Art is cosmetic — failures ignored.
 */
export default defineNuxtPlugin(async () => {
  initializeContent()

  try {
    const base = (useRuntimeConfig().app.baseURL || '/').replace(/\/$/, '')
    const data = await $fetch<{ manifest?: Record<string, string> }>(
      `${base}/assets/art-manifest.json`
    )
    if (data?.manifest) {
      const prefixed: Record<string, string> = {}
      for (const [id, path] of Object.entries(data.manifest)) {
        prefixed[id] = base + path // path begins with '/assets/...'
      }
      applyArtManifest(prefixed)
    }
  } catch {
    // Art manifest is optional; the UI falls back to styled placeholders.
  }
})
