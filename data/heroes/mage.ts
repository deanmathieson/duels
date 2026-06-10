import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Mozaki, Master Duelist — Mage hero definition.
 * Theme: burn and spell damage. Hero powers amplify spell output.
 */
export const mageHero: HeroDef = {
  id: 'hero_mage',
  name: 'Mozaki, Master Duelist',
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
 * Hero powers for Mozaki, Master Duelist.
 */
export const mageHeroPowers: HeroPowerDef[] = [
  /**
   * Arcane Surge — cost 2.
   * Choose One — Deal 2 damage to an enemy; or gain Spell Damage +2 this turn.
   */
  {
    id: 'hp_mage_arcane_surge',
    name: 'Arcane Surge',
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
   * Open the Portal — cost 2.
   * Add a random spell to your hand and reduce its cost by (2).
   */
  {
    id: 'hp_mage_open_the_portal',
    name: 'Open the Portal',
    cost: 2,
    text: 'Add a random spell to your hand. It costs (2) less.',
    effects: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 1, costReduction: 2 }],
    art: undefined,
  },

  /**
   * Frigid Blast — cost 3.
   * Deal 1 damage to all enemies.
   * (Freeze is approximated as pure damage — the engine has no Freeze mechanic.
   * Was 3 damage to all enemies: a repeatable ~4-5 mana AoE on a 3-cost hero
   * power; toned down to 1 to fit the ~half-cost hero-power budget.)
   */
  {
    id: 'hp_mage_frigid_blast',
    name: 'Frigid Blast',
    cost: 3,
    text: 'Deal 1 damage to all enemies.',
    effects: [{ kind: 'damage', amount: 1, target: 'allEnemyCharacters' }],
    art: undefined,
  },
]
