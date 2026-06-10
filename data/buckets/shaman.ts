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
    name: 'Quick Squall',
    cardClass: 'shaman',
    cardIds: ['shaman_lightning_bolt', 'shaman_tunnel_trogg', 'shaman_maelstrom_portal'],
  },

  // --- Lightning burn: cheap targeted damage spells ---
  {
    id: 'bucket_shaman_burn',
    name: 'Sky-Spite',
    cardClass: 'shaman',
    cardIds: ['shaman_lightning_bolt', 'shaman_lava_burst', 'shaman_rockbiter_weapon'],
  },

  // --- Totem synergy: summon and buff totems ---
  {
    id: 'bucket_shaman_totems',
    name: 'Effigy Rites',
    cardClass: 'shaman',
    cardIds: ['shaman_totemic_surge', 'shaman_flametongue_totem', 'shaman_thunderbluff_valiant'],
  },

  // --- Totem board: taunt totems and big totem bodies ---
  {
    id: 'bucket_shaman_totem_wall',
    name: 'Wall of Effigies',
    cardClass: 'shaman',
    cardIds: ['shaman_totem_golem', 'shaman_thing_from_below', 'sen_jin_shieldmasta'],
  },

  // --- Elemental chain: elemental minions that synergise sequentially ---
  {
    id: 'bucket_shaman_elementals',
    name: 'Spirit Procession',
    cardClass: 'shaman',
    cardIds: ['shaman_hot_spring_guardian', 'shaman_unbound_elemental', 'shaman_storm_chaser'],
  },

  // --- Big elementals / finisher threats ---
  {
    id: 'bucket_shaman_big_elementals',
    name: 'Wrath of the Mire',
    cardClass: 'shaman',
    cardIds: ['shaman_earth_elemental', 'fire_elemental', 'shaman_kalimos_primal_lord'],
  },

  // --- Board buffs / Bloodlust finisher package ---
  {
    id: 'bucket_shaman_bloodlust',
    name: 'Village Riot',
    cardClass: 'shaman',
    cardIds: ['shaman_bloodlust', 'shaman_feral_spirit', 'shaman_thrall_deathseer'],
  },

  // --- Removal: targeted and board-wide ---
  {
    id: 'bucket_shaman_removal',
    name: 'Toads and Tempests',
    cardClass: 'shaman',
    cardIds: ['shaman_hex', 'shaman_lightning_storm', 'shaman_volcano'],
  },

  // --- Control / survivability: armor, healing, board wipes ---
  {
    id: 'bucket_shaman_control',
    name: 'Grave-Watch',
    cardClass: 'shaman',
    cardIds: ['shaman_ancestral_spirit', 'shaman_earth_elemental', 'ironfur_grizzly'],
  },

  // --- Value / draw: refilling the hand ---
  {
    id: 'bucket_shaman_value',
    name: 'Entrails and Answers',
    cardClass: 'shaman',
    cardIds: ['shaman_far_sight', 'shaman_ancestral_knowledge', 'shaman_lava_shock'],
  },

  // --- Weapon aggro: equip weapons to push damage ---
  {
    id: 'bucket_shaman_weapon',
    name: 'Bog-Iron and Thunder',
    cardClass: 'shaman',
    cardIds: ['shaman_doomhammer', 'shaman_rockbiter_weapon', 'shaman_alakir_the_windlord'],
  },

  // --- Legendary finishers: game-ending legendary plays ---
  {
    id: 'bucket_shaman_legendaries',
    name: 'Legends of the Mire',
    cardClass: 'shaman',
    cardIds: ['shaman_hagatha_the_witch', 'shaman_kalimos_primal_lord', 'shaman_alakir_the_windlord'],
  },
]
