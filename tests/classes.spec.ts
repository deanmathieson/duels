import { beforeAll, describe, expect, it } from 'vitest'
import type {
  CardDef,
  EffectSpec,
  GameSetup,
  GameState,
  HeroState,
  PlayerId,
  PlayerSetup,
} from '../game/types'
import {
  aiProfileFor,
  applyAction,
  chooseAiAction,
  createInitialState,
  hasCard,
  hasHeroPower,
} from '../game/index'
import {
  allCards,
  collectibleCardIdsForClass,
  getEnemyDef,
  getTreasureDef,
  heroes,
  initializeContent,
} from '../data/registry'

beforeAll(() => {
  initializeContent()
})

function hero(name: string, cardClass: HeroState['cardClass'], health = 30): HeroState {
  return { name, cardClass, health, maxHealth: health, armor: 0, attack: 0, attacksThisTurn: 0 }
}

/** Card ids referenced by a list of effects (summon/add/equip/coin). */
function refsFromEffects(effects: EffectSpec[] | undefined): string[] {
  const out: string[] = []
  for (const e of effects ?? []) {
    if (e.kind === 'summon' || e.kind === 'summonPerManaCrystal') out.push(e.token)
    else if (e.kind === 'addCardToHand' || e.kind === 'shuffleIntoDeck' || e.kind === 'equipWeapon') {
      out.push(e.cardId)
    } else if (e.kind === 'gainCoin') out.push('the_coin')
  }
  return out
}

/** All card ids a CardDef references through its behaviour. */
function refsFromCard(c: CardDef): string[] {
  const out = [
    ...refsFromEffects(c.battlecry),
    ...refsFromEffects(c.deathrattle),
    ...refsFromEffects(c.spell),
  ]
  for (const o of c.chooseOne ?? []) out.push(...refsFromEffects(o.effects))
  for (const t of c.triggers ?? []) out.push(...refsFromEffects(t.effects))
  return out
}

describe('content reference integrity (all classes)', () => {
  it('every summoned / added / equipped card id is registered', () => {
    const missing: string[] = []
    for (const c of allCards) {
      for (const id of refsFromCard(c)) if (!hasCard(id)) missing.push(`${c.id} -> ${id}`)
    }
    expect(missing).toEqual([])
  })

  it('every hero resolves: hero powers, signatures, and a deep enough pool', () => {
    expect(heroes.length).toBeGreaterThanOrEqual(9) // druid + 8 classes
    for (const h of heroes) {
      expect(h.heroPowers.length, `${h.id} powers`).toBeGreaterThan(0)
      for (const hp of h.heroPowers) expect(hasHeroPower(hp), `${h.id} -> ${hp}`).toBe(true)
      expect(h.signatureTreasures.length, `${h.id} sigs`).toBeGreaterThan(0)
      for (const sig of h.signatureTreasures) {
        const t = getTreasureDef(sig)
        if (t.card) expect(hasCard(t.card.id), `${sig} card`).toBe(true)
        else {
          const effectful = (t.auras?.length ?? 0) + (t.triggers?.length ?? 0) + (t.startOfGame?.length ?? 0)
          expect(effectful, `${sig} passive does something`).toBeGreaterThan(0)
        }
      }
      expect(collectibleCardIdsForClass(h.cardClass).length, `${h.id} pool`).toBeGreaterThanOrEqual(15)
    }
  })
})

describe('every class plays a full game without crashing', () => {
  for (const h of heroes) {
    it(`${h.id} (${h.name}) reaches gameOver`, () => {
      const sig = getTreasureDef(h.signatureTreasures[0])
      const pool = collectibleCardIdsForClass(h.cardClass).slice(0, 15)
      const deck = sig.card ? [sig.card.id, ...pool] : [...pool]
      const playerSetup: PlayerSetup = {
        hero: hero(h.name, h.cardClass),
        heroPowerId: h.heroPowers[0],
        deckCardIds: deck,
        passiveTreasureIds: sig.card ? [] : [sig.id],
        isAI: true,
      }
      const enemy = getEnemyDef('enemy_tempo_mage')
      const enemySetup: PlayerSetup = {
        hero: hero(enemy.heroName, enemy.heroClass, enemy.startingHealth ?? 30),
        heroPowerId: enemy.heroPowerId,
        deckCardIds: [...enemy.deck],
        passiveTreasureIds: enemy.passiveTreasureIds ?? [],
        isAI: true,
      }
      const setup: GameSetup = { players: [playerSetup, enemySetup], firstPlayer: 0 }

      let state: GameState = createInitialState(setup, 4242)
      ;({ state } = applyAction(state, { type: 'startGame', seed: 4242, setup }))

      const profiles = [aiProfileFor('midrange'), aiProfileFor(enemy.aiProfile)]
      let guard = 0
      while (state.phase !== 'gameOver' && guard < 4000) {
        guard++
        if (state.pendingChoice) {
          const pick = state.pendingChoice.options[0] ?? {}
          ;({ state } = applyAction(state, {
            type: 'resolveChoice',
            player: state.pendingChoice.player,
            pick: { cardId: pick.cardId, index: pick.index },
          }))
          continue
        }
        const active = state.activePlayer as PlayerId
        ;({ state } = applyAction(state, chooseAiAction(state, active, profiles[active])))
      }
      expect(state.phase, `${h.id} terminated within guard`).toBe('gameOver')
    })
  }
})
