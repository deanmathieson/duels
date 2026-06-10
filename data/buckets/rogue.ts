import type { BucketDef } from '../../game/types'

/**
 * Cutpurse archetype card buckets for run rewards.
 * Each bucket contains 3 thematically linked card ids; players steer their deck
 * by picking one bucket after most games.
 *
 * Covers: aggro face, Brigand synergy, weapon/dagger, stealth payoffs, combo/burst,
 * tempo minions, removal, card draw/value, armor synergy, Haunt, and big finishers.
 */
export const rogueBuckets: BucketDef[] = [
  /**
   * Straight for the Throat — cheapest direct-damage spells for maximum face pressure.
   * Supports pure aggro "kill them fast" strategies.
   */
  {
    id: 'bucket_rogue_go_face',
    name: 'Straight for the Throat',
    cardClass: 'rogue',
    cardIds: ['rogue_sinister_strike', 'rogue_backstab', 'rogue_eviscerate'],
  },

  /**
   * Brigands of the Bog — Brigand tribe synergies: bodies, weapons, and tempo.
   * Rewards building around the Brigand tribe and early-game board flooding.
   */
  {
    id: 'bucket_rogue_pirate_crew',
    name: 'Brigands of the Bog',
    cardClass: 'rogue',
    cardIds: ['rogue_southsea_deckhand', 'rogue_goblin_auto_barber', 'rogue_defias_ringleader'],
  },

  /**
   * The Knife Trade — weapon-centric cards that equip or buff weapons.
   * Rewards decks built around hero attack turns and weapon durability.
   */
  {
    id: 'bucket_rogue_blade_and_dagger',
    name: 'The Knife Trade',
    cardClass: 'rogue',
    cardIds: ['rogue_deadly_poison', 'rogue_tinkers_sharpsword_oil', 'rogue_raiding_party'],
  },

  /**
   * Light Fingers — tempo value: cheap spells, token generation, and cost reduction.
   * Rewards playing many cheap cards per turn for explosive swing turns.
   */
  {
    id: 'bucket_rogue_shadow_step',
    name: 'Light Fingers',
    cardClass: 'rogue',
    cardIds: ['rogue_preparation', 'rogue_shadowstep', 'rogue_ethereal_peddler'],
  },

  /**
   * Out of the Lamplight — stealth minions and ways to protect the board.
   * Rewards patient plays that hide minions, then punch through.
   */
  {
    id: 'bucket_rogue_stealth_squad',
    name: 'Out of the Lamplight',
    cardClass: 'rogue',
    cardIds: ['rogue_patient_assassin', 'rogue_shadow_agent', 'rogue_conceal'],
  },

  /**
   * One Red Night — the "play a bunch of cards, then finish with burst" line.
   * Wedding Cutlery clears tokens; Old Grudge + Magpie Tom give huge alpha-strikes.
   */
  {
    id: 'bucket_rogue_combo_burst',
    name: 'One Red Night',
    cardClass: 'rogue',
    cardIds: ['rogue_cold_blood', 'rogue_fan_of_knives', 'rogue_blade_flurry'],
  },

  /**
   * Quick Work — efficient 3-drop bodies for strong curve-out plays.
   * Parish Cutthroat and Aspiring Cutthroat snowball quickly from turn 3.
   */
  {
    id: 'bucket_rogue_tempo_curve',
    name: 'Quick Work',
    cardClass: 'rogue',
    cardIds: ['rogue_si7_agent', 'rogue_questing_adventurer', 'chillwind_yeti'],
  },

  /**
   * Dead Men's Pennies — value through Coin generation and Haunt recycling.
   * Barrow-Thief keeps the chain going; Back-Room Fence discovers options.
   */
  {
    id: 'bucket_rogue_coin_hoard',
    name: "Dead Men's Pennies",
    cardClass: 'rogue',
    cardIds: ['rogue_tomb_pillager', 'rogue_underbelly_fence', 'gnomish_inventor'],
  },

  /**
   * Deep Pockets — draw and refill for control/grind strategies.
   * Leg It! and The Reeking Fog give massive card advantage and board wipes.
   */
  {
    id: 'bucket_rogue_deep_pockets',
    name: 'Deep Pockets',
    cardClass: 'rogue',
    cardIds: ['rogue_sprint', 'rogue_vanish', 'rogue_leeching_poison'],
  },

  /**
   * The Killing Stroke — late-game burst finishers that close games from hand.
   * The Hangman's Daughter, The Drowned Smuggler, and the Widow all threaten
   * lethal when played.
   */
  {
    id: 'bucket_rogue_lethality',
    name: 'The Killing Stroke',
    cardClass: 'rogue',
    cardIds: ['rogue_kingsbane', 'rogue_spectral_cutlass', 'rogue_valeera_the_hollow'],
  },

  /**
   * Rogues' Gallery — legendary finishers backed by token swarms.
   * Magpie Tom and Fat Agnes are win conditions; Footpads flood the board cheaply.
   */
  {
    id: 'bucket_rogue_legend_and_lackeys',
    name: "Rogues' Gallery",
    cardClass: 'rogue',
    cardIds: ['rogue_edwin_vancleef', 'rogue_togwaggle', 'stormwind_champion'],
  },

  /**
   * Hired Muscle — strong neutral minions to round out any Cutpurse deck.
   * Good stats for the cost regardless of archetype chosen.
   */
  {
    id: 'bucket_rogue_neutral_muscle',
    name: 'Hired Muscle',
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
