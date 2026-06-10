import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import { chooseAiAction } from '../game/ai/heuristicAI'
import type { AiProfile, GameState, PlayerId } from '../game/types'
import { HERO_TARGET } from '../game/types'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

beforeEach(() => {
  installFixtures()
})

const aggro: AiProfile = { name: 'aggro', aggression: 0.9, heroPowerEagerness: 0.8 }
const control: AiProfile = { name: 'control', aggression: 0.2, heroPowerEagerness: 0.3 }

function start(deck0: string[], deck1: string[], seed = 1, ai0 = false, ai1 = false): GameState {
  const setup = makeSetup(padDeck(deck0), padDeck(deck1), { isAI0: ai0, isAI1: ai1 })
  return applyAction(createInitialState(setup, seed), { type: 'startGame', seed, setup }).state
}

describe('AI single decisions', () => {
  it('plays an affordable card rather than ending the turn', () => {
    const state = start([], [])
    setMana(state, 0, 10)
    giveCard(state, 0, 'wisp')
    const action = chooseAiAction(state, 0, aggro)
    expect(action.type).toBe('playCard')
  })

  it('ends the turn when nothing is affordable / available', () => {
    // Empty hand by mulligan-less start with deck of only expensive cards beyond mana.
    const state = start([], [])
    // Player 0 turn 1 with whatever opening hand; if nothing affordable, ends.
    // Force the situation: clear-ish hand of high-cost cards. Use a control profile
    // so it doesn't proactively hero-power.
    // Build a state where hand has only a 7-cost minion at 1 mana.
    const s2 = start(['warchief'], [])
    // Remove the rest of the hand to leave only an unaffordable card.
    s2.players[0].hand = s2.players[0].hand.filter((c) => c.cardId === 'warchief')
    s2.players[0].heroPower.usedThisTurn = true // suppress hero power
    const action = chooseAiAction(s2, 0, control)
    expect(action.type).toBe('endTurn')
  })

  it('takes lethal by attacking the enemy hero', () => {
    let state = start([], [])
    setMana(state, 0, 10)
    const id = giveCard(state, 0, 'charger') // 3/2 charge
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: id }).state
    // Set enemy hero low so the 3-attack charger is lethal.
    state.players[1].hero.health = 2
    state.players[1].hero.armor = 0
    const action = chooseAiAction(state, 0, control)
    expect(action.type).toBe('attack')
    if (action.type === 'attack') {
      expect(action.targetId).toBe(HERO_TARGET(1))
    }
  })

  it('resolves a pending discover choice', () => {
    let state = start([], [])
    setMana(state, 0, 10)
    // Deterministically put a discover spell in hand (don't rely on the shuffle).
    const id = giveCard(state, 0, 'discover_spell')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: id }).state
    expect(state.pendingChoice).toBeDefined()
    const action = chooseAiAction(state, 0, aggro)
    expect(action.type).toBe('resolveChoice')
  })
})

describe('AI vs AI full game', () => {
  it('reaches gameOver without throwing', () => {
    const deck = ['wisp', 'raptor', 'yeti', 'charger', 'taunt_bear', 'bolt', 'leper', 'shield_bot']
    let state = start(deck, deck, 1234, true, true)
    const profiles: Record<PlayerId, AiProfile> = { 0: aggro, 1: control }

    let guard = 0
    while (state.phase !== 'gameOver' && guard++ < 5000) {
      const active = state.activePlayer
      const action = chooseAiAction(state, active, profiles[active])
      state = applyAction(state, action).state
      // Safety: if AI returns endTurn, the active player should switch (or game over).
    }
    expect(state.phase).toBe('gameOver')
    expect(guard).toBeLessThan(5000)
  })

  it('two aggressive AIs finish a game', () => {
    const deck = ['charger', 'raptor', 'bolt', 'wisp', 'yeti', 'leper']
    let state = start(deck, deck, 99, true, true)
    let guard = 0
    while (state.phase !== 'gameOver' && guard++ < 5000) {
      const active = state.activePlayer
      const action = chooseAiAction(state, active, aggro)
      state = applyAction(state, action).state
    }
    expect(state.phase).toBe('gameOver')
  })
})
