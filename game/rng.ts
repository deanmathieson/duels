import type { RngState } from './types'

/**
 * Advance the seeded RNG (Mulberry32) and return a float in [0, 1).
 * Mutates `state.seed` so subsequent calls are deterministic and replayable.
 * @param state - the RNG state stored inside GameState
 * @returns a pseudo-random float in the range [0, 1)
 */
export function next(state: RngState): number {
  // Mulberry32 — fast, deterministic, 32-bit state.
  state.seed = (state.seed + 0x6d2b79f5) | 0
  let t = state.seed
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Return a pseudo-random integer in the range [0, maxExcl).
 * @param state - the RNG state
 * @param maxExcl - exclusive upper bound (returns 0 when <= 0)
 * @returns an integer in [0, maxExcl)
 */
export function nextInt(state: RngState, maxExcl: number): number {
  if (maxExcl <= 0) return 0
  return Math.floor(next(state) * maxExcl)
}

/**
 * Fisher–Yates shuffle. Mutates and returns the same array for convenience.
 * @param state - the RNG state
 * @param array - the array to shuffle in place
 * @returns the shuffled array
 */
export function shuffle<T>(state: RngState, array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = nextInt(state, i + 1)
    const tmp = array[i]
    array[i] = array[j]
    array[j] = tmp
  }
  return array
}

/**
 * Pick a single random element from an array.
 * @param state - the RNG state
 * @param array - the array to pick from
 * @returns a random element, or undefined when the array is empty
 */
export function pick<T>(state: RngState, array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[nextInt(state, array.length)]
}
