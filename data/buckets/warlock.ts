import type { BucketDef } from '../../game/types'

/**
 * Warlock card buckets for Duels reward picks.
 * Each bucket contains 3 thematically linked card ids drawn from warlockCards
 * and the stable neutral set. Covers all major Warlock archetypes:
 * aggressive early plays, Demon tribal, self-damage synergy, board flood,
 * drain/lifesteal, removal, control/AoE, heavy draw, big finishers, and taunts.
 */
export const warlockBuckets: BucketDef[] = [
  /**
   * Aggressive 1-drops and cheap self-damage enablers — go wide fast
   * and leverage high-stat bodies for their cost.
   */
  {
    id: 'bucket_warlock_aggro',
    name: 'Fel Rush',
    cardClass: 'warlock',
    cardIds: ['warlock_flame_imp', 'warlock_kobold_librarian', 'warlock_mortal_coil'],
  },

  /**
   * Early Taunt Demons — establish board presence and protect the hero
   * while setting up Demon synergies.
   */
  {
    id: 'bucket_warlock_taunt_demons',
    name: 'Demonic Wall',
    cardClass: 'warlock',
    cardIds: ['warlock_voidwalker', 'warlock_vulgar_homunculus', 'sen_jin_shieldmasta'],
  },

  /**
   * Cheap/mid-range tempo plays — on-curve minions that develop the board
   * efficiently without heavy self-damage cost.
   */
  {
    id: 'bucket_warlock_tempo',
    name: 'Tempo Demons',
    cardClass: 'warlock',
    cardIds: ['warlock_imp_gang_boss', 'warlock_void_terror', 'warlock_felhunter'],
  },

  /**
   * Demon tribal synergy — buff your Demons and snowball with
   * Darkshire Councilman as the payoff card.
   */
  {
    id: 'bucket_warlock_demon_synergy',
    name: 'Demonic Pact',
    cardClass: 'warlock',
    cardIds: ['warlock_darkshire_councilman', 'warlock_sense_demons', 'warlock_void_caller'],
  },

  /**
   * Self-damage as a resource — pay life for cards and mana,
   * then convert the deficit into advantage.
   */
  {
    id: 'bucket_warlock_self_damage',
    name: 'Blood Price',
    cardClass: 'warlock',
    cardIds: ['warlock_dark_pact', 'warlock_felguard', 'warlock_doomguard'],
  },

  /**
   * Drain and lifesteal package — deal damage and recover life simultaneously
   * to stay healthy while pressuring the opponent.
   */
  {
    id: 'bucket_warlock_drain',
    name: 'Soul Drain',
    cardClass: 'warlock',
    cardIds: ['warlock_drain_soul', 'warlock_siphon_soul', 'warlock_enhanced_dreadlord'],
  },

  /**
   * Board-flood Imps — summon many small Demon tokens quickly,
   * then close out with Imp-losion for burst damage and more bodies.
   */
  {
    id: 'bucket_warlock_board_flood',
    name: 'Imp Swarm',
    cardClass: 'warlock',
    cardIds: ['warlock_imp_losion', 'warlock_bane_of_doom', 'warlock_abyssal_enforcer'],
  },

  /**
   * Targeted removal spells — answer specific threats cleanly
   * with direct damage and destroy effects.
   */
  {
    id: 'bucket_warlock_removal',
    name: 'Dark Removal',
    cardClass: 'warlock',
    cardIds: ['warlock_shadow_bolt', 'warlock_corruption', 'warlock_siphon_soul'],
  },

  /**
   * AoE board clears — reset the board when behind or punish
   * token strategies with wide damage.
   */
  {
    id: 'bucket_warlock_aoe',
    name: 'Fel Cleanse',
    cardClass: 'warlock',
    cardIds: ['warlock_hellfire', 'warlock_twisting_nether', 'fire_elemental'],
  },

  /**
   * Heavy card draw at life cost — sacrifice health for
   * massive hand refills to fuel late-game dominance.
   */
  {
    id: 'bucket_warlock_draw',
    name: 'Dark Knowledge',
    cardClass: 'warlock',
    cardIds: ['warlock_hand_of_guldan', 'warlock_blood_queen_lanathel', 'gnomish_inventor'],
  },

  /**
   * Big Demon finishers — late-game powerhouses that end the game
   * with massive stats or board-warping battlecries.
   */
  {
    id: 'bucket_warlock_finishers',
    name: 'Demonic Finale',
    cardClass: 'warlock',
    cardIds: ['warlock_malganis', 'warlock_lord_jaraxxus', 'war_golem'],
  },

  /**
   * Neutral value and big minions — supplement the class package
   * with universally strong bodies on the top end of the curve.
   */
  {
    id: 'bucket_warlock_neutral_value',
    name: 'Fel Muscle',
    cardClass: 'warlock',
    cardIds: ['chillwind_yeti', 'boulderfist_ogre', 'stormwind_champion'],
  },
]
