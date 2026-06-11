/**
 * Pure meta-progression logic: calling unlocks, the daily hunt's seed/calling
 * schedule, and shareable run summaries. No engine or store dependencies —
 * `stores/meta.ts` wraps this with persistence.
 */

/** Callings available from the very first run. */
export const STARTER_CALLINGS = ['forest_warden_omu', 'hero_hunter', 'hero_warrior']

/** Remaining callings unlock in this order, one per COMPLETED run (win or lose). */
export const UNLOCK_ORDER = [
  'hero_mage',
  'hero_paladin',
  'hero_rogue',
  'hero_priest',
  'hero_shaman',
  'hero_warlock',
]

/** Every calling id, starters first then the unlock track. */
export const ALL_CALLINGS = [...STARTER_CALLINGS, ...UNLOCK_ORDER]

/**
 * The calling ids unlocked after a number of completed runs.
 * @param runsCompleted - runs finished (victory or defeat; abandons don't count)
 */
export function unlockedCallings(runsCompleted: number): string[] {
  return [...STARTER_CALLINGS, ...UNLOCK_ORDER.slice(0, Math.max(0, runsCompleted))]
}

/**
 * The next calling on the unlock track, or null when everything is open.
 * @returns the hero id and how many more completed runs it needs
 */
export function nextUnlock(
  runsCompleted: number
): { heroId: string; runsNeeded: number } | null {
  if (runsCompleted >= UNLOCK_ORDER.length) return null
  return { heroId: UNLOCK_ORDER[runsCompleted], runsNeeded: 1 }
}

/**
 * How many completed runs a specific calling needs (0 = starter).
 */
export function runsRequiredFor(heroId: string): number {
  const i = UNLOCK_ORDER.indexOf(heroId)
  return i < 0 ? 0 : i + 1
}

/* ----------------------------------------------------------------------------
 * The Daily Hunt — one seeded run per UTC day, same moor for everyone.
 * ------------------------------------------------------------------------- */

/** UTC date key (YYYY-MM-DD) for a Date. */
export function dailyDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** FNV-1a hash of a string — stable across sessions and platforms. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** The deterministic run seed for a daily date key. */
export function dailySeed(dateKey: string): number {
  return (fnv1a('hollowmoor-daily-' + dateKey) & 0x7fffffff) | 1
}

/** The fixed calling for a daily date key (rotates through all nine). */
export function dailyCallingFor(dateKey: string): string {
  return ALL_CALLINGS[fnv1a('hollowmoor-calling-' + dateKey) % ALL_CALLINGS.length]
}

/* ----------------------------------------------------------------------------
 * Run records & share text
 * ------------------------------------------------------------------------- */

/** One finished run, as recorded in the player's ledger. */
export interface RunRecord {
  /** UTC date key the run ended on. */
  date: string
  heroId: string
  wins: number
  losses: number
  result: 'victory' | 'defeat'
  /** True when this was the daily hunt. */
  daily?: boolean
  /** Mythic treasures held when the run ended (achievement fodder). */
  mythicsClaimed?: number
}

/**
 * Wordle-style share summary for a finished run.
 * @param opts.callingName - display name of the calling (e.g. 'Vicar')
 * @param opts.targetWins - the ladder length (12)
 * @param opts.dateKey - present for daily runs (shown in the header)
 */
export function shareText(opts: {
  result: 'victory' | 'defeat'
  wins: number
  losses: number
  callingName: string
  targetWins: number
  maxLosses: number
  dateKey?: string
}): string {
  const header = opts.dateKey
    ? `HOLLOWMOOR — Daily Hunt ${opts.dateKey}`
    : 'HOLLOWMOOR — A Roguelike Card Duel'
  const winPips = '🟡'.repeat(opts.wins) + '⚫'.repeat(Math.max(0, opts.targetWins - opts.wins))
  const lossPips = '✖'.repeat(opts.losses) + '♥'.repeat(Math.max(0, opts.maxLosses - opts.losses))
  const verdict =
    opts.result === 'victory'
      ? `CLAIMED THE MOOR — ${opts.wins} wins`
      : `The moor kept them — ${opts.wins} win${opts.wins === 1 ? '' : 's'}`
  return [
    header,
    `${opts.callingName} · ${verdict}`,
    `${winPips}`,
    `${lossPips}`,
    'https://toast.house/duels/',
  ].join('\n')
}
