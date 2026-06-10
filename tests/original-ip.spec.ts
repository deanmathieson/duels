import { describe, expect, it } from 'vitest'
import type { CardClass, Keyword, MinionTribe } from '../game/types'
import {
  allCards,
  allTreasures,
  buckets,
  enemies,
  heroPowers,
  heroes,
  passiveTreasureIds,
} from '../data/registry'
import { CLASS_LABEL, KEYWORD_LABEL, TRIBE_LABEL } from '../data/terms'

const passiveOfferedIds = new Set(passiveTreasureIds)

/**
 * Original-IP regression guard. All player-facing copy must use the Hollowmoor
 * dictionary (data/terms.ts) — no Hearthstone keyword/tribe vocabulary.
 *
 * Phase 1 scope: text/flavor fields. The creative-rename phase extends this
 * scan to `name` fields and Blizzard proper nouns once existing content has
 * been renamed.
 */

/** Hearthstone-coined terms banned from card/treasure/hero-power text. */
const BANNED_TEXT_TERMS = [
  /\bBattlecry\b/,
  /\bBattlecries\b/,
  /\bDeathrattles?\b/,
  /\bTaunt\b/,
  /\bDivine Shield\b/,
  /\bWindfury\b/,
  /\bLifesteal\b/,
  /\bMana Crystals?\b/,
  /\bDemons?\b/,
  /\bDragons?\b/,
  /\bElementals?\b/,
  /\bMechs?\b/,
  /\bMurlocs?\b/,
  /\bPirates?\b/,
  /\bTotems?\b/,
  /\bHearthstone\b/i,
]

interface TextSource {
  where: string
  text: string
}

function collectTextSources(): TextSource[] {
  const out: TextSource[] = []
  for (const c of allCards) {
    if (c.text) out.push({ where: `card ${c.id} text`, text: c.text })
    if (c.flavor) out.push({ where: `card ${c.id} flavor`, text: c.flavor })
    for (const [i, opt] of (c.chooseOne ?? []).entries()) {
      out.push({ where: `card ${c.id} chooseOne[${i}]`, text: opt.text })
    }
  }
  for (const t of allTreasures) {
    if (t.text) out.push({ where: `treasure ${t.id} text`, text: t.text })
  }
  for (const hp of heroPowers) {
    if (hp.text) out.push({ where: `heroPower ${hp.id} text`, text: hp.text })
    for (const [i, opt] of (hp.chooseOne ?? []).entries()) {
      out.push({ where: `heroPower ${hp.id} chooseOne[${i}]`, text: opt.text })
    }
  }
  return out
}

describe('original-ip: banned terms', () => {
  it('no Hearthstone vocabulary in any content text', () => {
    const offenders: string[] = []
    for (const src of collectTextSources()) {
      for (const re of BANNED_TEXT_TERMS) {
        if (re.test(src.text)) offenders.push(`${src.where}: "${src.text}" matches ${re}`)
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})

describe('original-ip: dictionary completeness', () => {
  it('every keyword has a display label', () => {
    const keywords: Keyword[] = [
      'taunt',
      'divineShield',
      'rush',
      'charge',
      'windfury',
      'lifesteal',
      'poisonous',
      'stealth',
      'spellDamage',
    ]
    for (const k of keywords) expect(KEYWORD_LABEL[k], k).toBeTruthy()
  })

  it('every tribe has a display label (none may be empty)', () => {
    const tribes: MinionTribe[] = [
      'beast',
      'dragon',
      'demon',
      'elemental',
      'mech',
      'murloc',
      'pirate',
      'totem',
      'ancient',
    ]
    for (const t of tribes) expect(TRIBE_LABEL[t], t).toBeTruthy()
  })

  it('every class has a display label', () => {
    const classes: CardClass[] = [
      'neutral',
      'druid',
      'hunter',
      'mage',
      'paladin',
      'priest',
      'rogue',
      'shaman',
      'warlock',
      'warrior',
    ]
    for (const c of classes) expect(CLASS_LABEL[c], c).toBeTruthy()
  })

  it('all content collections are non-empty (registry sanity)', () => {
    expect(allCards.length).toBeGreaterThan(300)
    expect(allTreasures.length).toBeGreaterThan(50)
    expect(heroes.length).toBe(9)
    expect(heroPowers.length).toBeGreaterThan(20)
    expect(enemies.length).toBeGreaterThanOrEqual(6)
    expect(buckets.length).toBeGreaterThan(30)
  })

  it('both passive treasure tiers have enough options for a 3-choice offering', () => {
    const offered = allTreasures.filter(
      (t) => t.kind === 'passive' && passiveOfferedIds.has(t.id)
    )
    const tier1 = offered.filter((t) => (t.tier ?? 1) === 1)
    const tier2 = offered.filter((t) => t.tier === 2)
    expect(tier1.length).toBeGreaterThanOrEqual(3)
    expect(tier2.length).toBeGreaterThanOrEqual(3)
  })
})
