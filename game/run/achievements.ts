import type { RunRecord } from './meta'

/**
 * Achievements ("cheeves") — pure definitions + evaluation over the player's
 * permanent ledger. Everything derives from recorded stats, so unlocks are
 * retroactive (existing players get credit on next load) and the evaluator is
 * idempotent: it returns the FULL set of satisfied ids; the meta store diffs
 * against what's already stamped.
 */

export interface AchievementDef {
  id: string
  name: string
  text: string
  /** Medallion glyph. */
  icon: string
  /** Fat achievement — the run-defining ones; presented mythic-style. */
  fat?: boolean
}

/** Everything the evaluator may consider (a plain snapshot of the ledger). */
export interface AchievementInput {
  runsCompleted: number
  victories: number
  history: RunRecord[]
  byCalling: Record<string, { victories: number }>
  mythicsSeen: number
  mythicTotal: number
  bestDailyStreak: number
  callingsTotal: number
  callingsUnlocked: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // --- the early road ---
  { id: 'ach_first_run', name: 'Settling In', icon: '🏚', text: 'Complete your first run. Win or lose, the moor now knows your name.' },
  { id: 'ach_first_win', name: 'Claim the Moor', icon: '🏆', text: 'Win a run — twelve fights, still standing.' },
  { id: 'ach_first_mythic', name: 'A Glimpse of the Absurd', icon: '👁', text: 'Be offered a mythic treasure.' },
  { id: 'ach_mythic_claimed', name: 'Bargain Struck', icon: '🤝', text: 'Claim a mythic treasure during a run.' },
  { id: 'ach_daily_first', name: "Today's Special", icon: '📅', text: 'Complete a Daily Hunt.' },

  // --- the long road ---
  { id: 'ach_daily_win', name: 'Punctual and Dangerous', icon: '⏰', text: 'Win a Daily Hunt.' },
  { id: 'ach_all_callings', name: 'Nine Lives', icon: '🗝', text: 'Unlock every calling.' },
  { id: 'ach_three_calling_wins', name: 'Versatile Villain', icon: '🎭', text: 'Win runs with three different callings.' },
  { id: 'ach_ten_wins', name: 'Decorated', icon: '🎖', text: 'Win ten runs.' },
  { id: 'ach_25_runs', name: 'Local Fixture', icon: '🍺', text: 'Complete twenty-five runs. The tavern keeps your stool empty.' },
  { id: 'ach_streak_7', name: 'Regular Customer', icon: '🕯', text: 'Keep a seven-day Daily Hunt streak.' },

  // --- the fat ones ---
  { id: 'ach_flawless', name: 'Untouched by the Damp', icon: '✨', fat: true, text: 'Win a run without losing a single fight. 12–0.' },
  { id: 'ach_comeback', name: 'Back from the Bog', icon: '🥀', fat: true, text: 'Win a run from the brink — two losses on the board.' },
  { id: 'ach_three_mythics_run', name: 'Greed Beyond Reason', icon: '💀', fat: true, text: 'Hold three mythic treasures in a single run.' },
  { id: 'ach_all_mythics', name: 'The Full Ledger', icon: '📖', fat: true, text: 'Discover every mythic treasure the moor has to offer.' },
  { id: 'ach_nine_calling_wins', name: 'Master of the Moor', icon: '👑', fat: true, text: 'Win a run with every one of the nine callings.' },
]

/** Quick lookup by id. */
export const ACHIEVEMENT_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
)

/**
 * Evaluate which achievements the ledger satisfies. Returns the FULL set of
 * earned ids (idempotent) — callers diff against previously stamped unlocks.
 */
export function evaluateAchievements(input: AchievementInput): string[] {
  const out: string[] = []
  const callingWins = Object.values(input.byCalling).filter((c) => c.victories > 0).length
  const has = (pred: (r: RunRecord) => boolean) => input.history.some(pred)

  if (input.runsCompleted >= 1) out.push('ach_first_run')
  if (input.victories >= 1) out.push('ach_first_win')
  if (input.mythicsSeen >= 1) out.push('ach_first_mythic')
  if (has((r) => (r.mythicsClaimed ?? 0) >= 1)) out.push('ach_mythic_claimed')
  if (has((r) => !!r.daily)) out.push('ach_daily_first')

  if (has((r) => !!r.daily && r.result === 'victory')) out.push('ach_daily_win')
  if (input.callingsUnlocked >= input.callingsTotal) out.push('ach_all_callings')
  if (callingWins >= 3) out.push('ach_three_calling_wins')
  if (input.victories >= 10) out.push('ach_ten_wins')
  if (input.runsCompleted >= 25) out.push('ach_25_runs')
  if (input.bestDailyStreak >= 7) out.push('ach_streak_7')

  if (has((r) => r.result === 'victory' && r.losses === 0)) out.push('ach_flawless')
  if (has((r) => r.result === 'victory' && r.losses === 2)) out.push('ach_comeback')
  if (has((r) => (r.mythicsClaimed ?? 0) >= 3)) out.push('ach_three_mythics_run')
  if (input.mythicTotal > 0 && input.mythicsSeen >= input.mythicTotal) out.push('ach_all_mythics')
  if (input.callingsTotal > 0 && callingWins >= input.callingsTotal) out.push('ach_nine_calling_wins')

  return out
}
