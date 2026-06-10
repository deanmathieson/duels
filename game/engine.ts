import type {
  Action,
  ApplyAction,
  ApplyResult,
  CardDef,
  CardInstance,
  ChooseOneOption,
  GameEvent,
  GameSetup,
  GameState,
  HeroState,
  Keyword,
  PlayerId,
  PlayerSetup,
  PlayerState,
  TreasureDef,
  TriggerDef,
} from './types'
import { HERO_TARGET, MAX_MANA } from './types'
import { getCard, getHeroPower, hasCard, hasHeroPower } from './cardDb'
import { shuffle } from './rng'
import { asInternal } from './internal'
import type { EffectContext } from './effects'
import { hasKeyword } from './keywords'
import { effectMultiplier, hasFirstSpellTwice, recomputeAuras } from './auras'
import {
  applyChooseOneSpell,
  drawCard,
  equipWeaponForPlayer,
  makeCardInstance,
  makeMinion,
  opponentOf,
  placeMinion,
  resumeDiscover,
  runEffects,
} from './effects'
import {
  checkDeaths,
  fireTrigger,
  isLegalAttackTarget,
  isLegalHeroAttackTarget,
  resolveAttack,
  resolveHeroAttack,
} from './combat'
import { getLiveCost } from './queries'

/* ----------------------------------------------------------------------------
 * Initial state construction
 * ------------------------------------------------------------------------- */

/** Build a fresh PlayerState from a PlayerSetup, resolving deck card ids. */
function buildPlayer(id: PlayerId, setup: PlayerSetup, rng: GameState['rng']): PlayerState {
  const hero: HeroState = { ...setup.hero }
  const deck: CardInstance[] = setup.deckCardIds.map((cardId) => makeCardInstance(cardId))
  shuffle(rng, deck)

  // Attach passive treasures.
  const passives = setup.passiveTreasureIds.map((treasureId) => {
    const t = lookupTreasure(treasureId)
    return {
      treasureId,
      auras: t?.auras ?? [],
      triggers: t?.triggers ?? [],
    }
  })

  const hp = hasHeroPower(setup.heroPowerId)
    ? getHeroPower(setup.heroPowerId)
    : { id: setup.heroPowerId, cost: 2 }

  return {
    id,
    hero,
    mana: { current: 0, max: 0 },
    hand: [],
    deck,
    board: [],
    graveyard: [],
    heroPower: { id: setup.heroPowerId, cost: hp.cost, usedThisTurn: false },
    fatigue: 0,
    passives,
    spellDamage: 0,
    isAI: setup.isAI,
  }
}

/** Optional treasure lookup: passive treasure metadata may not be registered in pure tests. */
let TREASURE_DB: Record<string, TreasureDef> = {}

/**
 * Register passive treasure definitions so the engine can attach their auras /
 * triggers / startOfGame effects. Optional — tests that need them call this.
 * @param treasures - treasure definitions to register
 */
export function registerTreasures(treasures: TreasureDef[]): void {
  for (const t of treasures) TREASURE_DB[t.id] = t
}

/** Reset the treasure registry (test isolation). */
export function clearTreasures(): void {
  TREASURE_DB = {}
}

function lookupTreasure(id: string): TreasureDef | undefined {
  return TREASURE_DB[id]
}

/**
 * Create the initial GameState for a match.
 * Builds both players, shuffles decks, draws opening hands (3 / 4 + Coin to the
 * second player), attaches passives and runs startOfGame treasure effects.
 * Leaves the game in the 'mulligan' phase awaiting startGame/mulligan actions.
 * @param setup - the game setup
 * @param seed - RNG seed
 * @returns the initial game state
 */
export function createInitialState(setup: GameSetup, seed: number): GameState {
  const rng = { seed: seed >>> 0 }
  const p0 = buildPlayer(0, setup.players[0], rng)
  const p1 = buildPlayer(1, setup.players[1], rng)

  const state: GameState = {
    turn: 0,
    activePlayer: setup.firstPlayer,
    players: [p0, p1],
    rng,
    phase: 'mulligan',
    log: [],
  }

  const events: GameEvent[] = []
  events.push({ type: 'gameStarted' })

  // Opening hands: first player draws 3, second draws 4 + Coin.
  const second = opponentOf(setup.firstPlayer)
  for (let i = 0; i < 3; i++) drawCard(state, setup.firstPlayer, events)
  for (let i = 0; i < 4; i++) drawCard(state, second, events)
  if (hasCard('the_coin')) {
    state.players[second].hand.push(makeCardInstance('the_coin'))
  }

  // startOfGame treasure effects + passive auras.
  for (const p of [0, 1] as PlayerId[]) {
    for (const passive of state.players[p].passives) {
      const t = lookupTreasure(passive.treasureId)
      if (t?.startOfGame) {
        runEffects(t.startOfGame, { state, sourcePlayer: p }, events)
      }
    }
  }

  recomputeAuras(state)
  state.log.push(...events)
  return state
}

/* ----------------------------------------------------------------------------
 * Win / loss
 * ------------------------------------------------------------------------- */

/** Detect win/loss and set phase/winner. Returns true if the game ended. */
export function checkGameOver(state: GameState, events: GameEvent[]): boolean {
  if (state.phase === 'gameOver') return true
  const dead0 = state.players[0].hero.health <= 0
  const dead1 = state.players[1].hero.health <= 0
  if (!dead0 && !dead1) return false
  state.phase = 'gameOver'
  if (dead0 && dead1) state.winner = 'draw'
  else if (dead0) state.winner = 1
  else state.winner = 0
  events.push({ type: 'gameOver', winner: state.winner })
  return true
}

/* ----------------------------------------------------------------------------
 * Turn flow
 * ------------------------------------------------------------------------- */

/** Begin a player's turn (rule 1 in EFFECTSPEC). */
function startTurn(state: GameState, player: PlayerId, events: GameEvent[]): void {
  const p = state.players[player]
  // Gain a mana crystal (cap 10), refill to max.
  p.mana.max = Math.min(MAX_MANA, p.mana.max + 1)
  p.mana.current = p.mana.max
  events.push({ type: 'manaChanged', player })

  // Untap minions.
  for (const m of p.board) {
    m.attacksThisTurn = 0
    m.summonedThisTurn = false
  }
  p.hero.attacksThisTurn = 0

  // Reset hero power.
  p.heroPower.usedThisTurn = false

  // Reset the first-spell-each-turn counter.
  const internalStart = asInternal(state)
  internalStart._spellsCastThisTurn = internalStart._spellsCastThisTurn ?? [0, 0]
  internalStart._spellsCastThisTurn[player] = 0

  state.turn += 1
  events.push({ type: 'turnStarted', player, turn: state.turn })

  // Draw for turn.
  drawCard(state, player, events)

  // Fire startOfTurn triggers (board minions + passives + weapon).
  fireBoardTriggers(state, player, 'startOfTurn', events)
  firePassiveTriggers(state, player, 'startOfTurn', events)
  fireWeaponTriggers(state, player, 'startOfTurn', events)

  recomputeAuras(state)
  checkDeaths(state, events)
  checkGameOver(state, events)
}

/** End the current player's turn: clear temp buffs, fire endOfTurn, swap. */
function endTurn(state: GameState, player: PlayerId, events: GameEvent[]): void {
  events.push({ type: 'turnEnded', player })

  // Fire endOfTurn triggers.
  fireBoardTriggers(state, player, 'endOfTurn', events)
  firePassiveTriggers(state, player, 'endOfTurn', events)
  fireWeaponTriggers(state, player, 'endOfTurn', events)

  // Revert temporary buffs for this player.
  clearTempBuffs(state, player)
  const internal = asInternal(state)
  if (internal._heroSpellDamageThisTurn) internal._heroSpellDamageThisTurn[player] = 0

  recomputeAuras(state)
  checkDeaths(state, events)
  if (checkGameOver(state, events)) return

  // Pass turn.
  state.activePlayer = opponentOf(player)
  startTurn(state, state.activePlayer, events)
}

/** Revert temp buffs (this-turn attack) for a player. */
function clearTempBuffs(state: GameState, player: PlayerId): void {
  const internal = asInternal(state)
  const buffs = internal._tempBuffs
  if (!buffs) return
  const remaining: typeof buffs = []
  for (const b of buffs) {
    if (b.kind === 'heroAtk') {
      if (b.player === player) state.players[player].hero.attack -= b.amount
      else remaining.push(b)
    } else {
      // minionAtk — revert if the minion belongs to the player.
      const owned = state.players[player].board.find((m) => m.instanceId === b.instanceId)
      if (owned) owned.attack -= b.amount
      else if (
        state.players[opponentOf(player)].board.some((m) => m.instanceId === b.instanceId)
      ) {
        remaining.push(b)
      }
      // If the minion is dead/gone, drop the buff silently.
    }
  }
  internal._tempBuffs = remaining
}

/** Fire a triggered event on all of a player's board minions. */
function fireBoardTriggers(
  state: GameState,
  player: PlayerId,
  event: TriggerDef['event'],
  events: GameEvent[],
  playedCardId?: string,
  triggerSourceId?: string
): void {
  for (const m of [...state.players[player].board]) {
    if (m.silenced || !m.hasTriggers) continue
    const def = hasCard(m.cardId) ? getCard(m.cardId) : undefined
    if (!def?.triggers) continue
    for (const trig of def.triggers) {
      if (trig.event === event) {
        fireTrigger(state, trig, player, m.instanceId, triggerSourceId ?? m.instanceId, events, playedCardId)
      }
    }
  }
}

/** Fire a triggered event on a player's passive treasures. */
function firePassiveTriggers(
  state: GameState,
  player: PlayerId,
  event: TriggerDef['event'],
  events: GameEvent[],
  playedCardId?: string,
  triggerSourceId?: string
): void {
  for (const passive of state.players[player].passives) {
    for (const trig of passive.triggers) {
      if (trig.event === event) {
        fireTrigger(state, trig, player, undefined, triggerSourceId, events, playedCardId)
      }
    }
  }
}

/** Fire a triggered event on a player's equipped weapon (e.g. Herding Horn). */
function fireWeaponTriggers(
  state: GameState,
  player: PlayerId,
  event: TriggerDef['event'],
  events: GameEvent[],
  playedCardId?: string,
  triggerSourceId?: string
): void {
  const w = state.players[player].weapon
  if (!w) return
  const def = hasCard(w.cardId) ? getCard(w.cardId) : undefined
  if (!def?.triggers) return
  for (const trig of def.triggers) {
    if (trig.event === event) {
      fireTrigger(state, trig, player, w.instanceId, triggerSourceId ?? w.instanceId, events, playedCardId)
    }
  }
}

/**
 * Fire play-related triggers (onPlayCard/onPlayMinion/etc.) for a card.
 * For minions, playedInstanceId is the placed minion so trigger effects can
 * target it via 'triggerSource' (e.g. "After you play a minion, give IT ...").
 */
function firePlayTriggers(
  state: GameState,
  player: PlayerId,
  playedDef: CardDef,
  events: GameEvent[],
  playedInstanceId?: string
): void {
  const eventsToFire: TriggerDef['event'][] = ['onPlayCard']
  if (playedDef.type === 'minion') {
    eventsToFire.push('onPlayMinion')
    if (playedDef.tribe === 'beast') eventsToFire.push('onPlayBeast')
  }
  if (playedDef.type === 'spell') {
    eventsToFire.push('onPlaySpell')
    if (playedDef.cost >= 4) eventsToFire.push('onSpellCast4Plus')
  }
  if (playedDef.cost >= 5) eventsToFire.push('onCardCost5Plus')

  for (const ev of eventsToFire) {
    fireBoardTriggers(state, player, ev, events, playedDef.id, playedInstanceId)
    firePassiveTriggers(state, player, ev, events, playedDef.id, playedInstanceId)
    fireWeaponTriggers(state, player, ev, events, playedDef.id, playedInstanceId)
  }
}

/* ----------------------------------------------------------------------------
 * applyAction
 * ------------------------------------------------------------------------- */

/**
 * The single mutator for the game. Clones the input state, applies the action,
 * and returns the new state plus the events emitted.
 * @param state - current state (treated as immutable input)
 * @param action - the action to apply
 * @returns { state, events }
 */
export const applyAction: ApplyAction = (state, action): ApplyResult => {
  const next = cloneState(state)
  const events: GameEvent[] = []

  switch (action.type) {
    case 'startGame': {
      const fresh = createInitialState(action.setup, action.seed)
      fresh.phase = 'main'
      // Begin first player's turn.
      startTurn(fresh, fresh.activePlayer, fresh.log)
      return { state: fresh, events: fresh.log.slice() }
    }
    case 'mulligan': {
      handleMulligan(next, action.player, action.keepInstanceIds, events)
      break
    }
    case 'playCard': {
      handlePlayCard(next, action, events)
      break
    }
    case 'attack': {
      handleAttack(next, action, events)
      break
    }
    case 'useHeroPower': {
      handleHeroPower(next, action, events)
      break
    }
    case 'endTurn': {
      if (next.phase === 'main' && next.activePlayer === action.player && !next.pendingChoice) {
        endTurn(next, action.player, events)
      }
      break
    }
    case 'resolveChoice': {
      handleResolveChoice(next, action, events)
      break
    }
    case 'concede': {
      next.phase = 'gameOver'
      next.winner = opponentOf(action.player)
      events.push({ type: 'gameOver', winner: next.winner })
      break
    }
    default: {
      const _exhaustive: never = action
      throw new Error('Unhandled action: ' + JSON.stringify(_exhaustive))
    }
  }

  next.log.push(...events)
  return { state: next, events }
}

/* ----------------------------------------------------------------------------
 * Action handlers
 * ------------------------------------------------------------------------- */

/** Find a board minion across both players (hero sentinels return undefined). */
function findTargetMinion(state: GameState, instanceId: string) {
  for (const p of [0, 1] as PlayerId[]) {
    const m = state.players[p].board.find((x) => x.instanceId === instanceId)
    if (m) return m
  }
  return undefined
}

/**
 * Whether a targeted hero power actually consumes its chosen target for the
 * given chooseOne pick — chooseOne options that resolve without a target
 * (e.g. Shadowform's "deal 1 damage to all enemies") stay playable untargeted.
 */
function heroPowerNeedsTarget(
  hp: ReturnType<typeof getHeroPower>,
  chooseOneIndex: number | undefined
): boolean {
  if (hp.scriptId) return true
  const effects =
    hp.chooseOne && chooseOneIndex !== undefined
      ? hp.chooseOne[chooseOneIndex]?.effects ?? []
      : hp.effects ?? []
  return effects.some((e) => 'target' in e && e.target === 'chosenTarget')
}

function handleMulligan(
  state: GameState,
  player: PlayerId,
  keepInstanceIds: string[],
  events: GameEvent[]
): void {
  if (state.phase !== 'mulligan') return
  const p = state.players[player]
  const toReplace = p.hand.filter((c) => !keepInstanceIds.includes(c.instanceId))
  const kept = p.hand.filter((c) => keepInstanceIds.includes(c.instanceId))
  // Put replaced cards back, shuffle, draw the same number, then shuffle replaced in.
  p.hand = kept
  for (let i = 0; i < toReplace.length; i++) drawCard(state, player, events)
  for (const c of toReplace) p.deck.push(c)
  shuffle(state.rng, p.deck)

  // When both players have mulliganed (simplified: any mulligan begins the game),
  // move to main and start the first turn.
  if (state.phase === 'mulligan') {
    state.phase = 'main'
    startTurn(state, state.activePlayer, events)
  }
}

function handlePlayCard(
  state: GameState,
  action: Extract<Action, { type: 'playCard' }>,
  events: GameEvent[]
): void {
  if (state.phase !== 'main' || state.activePlayer !== action.player || state.pendingChoice) return
  const p = state.players[action.player]
  const idx = p.hand.findIndex((c) => c.instanceId === action.instanceId)
  if (idx < 0) return
  const inst = p.hand[idx]
  const def = getCard(inst.cardId)

  const cost = getLiveCost(state, action.player, inst)
  if (p.mana.current < cost) return

  // Attack-capped targeting (Shadow Word: Pain): reject a target whose CURRENT
  // attack — buffs and auras included — exceeds the cap. Heroes are never legal.
  if (def.targeted && def.targetMaxAttack !== undefined && action.targetId) {
    const f = findTargetMinion(state, action.targetId)
    if (!f || f.attack > def.targetMaxAttack) return
  }

  // Pay & remove from hand.
  p.mana.current -= cost
  p.hand.splice(idx, 1)
  events.push({ type: 'cardPlayed', player: action.player, instanceId: inst.instanceId, cardId: inst.cardId })

  const chooseOneIndex = action.chooseOneIndex ?? inst.chooseOneIndex

  let playedInstanceId: string | undefined
  if (def.type === 'minion') {
    playedInstanceId = playMinion(state, action.player, def, action, chooseOneIndex, events)
  } else if (def.type === 'spell') {
    playSpell(state, action.player, def, action, chooseOneIndex, events)
  } else if (def.type === 'weapon') {
    equipWeaponForPlayer(state, action.player, def.id)
    // Weapons can have a Battlecry (e.g. Coghammer's Divine Shield). Run it on
    // equip, honouring the battlecry triggerTwice multiplier.
    const ctx: EffectContext = {
      state,
      sourcePlayer: action.player,
      chosenTargetId: action.targetId,
    }
    if (def.battlecry) {
      const times = effectMultiplier(state, action.player, 'battlecry')
      for (let i = 0; i < times; i++) {
        const { paused } = runEffects(def.battlecry, ctx, events)
        if (paused) break
      }
    }
    if (def.scriptId) runEffects([{ kind: 'script', id: def.scriptId }], ctx, events)
  }

  // Play triggers fire after the card resolves.
  firePlayTriggers(state, action.player, def, events, playedInstanceId)

  recomputeAuras(state)
  checkDeaths(state, events)
  checkGameOver(state, events)
}

/** @returns the placed minion's instanceId (undefined if the board was full). */
function playMinion(
  state: GameState,
  player: PlayerId,
  def: CardDef,
  action: Extract<Action, { type: 'playCard' }>,
  chooseOneIndex: number | undefined,
  events: GameEvent[]
): string | undefined {
  let overrides: { attack?: number; health?: number; keywords?: Keyword[] } | undefined
  let battlecry = def.battlecry
  if (def.chooseOne && chooseOneIndex !== undefined) {
    const opt = def.chooseOne[chooseOneIndex]
    if (opt) {
      if (opt.stats || opt.keywords) {
        overrides = {
          attack: opt.stats?.attack,
          health: opt.stats?.health,
          keywords: opt.keywords,
        }
      }
      if (opt.effects) battlecry = opt.effects
    }
  }
  const minion = makeMinion(def, overrides)
  if (!placeMinion(state, player, minion, action.position, events)) return undefined

  recomputeAuras(state)

  // Battlecry — fired once per triggerTwice multiplier (same chosen target).
  // If a run pauses on a discover, the extra runs are skipped: doubling a
  // pending choice would corrupt the continuation.
  if (battlecry) {
    const ctx: EffectContext = {
      state,
      sourcePlayer: player,
      sourceInstanceId: minion.instanceId,
      chosenTargetId: action.targetId,
    }
    const times = effectMultiplier(state, player, 'battlecry')
    for (let i = 0; i < times; i++) {
      const { paused } = runEffects(battlecry, ctx, events)
      if (paused) break
    }
  }
  if (def.scriptId) {
    const ctx: EffectContext = {
      state,
      sourcePlayer: player,
      sourceInstanceId: minion.instanceId,
      chosenTargetId: action.targetId,
    }
    runEffects([{ kind: 'script', id: def.scriptId }], ctx, events)
  }
  return minion.instanceId
}

function playSpell(
  state: GameState,
  player: PlayerId,
  def: CardDef,
  action: Extract<Action, { type: 'playCard' }>,
  chooseOneIndex: number | undefined,
  events: GameEvent[]
): void {
  const internal = asInternal(state)
  internal._spellsCastThisTurn = internal._spellsCastThisTurn ?? [0, 0]
  internal._spellsCastThisTurn[player] += 1
  const isFirstThisTurn = internal._spellsCastThisTurn[player] === 1

  const ctx: EffectContext = {
    state,
    sourcePlayer: player,
    chosenTargetId: action.targetId,
    isSpellSource: true,
  }
  const castOnce = (): boolean => {
    if (def.chooseOne && chooseOneIndex !== undefined) {
      const opt = def.chooseOne[chooseOneIndex] as ChooseOneOption | undefined
      return opt ? applyChooseOneSpell(opt, ctx, events).paused : false
    } else if (def.spell) {
      return runEffects(def.spell, ctx, events).paused
    } else if (def.scriptId) {
      return runEffects([{ kind: 'script', id: def.scriptId }], ctx, events).paused
    }
    return false
  }

  const paused = castOnce()

  // firstSpellEachTurnTwice: the first spell each turn is cast again with the
  // same chosen target/option. The recast neither recurses nor doubles a
  // pending discover (skip when the first cast paused).
  if (isFirstThisTurn && !paused && hasFirstSpellTwice(state, player)) {
    castOnce()
  }
}

function handleAttack(
  state: GameState,
  action: Extract<Action, { type: 'attack' }>,
  events: GameEvent[]
): void {
  if (state.phase !== 'main' || state.activePlayer !== action.player || state.pendingChoice) return
  const p = state.players[action.player]

  // Hero attack (with an equipped weapon, or a temporary attack buff).
  if (action.attackerId === HERO_TARGET(action.player)) {
    if (p.hero.attack <= 0 || p.hero.attacksThisTurn >= 1) return
    if (!isLegalHeroAttackTarget(state, action.player, action.targetId)) return
    resolveHeroAttack(state, action.player, action.targetId, events)
    fireBoardTriggers(state, action.player, 'afterAttack', events)
    fireWeaponTriggers(state, action.player, 'afterAttack', events)
    firePassiveTriggers(state, action.player, 'afterAttack', events)
    recomputeAuras(state)
    // Trigger effects (weapon splash etc.) can deal lethal damage.
    checkDeaths(state, events)
    checkGameOver(state, events)
    return
  }

  const attacker = p.board.find((m) => m.instanceId === action.attackerId)
  if (!attacker) return
  // Validate via keyword + taunt rules.
  if (attacker.attack <= 0) return
  if (attacker.attacksThisTurn >= attacker.maxAttacks) return
  if (attacker.summonedThisTurn && !hasKeyword(attacker, 'charge') && !hasKeyword(attacker, 'rush')) {
    return
  }
  // Legal target? (taunt, stealth and rush rules — shared with the UI queries)
  if (!isLegalAttackTarget(state, action.player, action.targetId, attacker)) return

  resolveAttack(state, action.attackerId, action.targetId, events)
  fireBoardTriggers(state, action.player, 'afterAttack', events)
  recomputeAuras(state)
  // Trigger effects can deal lethal damage.
  checkDeaths(state, events)
  checkGameOver(state, events)
}

function handleHeroPower(
  state: GameState,
  action: Extract<Action, { type: 'useHeroPower' }>,
  events: GameEvent[]
): void {
  if (state.phase !== 'main' || state.activePlayer !== action.player || state.pendingChoice) return
  const p = state.players[action.player]
  if (p.heroPower.usedThisTurn) return
  if (p.mana.current < p.heroPower.cost) return
  if (!hasHeroPower(p.heroPower.id)) return
  const hp = getHeroPower(p.heroPower.id)

  // A targeted power whose resolution consumes the chosen target must have one
  // — without this guard a target-less use (e.g. Execute Strike via a bad
  // dispatch, or the AI) burns the mana and does nothing.
  if (hp.targeted && !action.targetId && heroPowerNeedsTarget(hp, action.chooseOneIndex)) return

  p.mana.current -= p.heroPower.cost
  p.heroPower.usedThisTurn = true
  events.push({ type: 'heroPowerUsed', player: action.player })
  events.push({ type: 'manaChanged', player: action.player })

  const ctx: EffectContext = {
    state,
    sourcePlayer: action.player,
    chosenTargetId: action.targetId,
    isSpellSource: true,
  }
  if (hp.chooseOne && action.chooseOneIndex !== undefined) {
    const opt = hp.chooseOne[action.chooseOneIndex]
    if (opt?.effects) runEffects(opt.effects, ctx, events)
  } else if (hp.effects) {
    runEffects(hp.effects, ctx, events)
  } else if (hp.scriptId) {
    runEffects([{ kind: 'script', id: hp.scriptId }], ctx, events)
  }

  fireBoardTriggers(state, action.player, 'onHeroPowerUsed', events)
  firePassiveTriggers(state, action.player, 'onHeroPowerUsed', events)
  fireWeaponTriggers(state, action.player, 'onHeroPowerUsed', events)
  recomputeAuras(state)
  checkDeaths(state, events)
  checkGameOver(state, events)
}

function handleResolveChoice(
  state: GameState,
  action: Extract<Action, { type: 'resolveChoice' }>,
  events: GameEvent[]
): void {
  if (!state.pendingChoice) return
  if (state.pendingChoice.type === 'discover') {
    resumeDiscover(state, action.pick.cardId, events)
  } else {
    state.pendingChoice = undefined
  }
  recomputeAuras(state)
  checkDeaths(state, events)
  checkGameOver(state, events)
}

/* ----------------------------------------------------------------------------
 * State cloning (deterministic deep clone for the immutable reducer)
 * ------------------------------------------------------------------------- */

/** Deep-clone the game state so applyAction never mutates its input. */
function cloneState(state: GameState): GameState {
  return structuredClone(state) as GameState
}

export { recomputeAuras }
