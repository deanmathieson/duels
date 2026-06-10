import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { GameSetup, GameState, HeroState, PlayerId, PlayerSetup } from '../game/types'
import { RUN_TARGET_WINS } from '../game/types'
import { applyAction, chooseAiAction, createInitialState } from '../game/index'
import { collectibleCardIds, enemies, initializeContent } from '../data/registry'
import { aiProfileFor } from '../game/ai/heuristicAI'
import { useRunStore } from '../stores/run'

beforeAll(() => {
  initializeContent()
})

function hero(name: string, cardClass: HeroState['cardClass'], health = 30): HeroState {
  return { name, cardClass, health, maxHealth: health, armor: 0, attack: 0, attacksThisTurn: 0 }
}

describe('enemy roster smoke (AI vs AI over every enemy)', () => {
  // Catches AI-bricking cards in any enemy deck: each fight must terminate.
  for (const enemy of enemies) {
    it(`${enemy.id} reaches gameOver`, () => {
      const playerSetup: PlayerSetup = {
        hero: hero('Smoke Tester', 'druid'),
        heroPowerId: 'hp_natures_gifts',
        deckCardIds: collectibleCardIds.slice(0, 15),
        passiveTreasureIds: [],
        isAI: true,
      }
      const enemySetup: PlayerSetup = {
        hero: hero(enemy.heroName, enemy.heroClass, enemy.startingHealth ?? 30),
        heroPowerId: enemy.heroPowerId,
        deckCardIds: [...enemy.deck],
        passiveTreasureIds: enemy.passiveTreasureIds ?? [],
        isAI: true,
      }
      const setup: GameSetup = { players: [playerSetup, enemySetup], firstPlayer: 0 }

      let state: GameState = createInitialState(setup, 777)
      ;({ state } = applyAction(state, { type: 'startGame', seed: 777, setup }))

      const profiles = [aiProfileFor('midrange'), aiProfileFor(enemy.aiProfile)]
      let guard = 0
      while (state.phase !== 'gameOver' && guard < 2000) {
        guard++
        if (state.pendingChoice) {
          const pick = state.pendingChoice.options[0] ?? {}
          ;({ state } = applyAction(state, {
            type: 'resolveChoice',
            player: state.pendingChoice.player,
            pick: { cardId: pick.cardId, index: pick.index },
          }))
          continue
        }
        const active = state.activePlayer as PlayerId
        const action = chooseAiAction(state, active, profiles[active])
        ;({ state } = applyAction(state, action))
      }
      expect(state.phase, `enemy ${enemy.id} game terminated`).toBe('gameOver')
    })
  }
})

describe('enemy lineup', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function lineupForSeed(s: number): string[] {
    const run = useRunStore()
    run.seed = s
    return run.enemyLineup().map((e) => e.id)
  }

  it('is deterministic for a given seed', () => {
    expect(lineupForSeed(12345)).toEqual(lineupForSeed(12345))
  })

  it('differs across seeds (probabilistic, fixed seeds)', () => {
    const a = lineupForSeed(11111)
    const b = lineupForSeed(99999)
    expect(a).not.toEqual(b)
  })

  it('has the right band structure', () => {
    const run = useRunStore()
    run.seed = 424242
    const lineup = run.enemyLineup()
    expect(lineup).toHaveLength(RUN_TARGET_WINS)
    // Fights 1-8: regular tiers ascending in pairs.
    expect(lineup[0].tier).toBe(1)
    expect(lineup[1].tier).toBe(1)
    expect(lineup[2].tier).toBe(2)
    expect(lineup[3].tier).toBe(2)
    expect(lineup[4].tier).toBe(3)
    expect(lineup[5].tier).toBe(3)
    expect(lineup[6].tier).toBe(4)
    expect(lineup[7].tier).toBe(4)
    // Fights 9-11: elites.
    expect(lineup[8].elite).toBe(true)
    expect(lineup[9].elite).toBe(true)
    expect(lineup[10].elite).toBe(true)
    // Fight 12: the boss.
    expect(lineup[11].isBoss).toBe(true)
  })

  it('never repeats an enemy within a run', () => {
    const ids = lineupForSeed(31337)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
