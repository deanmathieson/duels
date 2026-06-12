import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Gamekeeper Gary hero definition for the Gamekeeper class.
 * Keeps the squire's land, the squire's pheasants, and the squire's secrets.
 * Flat cap, shotgun, three dogs, no patience.
 */
export const hunterHero: HeroDef = {
  id: 'hero_hunter',
  name: 'Gamekeeper Gary',
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
    'sig_hunter_carrion_wake',
    'sig_hunter_beast_bond',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Gamekeeper Gary's three hero powers.
 *
 * - Pick a Quarrel: deal 2 damage to the enemy hero.
 * - Check the Snares: add a random Beast (Gamekeeper/neutral pool) to hand at a discount.
 * - Feed the Pack: buff all friendly minions and draw a card.
 */
export const hunterHeroPowers: HeroPowerDef[] = [
  /**
   * Pick a Quarrel — 2 mana. Deal 2 damage to the enemy hero.
   * Gary settles arguments with both barrels.
   */
  {
    id: 'hp_hunter_steady_shot',
    name: 'Pick a Quarrel',
    cost: 2,
    text: 'Deal 2 damage to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
    art: undefined,
  },

  /**
   * Check the Snares — 2 mana. Add a random Beast to your hand that costs (2) less.
   * Synergises with the Beast-heavy Gamekeeper gameplan.
   */
  {
    id: 'hp_hunter_beast_within',
    name: 'Check the Snares',
    cost: 2,
    text: 'Add a random Beast to your hand that costs (2) less.',
    effects: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1, costReduction: 2 }],
    art: undefined,
  },

  /**
   * Feed the Pack — 3 mana. Give your minions +1/+1 and draw a card.
   * Rewards a wide board. (There is no beast-only buff selector, so unlike the
   * flavour this buffs ALL friendly minions — text matches the implementation.)
   */
  {
    id: 'hp_hunter_pack_tactics',
    name: 'Feed the Pack',
    cost: 3,
    text: 'Give your minions +1/+1. Draw a card.',
    effects: [
      { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },
]
