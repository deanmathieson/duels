import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Signature treasure card definitions for Instructor Fireheart (Shaman).
// ---------------------------------------------------------------------------

/**
 * Doomhammer — 2/8 weapon.
 * After your hero attacks, deal 1 damage to all enemies.
 * (The "deal 1 to all enemies after attack" is modelled as an afterAttack trigger.
 * Hero Windfury — attacking twice a turn — is not supported by the engine, so the
 * keyword was dropped; the high durability and the AoE ping carry the identity.)
 */
const doomhammerCard: CardDef = {
  id: 'sig_shaman_doomhammer',
  name: 'Doomhammer',
  cost: 5,
  type: 'weapon',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'After your hero attacks, deal 1 damage to all enemies.',
  attack: 2,
  durability: 8,
  triggers: [
    {
      event: 'afterAttack',
      effects: [{ kind: 'damage', amount: 1, target: 'allEnemyCharacters' }],
    },
  ],
  token: true,
}

/**
 * Storm Caller — 4/4 Elemental. Legendary.
 * Battlecry: Deal 2 damage to all enemy minions. Give your other minions +2 Attack this turn.
 */
const stormCallerCard: CardDef = {
  id: 'sig_shaman_storm_caller',
  name: 'Storm Caller',
  cost: 6,
  type: 'minion',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: '**Battlecry:** Deal 2 damage to all enemy minions. Give your other minions +2 Attack this turn.',
  attack: 4,
  health: 4,
  tribe: 'elemental',
  battlecry: [
    { kind: 'damage', amount: 2, target: 'enemyMinions' },
    { kind: 'buffThisTurn', atk: 2, target: 'otherFriendlyMinions' },
  ],
  token: true,
}

/**
 * Tide Pool — 2 mana Shaman spell. Legendary signature.
 * Summon a Healing Stream Totem and a Wrath of Air Totem. Draw a card.
 */
const tidePoolCard: CardDef = {
  id: 'sig_shaman_tide_pool',
  name: 'Tide Pool',
  cost: 2,
  type: 'spell',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'Summon a Healing Stream Totem and a Wrath of Air Totem. Draw a card.',
  spell: [
    { kind: 'summon', token: 'shaman_token_healing_stream_totem', count: 1 },
    { kind: 'summon', token: 'shaman_token_wrath_of_air_totem', count: 1 },
    { kind: 'draw', count: 1 },
  ],
  token: true,
}

/**
 * Ancestral Spirits — 3-mana Shaman spell signature card.
 * Give your minions +1/+1 and Rush; add a 3/5 Lightning Elemental to your hand.
 * (Real-Duels version grants a resummon Deathrattle; the engine has no
 * "resummon on death" EffectSpec, so the spirits are modelled as a board buff
 * plus an Elemental added to hand.)
 */
const ancestralSpiritsCard: CardDef = {
  id: 'sig_shaman_ancestral_spirits',
  name: 'Ancestral Spirits',
  cost: 3,
  type: 'spell',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'Give your minions +1/+1 and **Rush**. Add a 3/5 Lightning Elemental to your hand.',
  spell: [
    { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
    { kind: 'giveKeyword', keyword: 'rush', target: 'friendlyMinions' },
    { kind: 'addCardToHand', cardId: 'shaman_token_lightning_elemental', count: 1 },
  ],
  token: true,
}

/**
 * Spirit of the Elements — 5/5 Elemental. Legendary.
 * At the start of your turn, give all friendly minions +1/+1 and Windfury.
 * (Keyword grants are permanent in the engine — there is no "this turn" variant —
 * so the text promises the permanent Windfury the data actually delivers.)
 */
const spiritOfTheElementsCard: CardDef = {
  id: 'sig_shaman_spirit_of_the_elements',
  name: 'Spirit of the Elements',
  cost: 7,
  type: 'minion',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'At the start of your turn, give your minions +1/+1 and **Windfury**.',
  attack: 5,
  health: 5,
  tribe: 'elemental',
  triggers: [
    {
      event: 'startOfTurn',
      effects: [
        { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
        { kind: 'giveKeyword', keyword: 'windfury', target: 'friendlyMinions' },
      ],
    },
  ],
  token: true,
}

/**
 * All five signature treasures for Instructor Fireheart.
 */
export const shamanSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_shaman_doomhammer',
    name: 'Doomhammer',
    kind: 'signature',
    text: 'Weapon (2/8). After your hero attacks, deal 1 damage to all enemies.',
    card: doomhammerCard,
    tags: ['shaman-good', 'weapon', 'aggro'],
  },
  {
    id: 'sig_shaman_storm_caller',
    name: 'Storm Caller',
    kind: 'signature',
    text: '4/4 Elemental. Battlecry: Deal 2 damage to all enemy minions. Give your other minions +2 Attack this turn.',
    card: stormCallerCard,
    tags: ['shaman-good', 'elemental', 'board-clear'],
  },
  {
    id: 'sig_shaman_tide_pool',
    name: 'Tide Pool',
    kind: 'signature',
    text: '(2) Spell. Summon a Healing Stream Totem and a Wrath of Air Totem. Draw a card.',
    card: tidePoolCard,
    tags: ['shaman-good', 'totem', 'tempo'],
  },
  {
    id: 'sig_shaman_ancestral_spirits',
    name: 'Ancestral Spirits',
    kind: 'signature',
    text: 'Give your minions +1/+1 and Rush. Add a 3/5 Lightning Elemental to your hand.',
    card: ancestralSpiritsCard,
    tags: ['shaman-good', 'buff', 'value'],
  },
  {
    id: 'sig_shaman_spirit_of_the_elements',
    name: 'Spirit of the Elements',
    kind: 'signature',
    text: '5/5 Elemental. At the start of your turn, give your minions +1/+1 and Windfury.',
    card: spiritOfTheElementsCard,
    tags: ['shaman-good', 'elemental', 'buff'],
  },
]
