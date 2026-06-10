import type { RewardOffering, RewardType, RngState } from '../types'
import { shuffle } from '../rng'

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
