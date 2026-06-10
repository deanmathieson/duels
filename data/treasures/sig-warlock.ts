import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Token cards referenced by signature treasure cards.
// These must ALSO be listed in warlockCards (data/cards/warlock.ts) so they
// are registered in the card DB. The definitions here are inlined inside the
// signature card objects; the canonical registrations are in warlock.ts.
// ---------------------------------------------------------------------------

/**
 * Nether Portal — 5-mana Warlock spell.
 * At the end of your turn, summon three 1/1 Imps.
 * (Continuous board flood; trigger fires until silenced/destroyed.)
 */
const netherPortalCard: CardDef = {
  id: 'sig_warlock_nether_portal',
  name: 'Nether Portal',
  cost: 5,
  type: 'minion',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'At the end of your turn, summon three 1/1 Imps.',
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
 * Ritual Dagger — 2/3 Warlock weapon.
 * After you play a minion, give your hero +2 Attack this turn.
 * (Equip it and your minions keep sharpening the blade.)
 * Approximated: the trigger vocabulary has no Demon condition, so the
 * onPlayMinion trigger fires for ANY minion — text says "minion", not "Demon".
 */
const ritualDaggerCard: CardDef = {
  id: 'sig_warlock_ritual_dagger',
  name: 'Ritual Dagger',
  cost: 3,
  type: 'weapon',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'After you play a minion, give your hero +2 Attack this turn.',
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
 * Soul Infusion — 4-mana Warlock spell.
 * Give ALL friendly minions +2/+2 and Lifesteal.
 * (Empower your Demon horde and drain life back.)
 * Cost 3 → 4: a whole-board +2/+2 alone is ~4 mana at buff anchors, plus
 * board-wide Lifesteal; 4 keeps it pushed (~1 mana above curve) without being
 * egregious for a signature build-around.
 */
const soulInfusionCard: CardDef = {
  id: 'sig_warlock_soul_infusion',
  name: 'Soul Infusion',
  cost: 4,
  type: 'spell',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'Give your minions +2/+2 and **Lifesteal**.',
  spell: [
    { kind: 'buff', atk: 2, health: 2, target: 'friendlyMinions' },
    { kind: 'giveKeyword', keyword: 'lifesteal', target: 'friendlyMinions' },
  ],
  token: true,
}

/**
 * Dark Covenant — 6-mana Warlock spell.
 * Deal 6 damage to your hero. Draw 4 cards.
 * Gain 6 Armor.
 * (Massive self-damage, massive draw, massive protection — all-in Warlock style.)
 */
const darkCovenantCard: CardDef = {
  id: 'sig_warlock_dark_covenant',
  name: 'Dark Covenant',
  cost: 6,
  type: 'spell',
  cardClass: 'warlock',
  rarity: 'legendary',
  text: 'Deal 6 damage to your hero. Draw 4 cards. Gain 6 Armor.',
  spell: [
    { kind: 'damage', amount: 6, target: 'friendlyHero' },
    { kind: 'draw', count: 4 },
    { kind: 'gainArmor', amount: 6 },
  ],
  token: true,
}

/**
 * All Warlock signature treasures for Archwitch Willow.
 *
 * sig_warlock_demonic_tide is a PASSIVE treasure (no card) — an aura that
 * gives all friendly minions +1/+1 while active (the aura vocabulary has no
 * Demon CardFilter, so the text says "minions" to match the behaviour).
 */
export const warlockSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_warlock_nether_portal',
    name: 'Nether Portal',
    kind: 'signature',
    text: '0/5 Demon. At the end of your turn, summon three 1/1 Imps.',
    card: netherPortalCard,
    tags: ['warlock-good', 'flood'],
  },
  {
    id: 'sig_warlock_ritual_dagger',
    name: 'Ritual Dagger',
    kind: 'signature',
    text: '2/3 Weapon. After you play a minion, give your hero +2 Attack this turn.',
    card: ritualDaggerCard,
    tags: ['warlock-good', 'weapon'],
  },
  {
    id: 'sig_warlock_soul_infusion',
    name: 'Soul Infusion',
    kind: 'signature',
    text: 'Give your minions +2/+2 and **Lifesteal**.',
    card: soulInfusionCard,
    tags: ['warlock-good', 'buff'],
  },
  {
    id: 'sig_warlock_dark_covenant',
    name: 'Dark Covenant',
    kind: 'signature',
    text: 'Deal 6 damage to your hero. Draw 4 cards. Gain 6 Armor.',
    card: darkCovenantCard,
    tags: ['warlock-good', 'draw'],
  },
  {
    id: 'sig_warlock_demonic_tide',
    name: 'Demonic Tide',
    kind: 'signature',
    text: 'PASSIVE: Your minions have +1/+1.',
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'all' }],
    tags: ['warlock-good', 'passive', 'aura'],
  },
]
