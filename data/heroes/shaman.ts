import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Weatherman Willy — Weatherman hero definition.
 * Reads tomorrow off the clouds and is never wrong, which is the problem:
 * what Willy forecasts, arrives. Carved Effigies for weathervanes.
 */
export const shamanHero: HeroDef = {
  id: 'hero_shaman',
  name: 'Weatherman Willy',
  cardClass: 'shaman',
  heroPowers: ['hp_shaman_totemic_call', 'hp_shaman_storm_strike', 'hp_shaman_ancestral_mending'],
  signatureTreasures: [
    'sig_shaman_doomhammer',
    'sig_shaman_storm_caller',
    'sig_shaman_tide_pool',
    'sig_shaman_ancestral_spirits',
    'sig_shaman_spirit_of_the_elements',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Weatherman hero powers for Weatherman Willy.
 */
export const shamanHeroPowers: HeroPowerDef[] = [
  /**
   * Stake an Effigy — 2 mana. Choose One: Summon a Candlewick Effigy (1/1);
   * or a Gallowstone Effigy (0/2 Ward); or a Weathervane Effigy (0/2 Spell Damage +1).
   */
  {
    id: 'hp_shaman_totemic_call',
    name: 'Stake an Effigy',
    cost: 2,
    text: 'Choose One - Summon a 1/1 Candlewick Effigy; or a 0/2 Gallowstone Effigy with Ward; or a 0/2 Weathervane Effigy with Spell Damage +1.',
    chooseOne: [
      {
        text: 'Summon a 1/1 Candlewick Effigy.',
        effects: [{ kind: 'summon', token: 'shaman_token_searing_totem', count: 1 }],
      },
      {
        text: 'Summon a 0/2 Gallowstone Effigy with Ward.',
        effects: [{ kind: 'summon', token: 'shaman_token_stoneskin_totem', count: 1 }],
      },
      {
        text: 'Summon a 0/2 Weathervane Effigy with Spell Damage +1.',
        effects: [{ kind: 'summon', token: 'shaman_token_wrath_of_air_totem', count: 1 }],
      },
    ],
    art: undefined,
  },

  /**
   * Ill Wind — 2 mana. Deal 2 damage to the enemy hero.
   * A bartered gust of spite, spent straight at the opponent's face.
   * (2 damage to match the repeatable face-damage hero-power anchor —
   * it compounds every turn.)
   */
  {
    id: 'hp_shaman_storm_strike',
    name: 'Ill Wind',
    cost: 2,
    text: 'Deal 2 damage to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
    art: undefined,
  },

  /**
   * Warm Front — 3 mana. Restore 5 Health to your hero and gain 2 Armor.
   * Willy forecasts mild and sunny, and for once it's aimed at you.
   */
  {
    id: 'hp_shaman_ancestral_mending',
    name: 'Warm Front',
    cost: 3,
    text: 'Restore 5 Health to your hero. Gain 2 Armor.',
    effects: [
      { kind: 'heal', amount: 5, target: 'friendlyHero' },
      { kind: 'gainArmor', amount: 2 },
    ],
    art: undefined,
  },
]
