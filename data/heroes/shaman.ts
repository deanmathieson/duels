import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Instructor Fireheart — Shaman hero definition.
 * Theme: Totems, Elementals, Lightning damage, board buffs.
 */
export const shamanHero: HeroDef = {
  id: 'hero_shaman',
  name: 'Instructor Fireheart',
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
 * Shaman hero powers for Instructor Fireheart.
 */
export const shamanHeroPowers: HeroPowerDef[] = [
  /**
   * Totemic Call — 2 mana. Choose One: Summon a Searing Totem (1/1);
   * or a Stoneskin Totem (0/2 Taunt); or a Wrath of Air Totem (0/2 Spell Damage +1).
   */
  {
    id: 'hp_shaman_totemic_call',
    name: 'Totemic Call',
    cost: 2,
    text: 'Choose One - Summon a 1/1 Searing Totem; or a 0/2 Stoneskin Totem with Taunt; or a 0/2 Wrath of Air Totem with Spell Damage +1.',
    chooseOne: [
      {
        text: 'Summon a 1/1 Searing Totem.',
        effects: [{ kind: 'summon', token: 'shaman_token_searing_totem', count: 1 }],
      },
      {
        text: 'Summon a 0/2 Stoneskin Totem with Taunt.',
        effects: [{ kind: 'summon', token: 'shaman_token_stoneskin_totem', count: 1 }],
      },
      {
        text: 'Summon a 0/2 Wrath of Air Totem with Spell Damage +1.',
        effects: [{ kind: 'summon', token: 'shaman_token_wrath_of_air_totem', count: 1 }],
      },
    ],
    art: undefined,
  },

  /**
   * Storm Strike — 2 mana. Deal 2 damage to the enemy hero.
   * Channelling raw lightning to pressure the opponent.
   * (Reduced from 3 to 2 damage to match the Steady Shot hero-power anchor —
   * repeatable face damage compounds every turn.)
   */
  {
    id: 'hp_shaman_storm_strike',
    name: 'Storm Strike',
    cost: 2,
    text: 'Deal 2 damage to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
    art: undefined,
  },

  /**
   * Ancestral Mending — 3 mana. Restore 5 Health to your hero and gain 2 Armor.
   * Represents the Shaman's healing connection to the ancestors.
   */
  {
    id: 'hp_shaman_ancestral_mending',
    name: 'Ancestral Mending',
    cost: 3,
    text: 'Restore 5 Health to your hero. Gain 2 Armor.',
    effects: [
      { kind: 'heal', amount: 5, target: 'friendlyHero' },
      { kind: 'gainArmor', amount: 2 },
    ],
    art: undefined,
  },
]
