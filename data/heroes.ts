import type { HeroDef, HeroPowerDef } from '../game/types'

/**
 * Forest Warden Omu hero definition.
 */
export const heroes: HeroDef[] = [
  {
    id: 'forest_warden_omu',
    name: 'Forest Warden Omu',
    cardClass: 'druid',
    heroPowers: ['hp_natures_gifts', 'hp_invigorating_bloom', 'hp_harvest_time'],
    signatureTreasures: [
      'sig_wardens_insight',
      'sig_herding_horn',
      'sig_marvelous_mycelium',
      'sig_awakened_ancient',
      'sig_zukara',
      'sig_moonbeast',
    ],
    art: undefined,
    portraitArt: undefined,
  },
]

/**
 * All hero power definitions: Forest Warden Omu's 3 powers +
 * the 6 enemy hero powers used by Worker D enemies.
 */
export const heroPowers: HeroPowerDef[] = [
  // --- Omu hero powers ---
  {
    id: 'hp_natures_gifts',
    name: "Nature's Gifts",
    cost: 2,
    text: 'Choose One - +2 Attack this turn; or Spell Damage +2 this turn.',
    chooseOne: [
      {
        text: '+2 Attack this turn.',
        effects: [{ kind: 'heroAttackThisTurn', amount: 2 }],
      },
      {
        text: 'Spell Damage +2 this turn.',
        effects: [{ kind: 'spellDamageThisTurnHero', amount: 2 }],
      },
    ],
    art: undefined,
  },
  {
    id: 'hp_invigorating_bloom',
    name: 'Invigorating Bloom',
    cost: 2,
    text: 'Reduce the Cost of cards in your hand that cost (5) or more by (1).',
    effects: [{ kind: 'reduceCostInHand', amount: 1, minCost: 5 }],
    art: undefined,
  },
  {
    id: 'hp_harvest_time',
    name: 'Harvest Time!',
    cost: 3,
    text: "Destroy a minion, then summon two 1/1 Saplings for that minion's owner.",
    targeted: true,
    targetFilter: 'allMinions',
    scriptId: 'harvestTime',
    art: undefined,
  },

  // --- Enemy hero powers ---
  {
    id: 'hp_fireblast',
    name: 'Fireblast',
    cost: 2,
    text: 'Deal 1 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    effects: [{ kind: 'damage', amount: 1, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'hp_steady_shot',
    name: 'Steady Shot',
    cost: 2,
    text: 'Deal 2 damage to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
    art: undefined,
  },
  {
    id: 'hp_reinforce',
    name: 'Reinforce',
    cost: 2,
    // No silver_hand_recruit token exists; summons the paladin 1/1 Recruit
    // token (previously a Sapling), so the text says "Recruit" to match.
    text: 'Summon a 1/1 Recruit.',
    effects: [{ kind: 'summon', token: 'paladin_recruit', count: 1 }],
    art: undefined,
  },
  {
    id: 'hp_life_tap',
    name: 'Life Tap',
    cost: 2,
    text: 'Draw a card and take 2 damage.',
    effects: [
      { kind: 'draw', count: 1 },
      { kind: 'damage', amount: 2, target: 'friendlyHero' },
    ],
    art: undefined,
  },
  {
    id: 'hp_armor_up',
    name: 'Armor Up!',
    cost: 2,
    text: 'Gain 2 Armor.',
    effects: [{ kind: 'gainArmor', amount: 2 }],
    art: undefined,
  },
  {
    id: 'hp_lesser_heal',
    name: 'Lesser Heal',
    cost: 2,
    text: 'Restore 2 Health.',
    targeted: true,
    targetFilter: 'allCharacters',
    effects: [{ kind: 'heal', amount: 2, target: 'chosenTarget' }],
    art: undefined,
  },
]
