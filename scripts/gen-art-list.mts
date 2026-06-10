import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { allCards, heroes, heroPowers, allTreasures } from '../data/registry'

/**
 * Emit scripts/art-list.json (id -> display name + hero/treasure id hints) so
 * scripts/scrape-art.mjs can fetch art for EVERY card/hero/treasure across all
 * classes. Run with: npm run gen-art-list   (then: npm run scrape-art)
 */
const names: Record<string, string> = {}
for (const c of allCards) names[c.id] = c.name
for (const hp of heroPowers) names[hp.id] = hp.name
for (const h of heroes) names[h.id] = h.name
for (const t of allTreasures) names[t.id] = t.name // treasure name wins for tr_/sig_ ids

const data = {
  names,
  heroIds: heroes.map((h) => h.id),
  treasureIds: allTreasures.map((t) => t.id),
}

const outPath = fileURLToPath(new URL('./art-list.json', import.meta.url))
writeFileSync(outPath, JSON.stringify(data, null, 2))
console.log(`Wrote ${Object.keys(names).length} ids to ${outPath}`)
