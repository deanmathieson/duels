import { beforeEach, describe, expect, it } from 'vitest'
import type { GameState } from '../game/types'
import { HERO_TARGET } from '../game/types'
import { applyAction, createInitialState } from '../game/index'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

/** Engine tests for the build-around treasure auras. */

beforeEach(() => {
  installFixtures()
})

function startGame(opts: Parameters<typeof makeSetup>[2] = {}): GameState {
  const setup = makeSetup(padDeck([]), padDeck([]), opts)
  let state = createInitialState(setup, 23)
  state = applyAction(state, {
    type: 'mulligan',
    player: 0,
    keepInstanceIds: state.players[0].hand.map((c) => c.instanceId),
  }).state
  setMana(state, 0, 10)
  return state
}

function play(state: GameState, cardId: string, targetId?: string): GameState {
  const instanceId = giveCard(state, 0, cardId)
  const next = applyAction(state, { type: 'playCard', player: 0, instanceId, targetId }).state
  next.players[0].mana.current = 10
  return next
}

describe('battlecry doubling (triggerTwice)', () => {
  it('an untargeted battlecry fires twice', () => {
    let state = startGame({ passives0: ['tr_fix_bc_double'] })
    const handBefore = state.players[0].hand.length
    // mana_minion battlecry: gain a mana crystal — observable via mana.max.
    const manaBefore = state.players[0].mana.max
    state = play(state, 'mana_minion')
    expect(state.players[0].mana.max).toBe(Math.min(10, manaBefore + 2))
    expect(state.players[0].hand.length).toBe(handBefore)
  })

  it('a targeted battlecry reuses the same target', () => {
    let state = startGame({ passives0: ['tr_fix_bc_double'] })
    state = play(state, 'archer', HERO_TARGET(1)) // battlecry: deal 1
    expect(state.players[1].hero.health).toBe(28)
  })

  it('fires once without the doubler', () => {
    let state = startGame()
    state = play(state, 'archer', HERO_TARGET(1))
    expect(state.players[1].hero.health).toBe(29)
  })

  it('a discover battlecry pauses instead of doubling', () => {
    let state = startGame({ passives0: ['tr_fix_bc_double'] })
    state = play(state, 'discover_bc')
    expect(state.pendingChoice).toBeTruthy()
    const handBefore = state.players[0].hand.length
    const pickId = state.pendingChoice!.options[0]!.cardId
    state = applyAction(state, {
      type: 'resolveChoice',
      player: 0,
      pick: { cardId: pickId },
    }).state
    // Exactly one discover resolved — one card added, no second pending choice.
    expect(state.players[0].hand.length).toBe(handBefore + 1)
    expect(state.pendingChoice).toBeFalsy()
  })
})

describe('firstSpellEachTurnTwice', () => {
  it('doubles only the first spell each turn', () => {
    let state = startGame({ passives0: ['tr_fix_echo'] })
    state = play(state, 'bolt', HERO_TARGET(1)) // 3 dmg, cast twice -> 6
    expect(state.players[1].hero.health).toBe(24)
    state = play(state, 'bolt', HERO_TARGET(1)) // second spell -> once
    expect(state.players[1].hero.health).toBe(21)
  })

  it('resets at the start of the owner turn', () => {
    let state = startGame({ passives0: ['tr_fix_echo'] })
    state = play(state, 'bolt', HERO_TARGET(1))
    expect(state.players[1].hero.health).toBe(24)
    // Pass to the AI-less opponent and back.
    state = applyAction(state, { type: 'endTurn', player: 0 }).state
    state = applyAction(state, { type: 'endTurn', player: 1 }).state
    setMana(state, 0, 10)
    state = play(state, 'bolt', HERO_TARGET(1))
    expect(state.players[1].hero.health).toBe(18)
  })

  it('does not double without the aura', () => {
    let state = startGame()
    state = play(state, 'bolt', HERO_TARGET(1))
    expect(state.players[1].hero.health).toBe(27)
  })
})

describe('costLte2 stat aura (swarm banner)', () => {
  it('buffs cheap minions only', () => {
    let state = startGame({ passives0: ['tr_fix_swarm'] })
    state = play(state, 'wisp') // 1/1, cost 0
    state = play(state, 'yeti') // 4/5, cost 4
    const wisp = state.players[0].board.find((m) => m.cardId === 'wisp')!
    const yeti = state.players[0].board.find((m) => m.cardId === 'yeti')!
    expect([wisp.attack, wisp.health]).toEqual([2, 2])
    expect([yeti.attack, yeti.health]).toEqual([4, 5])
  })
})
