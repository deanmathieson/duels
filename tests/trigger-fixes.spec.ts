import { beforeEach, describe, expect, it } from 'vitest'
import type { GameState } from '../game/types'
import { HERO_TARGET } from '../game/types'
import { applyAction, createInitialState } from '../game/index'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

/**
 * Regression tests for the trigger plumbing fixes:
 *  1. Death triggers with conditions receive the dead card's id (Hyena pattern).
 *  2. Passive play-triggers can target the played minion via 'triggerSource'.
 *  3. afterAttack / onHeroPowerUsed fire for passive treasures.
 *  4. afterAttack trigger damage is followed by a death check (no corpses).
 */

beforeEach(() => {
  installFixtures()
})

function startGame(opts: Parameters<typeof makeSetup>[2] = {}): GameState {
  const setup = makeSetup(padDeck([]), padDeck([]), opts)
  let state = createInitialState(setup, 7)
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
  return applyAction(state, { type: 'playCard', player: 0, instanceId, targetId }).state
}

describe('conditional death triggers', () => {
  it('buffs the hyena when a friendly Beast dies', () => {
    let state = startGame()
    state = play(state, 'hyena_fix')
    state = play(state, 'raptor') // 3/2 beast
    const raptor = state.players[0].board.find((m) => m.cardId === 'raptor')!
    state = play(state, 'bolt', raptor.instanceId) // 3 damage kills it

    const hyena = state.players[0].board.find((m) => m.cardId === 'hyena_fix')!
    expect(hyena.attack).toBe(4)
    expect(hyena.health).toBe(3)
  })

  it('does not buff the hyena when a non-Beast dies', () => {
    let state = startGame()
    state = play(state, 'hyena_fix')
    state = play(state, 'wisp')
    const wisp = state.players[0].board.find((m) => m.cardId === 'wisp')!
    state = play(state, 'bolt', wisp.instanceId)

    const hyena = state.players[0].board.find((m) => m.cardId === 'hyena_fix')!
    expect(hyena.attack).toBe(2)
    expect(hyena.health).toBe(2)
  })
})

describe('passive play triggers', () => {
  it('targets the played minion via triggerSource (Illumination pattern)', () => {
    let state = startGame({ passives0: ['tr_fix_illumination'] })
    state = play(state, 'yeti')
    const yeti = state.players[0].board.find((m) => m.cardId === 'yeti')!
    expect(yeti.divineShield).toBe(true)
  })
})

describe('passive afterAttack / onHeroPowerUsed triggers', () => {
  it('fires passive afterAttack when the hero attacks', () => {
    let state = startGame({ passives0: ['tr_fix_battle_focus'] })
    state.players[0].hero.attack = 1
    const handBefore = state.players[0].hand.length
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: HERO_TARGET(0),
      targetId: HERO_TARGET(1),
    }).state
    expect(state.players[0].hand.length).toBe(handBefore + 1)
  })

  it('fires passive onHeroPowerUsed', () => {
    let state = startGame({ passives0: ['tr_fix_inspire'], heroPower0: 'hp_steady' })
    const handBefore = state.players[0].hand.length
    state = applyAction(state, { type: 'useHeroPower', player: 0 }).state
    expect(state.players[0].hand.length).toBe(handBefore + 1)
  })
})

describe('afterAttack death check', () => {
  it('removes minions killed by afterAttack weapon splash', () => {
    let state = startGame()
    // Enemy has a 1-health wisp on board.
    const wisp = giveCard(state, 1, 'wisp')
    state.players[1].mana.current = 10
    state.players[1].mana.max = 10
    state.activePlayer = 1
    state = applyAction(state, { type: 'playCard', player: 1, instanceId: wisp }).state
    state.activePlayer = 0

    // Equip the whirl axe and attack the enemy hero — splash kills the wisp.
    state = play(state, 'whirl_axe')
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: HERO_TARGET(0),
      targetId: HERO_TARGET(1),
    }).state

    expect(state.players[1].board.length).toBe(0)
  })
})
