import type { TreasureDef } from '../../game/types'

/**
 * Enemy-only "difficulty" passives that scale the AI's board as the run climbs.
 * These are NOT offered to the player — the registry registers them so the engine
 * can attach their auras, but they are never added to any reward pool.
 */
export const scalingTreasures: TreasureDef[] = [
  {
    id: 'enemy_scale_1',
    name: 'The Moor Stirs',
    kind: 'passive',
    text: 'Your minions have +1/+1.',
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'minion' }],
  },
  {
    id: 'enemy_scale_2',
    name: 'The Moor Rises',
    kind: 'passive',
    text: 'Your minions have +2/+2.',
    auras: [{ kind: 'minionStat', atk: 2, health: 2, filter: 'minion' }],
  },
  {
    id: 'enemy_scale_3',
    name: 'The Moor Hungers',
    kind: 'passive',
    text: 'Your minions have +3/+3.',
    auras: [{ kind: 'minionStat', atk: 3, health: 3, filter: 'minion' }],
  },
]

/**
 * The scaling passive id for a given (1-based) round, or undefined for the
 * earliest rounds (no buff).
 * @param round - the run round the combat is for
 */
export function scalingTreasureForRound(round: number): string | undefined {
  if (round >= 10) return 'enemy_scale_3'
  if (round >= 7) return 'enemy_scale_2'
  if (round >= 4) return 'enemy_scale_1'
  return undefined
}
