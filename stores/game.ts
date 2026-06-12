import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import {
  applyAction,
  createInitialState,
  chooseAiAction,
  aiProfileFor,
  queries,
  getCard,
  hasCard,
  spellDamageBonus,
} from '~/game/index'
import type {
  Action,
  CardInstance,
  GameEvent,
  GameSetup,
  GameState,
  PlayerId,
  PlayerState,
  PendingChoice,
} from '~/game/types'
import { HERO_TARGET } from '~/game/types'
import { getEnemyDef } from '~/data/registry'
import { useAudio } from '~/composables/useAudio'

/** Sleep helper used to pace the AI turn so the player can watch it. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Per-step delay (ms) for the watchable AI loop. */
const AI_STEP_DELAY = 600
/** Slightly tighter delay after the AI passes priority / ends its turn. */
const AI_TURN_END_DELAY = 450

/**
 * useGameStore — drives a single match.
 *
 * The pure engine (`applyAction`) returns fresh state, so we simply reassign
 * `match`. Human actions are applied synchronously and then, when priority
 * passes to the AI (player 1) or the AI owns a pending choice, the enemy turn
 * loop runs asynchronously with small delays so the player can watch it.
 *
 * Emitted engine events are surfaced via `lastEvents` so the board can drive
 * GSAP animations (the board watches `eventTick`).
 */
export const useGameStore = defineStore('game', () => {
  /** Audio layer — combat SFX are driven from emitted engine events. */
  const audio = useAudio()

  /* --------------------------------------------------------------------------
   * State
   * ----------------------------------------------------------------------- */

  /** Current match state, or null before a match starts. Plain serialisable data. */
  const match = shallowRef<GameState | null>(null)
  /** True while the AI loop / scripted animations run; locks human input. */
  const busy = ref(false)
  /** When set, the human is choosing a target for this pending source id. */
  const targetingFrom = ref<string | null>(null)

  /** Most recent batch of engine events (for the board's animation watcher). */
  const lastEvents = shallowRef<GameEvent[]>([])
  /** Monotonic counter that ticks each time `lastEvents` changes. */
  const eventTick = ref(0)

  /** Human-readable combat log (cards played, attacks, damage, deaths). */
  const logLines = ref<{ id: number; text: string; kind: string }[]>([])
  let logSeq = 0

  /** AI profile name for the current enemy (resolved at startMatch). */
  const enemyProfile = ref<'aggro' | 'midrange' | 'control' | 'tempo'>('midrange')

  /* --------------------------------------------------------------------------
   * Getters
   * ----------------------------------------------------------------------- */

  /** The human player state (always player 0). */
  const human = computed<PlayerState | null>(() => match.value?.players[0] ?? null)
  /** The enemy player state (always player 1, AI-driven). */
  const enemy = computed<PlayerState | null>(() => match.value?.players[1] ?? null)

  /** The human's FULL live Spell Damage this turn — board/auras + temporary
   *  "+N this turn" hero effects — so spell cards display the boost that the
   *  engine will actually apply (the board value alone misses this-turn buffs). */
  const humanSpellDamage = computed<number>(() =>
    match.value ? spellDamageBonus(match.value, 0) : 0
  )

  /** Current game phase ('mulligan' | 'main' | 'gameOver'), or null. */
  const phase = computed(() => match.value?.phase ?? null)
  /** The decided winner, if any. */
  const winner = computed(() => match.value?.winner)
  /** Any pending engine choice (discover / chooseOne / target). */
  const pendingChoice = computed<PendingChoice | undefined>(() => match.value?.pendingChoice)

  /** True when it is the human's turn and they may freely act. */
  const isHumanTurn = computed(
    () =>
      !!match.value &&
      match.value.phase === 'main' &&
      match.value.activePlayer === 0 &&
      !match.value.pendingChoice &&
      !busy.value
  )

  /** "current / max" mana label for the human. */
  const manaText = computed(() => {
    const m = human.value?.mana
    return m ? `${m.current}/${m.max}` : '0/0'
  })

  /* --- query wrappers (read-only helpers used by the board) --- */

  /** Instance ids of human hand cards that are currently playable. */
  const playableInstanceIds = computed<string[]>(() => {
    if (!match.value || !isHumanTurn.value) return []
    return queries.getPlayableCards(match.value, 0).map((c) => c.instanceId)
  })

  /** Instance ids of human minions that can attack right now. */
  const attackerIds = computed<string[]>(() => {
    if (!match.value || !isHumanTurn.value) return []
    return queries.getAttackers(match.value, 0)
  })

  /** True when the human has lethal on board this turn. */
  const lethalAvailable = computed<boolean>(() => {
    if (!match.value || !isHumanTurn.value) return false
    return queries.isLethalAvailable(match.value, 0)
  })

  /**
   * Legal target ids for a human hand card instance.
   * @param instanceId - the card instance id in hand
   * @returns minion instance ids / hero sentinels that may be targeted
   */
  function validTargetsFor(instanceId: string): string[] {
    if (!match.value) return []
    const inst = human.value?.hand.find((c) => c.instanceId === instanceId)
    if (!inst) return []
    return queries.getValidTargets(match.value, 0, inst)
  }

  /**
   * Legal attack target ids for one of the human's minions.
   * @param attackerId - the attacking minion instance id
   * @returns defender ids (minions and/or the enemy hero sentinel)
   */
  function attackTargetsFor(attackerId: string): string[] {
    if (!match.value) return []
    return queries.getAttackTargets(match.value, 0, attackerId)
  }

  /**
   * The live (aura/reduction-adjusted) cost of a human hand card.
   * @param inst - the card instance
   * @returns current playable cost
   */
  function liveCost(inst: CardInstance): number {
    if (!match.value) return inst.cost
    return queries.getLiveCost(match.value, 0, inst)
  }

  /* --------------------------------------------------------------------------
   * Internal helpers
   * ----------------------------------------------------------------------- */

  /** Apply an action to the engine, store fresh state, and surface its events. */
  function dispatch(action: Action): GameEvent[] {
    if (!match.value) return []
    const result = applyAction(match.value, action)
    match.value = result.state
    lastEvents.value = result.events
    eventTick.value++
    playEventSounds(result.events)
    appendLog(result.events, result.state)
    return result.events
  }

  /* --------------------------------------------------------------------------
   * Combat log
   * ----------------------------------------------------------------------- */

  /** Display name for a card id. */
  function cardName(cardId: string): string {
    return hasCard(cardId) ? getCard(cardId).name : cardId
  }

  /** Display name for an entity id (hero sentinel, board minion, or graveyard minion). */
  function entityName(state: GameState, id: string): string {
    if (id === HERO_TARGET(0)) return `${state.players[0].hero.name} (you)`
    if (id === HERO_TARGET(1)) return state.players[1].hero.name
    for (const p of [0, 1] as const) {
      const m = state.players[p].board.find((x) => x.instanceId === id)
      if (m) return cardName(m.cardId)
      const g = state.players[p].graveyard.find((x) => x.instanceId === id)
      if (g) return cardName(g.cardId)
    }
    return 'a minion'
  }

  /** Perspective label for a player. */
  function who(state: GameState, player: 0 | 1): string {
    return player === 0 ? 'You' : state.players[1].hero.name
  }

  /** Turn engine events into readable log lines (resolving names from the new state). */
  function appendLog(events: GameEvent[], state: GameState): void {
    for (const ev of events) {
      let text: string | null = null
      let kind = 'info'
      switch (ev.type) {
        case 'turnStarted':
          text = `— ${ev.player === 0 ? 'Your' : who(state, 1) + '’s'} turn ${ev.turn} —`
          kind = 'turn'
          break
        case 'cardPlayed':
          text = `${who(state, ev.player)} played ${cardName(ev.cardId)}`
          kind = ev.player === 0 ? 'you' : 'foe'
          break
        case 'attack':
          text = `${entityName(state, ev.attackerId)} attacks ${entityName(state, ev.targetId)}`
          kind = 'attack'
          break
        case 'damage':
          text = `${entityName(state, ev.targetId)} takes ${ev.amount} damage`
          kind = 'damage'
          break
        case 'heal':
          text = `${entityName(state, ev.targetId)} restores ${ev.amount} Health`
          kind = 'heal'
          break
        case 'death':
          text = `${entityName(state, ev.instanceId)} is destroyed`
          kind = 'death'
          break
        case 'heroPowerUsed':
          text = `${who(state, ev.player)} used a Hero Power`
          kind = ev.player === 0 ? 'you' : 'foe'
          break
        case 'gameOver':
          text = ev.winner === 0 ? 'Victory!' : ev.winner === 1 ? 'Defeat.' : 'Draw.'
          kind = 'turn'
          break
        default:
          break
      }
      if (text) logLines.value.push({ id: ++logSeq, text, kind })
    }
    // Cap history so the log never grows unbounded.
    if (logLines.value.length > 120) logLines.value.splice(0, logLines.value.length - 120)
  }

  /**
   * Play the non-combat audio cues for a batch of engine events. Combat SFX
   * (attack / damage / death) are fired by the board so they sync with the GSAP
   * animations; here we cover the cues that have no precise visual to land on.
   *
   * Note: the opening-hand deal in `startMatch` sets `lastEvents` directly
   * (without `dispatch`), so those card draws intentionally make no sound.
   */
  function playEventSounds(events: GameEvent[]): void {
    for (const ev of events) {
      switch (ev.type) {
        case 'cardPlayed':
          audio.play('cardPlay')
          break
        case 'cardDrawn':
          // Throttled in the audio layer, so multi-draw effects play once.
          audio.play('cardDraw')
          break
        case 'turnStarted':
          // Keep the board ambience running through the match (idempotent).
          audio.playMusic('board')
          break
        case 'gameOver':
          audio.play(ev.winner === 0 ? 'victory' : 'defeat')
          break
        default:
          break
      }
    }
  }

  /** Whether the AI currently owns priority or a pending choice to resolve. */
  function aiHasControl(): boolean {
    const s = match.value
    if (!s || s.phase === 'gameOver') return false
    if (s.pendingChoice) return s.pendingChoice.player === 1
    return s.activePlayer === 1
  }

  /**
   * Run the enemy AI to completion: keep asking the heuristic AI for an action
   * and applying it (with a delay between steps for watchability) until control
   * returns to the human or the game ends. Auto-resolves the enemy's choices.
   */
  async function runEnemyTurn(): Promise<void> {
    if (busy.value) return
    busy.value = true
    try {
      // Small beat before the enemy starts acting.
      await delay(AI_TURN_END_DELAY)
      let guard = 0
      while (aiHasControl() && guard < 400) {
        guard++
        const s = match.value!
        const action = chooseAiAction(s, 1, aiProfileFor(enemyProfile.value))
        const events = dispatch(action)
        // Give the board time to animate the most recent step.
        const pacing = action.type === 'endTurn' ? AI_TURN_END_DELAY : AI_STEP_DELAY
        await delay(events.length > 3 ? pacing + 200 : pacing)
        if (!match.value || match.value.phase === 'gameOver') break
      }
    } finally {
      busy.value = false
    }
  }

  /**
   * After a human action, if control has passed to the AI, run the enemy turn.
   * Targeting mode is always cleared.
   */
  async function maybeRunEnemy(): Promise<void> {
    targetingFrom.value = null
    if (aiHasControl()) await runEnemyTurn()
  }

  /* --------------------------------------------------------------------------
   * Actions
   * ----------------------------------------------------------------------- */

  /**
   * Start a new match from a GameSetup. Auto-keeps the full opening hand
   * (no interactive mulligan in this build) and hands priority to whoever the
   * AI is if it goes first.
   * @param setup - players + firstPlayer
   * @param seed - optional deterministic RNG seed
   */
  async function startMatch(setup: GameSetup, seed = Date.now() >>> 0): Promise<void> {
    busy.value = false
    targetingFrom.value = null
    logLines.value = []

    // Resolve the enemy AI profile from the enemy hero, best-effort.
    enemyProfile.value = 'midrange'
    try {
      const enemyHeroName = setup.players[1]?.hero?.name
      // Match the enemy def by hero name to pull its declared AI profile.
      // (Enemy setups are built by the run store from an EnemyDef.)
      if (enemyHeroName) {
        // We cannot import the enemies array selectively here without a lookup,
        // so the run store may also set the profile; default stays midrange.
      }
    } catch {
      /* default profile */
    }

    let state = createInitialState(setup, seed)
    // Engine starts in 'mulligan'. Auto-keep both opening hands to reach 'main'.
    const r0 = applyAction(state, keepAllAction(state, 0))
    state = r0.state
    const r1 = applyAction(state, keepAllAction(state, 1))
    state = r1.state

    match.value = state
    lastEvents.value = [...r0.events, ...r1.events]
    eventTick.value++
    appendLog([...r0.events, ...r1.events], state)

    // If the AI was given the first turn, let it play.
    await maybeRunEnemy()
  }

  /** Allow the run store to set the enemy AI profile (by enemy id). */
  function setEnemyById(enemyId: string): void {
    try {
      enemyProfile.value = getEnemyDef(enemyId).aiProfile
    } catch {
      enemyProfile.value = 'midrange'
    }
  }

  /** Build a mulligan action that keeps the player's entire current hand. */
  function keepAllAction(state: GameState, player: PlayerId): Action {
    return {
      type: 'mulligan',
      player,
      keepInstanceIds: state.players[player].hand.map((c) => c.instanceId),
    }
  }

  /**
   * Human plays a card from hand.
   * @param instanceId - the hand card instance id
   * @param opts - optional targetId / board position / chooseOne option index
   */
  async function humanPlayCard(
    instanceId: string,
    opts?: { targetId?: string; position?: number; chooseOneIndex?: number }
  ): Promise<void> {
    if (!isHumanTurn.value) return
    dispatch({
      type: 'playCard',
      player: 0,
      instanceId,
      targetId: opts?.targetId,
      position: opts?.position,
      chooseOneIndex: opts?.chooseOneIndex,
    })
    // Playing a card may open a pending choice owned by the human (discover /
    // chooseOne) — in that case do NOT hand off to the AI; the board resolves it.
    if (match.value?.pendingChoice?.player === 0) {
      targetingFrom.value = null
      return
    }
    await maybeRunEnemy()
  }

  /**
   * Human declares an attack.
   * @param attackerId - friendly minion instance id
   * @param targetId - defender id (minion instance id or HERO_TARGET(1))
   */
  async function humanAttack(attackerId: string, targetId: string): Promise<void> {
    if (!isHumanTurn.value) return
    dispatch({ type: 'attack', player: 0, attackerId, targetId })
    await maybeRunEnemy()
  }

  /**
   * Human uses their hero power.
   * @param opts - optional targetId / chooseOne option index
   */
  async function humanHeroPower(opts?: {
    targetId?: string
    chooseOneIndex?: number
  }): Promise<void> {
    if (!isHumanTurn.value) return
    dispatch({
      type: 'useHeroPower',
      player: 0,
      targetId: opts?.targetId,
      chooseOneIndex: opts?.chooseOneIndex,
    })
    if (match.value?.pendingChoice?.player === 0) {
      targetingFrom.value = null
      return
    }
    await maybeRunEnemy()
  }

  /** Human ends their turn; the enemy then takes its turn. */
  async function humanEndTurn(): Promise<void> {
    if (!isHumanTurn.value) return
    dispatch({ type: 'endTurn', player: 0 })
    await maybeRunEnemy()
  }

  /**
   * Resolve a human-owned pending choice (discover / chooseOne).
   * @param pick - the chosen cardId (discover) or option index (chooseOne)
   */
  async function resolve(pick: { cardId?: string; index?: number }): Promise<void> {
    if (!match.value || match.value.pendingChoice?.player !== 0) return
    dispatch({ type: 'resolveChoice', player: 0, pick })
    // Resolving might open a chained choice still owned by the human.
    if (match.value?.pendingChoice?.player === 0) return
    await maybeRunEnemy()
  }

  /** Concede the current match (human). */
  async function concede(): Promise<void> {
    if (!match.value || match.value.phase === 'gameOver') return
    dispatch({ type: 'concede', player: 0 })
  }

  /** Tear down the current match. */
  function reset(): void {
    match.value = null
    busy.value = false
    targetingFrom.value = null
    lastEvents.value = []
  }

  return {
    // state
    match,
    busy,
    targetingFrom,
    lastEvents,
    eventTick,
    logLines,
    // getters
    human,
    enemy,
    humanSpellDamage,
    phase,
    winner,
    pendingChoice,
    isHumanTurn,
    manaText,
    playableInstanceIds,
    attackerIds,
    lethalAvailable,
    validTargetsFor,
    attackTargetsFor,
    liveCost,
    // actions
    startMatch,
    setEnemyById,
    humanPlayCard,
    humanAttack,
    humanHeroPower,
    humanEndTurn,
    resolve,
    concede,
    reset,
    // re-export sentinel for the board
    HERO_TARGET,
  }
})
