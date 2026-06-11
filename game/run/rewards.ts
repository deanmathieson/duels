import type { CardDef, RewardOffering, RewardType, RngState, SynergyTag } from '../types'
import { next, shuffle } from '../rng'

/**
 * The reward type offered after a given (1-based) round.
 *  - rounds 1 & 3 → passive treasure
 *  - rounds 2, 4, 6, 8, 10 → active treasure
 *  - otherwise → card bucket
 * @param round - the 1-based round number just completed
 * @returns the reward type to offer
 */
export function rewardScheduleFor(round: number): RewardType {
  if (round === 1 || round === 3) return 'passiveTreasure'
  if (round === 2 || round === 4 || round === 6 || round === 8 || round === 10) {
    return 'activeTreasure'
  }
  return 'bucket'
}

/** Pools of candidate ids the caller supplies (no engine→data import). */
export interface RewardPools {
  /** Bucket ids for 'bucket' rewards. */
  buckets: string[]
  /** Passive treasure ids for 'passiveTreasure' rewards. */
  passiveTreasures: string[]
  /** Active treasure ids for 'activeTreasure' rewards. */
  activeTreasures: string[]
}

/**
 * Generate a reward offering of three distinct choices drawn from the supplied
 * pools. Pure aside from advancing the passed RNG state.
 * @param type - the reward type (determines which pool to draw from)
 * @param round - the round number (reserved for future weighting)
 * @param rng - seeded RNG state (advanced in place)
 * @param pools - candidate id pools provided by the caller
 * @returns a RewardOffering with up to 3 unique choices
 */
export function generateOffering(
  type: RewardType,
  round: number,
  rng: RngState,
  pools: RewardPools
): RewardOffering {
  const source =
    type === 'bucket'
      ? pools.buckets
      : type === 'passiveTreasure'
        ? pools.passiveTreasures
        : pools.activeTreasures

  const copy = [...source]
  shuffle(rng, copy)
  const choices = copy.slice(0, Math.min(3, copy.length))
  return { type, choices }
}

/* ----------------------------------------------------------------------------
 * Synergy-weighted treasure offerings
 * ------------------------------------------------------------------------- */

/**
 * Score the deck's archetype lean per synergy tag, 0..1 each. A signal only
 * registers once the deck genuinely leans that way (≥ ~threshold share of the
 * deck, scaled per tag since e.g. weapons are rarer than spells). Used to
 * weight treasure offerings toward what the player is building.
 * @param cards - the resolved card defs of the player's current deck
 * @returns tag → strength map (absent tag = no lean)
 */
export function deckSynergies(cards: CardDef[]): Partial<Record<SynergyTag, number>> {
  const n = cards.length
  if (n === 0) return {}
  const minions = cards.filter((c) => c.type === 'minion')
  const out: Partial<Record<SynergyTag, number>> = {}
  const put = (tag: SynergyTag, count: number, scale: number): void => {
    const v = Math.min(1, (count / n) * scale)
    if (v >= 0.25) out[tag] = v
  }
  put('spells', cards.filter((c) => c.type === 'spell').length, 2)
  put('beasts', minions.filter((c) => c.tribe === 'beast').length, 3)
  put('fae', minions.filter((c) => c.tribe === 'demon').length, 3)
  put('ward', minions.filter((c) => (c.keywords ?? []).includes('taunt')).length, 4)
  put('omen', cards.filter((c) => !!c.battlecry).length, 2.5)
  put('haunt', cards.filter((c) => !!c.deathrattle).length, 4)
  put('swarm', minions.filter((c) => c.cost <= 2).length, 3)
  put('big', cards.filter((c) => c.cost >= 5).length, 3)
  put('weapons', cards.filter((c) => c.type === 'weapon').length, 6)
  return out
}

/**
 * The offering weight of a treasure given the deck's synergy signals: baseline
 * 1, plus 2.5 per point of matching signal — a strong lean makes an on-theme
 * treasure ~3.5x as likely as an off-theme one. Unknown/legacy tags add 0.
 */
export function treasureWeight(
  tags: string[] | undefined,
  synergies: Partial<Record<SynergyTag, number>>
): number {
  let bonus = 0
  for (const t of tags ?? []) bonus += synergies[t as SynergyTag] ?? 0
  return 1 + 2.5 * bonus
}

/** A treasure candidate for a weighted offering roll. */
export interface TreasureCandidate {
  id: string
  /** Relative draw weight (≥ 0); see treasureWeight. */
  weight: number
  /** Run-warping jackpot — only drawn via the jackpot slot. */
  jackpot?: boolean
}

/**
 * Generate a treasure offering of up to 3 unique choices by weighted draw.
 *
 * Jackpot rule: with probability `jackpotChance` (and at most once per
 * offering) one slot is drawn from the jackpot candidates — the run-warping
 * crazies — so most offerings are solid-but-sane and occasionally the moor
 * offers something absurd. Remaining slots draw from the common pool, falling
 * back to jackpots only when commons run dry. Choice order is shuffled so the
 * jackpot doesn't always sit in the same slot.
 *
 * @param type - the reward type recorded on the offering
 * @param rng - seeded RNG state (advanced in place)
 * @param candidates - the eligible treasures with weights
 * @param jackpotChance - probability [0..1] that a jackpot slot is rolled
 * @returns a RewardOffering with up to 3 unique choices
 */
export function generateTreasureOffering(
  type: RewardType,
  rng: RngState,
  candidates: TreasureCandidate[],
  jackpotChance: number
): RewardOffering {
  const commons = candidates.filter((c) => !c.jackpot)
  const jackpots = candidates.filter((c) => c.jackpot)

  /** Weighted draw without replacement; mutates the pool. */
  const draw = (pool: TreasureCandidate[]): string | undefined => {
    const total = pool.reduce((s, c) => s + Math.max(0, c.weight), 0)
    if (pool.length === 0 || total <= 0) return undefined
    let roll = next(rng) * total
    for (let i = 0; i < pool.length; i++) {
      roll -= Math.max(0, pool[i].weight)
      if (roll <= 0) return pool.splice(i, 1)[0].id
    }
    return pool.pop()?.id
  }

  const choices: string[] = []
  if (jackpots.length > 0 && next(rng) < jackpotChance) {
    const id = draw(jackpots)
    if (id) choices.push(id)
  }
  while (choices.length < 3) {
    const id = draw(commons) ?? draw(jackpots)
    if (!id) break
    choices.push(id)
  }
  shuffle(rng, choices)
  return { type, choices }
}
