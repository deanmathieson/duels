import type { CardDef } from '../../game/types'

/**
 * Enemy class cards used in enemy decks.
 * These are simple implementations of iconic class spells and minions.
 * Token 'panther' (3/2 Beast) is defined in data/cards/tokens.ts by Worker B.
 * All are tagged `set: 'enemy'` (below) so generation pools never offer them —
 * several duplicate player-facing cards (fireball vs mage_fireball etc.).
 */
const cards: CardDef[] = [
  // --- Mage ---
  {
    id: 'fireball',
    name: 'Fireball',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 6 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 6, target: 'chosenTarget' }],
  },
  {
    id: 'frostbolt',
    name: 'Frostbolt',
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 3 damage to a character.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
  },
  {
    id: 'arcane_intellect',
    name: 'Arcane Intellect',
    cost: 3,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Draw 2 cards.',
    spell: [{ kind: 'draw', count: 2 }],
  },

  // --- Hunter ---
  // 5 unconditional damage (no Beast condition in this engine) is worth ~4 mana,
  // between Frostbolt (2 mana / 3 dmg) and Fireball (4 mana / 6 dmg).
  {
    id: 'kill_command',
    name: 'Kill Command',
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 5 damage to a character.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 5, target: 'chosenTarget' }],
  },
  {
    id: 'arcane_shot',
    name: 'Arcane Shot',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 2 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },
  {
    id: 'animal_companion',
    name: 'Animal Companion',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Summon a powerful Animal Companion.',
    spell: [{ kind: 'summon', token: 'panther', count: 1 }],
  },

  // --- Warrior ---
  {
    id: 'shield_block',
    name: 'Shield Block',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Gain 5 Armor. Draw a card.',
    spell: [
      { kind: 'gainArmor', amount: 5 },
      { kind: 'draw', count: 1 },
    ],
  },

  // --- Paladin ---
  {
    id: 'consecration',
    name: 'Consecration',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Deal 2 damage to all enemies.',
    spell: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
  },

  // --- Warlock ---
  // Real Soulfire's discount is paid for by a discard; the engine has no discard,
  // so 4 damage costs 2 mana here.
  {
    id: 'soulfire',
    name: 'Soulfire',
    cost: 2,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'free',
    text: 'Deal 4 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 4, target: 'chosenTarget' }],
  },
  {
    id: 'flame_imp',
    name: 'Flame Imp',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '**Omen:** Deal 3 damage to your hero.',
    attack: 3,
    health: 2,
    tribe: 'demon',
    battlecry: [{ kind: 'damage', amount: 3, target: 'friendlyHero' }],
  },

  // --- Paladin weapon ---
  {
    id: 'truesilver',
    name: 'Truesilver Champion',
    cost: 4,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Whenever your hero attacks, restore 2 Health to it.',
    attack: 4,
    durability: 2,
    triggers: [{ event: 'afterAttack', effects: [{ kind: 'heal', amount: 2, target: 'friendlyHero' }] }],
  },

  // --- Rogue ---
  {
    id: 'assassinate',
    name: 'Assassinate',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Destroy an enemy minion.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },
]

export const enemyCards: CardDef[] = cards.map((c) => ({ ...c, set: 'enemy' }))
