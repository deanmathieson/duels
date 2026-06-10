import { beforeAll, describe, expect, it } from 'vitest'
import {
  LEGACY_CARD_IDS,
  collectibleCardIdsForClass,
  getCard,
  initializeContent,
  migrateCardIds,
} from '../data/registry'

beforeAll(() => {
  initializeContent()
})

const CLASSES = [
  'druid',
  'hunter',
  'mage',
  'paladin',
  'priest',
  'rogue',
  'shaman',
  'warlock',
  'warrior',
] as const

describe('duplicate-name lockdown', () => {
  it('no class draft pool offers two cards with the same name', () => {
    const offenders: string[] = []
    for (const cls of CLASSES) {
      const byName = new Map<string, string>()
      for (const id of collectibleCardIdsForClass(cls)) {
        const name = getCard(id).name
        const existing = byName.get(name)
        if (existing && existing !== id) {
          offenders.push(`${cls}: "${name}" (${existing} vs ${id})`)
        }
        byName.set(name, id)
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})

describe('migrateCardIds', () => {
  it('maps retired duplicate ids to the surviving neutral copy', () => {
    expect(
      migrateCardIds([
        'hunter_stonetusk_boar',
        'paladin_stormwind_champion',
        'warrior_war_golem',
        'shaman_fire_elemental',
      ])
    ).toEqual(['stonetusk_boar', 'stormwind_champion', 'war_golem', 'fire_elemental'])
  })

  it('drops ids the registry no longer knows', () => {
    expect(migrateCardIds(['totally_unknown_card', 'wisp'])).toEqual(['wisp'])
  })

  it('keeps valid ids untouched and preserves order', () => {
    const ids = ['wisp', 'chillwind_yeti', 'boulderfist_ogre']
    expect(migrateCardIds(ids)).toEqual(ids)
  })

  it('every legacy mapping target resolves in the registry', () => {
    for (const [from, to] of Object.entries(LEGACY_CARD_IDS)) {
      expect(() => getCard(to), `${from} -> ${to}`).not.toThrow()
    }
  })
})
