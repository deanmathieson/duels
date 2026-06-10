import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Signature treasure card definitions for Granny Mireweather (Augur).
// ---------------------------------------------------------------------------

/**
 * Steeple-Splitter — 2/8 weapon.
 * After your hero attacks, deal 1 damage to all enemies.
 * (The "deal 1 to all enemies after attack" is modelled as an afterAttack trigger.
 * Hero Flurry — attacking twice a turn — is not supported by the engine, so the
 * high durability and the AoE ping carry the identity.)
 */
const doomhammerCard: CardDef = {
  id: 'sig_shaman_doomhammer',
  name: 'Steeple-Splitter',
  cost: 5,
  type: 'weapon',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'After your hero attacks, deal 1 damage to all enemies.',
  flavor: "God's own lightning rod, repossessed. The verger has stopped repainting the spire.",
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
 * The Storm-Hawker — 4/4 Spirit. Legendary.
 * Omen: Deal 2 damage to all enemy minions. Give your other minions +2 Attack this turn.
 */
const stormCallerCard: CardDef = {
  id: 'sig_shaman_storm_caller',
  name: 'The Storm-Hawker',
  cost: 6,
  type: 'minion',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: '**Omen:** Deal 2 damage to all enemy minions. Give your other minions +2 Attack this turn.',
  flavor: 'Tempests for sale, slightly used. No refunds once the thunder starts.',
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
 * The Scrying Pool — 2 mana Augur spell. Legendary signature.
 * Summon a Rain-Calling Effigy and a Weathervane Effigy. Draw a card.
 */
const tidePoolCard: CardDef = {
  id: 'sig_shaman_tide_pool',
  name: 'The Scrying Pool',
  cost: 2,
  type: 'spell',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'Summon a Rain-Calling Effigy and a Weathervane Effigy. Draw a card.',
  flavor: 'Every puddle in Hollowmoor shows tomorrow. Most folk stop looking after one peek.',
  spell: [
    { kind: 'summon', token: 'shaman_token_healing_stream_totem', count: 1 },
    { kind: 'summon', token: 'shaman_token_wrath_of_air_totem', count: 1 },
    { kind: 'draw', count: 1 },
  ],
  token: true,
}

/**
 * The Riotous Wake — 3-mana Augur spell signature card.
 * Give your minions +1/+1 and Rush; add a 3/5 Storm-Bought Spirit to your hand.
 * (The restless kin are modelled as a board buff plus a Spirit added to hand.)
 */
const ancestralSpiritsCard: CardDef = {
  id: 'sig_shaman_ancestral_spirits',
  name: 'The Riotous Wake',
  cost: 3,
  type: 'spell',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'Give your minions +1/+1 and **Rush**. Add a 3/5 Storm-Bought Spirit to your hand.',
  flavor: 'The mourners drank the cellar dry, so the dead got up to fetch the next barrel.',
  spell: [
    { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
    { kind: 'giveKeyword', keyword: 'rush', target: 'friendlyMinions' },
    { kind: 'addCardToHand', cardId: 'shaman_token_lightning_elemental', count: 1 },
  ],
  token: true,
}

/**
 * The Living Weather — 5/5 Spirit. Legendary.
 * At the start of your turn, give all friendly minions +1/+1 and Flurry.
 * (Keyword grants are permanent in the engine — there is no "this turn" variant —
 * so the text promises the permanent Flurry the data actually delivers.)
 */
const spiritOfTheElementsCard: CardDef = {
  id: 'sig_shaman_spirit_of_the_elements',
  name: 'The Living Weather',
  cost: 7,
  type: 'minion',
  cardClass: 'shaman',
  rarity: 'legendary',
  text: 'At the start of your turn, give your minions +1/+1 and **Flurry**.',
  flavor: "Hollowmoor's weather doesn't come down from the sky. It comes out of a grudge.",
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
 * All five signature treasures for Granny Mireweather.
 */
export const shamanSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_shaman_doomhammer',
    name: 'Steeple-Splitter',
    kind: 'signature',
    text: 'Weapon (2/8). After your hero attacks, deal 1 damage to all enemies.',
    card: doomhammerCard,
    tags: ['shaman-good', 'weapon', 'aggro'],
  },
  {
    id: 'sig_shaman_storm_caller',
    name: 'The Storm-Hawker',
    kind: 'signature',
    text: '4/4 Spirit. Omen: Deal 2 damage to all enemy minions. Give your other minions +2 Attack this turn.',
    card: stormCallerCard,
    tags: ['shaman-good', 'elemental', 'board-clear'],
  },
  {
    id: 'sig_shaman_tide_pool',
    name: 'The Scrying Pool',
    kind: 'signature',
    text: '(2) Spell. Summon a Rain-Calling Effigy and a Weathervane Effigy. Draw a card.',
    card: tidePoolCard,
    tags: ['shaman-good', 'totem', 'tempo'],
  },
  {
    id: 'sig_shaman_ancestral_spirits',
    name: 'The Riotous Wake',
    kind: 'signature',
    text: 'Give your minions +1/+1 and Rush. Add a 3/5 Storm-Bought Spirit to your hand.',
    card: ancestralSpiritsCard,
    tags: ['shaman-good', 'buff', 'value'],
  },
  {
    id: 'sig_shaman_spirit_of_the_elements',
    name: 'The Living Weather',
    kind: 'signature',
    text: '5/5 Spirit. At the start of your turn, give your minions +1/+1 and Flurry.',
    card: spiritOfTheElementsCard,
    tags: ['shaman-good', 'elemental', 'buff'],
  },
]
