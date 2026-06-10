import type { BucketDef } from '../game/types'

/**
 * Card buckets offered as rewards after combat rounds.
 * Each bucket contains 3 card ids from druidCards or neutralCards.
 * Grouped thematically to give players meaningful choices.
 */
export const buckets: BucketDef[] = [
  {
    id: 'bucket_ramp',
    name: 'Strange Vigours',
    cardIds: ['innervate', 'wild_growth', 'nourish'],
  },
  {
    id: 'bucket_removal',
    name: 'Weeding the Garden',
    cardIds: ['wrath', 'swipe', 'mulch'],
  },
  {
    id: 'bucket_choose_one',
    name: 'At the Crossroads',
    cardIds: ['living_roots', 'power_of_the_wild', 'keeper_of_the_grove'],
  },
  {
    id: 'bucket_beasts',
    name: 'Things with Teeth',
    cardIds: ['druid_of_the_claw', 'river_crocolisk', 'bloodfen_raptor'],
  },
  {
    id: 'bucket_taunts',
    name: 'The Briar Wall',
    cardIds: ['ironbark_protector', 'sen_jin_shieldmasta', 'ironfur_grizzly'],
  },
  {
    id: 'bucket_big_minions',
    name: 'Great Lumbering Things',
    cardIds: ['ancient_of_war', 'boulderfist_ogre', 'war_golem'],
  },
  {
    id: 'bucket_finishers',
    name: 'The Last Harvest',
    cardIds: ['cenarius', 'force_of_nature', 'savage_roar'],
  },
  {
    id: 'bucket_value',
    name: "Old Wives' Wisdom",
    cardIds: ['ancient_of_lore', 'gnomish_inventor', 'starfire'],
  },
  {
    id: 'bucket_neutral_value',
    name: 'Hired Help',
    cardIds: ['chillwind_yeti', 'stormwind_champion', 'sunwalker'],
  },
  {
    id: 'bucket_early_game',
    name: 'The Small Hours',
    cardIds: ['wisp', 'elven_archer', 'mark_of_the_wild'],
  },
]
