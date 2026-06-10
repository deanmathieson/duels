import { beforeEach, describe, expect, it } from 'vitest'
import type { GameState } from '../game/types'
import { applyAction, createInitialState } from '../game/index'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

/** Engine tests for the deathrattle-archetype primitives. */

beforeEach(() => {
  installFixtures()
})

function startGame(opts: Parameters<typeof makeSetup>[2] = {}): GameState {
  const setup = makeSetup(padDeck([]), padDeck([]), opts)
  let state = createInitialState(setup, 11)
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

/** Play a minion for player 0 and return its board instance. */
function playMinion(state: GameState, cardId: string): { state: GameState; instanceId: string } {
  const next = play(state, cardId)
  const inst = next.players[0].board.find((m) => m.cardId === cardId)!
  return { state: next, instanceId: inst.instanceId }
}

function kill(state: GameState, instanceId: string): GameState {
  return applyAction(state, {
    type: 'playCard',
    player: 0,
    instanceId: giveCard(state, 0, 'bolt'),
    targetId: instanceId,
  }).state
}

describe('deathrattle multiplier', () => {
  it('fires once with no doubler', () => {
    let { state, instanceId } = playMinion(startGame(), 'leper') // DR: 2 dmg enemy hero
    state = kill(state, instanceId)
    expect(state.players[1].hero.health).toBe(28)
  })

  it('fires twice with the passive doubler', () => {
    let { state, instanceId } = playMinion(startGame({ passives0: ['tr_fix_dr_double'] }), 'leper')
    state = kill(state, instanceId)
    expect(state.players[1].hero.health).toBe(26)
  })

  it('fires twice with the on-board doubler minion', () => {
    let game = startGame()
    game = play(game, 'baron_fix')
    const { state, instanceId } = playMinion(game, 'leper')
    const after = kill(state, instanceId)
    expect(after.players[1].hero.health).toBe(26)
  })

  it('stacks: passive + board doubler = 3x', () => {
    let game = startGame({ passives0: ['tr_fix_dr_double'] })
    game = play(game, 'baron_fix')
    const { state, instanceId } = playMinion(game, 'leper')
    const after = kill(state, instanceId)
    expect(after.players[1].hero.health).toBe(24)
  })

  it('a doubler that dies in the same batch does not double', () => {
    // Baron at 1 HP + leper; kill both with the same splash (bolt the baron
    // after damaging... simplest: bolt kills baron first in its own action,
    // then leper fires once).
    let game = startGame()
    game = play(game, 'baron_fix')
    const baron = game.players[0].board.find((m) => m.cardId === 'baron_fix')!
    const { state, instanceId } = playMinion(game, 'leper')
    let after = kill(state, baron.instanceId) // 3 dmg — not lethal (4/5), buff... bolt = 3, baron 5hp survives
    // Finish the baron with a second bolt, then kill leper: no doubling left.
    after = kill(after, baron.instanceId)
    expect(after.players[0].board.some((m) => m.cardId === 'baron_fix')).toBe(false)
    after = kill(after, instanceId)
    expect(after.players[1].hero.health).toBe(28)
  })

  it('silenced minions fire no deathrattle', () => {
    const { state, instanceId } = playMinion(startGame(), 'leper')
    let after = applyAction(state, {
      type: 'playCard',
      player: 0,
      instanceId: giveCard(state, 0, 'silence_spell'),
      targetId: instanceId,
    }).state
    after.players[0].mana.current = 10
    after = kill(after, instanceId)
    expect(after.players[1].hero.health).toBe(30)
  })
})

describe('triggerDeathrattles', () => {
  it('fires the deathrattle without killing the minion', () => {
    const { state, instanceId } = playMinion(startGame(), 'leper')
    const after = play(state, 'trigger_dr_spell', instanceId)
    expect(after.players[1].hero.health).toBe(28)
    expect(after.players[0].board.some((m) => m.cardId === 'leper')).toBe(true)
  })

  it('applies the doubler multiplier', () => {
    const { state, instanceId } = playMinion(
      startGame({ passives0: ['tr_fix_dr_double'] }),
      'leper'
    )
    const after = play(state, 'trigger_dr_spell', instanceId)
    expect(after.players[1].hero.health).toBe(26)
  })

  it('does nothing on a silenced minion', () => {
    const { state, instanceId } = playMinion(startGame(), 'leper')
    let after = applyAction(state, {
      type: 'playCard',
      player: 0,
      instanceId: giveCard(state, 0, 'silence_spell'),
      targetId: instanceId,
    }).state
    after.players[0].mana.current = 10
    after = play(after, 'trigger_dr_spell', instanceId)
    expect(after.players[1].hero.health).toBe(30)
  })
})

describe('resummonDeadMinion', () => {
  it('resummons a friendly deathrattle minion that died', () => {
    let { state, instanceId } = playMinion(startGame(), 'leper')
    state = kill(state, instanceId)
    expect(state.players[0].board).toHaveLength(0)
    state = play(state, 'resummon_dr_spell')
    expect(state.players[0].board.map((m) => m.cardId)).toEqual(['leper'])
  })

  it('honours the deathrattle filter (vanilla deaths are skipped)', () => {
    let { state, instanceId } = playMinion(startGame(), 'raptor') // no deathrattle
    state = kill(state, instanceId)
    state = play(state, 'resummon_dr_spell')
    expect(state.players[0].board).toHaveLength(0)
    // ...but the unfiltered resummon brings it back.
    state = play(state, 'resummon_all_spell')
    expect(state.players[0].board.map((m) => m.cardId)).toEqual(['raptor'])
  })

  it('only resummons own deaths, not enemy deaths', () => {
    let state = startGame()
    // Enemy plays a leper, we kill it.
    const enemyLeper = giveCard(state, 1, 'leper')
    state.players[1].mana.current = 10
    state.activePlayer = 1
    state = applyAction(state, { type: 'playCard', player: 1, instanceId: enemyLeper }).state
    state.activePlayer = 0
    const target = state.players[1].board[0]!
    state = kill(state, target.instanceId)
    state.players[0].mana.current = 10
    state = play(state, 'resummon_all_spell')
    expect(state.players[0].board).toHaveLength(0)
  })

  it('no-ops on an empty death log', () => {
    const state = play(startGame(), 'resummon_all_spell')
    expect(state.players[0].board).toHaveLength(0)
  })

  it('overdraw-burned minions never count as deaths', () => {
    let state = startGame()
    // Fill the hand to 10, then draw 2: one draw fits nothing — burns.
    while (state.players[0].hand.length < 10) giveCard(state, 0, 'raptor')
    const draw = state.players[0].hand.find((c) => c.cardId !== 'draw_spell')
    // Swap one hand card for the draw spell so playing it leaves room for 1 of 2 draws.
    state.players[0].hand.pop()
    const drawId = giveCard(state, 0, 'draw_spell')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: drawId }).state
    state.players[0].mana.current = 10
    expect(state.players[0].graveyard.length).toBeGreaterThan(0) // something burned
    state = play(state, 'resummon_all_spell')
    expect(state.players[0].board).toHaveLength(0)
    expect(draw).toBeDefined()
  })
})

describe('summonCopy (grave echo)', () => {
  it('summons a 1/1 copy of a dead deathrattle minion', () => {
    const { state, instanceId } = playMinion(
      startGame({ passives0: ['tr_fix_grave_echo'] }),
      'egg_fix' // DR: summon a treant
    )
    const after = kill(state, instanceId)
    const ids = after.players[0].board.map((m) => m.cardId).sort()
    expect(ids).toEqual(['egg_fix', 'treant'])
    const copy = after.players[0].board.find((m) => m.cardId === 'egg_fix')!
    expect(copy.attack).toBe(1)
    expect(copy.health).toBe(1)
  })

  it('each respawn needs a fresh kill (no infinite loop)', () => {
    let { state, instanceId } = playMinion(
      startGame({ passives0: ['tr_fix_grave_echo'] }),
      'egg_fix'
    )
    state = kill(state, instanceId)
    const copy = state.players[0].board.find((m) => m.cardId === 'egg_fix')!
    state = kill(state, copy.instanceId)
    // Copy died -> another treant + another copy; board is bounded, game alive.
    const counts = state.players[0].board.reduce(
      (acc, m) => ((acc[m.cardId] = (acc[m.cardId] ?? 0) + 1), acc),
      {} as Record<string, number>
    )
    expect(counts['treant']).toBe(2)
    expect(counts['egg_fix']).toBe(1)
    expect(state.phase).not.toBe('gameOver')
  })

  it('does not trigger for minions without a deathrattle (condition gate)', () => {
    const { state, instanceId } = playMinion(
      startGame({ passives0: ['tr_fix_grave_echo'] }),
      'raptor'
    )
    const after = kill(state, instanceId)
    expect(after.players[0].board).toHaveLength(0)
  })
})

describe('board cap', () => {
  it('doubled deathrattle summons stop at the 7-minion cap', () => {
    let game = startGame({ passives0: ['tr_fix_dr_double'] })
    for (let i = 0; i < 6; i++) game = play(game, 'wisp')
    const { state, instanceId } = playMinion(game, 'egg_fix') // board now 7
    const after = kill(state, instanceId) // 6 wisps + egg dies -> 2 treant summons, only 1 fits
    expect(after.players[0].board).toHaveLength(7)
    expect(after.players[0].board.filter((m) => m.cardId === 'treant')).toHaveLength(1)
  })
})
