import type { HeroDef, HeroPowerDef } from '../game/types'

/**
 * Farmer Greg — the Farmer of Hollowmoor.
 *
 * Wellies, pitchfork, and a field where something is always screaming.
 * Greg grows what the moor lets him: mandrakes by the gallows, briar that
 * comes back overnight, a prize marrow he doesn't turn his back on. He's
 * not a clever man, but the crops do what he says, and that frightens
 * everyone who IS clever. Ask him how the harvest's looking and he'll say
 * "can't complain" — over the sound of the harvest, complaining.
 */
export const heroes: HeroDef[] = [
  {
    id: 'forest_warden_omu',
    name: 'Farmer Greg',
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
 * All hero power definitions: Farmer Greg's 3 powers +
 * the 6 enemy hero powers used by Worker D enemies.
 */
export const heroPowers: HeroPowerDef[] = [
  // --- Farmer Greg's hero powers ---
  {
    id: 'hp_natures_gifts',
    name: 'Elbow Grease',
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
    name: 'Hearty Breakfast',
    cost: 2,
    text: 'Reduce the Cost of cards in your hand that cost (5) or more by (1).',
    effects: [{ kind: 'reduceCostInHand', amount: 1, minCost: 5 }],
    art: undefined,
  },
  {
    id: 'hp_harvest_time',
    name: 'Pull the Mandrake!',
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
    name: 'Scalding Eye',
    cost: 2,
    text: 'Deal 1 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    effects: [{ kind: 'damage', amount: 1, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'hp_steady_shot',
    name: 'A Quarrel Loosed',
    cost: 2,
    text: 'Deal 2 damage to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
    art: undefined,
  },
  {
    id: 'hp_reinforce',
    name: 'Ring the Curfew Bell',
    cost: 2,
    // Summons the paladin 1/1 token (paladin_recruit), whose display name is
    // 'Wickling', so the text says "Wickling" to match.
    text: 'Summon a 1/1 Wickling.',
    effects: [{ kind: 'summon', token: 'paladin_recruit', count: 1 }],
    art: undefined,
  },
  {
    id: 'hp_life_tap',
    name: 'Blood for Ink',
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
    name: 'Batten the Shutters!',
    cost: 2,
    text: 'Gain 2 Armor.',
    effects: [{ kind: 'gainArmor', amount: 2 }],
    art: undefined,
  },
  {
    id: 'hp_lesser_heal',
    name: 'Spit and Cobwebs',
    cost: 2,
    text: 'Restore 2 Health.',
    targeted: true,
    targetFilter: 'allCharacters',
    effects: [{ kind: 'heal', amount: 2, target: 'chosenTarget' }],
    art: undefined,
  },
]
