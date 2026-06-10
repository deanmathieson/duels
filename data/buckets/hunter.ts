import type { BucketDef } from '../../game/types'

/**
 * Hunter archetype buckets — offered as Duels card rewards.
 * Each bucket contains 3 thematically-linked card ids from hunterCards or stable neutral ids.
 * Designed to let the player steer into distinct Hunter archetypes.
 */
export const hunterBuckets: BucketDef[] = [
  /**
   * Face Aggro — cheap direct-damage spells to close games fast from hand.
   */
  {
    id: 'bucket_hunter_face_aggro',
    name: 'Face Pressure',
    cardClass: 'hunter',
    cardIds: ['hunter_arcane_shot', 'hunter_kill_command', 'hunter_multi_shot'],
  },

  /**
   * Early Beasts — the cheapest beast bodies to flood the board on curve.
   */
  {
    id: 'bucket_hunter_early_beasts',
    name: 'Pack of Hunters',
    cardClass: 'hunter',
    cardIds: ['stonetusk_boar', 'hunter_jeweled_macaw', 'hunter_springpaw'],
  },

  /**
   * Beast Synergy — cards that reward having many beasts in play or hand.
   */
  {
    id: 'bucket_hunter_beast_synergy',
    name: 'Beast Bond',
    cardClass: 'hunter',
    cardIds: ['hunter_scavenging_hyena', 'hunter_houndmaster', 'hunter_tundra_rhino'],
  },

  /**
   * Trap Removal — spell-based removal and trap-style disruption.
   */
  {
    id: 'bucket_hunter_traps',
    name: 'Trap Master',
    cardClass: 'hunter',
    cardIds: ['hunter_explosive_trap', 'hunter_freezing_trap', 'hunter_hunters_mark'],
  },

  /**
   * Tempo Weapons — weapon-backed aggression to apply board and face pressure.
   */
  {
    id: 'bucket_hunter_weapons',
    name: 'Armed and Dangerous',
    cardClass: 'hunter',
    cardIds: ['hunter_eaglehorn_bow', 'hunter_gladiators_longbow', 'elven_archer'],
  },

  /**
   * Token Swarm — flood the board with small beast tokens to overwhelm.
   */
  {
    id: 'bucket_hunter_token_swarm',
    name: 'Unleash the Pack',
    cardClass: 'hunter',
    cardIds: ['hunter_unleash_the_hounds', 'hunter_rat_pack', 'hunter_ball_of_spiders'],
  },

  /**
   * Mid-Curve Beasts — solid 3-5 mana beasts with good stats and keywords.
   */
  {
    id: 'bucket_hunter_mid_curve',
    name: 'Wild Companions',
    cardClass: 'hunter',
    cardIds: ['hunter_bearshark', 'hunter_animal_companion', 'hunter_savannah_highmane'],
  },

  /**
   * Beast Buffs — spells that pump beasts to threaten lethal or dominate the board.
   */
  {
    id: 'bucket_hunter_beast_buffs',
    name: 'Feral Fury',
    cardClass: 'hunter',
    cardIds: ['hunter_dire_frenzy', 'hunter_flanking_strike', 'hunter_bestial_wrath'],
  },

  /**
   * Draw & Value — cards that generate extra cards or beasts to fuel a long game.
   */
  {
    id: 'bucket_hunter_value',
    name: 'Hunter\'s Quarry',
    cardClass: 'hunter',
    cardIds: ['hunter_tracking', 'hunter_starving_buzzard', 'hunter_master_of_the_wild_hunt'],
  },

  /**
   * Taunts & Defensive Wall — stabilise with taunt minions to protect the face total.
   */
  {
    id: 'bucket_hunter_taunts',
    name: 'Defensive Line',
    cardClass: 'hunter',
    cardIds: ['hunter_houndmaster', 'sen_jin_shieldmasta', 'ironfur_grizzly'],
  },

  /**
   * Big Beasts — expensive high-stat beasts that end the game when unchecked.
   */
  {
    id: 'bucket_hunter_big_beasts',
    name: 'Apex Predators',
    cardClass: 'hunter',
    cardIds: ['hunter_savannah_highmane', 'hunter_king_krush', 'boulderfist_ogre'],
  },

  /**
   * Legendary Finishers — powerful late-game bombs and board-swing legendaries.
   */
  {
    id: 'bucket_hunter_finishers',
    name: 'Hunt\'s End',
    cardClass: 'hunter',
    cardIds: [
      'hunter_call_of_the_wild',
      'hunter_deathstalker_rexxar',
      'hunter_professor_slate',
    ],
  },
]
