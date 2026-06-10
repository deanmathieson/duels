import type { BucketDef } from '../../game/types'

/**
 * Rogue archetype card buckets for Duels rewards.
 * Each bucket contains 3 thematically linked card ids; players steer their deck
 * by picking one bucket after most games.
 *
 * Covers: aggro face, pirate synergy, weapon/dagger, stealth payoffs, combo/burst,
 * tempo minions, removal, card draw/value, poison synergy, deathrattle, and big finishers.
 */
export const rogueBuckets: BucketDef[] = [
  /**
   * Go Face — cheapest direct-damage spells for maximum face pressure.
   * Supports pure aggro "kill them fast" strategies.
   */
  {
    id: 'bucket_rogue_go_face',
    name: 'Go Face',
    cardClass: 'rogue',
    cardIds: ['rogue_sinister_strike', 'rogue_backstab', 'rogue_eviscerate'],
  },

  /**
   * Pirate Crew — Pirate tribe synergies: bodies, weapons, and tempo.
   * Rewards building around the Pirate tribe and early-game board flooding.
   */
  {
    id: 'bucket_rogue_pirate_crew',
    name: 'Pirate Crew',
    cardClass: 'rogue',
    cardIds: ['rogue_southsea_deckhand', 'rogue_goblin_auto_barber', 'rogue_defias_ringleader'],
  },

  /**
   * Blade & Dagger — weapon-centric cards that equip or buff weapons.
   * Rewards decks built around hero attack turns and weapon durability.
   */
  {
    id: 'bucket_rogue_blade_and_dagger',
    name: 'Blade & Dagger',
    cardClass: 'rogue',
    cardIds: ['rogue_deadly_poison', 'rogue_tinkers_sharpsword_oil', 'rogue_raiding_party'],
  },

  /**
   * Shadow Step — tempo and bounce value: cheap spells, coin generation, and cost reduction.
   * Rewards playing many cheap cards per turn for explosive Combo turns.
   */
  {
    id: 'bucket_rogue_shadow_step',
    name: 'Shadow Step',
    cardClass: 'rogue',
    cardIds: ['rogue_preparation', 'rogue_shadowstep', 'rogue_ethereal_peddler'],
  },

  /**
   * Stealth Squad — stealth minions and ways to protect the board.
   * Rewards patient plays that hide minions, then punch through.
   */
  {
    id: 'bucket_rogue_stealth_squad',
    name: 'Stealth Squad',
    cardClass: 'rogue',
    cardIds: ['rogue_patient_assassin', 'rogue_shadow_agent', 'rogue_conceal'],
  },

  /**
   * Combo Burst — the "play a bunch of cards, then finish with burst" line.
   * Fan of Knives clears tokens; Cold Blood + Edwin give huge alpha-strikes.
   */
  {
    id: 'bucket_rogue_combo_burst',
    name: 'Combo Burst',
    cardClass: 'rogue',
    cardIds: ['rogue_cold_blood', 'rogue_fan_of_knives', 'rogue_blade_flurry'],
  },

  /**
   * Tempo Curve — efficient 3-drop bodies for strong curve-out plays.
   * SI:7 Agent and Questing Adventurer snowball quickly from turn 3.
   */
  {
    id: 'bucket_rogue_tempo_curve',
    name: 'Tempo Curve',
    cardClass: 'rogue',
    cardIds: ['rogue_si7_agent', 'rogue_questing_adventurer', 'chillwind_yeti'],
  },

  /**
   * Coin Hoard — value through Coin generation and deathrattle recycling.
   * Tomb Pillager keeps the chain going; Underbelly Fence discovers options.
   */
  {
    id: 'bucket_rogue_coin_hoard',
    name: 'Coin Hoard',
    cardClass: 'rogue',
    cardIds: ['rogue_tomb_pillager', 'rogue_underbelly_fence', 'gnomish_inventor'],
  },

  /**
   * Deep Pockets — draw and refill for control/grind strategies.
   * Sprint and Vanish give massive card advantage and board wipes.
   */
  {
    id: 'bucket_rogue_deep_pockets',
    name: 'Deep Pockets',
    cardClass: 'rogue',
    cardIds: ['rogue_sprint', 'rogue_vanish', 'rogue_leeching_poison'],
  },

  /**
   * Lethality — late-game burst finishers that close games from hand.
   * Kingsbane, Spectral Cutlass, and Valeera all threaten lethal when played.
   */
  {
    id: 'bucket_rogue_lethality',
    name: 'Lethality',
    cardClass: 'rogue',
    cardIds: ['rogue_kingsbane', 'rogue_spectral_cutlass', 'rogue_valeera_the_hollow'],
  },

  /**
   * Legend & Lackeys — legendary finishers backed by token swarms.
   * Edwin and Togwaggle are win conditions; Lackeys flood the board cheaply.
   */
  {
    id: 'bucket_rogue_legend_and_lackeys',
    name: 'Legend & Lackeys',
    cardClass: 'rogue',
    cardIds: ['rogue_edwin_vancleef', 'rogue_togwaggle', 'stormwind_champion'],
  },

  /**
   * Neutral Muscle — strong neutral minions to round out any rogue deck.
   * Good stats for the cost regardless of archetype chosen.
   */
  {
    id: 'bucket_rogue_neutral_muscle',
    name: 'Neutral Muscle',
    cardClass: 'rogue',
    cardIds: ['boulderfist_ogre', 'sen_jin_shieldmasta', 'fire_elemental'],
  },

  /**
   * HAUNT PACKAGE buckets — the corpse-trade draft lane.
   */
  {
    id: 'bucket_rogue_haunt_tools',
    name: "Embalmer's Kit",
    cardClass: 'rogue',
    cardIds: ['r_embalmers_oil', 'r_garrote_ghost', 'rogue_shadow_agent'],
  },
  {
    id: 'bucket_rogue_grave_riches',
    name: 'Grave Riches',
    cardClass: 'rogue',
    cardIds: ['r_corpse_broker', 'r_shallow_grave', 'r_reliquary_fence'],
  },
  {
    id: 'bucket_rogue_exhumation',
    name: 'Midnight Trade',
    cardClass: 'rogue',
    cardIds: ['r_mistress_velvetshroud', 'r_ossuary_creeper', 'r_midnight_exhumation'],
  },
]
