import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Lothraxion the Redeemed — Paladin hero definition.
 * Theme: Go-wide Recruit tokens, buff synergies, healing, Divine Shield.
 */
export const paladinHero: HeroDef = {
  id: 'hero_paladin',
  name: 'Lothraxion the Redeemed',
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
 * Hero power definitions for Lothraxion the Redeemed.
 *
 * - Reinforce: classic 2-mana summon a 1/1 Recruit.
 * - The Silver Hand: 2-mana Choose One — summon a 1/1 Recruit; or give all
 *   friendly minions +1/+1 this turn.
 * - Blessing of Wisdom: 3-mana — give a friendly minion +1/+1 and Divine Shield.
 *   (Trimmed from +2/+2: a repeatable Blessing of Kings-half plus a Hand of
 *   Protection every turn was well above the ~1 mana of effect per 2 mana line.)
 */
export const paladinHeroPowers: HeroPowerDef[] = [
  {
    id: 'hp_paladin_reinforce',
    name: 'Reinforce',
    cost: 2,
    text: 'Summon a 1/1 Recruit.',
    effects: [{ kind: 'summon', token: 'paladin_recruit', count: 1 }],
    art: undefined,
  },
  {
    id: 'hp_paladin_the_silver_hand',
    name: 'The Silver Hand',
    cost: 2,
    text: 'Choose One - Summon a 1/1 Recruit; or give your minions +1 Attack this turn.',
    chooseOne: [
      {
        text: 'Summon a 1/1 Recruit.',
        effects: [{ kind: 'summon', token: 'paladin_recruit', count: 1 }],
      },
      {
        text: 'Give your minions +1 Attack this turn.',
        effects: [{ kind: 'buffThisTurn', atk: 1, target: 'friendlyMinions' }],
      },
    ],
    art: undefined,
  },
  {
    id: 'hp_paladin_blessing_of_wisdom',
    name: 'Blessing of Wisdom',
    cost: 3,
    text: 'Give a friendly minion +1/+1 and Divine Shield.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    effects: [
      { kind: 'buff', atk: 1, health: 1, target: 'chosenTarget' },
      { kind: 'giveDivineShield', target: 'chosenTarget' },
    ],
    art: undefined,
  },
]
