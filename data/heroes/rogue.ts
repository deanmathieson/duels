import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Infiltrator Lilian — Rogue hero definition.
 * Theme: tempo, weapons, cheap damage, draw, and SI:7 Battlecries.
 */
export const rogueHero: HeroDef = {
  id: 'hero_rogue',
  name: 'Infiltrator Lilian',
  cardClass: 'rogue',
  heroPowers: [
    'hp_rogue_dagger_mastery',
    'hp_rogue_shadow_step',
    'hp_rogue_preparation',
  ],
  signatureTreasures: [
    'sig_rogue_shadowblade',
    'sig_rogue_thieves_canvas',
    'sig_rogue_cloak_of_shadows',
    'sig_rogue_pillage',
    'sig_rogue_kingpin',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Rogue hero power definitions — 3 thematic options for Infiltrator Lilian.
 */
export const rogueHeroPowers: HeroPowerDef[] = [
  /**
   * Dagger Mastery — equip a 1/2 Dagger.
   * The classic Rogue hero power. (Trimmed the "+2 Attack this turn" rider:
   * a hero power should be ~1 mana of effect, and the dagger alone is that.)
   */
  {
    id: 'hp_rogue_dagger_mastery',
    name: 'Dagger Mastery',
    cost: 2,
    text: 'Equip a 1/2 Dagger.',
    effects: [
      { kind: 'equipWeapon', cardId: 'rogue_whetted_dagger' },
    ],
    art: undefined,
  },

  /**
   * Vanishing Act — deal 2 damage to a minion.
   * Repeatable pinpoint removal. (Trimmed the "draw a card" rider: damage plus
   * a draw every turn was ~2 mana of effect on a 2-mana hero power.)
   */
  {
    id: 'hp_rogue_shadow_step',
    name: 'Vanishing Act',
    cost: 2,
    text: 'Deal 2 damage to a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    effects: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /**
   * Preparation — reduce the cost of expensive cards in your hand.
   * Approximated as a sticky (2) discount on cards costing (5) or more.
   * (Trimmed the "1 damage to all enemies" rider: a repeatable AoE ping plus
   * the discount was ~3 mana of effect on a 3-mana hero power.)
   */
  {
    id: 'hp_rogue_preparation',
    name: 'Preparation',
    cost: 3,
    text: 'Reduce the Cost of cards in your hand that cost (5) or more by (2).',
    effects: [
      { kind: 'reduceCostInHand', amount: 2, minCost: 5 },
    ],
    art: undefined,
  },
]
