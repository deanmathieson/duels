import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Token cards referenced by signature treasure cards.
// These must ALSO be listed in warlockCards (data/cards/warlock.ts) so they
// are registered in the card DB. The definitions here are inlined inside the
// signature card objects; the canonical registrations are in warlock.ts.
// ---------------------------------------------------------------------------

/**
 * Toadstool Court — 5-mana Bargainer signature card.
 * At the end of your turn, summon three 1/1 Pennywisps.
 * (Continuous board flood; trigger fires until silenced/destroyed.)
 */
const netherPortalCard: CardDef = {
  id: 'sig_warlock_nether_portal',
  name: 'Toadstool Court',
  cost: 5,
  type: 'minion',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'At the end of your turn, summon three 1/1 Pennywisps.',
  flavor: 'Dance in the ring once and you owe a jig. Dance twice and you owe a child.',
  attack: 0,
  health: 5,
  tribe: 'demon',
  triggers: [
    {
      event: 'endOfTurn',
      effects: [{ kind: 'summon', token: 'warlock_imp', count: 3 }],
    },
  ],
  token: true,
}

/**
 * The Signing Knife — 2/3 Bargainer weapon.
 * After you play a minion, give your hero +2 Attack this turn.
 * (Equip it and every new body keeps the blade warm.)
 * The trigger vocabulary has no tribe condition, so the onPlayMinion trigger
 * fires for ANY minion — text says "minion", not "Fae".
 */
const ritualDaggerCard: CardDef = {
  id: 'sig_warlock_ritual_dagger',
  name: 'The Signing Knife',
  cost: 3,
  type: 'weapon',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'After you play a minion, give your hero +2 Attack this turn.',
  flavor: 'Every bargain wants its drop of red. The knife remembers every signature it ever opened.',
  attack: 2,
  durability: 3,
  triggers: [
    {
      event: 'onPlayMinion',
      effects: [{ kind: 'heroAttackThisTurn', amount: 2 }],
    },
  ],
  token: true,
}

/**
 * Mire-Milk — 4-mana Bargainer spell.
 * Give ALL friendly minions +2/+2 and Leeching.
 * (Empower your fae rabble and drain life back.)
 * Cost 3 → 4: a whole-board +2/+2 alone is ~4 mana at buff anchors, plus
 * board-wide Leeching; 4 keeps it pushed (~1 mana above curve) without being
 * egregious for a signature build-around.
 */
const soulInfusionCard: CardDef = {
  id: 'sig_warlock_soul_infusion',
  name: 'Mire-Milk',
  cost: 4,
  type: 'spell',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'Give your minions +2/+2 and **Leeching**.',
  flavor: 'One swig and the rabble grows teeth. Two, and the teeth grow opinions.',
  spell: [
    { kind: 'buff', atk: 2, health: 2, target: 'friendlyMinions' },
    { kind: 'giveKeyword', keyword: 'lifesteal', target: 'friendlyMinions' },
  ],
  token: true,
}

/**
 * Mortgaged to the Marrow — 6-mana Bargainer spell.
 * Deal 6 damage to your hero. Draw 4 cards.
 * Gain 6 Armor.
 * (Massive self-damage, massive draw, massive protection — all-in Bargainer style.)
 */
const darkCovenantCard: CardDef = {
  id: 'sig_warlock_dark_covenant',
  name: 'Mortgaged to the Marrow',
  cost: 6,
  type: 'spell',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'Deal 6 damage to your hero. Draw 4 cards. Gain 6 Armor.',
  flavor: 'Sign here, initial there, bleed everywhere. The terms are generous; the collateral is you.',
  spell: [
    { kind: 'damage', amount: 6, target: 'friendlyHero' },
    { kind: 'draw', count: 4 },
    { kind: 'gainArmor', amount: 6 },
  ],
  token: true,
}

/**
 * All Bargainer signature treasures for Mistress Maundy.
 *
 * sig_warlock_demonic_tide is a PASSIVE treasure (no card) — an aura that
 * gives all friendly minions +1/+1 while active (the aura vocabulary has no
 * tribe CardFilter, so the text says "minions" to match the behaviour).
 */
export const warlockSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_warlock_nether_portal',
    name: 'Toadstool Court',
    kind: 'signature',
    text: '0/5 Fae. At the end of your turn, summon three 1/1 Pennywisps.',
    card: netherPortalCard,
    tags: ['warlock-good', 'flood'],
  },
  {
    id: 'sig_warlock_ritual_dagger',
    name: 'The Signing Knife',
    kind: 'signature',
    text: '2/3 Weapon. After you play a minion, give your hero +2 Attack this turn.',
    card: ritualDaggerCard,
    tags: ['warlock-good', 'weapon'],
  },
  {
    id: 'sig_warlock_soul_infusion',
    name: 'Mire-Milk',
    kind: 'signature',
    text: 'Give your minions +2/+2 and **Leeching**.',
    card: soulInfusionCard,
    tags: ['warlock-good', 'buff'],
  },
  {
    id: 'sig_warlock_dark_covenant',
    name: 'Mortgaged to the Marrow',
    kind: 'signature',
    text: 'Deal 6 damage to your hero. Draw 4 cards. Gain 6 Armor.',
    card: darkCovenantCard,
    tags: ['warlock-good', 'draw'],
  },
  {
    id: 'sig_warlock_demonic_tide',
    name: 'Sweetened Terms',
    kind: 'signature',
    text: 'Your minions have +1/+1.',
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'all' }],
    tags: ['warlock-good', 'passive', 'aura'],
  },
]
