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

/** Play a minion from hand for `player` and return its instance id. */
function summon(state: GameState, player: PlayerId, cardId: string): { state: GameState; id: string } {
  state.activePlayer = player
  setMana(state, player, 10)
  const before = new Set(state.players[player].board.map((m) => m.instanceId))
  const inst = giveCard(state, player, cardId)
  const next = applyAction(state, { type: 'playCard', player, instanceId: inst }).state
  const summoned = next.players[player].board.find((m) => !before.has(m.instanceId))!
  return { state: next, id: summoned.instanceId }
}

/** Cast a targeted fixture spell for `player` at `targetId`. */
function cast(state: GameState, player: PlayerId, cardId: string, targetId: string): GameState {
  state.activePlayer = player
  setMana(state, player, 10)
  const inst = giveCard(state, player, cardId)
  return applyAction(state, { type: 'playCard', player, instanceId: inst, targetId }).state
}

/** End turns until `player` is active again (minions shed summoning sickness). */
function passRoundTo(state: GameState, player: PlayerId): GameState {
  let s = state
  let guard = 0
  do {
    s = applyAction(s, { type: 'endTurn', player: s.activePlayer }).state
    guard++
  } while (s.activePlayer !== player && s.phase !== 'gameOver' && guard < 6)
  setMana(s, 0, 10)
  setMana(s, 1, 10)
  return s
}

const boardIds = (s: GameState, p: PlayerId, cardId: string) =>
  s.players[p].board.filter((m) => m.cardId === cardId)

describe('onSelfDamaged', () => {
  it('summons a token when the minion takes spell damage', () => {
    let { state: s, id } = summon(start(), 0, 'imp_boss')
    s = cast(s, 1, 'bolt', id)
    expect(s.players[0].board.find((m) => m.instanceId === id)!.health).toBe(1)
    expect(boardIds(s, 0, 'sapling')).toHaveLength(1)
  })

  it('still fires on lethal damage (trigger resolves before death)', () => {
    let { state: s, id } = summon(start(), 0, 'imp_boss')
    s = cast(s, 1, 'bolt', id) // 4 -> 1, one sapling
    s = cast(s, 1, 'bolt', id) // dies, but still summons
    expect(s.players[0].board.find((m) => m.instanceId === id)).toBeUndefined()
    expect(boardIds(s, 0, 'sapling')).toHaveLength(2)
  })

  it('does not fire when Divine Shield absorbs the hit', () => {
    let { state: s, id } = summon(start(), 0, 'imp_boss')
    s = cast(s, 0, 'shield_spell', id)
    s = cast(s, 1, 'bolt', id)
    expect(s.players[0].board.find((m) => m.instanceId === id)!.health).toBe(4)
    expect(boardIds(s, 0, 'sapling')).toHaveLength(0)
  })

  it('fires when damaged in combat', () => {
    let { state: s, id } = summon(start(), 0, 'imp_boss')
    const charger = summon(s, 1, 'charger')
    s = applyAction(charger.state, {
      type: 'attack',
      player: 1,
      attackerId: charger.id,
      targetId: id,
    }).state
    expect(boardIds(s, 0, 'sapling')).toHaveLength(1)
  })

  it('does not fire when silenced', () => {
    let { state: s, id } = summon(start(), 0, 'imp_boss')
    s = cast(s, 1, 'silence_spell', id)
    s = cast(s, 1, 'bolt', id)
    expect(boardIds(s, 0, 'sapling')).toHaveLength(0)
  })
})

describe('onFriendlyMinionDamaged', () => {
  it('gains armor when a friendly minion (including itself) takes damage, not for enemies or heroes', () => {
    let r = summon(start(), 0, 'armorsmith')
    let s = r.state
    const smithId = r.id
    r = summon(s, 0, 'yeti')
    s = r.state
    const ownYetiId = r.id
    r = summon(s, 1, 'yeti')
    s = r.state
    const foeYetiId = r.id

    // Hero and enemy-minion damage must not trigger (checked first, while
    // armor is 0 — hero damage would otherwise consume earned armor).
    s = cast(s, 1, 'bolt', HERO_TARGET(0))
    s = cast(s, 0, 'bolt', foeYetiId)
    expect(s.players[0].hero.armor).toBe(0)

    s = cast(s, 1, 'bolt', ownYetiId)
    expect(s.players[0].hero.armor).toBe(1)

    s = cast(s, 1, 'bolt', smithId)
    expect(s.players[0].hero.armor).toBe(2)
  })
})

describe('onMinionDamaged', () => {
  it('gains +1 Attack per damaged minion on either side', () => {
    let r = summon(start(), 0, 'frother')
    let s = r.state
    const frotherId = r.id
    r = summon(s, 1, 'yeti')
    s = r.state
    const foeYetiId = r.id
    r = summon(s, 0, 'charger')
    s = r.state
    const chargerId = r.id

    // Charger (3/2) trades into Yeti (4/5): both take damage -> +2 Attack.
    s = applyAction(s, { type: 'attack', player: 0, attackerId: chargerId, targetId: foeYetiId }).state
    const frother = s.players[0].board.find((m) => m.instanceId === frotherId)!
    expect(frother.attack).toBe(4)
  })
})
