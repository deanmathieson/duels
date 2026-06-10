import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Archwitch Willow — Warlock hero definition.
 * Theme: Demons, self-damage value, Life Tap draw, board flood with Imps.
 */
export const warlockHero: HeroDef = {
  id: 'hero_warlock',
  name: 'Archwitch Willow',
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
 * Warlock hero powers — 3 thematic options for Archwitch Willow.
 */
export const warlockHeroPowers: HeroPowerDef[] = [
  /**
   * Life Tap — the classic Warlock hero power.
   * Cost 2: Draw a card and take 2 damage.
   */
  {
    id: 'hp_warlock_life_tap',
    name: 'Life Tap',
    cost: 2,
    text: 'Draw a card and take 2 damage.',
    effects: [
      { kind: 'draw', count: 1 },
      { kind: 'damage', amount: 2, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  /**
   * Imp Summoner — Cost 2.
   * Summon a 1/1 Imp Demon.
   * (Flood the board with cheap Demons.)
   * The former "deal 1 damage to your hero" rider was a pure downside that
   * left this strictly below the Reinforce anchor (2 mana: summon a 1/1), so
   * it was trimmed; the hero power now matches that anchor exactly.
   */
  {
    id: 'hp_warlock_imp_summoner',
    name: 'Imp Summoner',
    cost: 2,
    text: 'Summon a 1/1 Imp.',
    effects: [
      { kind: 'summon', token: 'warlock_imp', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Drain Soul — Cost 3. Targeted.
   * Deal 3 damage to a minion. Restore 3 Health to your hero.
   * (Removal that fuels your life total — sacrifice and reclaim.)
   */
  {
    id: 'hp_warlock_drain_soul',
    name: 'Drain Soul',
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
