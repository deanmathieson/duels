import { beforeAll, describe, expect, it } from 'vitest'
import type { CardDef, RngState } from '../game/types'
import {
  deckSynergies,
  generateTreasureOffering,
  treasureWeight,
  type TreasureCandidate,
} from '../game/run/rewards'
import { allTreasures, initializeContent, passiveTreasureIds, activeTreasureIds, getTreasureDef } from '../data/registry'

beforeAll(() => {
  initializeContent()
})

/** Minimal CardDef factory for synergy-signal tests. */
function card(over: Partial<CardDef>): CardDef {
  return {
    id: over.id ?? 'x',
    name: 'X',
    cost: over.cost ?? 2,
    type: over.type ?? 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: '',
    ...over,
  }
}

describe('deckSynergies', () => {
  it('returns no signals for an empty deck', () => {
    expect(deckSynergies([])).toEqual({})
  })

  it('detects a beast lean and ignores trace amounts', () => {
    const heavy = [
      ...Array.from({ length: 8 }, (_, i) => card({ id: `b${i}`, tribe: 'beast' })),
      ...Array.from({ length: 7 }, (_, i) => card({ id: `v${i}` })),
    ]
    expect(deckSynergies(heavy).beasts).toBeGreaterThan(0.5)

    const trace = [
      card({ id: 'b0', tribe: 'beast' }),
      ...Array.from({ length: 14 }, (_, i) => card({ id: `v${i}` })),
    ]
    expect(deckSynergies(trace).beasts).toBeUndefined()
  })

  it('detects a spell-heavy deck', () => {
    const deck = [
      ...Array.from({ length: 8 }, (_, i) => card({ id: `s${i}`, type: 'spell' })),
      ...Array.from({ length: 7 }, (_, i) => card({ id: `m${i}` })),
    ]
    expect(deckSynergies(deck).spells).toBeGreaterThanOrEqual(1)
  })
})

describe('treasureWeight', () => {
  it('is baseline 1 for untagged or off-theme treasures', () => {
    expect(treasureWeight(undefined, { beasts: 1 })).toBe(1)
    expect(treasureWeight(['spells'], { beasts: 1 })).toBe(1)
    expect(treasureWeight(['druid-good'], { beasts: 1 })).toBe(1) // legacy tag never matches
  })

  it('scales up with matching signals', () => {
    expect(treasureWeight(['beasts'], { beasts: 1 })).toBeCloseTo(3.5)
    expect(treasureWeight(['beasts', 'ward'], { beasts: 1, ward: 0.5 })).toBeCloseTo(4.75)
  })
})

describe('generateTreasureOffering', () => {
  const commons: TreasureCandidate[] = Array.from({ length: 10 }, (_, i) => ({
    id: `c${i}`,
    weight: 1,
  }))
  const jackpots: TreasureCandidate[] = [
    { id: 'j0', weight: 1, jackpot: true },
    { id: 'j1', weight: 1, jackpot: true },
  ]

  it('offers 3 unique choices', () => {
    const rng: RngState = { seed: 42 }
    const o = generateTreasureOffering('passiveTreasure', rng, [...commons, ...jackpots], 0.2)
    expect(o.choices).toHaveLength(3)
    expect(new Set(o.choices).size).toBe(3)
  })

  it('never offers a jackpot when the chance is 0', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const o = generateTreasureOffering('passiveTreasure', { seed }, [...commons, ...jackpots], 0)
      expect(o.choices.some((id) => id.startsWith('j'))).toBe(false)
    }
  })

  it('always offers exactly one jackpot when the chance is 1', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const o = generateTreasureOffering('activeTreasure', { seed }, [...commons, ...jackpots], 1)
      expect(o.choices.filter((id) => id.startsWith('j'))).toHaveLength(1)
    }
  })

  it('rolls a jackpot at roughly the configured rate', () => {
    let hits = 0
    for (let seed = 1; seed <= 500; seed++) {
      const o = generateTreasureOffering('passiveTreasure', { seed }, [...commons, ...jackpots], 0.2)
      if (o.choices.some((id) => id.startsWith('j'))) hits++
    }
    expect(hits / 500).toBeGreaterThan(0.12)
    expect(hits / 500).toBeLessThan(0.3)
  })

  it('strongly prefers synergy-weighted candidates', () => {
    // One on-theme candidate at the hard-lean weight among nine baseline ones.
    const cands = (): TreasureCandidate[] => [
      { id: 'themed', weight: 3.5 },
      ...Array.from({ length: 9 }, (_, i) => ({ id: `c${i}`, weight: 1 })),
    ]
    let themed = 0
    let baselineC0 = 0
    for (let seed = 1; seed <= 500; seed++) {
      const o = generateTreasureOffering('passiveTreasure', { seed }, cands(), 0)
      if (o.choices.includes('themed')) themed++
      if (o.choices.includes('c0')) baselineC0++
    }
    // 3 of 10 slots ≈ 30% baseline; the themed one should show up far more often.
    expect(themed / 500).toBeGreaterThan(0.55)
    expect(themed / 500).toBeGreaterThan((baselineC0 / 500) * 1.6)
  })

  it('falls back to jackpots when commons run dry, never duplicating', () => {
    const rng: RngState = { seed: 7 }
    const o = generateTreasureOffering(
      'passiveTreasure',
      rng,
      [{ id: 'c0', weight: 1 }, ...jackpots],
      0
    )
    expect(o.choices).toHaveLength(3)
    expect(new Set(o.choices).size).toBe(3)
  })

  it('is deterministic for a given seed', () => {
    const a = generateTreasureOffering('passiveTreasure', { seed: 99 }, [...commons, ...jackpots], 0.2)
    const b = generateTreasureOffering('passiveTreasure', { seed: 99 }, [...commons, ...jackpots], 0.2)
    expect(a.choices).toEqual(b.choices)
  })
})

describe('jackpot treasure data', () => {
  it('every jackpot id uses the tr_jp_ prefix and is registered', () => {
    const jackpots = allTreasures.filter((t) => t.jackpot)
    expect(jackpots.length).toBeGreaterThanOrEqual(10)
    for (const t of jackpots) {
      expect(t.id, `${t.id} prefix`).toMatch(/^tr_jp_/)
      expect(['passive', 'active']).toContain(t.kind)
    }
  })

  it('jackpots are present in the offering id pools (store filters them to the jackpot slot)', () => {
    const ids = new Set([...passiveTreasureIds, ...activeTreasureIds])
    for (const t of allTreasures.filter((t) => t.jackpot)) {
      expect(ids.has(t.id), `${t.id} in pools`).toBe(true)
    }
  })

  it('offered treasures carry only known synergy tags (signatures may keep legacy tags)', () => {
    const known = new Set([
      'spells', 'beasts', 'fae', 'ward', 'omen', 'haunt', 'swarm', 'big', 'weapons',
    ])
    const offeredIds = new Set([...passiveTreasureIds, ...activeTreasureIds])
    for (const t of allTreasures.filter((t) => offeredIds.has(t.id))) {
      for (const tag of t.tags ?? []) {
        expect(known.has(tag), `${t.id} tag ${tag}`).toBe(true)
      }
    }
  })

  it('active jackpots grant real cards; passive jackpots have auras/triggers/startOfGame', () => {
    for (const t of allTreasures.filter((t) => t.jackpot)) {
      if (t.kind === 'active') {
        expect(t.card, `${t.id} card`).toBeTruthy()
        expect(getTreasureDef(t.id).card?.token).toBe(true)
      } else {
        expect(t.auras?.length || t.triggers?.length || t.startOfGame?.length, `${t.id} effect`).toBeTruthy()
      }
    }
  })
})
