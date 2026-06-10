import { beforeAll, describe, expect, it } from 'vitest'
import type { GameSetup, GameState, HeroState, PlayerId, PlayerSetup } from '../game/types'
import { applyAction, chooseAiAction, createInitialState, getCard, hasCard, hasHeroPower } from '../game/index'
import {
  buckets,
  collectibleCardIds,
  enemies,
  getEnemyDef,
  getHeroDef,
  getTreasureDef,
  initializeContent,
  passiveTreasures,
} from '../data/registry'
import { aiProfileFor } from '../game/ai/heuristicAI'

beforeAll(() => {
  initializeContent()
})

/** Build a HeroState helper. */
function hero(name: string, cardClass: HeroState['cardClass'], health = 30): HeroState {
  return { name, cardClass, health, maxHealth: health, armor: 0, attack: 0, attacksThisTurn: 0 }
}

describe('content integrity', () => {
  it('every bucket references real cards', () => {
    for (const b of buckets) {
      for (const id of b.cardIds) {
        expect(hasCard(id), `bucket ${b.id} -> ${id}`).toBe(true)
      }
    }
  })

  it('every enemy deck + hero power + passive resolves', () => {
    for (const e of enemies) {
      expect(hasHeroPower(e.heroPowerId), `enemy ${e.id} hp`).toBe(true)
      for (const id of e.deck) expect(hasCard(id), `enemy ${e.id} -> ${id}`).toBe(true)
      for (const tid of e.passiveTreasureIds ?? []) {
        expect(() => getTreasureDef(tid)).not.toThrow()
      }
    }
  })

  it('Forest Warden Omu hero powers and signature treasures resolve to playable cards', () => {
    const omu = getHeroDef('forest_warden_omu')
    for (const hp of omu.heroPowers) expect(hasHeroPower(hp)).toBe(true)
    for (const sig of omu.signatureTreasures) {
      const t = getTreasureDef(sig)
      expect(t.card, `${sig} has a card`).toBeTruthy()
      expect(hasCard(t.card!.id)).toBe(true)
    }
  })

  it('passive treasure auras/triggers are well-formed', () => {
    for (const t of passiveTreasures) {
      const hasEffect = t.auras?.length || t.triggers?.length || t.startOfGame?.length
      expect(hasEffect, `${t.id} does something`).toBeTruthy()
    }
  })

  it('has at least 30 collectible cards for deck building', () => {
    expect(collectibleCardIds.length).toBeGreaterThanOrEqual(30)
    for (const id of collectibleCardIds) expect(hasCard(id)).toBe(true)
  })
})

describe('end-to-end AI vs AI', () => {
  it('plays a full game with the real Druid deck vs an enemy and reaches gameOver', () => {
    // Player: Omu signature + 15 collectible cards.
    const sig = getTreasureDef('sig_wardens_insight').card!.id
    const deck = [sig, ...collectibleCardIds.slice(0, 15)]
    const playerSetup: PlayerSetup = {
      hero: hero('Forest Warden Omu', 'druid'),
      heroPowerId: 'hp_natures_gifts',
      deckCardIds: deck,
      passiveTreasureIds: ['tr_robe_of_the_magi'],
      isAI: true,
    }
    const enemy = getEnemyDef('enemy_aggro_hunter')
    const enemySetup: PlayerSetup = {
      hero: hero(enemy.heroName, enemy.heroClass, enemy.startingHealth ?? 30),
      heroPowerId: enemy.heroPowerId,
      deckCardIds: [...enemy.deck],
      passiveTreasureIds: enemy.passiveTreasureIds ?? [],
      isAI: true,
    }
    const setup: GameSetup = { players: [playerSetup, enemySetup], firstPlayer: 0 }

    let state: GameState = createInitialState(setup, 12345)
    ;({ state } = applyAction(state, { type: 'startGame', seed: 12345, setup }))
    expect(state.phase).toBe('main')

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

    expect(state.phase, 'game terminated within guard').toBe('gameOver')
    expect(state.winner === 0 || state.winner === 1 || state.winner === 'draw').toBe(true)
  })
})
