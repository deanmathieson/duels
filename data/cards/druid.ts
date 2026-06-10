import type { CardDef } from '../../game/types'

/**
 * Druid class cards — exactly 20 ids as specified in CONTENT.md.
 * Encoded per EFFECTSPEC.md conventions.
 */
export const druidCards: CardDef[] = [
  // --- 0-cost ---
  {
    id: 'innervate',
    name: 'Innervate',
    cost: 0,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Gain 2 Mana Crystals this turn only.',
    spell: [{ kind: 'gainManaThisTurn', amount: 2 }],
    art: undefined,
  },
  {
    id: 'moonfire',
    name: 'Moonfire',
    cost: 0,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Deal 1 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 1, target: 'chosenTarget' }],
    art: undefined,
  },

  // --- 1-cost ---
  {
    id: 'claw',
    name: 'Claw',
    cost: 1,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Give your hero +2 Attack this turn. Gain 2 Armor.',
    spell: [
      { kind: 'heroAttackThisTurn', amount: 2 },
      { kind: 'gainArmor', amount: 2 },
    ],
    art: undefined,
  },
  {
    id: 'living_roots',
    name: 'Living Roots',
    cost: 1,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Choose One - Deal 2 damage; or Summon two 1/1 Saplings.',
    targeted: true,
    targetFilter: 'allCharacters',
    chooseOne: [
      {
        text: 'Deal 2 damage.',
        effects: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
      },
      {
        text: 'Summon two 1/1 Saplings.',
        effects: [{ kind: 'summon', token: 'sapling', count: 2 }],
      },
    ],
    art: undefined,
  },

  // --- 2-cost ---
  {
    id: 'mark_of_the_wild',
    name: 'Mark of the Wild',
    cost: 2,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Give a friendly minion **Taunt** and +2/+2.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
      { kind: 'buff', atk: 2, health: 2, target: 'chosenTarget' },
    ],
    art: undefined,
  },
  {
    id: 'wild_growth',
    name: 'Wild Growth',
    cost: 2,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Gain an empty Mana Crystal.',
    spell: [{ kind: 'gainManaCrystal', count: 1, empty: true }],
    art: undefined,
  },
  {
    id: 'wrath',
    name: 'Wrath',
    cost: 2,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Choose One - Deal 3 damage to a minion; or 1 damage and draw a card.',
    targeted: true,
    targetFilter: 'allMinions',
    chooseOne: [
      {
        text: 'Deal 3 damage.',
        effects: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
      },
      {
        text: 'Deal 1 damage. Draw a card.',
        effects: [
          { kind: 'damage', amount: 1, target: 'chosenTarget' },
          { kind: 'draw', count: 1 },
        ],
      },
    ],
    art: undefined,
  },
  {
    id: 'power_of_the_wild',
    name: 'Power of the Wild',
    cost: 2,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Choose One - Give your minions +1/+1; or Summon a 3/2 Panther.',
    chooseOne: [
      {
        text: 'Give your minions +1/+1.',
        effects: [{ kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' }],
      },
      {
        text: 'Summon a 3/2 Panther.',
        effects: [{ kind: 'summon', token: 'panther', count: 1 }],
      },
    ],
    art: undefined,
  },

  // --- 3-cost ---
  {
    id: 'savage_roar',
    name: 'Savage Roar',
    cost: 3,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Give your characters +2 Attack this turn.',
    spell: [
      { kind: 'buffThisTurn', atk: 2, target: 'friendlyMinions' },
      { kind: 'heroAttackThisTurn', amount: 2 },
    ],
    art: undefined,
  },
  {
    id: 'mulch',
    name: 'Mulch',
    cost: 3,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'epic',
    text: 'Destroy a minion. Add a random minion to your opponent\'s hand.',
    targeted: true,
    targetFilter: 'allMinions',
    scriptId: 'mulch',
    art: undefined,
  },

  // --- 4-cost ---
  {
    id: 'keeper_of_the_grove',
    name: 'Keeper of the Grove',
    cost: 4,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'rare',
    text: 'Choose One - Deal 2 damage; or Silence a minion.',
    attack: 2,
    health: 4,
    tribe: 'none',
    targeted: true,
    targetFilter: 'allMinions',
    chooseOne: [
      {
        text: 'Deal 2 damage.',
        effects: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
      },
      {
        text: 'Silence a minion.',
        effects: [{ kind: 'silence', target: 'chosenTarget' }],
      },
    ],
    art: undefined,
  },
  {
    id: 'swipe',
    name: 'Swipe',
    cost: 4,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Deal 4 damage to an enemy and 1 damage to all other enemies.',
    targeted: true,
    targetFilter: 'allEnemyCharacters',
    spell: [
      { kind: 'damage', amount: 4, target: 'chosenTarget' },
      { kind: 'damage', amount: 1, target: 'otherEnemies' },
    ],
    art: undefined,
  },

  // --- 5-cost ---
  {
    id: 'nourish',
    name: 'Nourish',
    cost: 5,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'rare',
    text: 'Choose One - Gain 2 Mana Crystals; or Draw 3 cards.',
    chooseOne: [
      {
        text: 'Gain 2 Mana Crystals.',
        effects: [{ kind: 'gainManaCrystal', count: 2 }],
      },
      {
        text: 'Draw 3 cards.',
        effects: [{ kind: 'draw', count: 3 }],
      },
    ],
    art: undefined,
  },
  {
    id: 'force_of_nature',
    name: 'Force of Nature',
    cost: 5,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'epic',
    text: 'Summon three 2/2 Treants.',
    spell: [{ kind: 'summon', token: 'treant', count: 3 }],
    art: undefined,
  },
  {
    id: 'druid_of_the_claw',
    name: 'Druid of the Claw',
    cost: 5,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Choose One - 4/4 with Charge; or 4/6 with Taunt.',
    attack: 4,
    health: 4,
    tribe: 'beast',
    chooseOne: [
      {
        text: '4/4 with Charge.',
        stats: { attack: 4, health: 4 },
        keywords: ['charge'],
      },
      {
        text: '4/6 with Taunt.',
        stats: { attack: 4, health: 6 },
        keywords: ['taunt'],
      },
    ],
    art: undefined,
  },

  // --- 6-cost ---
  {
    id: 'starfire',
    name: 'Starfire',
    cost: 6,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Deal 5 damage. Draw a card.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 5, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  // --- 7-cost ---
  {
    id: 'ancient_of_lore',
    name: 'Ancient of Lore',
    cost: 7,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'epic',
    text: 'Choose One - Draw 2 cards; or Restore 5 Health.',
    attack: 5,
    health: 5,
    tribe: 'ancient',
    targeted: true,
    targetFilter: 'allCharacters',
    chooseOne: [
      {
        text: 'Draw 2 cards.',
        effects: [{ kind: 'draw', count: 2 }],
      },
      {
        text: 'Restore 5 Health.',
        effects: [{ kind: 'heal', amount: 5, target: 'chosenTarget' }],
      },
    ],
    art: undefined,
  },
  {
    id: 'ancient_of_war',
    name: 'Ancient of War',
    cost: 7,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'epic',
    text: 'Choose One - +5 Attack; or +5 Health and Taunt.',
    attack: 5,
    health: 5,
    tribe: 'ancient',
    chooseOne: [
      {
        text: '+5 Attack.',
        stats: { attack: 10, health: 5 },
      },
      {
        text: '+5 Health and Taunt.',
        stats: { attack: 5, health: 10 },
        keywords: ['taunt'],
      },
    ],
    art: undefined,
  },

  // --- 8-cost ---
  {
    id: 'ironbark_protector',
    name: 'Ironbark Protector',
    cost: 8,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'free',
    text: '**Taunt**',
    attack: 8,
    health: 8,
    tribe: 'none',
    keywords: ['taunt'],
    art: undefined,
  },

  // --- 9-cost ---
  {
    id: 'cenarius',
    name: 'Cenarius',
    cost: 9,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'legendary',
    text: 'Choose One - Give your other minions +2/+2; or Summon two 2/2 Treants with Taunt.',
    attack: 5,
    health: 8,
    tribe: 'none',
    chooseOne: [
      {
        text: 'Give your other minions +2/+2.',
        effects: [{ kind: 'buff', atk: 2, health: 2, target: 'otherFriendlyMinions' }],
      },
      {
        text: 'Summon two 2/2 Treants with Taunt.',
        effects: [{ kind: 'summon', token: 'treant_taunt', count: 2 }],
      },
    ],
    art: undefined,
  },
]
