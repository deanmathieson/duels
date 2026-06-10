import type { BucketDef } from '../../game/types'

/**
 * Shaman card buckets for Duels reward picks.
 * Covers Shaman's core archetypes: aggro burn, totem synergy, elemental chain,
 * board-buff finishers, control/removal, and value/draw lines.
 */
export const shamanBuckets: BucketDef[] = [
  // --- Early game / aggressive cheap plays ---
  {
    id: 'bucket_shaman_early_game',
    name: 'Lightning Start',
    cardClass: 'shaman',
    cardIds: ['shaman_lightning_bolt', 'shaman_tunnel_trogg', 'shaman_maelstrom_portal'],
  },

  // --- Lightning burn: cheap targeted damage spells ---
  {
    id: 'bucket_shaman_burn',
    name: 'Storm Burn',
    cardClass: 'shaman',
    cardIds: ['shaman_lightning_bolt', 'shaman_lava_burst', 'shaman_rockbiter_weapon'],
  },

  // --- Totem synergy: summon and buff totems ---
  {
    id: 'bucket_shaman_totems',
    name: 'Totem Power',
    cardClass: 'shaman',
    cardIds: ['shaman_totemic_surge', 'shaman_flametongue_totem', 'shaman_thunderbluff_valiant'],
  },

  // --- Totem board: taunt totems and big totem bodies ---
  {
    id: 'bucket_shaman_totem_wall',
    name: 'Totem Wall',
    cardClass: 'shaman',
    cardIds: ['shaman_totem_golem', 'shaman_thing_from_below', 'sen_jin_shieldmasta'],
  },

  // --- Elemental chain: elemental minions that synergise sequentially ---
  {
    id: 'bucket_shaman_elementals',
    name: 'Elemental Chain',
    cardClass: 'shaman',
    cardIds: ['shaman_hot_spring_guardian', 'shaman_unbound_elemental', 'shaman_storm_chaser'],
  },

  // --- Big elementals / finisher threats ---
  {
    id: 'bucket_shaman_big_elementals',
    name: 'Elemental Fury',
    cardClass: 'shaman',
    cardIds: ['shaman_earth_elemental', 'shaman_fire_elemental', 'shaman_kalimos_primal_lord'],
  },

  // --- Board buffs / Bloodlust finisher package ---
  {
    id: 'bucket_shaman_bloodlust',
    name: 'Bloodlust Surge',
    cardClass: 'shaman',
    cardIds: ['shaman_bloodlust', 'shaman_feral_spirit', 'shaman_thrall_deathseer'],
  },

  // --- Removal: targeted and board-wide ---
  {
    id: 'bucket_shaman_removal',
    name: 'Hex and Storm',
    cardClass: 'shaman',
    cardIds: ['shaman_hex', 'shaman_lightning_storm', 'shaman_volcano'],
  },

  // --- Control / survivability: armor, healing, board wipes ---
  {
    id: 'bucket_shaman_control',
    name: 'Ancestral Defense',
    cardClass: 'shaman',
    cardIds: ['shaman_ancestral_spirit', 'shaman_earth_elemental', 'ironfur_grizzly'],
  },

  // --- Value / draw: refilling the hand ---
  {
    id: 'bucket_shaman_value',
    name: 'Far Sight Value',
    cardClass: 'shaman',
    cardIds: ['shaman_far_sight', 'shaman_ancestral_knowledge', 'shaman_lava_shock'],
  },

  // --- Weapon aggro: equip weapons to push damage ---
  {
    id: 'bucket_shaman_weapon',
    name: 'Weapon Mastery',
    cardClass: 'shaman',
    cardIds: ['shaman_doomhammer', 'shaman_rockbiter_weapon', 'shaman_alakir_the_windlord'],
  },

  // --- Legendary finishers: game-ending legendary plays ---
  {
    id: 'bucket_shaman_legendaries',
    name: 'Shaman Legends',
    cardClass: 'shaman',
    cardIds: ['shaman_hagatha_the_witch', 'shaman_kalimos_primal_lord', 'shaman_alakir_the_windlord'],
  },
]
