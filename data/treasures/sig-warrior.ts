import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Banneret (warrior) signature treasure cards
// ---------------------------------------------------------------------------

/**
 * Hammer and Tongs — 7-mana legendary warrior spell.
 * Deal 3 damage to all enemies. Gain 3 Armor. Draw a card.
 * (Costed at 7: ~8 mana of raw effect was beyond even signature-treasure
 *  push; at 7 it sits ~1 above curve, in line with other signatures.)
 */
const rattlegoreChainCard: CardDef = {
  id: 'sig_warrior_rattlegore_chain',
  name: 'Hammer and Tongs',
  cost: 7,
  type: 'spell',
  cardClass: 'warrior',
  rarity: 'legendary',
  text: 'Deal 3 damage to all enemies. Gain 3 Armor. Draw a card.',
  flavor: 'Bess settles arguments the way she settles horseshoes: at full heat, with everything on the bench.',
  spell: [
    { kind: 'damage', amount: 3, target: 'allEnemyCharacters' },
    { kind: 'gainArmor', amount: 3 },
    { kind: 'draw', count: 1 },
  ],
  token: true,
  art: undefined,
}

/**
 * Headsman's Bargain — 6-mana legendary warrior spell.
 * Destroy a minion and gain 6 Armor.
 * (Fixed armor value — per-minion stat reads aren't supported by EffectSpec.
 *  Costed at 6: unconditional destroy alone is worth 5.)
 */
const deathWishCard: CardDef = {
  id: 'sig_warrior_death_wish',
  name: "Headsman's Bargain",
  cost: 6,
  type: 'spell',
  cardClass: 'warrior',
  rarity: 'legendary',
  text: 'Destroy a minion and gain 6 Armor.',
  flavor: 'Every duel in Hollowmoor is a bargain. This one has mercifully short terms.',
  targeted: true,
  targetFilter: 'allMinions',
  spell: [
    { kind: 'destroy', target: 'chosenTarget' },
    { kind: 'gainArmor', amount: 6 },
  ],
  token: true,
  art: undefined,
}

/**
 * The Forgotten Engine — 9/9 legendary warrior minion with Ward.
 * Omen: Gain 5 Armor.
 * (Was 8 mana / 7 Armor: a 9/9 Ward is ~a full 9-mana body on its own, so the
 *  old version was ~3 mana over even with signature push. Now 9 mana / 5 Armor,
 *  ~1 above curve.)
 */
const colossusCard: CardDef = {
  id: 'sig_warrior_colossus',
  name: 'The Forgotten Engine',
  cost: 9,
  type: 'minion',
  cardClass: 'warrior',
  rarity: 'legendary',
  text: '**Ward**. **Omen:** Gain 5 Armor.',
  flavor: 'Nobody remembers building it, nobody remembers winning with it, and nobody knows how to make it stop.',
  attack: 9,
  health: 9,
  tribe: 'none',
  keywords: ['taunt'],
  battlecry: [{ kind: 'gainArmor', amount: 5 }],
  token: true,
  art: undefined,
}

/**
 * The Reaping Gale — 5-mana legendary warrior spell.
 * Deal 2 damage to all minions. Equip a 4/2 weapon.
 */
const bladestormCard: CardDef = {
  id: 'sig_warrior_bladestorm',
  name: 'The Reaping Gale',
  cost: 5,
  type: 'spell',
  cardClass: 'warrior',
  rarity: 'legendary',
  text: 'Deal 2 damage to all minions. Equip a 4/2 Weapon.',
  flavor: 'When the wind comes off the gallows-hill, the wise lie flat and sinners lie flatter.',
  spell: [
    { kind: 'damage', amount: 2, target: 'allMinions' },
    { kind: 'equipWeapon', cardId: 'sig_warrior_bladestorm_axe' },
  ],
  token: true,
  art: undefined,
}

/**
 * The Reaping Gale weapon token — 4/2.
 * Defined here, also referenced in warriorCards via the sig card only.
 */
const bladestormAxeToken: CardDef = {
  id: 'sig_warrior_bladestorm_axe',
  name: 'The Reaping Gale',
  cost: 5,
  type: 'weapon',
  cardClass: 'warrior',
  rarity: 'legendary',
  text: '',
  attack: 4,
  durability: 2,
  token: true,
  art: undefined,
}

// ---------------------------------------------------------------------------
// Passive signature treasure
// ---------------------------------------------------------------------------

/**
 * The Boneyard Bulwark — Passive.
 * Your minions have +0/+1 and Ward. (Was +1/+1 and Ward — the attack half is
 * gone. As a static effect the granted Ward still feeds Ward-conditional
 * buffs.)
 */

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * All signature treasures for Bess the Blacksmith.
 */
export const warriorSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_warrior_rattlegore_chain',
    name: 'Hammer and Tongs',
    kind: 'signature',
    text: 'Deal 3 damage to all enemies. Gain 3 Armor. Draw a card.',
    card: rattlegoreChainCard,
    tags: ['warrior-good'],
  },
  {
    id: 'sig_warrior_death_wish',
    name: "Headsman's Bargain",
    kind: 'signature',
    text: 'Destroy a minion and gain 6 Armor.',
    card: deathWishCard,
    tags: ['warrior-good'],
  },
  {
    id: 'sig_warrior_colossus',
    name: 'The Forgotten Engine',
    kind: 'signature',
    text: '9/9 Ward. Omen: Gain 5 Armor.',
    card: colossusCard,
    tags: ['warrior-good'],
  },
  {
    id: 'sig_warrior_bladestorm',
    name: 'The Reaping Gale',
    kind: 'signature',
    text: 'Deal 2 damage to all minions. Equip a 4/2 Weapon.',
    card: bladestormCard,
    tags: ['warrior-good'],
  },
  {
    id: 'sig_warrior_bulwark',
    name: 'The Boneyard Bulwark',
    kind: 'signature',
    text: 'Your minions have +0/+1 and Ward.',
    auras: [
      { kind: 'minionStat', health: 1, filter: 'minion' },
      { kind: 'giveKeyword', keyword: 'taunt', filter: 'minion' },
    ],
    tags: ['warrior-good'],
  },
]

/**
 * Extra token cards generated by warrior signature cards (The Reaping Gale's
 * weapon). Export so the registry can register them.
 */
export const warriorSignatureTreasureTokens: CardDef[] = [
  bladestormAxeToken,
]
