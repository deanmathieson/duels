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
 * The shared Hollowmoor style anchor (front-loaded, compact). Storybook-simple:
 * the game's heroes are Postman-Pat villagers in a folk-horror county, and the
 * art matches — bold flat shapes, one readable subject, plain background.
 * Chosen via scripts/art-style-test.py (winner: greg-storybook-simple-s202);
 * the previous Frazetta oil register rendered busy scenes that didn't read at
 * card size and fought the simple-character redesign.
 */
const STYLE =
  'charming storybook illustration with a dark folk-horror twist, ' +
  'bold simple shapes, plain muted background, soft candlelit palette'

/** Extra clause for character subjects — keeps figures big, flat and readable. */
const CHARACTER_FRAMING = 'clean strong silhouette, single character filling the frame'

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

/**
 * Per-hero look, keyed by hero id. Short and concrete: explicit age/build
 * words come FIRST (the storybook style otherwise casts everyone as a cute
 * child), then one or two signature props, then a setting hint. Kept tight —
 * CLIP truncates at 77 tokens and the style anchor already spends ~25.
 */
const HERO_LOOK: Record<string, string> = {
  forest_warden_omu:
    'a stout middle-aged farmer, flat cap, wellington boots, mud-stained smock, holding a pitchfork, friendly weathered grin, moonlit field',
  hero_hunter:
    'a wiry middle-aged man, gamekeeper, flat cap, warm coat, shotgun over one arm, loyal hound sitting beside him, moonlit countryside',
  hero_mage:
    'a gaunt middle-aged man, firework maker, wild grey-streaked hair, singed stubble, soot-stained apron, holding a big rocket, manic grin, sparks in the night',
  hero_paladin:
    'a cheerful middle-aged lamplighter, long coat, raised glowing lantern pole, ladder on his shoulder, foggy village street at night',
  hero_priest:
    'a mild elderly priest, round spectacles, black cassock, white collar, teacup in hand, faint unsettling smile, dim parish church',
  hero_rogue:
    'a sneaky middle-aged man, burglar, stubbled human face, striped jumper, flat cap, bulging sack over his shoulder, moonlit rooftop',
  hero_shaman:
    'a lanky weathered old weatherman, oilskin coat, holding a weathervane staff, gazing up at gathering storm clouds, windswept moor',
  hero_warlock:
    'a portly middle-aged pawnbroker, pince-nez spectacles, waistcoat and watch chain, ledger under one arm, sly smile, candlelit cluttered shop',
  hero_warrior:
    'a burly broad-shouldered middle-aged blacksmith woman, thick arms, heavy leather apron, gripping a massive blacksmith sledgehammer resting on her shoulder, forge glow',
}

interface PromptEntry {
  id: string
  kind: 'card' | 'hero' | 'heroPower' | 'treasure' | 'enemy'
  name: string
  prompt: string
}

/**
 * Build the subject clause by card TYPE. Only minions are characters; spells
 * are scene illustrations with ONE focal subject and weapons are single-object
 * still-lifes — both explicitly people-free. Every clause pushes the same
 * simplicity rule: one thing in the picture, nothing else competing.
 */
function cardSubject(c: CardDef): string {
  if (c.type === 'minion') {
    const creature = c.tribe && c.tribe !== 'none' ? TRIBE_CREATURE[c.tribe] : undefined
    const who = creature ?? 'a fully-clothed character'
    return `${who} named "${c.name}", ${CHARACTER_FRAMING}`
  }
  if (c.type === 'weapon') {
    return `the weapon "${c.name}", one single object centered, no people, no figures`
  }
  // spell
  return `a simple eerie scene evoking "${c.name}", one clear focal subject, no people, no figures`
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
  // Per-hero look beats the generic clause; mood is sacrificial tail budget.
  const look = HERO_LOOK[h.id] ?? `"${h.name}", fully clothed, ${CHARACTER_FRAMING}`
  prompts.push({
    id: h.id,
    kind: 'hero',
    name: h.name,
    prompt: `${STYLE}, ${CHARACTER_FRAMING}. ${look}`,
  })
}
for (const hp of heroPowers) {
  prompts.push({
    id: hp.id,
    kind: 'heroPower',
    name: hp.name,
    prompt: `${STYLE}. a simple emblem symbolizing "${hp.name}", one single object or symbol, no people, no faces`,
  })
}
for (const t of allTreasures) {
  prompts.push({
    id: t.id,
    kind: 'treasure',
    name: t.name,
    prompt: `${STYLE}. a single magical relic, "${t.name}", one object centered on a plain dark background, no people, no figures`,
  })
}
for (const e of enemies) {
  prompts.push({
    id: e.id,
    kind: 'enemy',
    name: e.name,
    prompt: `${STYLE}, ${CHARACTER_FRAMING}. menacing villain portrait of ${e.heroName}, "${e.name}", fully clothed. ${CLASS_MOOD[e.heroClass] ?? CLASS_MOOD.neutral}`,
  })
}

const outPath = fileURLToPath(new URL('./art-prompts.json', import.meta.url))
writeFileSync(outPath, JSON.stringify({ style: STYLE, prompts }, null, 2))
console.log(`Wrote ${prompts.length} prompts to ${outPath}`)
console.log('Priority order: heroes -> enemies -> treasures -> heroPowers -> cards.')
