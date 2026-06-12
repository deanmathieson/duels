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
 * dramatic chiaroscuro, rich warm shadows, gothic dark-fantasy mood.
 * (Anti-cheesecake is handled in the per-subject text + the negative prompt;
 * the Frazetta token alone otherwise defaults every card to a pin-up woman.)
 */
const STYLE =
  'oil painting in the style of Frank Frazetta, pulp fantasy art, ' +
  'dramatic chiaroscuro, rich warm shadows, painterly brushwork, ' +
  'dark gothic folk-horror'

/** Creature words per tribe so tribal minions render as monsters, not people. */
const TRIBE_CREATURE: Record<string, string> = {
  beast: 'a wild beast',
  demon: 'a demonic fae creature',
  elemental: 'an elemental spirit',
  mech: 'a clockwork golem',
  dragon: 'a wyrm',
  murloc: 'a bog fish-creature',
  pirate: 'a brigand',
  totem: 'a carved wooden effigy',
  ancient: 'an ancient treant',
}

/** Per-class palette/mood accents — short, so they survive the token budget. */
const CLASS_MOOD: Record<CardClass, string> = {
  neutral: 'village folk, lantern light',
  druid: 'farmstead greens, briar and mandrake',
  hunter: 'gamekeeper browns, snares and hounds, misty moor',
  mage: 'gunpowder smoke, rockets and sparks on midnight blue',
  paladin: 'wax-yellow lantern glow, candle processions',
  priest: 'incense gloom, crooked parish church',
  rogue: 'moonlit rooftops, swag sacks, knives and silver',
  shaman: 'storm greys and bog greens, weathervanes and effigies',
  warlock: 'pawnshop clutter, fae-court purples, contract dread',
  warrior: 'forge-glow orange, anvils and sparks, horseshoes',
}

interface PromptEntry {
  id: string
  kind: 'card' | 'hero' | 'heroPower' | 'treasure' | 'enemy'
  name: string
  prompt: string
}

/**
 * Build the subject clause by card TYPE. Only minions are characters; spells
 * are effect/scene illustrations and weapons are object still-lifes — both
 * explicitly people-free, so the Frazetta anchor can't turn them into figures.
 */
function cardSubject(c: CardDef): string {
  if (c.type === 'minion') {
    const creature = c.tribe && c.tribe !== 'none' ? TRIBE_CREATURE[c.tribe] : undefined
    const who = creature ?? 'a fully-clothed character'
    return `${who} named "${c.name}"`
  }
  if (c.type === 'weapon') {
    return `still-life of the weapon "${c.name}", object only, no people, no figures`
  }
  // spell
  return `a dramatic scene evoking "${c.name}", a magical effect or eerie landscape, no people, no figures`
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
    prompt: `${STYLE}. waist-up portrait of "${h.name}", imposing, fully clothed, dignified. ${CLASS_MOOD[h.cardClass] ?? CLASS_MOOD.neutral}`,
  })
}
for (const hp of heroPowers) {
  prompts.push({
    id: hp.id,
    kind: 'heroPower',
    name: hp.name,
    prompt: `${STYLE}. an icon symbolizing "${hp.name}", object or symbol, no people, no faces`,
  })
}
for (const t of allTreasures) {
  prompts.push({
    id: t.id,
    kind: 'treasure',
    name: t.name,
    prompt: `${STYLE}. still-life of an ornate magical relic, "${t.name}", object only on dark velvet, no people, no figures`,
  })
}
for (const e of enemies) {
  prompts.push({
    id: e.id,
    kind: 'enemy',
    name: e.name,
    prompt: `${STYLE}. menacing villain portrait of ${e.heroName}, "${e.name}", fully clothed. ${CLASS_MOOD[e.heroClass] ?? CLASS_MOOD.neutral}`,
  })
}

const outPath = fileURLToPath(new URL('./art-prompts.json', import.meta.url))
writeFileSync(outPath, JSON.stringify({ style: STYLE, prompts }, null, 2))
console.log(`Wrote ${prompts.length} prompts to ${outPath}`)
console.log('Priority order: heroes -> enemies -> treasures -> heroPowers -> cards.')
