import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Tallow Meg, the Lamplighter — paladin-slot hero definition.
 * Head of the Hollowmoor parish watch: lantern processions, wax and oaths,
 * candle-lit vigils against the dark — equal parts piety and protection racket.
 * Theme: go-wide Wickling tokens, buff synergies, healing, Blessing.
 */
export const paladinHero: HeroDef = {
  id: 'hero_paladin',
  name: 'Tallow Meg, the Lamplighter',
  cardClass: 'paladin',
  heroPowers: [
    'hp_paladin_reinforce',
    'hp_paladin_the_silver_hand',
    'hp_paladin_blessing_of_wisdom',
  ],
  signatureTreasures: [
    'sig_paladin_lightforged_blessing',
    'sig_paladin_rallying_banner',
    'sig_paladin_sacred_trial',
    'sig_paladin_hand_of_anyfin',
    'sig_paladin_lothraxion',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Hero power definitions for Tallow Meg, the Lamplighter.
 *
 * - Light the Wick: classic 2-mana summon a 1/1 Wickling.
 * - The Midnight Procession: 3-mana — summon two 1/1 Wicklings. (Was a
 *   Choose One whose first option duplicated Light the Wick exactly;
 *   reworked into the go-wide variant so the two powers read as a real
 *   choice: steady single token vs paying more for double the flood.)
 * - Tallow Anointing: 3-mana — give a friendly minion +1/+1 and Blessing.
 *   (Trimmed from +2/+2: a repeatable half-Accolade plus a Wax Seal every
 *   turn was well above the ~1 mana of effect per 2 mana line.)
 */
export const paladinHeroPowers: HeroPowerDef[] = [
  {
    id: 'hp_paladin_reinforce',
    name: 'Light the Wick',
    cost: 2,
    text: 'Summon a 1/1 Wickling.',
    effects: [{ kind: 'summon', token: 'paladin_recruit', count: 1 }],
    art: undefined,
  },
  {
    id: 'hp_paladin_the_silver_hand',
    name: 'The Midnight Procession',
    cost: 3,
    text: 'Summon two 1/1 Wicklings.',
    effects: [{ kind: 'summon', token: 'paladin_recruit', count: 2 }],
    art: undefined,
  },
  {
    id: 'hp_paladin_blessing_of_wisdom',
    name: 'Tallow Anointing',
    cost: 3,
    text: 'Give a friendly minion +1/+1 and Blessing.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    effects: [
      { kind: 'buff', atk: 1, health: 1, target: 'chosenTarget' },
      { kind: 'giveDivineShield', target: 'chosenTarget' },
    ],
    art: undefined,
  },
]
