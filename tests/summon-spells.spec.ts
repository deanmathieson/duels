import { beforeAll, describe, expect, it } from 'vitest'
import type { GameSetup, GameState, HeroState } from '../game/types'
import { applyAction, createInitialState, queries } from '../game/index'
import { initializeContent } from '../data/registry'
import { makeCardInstance } from '../game/effects'

beforeAll(() => {
  initializeContent()
})

function hero(cardClass: HeroState['cardClass']): HeroState {
  return { name: 'H', cardClass, health: 30, maxHealth: 30, armor: 0, attack: 0, attacksThisTurn: 0 }
}

function setup(): GameState {
  const gs: GameSetup = {
    players: [
      {
        hero: hero('hunter'),
        heroPowerId: 'hp_steady_shot',
        deckCardIds: Array(15).fill('wisp'),
        passiveTreasureIds: [],
        isAI: false,
      },
      {
        hero: hero('mage'),
        heroPowerId: 'hp_fireblast',
        deckCardIds: Array(15).fill('wisp'),
        passiveTreasureIds: [],
        isAI: true,
      },
    ],
    firstPlayer: 0,
  }
  let state = createInitialState(gs, 42)
  state = applyAction(state, {
    type: 'mulligan',
    player: 0,
    keepInstanceIds: state.players[0].hand.map((c) => c.instanceId),
  }).state
  state.players[0].mana.max = 10
  state.players[0].mana.current = 10
  return state
}

/** Give the player a hand card and return its instance id. */
function give(state: GameState, cardId: string): string {
  const inst = makeCardInstance(cardId)
  state.players[0].hand.push(inst)
  return inst.instanceId
}

/** Fill the player's board to the 7-minion cap by playing wisp-like tokens. */
function fillBoard(state: GameState): void {
  while (state.players[0].board.length < 7) {
    const id = give(state, 'wisp')
    state.players[0].hand.pop()
    const inst = makeCardInstance('wisp')
    state.players[0].hand.push(inst)
    state = Object.assign(
      state,
      applyAction(state, { type: 'playCard', player: 0, instanceId: inst.instanceId }).state
    )
    state.players[0].mana.current = 10
  }
}

describe('summon spells', () => {
  it('player Animal Companion summons via each choose-one option', () => {
    for (const idx of [0, 1, 2]) {
      const state = setup()
      const instanceId = give(state, 'hunter_animal_companion')
      const after = applyAction(state, {
        type: 'playCard',
        player: 0,
        instanceId,
        chooseOneIndex: idx,
      }).state
      expect(after.players[0].board.length, `option ${idx}`).toBe(1)
    }
  })

  it('pure-summon spells are unplayable on a full board (no fizzle for full mana)', () => {
    const state = setup()
    fillBoard(state)
    expect(state.players[0].board.length).toBe(7)

    const companion = give(state, 'hunter_animal_companion')
    const forceOfNature = give(state, 'force_of_nature')
    const damageSpell = give(state, 'hunter_arcane_shot') // damage spell stays playable

    const playable = queries.getPlayableCards(state, 0).map((c) => c.instanceId)
    expect(playable).not.toContain(companion)
    expect(playable).not.toContain(forceOfNature)
    expect(playable).toContain(damageSpell)
  })
})
