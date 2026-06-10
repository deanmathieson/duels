import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Token cards embedded in / referenced by signature treasures.
// Any token summoned by a sig card is also defined in data/cards/paladin.ts
// (paladin_recruit, paladin_lights_justice, paladin_ashbringer).
// ---------------------------------------------------------------------------

/**
 * Lightforged Blessing card — 2-mana Paladin spell.
 * Give a friendly minion Divine Shield and Lifesteal (the real card's
 * single-target identity). Was "all friendly minions +1/+1 and Divine Shield",
 * which overlapped Hand of Anyfin's mass-buff finisher almost exactly — now
 * it's the cheap one-minion protect-and-sustain tool instead.
 */
const lightforgedBlessingCard: CardDef = {
  id: 'sig_paladin_lightforged_blessing',
  name: 'Lightforged Blessing',
  cost: 2,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Give a friendly minion **Divine Shield** and **Lifesteal**.',
  targeted: true,
  targetFilter: 'friendlyMinions',
  spell: [
    { kind: 'giveDivineShield', target: 'chosenTarget' },
    { kind: 'giveKeyword', keyword: 'lifesteal', target: 'chosenTarget' },
  ],
  token: true,
  art: undefined,
}

/**
 * Rallying Banner card — 2-mana Paladin spell.
 * Summon three 1/1 Recruits. Give your hero +3 Attack this turn.
 */
const rallyingBannerCard: CardDef = {
  id: 'sig_paladin_rallying_banner',
  name: 'Rallying Banner',
  cost: 2,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Summon three 1/1 Recruits. Give your hero +3 Attack this turn.',
  spell: [
    { kind: 'summon', token: 'paladin_recruit', count: 3 },
    { kind: 'heroAttackThisTurn', amount: 3 },
  ],
  token: true,
  art: undefined,
}

/**
 * Sacred Trial card — 5-mana Paladin spell.
 * Destroy a minion. Gain Armor equal to its Attack.
 * Approximated as: destroy a minion + gain 3 Armor (fixed amount, thematic).
 * (The real Libram of Justice / Trial by Fire mechanic is not in the engine;
 *  we approximate the feel with a destroy + armor gain. Costed at 5 with a
 *  trimmed armor rider — unconditional destroy alone anchors at 5 mana, so the
 *  old 4-mana destroy + 5 Armor was ~3 mana of value over the curve.)
 */
const sacredTrialCard: CardDef = {
  id: 'sig_paladin_sacred_trial',
  name: 'Sacred Trial',
  cost: 5,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Destroy an enemy minion. Gain 3 Armor.',
  targeted: true,
  targetFilter: 'enemyMinions',
  spell: [
    { kind: 'destroy', target: 'chosenTarget' },
    { kind: 'gainArmor', amount: 3 },
  ],
  token: true,
  art: undefined,
}

/**
 * Hand of Anyfin card — 5-mana Paladin spell.
 * Give all friendly minions +2/+2, Taunt, and Divine Shield.
 * A powerful finisher buff reminiscent of the wide board payoffs in Paladin.
 */
const handOfAnyfin: CardDef = {
  id: 'sig_paladin_hand_of_anyfin',
  name: 'Hand of Anyfin',
  cost: 5,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Give all friendly minions +2/+2, **Taunt**, and **Divine Shield**.',
  spell: [
    { kind: 'buff', atk: 2, health: 2, target: 'friendlyMinions' },
    { kind: 'giveKeyword', keyword: 'taunt', target: 'friendlyMinions' },
    { kind: 'giveDivineShield', target: 'friendlyMinions' },
  ],
  token: true,
  art: undefined,
}

/**
 * Lothraxion the Redeemed card — 7-mana legendary Paladin minion.
 * 5/5. Battlecry: Summon four 1/1 Recruits, then give your minions Divine Shield.
 * (The second battlecry effect shields ALL friendly minions — the Recruits, any
 *  existing board, and Lothraxion itself — there is no Recruit-only selector.)
 */
const lothraxionCard: CardDef = {
  id: 'sig_paladin_lothraxion',
  name: 'Lothraxion the Redeemed',
  cost: 7,
  type: 'minion',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: '**Battlecry:** Summon four 1/1 Recruits, then give your minions **Divine Shield**.',
  attack: 5,
  health: 5,
  tribe: 'none',
  battlecry: [
    { kind: 'summon', token: 'paladin_recruit', count: 4 },
    { kind: 'giveDivineShield', target: 'friendlyMinions' },
  ],
  token: true,
  art: undefined,
}

/**
 * All signature treasures for Lothraxion the Redeemed (Paladin).
 */
export const paladinSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_paladin_lightforged_blessing',
    name: 'Lightforged Blessing',
    kind: 'signature',
    text: 'Give a friendly minion **Divine Shield** and **Lifesteal**.',
    card: lightforgedBlessingCard,
    tags: ['paladin-buff', 'divine-shield'],
  },
  {
    id: 'sig_paladin_rallying_banner',
    name: 'Rallying Banner',
    kind: 'signature',
    text: 'Summon three 1/1 Recruits. Give your hero +3 Attack this turn.',
    card: rallyingBannerCard,
    tags: ['paladin-wide', 'recruit'],
  },
  {
    id: 'sig_paladin_sacred_trial',
    name: 'Sacred Trial',
    kind: 'signature',
    text: 'Destroy an enemy minion. Gain 3 Armor.',
    card: sacredTrialCard,
    tags: ['paladin-removal', 'armor'],
  },
  {
    id: 'sig_paladin_hand_of_anyfin',
    name: 'Hand of Anyfin',
    kind: 'signature',
    text: 'Give all friendly minions +2/+2, **Taunt**, and **Divine Shield**.',
    card: handOfAnyfin,
    tags: ['paladin-buff', 'finisher'],
  },
  {
    id: 'sig_paladin_lothraxion',
    name: 'Lothraxion the Redeemed',
    kind: 'signature',
    text: '5/5. **Battlecry:** Summon four 1/1 Recruits, then give your minions **Divine Shield**.',
    card: lothraxionCard,
    tags: ['paladin-wide', 'divine-shield', 'finisher'],
  },
]
