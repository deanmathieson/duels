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

/** One-line player-facing definitions for keywords (tooltips / glossary). */
export const KEYWORD_DESCRIPTION: Record<Keyword, string> = {
  taunt: 'Enemies must attack this minion first.',
  divineShield: 'Ignores the first damage it takes.',
  rush: 'Can attack enemy minions the turn it arrives.',
  charge: 'Can attack anything the turn it arrives.',
  windfury: 'Can attack twice each turn.',
  lifesteal: 'Damage it deals also heals your hero.',
  poisonous: 'Destroys any minion it damages.',
  stealth: 'Can’t be attacked or targeted by the enemy until it attacks.',
  spellDamage: 'Your spells deal that much more damage.',
}

/** One-line definitions for the card-text mechanic words. */
export const MECHANIC_DESCRIPTION: Record<keyof typeof MECHANIC_LABEL, string> = {
  battlecry: 'Does something when you play it from your hand.',
  deathrattle: 'Does something when it dies.',
  chooseOne: 'Pick one of its effects when you play it.',
}

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
