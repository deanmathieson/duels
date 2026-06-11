import { describe, expect, it } from 'vitest'
import {
  ALL_CALLINGS,
  STARTER_CALLINGS,
  UNLOCK_ORDER,
  dailyCallingFor,
  dailyDateKey,
  dailySeed,
  nextUnlock,
  runsRequiredFor,
  shareText,
  unlockedCallings,
} from '../game/run/meta'

describe('calling unlocks', () => {
  it('starts with exactly the three starter callings', () => {
    expect(unlockedCallings(0)).toEqual(STARTER_CALLINGS)
  })

  it('unlocks one calling per completed run, in order', () => {
    expect(unlockedCallings(1)).toContain(UNLOCK_ORDER[0])
    expect(unlockedCallings(1)).not.toContain(UNLOCK_ORDER[1])
    expect(unlockedCallings(UNLOCK_ORDER.length)).toEqual(ALL_CALLINGS)
    // Over-completion never throws or duplicates.
    expect(unlockedCallings(99)).toEqual(ALL_CALLINGS)
  })

  it('reports the next unlock and runs required', () => {
    expect(nextUnlock(0)).toEqual({ heroId: UNLOCK_ORDER[0], runsNeeded: 1 })
    expect(nextUnlock(UNLOCK_ORDER.length)).toBeNull()
    expect(runsRequiredFor(STARTER_CALLINGS[0])).toBe(0)
    expect(runsRequiredFor(UNLOCK_ORDER[2])).toBe(3)
  })
})

describe('the daily hunt', () => {
  it('derives a stable UTC date key', () => {
    expect(dailyDateKey(new Date('2026-06-11T13:00:00Z'))).toBe('2026-06-11')
    expect(dailyDateKey(new Date('2026-06-11T23:59:59Z'))).toBe('2026-06-11')
  })

  it('seeds are deterministic per day and differ across days', () => {
    expect(dailySeed('2026-06-11')).toBe(dailySeed('2026-06-11'))
    expect(dailySeed('2026-06-11')).not.toBe(dailySeed('2026-06-12'))
    // Positive 31-bit (engine RNG seed domain).
    for (const k of ['2026-01-01', '2026-06-11', '2027-12-31']) {
      const s = dailySeed(k)
      expect(s).toBeGreaterThan(0)
      expect(s).toBeLessThanOrEqual(0x7fffffff)
    }
  })

  it('the daily calling is deterministic and always a real calling', () => {
    expect(dailyCallingFor('2026-06-11')).toBe(dailyCallingFor('2026-06-11'))
    for (let d = 1; d <= 28; d++) {
      const key = `2026-06-${String(d).padStart(2, '0')}`
      expect(ALL_CALLINGS).toContain(dailyCallingFor(key))
    }
  })

  it('rotates callings across days (not stuck on one)', () => {
    const seen = new Set<string>()
    for (let d = 1; d <= 28; d++) {
      seen.add(dailyCallingFor(`2026-06-${String(d).padStart(2, '0')}`))
    }
    expect(seen.size).toBeGreaterThan(3)
  })
})

describe('share text', () => {
  const base = { wins: 7, losses: 3, callingName: 'Vicar', targetWins: 12, maxLosses: 3 }

  it('formats a defeat with pips, calling and link', () => {
    const t = shareText({ ...base, result: 'defeat' as const })
    expect(t).toContain('HOLLOWMOOR')
    expect(t).toContain('Vicar')
    expect(t).toContain('🟡'.repeat(7))
    expect(t).toContain('⚫'.repeat(5))
    expect(t).toContain('✖✖✖')
    expect(t).toContain('https://toast.house/duels/')
  })

  it('flags daily runs with the date and victories with the claim line', () => {
    const t = shareText({ ...base, result: 'victory' as const, wins: 12, losses: 1, dateKey: '2026-06-11' })
    expect(t).toContain('Daily Hunt 2026-06-11')
    expect(t).toContain('CLAIMED THE MOOR')
    expect(t).toContain('🟡'.repeat(12))
  })
})
