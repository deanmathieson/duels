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
 * Run with: npm run gen-art-prompts
 */

/** The shared Hollowmoor style anchor — keep every image in one world. */
const STYLE =
  'dark folk-horror storybook illustration, 19th-century rural gothic, candlelit, ' +
  'crooked woods and peat bog atmosphere, muted earthy palette with warm candle accents, ' +
  'painterly texture, grotesque-but-playful, suggestive bawdy humor without explicit content, ' +
  'no text, no watermark, single subject focus, card-art composition'

/** Per-class palette/mood accents. */
const CLASS_MOOD: Record<CardClass, string> = {
  neutral: 'village common-folk mood, lantern light',
  druid: 'hedgewitch greens, briar and mandrake, overgrown garden dark',
  hunter: 'poacher browns, snare lines and hounds, misty moor at dawn',
  mage: 'midnight blues, falling stars and frost, astrologer clutter',
  paladin: 'wax-yellow lantern glow, processions and candle smoke',
  priest: 'incense gloom, crooked parish church, communion wine reds',
  rogue: 'tavern-backroom shadows, knives and stolen silver',
  shaman: 'bog greens and storm greys, carved effigies, entrail-reading',
  warlock: 'crossroads contract dread, fae court purples, red ink',
  warrior: 'rusting plate, tourney banners gone ragged, alehouse brawn',
}

interface PromptEntry {
  id: string
  kind: 'card' | 'hero' | 'heroPower' | 'treasure' | 'enemy'
  name: string
  prompt: string
}

function cardSubject(c: CardDef): string {
  const bits: string[] = []
  if (c.type === 'minion') {
    const tribe = c.tribe && c.tribe !== 'none' ? ` (${c.tribe} creature)` : ''
    bits.push(`character portrait of "${c.name}"${tribe}`)
  } else if (c.type === 'weapon') {
    bits.push(`ornate weapon still-life: "${c.name}"`)
  } else {
    bits.push(`magical moment depicting the spell "${c.name}"`)
  }
  if (c.flavor) bits.push(`scene hint: ${c.flavor}`)
  return bits.join(', ')
}

const prompts: PromptEntry[] = []

for (const c of allCards) {
  prompts.push({
    id: c.id,
    kind: 'card',
    name: c.name,
    prompt: `${cardSubject(c)}, ${CLASS_MOOD[c.cardClass] ?? CLASS_MOOD.neutral}, ${STYLE}`,
  })
}
for (const h of heroes) {
  prompts.push({
    id: h.id,
    kind: 'hero',
    name: h.name,
    prompt: `heroic waist-up portrait of "${h.name}", ${CLASS_MOOD[h.cardClass] ?? CLASS_MOOD.neutral}, imposing character, ${STYLE}`,
  })
}
for (const hp of heroPowers) {
  prompts.push({
    id: hp.id,
    kind: 'heroPower',
    name: hp.name,
    prompt: `small circular emblem illustrating "${hp.name}" (${hp.text}), ${STYLE}`,
  })
}
for (const t of allTreasures) {
  prompts.push({
    id: t.id,
    kind: 'treasure',
    name: t.name,
    prompt: `legendary relic illustration: "${t.name}" (${t.text}), treasure-hoard lighting, ${STYLE}`,
  })
}
for (const e of enemies) {
  prompts.push({
    id: e.id,
    kind: 'enemy',
    name: e.name,
    prompt: `villain portrait of ${e.heroName}, known as "${e.name}", ${CLASS_MOOD[e.heroClass] ?? CLASS_MOOD.neutral}, menacing local legend, ${STYLE}`,
  })
}

const outPath = fileURLToPath(new URL('./art-prompts.json', import.meta.url))
writeFileSync(outPath, JSON.stringify({ style: STYLE, prompts }, null, 2))
console.log(`Wrote ${prompts.length} prompts to ${outPath}`)
console.log('Priority order suggestion: heroes -> enemies -> treasures -> legendaries -> the rest.')
