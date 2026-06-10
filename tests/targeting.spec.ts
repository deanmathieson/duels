import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import { getValidTargets } from '../game/queries'
import type { GameSetup, GameState, PlayerId } from '../game/types'
import { HERO_TARGET } from '../game/types'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

beforeEach(() => {
  installFixtures()
})

/** Start a running game from a setup; both players get 10 mana. */
function startWith(setup: GameSetup, seed = 11): GameState {
  const state = applyAction(createInitialState(setup, seed), { type: 'startGame', seed, setup }).state
  setMana(state, 0, 10)
  setMana(state, 1, 10)
  return state
}

function start(seed = 11): GameState {
  return startWith(makeSetup(padDeck([]), padDeck([])), seed)
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
function cast(state: GameState, player: PlayerId, cardId: string, targetId?: string): GameState {
  state.activePlayer = player
  setMana(state, player, 10)
  const inst = giveCard(state, player, cardId)
  return applyAction(state, { type: 'playCard', player, instanceId: inst, targetId }).state
}

const minion = (s: GameState, p: PlayerId, id: string) =>
  s.players[p].board.find((m) => m.instanceId === id)

describe('attack-capped targeting (Shadow Word: Pain)', () => {
  it('only minions at or under the cap are valid targets', () => {
    let r = summon(start(), 1, 'raptor') // 3/2 — at the cap
    let s = r.state
    const raptorId = r.id
    r = summon(s, 1, 'yeti') // 4/5 — over the cap
    s = r.state
    const yetiId = r.id

    s.activePlayer = 0
    const swpId = giveCard(s, 0, 'swp')
    const swpInst = s.players[0].hand.find((c) => c.instanceId === swpId)!
    const targets = getValidTargets(s, 0, swpInst)
    expect(targets).toContain(raptorId)
    expect(targets).not.toContain(yetiId)
    expect(targets).not.toContain(HERO_TARGET(1))
  })

  it('uses the CURRENT attack: a buffed 3/2 stops being targetable', () => {
    let r = summon(start(), 1, 'raptor') // 3/2
    let s = r.state
    const raptorId = r.id
    // Opponent buffs its raptor +2/+2 -> 5/4, above the cap.
    s = cast(s, 1, 'buff_spell', raptorId)

    s.activePlayer = 0
    const swpId = giveCard(s, 0, 'swp')
    const swpInst = s.players[0].hand.find((c) => c.instanceId === swpId)!
    expect(getValidTargets(s, 0, swpInst)).not.toContain(raptorId)

    // The engine also rejects a forced illegal play (no mana spent, minion lives).
    const before = s.players[0].mana.current
    s = applyAction(s, { type: 'playCard', player: 0, instanceId: swpId, targetId: raptorId }).state
    expect(minion(s, 1, raptorId)).toBeDefined()
    expect(s.players[0].mana.current).toBe(before)
  })

  it('counts aura-granted attack too', () => {
    let r = summon(start(), 1, 'warchief') // grants other minions +1/+1
    let s = r.state
    r = summon(s, 1, 'raptor') // 3/2 -> live 4/3
    s = r.state
    const raptorId = r.id
    expect(minion(s, 1, raptorId)!.attack).toBe(4)

    s.activePlayer = 0
    const swpId = giveCard(s, 0, 'swp')
    const swpInst = s.players[0].hand.find((c) => c.instanceId === swpId)!
    expect(getValidTargets(s, 0, swpInst)).not.toContain(raptorId)
  })

  it('still destroys a legal low-attack target', () => {
    let r = summon(start(), 1, 'raptor') // 3/2
    let s = r.state
    const raptorId = r.id
    s = cast(s, 0, 'swp', raptorId)
    expect(minion(s, 1, raptorId)).toBeUndefined()
  })
})

describe('adjacentToTarget splash', () => {
  it('hits the chosen minion for 5 and only its neighbours for 2', () => {
    let r = summon(start(), 1, 'yeti') // left
    let s = r.state
    const leftId = r.id
    r = summon(s, 1, 'yeti') // middle (target)
    s = r.state
    const midId = r.id
    r = summon(s, 1, 'yeti') // right
    s = r.state
    const rightId = r.id
    r = summon(s, 1, 'yeti') // far right — NOT adjacent to the target
    s = r.state
    const farId = r.id

    s = cast(s, 0, 'splash_shot', midId)
    expect(minion(s, 1, midId)).toBeUndefined() // 5 damage killed the 4/5
    expect(minion(s, 1, leftId)!.health).toBe(3)
    expect(minion(s, 1, rightId)!.health).toBe(3)
    expect(minion(s, 1, farId)!.health).toBe(5)
    expect(s.players[1].hero.health).toBe(30)
  })
})

describe('targeted hero powers', () => {
  it('a target-less use of a targeted power is rejected (no mana burned)', () => {
    const s = start()
    s.activePlayer = 0
    const before = s.players[0].mana.current
    const next = applyAction(s, { type: 'useHeroPower', player: 0 }).state // hp_ping, no target
    expect(next.players[0].mana.current).toBe(before)
    expect(next.players[0].heroPower.usedThisTurn).toBe(false)
  })

  it('a targeted use resolves and spends the mana', () => {
    const s = start()
    s.activePlayer = 0
    const next = applyAction(s, {
      type: 'useHeroPower',
      player: 0,
      targetId: HERO_TARGET(1),
    }).state
    expect(next.players[1].hero.health).toBe(29)
    expect(next.players[0].heroPower.usedThisTurn).toBe(true)
  })
})

describe('passive treasures are static effects', () => {
  it('treasure-granted Taunt feeds taunt-conditional stat passives (Bulwark + Hold the Line)', () => {
    const setup = makeSetup(padDeck([]), padDeck([]), {
      passives0: ['tr_fix_taunt', 'tr_fix_hold_line'],
    })
    const r = summon(startWith(setup), 0, 'wisp')
    const m = minion(r.state, 0, r.id)!
    expect(m.keywords).toContain('taunt') // from the Bulwark-style passive
    expect(m.attack).toBe(2) // 1 + 1 (Hold the Line saw the aura Taunt)
    expect(m.health).toBe(3) // 1 + 2
  })

  it('aura-granted Taunt from a MINION source also feeds taunt stat auras', () => {
    let r = summon(start(), 0, 'taunt_giver')
    let s = r.state
    r = summon(s, 0, 'taunt_drill')
    s = r.state
    r = summon(s, 0, 'wisp')
    s = r.state
    const wispId = r.id
    // taunt_giver grants Taunt by aura; taunt_drill buffs Taunt minions +1/+2.
    expect(minion(s, 0, wispId)!.keywords).toContain('taunt')
    expect(minion(s, 0, wispId)!.attack).toBe(2)
    expect(minion(s, 0, wispId)!.health).toBe(3)
  })

  it('silence strips card buffs but treasure passives re-apply (Mass Dispel rule)', () => {
    const setup = makeSetup(padDeck([]), padDeck([]), {
      passives1: ['tr_fix_stats'],
    })
    let s = startWith(setup)
    let r = summon(s, 1, 'yeti') // 4/5 -> 5/6 under the +1/+1 treasure
    s = r.state
    const yetiId = r.id
    s = cast(s, 1, 'buff_spell', yetiId) // +2/+2 in-game buff -> 7/8
    expect(minion(s, 1, yetiId)!.attack).toBe(7)

    // Player 0 silences it: the spell buff goes, the treasure's +1/+1 stays.
    s = cast(s, 0, 'silence_spell', yetiId)
    expect(minion(s, 1, yetiId)!.attack).toBe(5)
    expect(minion(s, 1, yetiId)!.maxHealth).toBe(6)
  })

  it('minion-sourced auras do NOT re-apply to a silenced minion', () => {
    let r = summon(start(), 1, 'warchief')
    let s = r.state
    r = summon(s, 1, 'yeti') // 4/5 -> 5/6 under the warchief aura
    s = r.state
    const yetiId = r.id
    s = cast(s, 0, 'silence_spell', yetiId)
    expect(minion(s, 1, yetiId)!.attack).toBe(4)
    expect(minion(s, 1, yetiId)!.maxHealth).toBe(5)
  })
})
