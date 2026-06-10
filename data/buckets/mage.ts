import type { BucketDef } from '../../game/types'

/**
 * Mage archetype buckets for Duels reward picks.
 * Each bucket holds 3 thematically-linked card ids drawn from mageCards
 * and the stable neutral ids.
 *
 * Archetypes covered:
 *   burn/face, spell-damage, tempo curve, board-clear/control,
 *   big-spell value, elementals, card-draw/refill, early/cheap,
 *   hard-removal, taunts/defensive, finishers, spell-synergy minions.
 */
export const mageBuckets: BucketDef[] = [
  // ---------------------------------------------------------------------------
  // Burn / Face damage — go fast, deal direct damage to the enemy hero.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_burn',
    name: 'Falling Stars',
    cardClass: 'mage',
    cardIds: ['mage_fireball', 'mage_frostbolt', 'mage_ice_lance'],
  },

  // ---------------------------------------------------------------------------
  // Spell Damage Amplifiers — minions that boost every spell you cast.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_spell_damage',
    name: 'Star-Touched',
    cardClass: 'mage',
    cardIds: ['mage_dalaran_mage', 'mage_archmage', 'mage_nexus_champion'],
  },

  // ---------------------------------------------------------------------------
  // Tempo Curve — efficient threats on curve that pressure the opponent.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_tempo',
    name: 'Quick Bargains',
    cardClass: 'mage',
    cardIds: ['mage_mana_wyrm', 'mage_flamewaker', 'mage_ethereal_arcanist'],
  },

  // ---------------------------------------------------------------------------
  // Board Clear / Control — spells that sweep the enemy board.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_board_clear',
    name: 'Killing Frosts',
    cardClass: 'mage',
    cardIds: ['mage_arcane_explosion', 'mage_frost_nova', 'mage_flamestrike'],
  },

  // ---------------------------------------------------------------------------
  // Hard Removal — targeted answers to individual high-value threats.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_removal',
    name: 'Unmakings',
    cardClass: 'mage',
    cardIds: ['mage_polymorph', 'mage_vaporize', 'mage_blizzard'],
  },

  // ---------------------------------------------------------------------------
  // Spell Synergy Minions — minions that reward casting spells.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_spell_synergy',
    name: 'Candle-Magic',
    cardClass: 'mage',
    cardIds: ['mage_sorcerers_apprentice', 'mage_flamewaker', 'mage_antonidas'],
  },

  // ---------------------------------------------------------------------------
  // Card Draw & Value — refill the hand and keep the engine running.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_value',
    name: 'Forbidden Almanacs',
    cardClass: 'mage',
    cardIds: ['mage_arcane_intellect', 'mage_counterspell', 'mage_cabalists_tome'],
  },

  // ---------------------------------------------------------------------------
  // Big Spells — expensive, high-impact spells to close out the game.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_big_spells',
    name: 'Great Omens',
    cardClass: 'mage',
    cardIds: ['mage_cone_of_cold', 'mage_glacial_mysteries', 'mage_pyroblast'],
  },

  // ---------------------------------------------------------------------------
  // Elementals — elemental tribe synergy and on-board presence.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_elementals',
    name: 'Restless Spirits',
    cardClass: 'mage',
    cardIds: ['mage_water_elemental', 'mage_nexus_champion', 'fire_elemental'],
  },

  // ---------------------------------------------------------------------------
  // Finishers & Legends — high-cost legendary game-enders.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_finishers',
    name: 'The Reckoning',
    cardClass: 'mage',
    cardIds: ['mage_antonidas', 'mage_medivh', 'mage_pyroblast'],
  },

  // ---------------------------------------------------------------------------
  // Defensive Shell — protection tools to buy time for big spells.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_defensive',
    name: 'Wards & Wax',
    cardClass: 'mage',
    cardIds: ['mage_mirror_image', 'mage_ice_block_scroll', 'sen_jin_shieldmasta'],
  },

  // ---------------------------------------------------------------------------
  // Early Game — cheap plays for the first few turns of the game.
  // ---------------------------------------------------------------------------
  {
    id: 'bucket_mage_early_game',
    name: 'First Candles',
    cardClass: 'mage',
    cardIds: ['mage_arcane_missiles', 'elven_archer', 'mage_leyline_manipulator'],
  },
]
