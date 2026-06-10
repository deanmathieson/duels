import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Ser Wystan Crowmarch — Banneret (warrior) hero definition.
 * The last knight of a mortgaged keep: rusting plate, tavern debts, and a
 * tourney title nobody dares ask him to defend.
 * Theme: Armor, weapons, big minions, board control.
 */
export const warriorHero: HeroDef = {
  id: 'hero_warrior',
  name: 'Ser Wystan Crowmarch',
  cardClass: 'warrior',
  heroPowers: [
    'hp_warrior_armor_up',
    'hp_warrior_battle_stance',
    'hp_warrior_execute_strike',
  ],
  signatureTreasures: [
    'sig_warrior_rattlegore_chain',
    'sig_warrior_death_wish',
    'sig_warrior_colossus',
    'sig_warrior_bladestorm',
    'sig_warrior_bulwark',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Ser Wystan Crowmarch's three hero powers.
 */
export const warriorHeroPowers: HeroPowerDef[] = [
  /**
   * Don the Dents — Gain 4 Armor. (Was 2 Armor, but next to Drunkard's
   * Guard's attack+armor and Headsman's Due's removal+armor it was strictly
   * the worst pick; 4 Armor makes pure defence a real option.)
   */
  {
    id: 'hp_warrior_armor_up',
    name: 'Don the Dents',
    cost: 2,
    text: 'Gain 4 Armor.',
    effects: [{ kind: 'gainArmor', amount: 4 }],
    art: undefined,
  },

  /**
   * Drunkard's Guard — Give your hero +2 Attack this turn. Gain 1 Armor.
   * (Trimmed from +3: a repeatable 2-mana power should be ~1 mana of effect;
   *  +3 Attack plus Armor every turn was nearly double that.)
   */
  {
    id: 'hp_warrior_battle_stance',
    name: "Drunkard's Guard",
    cost: 2,
    text: 'Give your hero +2 Attack this turn. Gain 1 Armor.',
    effects: [
      { kind: 'heroAttackThisTurn', amount: 2 },
      { kind: 'gainArmor', amount: 1 },
    ],
    art: undefined,
  },

  /**
   * Headsman's Due — Deal 3 damage to a minion. Gain 2 Armor.
   */
  {
    id: 'hp_warrior_execute_strike',
    name: "Headsman's Due",
    cost: 3,
    text: 'Deal 3 damage to a minion. Gain 2 Armor.',
    targeted: true,
    targetFilter: 'allMinions',
    effects: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'gainArmor', amount: 2 },
    ],
    art: undefined,
  },
]
