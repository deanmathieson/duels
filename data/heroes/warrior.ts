import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Bess the Blacksmith — Blacksmith (warrior) hero definition.
 * Arms like fence posts, apron full of scorch marks. Bess shoes the horses,
 * mends the ploughs, and forges whatever the village needs the night before
 * it needs it. Theme: Armor, weapons, big minions, board control.
 */
export const warriorHero: HeroDef = {
  id: 'hero_warrior',
  name: 'Bess the Blacksmith',
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
 * Bess the Blacksmith's three hero powers.
 */
export const warriorHeroPowers: HeroPowerDef[] = [
  /**
   * Hammer Out the Dents — Gain 4 Armor. (Was 2 Armor, but next to Strike
   * While It's Hot's attack+armor and Test the Edge's removal+armor it was
   * strictly the worst pick; 4 Armor makes pure defence a real option.)
   */
  {
    id: 'hp_warrior_armor_up',
    name: 'Hammer Out the Dents',
    cost: 2,
    text: 'Gain 4 Armor.',
    effects: [{ kind: 'gainArmor', amount: 4 }],
    art: undefined,
  },

  /**
   * Strike While It's Hot — Give your hero +2 Attack this turn. Gain 1 Armor.
   * (Trimmed from +3: a repeatable 2-mana power should be ~1 mana of effect;
   *  +3 Attack plus Armor every turn was nearly double that.)
   */
  {
    id: 'hp_warrior_battle_stance',
    name: "Strike While It's Hot",
    cost: 2,
    text: 'Give your hero +2 Attack this turn. Gain 1 Armor.',
    effects: [
      { kind: 'heroAttackThisTurn', amount: 2 },
      { kind: 'gainArmor', amount: 1 },
    ],
    art: undefined,
  },

  /**
   * Test the Edge — Deal 3 damage to a minion. Gain 2 Armor.
   * Fresh off the grindstone, and someone has to hold still for it.
   */
  {
    id: 'hp_warrior_execute_strike',
    name: 'Test the Edge',
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
