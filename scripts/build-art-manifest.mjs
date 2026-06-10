/**
 * build-art-manifest.mjs — scan public/assets/{cards,heroes,treasures} for
 * image files (any of .jpg/.jpeg/.png/.webp) and rebuild
 * public/assets/art-manifest.json as { manifest: { id -> '/assets/...' } }.
 *
 * The manifest format is the stable contract consumed by
 * plugins/content.client.ts — drop generated art in, run this, done.
 * Ids without an image simply fall back to the styled placeholder frame.
 *
 * Usage: node scripts/build-art-manifest.mjs
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ASSETS = resolve(ROOT, 'public', 'assets')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const FOLDERS = ['cards', 'heroes', 'treasures']

const manifest = {}
let count = 0
for (const folder of FOLDERS) {
  const dir = resolve(ASSETS, folder)
  if (!existsSync(dir)) continue
  for (const file of readdirSync(dir)) {
    const ext = extname(file).toLowerCase()
    if (!IMAGE_EXTS.has(ext)) continue
    const id = basename(file, ext)
    manifest[id] = `/assets/${folder}/${file}`
    count++
  }
}

const outPath = resolve(ASSETS, 'art-manifest.json')
writeFileSync(outPath, JSON.stringify({ manifest }, null, 2))
console.log(`Wrote ${count} art entries to ${outPath}`)
