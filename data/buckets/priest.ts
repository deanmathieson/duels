import type { BucketDef } from '../../game/types'

/**
 * Priest card buckets for Duels reward picks.
 * Each bucket contains 3 thematically linked card ids covering the main
 * Priest archetypes: healing synergy, shadow removal, high-health/buff,
 * draw/value, divine shield, taunts, big minions, and finishers.
 */
export const priestBuckets: BucketDef[] = [
  // ── HEAL SYNERGY ─────────────────────────────────────────────────────────
  {
    id: 'bucket_priest_heal_synergy',
    name: 'Physick & Prayer',
    cardClass: 'priest',
    cardIds: ['priest_lesser_heal', 'priest_divine_hymn', 'priest_northshire_cleric'],
  },

  // ── SHADOW REMOVAL ───────────────────────────────────────────────────────
  {
    id: 'bucket_priest_shadow_removal',
    name: "The Vicar's Black Book",
    cardClass: 'priest',
    cardIds: ['priest_shadow_word_pain', 'priest_shadow_word_death', 'priest_mind_blast'],
  },

  // ── SPELL VALUE / DRAW ───────────────────────────────────────────────────
  {
    id: 'bucket_priest_spell_value',
    name: 'Hollowmoor Apocrypha',
    cardClass: 'priest',
    cardIds: ['priest_shadow_visions', 'priest_thoughtsteal', 'priest_entomb'],
  },

  // ── CHEAP / EARLY GAME ───────────────────────────────────────────────────
  {
    id: 'bucket_priest_early_game',
    name: 'Matins on the Moor',
    cardClass: 'priest',
    cardIds: ['priest_storecroom_helper', 'priest_fanatical_acolyte', 'priest_power_word_shield'],
  },

  // ── BUFF / POWER WORD ────────────────────────────────────────────────────
  {
    id: 'bucket_priest_buffs',
    name: 'Fatten the Flock',
    cardClass: 'priest',
    cardIds: ['priest_power_word_fortitude', 'priest_velens_chosen', 'priest_injured_blademaster'],
  },

  // ── STICKY HIGH-HEALTH MINIONS ────────────────────────────────────────────
  {
    id: 'bucket_priest_sticky_minions',
    name: 'Stubborn Congregation',
    cardClass: 'priest',
    cardIds: ['priest_injured_blademaster', 'priest_temple_enforcer', 'sen_jin_shieldmasta'],
  },

  // ── DIVINE SHIELD ─────────────────────────────────────────────────────────
  {
    id: 'bucket_priest_divine_shields',
    name: 'Blessings for Sale',
    cardClass: 'priest',
    cardIds: ['priest_holy_champion', 'priest_zerek', 'sunwalker'],
  },

  // ── TAUNT WALL ────────────────────────────────────────────────────────────
  {
    id: 'bucket_priest_taunts',
    name: 'Bar the Church Door',
    cardClass: 'priest',
    cardIds: ['priest_devout_chaplain', 'priest_draenei_totem', 'ironfur_grizzly'],
  },

  // ── LIFESTEAL / SUSTAIN ───────────────────────────────────────────────────
  {
    id: 'bucket_priest_lifesteal',
    name: 'Drink Deep',
    cardClass: 'priest',
    cardIds: ['priest_high_inquisitor', 'priest_devout_chaplain', 'priest_circle_of_healing'],
  },

  // ── BOARD CLEAR / CONTROL ─────────────────────────────────────────────────
  {
    id: 'bucket_priest_control',
    name: 'Brimstone Sunday',
    cardClass: 'priest',
    cardIds: ['priest_holy_nova', 'priest_lightbomb', 'priest_mass_dispel'],
  },

  // ── BIG MINIONS ────────────────────────────────────────────────────────────
  {
    id: 'bucket_priest_big_minions',
    name: 'Pillars of the Parish',
    cardClass: 'priest',
    cardIds: ['priest_cabal_shadow_priest', 'boulderfist_ogre', 'war_golem'],
  },

  // ── FINISHERS / LEGENDARIES ────────────────────────────────────────────────
  {
    id: 'bucket_priest_finishers',
    name: 'The Last Bell Tolls',
    cardClass: 'priest',
    cardIds: ['priest_prophet_velen', 'priest_catrina_muerte', 'priest_shadowreaper_anduin'],
  },
]
