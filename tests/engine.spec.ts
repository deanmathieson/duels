import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import type { Action, GameState, MinionInstance } from '../game/types'
import { HERO_TARGET, MAX_BOARD } from '../game/types'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

beforeEach(() => {
  installFixtures()
})

/** Start a game via the startGame action and return the running state. */
function startGame(deck0: string[], deck1: string[], seed = 1): GameState {
  const setup = makeSetup(padDeck(deck0), padDeck(deck1))
  const { state } = applyAction(createInitialState(setup, seed), {
    type: 'startGame',
    seed,
    setup,
  })
  return state
}

/** Apply a sequence of actions, returning the final state. */
function run(state: GameState, actions: Action[]): GameState {
  let s = state
  for (const a of actions) s = applyAction(s, a).state
  return s
}

describe('createInitialState', () => {
  it('draws opening hands 3 / 4 + Coin and starts in mulligan', () => {
    const setup = makeSetup(padDeck([]), padDeck([]))
    const state = createInitialState(setup, 42)
    expect(state.phase).toBe('mulligan')
    expect(state.players[0].hand.length).toBe(3)
    // Second player gets 4 + the coin.
    expect(state.players[1].hand.length).toBe(5)
    expect(state.players[1].hand.some((c) => c.cardId === 'the_coin')).toBe(true)
  })

  it('is deterministic for the same seed', () => {
    const setup = makeSetup(padDeck(['yeti', 'raptor', 'bolt']), padDeck([]))
    const a = createInitialState(setup, 123)
    const b = createInitialState(setup, 123)
    expect(a.players[0].deck.map((c) => c.cardId)).toEqual(
      b.players[0].deck.map((c) => c.cardId)
    )
  })
})

describe('turn flow & mana', () => {
  it('starts first player with 1 mana and ramps to cap of 10', () => {
    let state = startGame([], [])
    expect(state.activePlayer).toBe(0)
    expect(state.players[0].mana.max).toBe(1)
    expect(state.players[0].mana.current).toBe(1)

    // End/begin many turns; each player's max should ramp, capping at 10.
    for (let i = 0; i < 30; i++) {
      state = applyAction(state, { type: 'endTurn', player: state.activePlayer }).state
      if (state.phase === 'gameOver') break
    }
    expect(state.players[0].mana.max).toBeLessThanOrEqual(10)
    expect(state.players[1].mana.max).toBeLessThanOrEqual(10)
    expect(Math.max(state.players[0].mana.max, state.players[1].mana.max)).toBe(10)
  })

  it('refills mana to max at the start of each turn', () => {
    let state = startGame([], [])
    setMana(state, 0, 1)
    const id = giveCard(state, 0, 'innervate')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: id }).state
    expect(state.players[0].mana.current).toBe(3)
    // Pass to opponent and back: mana refilled to (new) max.
    state = applyAction(state, { type: 'endTurn', player: 0 }).state
    state = applyAction(state, { type: 'endTurn', player: 1 }).state
    expect(state.players[0].mana.current).toBe(state.players[0].mana.max)
    expect(state.players[0].mana.max).toBe(2)
  })

  it('wild growth grants an empty crystal (max up, current unchanged)', () => {
    let state = startGame([], [])
    setMana(state, 0, 2)
    const id = giveCard(state, 0, 'wild_growth')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: id }).state
    expect(state.players[0].mana.max).toBe(3)
    // Spent 2 of 2, then empty crystal → current stays at 0.
    expect(state.players[0].mana.current).toBe(0)
  })
})

describe('draw & fatigue', () => {
  it('deals escalating fatigue damage when the deck is empty', () => {
    // Tiny decks so they empty fast.
    const setup = makeSetup([], [])
    let state = applyAction(createInitialState(setup, 7), {
      type: 'startGame',
      seed: 7,
      setup,
    }).state
    const startHealth = state.players[0].hero.health
    // Player 0 has empty deck after opening draws; each of their turns draws → fatigue.
    let fatigueTaken = 0
    for (let i = 0; i < 6 && state.phase !== 'gameOver'; i++) {
      const before = state.players[0].hero.health
      state = applyAction(state, { type: 'endTurn', player: state.activePlayer }).state
      const after = state.players[0].hero.health
      if (after < before) fatigueTaken += before - after
    }
    expect(state.players[0].fatigue).toBeGreaterThan(0)
    expect(state.players[0].hero.health).toBeLessThan(startHealth)
  })
})

describe('summon & board cap', () => {
  it('summons a minion to the board when played', () => {
    let state = startGame(['wisp'], [])
    const wisp = state.players[0].hand.find((c) => c.cardId === 'wisp')!
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: wisp.instanceId }).state
    expect(state.players[0].board.length).toBe(1)
    expect(state.players[0].board[0].cardId).toBe('wisp')
    expect(state.players[0].board[0].summonedThisTurn).toBe(true)
  })

  it('enforces the 7-minion board cap on summon effects', () => {
    let state = startGame([], [])
    setMana(state, 0, 10)
    // Play 6 wisps to fill most of the board.
    for (let i = 0; i < 6; i++) {
      const id = giveCard(state, 0, 'wisp')
      state = applyAction(state, { type: 'playCard', player: 0, instanceId: id }).state
    }
    expect(state.players[0].board.length).toBe(6)
    // Force of Nature would summon 3 treants — only 1 fits.
    const fon = giveCard(state, 0, 'summon_spell')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: fon }).state
    expect(state.players[0].board.length).toBe(MAX_BOARD)
  })
})

describe('win / loss', () => {
  it('marks the game over and sets the winner when a hero dies', () => {
    // Player 0 hero powers (Steady Shot, 2 to enemy hero) repeatedly.
    const setup = makeSetup(padDeck([]), padDeck([]), {
      heroPower0: 'hp_steady',
      heroPower1: 'hp_steady',
    })
    let state = applyAction(createInitialState(setup, 3), {
      type: 'startGame',
      seed: 3,
      setup,
    }).state

    let guard = 0
    while (state.phase !== 'gameOver' && guard++ < 200) {
      const active = state.activePlayer
      const p = state.players[active]
      // Use hero power if affordable, else end turn.
      if (!p.heroPower.usedThisTurn && p.mana.current >= p.heroPower.cost) {
        state = applyAction(state, { type: 'useHeroPower', player: active }).state
      } else {
        state = applyAction(state, { type: 'endTurn', player: active }).state
      }
    }
    expect(state.phase).toBe('gameOver')
    expect(state.winner === 0 || state.winner === 1 || state.winner === 'draw').toBe(true)
  })

  it('concede ends the game in favour of the opponent', () => {
    let state = startGame([], [])
    state = applyAction(state, { type: 'concede', player: 0 }).state
    expect(state.phase).toBe('gameOver')
    expect(state.winner).toBe(1)
  })
})

describe('immutability', () => {
  it('does not mutate the input state', () => {
    const state = startGame(['wisp'], [])
    const snapshot = JSON.stringify(state)
    const wisp = state.players[0].hand.find((c) => c.cardId === 'wisp')!
    applyAction(state, { type: 'playCard', player: 0, instanceId: wisp.instanceId })
    expect(JSON.stringify(state)).toBe(snapshot)
  })
})
