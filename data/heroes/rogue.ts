import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Burglar Bill — Burglar hero definition.
 * Striped jumper, sack marked SWAG, a ferret down one sleeve. Never been
 * convicted; the evidence keeps going missing.
 * Theme: tempo, weapons, cheap damage, draw, and back-alley Omens.
 */
export const rogueHero: HeroDef = {
  id: 'hero_rogue',
  name: 'Burglar Bill',
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
    'sig_rogue_letter_opener',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Burglar hero power definitions — 3 thematic options for Burglar Bill.
 */
export const rogueHeroPowers: HeroPowerDef[] = [
  /**
   * Knife-Work — equip a 1/2 Dagger.
   * The classic Burglar hero power. (A hero power should be ~1 mana of
   * effect, and the dagger alone is that.)
   */
  {
    id: 'hp_rogue_dagger_mastery',
    name: 'Knife-Work',
    cost: 2,
    text: 'Equip a 1/2 Dagger.',
    effects: [
      { kind: 'equipWeapon', cardId: 'rogue_whetted_dagger' },
    ],
    art: undefined,
  },

  /**
   * A Quiet Word — deal 2 damage to a minion.
   * Repeatable pinpoint removal. (No draw rider: damage plus a draw every
   * turn was ~2 mana of effect on a 2-mana hero power.)
   */
  {
    id: 'hp_rogue_shadow_step',
    name: 'A Quiet Word',
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
   * Five-Finger Discount — reduce the cost of expensive cards in your hand.
   * A sticky (2) discount on cards costing (5) or more. (No AoE rider: a
   * repeatable ping plus the discount was ~3 mana of effect on a 3-mana
   * hero power.)
   */
  {
    id: 'hp_rogue_preparation',
    name: 'Five-Finger Discount',
    cost: 3,
    text: 'Reduce the Cost of cards in your hand that cost (5) or more by (2).',
    effects: [
      { kind: 'reduceCostInHand', amount: 2, minCost: 5 },
    ],
    art: undefined,
  },
]
