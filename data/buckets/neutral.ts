import type { BucketDef } from '../../game/types'

/**
 * Neutral card buckets — offered to every hero regardless of class.
 * Each bucket contains 3 neutral card ids and covers a distinct archetype.
 * These complement class-specific buckets to give players flexible deck-building paths.
 */
export const neutralBuckets: BucketDef[] = [
  {
    id: 'nbucket_beasts',
    name: 'Beasts of the Bracken',
    cardClass: 'neutral',
    cardIds: ['stonetusk_boar', 'river_crocolisk', 'stampeding_kodo'],
  },
  {
    id: 'nbucket_dragons',
    name: 'Wyrms in the Mist',
    cardClass: 'neutral',
    cardIds: ['faerie_dragon', 'twilight_drake', 'azure_drake'],
  },
  {
    id: 'nbucket_elementals',
    name: 'Hearthfire Spirits',
    cardClass: 'neutral',
    cardIds: ['fire_elemental', 'ragnaros_the_firelord', 'ysera'],
  },
  {
    id: 'nbucket_mechs',
    name: "The Tinker's Yard",
    cardClass: 'neutral',
    cardIds: ['harvest_golem', 'mechanical_yeti', 'gnomish_inventor'],
  },
  {
    id: 'nbucket_taunts',
    name: 'The Parish Watch',
    cardClass: 'neutral',
    cardIds: ['ironfur_grizzly', 'sen_jin_shieldmasta', 'sunwalker'],
  },
  {
    id: 'nbucket_big_minions',
    name: 'Hulks of the Hollow',
    cardClass: 'neutral',
    cardIds: ['boulderfist_ogre', 'war_golem', 'ragnaros_the_firelord'],
  },
  {
    id: 'nbucket_cheap_tempo',
    name: 'Quick and Dirty',
    cardClass: 'neutral',
    cardIds: ['wisp', 'murloc_raider', 'stonetusk_boar'],
  },
  {
    id: 'nbucket_card_value',
    name: 'The Rumour Mill',
    cardClass: 'neutral',
    cardIds: ['gnomish_inventor', 'azure_drake', 'ysera'],
  },
  {
    id: 'nbucket_sticky_bodies',
    name: 'Hard to Bury',
    cardClass: 'neutral',
    cardIds: ['harvest_golem', 'sunwalker', 'argent_commander'],
  },
  {
    id: 'nbucket_battlecry',
    name: 'Ill Omens',
    cardClass: 'neutral',
    cardIds: ['elven_archer', 'shattered_sun_cleric', 'fire_elemental'],
  },
  {
    id: 'nbucket_haunt_core',
    name: 'Restless Dead',
    cardClass: 'neutral',
    cardIds: ['n_coffin_beetle', 'n_bone_courier', 'n_lychgate_keeper'],
  },
  {
    id: 'nbucket_haunt_payoffs',
    name: 'The Corpse Trade',
    cardClass: 'neutral',
    cardIds: ['n_widow_hargreave', 'n_body_snatcher', 'n_hollow_sexton'],
  },
  {
    id: 'nbucket_haunt_walls',
    name: 'Buried Ramparts',
    cardClass: 'neutral',
    cardIds: ['n_somethings_egg', 'n_barrow_tortoise', 'n_plague_wagon'],
  },
]
