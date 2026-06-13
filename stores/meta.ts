import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import type { RunRecord } from '~/game/run/meta'
import {
  ALL_CALLINGS,
  dailyCallingFor,
  dailyDateKey,
  dailySeed,
  nextUnlock,
  runsRequiredFor,
  unlockedCallings,
} from '~/game/run/meta'
import { evaluateAchievements } from '~/game/run/achievements'
import { allTreasures } from '~/data/registry'

const STORAGE_KEY = 'duels-meta'
const HISTORY_CAP = 30

/** Per-calling lifetime aggregates (survive the history cap). */
interface CallingStats {
  runs: number
  victories: number
  bestWins: number
}

interface MetaSnapshot {
  runsCompleted: number
  victories: number
  bestWins: number
  history: RunRecord[]
  byCalling: Record<string, CallingStats>
  mythicsSeen: string[]
  daily: {
    lastKey?: string
    streak: number
    /** Longest streak ever held (achievements). */
    bestStreak?: number
    /** Result of the most recent daily, shown on the menu after playing. */
    lastResult?: { key: string; wins: number; losses: number; result: 'victory' | 'defeat' }
  }
  /** Achievement id -> UTC date key unlocked. */
  achievements: Record<string, string>
}

/**
 * The player's permanent ledger: lifetime stats, run history, calling unlocks,
 * discovered mythics and the daily hunt's state. Persisted to localStorage —
 * it survives runs, refreshes and deploys.
 */
export const useMetaStore = defineStore('meta', () => {
  const runsCompleted = ref(0)
  const victories = ref(0)
  const bestWins = ref(0)
  const history = ref<RunRecord[]>([])
  const byCalling = ref<Record<string, CallingStats>>({})
  const mythicsSeen = ref<string[]>([])
  const daily = ref<MetaSnapshot['daily']>({ streak: 0 })
  const achievements = ref<Record<string, string>>({})
  /** Achievements stamped by the most recent evaluation (end-screen toasts). */
  const recentUnlocks = ref<string[]>([])

  let loaded = false

  function snapshot(): MetaSnapshot {
    return {
      runsCompleted: runsCompleted.value,
      victories: victories.value,
      bestWins: bestWins.value,
      history: [...history.value],
      byCalling: { ...byCalling.value },
      mythicsSeen: [...mythicsSeen.value],
      daily: { ...daily.value },
      achievements: { ...achievements.value },
    }
  }

  function save(): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()))
    } catch {
      /* storage full / private mode — stats are best-effort */
    }
  }

  /** Load the ledger from localStorage (idempotent; call before first read). */
  function load(): void {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const s = JSON.parse(raw) as Partial<MetaSnapshot>
      runsCompleted.value = s.runsCompleted ?? 0
      victories.value = s.victories ?? 0
      bestWins.value = s.bestWins ?? 0
      history.value = [...(s.history ?? [])]
      byCalling.value = { ...(s.byCalling ?? {}) }
      mythicsSeen.value = [...(s.mythicsSeen ?? [])]
      daily.value = { streak: 0, ...(s.daily ?? {}) }
      achievements.value = { ...(s.achievements ?? {}) }
    } catch {
      /* corrupted save — start a fresh ledger */
    }
    // Retroactive credit: stamp anything the existing ledger already earns.
    reevaluateAchievements(false)
  }

  /* --------------------------------------------------------------------------
   * Unlocks
   * ----------------------------------------------------------------------- */

  const unlockedIds = computed(() => new Set(unlockedCallings(runsCompleted.value)))

  /** Whether a calling may start a FREE run (dailies bypass locks). */
  function isCallingUnlocked(heroId: string): boolean {
    load()
    return unlockedIds.value.has(heroId)
  }

  /** Completed runs still needed before this calling unlocks (0 = unlocked). */
  function runsUntilUnlock(heroId: string): number {
    load()
    return Math.max(0, runsRequiredFor(heroId) - runsCompleted.value)
  }

  /** The next calling on the unlock track, or null when all are open. */
  const upcomingUnlock = computed(() => nextUnlock(runsCompleted.value))

  /* --------------------------------------------------------------------------
   * Run recording
   * ----------------------------------------------------------------------- */

  /**
   * Record a finished run (victory or defeat — abandons don't count) into the
   * ledger, advancing unlocks, aggregates and (for dailies) the streak.
   */
  function recordRunEnd(rec: RunRecord): void {
    load()
    runsCompleted.value += 1
    if (rec.result === 'victory') victories.value += 1
    bestWins.value = Math.max(bestWins.value, rec.wins)
    history.value = [rec, ...history.value].slice(0, HISTORY_CAP)
    const c = byCalling.value[rec.heroId] ?? { runs: 0, victories: 0, bestWins: 0 }
    byCalling.value = {
      ...byCalling.value,
      [rec.heroId]: {
        runs: c.runs + 1,
        victories: c.victories + (rec.result === 'victory' ? 1 : 0),
        bestWins: Math.max(c.bestWins, rec.wins),
      },
    }
    if (rec.daily) {
      const key = rec.date
      const prev = daily.value.lastKey
      const yesterday = dailyDateKey(new Date(Date.parse(key) - 86400000))
      const streak =
        prev === yesterday || prev === key ? daily.value.streak + (prev === key ? 0 : 1) : 1
      daily.value = {
        lastKey: key,
        streak,
        bestStreak: Math.max(daily.value.bestStreak ?? 0, streak),
        lastResult: { key, wins: rec.wins, losses: rec.losses, result: rec.result },
      }
    }
    reevaluateAchievements(true)
    save()
  }

  /** Mark mythic treasures the player has now SEEN in an offering (codex reveal). */
  function markMythicsSeen(ids: string[]): void {
    if (ids.length === 0) return
    load()
    const set = new Set(mythicsSeen.value)
    let grew = false
    for (const id of ids) {
      if (!set.has(id)) {
        set.add(id)
        grew = true
      }
    }
    if (grew) {
      mythicsSeen.value = [...set]
      reevaluateAchievements(false)
      save()
    }
  }

  /* --------------------------------------------------------------------------
   * Achievements
   * ----------------------------------------------------------------------- */

  /** Total mythics in the content set (for The Full Ledger). */
  const mythicTotal = allTreasures.filter((t) => t.jackpot).length

  /**
   * Re-run the pure evaluator over the ledger and stamp anything new.
   * @param toast - when true, newly stamped ids replace recentUnlocks (end-screen banners)
   */
  function reevaluateAchievements(toast: boolean): void {
    const earned = evaluateAchievements({
      runsCompleted: runsCompleted.value,
      victories: victories.value,
      history: history.value,
      byCalling: byCalling.value,
      mythicsSeen: mythicsSeen.value.length,
      mythicTotal,
      bestDailyStreak: Math.max(daily.value.bestStreak ?? 0, daily.value.streak),
      callingsTotal: ALL_CALLINGS.length,
      callingsUnlocked: unlockedCallings(runsCompleted.value).length,
    })
    const fresh = earned.filter((id) => !(id in achievements.value))
    if (fresh.length) {
      const today = dailyDateKey(new Date())
      const next = { ...achievements.value }
      for (const id of fresh) next[id] = today
      achievements.value = next
    }
    if (toast) recentUnlocks.value = fresh
  }

  /** Whether an achievement is unlocked (and when). */
  function achievementUnlockedOn(id: string): string | undefined {
    load()
    return achievements.value[id]
  }

  /** Whether a mythic has been encountered (codex shows it unobscured). */
  function isMythicSeen(id: string): boolean {
    load()
    return mythicsSeen.value.includes(id)
  }

  /* --------------------------------------------------------------------------
   * The Daily Hunt
   * ----------------------------------------------------------------------- */

  /** Today's daily descriptor + whether it has already been played. */
  function dailyStatus(): {
    key: string
    seed: number
    heroId: string
    playedToday: boolean
    lastResult?: MetaSnapshot['daily']['lastResult']
  } {
    load()
    const key = dailyDateKey(new Date())
    return {
      key,
      seed: dailySeed(key),
      heroId: dailyCallingFor(key),
      playedToday: daily.value.lastResult?.key === key,
      lastResult: daily.value.lastResult,
    }
  }

  return {
    runsCompleted,
    victories,
    bestWins,
    history,
    byCalling,
    mythicsSeen,
    daily,
    achievements,
    recentUnlocks,
    achievementUnlockedOn,
    load,
    isCallingUnlocked,
    runsUntilUnlock,
    upcomingUnlock,
    recordRunEnd,
    markMythicsSeen,
    isMythicSeen,
    dailyStatus,
  }
})

// Accept hot updates so editing this store mid-session re-patches the live
// instance instead of wedging its reactivity.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMetaStore, import.meta.hot))
}
