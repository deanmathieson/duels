import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { allCards, allTreasures, enemies, heroPowers, heroes } from '../data/registry'
import type { CardClass, CardDef } from '../game/types'

/**
 * Emit scripts/art-prompts.json: one AI image-generation prompt per content id,
 * in the Hollowmoor style. Feed these to any image model in batches; drop the
 * results into public/assets/{cards,heroes,treasures}/<id>.jpg and run
 * `npm run build-art-manifest` to wire them up. Cards without art fall back to
 * the styled class-gradient placeholder, so partial batches are always safe.
 *
 * Prompt order is deliberate: the STYLE anchor is FRONT-loaded because CLIP
 * (SDXL's text encoder) truncates at 77 tokens — anything past that is ignored.
 * Style first → every image renders in the same illustrated look; the subject
 * and per-class mood fill the remaining budget. Card flavor text is omitted
 * from prompts on purpose: it ate tokens and pulled results toward literal,
 * photographic scenes.
 *
 * Run with: npm run gen-art-prompts
 */

/**
 * The shared Hollowmoor style anchor (front-loaded, compact). Hard-leans
 * PAINTED, not photographic — Frank Frazetta pulp-fantasy oil register:
 * dramatic chiaroscuro, rich warm shadows, visceral dark-heroic mood.
 */
const STYLE =
  'oil painting in the style of Frank Frazetta, pulp fantasy art, ' +
  'dramatic chiaroscuro, rich warm shadows, painterly brushwork, ' +
  'dark heroic folk-horror, moody and visceral'

/** Per-class palette/mood accents — short, so they survive the token budget. */
const CLASS_MOOD: Record<CardClass, string> = {
  neutral: 'village folk, lantern light',
  druid: 'hedgewitch greens, briar and mandrake',
  hunter: 'poacher browns, snares and hounds, misty moor',
  mage: 'midnight blues, falling stars and frost',
  paladin: 'wax-yellow lantern glow, candle processions',
  priest: 'incense gloom, crooked parish church',
  rogue: 'tavern-backroom shadows, knives and silver',
  shaman: 'bog greens and storm greys, carved effigies',
  warlock: 'fae-court purples, crossroads contract dread',
  warrior: 'rusting plate, ragged banners, alehouse brawn',
}

interface PromptEntry {
  id: string
  kind: 'card' | 'hero' | 'heroPower' | 'treasure' | 'enemy'
  name: string
  prompt: string
}

function cardSubject(c: CardDef): string {
  if (c.type === 'minion') {
    const tribe = c.tribe && c.tribe !== 'none' ? ` ${c.tribe}` : ''
    return `a${tribe} character named "${c.name}"`
  }
  if (c.type === 'weapon') return `the weapon "${c.name}"`
  return `the spell "${c.name}"`
}

const prompts: PromptEntry[] = []

for (const c of allCards) {
  prompts.push({
    id: c.id,
    kind: 'card',
    name: c.name,
    prompt: `${STYLE}. ${cardSubject(c)}. ${CLASS_MOOD[c.cardClass] ?? CLASS_MOOD.neutral}`,
  })
}
for (const h of heroes) {
  prompts.push({
    id: h.id,
    kind: 'hero',
    name: h.name,
    prompt: `${STYLE}. waist-up portrait of "${h.name}", imposing. ${CLASS_MOOD[h.cardClass] ?? CLASS_MOOD.neutral}`,
  })
}
for (const hp of heroPowers) {
  prompts.push({
    id: hp.id,
    kind: 'heroPower',
    name: hp.name,
    prompt: `${STYLE}. small circular emblem of "${hp.name}"`,
  })
}
for (const t of allTreasures) {
  prompts.push({
    id: t.id,
    kind: 'treasure',
    name: t.name,
    prompt: `${STYLE}. a legendary relic, "${t.name}", on dark velvet`,
  })
}
for (const e of enemies) {
  prompts.push({
    id: e.id,
    kind: 'enemy',
    name: e.name,
    prompt: `${STYLE}. menacing villain portrait of ${e.heroName}, "${e.name}". ${CLASS_MOOD[e.heroClass] ?? CLASS_MOOD.neutral}`,
  })
}

const outPath = fileURLToPath(new URL('./art-prompts.json', import.meta.url))
writeFileSync(outPath, JSON.stringify({ style: STYLE, prompts }, null, 2))
console.log(`Wrote ${prompts.length} prompts to ${outPath}`)
console.log('Priority order: heroes -> enemies -> treasures -> heroPowers -> cards.')
