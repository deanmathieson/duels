import type { BucketDef } from '../../game/types'

/**
 * Warrior archetype buckets for Duels reward picks.
 * Each bucket holds 3 thematically-linked card ids drawn from warriorCards
 * and the stable neutral ids.
 *
 * Archetypes covered:
 *   weapons, armor/control, enrage/whirlwind, rush/aggro, taunt wall,
 *   removal, big minions, card draw/value, early game, tempo curve,
 *   finishers/legendaries.
 */
export const warriorBuckets: BucketDef[] = [
  // ---------------------------------------------------------------------------
  // Weapons — forge a powerful weapon and swing face or trade efficiently.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_weapons',
    name: 'The Pawnshop Arsenal',
    cardClass: 'warrior',
    cardIds: ['warrior_fiery_war_axe', 'warrior_deaths_bite', 'warrior_gorehowl'],
  },

  // ---------------------------------------------------------------------------
  // Armor & Control — stack armor, outlast threats, stabilise the game.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_armor',
    name: 'Rust and Ramparts',
    cardClass: 'warrior',
    cardIds: ['warrior_shield_block', 'warrior_shieldmaiden', 'warrior_alley_armorsmith'],
  },

  // ---------------------------------------------------------------------------
  // Enrage / Whirlwind — trigger enrage minions with cheap pings and AoE.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_enrage',
    name: 'Bad Blood Rising',
    cardClass: 'warrior',
    cardIds: ['warrior_whirlwind', 'warrior_frothing_berserker', 'warrior_ravaging_ghoul'],
  },

  // ---------------------------------------------------------------------------
  // Rush & Aggro — go fast, deploy Rush minions, and press the enemy hero.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_rush',
    name: 'The Drunken Charge',
    cardClass: 'warrior',
    cardIds: ['warrior_korkron_elite', 'warrior_militia_commander', 'warrior_commanding_shout'],
  },

  // ---------------------------------------------------------------------------
  // Taunt Wall — force the opponent to fight through a wall of taunts.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_taunts',
    name: 'Hold the Lych-Gate',
    cardClass: 'warrior',
    cardIds: ['warrior_bloodhoof_brave', 'warrior_siege_engine', 'sen_jin_shieldmasta'],
  },

  // ---------------------------------------------------------------------------
  // Removal Package — targeted answers to deal with the opponent's threats.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_removal',
    name: 'Gallows Justice',
    cardClass: 'warrior',
    cardIds: ['warrior_execute', 'warrior_shield_slam', 'warrior_bash'],
  },

  // ---------------------------------------------------------------------------
  // Big Minions — slam down massive bodies that win the board on their own.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_big_minions',
    name: 'The Heavy Levy',
    cardClass: 'warrior',
    cardIds: ['war_golem', 'boulderfist_ogre', 'chillwind_yeti'],
  },

  // ---------------------------------------------------------------------------
  // Card Draw & Value — refill the hand to keep the late game engine running.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_value',
    name: 'The Tavern Council',
    cardClass: 'warrior',
    cardIds: ['warrior_slam', 'warrior_battle_rage', 'gnomish_inventor'],
  },

  // ---------------------------------------------------------------------------
  // Early Game — cheap plays that establish the board in the first few turns.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_early_game',
    name: 'Cheap Shots',
    cardClass: 'warrior',
    cardIds: ['warrior_upgrade', 'warrior_heroic_strike', 'elven_archer'],
  },

  // ---------------------------------------------------------------------------
  // Tempo Curve — efficient threats and spells that swing board and mana.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_tempo',
    name: 'March of the Banneret',
    cardClass: 'warrior',
    cardIds: ['warrior_cruel_taskmaster', 'warrior_warsong_commander', 'warrior_cleave'],
  },

  // ---------------------------------------------------------------------------
  // Finishers & Legendaries — high-cost legends to close out the game.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_finishers',
    name: 'For the County!',
    cardClass: 'warrior',
    cardIds: ['warrior_grommash_hellscream', 'warrior_varian_wrynn', 'warrior_rattlegore'],
  },

  // ---------------------------------------------------------------------------
  // Board Wipe — clear the enemy board and retake control of the game.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_warrior_board_wipe',
    name: 'Clear the Common',
    cardClass: 'warrior',
    cardIds: ['warrior_brawl', 'warrior_whirlwind', 'warrior_arcanite_reaper'],
  },
]
