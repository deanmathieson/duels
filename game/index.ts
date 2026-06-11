/**
 * Public API surface for the pure game engine. UI / store / integrator import
 * from here. Keep this list aligned with the engine contract in types.ts.
 */
export { applyAction, createInitialState, registerTreasures, clearTreasures } from './engine'
export { queries } from './queries'
export { chooseAiAction, aiProfileFor } from './ai/heuristicAI'
export {
  registerCards,
  getCard,
  hasCard,
  clearCards,
  getPool,
  registerHeroPowers,
  getHeroPower,
  hasHeroPower,
} from './cardDb'
export {
  rewardScheduleFor,
  generateOffering,
  generateTreasureOffering,
  deckSynergies,
  treasureWeight,
} from './run/rewards'
export type { RewardPools, TreasureCandidate } from './run/rewards'
export * as rng from './rng'
