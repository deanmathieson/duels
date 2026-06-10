import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Token cards embedded in / referenced by signature treasures.
// Any token summoned by a sig card is also defined in data/cards/paladin.ts
// (paladin_recruit, paladin_lights_justice, paladin_ashbringer).
// ---------------------------------------------------------------------------

/**
 * The Waxen Sacrament card — 2-mana Lamplighter spell.
 * Give a friendly minion Blessing and Leeching (a single-target
 * protect-and-sustain identity). Was "all friendly minions +1/+1 and
 * Blessing", which overlapped The Long Vigil's mass-buff finisher almost
 * exactly — now it's the cheap one-minion tool instead.
 */
const waxenSacramentCard: CardDef = {
  id: 'sig_paladin_lightforged_blessing',
  name: 'The Waxen Sacrament',
  cost: 2,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Give a friendly minion **Blessing** and **Leeching**.',
  flavor: 'Anointed in best bog-tallow by the Bog Bishop himself, hiccoughing the liturgy.',
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
 * The Vigil Banner card — 2-mana Lamplighter spell.
 * Summon three 1/1 Wicklings. Give your hero +3 Attack this turn.
 */
const vigilBannerCard: CardDef = {
  id: 'sig_paladin_rallying_banner',
  name: 'The Vigil Banner',
  cost: 2,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Summon three 1/1 Wicklings. Give your hero +3 Attack this turn.',
  flavor: 'The watch would follow it into hell itself. In practice it mostly leads them into the Goose & Gibbet.',
  spell: [
    { kind: 'summon', token: 'paladin_recruit', count: 3 },
    { kind: 'heroAttackThisTurn', amount: 3 },
  ],
  token: true,
  art: undefined,
}

/**
 * The Hanging Assizes card — 5-mana Lamplighter spell.
 * Destroy a minion. Gain 3 Armor.
 * (Approximated from a destroy-plus-scaling-armor design the engine can't
 *  express; costed at 5 with a trimmed armor rider — unconditional destroy
 *  alone anchors at 5 mana, so a 4-mana destroy + 5 Armor was ~3 mana of
 *  value over the curve.)
 */
const hangingAssizesCard: CardDef = {
  id: 'sig_paladin_sacred_trial',
  name: 'The Hanging Assizes',
  cost: 5,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Destroy an enemy minion. Gain 3 Armor.',
  flavor: 'Justice in Hollowmoor is swift, public, and tremendous fun for the whole family. Pies sold at the scaffold.',
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
 * The Long Vigil card — 5-mana Lamplighter spell.
 * Give all friendly minions +2/+2, Ward, and Blessing.
 * A powerful finisher buff for the go-wide watch.
 */
const longVigilCard: CardDef = {
  id: 'sig_paladin_hand_of_anyfin',
  name: 'The Long Vigil',
  cost: 5,
  type: 'spell',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: 'Give all friendly minions +2/+2, **Ward**, and **Blessing**.',
  flavor: 'All night the watch stands vigil together, shoulder to shoulder for warmth. Nine months on, the christenings.',
  spell: [
    { kind: 'buff', atk: 2, health: 2, target: 'friendlyMinions' },
    { kind: 'giveKeyword', keyword: 'taunt', target: 'friendlyMinions' },
    { kind: 'giveDivineShield', target: 'friendlyMinions' },
  ],
  token: true,
  art: undefined,
}

/**
 * Our Lady of the Lanterns card — 7-mana legendary Lamplighter minion.
 * 5/5. Omen: Summon four 1/1 Wicklings, then give your minions Blessing.
 * (The second battlecry effect shields ALL friendly minions — the Wicklings,
 *  any existing board, and the Lady herself — there is no Wickling-only
 *  selector.)
 */
const ladyOfTheLanternsCard: CardDef = {
  id: 'sig_paladin_lothraxion',
  name: 'Our Lady of the Lanterns',
  cost: 7,
  type: 'minion',
  cardClass: 'paladin',
  rarity: 'legendary',
  text: '**Omen:** Summon four 1/1 Wicklings, then give your minions **Blessing**.',
  flavor: 'She appears at the bog\'s edge to the faithful, the lost, and the very, very drunk. Mostly the last.',
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
 * All signature treasures for Tallow Meg, the Lamplighter (paladin).
 */
export const paladinSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_paladin_lightforged_blessing',
    name: 'The Waxen Sacrament',
    kind: 'signature',
    text: 'Give a friendly minion **Blessing** and **Leeching**.',
    card: waxenSacramentCard,
    tags: ['paladin-buff', 'divine-shield'],
  },
  {
    id: 'sig_paladin_rallying_banner',
    name: 'The Vigil Banner',
    kind: 'signature',
    text: 'Summon three 1/1 Wicklings. Give your hero +3 Attack this turn.',
    card: vigilBannerCard,
    tags: ['paladin-wide', 'recruit'],
  },
  {
    id: 'sig_paladin_sacred_trial',
    name: 'The Hanging Assizes',
    kind: 'signature',
    text: 'Destroy an enemy minion. Gain 3 Armor.',
    card: hangingAssizesCard,
    tags: ['paladin-removal', 'armor'],
  },
  {
    id: 'sig_paladin_hand_of_anyfin',
    name: 'The Long Vigil',
    kind: 'signature',
    text: 'Give all friendly minions +2/+2, **Ward**, and **Blessing**.',
    card: longVigilCard,
    tags: ['paladin-buff', 'finisher'],
  },
  {
    id: 'sig_paladin_lothraxion',
    name: 'Our Lady of the Lanterns',
    kind: 'signature',
    text: '5/5. **Omen:** Summon four 1/1 Wicklings, then give your minions **Blessing**.',
    card: ladyOfTheLanternsCard,
    tags: ['paladin-wide', 'divine-shield', 'finisher'],
  },
]
