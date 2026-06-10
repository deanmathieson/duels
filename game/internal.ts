import type { GameState, Keyword, MinionInstance, PlayerId } from './types'

/**
 * Engine-internal scratch state. The frozen `GameState` contract intentionally
 * omits these transient bookkeeping fields, but the engine needs somewhere to
 * track end-of-turn temporary buffs, this-turn hero spell damage, and queued
 * post-death summons. They live on the same object (so they serialize with the
 * state and survive a structuredClone) but are typed only here, never leaking
 * into the public contract.
 */
export interface InternalGameState extends GameState {
  /** Temporary buffs to revert at end of the active player's turn. */
  _tempBuffs?: TempBuff[]
  /** Per-player extra Spell Damage granted for the current turn only. */
  _heroSpellDamageThisTurn?: [number, number]
  /** Summons queued by scripts (e.g. Harvest Time) to resolve after deaths. */
  _postDeathSummons?: { token: string; count: number; owner: PlayerId }[]
  /**
   * Minions that took actual damage (after Divine Shield), queued by
   * dealDamageToEntity and flushed into onSelfDamaged / onFriendlyMinionDamaged /
   * onMinionDamaged triggers at the start of each checkDeaths pass — so a minion
   * dealt lethal damage still fires its trigger before it is removed.
   */
  _damagedMinions?: { instanceId: string; owner: PlayerId }[]
}

export type TempBuff =
  | { kind: 'minionAtk'; instanceId: string; amount: number }
  | { kind: 'heroAtk'; player: PlayerId; amount: number }

/**
 * Aura-delta bookkeeping stored directly on a minion instance so it survives
 * structuredClone (a WeakMap would not). Represents the aura contribution
 * currently baked into the minion's attack/maxHealth/keywords, so recompute can
 * revert it before re-applying.
 */
export interface InternalMinion extends MinionInstance {
  _auraAtk?: number
  _auraHealth?: number
  _auraKeywords?: Keyword[]
}

/** Narrow a GameState to the internal augmented view. */
export function asInternal(state: GameState): InternalGameState {
  return state as InternalGameState
}

/** Narrow a MinionInstance to the internal augmented view. */
export function asInternalMinion(m: MinionInstance): InternalMinion {
  return m as InternalMinion
}
