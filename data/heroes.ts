import type { HeroDef, HeroPowerDef } from '../game/types'

/**
 * Old Nan Nettlebed — the Hedgewitch of Hollowmoor.
 *
 * Every village in the county keeps a hedgewitch; Hollowmoor keeps THE
 * hedgewitch. Nan has outlived four husbands (three of them properly dead),
 * brews remedies the church has twice tried to ban and once tried to buy,
 * and holds the only standing bargain with the Briar — the crooked green
 * dark that grows back overnight no matter what is done to it. Cross her
 * and you'll wake up wed to a mandrake. Pay her and you'll get exactly what
 * you asked for, which is worse. Her cures all work; they simply have a
 * sense of humour.
 */
export const heroes: HeroDef[] = [
  {
    id: 'forest_warden_omu',
    name: 'Old Nan Nettlebed',
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
 * All hero power definitions: Old Nan Nettlebed's 3 powers +
 * the 6 enemy hero powers used by Worker D enemies.
 */
export const heroPowers: HeroPowerDef[] = [
  // --- Hedgewitch hero powers ---
  {
    id: 'hp_natures_gifts',
    name: "A Witch's Bargain",
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
    name: 'Strong Medicine',
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
