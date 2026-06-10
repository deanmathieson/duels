import type { BucketDef } from '../../game/types'

/**
 * Paladin card buckets for Duels reward picks.
 * Each bucket contains 3 thematically-linked card ids.
 * Covers: go-wide Recruits, Divine Shield synergies, buffs/aggro,
 * removal/board control, healing/sustain, weapons, taunts, big finishers,
 * value/draw, cheap early plays, and holy spells.
 */
export const paladinBuckets: BucketDef[] = [
  // ---- Aggro / go-wide ----
  {
    id: 'bucket_paladin_recruits',
    name: 'For the Silver Hand!',
    cardClass: 'paladin',
    cardIds: ['paladin_muster_for_battle', 'paladin_call_to_arms', 'paladin_tirion_fordring_token_summon'],
  },

  // ---- Divine Shield synergies ----
  {
    id: 'bucket_paladin_divine_shield',
    name: 'Blessed Shields',
    cardClass: 'paladin',
    cardIds: ['paladin_hand_of_protection', 'paladin_shielded_minibot', 'paladin_argent_protector'],
  },

  // ---- Divine Shield payoffs (legendary combo) ----
  {
    id: 'bucket_paladin_divine_payoffs',
    name: 'Holy Fortitude',
    cardClass: 'paladin',
    cardIds: ['paladin_lothraxion_the_redeemed', 'paladin_faerie_dragon', 'paladin_uther_of_the_ebon_blade'],
  },

  // ---- Buff package ----
  {
    id: 'bucket_paladin_buffs',
    name: 'Power of the Light',
    cardClass: 'paladin',
    cardIds: ['paladin_blessing_of_might', 'paladin_sound_the_bells', 'paladin_blessing_of_kings'],
  },

  // ---- Weapons ----
  {
    id: 'bucket_paladin_weapons',
    name: 'Armory of the Crusade',
    cardClass: 'paladin',
    cardIds: ['paladin_truesilver_champion', 'paladin_coghammer', 'paladin_muster_for_battle'],
  },

  // ---- Removal / board control ----
  {
    id: 'bucket_paladin_removal',
    name: 'Righteous Judgement',
    cardClass: 'paladin',
    cardIds: ['paladin_equality', 'paladin_consecration', 'paladin_aldor_peacekeeper'],
  },

  // ---- Healing / sustain ----
  {
    id: 'bucket_paladin_healing',
    name: 'Light of the Naaru',
    cardClass: 'paladin',
    cardIds: ['paladin_holy_light', 'paladin_shielded_warden', 'paladin_ragnaros_lightlord'],
  },

  // ---- Taunt wall ----
  {
    id: 'bucket_paladin_taunts',
    name: 'Unbreakable Wall',
    cardClass: 'paladin',
    cardIds: ['paladin_redemption', 'sen_jin_shieldmasta', 'paladin_tirion_fordring'],
  },

  // ---- Big minions / finishers ----
  {
    id: 'bucket_paladin_finishers',
    name: 'Crusade\'s End',
    cardClass: 'paladin',
    cardIds: ['paladin_shirvallah_the_tiger', 'stormwind_champion', 'paladin_dinosize'],
  },

  // ---- Value / draw ----
  {
    id: 'bucket_paladin_value',
    name: 'Sacred Knowledge',
    cardClass: 'paladin',
    cardIds: ['paladin_divine_favor', 'paladin_ivory_knight', 'gnomish_inventor'],
  },

  // ---- Curve / early game ----
  {
    id: 'bucket_paladin_early',
    name: 'Eager Recruits',
    cardClass: 'paladin',
    cardIds: ['paladin_humility', 'paladin_blessing_of_might', 'paladin_shielded_minibot'],
  },

  // ---- Neutral support ----
  {
    id: 'bucket_paladin_neutral_support',
    name: 'Reinforcements',
    cardClass: 'paladin',
    cardIds: ['stormwind_champion', 'sunwalker', 'chillwind_yeti'],
  },
]
