import type { BucketDef } from '../../game/types'

/**
 * Lamplighter (paladin) card buckets for draft reward picks.
 * Each bucket contains 3 thematically-linked card ids.
 * Covers: go-wide Wicklings, Blessing synergies, buffs/aggro,
 * removal/board control, healing/sustain, weapons, Wards, big finishers,
 * value/draw, cheap early plays, and parish spells.
 */
export const paladinBuckets: BucketDef[] = [
  // ---- Aggro / go-wide ----
  {
    id: 'bucket_paladin_recruits',
    name: 'Every Wick Alight',
    cardClass: 'paladin',
    cardIds: ['paladin_muster_for_battle', 'paladin_call_to_arms', 'paladin_tirion_fordring_token_summon'],
  },

  // ---- Blessing synergies ----
  {
    id: 'bucket_paladin_divine_shield',
    name: 'Sealed in Wax',
    cardClass: 'paladin',
    cardIds: ['paladin_hand_of_protection', 'paladin_shielded_minibot', 'paladin_argent_protector'],
  },

  // ---- Blessing payoffs (legendary combo) ----
  {
    id: 'bucket_paladin_divine_payoffs',
    name: 'The Unsnuffed',
    cardClass: 'paladin',
    cardIds: ['paladin_lothraxion_the_redeemed', 'paladin_faerie_dragon', 'paladin_uther_of_the_ebon_blade'],
  },

  // ---- Buff package ----
  {
    id: 'bucket_paladin_buffs',
    name: 'Lamp-Oil Courage',
    cardClass: 'paladin',
    cardIds: ['paladin_blessing_of_might', 'paladin_sound_the_bells', 'paladin_blessing_of_kings'],
  },

  // ---- Weapons ----
  {
    id: 'bucket_paladin_weapons',
    name: 'Tools of the Watch',
    cardClass: 'paladin',
    cardIds: ['paladin_truesilver_champion', 'paladin_coghammer', 'paladin_muster_for_battle'],
  },

  // ---- Removal / board control ----
  {
    id: 'bucket_paladin_removal',
    name: 'The Hanging Judge',
    cardClass: 'paladin',
    cardIds: ['paladin_equality', 'paladin_consecration', 'paladin_aldor_peacekeeper'],
  },

  // ---- Healing / sustain ----
  {
    id: 'bucket_paladin_healing',
    name: 'Sweet Mercies',
    cardClass: 'paladin',
    cardIds: ['paladin_holy_light', 'paladin_shielded_warden', 'paladin_ragnaros_lightlord'],
  },

  // ---- Ward wall ----
  {
    id: 'bucket_paladin_taunts',
    name: 'The Parish Wall',
    cardClass: 'paladin',
    cardIds: ['paladin_redemption', 'sen_jin_shieldmasta', 'paladin_tirion_fordring'],
  },

  // ---- Big minions / finishers ----
  {
    id: 'bucket_paladin_finishers',
    name: 'Last Light Burning',
    cardClass: 'paladin',
    cardIds: ['paladin_shirvallah_the_tiger', 'stormwind_champion', 'paladin_dinosize'],
  },

  // ---- Value / draw ----
  {
    id: 'bucket_paladin_value',
    name: 'Confessions Overheard',
    cardClass: 'paladin',
    cardIds: ['paladin_divine_favor', 'paladin_ivory_knight', 'gnomish_inventor'],
  },

  // ---- Curve / early game ----
  {
    id: 'bucket_paladin_early',
    name: 'Fresh Wicks',
    cardClass: 'paladin',
    cardIds: ['paladin_humility', 'paladin_blessing_of_might', 'paladin_shielded_minibot'],
  },

  // ---- Neutral support ----
  {
    id: 'bucket_paladin_neutral_support',
    name: 'Help from the Hamlet',
    cardClass: 'paladin',
    cardIds: ['stormwind_champion', 'sunwalker', 'chillwind_yeti'],
  },
]
