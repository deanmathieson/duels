import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import { getAttackTargets, getValidTargets } from '../game/queries'
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

const minion = (s: GameState, p: PlayerId, id: string) =>
  s.players[p].board.find((m) => m.instanceId === id)

describe('stat auras are continuous', () => {
  it('applies +1/+1 while the source lives and reverts when it dies', () => {
    let r = summon(start(), 0, 'warchief')
    let s = r.state
    const warchiefId = r.id
    r = summon(s, 0, 'wisp')
    s = r.state
    const wispId = r.id
    expect(minion(s, 0, wispId)!.attack).toBe(2)
    expect(minion(s, 0, wispId)!.health).toBe(2)

    s = cast(s, 0, 'destroy_spell', warchiefId)
    expect(minion(s, 0, wispId)!.attack).toBe(1)
    expect(minion(s, 0, wispId)!.health).toBe(1)
  })

  it('losing an aura retains damage taken and can kill (Mal\'Ganis rule)', () => {
    let r = summon(start(), 0, 'warchief')
    let s = r.state
    const warchiefId = r.id
    r = summon(s, 0, 'wisp')
    s = r.state
    const wispId = r.id

    // Ping our own 1/2-buffed wisp down to 1 health.
    s.activePlayer = 0
    setMana(s, 0, 10)
    s = applyAction(s, { type: 'useHeroPower', player: 0, targetId: wispId }).state
    expect(minion(s, 0, wispId)!.health).toBe(1)

    // Aura source dies -> wisp loses +1 health while keeping its damage -> dies.
    s = cast(s, 0, 'destroy_spell', warchiefId)
    expect(minion(s, 0, wispId)).toBeUndefined()
  })

  it('silencing a minion under a stat aura resets it cleanly to base stats', () => {
    let r = summon(start(), 0, 'warchief')
    let s = r.state
    r = summon(s, 0, 'yeti')
    s = r.state
    const yetiId = r.id
    expect(minion(s, 0, yetiId)!.attack).toBe(5)

    s = cast(s, 0, 'silence_spell', yetiId)
    expect(minion(s, 0, yetiId)!.attack).toBe(4)
    expect(minion(s, 0, yetiId)!.health).toBe(5)

    // A later recompute (any board change) must not corrupt the silenced stats.
    s = summon(s, 0, 'wisp').state
    expect(minion(s, 0, yetiId)!.attack).toBe(4)
    expect(minion(s, 0, yetiId)!.health).toBe(5)
  })
})

describe('keyword auras are layered', () => {
  it('aura-granted Taunt disappears with the source; base Taunt survives', () => {
    let r = summon(start(), 0, 'taunt_giver')
    let s = r.state
    const giverId = r.id
    r = summon(s, 0, 'taunt_bear')
    s = r.state
    const bearId = r.id
    r = summon(s, 0, 'wisp')
    s = r.state
    const wispId = r.id

    expect(minion(s, 0, wispId)!.keywords).toContain('taunt')
    expect(minion(s, 0, bearId)!.keywords).toContain('taunt')

    s = cast(s, 0, 'destroy_spell', giverId)
    expect(minion(s, 0, wispId)!.keywords).not.toContain('taunt')
    expect(minion(s, 0, bearId)!.keywords).toContain('taunt')
  })

  it('a permanent giveKeyword grant survives losing an aura that gave the same keyword', () => {
    let r = summon(start(), 0, 'taunt_giver')
    let s = r.state
    const giverId = r.id
    r = summon(s, 0, 'wisp')
    s = r.state
    const wispId = r.id
    expect(minion(s, 0, wispId)!.keywords).toContain('taunt')

    // Permanently grant Taunt while the aura already provides it.
    s = cast(s, 0, 'taunt_spell', wispId)
    s = cast(s, 0, 'destroy_spell', giverId)
    expect(minion(s, 0, wispId)!.keywords).toContain('taunt')
  })

  it('"your Taunt minions" stat auras apply to minions granted Taunt later', () => {
    let r = summon(start(), 0, 'taunt_drill')
    let s = r.state
    const drillId = r.id
    r = summon(s, 0, 'wisp')
    s = r.state
    const wispId = r.id
    expect(minion(s, 0, wispId)!.attack).toBe(1)

    s = cast(s, 0, 'taunt_spell', wispId)
    expect(minion(s, 0, wispId)!.attack).toBe(2)
    expect(minion(s, 0, wispId)!.health).toBe(3)

    // Aura source dies: stats revert, the permanent Taunt stays.
    s = cast(s, 0, 'destroy_spell', drillId)
    expect(minion(s, 0, wispId)!.attack).toBe(1)
    expect(minion(s, 0, wispId)!.health).toBe(1)
    expect(minion(s, 0, wispId)!.keywords).toContain('taunt')
  })
})

describe('stealth', () => {
  it('a stealthed minion cannot be attacked', () => {
    let r = summon(start(), 1, 'stealth_cat')
    let s = r.state
    const catId = r.id
    r = summon(s, 0, 'charger')
    s = r.state
    const chargerId = r.id

    expect(getAttackTargets(s, 0, chargerId)).toEqual([HERO_TARGET(1)])

    const before = minion(s, 1, catId)!.health
    s = applyAction(s, { type: 'attack', player: 0, attackerId: chargerId, targetId: catId }).state
    expect(minion(s, 1, catId)!.health).toBe(before) // attack was rejected
  })

  it('a stealthed Taunt minion does not enforce Taunt', () => {
    let r = summon(start(), 1, 'stealth_taunt')
    let s = r.state
    r = summon(s, 0, 'charger')
    s = r.state
    const chargerId = r.id

    expect(getAttackTargets(s, 0, chargerId)).toEqual([HERO_TARGET(1)])
    s = applyAction(s, { type: 'attack', player: 0, attackerId: chargerId, targetId: HERO_TARGET(1) }).state
    expect(s.players[1].hero.health).toBe(27)
  })

  it('stealth cannot be targeted by enemy spells but stays targetable by its owner', () => {
    let r = summon(start(), 1, 'stealth_cat')
    let s = r.state
    const enemyCatId = r.id
    r = summon(s, 0, 'stealth_cat')
    s = r.state
    const ownCatId = r.id

    s.activePlayer = 0
    setMana(s, 0, 10)
    const boltId = giveCard(s, 0, 'bolt')
    const boltInst = s.players[0].hand.find((c) => c.instanceId === boltId)!
    const targets = getValidTargets(s, 0, boltInst)
    expect(targets).toContain(ownCatId)
    expect(targets).not.toContain(enemyCatId)
  })

  it('breaks when the stealthed minion attacks', () => {
    let r = summon(start(), 1, 'stealth_cat')
    let s = r.state
    const catId = r.id
    s = passRoundTo(s, 1)

    s = applyAction(s, { type: 'attack', player: 1, attackerId: catId, targetId: HERO_TARGET(0) }).state
    expect(s.players[0].hero.health).toBe(26)
    expect(minion(s, 1, catId)!.keywords).not.toContain('stealth')

    // Now the cat is attackable.
    const charger = summon(s, 0, 'charger')
    expect(getAttackTargets(charger.state, 0, charger.id)).toContain(catId)
  })
})
