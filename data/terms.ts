import type { CardClass, Keyword, MinionTribe } from '../game/types'

/**
 * The Hollowmoor dictionary — the single source of truth for every
 * player-facing game term. Internal ids and engine enum members never change;
 * everything the player reads goes through (or is authored against) this map.
 *
 * Card text in /data is authored with the DISPLAY terms directly (bold-marked,
 * e.g. `**Haunt:** ...`); the labels here drive UI chrome (badges, ribbons,
 * filters) and the original-ip regression test.
 */

export const GAME_TITLE = 'HOLLOWMOOR'
export const GAME_SUBTITLE = 'A Roguelike Card Duel'

/** Display names for engine keywords. */
export const KEYWORD_LABEL: Record<Keyword, string> = {
  taunt: 'Ward',
  divineShield: 'Blessing',
  rush: 'Rush',
  charge: 'Charge',
  windfury: 'Flurry',
  lifesteal: 'Leeching',
  poisonous: 'Poisonous',
  stealth: 'Stealth',
  spellDamage: 'Spell Damage',
}

/** Display names for the card-text trigger words (not engine keywords). */
export const MECHANIC_LABEL = {
  battlecry: 'Omen',
  deathrattle: 'Haunt',
  chooseOne: 'Choose One',
} as const

/** Display names for minion tribes. */
export const TRIBE_LABEL: Record<MinionTribe, string> = {
  none: '',
  beast: 'Beast',
  dragon: 'Wyrm',
  demon: 'Fae',
  elemental: 'Spirit',
  mech: 'Golem',
  murloc: 'Bogling',
  pirate: 'Brigand',
  totem: 'Effigy',
  ancient: 'Elder',
}

/** Display names for hero classes (callings, in Hollowmoor parlance). */
export const CLASS_LABEL: Record<CardClass, string> = {
  neutral: 'Neutral',
  druid: 'Hedgewitch',
  hunter: 'Trapper',
  mage: 'Stargazer',
  paladin: 'Lamplighter',
  priest: 'Vicar',
  rogue: 'Cutpurse',
  shaman: 'Augur',
  warlock: 'Bargainer',
  warrior: 'Banneret',
}
