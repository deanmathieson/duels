import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Hespera Quill, the Comet-Wife — Stargazer hero definition.
 * A scandalous hedge-astrologer who reads ruin in the night sky and sells the
 * good news at a markup. Theme: burn and spell damage — hero powers amplify
 * spell output.
 */
export const mageHero: HeroDef = {
  id: 'hero_mage',
  name: 'Hespera Quill, the Comet-Wife',
  cardClass: 'mage',
  heroPowers: ['hp_mage_arcane_surge', 'hp_mage_open_the_portal', 'hp_mage_frigid_blast'],
  signatureTreasures: [
    'sig_mage_grand_magus_staff',
    'sig_mage_time_warp',
    'sig_mage_spellweaver',
    'sig_mage_arcane_overdrive',
    'sig_mage_infinite_arcane',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Hero powers for Hespera Quill, the Comet-Wife.
 */
export const mageHeroPowers: HeroPowerDef[] = [
  /**
   * Bad Horoscope — cost 2.
   * Choose One — Deal 2 damage to an enemy; or gain Spell Damage +2 this turn.
   */
  {
    id: 'hp_mage_arcane_surge',
    name: 'Bad Horoscope',
    cost: 2,
    text: 'Choose One - Deal 2 damage to an enemy; or gain Spell Damage +2 this turn.',
    targeted: true,
    targetFilter: 'allEnemyCharacters',
    chooseOne: [
      {
        text: 'Deal 2 damage to an enemy.',
        effects: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
      },
      {
        text: 'Spell Damage +2 this turn.',
        effects: [{ kind: 'spellDamageThisTurnHero', amount: 2 }],
      },
    ],
    art: undefined,
  },

  /**
   * Crack the Almanac — cost 2.
   * Add a random spell to your hand and reduce its cost by (2).
   */
  {
    id: 'hp_mage_open_the_portal',
    name: 'Crack the Almanac',
    cost: 2,
    text: 'Add a random spell to your hand. It costs (2) less.',
    effects: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 1, costReduction: 2 }],
    art: undefined,
  },

  /**
   * Killing Frost — cost 3.
   * Deal 1 damage to all enemies.
   * (Toned to 1 damage to fit the ~half-cost hero-power budget on a
   * repeatable 3-cost power.)
   */
  {
    id: 'hp_mage_frigid_blast',
    name: 'Killing Frost',
    cost: 3,
    text: 'Deal 1 damage to all enemies.',
    effects: [{ kind: 'damage', amount: 1, target: 'allEnemyCharacters' }],
    art: undefined,
  },
]
