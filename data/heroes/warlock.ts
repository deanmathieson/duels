import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Pawnbroker Paul — Pawnbroker hero definition.
 * Three brass balls over the door and a ledger nobody reads twice. Paul
 * lends against anything: watches, wedding rings, years off your life.
 * Theme: Fae creditors, self-damage value, blood-bought draw, board flood
 * with Pennywisps.
 */
export const warlockHero: HeroDef = {
  id: 'hero_warlock',
  name: 'Pawnbroker Paul',
  cardClass: 'warlock',
  heroPowers: [
    'hp_warlock_life_tap',
    'hp_warlock_imp_summoner',
    'hp_warlock_drain_soul',
  ],
  signatureTreasures: [
    'sig_warlock_nether_portal',
    'sig_warlock_ritual_dagger',
    'sig_warlock_soul_infusion',
    'sig_warlock_dark_covenant',
    'sig_warlock_demonic_tide',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Pawnbroker hero powers — 3 thematic options for Pawnbroker Paul.
 */
export const warlockHeroPowers: HeroPowerDef[] = [
  /**
   * Open a Vein — the classic Bargainer hero power.
   * Cost 2: Draw a card and take 2 damage. Knowledge is paid for in blood.
   */
  {
    id: 'hp_warlock_life_tap',
    name: 'Open a Vein',
    cost: 2,
    text: 'Draw a card and take 2 damage.',
    effects: [
      { kind: 'draw', count: 1 },
      { kind: 'damage', amount: 2, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  /**
   * Whistle Up a Wisp — Cost 2.
   * Summon a 1/1 Pennywisp.
   * (Flood the board with cheap fae.)
   * The former "deal 1 damage to your hero" rider was a pure downside that
   * left this strictly below the 2-mana summon-a-1/1 anchor, so it was
   * trimmed; the hero power now matches that anchor exactly.
   */
  {
    id: 'hp_warlock_imp_summoner',
    name: 'Whistle Up a Wisp',
    cost: 2,
    text: 'Summon a 1/1 Pennywisp.',
    effects: [
      { kind: 'summon', token: 'warlock_imp', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Collect the Debt — Cost 3. Targeted.
   * Deal 3 damage to a minion. Restore 3 Health to your hero.
   * (Removal that feeds your life total — the ledger always balances.)
   */
  {
    id: 'hp_warlock_drain_soul',
    name: 'Collect the Debt',
    cost: 3,
    text: 'Deal 3 damage to a minion. Restore 3 Health to your hero.',
    targeted: true,
    targetFilter: 'allMinions',
    effects: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'heal', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },
]
