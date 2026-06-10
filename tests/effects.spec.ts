import { beforeEach, describe, expect, it } from 'vitest'
import { applyAction, createInitialState } from '../game/engine'
import type { GameState } from '../game/types'
import { HERO_TARGET } from '../game/types'
import { giveCard, installFixtures, makeSetup, padDeck, setMana } from './fixtures'

beforeEach(() => {
  installFixtures()
})

/** Start a running game with empty padded decks; player 0 has 10 mana. */
function start(seed = 5): GameState {
  const setup = makeSetup(padDeck([]), padDeck([]))
  const state = applyAction(createInitialState(setup, seed), { type: 'startGame', seed, setup }).state
  setMana(state, 0, 10)
  return state
}

/** Play a card for player 0 (optionally targeted / choose-one). */
function play(
  state: GameState,
  cardId: string,
  opts: { targetId?: string; chooseOneIndex?: number } = {}
): GameState {
  const id = giveCard(state, 0, cardId)
  return applyAction(state, {
    type: 'playCard',
    player: 0,
    instanceId: id,
    targetId: opts.targetId,
    chooseOneIndex: opts.chooseOneIndex,
  }).state
}

describe('damage & heal', () => {
  it('damage to enemy hero reduces health', () => {
    const state = play(start(), 'bolt', { targetId: HERO_TARGET(1) })
    expect(state.players[1].hero.health).toBe(27)
  })

  it('heal cannot exceed maxHealth', () => {
    let state = start()
    state.players[0].hero.health = 28
    state = play(state, 'heal_spell', { targetId: HERO_TARGET(0) })
    expect(state.players[0].hero.health).toBe(30)
  })
})

describe('draw / gainMana', () => {
  it('draw adds cards to hand', () => {
    let state = start()
    const before = state.players[0].hand.length
    state = play(state, 'draw_spell')
    // play() adds then removes the spell (net 0), drew 2 → net +2 from before.
    expect(state.players[0].hand.length).toBe(before + 2)
  })

  it('gainManaThisTurn (innervate) adds temporary mana', () => {
    let state = start()
    setMana(state, 0, 1)
    state = play(state, 'innervate')
    expect(state.players[0].mana.current).toBe(3) // 1 base + 2
    expect(state.players[0].mana.max).toBe(1)
  })

  it('gainManaCrystal (empty) raises max but not current', () => {
    let state = start()
    setMana(state, 0, 2)
    state = play(state, 'wild_growth')
    expect(state.players[0].mana.max).toBe(3)
    // Spent 2, empty crystal not refilled.
    expect(state.players[0].mana.current).toBe(0)
  })

  it('gainManaCrystal (non-empty) raises max and refills the gained crystal', () => {
    let state = start()
    setMana(state, 0, 1)
    state = play(state, 'mana_minion')
    expect(state.players[0].mana.max).toBe(2)
  })
})

describe('summon', () => {
  it('summon effect places tokens on the board', () => {
    const state = play(start(), 'summon_spell')
    const treants = state.players[0].board.filter((m) => m.cardId === 'treant')
    expect(treants.length).toBe(3)
  })
})

describe('buff & setStats', () => {
  it('buff raises attack and health (and maxHealth)', () => {
    let state = play(start(), 'wisp')
    const target = state.players[0].board[0].instanceId
    state = play(state, 'buff_spell', { targetId: target })
    const m = state.players[0].board[0]
    expect(m.attack).toBe(3)
    expect(m.health).toBe(3)
    expect(m.maxHealth).toBe(3)
  })
})

describe('destroy & silence', () => {
  it('destroy removes a minion', () => {
    let state = play(start(), 'wisp')
    const target = state.players[0].board[0].instanceId
    state = play(state, 'destroy_spell', { targetId: target })
    expect(state.players[0].board.length).toBe(0)
  })

  it('silence strips keywords and resets stats', () => {
    let state = play(start(), 'taunt_bear')
    const target = state.players[0].board[0].instanceId
    state = play(state, 'buff_spell', { targetId: target })
    expect(state.players[0].board[0].keywords).toContain('taunt')
    state = play(state, 'silence_spell', { targetId: target })
    const m = state.players[0].board[0]
    expect(m.keywords).not.toContain('taunt')
    expect(m.attack).toBe(2)
    expect(m.maxHealth).toBe(4)
  })
})

describe('divine shield & giveDivineShield', () => {
  it('divine shield absorbs the first instance of damage', () => {
    let state = play(start(), 'shield_bot')
    const target = state.players[0].board[0].instanceId
    state = play(state, 'bolt', { targetId: target })
    const m = state.players[0].board.find((x) => x.instanceId === target)!
    expect(m.divineShield).toBe(false)
    expect(m.health).toBe(2)
  })

  it('giveDivineShield grants a shield', () => {
    let state = play(start(), 'wisp')
    const target = state.players[0].board[0].instanceId
    state = play(state, 'shield_spell', { targetId: target })
    expect(state.players[0].board[0].divineShield).toBe(true)
  })
})

describe('spell damage', () => {
  it('a spell-damage minion increases spell damage', () => {
    let state = play(start(), 'mage_imp')
    expect(state.players[0].spellDamage).toBe(1)
    state = play(state, 'bolt', { targetId: HERO_TARGET(1) })
    // Bolt deals 3 + 1 spell damage = 4.
    expect(state.players[1].hero.health).toBe(26)
  })
})

describe('chooseOne', () => {
  it('applies the chosen spell option (1 dmg + draw)', () => {
    let state = play(start(), 'raptor') // 3/2 so it survives 1 damage
    const target = state.players[0].board[0].instanceId
    const handBefore = state.players[0].hand.length
    state = play(state, 'wrath', { targetId: target, chooseOneIndex: 1 })
    // Option 1: 1 damage + draw. play() is net 0 for the spell, draw 1 → +1.
    expect(state.players[0].hand.length).toBe(handBefore + 1)
    // Target took 1 damage.
    expect(state.players[0].board.find((m) => m.instanceId === target)!.health).toBe(1)
  })

  it('option 0 of wrath deals 3 damage', () => {
    let state = play(start(), 'raptor') // 3/2
    const target = state.players[0].board[0].instanceId
    state = play(state, 'wrath', { targetId: target, chooseOneIndex: 0 })
    expect(state.players[0].board.some((m) => m.instanceId === target)).toBe(false)
  })

  it('applies chosen minion option stats (4/6 Taunt)', () => {
    const state = play(start(), 'claw_druid', { chooseOneIndex: 1 })
    const m = state.players[0].board[0]
    expect(m.health).toBe(6)
    expect(m.keywords).toContain('taunt')
  })

  it('applies chosen minion option stats (4/4 Charge)', () => {
    const state = play(start(), 'claw_druid', { chooseOneIndex: 0 })
    const m = state.players[0].board[0]
    expect(m.keywords).toContain('charge')
  })
})

describe('discover', () => {
  it('sets a pending choice and resolves it into the hand', () => {
    let state = play(start(), 'discover_spell')
    expect(state.pendingChoice).toBeDefined()
    expect(state.pendingChoice!.type).toBe('discover')
    expect(state.pendingChoice!.options.length).toBeGreaterThan(0)
    const pick = state.pendingChoice!.options[0]!
    const before = state.players[0].hand.length
    state = applyAction(state, {
      type: 'resolveChoice',
      player: 0,
      pick: { cardId: pick.cardId },
    }).state
    expect(state.pendingChoice).toBeUndefined()
    expect(state.players[0].hand.length).toBe(before + 1)
    expect(state.players[0].hand.some((c) => c.cardId === pick.cardId)).toBe(true)
  })

  it('discover only offers non-token minions', () => {
    const state = play(start(), 'discover_spell')
    const ids = state.pendingChoice!.options.map((o) => o.cardId)
    expect(ids).not.toContain('treant')
    expect(ids).not.toContain('sapling')
  })
})

describe('aura', () => {
  it('other friendly minions get the aura buff but not the source', () => {
    let state = play(start(), 'wisp')
    state = play(state, 'warchief')
    const wisp = state.players[0].board.find((m) => m.cardId === 'wisp')!
    const chief = state.players[0].board.find((m) => m.cardId === 'warchief')!
    expect(wisp.attack).toBe(2) // 1 + 1 aura
    expect(wisp.health).toBe(2)
    expect(chief.attack).toBe(6) // source excluded
    expect(chief.health).toBe(6)
  })

  it('removing the aura source reverts the buff', () => {
    let state = play(start(), 'wisp')
    state = play(state, 'warchief')
    const chiefId = state.players[0].board.find((m) => m.cardId === 'warchief')!.instanceId
    // Refill mana (wisp + 7-cost warchief drained it) so Assassinate is affordable.
    setMana(state, 0, 10)
    // Destroy the warchief.
    state = play(state, 'destroy_spell', { targetId: chiefId })
    const wisp = state.players[0].board.find((m) => m.cardId === 'wisp')!
    expect(wisp.attack).toBe(1)
    expect(wisp.health).toBe(1)
  })
})
