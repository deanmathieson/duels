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

/** A calling's signature colour identity. */
export interface ClassColor {
  /** The signature hue (mid-tone) — accents, rims, animation tints. */
  base: string
  /** A bright highlight of the hue — glints, flashes. */
  light: string
  /** A deep shade of the hue — placeholder backings, shadows. */
  dark: string
  /** Translucent glow (rgba) for halos, auras and bloom FX. */
  glow: string
}

/**
 * The colour identity of every calling — one signature hue each, used
 * consistently across card frames, hero portraits and the combat FX so each
 * calling reads at a glance. Tuned to be mutually distinct and to sit on the
 * dark, candlelit Hollowmoor palette. The single source of truth: components
 * and the animation layer all read from here (no per-file colour maps).
 */
export const CLASS_COLOR: Record<CardClass, ClassColor> = {
  neutral: { base: '#b9a373', light: '#e6d6a8', dark: '#4a3c24', glow: 'rgba(200,170,110,0.5)' },
  druid: { base: '#5fae3c', light: '#a8e07a', dark: '#234812', glow: 'rgba(110,210,90,0.55)' },
  hunter: { base: '#c08a36', light: '#e8c374', dark: '#553811', glow: 'rgba(220,160,70,0.5)' },
  mage: { base: '#3f8fe0', light: '#9cd2ff', dark: '#11365f', glow: 'rgba(90,170,255,0.55)' },
  paladin: { base: '#edc34a', light: '#fff0a6', dark: '#6c5010', glow: 'rgba(245,210,90,0.55)' },
  priest: { base: '#d9d1a2', light: '#f5edcc', dark: '#746b46', glow: 'rgba(232,224,178,0.55)' },
  rogue: { base: '#8d99a8', light: '#ccd6e2', dark: '#272d36', glow: 'rgba(160,180,205,0.5)' },
  shaman: { base: '#2fa7a0', light: '#84e8df', dark: '#0f403d', glow: 'rgba(70,205,193,0.55)' },
  warlock: { base: '#a14ee0', light: '#d9a6ff', dark: '#3c1366', glow: 'rgba(180,90,230,0.55)' },
  warrior: { base: '#cc4a2e', light: '#ff9d7c', dark: '#5c1710', glow: 'rgba(230,90,60,0.55)' },
}
