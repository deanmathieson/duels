import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Beaststalker Tavish hero definition for the Hunter class.
 */
export const hunterHero: HeroDef = {
  id: 'hero_hunter',
  name: 'Beaststalker Tavish',
  cardClass: 'hunter',
  heroPowers: [
    'hp_hunter_steady_shot',
    'hp_hunter_beast_within',
    'hp_hunter_pack_tactics',
  ],
  signatureTreasures: [
    'sig_hunter_kill_command_barrage',
    'sig_hunter_rat_trap',
    'sig_hunter_tavish_stormpike',
    'sig_hunter_explosive_shot',
    'sig_hunter_beast_bond',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Beaststalker Tavish's three hero powers.
 *
 * - Steady Shot: the classic Hunter hero power — deal 2 damage to the enemy hero.
 * - Beast Within: add a random Beast (Hunter/neutral pool) to hand at a discount.
 * - Pack Tactics: buff all friendly minions and draw a card.
 */
export const hunterHeroPowers: HeroPowerDef[] = [
  /**
   * Steady Shot — 2 mana. Deal 2 damage to the enemy hero.
   * The iconic Hunter hero power.
   */
  {
    id: 'hp_hunter_steady_shot',
    name: 'Steady Shot',
    cost: 2,
    text: 'Deal 2 damage to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
    art: undefined,
  },

  /**
   * Beast Within — 2 mana. Add a random Beast to your hand that costs (2) less.
   * Synergises with the Beast-heavy Hunter gameplan.
   */
  {
    id: 'hp_hunter_beast_within',
    name: 'Beast Within',
    cost: 2,
    text: 'Add a random Beast to your hand that costs (2) less.',
    effects: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1, costReduction: 2 }],
    art: undefined,
  },

  /**
   * Pack Tactics — 3 mana. Give your minions +1/+1 and draw a card.
   * Rewards a wide board. (There is no beast-only buff selector, so unlike the
   * flavour this buffs ALL friendly minions — text matches the implementation.)
   */
  {
    id: 'hp_hunter_pack_tactics',
    name: 'Pack Tactics',
    cost: 3,
    text: 'Give your minions +1/+1. Draw a card.',
    effects: [
      { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },
]
