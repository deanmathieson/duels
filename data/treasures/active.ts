import type { CardDef, TreasureDef } from '../../game/types';

/**
 * Token cards summoned by active treasures.
 * These must be registered in the card DB so the engine can look them up.
 */
export const activeTreasureTokens: CardDef[] = [
  /** 5/5 Taunt Beast summoned by tr_summon_grizzly */
  {
    id: 'treasure_grizzly',
    name: 'Grizzly',
    cost: 0,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'free',
    text: '**Ward**',
    attack: 5,
    health: 5,
    tribe: 'beast',
    keywords: ['taunt'],
    token: true,
  },
];

/**
 * All active treasures for the run.
 *
 * DESIGN RULE: a treasure must feel like a PRIZE, not a deck card — every one
 * is deliberately pushed far above the fair curve (roughly 2-3x a normal card's
 * value, usually by stapling two strong effects together). They are legendary-
 * framed so they read as special the moment they hit your hand.
 */
export const activeTreasures: TreasureDef[] = [
  // ---- 0-cost ----
  {
    id: 'tr_supercharge',
    name: 'Supercharge',
    kind: 'active',
    text: 'Refresh your Mana Stones.',
    card: {
      id: 'tr_supercharge',
      name: 'Supercharge',
      cost: 0,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Refresh your Mana Stones.',
      spell: [{ kind: 'refreshMana' }],
      token: true,
    },
  },
  {
    id: 'tr_healing_touch',
    name: 'Healing Touch',
    kind: 'active',
    text: 'Restore 10 Health to your hero and gain 5 Armor.',
    card: {
      id: 'tr_healing_touch',
      name: 'Healing Touch',
      cost: 0,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Restore 10 Health to your hero and gain 5 Armor.',
      spell: [
        { kind: 'heal', amount: 10, target: 'friendlyHero' },
        { kind: 'gainArmor', amount: 5 },
      ],
      token: true,
    },
  },
  {
    id: 'tr_bag_of_coins',
    name: 'Bag of Coins',
    kind: 'active',
    text: 'Gain 3 Coins and draw 2 cards.',
    card: {
      id: 'tr_bag_of_coins',
      name: 'Bag of Coins',
      cost: 0,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Gain 3 Coins and draw 2 cards.',
      spell: [
        { kind: 'gainCoin', count: 3 },
        { kind: 'draw', count: 2 },
      ],
      token: true,
    },
  },

  // ---- 1-cost ----
  {
    id: 'tr_archmage_staff',
    name: "Archmage's Staff",
    kind: 'active',
    text: 'Discover a spell. It costs (3) less.',
    card: {
      id: 'tr_archmage_staff',
      name: "Archmage's Staff",
      cost: 1,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Discover a spell. It costs (3) less.',
      spell: [{ kind: 'discover', pool: 'spell', costReduction: 3 }],
      token: true,
    },
  },

  // ---- 2-cost ----
  // Blood Moon — reworked from "2 damage to all enemy minions + heal 6", which
  // was Pure Cold's AoE role with a heal stapled on. Now a single-target drain
  // so the two treasures answer different boards: Pure Cold sweeps wide, Blood
  // Moon executes one big threat and refunds the damage as Health.
  {
    id: 'tr_blood_moon',
    name: 'Blood Moon',
    kind: 'active',
    text: 'Deal 5 damage to an enemy. Restore 5 Health to your hero.',
    card: {
      id: 'tr_blood_moon',
      name: 'Blood Moon',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 5 damage to an enemy. Restore 5 Health to your hero.',
      targeted: true,
      targetFilter: 'allEnemyCharacters',
      spell: [
        { kind: 'damage', amount: 5, target: 'chosenTarget' },
        { kind: 'heal', amount: 5, target: 'friendlyHero' },
      ],
      token: true,
    },
  },
  {
    id: 'tr_mark_of_might',
    name: 'Mark of Might',
    kind: 'active',
    text: 'Give a minion +5/+5, **Ward** and **Blessing**.',
    card: {
      id: 'tr_mark_of_might',
      name: 'Mark of Might',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Give a minion +5/+5, **Ward** and **Blessing**.',
      targeted: true,
      targetFilter: 'allMinions',
      spell: [
        { kind: 'buff', atk: 5, health: 5, target: 'chosenTarget' },
        { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
        { kind: 'giveDivineShield', target: 'chosenTarget' },
      ],
      token: true,
    },
  },
  {
    id: 'tr_research',
    name: 'Research',
    kind: 'active',
    text: "Draw 3 cards, then reduce your hand's Cost by (1).",
    card: {
      id: 'tr_research',
      name: 'Research',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: "Draw 3 cards, then reduce your hand's Cost by (1).",
      spell: [
        { kind: 'draw', count: 3 },
        { kind: 'reduceCostInHand', amount: 1 },
      ],
      token: true,
    },
  },
  {
    id: 'tr_fortify',
    name: 'Fortify',
    kind: 'active',
    text: 'Gain 12 Armor. Draw a card.',
    card: {
      id: 'tr_fortify',
      name: 'Fortify',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Gain 12 Armor. Draw a card.',
      spell: [
        { kind: 'gainArmor', amount: 12 },
        { kind: 'draw', count: 1 },
      ],
      token: true,
    },
  },

  // ---- 3-cost ----
  {
    id: 'tr_pure_cold',
    name: 'Pure Cold',
    kind: 'active',
    text: 'Deal 4 damage to all enemy minions.',
    card: {
      id: 'tr_pure_cold',
      name: 'Pure Cold',
      cost: 3,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 4 damage to all enemy minions.',
      spell: [{ kind: 'damage', amount: 4, target: 'enemyMinions' }],
      token: true,
    },
  },
  {
    id: 'tr_meteor_strike',
    name: 'Meteor Strike',
    kind: 'active',
    text: 'Deal 10 damage to a minion and 2 damage to all other enemies.',
    card: {
      id: 'tr_meteor_strike',
      name: 'Meteor Strike',
      cost: 3,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 10 damage to a minion and 2 damage to all other enemies.',
      targeted: true,
      targetFilter: 'allMinions',
      spell: [
        { kind: 'damage', amount: 10, target: 'chosenTarget' },
        { kind: 'damage', amount: 2, target: 'otherEnemies' },
      ],
      token: true,
    },
  },

  // ---- 4-cost ----
  {
    id: 'tr_summon_grizzly',
    name: 'Summon Grizzlies',
    kind: 'active',
    text: 'Summon two 5/5 Grizzlies with **Ward**.',
    card: {
      id: 'tr_summon_grizzly',
      name: 'Summon Grizzlies',
      cost: 4,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Summon two 5/5 Grizzlies with **Ward**.',
      spell: [{ kind: 'summon', token: 'treasure_grizzly', count: 2 }],
      token: true,
    },
  },

  // ---- 5-cost ----
  {
    id: 'tr_devastation',
    name: 'Devastation',
    kind: 'active',
    text: 'Deal 5 damage to all enemies.',
    card: {
      id: 'tr_devastation',
      name: 'Devastation',
      cost: 5,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 5 damage to all enemies.',
      spell: [{ kind: 'damage', amount: 5, target: 'allEnemyCharacters' }],
      token: true,
    },
  },

  // ---- 3-cost (Haunt archetype prize) ----
  {
    id: 'tr_grave_calling',
    name: 'Grave Calling',
    kind: 'active',
    text: 'Resummon 3 friendly minions that died this game.',
    card: {
      id: 'tr_grave_calling',
      name: 'Grave Calling',
      cost: 3,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Resummon 3 friendly minions that died this game.',
      flavor: 'The moor keeps excellent records. The moor makes excellent house calls.',
      spell: [{ kind: 'resummonDeadMinion', count: 3, filter: 'all' }],
      token: true,
    },
  },
];
