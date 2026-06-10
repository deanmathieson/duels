import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import type { GameState, PlayerId } from '../game/types'
import { HERO_TARGET } from '../game/types'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

beforeEach(() => {
  installFixtures()
})

/** Start a running game; both players have 10 mana for deterministic plays. */
function start(seed = 9): GameState {
  const setup = makeSetup(padDeck([]), padDeck([]))
  const state = applyAction(createInitialState(setup, seed), { type: 'startGame', seed, setup }).state
  setMana(state, 0, 10)
  setMana(state, 1, 10)
  return state
}

/**
 * Play a minion from hand for `player` and return its instance id. Sets `player`
 * as the active player and refills their mana first so setup plays for either
 * side succeed regardless of whose turn it currently is (test convenience).
 */
function summon(
  state: GameState,
  player: PlayerId,
  cardId: string,
  chooseOneIndex?: number
): { state: GameState; id: string } {
  // Make the summoning side active and give it full mana for a guaranteed play.
  state.activePlayer = player
  setMana(state, player, 10)
  const before = new Set(state.players[player].board.map((m) => m.instanceId))
  const inst = giveCard(state, player, cardId)
  const next = applyAction(state, {
    type: 'playCard',
    player,
    instanceId: inst,
    chooseOneIndex,
  }).state
  const summoned = next.players[player].board.find((m) => !before.has(m.instanceId))!
  return { state: next, id: summoned.instanceId }
}

/** Pass turn from player to opponent and back so player's minions can attack. */
function passRoundTo(state: GameState, player: PlayerId): GameState {
  let s = state
  let guard = 0
  while ((s.activePlayer !== player || guard === 0) && s.phase !== 'gameOver' && guard < 6) {
    s = applyAction(s, { type: 'endTurn', player: s.activePlayer }).state
    guard++
    if (s.activePlayer === player && guard > 0) break
  }
  setMana(s, 0, 10)
  setMana(s, 1, 10)
  return s
}

describe('summoning sickness', () => {
  it('a freshly summoned minion cannot attack', () => {
    const { state, id } = summon(start(), 0, 'wisp')
    const attempt = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: id,
      targetId: HERO_TARGET(1),
    }).state
    expect(attempt.players[1].hero.health).toBe(30)
  })

  it('a minion can attack the turn after it is summoned', () => {
    let { state, id } = summon(start(), 0, 'wisp')
    state = passRoundTo(state, 0)
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: id,
      targetId: HERO_TARGET(1),
    }).state
    expect(state.players[1].hero.health).toBe(29)
  })
})

describe('charge & rush', () => {
  it('charge lets a minion attack the turn it is summoned (face allowed)', () => {
    const { state, id } = summon(start(), 0, 'charger')
    const after = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: id,
      targetId: HERO_TARGET(1),
    }).state
    expect(after.players[1].hero.health).toBe(27) // 3 charge damage
  })

  it('rush can hit a minion but not the hero on its summon turn', () => {
    // Give player 1 a target minion first.
    let state = start()
    const enemyWisp = summon(state, 1, 'wisp')
    state = enemyWisp.state
    // Summon a rusher for player 0 (still player 0's turn).
    const r = summon(state, 0, 'rusher')
    state = r.state
    // Face attack should be rejected.
    const faceAttempt = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: r.id,
      targetId: HERO_TARGET(1),
    }).state
    expect(faceAttempt.players[1].hero.health).toBe(30)
    // Minion attack allowed.
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: r.id,
      targetId: enemyWisp.id,
    }).state
    expect(state.players[1].board.some((m) => m.instanceId === enemyWisp.id)).toBe(false)
  })
})

describe('taunt enforcement', () => {
  it('forces attacks onto a taunt minion', () => {
    let state = start()
    // Player 1 has a taunt bear.
    const bear = summon(state, 1, 'taunt_bear')
    state = bear.state
    // Player 0 has a charger.
    const r = summon(state, 0, 'charger')
    state = r.state
    // Face attack rejected.
    const faceAttempt = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: r.id,
      targetId: HERO_TARGET(1),
    }).state
    expect(faceAttempt.players[1].hero.health).toBe(30)
    // Attacking the taunt is allowed.
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: r.id,
      targetId: bear.id,
    }).state
    expect(state.players[1].board.find((m) => m.instanceId === bear.id)!.health).toBe(1)
  })
})

describe('trades & divine shield', () => {
  it('simultaneous combat kills both when lethal', () => {
    let state = start()
    const enemy = summon(state, 1, 'raptor') // 3/2
    state = enemy.state
    const r = summon(state, 0, 'charger') // 3/2 charge
    state = r.state
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: r.id,
      targetId: enemy.id,
    }).state
    expect(state.players[0].board.some((m) => m.instanceId === r.id)).toBe(false)
    expect(state.players[1].board.some((m) => m.instanceId === enemy.id)).toBe(false)
  })

  it('divine shield absorbs combat damage (no health lost, shield popped)', () => {
    let state = start()
    const enemy = summon(state, 1, 'shield_bot') // 2/2 divine shield
    state = enemy.state
    const r = summon(state, 0, 'charger') // 3/2 charge
    state = r.state
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: r.id,
      targetId: enemy.id,
    }).state
    const bot = state.players[1].board.find((m) => m.instanceId === enemy.id)!
    expect(bot.divineShield).toBe(false)
    expect(bot.health).toBe(2)
    // Charger took 2 → dead.
    expect(state.players[0].board.some((m) => m.instanceId === r.id)).toBe(false)
  })
})

describe('poisonous', () => {
  it('a poisonous minion destroys any minion it damages', () => {
    let state = start()
    const yeti = summon(state, 1, 'yeti') // 4/5
    state = yeti.state
    // Summon poison snake for p0, then give it a turn so it can attack.
    const snake = summon(state, 0, 'poison_snake')
    state = snake.state
    state = passRoundTo(state, 0)
    // Re-summon the yeti reference still valid (ids stable across clone).
    state = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: snake.id,
      targetId: yeti.id,
    }).state
    expect(state.players[1].board.some((m) => m.instanceId === yeti.id)).toBe(false)
  })
})

describe('deathrattle', () => {
  it('fires deathrattle when a minion dies', () => {
    let state = start()
    const leper = summon(state, 0, 'leper')
    state = leper.state
    const enemyBefore = state.players[1].hero.health
    // Kill own leper with bolt (3 dmg).
    const bolt = giveCard(state, 0, 'bolt')
    state = applyAction(state, {
      type: 'playCard',
      player: 0,
      instanceId: bolt,
      targetId: leper.id,
    }).state
    expect(state.players[0].board.some((m) => m.instanceId === leper.id)).toBe(false)
    expect(state.players[1].hero.health).toBe(enemyBefore - 2)
  })

  it('deathrattles fire in play order', () => {
    // Two lepers die together → 4 total to enemy hero.
    let state = start()
    const l1 = summon(state, 0, 'leper')
    state = l1.state
    const l2 = summon(state, 0, 'leper')
    state = l2.state
    const enemyBefore = state.players[1].hero.health
    // AoE-ish: bolt one, then bolt the other.
    const b1 = giveCard(state, 0, 'bolt')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: b1, targetId: l1.id }).state
    const b2 = giveCard(state, 0, 'bolt')
    state = applyAction(state, { type: 'playCard', player: 0, instanceId: b2, targetId: l2.id }).state
    expect(state.players[1].hero.health).toBe(enemyBefore - 4)
  })
})

describe('windfury / maxAttacks', () => {
  it('a normal minion has maxAttacks of 1', () => {
    const { state, id } = summon(start(), 0, 'charger')
    expect(state.players[0].board.find((m) => m.instanceId === id)!.maxAttacks).toBe(1)
  })

  it('a minion cannot attack twice without windfury', () => {
    const { state, id } = summon(start(), 0, 'charger')
    let s = applyAction(state, {
      type: 'attack',
      player: 0,
      attackerId: id,
      targetId: HERO_TARGET(1),
    }).state
    expect(s.players[1].hero.health).toBe(27)
    // Second attack rejected.
    s = applyAction(s, {
      type: 'attack',
      player: 0,
      attackerId: id,
      targetId: HERO_TARGET(1),
    }).state
    expect(s.players[1].hero.health).toBe(27)
  })
})
