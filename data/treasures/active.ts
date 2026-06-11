import type { CardDef, TreasureDef } from '../../game/types';

/**
 * Token cards summoned by active treasures.
 * These must be registered in the card DB so the engine can look them up.
 */
export const activeTreasureTokens: CardDef[] = [
  /** 5/5 Taunt Beast summoned by tr_summon_grizzly */
  {
    id: 'treasure_grizzly',
    name: 'Barrow-Bear',
    cost: 0,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'free',
    text: '**Ward**',
    flavor: 'It slept a hundred years beneath the cairn. Do not feed it. Do not name it. Too late on both counts.',
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
    name: 'Witching Hour',
    kind: 'active',
    text: 'Refresh your Mana Stones.',
    card: {
      id: 'tr_supercharge',
      name: 'Witching Hour',
      cost: 0,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Refresh your Mana Stones.',
      flavor: 'Midnight strikes, the guttered candles relight, and the moor stands you one more round of bad decisions.',
      spell: [{ kind: 'refreshMana' }],
      token: true,
    },
    tags: ['big', 'spells'],
  },
  {
    id: 'tr_healing_touch',
    name: "The Leech-Wife's Cure",
    kind: 'active',
    text: 'Restore 10 Health to your hero and gain 5 Armor.',
    card: {
      id: 'tr_healing_touch',
      name: "The Leech-Wife's Cure",
      cost: 0,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Restore 10 Health to your hero and gain 5 Armor.',
      flavor: 'Her leeches take the bad blood. Her bill takes everything else.',
      spell: [
        { kind: 'heal', amount: 10, target: 'friendlyHero' },
        { kind: 'gainArmor', amount: 5 },
      ],
      token: true,
    },
  },
  {
    id: 'tr_bag_of_coins',
    name: "Dead Man's Purse",
    kind: 'active',
    text: 'Gain 3 Coins and draw 2 cards.',
    card: {
      id: 'tr_bag_of_coins',
      name: "Dead Man's Purse",
      cost: 0,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Gain 3 Coins and draw 2 cards.',
      flavor: "Cut from a hanged man's belt. He raised no objection.",
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
    name: 'Gallowswood Staff',
    kind: 'active',
    text: 'Discover a spell. It costs (3) less.',
    card: {
      id: 'tr_archmage_staff',
      name: 'Gallowswood Staff',
      cost: 1,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Discover a spell. It costs (3) less.',
      flavor: 'Carved from the old gallows tree. It still remembers how to drop things on people.',
      spell: [{ kind: 'discover', pool: 'spell', costReduction: 3 }],
      token: true,
    },
    tags: ['spells'],
  },

  // ---- 2-cost ----
  // Blood Moon — reworked from "2 damage to all enemy minions + heal 6", which
  // was Pure Cold's AoE role with a heal stapled on. Now a single-target drain
  // so the two treasures answer different boards: Pure Cold sweeps wide, Blood
  // Moon executes one big threat and refunds the damage as Health.
  {
    id: 'tr_blood_moon',
    name: 'Blood Tithe',
    kind: 'active',
    text: 'Deal 5 damage to an enemy. Restore 5 Health to your hero.',
    card: {
      id: 'tr_blood_moon',
      name: 'Blood Tithe',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 5 damage to an enemy. Restore 5 Health to your hero.',
      flavor: 'The parish collects in coin where possible, and in kind where not.',
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
    name: "The Bog-Saint's Mark",
    kind: 'active',
    text: 'Give a minion +5/+5, **Ward** and **Blessing**.',
    card: {
      id: 'tr_mark_of_might',
      name: "The Bog-Saint's Mark",
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Give a minion +5/+5, **Ward** and **Blessing**.',
      flavor: "Blessed by a saint the church won't acknowledge and the bog won't give back.",
      targeted: true,
      targetFilter: 'allMinions',
      spell: [
        { kind: 'buff', atk: 5, health: 5, target: 'chosenTarget' },
        { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
        { kind: 'giveDivineShield', target: 'chosenTarget' },
      ],
      token: true,
    },
    tags: ['ward'],
  },
  {
    id: 'tr_research',
    name: 'Candlelit Heresies',
    kind: 'active',
    text: "Draw 3 cards, then reduce your hand's Cost by (1).",
    card: {
      id: 'tr_research',
      name: 'Candlelit Heresies',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: "Draw 3 cards, then reduce your hand's Cost by (1).",
      flavor: 'Three chapters in, you understand everything. Four chapters in, it understands you.',
      spell: [
        { kind: 'draw', count: 3 },
        { kind: 'reduceCostInHand', amount: 1 },
      ],
      token: true,
    },
  },
  {
    id: 'tr_fortify',
    name: 'Bar the Door',
    kind: 'active',
    text: 'Gain 12 Armor. Draw a card.',
    card: {
      id: 'tr_fortify',
      name: 'Bar the Door',
      cost: 2,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Gain 12 Armor. Draw a card.',
      flavor: 'Stout oak, cold iron, and the fervent hope that it knocks first.',
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
    name: 'Killing Frost',
    kind: 'active',
    text: 'Deal 4 damage to all enemy minions.',
    card: {
      id: 'tr_pure_cold',
      name: 'Killing Frost',
      cost: 3,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 4 damage to all enemy minions.',
      flavor: "It came a month early and took the harvest, the hedgerows, and old Tam's nose.",
      spell: [{ kind: 'damage', amount: 4, target: 'enemyMinions' }],
      token: true,
    },
  },
  {
    id: 'tr_meteor_strike',
    name: 'The Falling Star',
    kind: 'active',
    text: 'Deal 10 damage to a minion and 2 damage to all other enemies.',
    card: {
      id: 'tr_meteor_strike',
      name: 'The Falling Star',
      cost: 3,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 10 damage to a minion and 2 damage to all other enemies.',
      flavor: 'The scholars called it a once-in-a-lifetime event. For those beneath it, technically correct.',
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
    name: 'Wake the Barrow-Bears',
    kind: 'active',
    text: 'Summon two 5/5 Barrow-Bears with **Ward**.',
    card: {
      id: 'tr_summon_grizzly',
      name: 'Wake the Barrow-Bears',
      cost: 4,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Summon two 5/5 Barrow-Bears with **Ward**.',
      flavor: 'The bears beneath the barrows do not hibernate. They wait.',
      spell: [{ kind: 'summon', token: 'treasure_grizzly', count: 2 }],
      token: true,
    },
    tags: ['ward', 'beasts'],
  },

  // ---- 5-cost ----
  {
    id: 'tr_devastation',
    name: 'The Harrowing',
    kind: 'active',
    text: 'Deal 5 damage to all enemies.',
    card: {
      id: 'tr_devastation',
      name: 'The Harrowing',
      cost: 5,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Deal 5 damage to all enemies.',
      flavor: 'When the moor settles its accounts, it does not itemize.',
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
    tags: ['haunt'],
  },

  /* --------------------------------------------------------------------------
   * JACKPOTS — run-warping crazies. Only appear via the low-probability
   * jackpot slot in active-treasure offerings (guaranteed after elites).
   * ----------------------------------------------------------------------- */

  {
    id: 'tr_jp_moors_verdict',
    name: "The Moor's Verdict",
    kind: 'active',
    text: 'Destroy all enemy minions.',
    jackpot: true,
    card: {
      id: 'tr_jp_moors_verdict',
      name: "The Moor's Verdict",
      cost: 5,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Destroy all enemy minions.',
      flavor: 'The moor hears every case. The moor finds for the moor.',
      spell: [{ kind: 'destroy', target: 'enemyMinions' }],
      token: true,
    },
  },
  {
    id: 'tr_jp_carnival',
    name: 'Carnival of Teeth',
    kind: 'active',
    text: 'Fill your board with 2/2 Revenants.',
    jackpot: true,
    card: {
      id: 'tr_jp_carnival',
      name: 'Carnival of Teeth',
      cost: 4,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: 'Fill your board with 2/2 Revenants.',
      flavor: 'It comes to town overnight, uninvited. Admission is free. Leaving is negotiable.',
      spell: [{ kind: 'summon', token: 'revenant', count: 7 }],
      token: true,
    },
    tags: ['swarm', 'haunt'],
  },
  {
    id: 'tr_jp_stolen_hours',
    name: 'The Stolen Hours',
    kind: 'active',
    text: "Draw 4 cards, then reduce your hand's Cost by (2).",
    jackpot: true,
    card: {
      id: 'tr_jp_stolen_hours',
      name: 'The Stolen Hours',
      cost: 1,
      type: 'spell',
      cardClass: 'neutral',
      rarity: 'legendary',
      text: "Draw 4 cards, then reduce your hand's Cost by (2).",
      flavor: 'Where do the hours go when the clock runs slow? Someone is keeping them. Someone is spending them.',
      spell: [
        { kind: 'draw', count: 4 },
        { kind: 'reduceCostInHand', amount: 2 },
      ],
      token: true,
    },
    tags: ['big', 'spells'],
  },
];
