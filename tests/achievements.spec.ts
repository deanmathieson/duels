import { describe, expect, it } from 'vitest'
import type { AchievementInput } from '../game/run/achievements'
import { ACHIEVEMENTS, ACHIEVEMENT_BY_ID, evaluateAchievements } from '../game/run/achievements'
import type { RunRecord } from '../game/run/meta'

function input(over: Partial<AchievementInput> = {}): AchievementInput {
  return {
    runsCompleted: 0,
    victories: 0,
    history: [],
    byCalling: {},
    mythicsSeen: 0,
    mythicTotal: 17,
    bestDailyStreak: 0,
    callingsTotal: 9,
    callingsUnlocked: 3,
    ...over,
  }
}

function run(over: Partial<RunRecord> = {}): RunRecord {
  return { date: '2026-06-11', heroId: 'hero_hunter', wins: 4, losses: 3, result: 'defeat', ...over }
}

describe('achievement definitions', () => {
  it('have unique ids and the lookup matches', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const a of ACHIEVEMENTS) expect(ACHIEVEMENT_BY_ID[a.id]).toBe(a)
  })

  it('a fresh ledger earns nothing', () => {
    expect(evaluateAchievements(input())).toEqual([])
  })
})

describe('evaluateAchievements', () => {
  it('stamps the early road', () => {
    const got = evaluateAchievements(
      input({ runsCompleted: 1, victories: 1, mythicsSeen: 1, history: [run({ result: 'victory', losses: 1 })] })
    )
    expect(got).toContain('ach_first_run')
    expect(got).toContain('ach_first_win')
    expect(got).toContain('ach_first_mythic')
    expect(got).not.toContain('ach_flawless')
  })

  it('detects flawless (12-0) and comeback (win at 2 losses) victories', () => {
    const flawless = evaluateAchievements(
      input({ history: [run({ result: 'victory', wins: 12, losses: 0 })] })
    )
    expect(flawless).toContain('ach_flawless')
    expect(flawless).not.toContain('ach_comeback')

    const comeback = evaluateAchievements(
      input({ history: [run({ result: 'victory', wins: 12, losses: 2 })] })
    )
    expect(comeback).toContain('ach_comeback')
    expect(comeback).not.toContain('ach_flawless')

    // A 2-loss DEFEAT is not a comeback.
    const lost = evaluateAchievements(input({ history: [run({ result: 'defeat', losses: 2 })] }))
    expect(lost).not.toContain('ach_comeback')
  })

  it('tracks mythic claims per run', () => {
    expect(
      evaluateAchievements(input({ history: [run({ mythicsClaimed: 1 })] }))
    ).toContain('ach_mythic_claimed')
    const greedy = evaluateAchievements(input({ history: [run({ mythicsClaimed: 3 })] }))
    expect(greedy).toContain('ach_three_mythics_run')
    // One mythic in each of three runs is NOT greed beyond reason.
    const spread = evaluateAchievements(
      input({ history: [run({ mythicsClaimed: 1 }), run({ mythicsClaimed: 1 }), run({ mythicsClaimed: 1 })] })
    )
    expect(spread).not.toContain('ach_three_mythics_run')
  })

  it('daily achievements need daily runs', () => {
    const free = evaluateAchievements(input({ history: [run({ result: 'victory' })] }))
    expect(free).not.toContain('ach_daily_first')
    const daily = evaluateAchievements(
      input({ history: [run({ daily: true, result: 'victory' })], bestDailyStreak: 7 })
    )
    expect(daily).toContain('ach_daily_first')
    expect(daily).toContain('ach_daily_win')
    expect(daily).toContain('ach_streak_7')
  })

  it('calling mastery counts distinct winning callings', () => {
    const three = evaluateAchievements(
      input({
        byCalling: {
          a: { victories: 2 },
          b: { victories: 1 },
          c: { victories: 1 },
          d: { victories: 0 },
        },
      })
    )
    expect(three).toContain('ach_three_calling_wins')
    expect(three).not.toContain('ach_nine_calling_wins')

    const all = evaluateAchievements(
      input({
        byCalling: Object.fromEntries(
          Array.from({ length: 9 }, (_, i) => [`h${i}`, { victories: 1 }])
        ),
      })
    )
    expect(all).toContain('ach_nine_calling_wins')
  })

  it('the full ledger needs every mythic', () => {
    expect(evaluateAchievements(input({ mythicsSeen: 16 }))).not.toContain('ach_all_mythics')
    expect(evaluateAchievements(input({ mythicsSeen: 17 }))).toContain('ach_all_mythics')
  })

  it('is idempotent', () => {
    const i = input({ runsCompleted: 30, victories: 12, mythicsSeen: 17, callingsUnlocked: 9, history: [run({ result: 'victory', losses: 0 })] })
    expect(evaluateAchievements(i)).toEqual(evaluateAchievements(i))
  })
})
