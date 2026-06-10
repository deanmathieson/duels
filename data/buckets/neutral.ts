import type { BucketDef } from '../../game/types'

/**
 * Neutral card buckets — offered to every hero regardless of class.
 * Each bucket contains 3 neutral card ids and covers a distinct archetype.
 * These complement class-specific buckets to give players flexible deck-building paths.
 */
export const neutralBuckets: BucketDef[] = [
  {
    id: 'nbucket_beasts',
    name: 'Wild Beasts',
    cardClass: 'neutral',
    cardIds: ['stonetusk_boar', 'river_crocolisk', 'stampeding_kodo'],
  },
  {
    id: 'nbucket_dragons',
    name: 'Dragon Flight',
    cardClass: 'neutral',
    cardIds: ['faerie_dragon', 'twilight_drake', 'azure_drake'],
  },
  {
    id: 'nbucket_elementals',
    name: 'Elemental Fury',
    cardClass: 'neutral',
    cardIds: ['fire_elemental', 'ragnaros_the_firelord', 'ysera'],
  },
  {
    id: 'nbucket_mechs',
    name: 'Mech Workshop',
    cardClass: 'neutral',
    cardIds: ['harvest_golem', 'mechanical_yeti', 'gnomish_inventor'],
  },
  {
    id: 'nbucket_taunts',
    name: 'Shield Wall',
    cardClass: 'neutral',
    cardIds: ['ironfur_grizzly', 'sen_jin_shieldmasta', 'sunwalker'],
  },
  {
    id: 'nbucket_big_minions',
    name: 'Giants of the Land',
    cardClass: 'neutral',
    cardIds: ['boulderfist_ogre', 'war_golem', 'ragnaros_the_firelord'],
  },
  {
    id: 'nbucket_cheap_tempo',
    name: 'Fast and Cheap',
    cardClass: 'neutral',
    cardIds: ['wisp', 'murloc_raider', 'stonetusk_boar'],
  },
  {
    id: 'nbucket_card_value',
    name: 'Card Value',
    cardClass: 'neutral',
    cardIds: ['gnomish_inventor', 'azure_drake', 'ysera'],
  },
  {
    id: 'nbucket_sticky_bodies',
    name: 'Sticky Bodies',
    cardClass: 'neutral',
    cardIds: ['harvest_golem', 'sunwalker', 'argent_commander'],
  },
  {
    id: 'nbucket_battlecry',
    name: 'Battlecry Brigade',
    cardClass: 'neutral',
    cardIds: ['elven_archer', 'shattered_sun_cleric', 'fire_elemental'],
  },
]
