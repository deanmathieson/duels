/**
 * Public API surface for the pure game engine. UI / store / integrator import
 * from here. Keep this list aligned with the engine contract in types.ts.
 */
export { applyAction, createInitialState, registerTreasures, clearTreasures } from './engine'
export { queries } from './queries'
export { chooseAiAction, aiProfileFor } from './ai/heuristicAI'
// The FULL live Spell Damage bonus for a player's spells this turn — board
// minions + auras PLUS temporary "+N this turn" hero effects. The UI shows
// this on spell cards so the boost matches the damage actually dealt.
export { spellDamageBonus } from './effects'
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
