import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import { registerCards, getCard } from '../game/cardDb'
import { makeMinion } from '../game/effects'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'
import type { CardDef, GameState } from '../game/types'
import { HERO_TARGET } from '../game/types'

/** A vanilla 3/2 weapon. */
const TEST_AXE: CardDef = {
  id: 'test_axe',
  name: 'Test Axe',
  cost: 1,
  type: 'weapon',
  cardClass: 'neutral',
  rarity: 'common',
  text: '',
  attack: 3,
  durability: 2,
  token: true,
}

/** A 2/3 weapon whose Battlecry gives friendly minions Divine Shield (Coghammer-style). */
const TEST_COGHAMMER: CardDef = {
  id: 'test_coghammer',
  name: 'Test Coghammer',
  cost: 2,
  type: 'weapon',
  cardClass: 'neutral',
  rarity: 'rare',
  text: 'Battlecry: Give your minions Divine Shield.',
  attack: 2,
  durability: 3,
  battlecry: [{ kind: 'giveDivineShield', target: 'friendlyMinions' }],
  token: true,
}

/** Herding Horn — Forest Warden Omu's beast-copy weapon. */
const HERDING_HORN: CardDef = {
  id: 'test_herding_horn',
  name: 'Herding Horn',
  cost: 3,
  type: 'weapon',
  cardClass: 'druid',
  rarity: 'legendary',
  text: 'After you play a Beast, summon a copy of it.',
  attack: 0,
  durability: 3,
  triggers: [{ event: 'onPlayBeast', scriptId: 'herdingHornCopy', condition: 'cardIsBeast' }],
  token: true,
}

function startGame(): GameState {
  const setup = makeSetup(padDeck([]), padDeck([]))
  const { state } = applyAction(createInitialState(setup, 99), { type: 'startGame', seed: 99, setup })
  return state
}

describe('Herding Horn — equipped-weapon trigger fires', () => {
  beforeEach(() => {
    installFixtures()
    registerCards([HERDING_HORN])
  })

  it('summons a copy when a Beast is played while the weapon is equipped', () => {
    let state = startGame()
    setMana(state, 0, 10)

    const hornId = giveCard(state, 0, 'test_herding_horn')
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: hornId }))
    expect(state.players[0].weapon?.cardId).toBe('test_herding_horn')

    const raptorId = giveCard(state, 0, 'raptor') // 3/2 Beast
    const before = state.players[0].board.length
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: raptorId }))

    // The played beast PLUS a summoned copy => two raptors on board.
    expect(state.players[0].board.length).toBe(before + 2)
    expect(state.players[0].board.filter((m) => m.cardId === 'raptor').length).toBe(2)
    // Weapon lost 1 durability (3 -> 2).
    expect(state.players[0].weapon?.durability).toBe(2)
  })

  it('does not copy a non-Beast minion', () => {
    let state = startGame()
    setMana(state, 0, 10)

    const hornId = giveCard(state, 0, 'test_herding_horn')
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: hornId }))

    const wispId = giveCard(state, 0, 'wisp') // not a Beast
    const before = state.players[0].board.length
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: wispId }))

    expect(state.players[0].board.length).toBe(before + 1)
    expect(state.players[0].weapon?.durability).toBe(3)
  })
})

describe('Hero weapon attacks', () => {
  beforeEach(() => {
    installFixtures()
    registerCards([TEST_AXE, TEST_COGHAMMER])
  })

  it('equipping a weapon grants the hero Attack and lets it hit face, spending durability', () => {
    let state = startGame()
    setMana(state, 0, 10)
    const axeId = giveCard(state, 0, 'test_axe')
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: axeId }))
    expect(state.players[0].hero.attack).toBe(3)
    expect(state.players[0].weapon?.durability).toBe(2)

    const enemyHp = state.players[1].hero.health
    ;({ state } = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: HERO_TARGET(0),
      targetId: HERO_TARGET(1),
    }))
    expect(state.players[1].hero.health).toBe(enemyHp - 3)
    expect(state.players[0].weapon?.durability).toBe(1)
    expect(state.players[0].hero.attacksThisTurn).toBe(1)

    // Cannot attack a second time the same turn.
    ;({ state } = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: HERO_TARGET(0),
      targetId: HERO_TARGET(1),
    }))
    expect(state.players[1].hero.health).toBe(enemyHp - 3)
  })

  it('a weapon is destroyed at 0 durability and the hero loses its Attack', () => {
    let state = startGame()
    setMana(state, 0, 10)
    const axeId = giveCard(state, 0, 'test_axe') // 3/2
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: axeId }))
    ;({ state } = applyAction(state, { type: 'attack', player: 0, attackerId: HERO_TARGET(0), targetId: HERO_TARGET(1) }))
    // Pass back to player 0 (both sides are non-AI in fixtures).
    ;({ state } = applyAction(state, { type: 'endTurn', player: 0 }))
    ;({ state } = applyAction(state, { type: 'endTurn', player: 1 }))
    expect(state.players[0].hero.attacksThisTurn).toBe(0)
    expect(state.players[0].weapon?.durability).toBe(1)
    ;({ state } = applyAction(state, { type: 'attack', player: 0, attackerId: HERO_TARGET(0), targetId: HERO_TARGET(1) }))
    expect(state.players[0].weapon).toBeUndefined()
    expect(state.players[0].hero.attack).toBe(0)
  })

  it('runs a weapon Battlecry on equip (Coghammer Divine Shield)', () => {
    let state = startGame()
    setMana(state, 0, 10)
    const raptorId = giveCard(state, 0, 'raptor')
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: raptorId }))
    expect(state.players[0].board[0].divineShield).toBe(false)

    const cogId = giveCard(state, 0, 'test_coghammer')
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: cogId }))
    expect(state.players[0].weapon?.cardId).toBe('test_coghammer')
    expect(state.players[0].board[0].divineShield).toBe(true)
  })

  it('hero attacking a minion takes retaliation damage', () => {
    let state = startGame()
    setMana(state, 0, 10)
    const axeId = giveCard(state, 0, 'test_axe') // hero becomes 3-attack
    ;({ state } = applyAction(state, { type: 'playCard', player: 0, instanceId: axeId }))
    // Put an enemy 3/2 on the board to be attacked.
    state.players[1].board.push(makeMinion(getCard('raptor')))
    const targetId = state.players[1].board[0].instanceId
    const heroHp = state.players[0].hero.health
    ;({ state } = applyAction(state, { type: 'attack', player: 0, attackerId: HERO_TARGET(0), targetId }))
    expect(state.players[1].board.length).toBe(0) // raptor (2 health) destroyed by 3 damage
    expect(state.players[0].hero.health).toBe(heroHp - 3) // 3-attack raptor strikes back
    expect(state.players[0].weapon?.durability).toBe(1)
  })
})
