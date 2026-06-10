import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Granny Mireweather — Augur hero definition.
 * A bog-witch and weather-reader of Hollowmoor: carved Effigies staked in the
 * marsh, entrail-readings, and storms bartered from things under the water.
 */
export const shamanHero: HeroDef = {
  id: 'hero_shaman',
  name: 'Granny Mireweather',
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
 * Augur hero powers for Granny Mireweather.
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
   * Peat Poultice — 3 mana. Restore 5 Health to your hero and gain 2 Armor.
   * Grave-mud and moss, slapped on warm. Smells worse than it works.
   */
  {
    id: 'hp_shaman_ancestral_mending',
    name: 'Peat Poultice',
    cost: 3,
    text: 'Restore 5 Health to your hero. Gain 2 Armor.',
    effects: [
      { kind: 'heal', amount: 5, target: 'friendlyHero' },
      { kind: 'gainArmor', amount: 2 },
    ],
    art: undefined,
  },
]
