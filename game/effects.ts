import type {
  CardDef,
  ChooseOneOption,
  EffectSpec,
  GameEvent,
  GameState,
  Keyword,
  MinionInstance,
  PlayerId,
  PlayerState,
  ScriptId,
  TargetSelector,
} from './types'
import { HERO_TARGET, MAX_BOARD, MAX_HAND, MAX_MANA } from './types'
import type { PoolClassLock } from './cardDb'
import { getCard, getPool, hasCard } from './cardDb'
import { nextInt, pick, shuffle } from './rng'
import { grantKeyword, hasKeyword } from './keywords'
import { asInternal, asInternalMinion } from './internal'

/* ----------------------------------------------------------------------------
 * Resolution context & shared instance counter
 * ------------------------------------------------------------------------- */

/** Context threaded through effect interpretation. */
export interface EffectContext {
  state: GameState
  sourcePlayer: PlayerId
  /** Minion instance id that is the source (battlecry/deathrattle self, etc.). */
  sourceInstanceId?: string
  /** The target the player picked when playing a targeted card. */
  chosenTargetId?: string
  /** The entity that fired the trigger (e.g. the dead minion id). */
  triggerSourceId?: string
  /** True when the effect source is a spell or hero power (spell damage applies). */
  isSpellSource?: boolean
  /** The card id of the card being played (for trigger conditions / scripts). */
  playedCardId?: string
}

let INSTANCE_COUNTER = 1

/**
 * Generate a unique instance id. Deterministic across a single process run; the
 * RNG owns game randomness, this only needs uniqueness.
 * @returns a fresh instance id string
 */
export function newInstanceId(): string {
  return 'i' + (INSTANCE_COUNTER++).toString(36)
}

/**
 * Equip a weapon for a player: replaces any existing weapon and grants the hero
 * the weapon's Attack so the hero can attack with it. (Hero attack also includes
 * any temporary this-turn buffs, which are tracked separately.)
 * @param state - game state
 * @param player - the equipping player
 * @param cardId - the weapon card id
 */
export function equipWeaponForPlayer(state: GameState, player: PlayerId, cardId: string): void {
  const def = getCard(cardId)
  const p = state.players[player]
  if (p.weapon) {
    p.hero.attack -= p.weapon.attack
    if (p.hero.attack < 0) p.hero.attack = 0
  }
  p.weapon = {
    instanceId: newInstanceId(),
    cardId: def.id,
    attack: def.attack ?? 0,
    durability: def.durability ?? 0,
  }
  p.hero.attack += def.attack ?? 0
}

/** Reset the instance counter (test isolation only). */
export function resetInstanceCounter(): void {
  INSTANCE_COUNTER = 1
}

/* ----------------------------------------------------------------------------
 * Player / entity lookups
 * ------------------------------------------------------------------------- */

/** The opponent of a player id. */
export function opponentOf(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0
}

/** Get a PlayerState by id. */
export function playerOf(state: GameState, id: PlayerId): PlayerState {
  return state.players[id]
}

/** Find the owning player id of a board minion by instance id. */
export function findMinionOwner(state: GameState, instanceId: string): PlayerId | undefined {
  for (const p of [0, 1] as PlayerId[]) {
    if (state.players[p].board.some((m) => m.instanceId === instanceId)) return p
  }
  return undefined
}

/** Find a board minion (and its owner) by instance id. */
export function findMinion(
  state: GameState,
  instanceId: string
): { minion: MinionInstance; owner: PlayerId } | undefined {
  for (const p of [0, 1] as PlayerId[]) {
    const minion = state.players[p].board.find((m) => m.instanceId === instanceId)
    if (minion) return { minion, owner: p }
  }
  return undefined
}

/** Is a target id a hero sentinel? Returns the player or undefined. */
export function heroTargetPlayer(targetId: string): PlayerId | undefined {
  if (targetId === HERO_TARGET(0)) return 0
  if (targetId === HERO_TARGET(1)) return 1
  return undefined
}

/* ----------------------------------------------------------------------------
 * Target resolution
 * ------------------------------------------------------------------------- */

/** A resolved combat/effect entity: either a minion or a hero. */
export type Entity =
  | { kind: 'minion'; minion: MinionInstance; owner: PlayerId }
  | { kind: 'hero'; player: PlayerId }

/**
 * Resolve a TargetSelector to concrete entities given the effect context.
 * @param state - the game state
 * @param ctx - the effect context
 * @param selector - the target selector to resolve
 * @returns the list of entities the effect applies to
 */
export function resolveTargets(
  state: GameState,
  ctx: EffectContext,
  selector: TargetSelector
): Entity[] {
  const me = ctx.sourcePlayer
  const foe = opponentOf(me)
  const minionEntity = (m: MinionInstance, owner: PlayerId): Entity => ({
    kind: 'minion',
    minion: m,
    owner,
  })
  const friendlyMinions = (): Entity[] =>
    state.players[me].board.map((m) => minionEntity(m, me))
  const enemyMinions = (): Entity[] =>
    state.players[foe].board.map((m) => minionEntity(m, foe))

  switch (selector) {
    case 'none':
      return []
    case 'self': {
      if (!ctx.sourceInstanceId) return []
      const f = findMinion(state, ctx.sourceInstanceId)
      return f ? [minionEntity(f.minion, f.owner)] : []
    }
    case 'triggerSource': {
      const id = ctx.triggerSourceId
      if (!id) return []
      const hero = heroTargetPlayer(id)
      if (hero !== undefined) return [{ kind: 'hero', player: hero }]
      const f = findMinion(state, id)
      return f ? [minionEntity(f.minion, f.owner)] : []
    }
    case 'chosenTarget': {
      const id = ctx.chosenTargetId
      if (!id) return []
      const hero = heroTargetPlayer(id)
      if (hero !== undefined) return [{ kind: 'hero', player: hero }]
      const f = findMinion(state, id)
      return f ? [minionEntity(f.minion, f.owner)] : []
    }
    case 'friendlyHero':
      return [{ kind: 'hero', player: me }]
    case 'enemyHero':
      return [{ kind: 'hero', player: foe }]
    case 'friendlyMinions':
      return friendlyMinions()
    case 'enemyMinions':
      return enemyMinions()
    case 'otherFriendlyMinions':
      return state.players[me].board
        .filter((m) => m.instanceId !== ctx.sourceInstanceId)
        .map((m) => minionEntity(m, me))
    case 'allMinions':
      return [...friendlyMinions(), ...enemyMinions()]
    case 'allFriendlyCharacters':
      return [{ kind: 'hero', player: me }, ...friendlyMinions()]
    case 'allEnemyCharacters':
      return [{ kind: 'hero', player: foe }, ...enemyMinions()]
    case 'allCharacters':
      return [
        { kind: 'hero', player: me },
        { kind: 'hero', player: foe },
        ...friendlyMinions(),
        ...enemyMinions(),
      ]
    case 'otherEnemies': {
      // Enemy characters except the chosen target (Swipe splash).
      const all: Entity[] = [{ kind: 'hero', player: foe }, ...enemyMinions()]
      const chosen = ctx.chosenTargetId
      return all.filter((e) => {
        if (chosen === undefined) return true
        if (e.kind === 'hero') return HERO_TARGET(e.player) !== chosen
        return e.minion.instanceId !== chosen
      })
    }
    case 'randomEnemyMinion': {
      const m = pick(state.rng, state.players[foe].board)
      return m ? [minionEntity(m, foe)] : []
    }
    case 'randomFriendlyMinion': {
      const m = pick(state.rng, state.players[me].board)
      return m ? [minionEntity(m, me)] : []
    }
    case 'randomEnemy': {
      const all: Entity[] = [{ kind: 'hero', player: foe }, ...enemyMinions()]
      const e = pick(state.rng, all)
      return e ? [e] : []
    }
    default:
      return []
  }
}

/* ----------------------------------------------------------------------------
 * Low-level mutators (damage / heal) — used by effects & combat
 * ------------------------------------------------------------------------- */

/**
 * Apply damage to an entity, honouring divine shield. Emits events.
 * Lethal marking is left to death resolution (checkDeaths).
 * @param state - game state
 * @param entity - the entity to damage
 * @param amount - damage amount (<=0 is a no-op)
 * @param events - event sink
 */
export function dealDamageToEntity(
  state: GameState,
  entity: Entity,
  amount: number,
  events: GameEvent[]
): void {
  if (amount <= 0) return
  if (entity.kind === 'hero') {
    const hero = state.players[entity.player].hero
    let remaining = amount
    if (hero.armor > 0) {
      const absorbed = Math.min(hero.armor, remaining)
      hero.armor -= absorbed
      remaining -= absorbed
      events.push({ type: 'armorChanged', player: entity.player, amount: -absorbed })
    }
    hero.health -= remaining
    events.push({ type: 'damage', targetId: HERO_TARGET(entity.player), amount })
  } else {
    const m = entity.minion
    if (m.divineShield) {
      m.divineShield = false
      m.keywords = m.keywords.filter((k) => k !== 'divineShield')
      events.push({ type: 'damage', targetId: m.instanceId, amount: 0 })
      return
    }
    m.health -= amount
    events.push({ type: 'damage', targetId: m.instanceId, amount })
    // Queue for onSelfDamaged / onFriendlyMinionDamaged / onMinionDamaged
    // triggers; checkDeaths flushes the queue before processing deaths so a
    // minion dealt lethal damage still fires (Imp Gang Boss summons on death-blow).
    const internal = asInternal(state)
    internal._damagedMinions = internal._damagedMinions ?? []
    internal._damagedMinions.push({ instanceId: m.instanceId, owner: entity.owner })
  }
}

/**
 * Heal an entity up to its maximum health.
 * @param state - game state
 * @param entity - the entity to heal
 * @param amount - heal amount
 * @param events - event sink
 */
export function healEntity(
  state: GameState,
  entity: Entity,
  amount: number,
  events: GameEvent[]
): void {
  if (amount <= 0) return
  if (entity.kind === 'hero') {
    const hero = state.players[entity.player].hero
    const before = hero.health
    hero.health = Math.min(hero.maxHealth, hero.health + amount)
    if (hero.health !== before) {
      events.push({ type: 'heal', targetId: HERO_TARGET(entity.player), amount: hero.health - before })
    }
  } else {
    const m = entity.minion
    const before = m.health
    m.health = Math.min(m.maxHealth, m.health + amount)
    if (m.health !== before) {
      events.push({ type: 'heal', targetId: m.instanceId, amount: m.health - before })
    }
  }
}

/* ----------------------------------------------------------------------------
 * Card / hand / deck helpers
 * ------------------------------------------------------------------------- */

/** Build a CardInstance for a card id, snapshotting cost. */
export function makeCardInstance(cardId: string, costReduction = 0) {
  const def = getCard(cardId)
  return {
    instanceId: newInstanceId(),
    cardId,
    cost: def.cost,
    ...(costReduction ? { costReduction } : {}),
  }
}

/**
 * Add a card instance to a player's hand, burning it if the hand is full.
 * @param player - the player state
 * @param cardId - card to add
 * @param costReduction - optional sticky cost reduction
 * @param events - event sink (unused for adds; UI derives from state)
 * @returns true if added, false if burned
 */
export function addCardToHand(player: PlayerState, cardId: string, costReduction = 0): boolean {
  if (player.hand.length >= MAX_HAND) return false
  player.hand.push(makeCardInstance(cardId, costReduction))
  return true
}

/**
 * Draw a single card for a player; handles fatigue and overdraw burn.
 * @param state - game state
 * @param player - the drawing player id
 * @param events - event sink
 */
export function drawCard(state: GameState, player: PlayerId, events: GameEvent[]): void {
  const p = state.players[player]
  if (p.deck.length === 0) {
    // Fatigue: escalating damage to hero.
    p.fatigue += 1
    const hero = p.hero
    let remaining = p.fatigue
    if (hero.armor > 0) {
      const absorbed = Math.min(hero.armor, remaining)
      hero.armor -= absorbed
      remaining -= absorbed
      events.push({ type: 'armorChanged', player, amount: -absorbed })
    }
    hero.health -= remaining
    events.push({ type: 'cardDrawn', player, instanceId: '', cardId: '', fatigue: true })
    events.push({ type: 'damage', targetId: HERO_TARGET(player), amount: p.fatigue })
    return
  }
  const card = p.deck.shift() as PlayerState['deck'][number]
  if (p.hand.length >= MAX_HAND) {
    // Overdraw — burn the card.
    p.graveyard.push(card)
    events.push({ type: 'cardDrawn', player, instanceId: card.instanceId, cardId: card.cardId })
    return
  }
  p.hand.push(card)
  events.push({ type: 'cardDrawn', player, instanceId: card.instanceId, cardId: card.cardId })
}

/* ----------------------------------------------------------------------------
 * Minion creation / summon
 * ------------------------------------------------------------------------- */

/**
 * Build a MinionInstance from a card definition, applying optional stat /
 * keyword overrides (for Choose One minions).
 * @param def - the card definition (must be a minion)
 * @param overrides - optional absolute stat & keyword overrides
 * @returns a fresh MinionInstance
 */
export function makeMinion(
  def: CardDef,
  overrides?: { attack?: number; health?: number; keywords?: Keyword[] }
): MinionInstance {
  const attack = overrides?.attack ?? def.attack ?? 0
  const health = overrides?.health ?? def.health ?? 1
  const baseKeywords = [...(def.keywords ?? [])]
  if (overrides?.keywords) {
    for (const k of overrides.keywords) if (!baseKeywords.includes(k)) baseKeywords.push(k)
  }
  const windfury = baseKeywords.includes('windfury')
  return {
    instanceId: newInstanceId(),
    cardId: def.id,
    attack,
    health,
    maxHealth: health,
    tribe: def.tribe ?? 'none',
    keywords: baseKeywords,
    divineShield: baseKeywords.includes('divineShield'),
    attacksThisTurn: 0,
    maxAttacks: windfury ? 2 : 1,
    summonedThisTurn: true,
    silenced: false,
    spellDamage: def.spellDamage ?? 0,
    hasTriggers: Array.isArray(def.triggers) && def.triggers.length > 0,
    hasAuras: Array.isArray(def.auras) && def.auras.length > 0,
  }
}

/**
 * Summon a minion onto a player's board (respecting the board cap).
 * @param state - game state
 * @param owner - the side to summon on
 * @param minion - the minion instance to place
 * @param position - optional board index
 * @param events - event sink
 * @returns true if summoned, false if the board was full
 */
export function placeMinion(
  state: GameState,
  owner: PlayerId,
  minion: MinionInstance,
  position: number | undefined,
  events: GameEvent[]
): boolean {
  const board = state.players[owner].board
  if (board.length >= MAX_BOARD) return false
  const pos = position === undefined ? board.length : Math.max(0, Math.min(position, board.length))
  board.splice(pos, 0, minion)
  events.push({
    type: 'minionSummoned',
    player: owner,
    instanceId: minion.instanceId,
    cardId: minion.cardId,
    position: pos,
  })
  return true
}

/* ----------------------------------------------------------------------------
 * Effect interpretation
 * ------------------------------------------------------------------------- */

/**
 * Resolve the generation class lock for a discover/addRandomCardToHand effect.
 * Default: locked to the receiving player's class + neutral. `fromClass: 'any'`
 * lifts the lock; `fromClass: '<class>'` locks to exactly that class (no neutral),
 * e.g. "Add 3 random Mage spells to your hand".
 */
function poolLockFor(
  state: GameState,
  player: PlayerId,
  fromClass: PoolClassLock['cardClass'] | 'any' | undefined
): PoolClassLock | undefined {
  if (fromClass === 'any') return undefined
  if (fromClass) return { cardClass: fromClass }
  return { cardClass: state.players[player].hero.cardClass, includeNeutral: true }
}

/** Live spell-damage bonus for a player's spell/hero-power casts. */
export function spellDamageBonus(state: GameState, player: PlayerId): number {
  const internal = asInternal(state)
  const turnBonus = internal._heroSpellDamageThisTurn?.[player] ?? 0
  return state.players[player].spellDamage + turnBonus
}

/**
 * Apply a sticky cost reduction to matching cards in a player's hand.
 */
function reduceCostInHand(
  player: PlayerState,
  amount: number,
  minCost: number | undefined,
  filter: string | undefined
): void {
  for (const inst of player.hand) {
    const def = hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
    if (!def) continue
    if (minCost !== undefined && def.cost < minCost) continue
    if (filter && filter !== 'all') {
      if (filter === 'spell' && def.type !== 'spell') continue
      if (filter === 'minion' && def.type !== 'minion') continue
      if (filter === 'beast' && !(def.type === 'minion' && def.tribe === 'beast')) continue
      if (filter === 'dragon' && !(def.type === 'minion' && def.tribe === 'dragon')) continue
      if (filter === 'taunt' && !(def.keywords ?? []).includes('taunt')) continue
      if (filter === 'battlecry' && !def.battlecry) continue
      if (filter === 'deathrattle' && !def.deathrattle) continue
      if (filter === 'costGte5' && def.cost < 5) continue
    }
    inst.costReduction = (inst.costReduction ?? 0) + amount
  }
}

/**
 * Silence a minion: strip keywords, buffs, triggers, auras and deathrattle,
 * resetting stats to the card's base (current health capped to new max).
 */
export function silenceMinion(minion: MinionInstance): void {
  const def = getCard(minion.cardId)
  minion.silenced = true
  minion.keywords = []
  minion.divineShield = false
  minion.spellDamage = 0
  minion.hasTriggers = false
  minion.hasAuras = false
  minion.maxAttacks = 1
  // Reset to base stats; health cannot exceed the reset max.
  const baseAtk = def.attack ?? 0
  const baseHealth = def.health ?? 1
  minion.attack = baseAtk
  minion.maxHealth = baseHealth
  if (minion.health > baseHealth) minion.health = baseHealth
  // The stat reset wiped any baked-in aura delta — clear the bookkeeping so the
  // next recompute doesn't revert it a second time (silenced minions neither
  // project nor receive auras).
  const im = asInternalMinion(minion)
  im._auraAtk = 0
  im._auraHealth = 0
  im._auraKeywords = []
}

/**
 * Interpret a list of EffectSpecs in order. Pure-ish: mutates `ctx.state` and
 * pushes GameEvents. If a `discover` effect is hit, sets `state.pendingChoice`,
 * stores the queued remainder for resumption, and stops processing.
 *
 * @param effects - the effects to run, in order
 * @param ctx - the resolution context
 * @param events - event sink
 * @returns object describing whether resolution paused on a choice
 */
export function runEffects(
  effects: EffectSpec[],
  ctx: EffectContext,
  events: GameEvent[]
): { paused: boolean } {
  for (let i = 0; i < effects.length; i++) {
    const eff = effects[i]
    if (eff.kind === 'discover') {
      startDiscover(eff, ctx, effects.slice(i + 1), events)
      return { paused: true }
    }
    applyEffect(eff, ctx, events)
  }
  return { paused: false }
}

/** Internal store of paused effect continuations, keyed on state identity. */
const PENDING_CONTINUATIONS = new WeakMap<
  GameState,
  { effects: EffectSpec[]; ctx: EffectContext; costReduction?: number }
>()

/** Begin a discover: set pendingChoice and stash the remaining effects. */
function startDiscover(
  eff: Extract<EffectSpec, { kind: 'discover' }>,
  ctx: EffectContext,
  remaining: EffectSpec[],
  events: GameEvent[]
): void {
  const candidates = getPool(eff.pool, poolLockFor(ctx.state, ctx.sourcePlayer, eff.fromClass))
  const chosen: CardDef[] = []
  const copy = [...candidates]
  shuffle(ctx.state.rng, copy)
  for (let i = 0; i < copy.length && chosen.length < 3; i++) chosen.push(copy[i])
  const choice = {
    type: 'discover' as const,
    player: ctx.sourcePlayer,
    sourceInstanceId: ctx.sourceInstanceId,
    options: chosen.map((c) => ({ cardId: c.id, text: c.name })),
  }
  ctx.state.pendingChoice = choice
  PENDING_CONTINUATIONS.set(ctx.state, {
    effects: remaining,
    ctx,
    costReduction: eff.costReduction,
  })
  events.push({ type: 'choiceRequired', choice })
}

/**
 * Resume a paused discover after the player picks a card. Adds the picked card
 * to hand (with cost reduction), clears the pending choice, and runs any queued
 * remaining effects.
 * @param state - the game state with a pending discover choice
 * @param pickedCardId - the chosen card id
 * @param events - event sink
 * @returns true if a continuation existed and was resumed
 */
export function resumeDiscover(
  state: GameState,
  pickedCardId: string | undefined,
  events: GameEvent[]
): boolean {
  const cont = PENDING_CONTINUATIONS.get(state)
  const choice = state.pendingChoice
  state.pendingChoice = undefined
  if (choice && pickedCardId) {
    addCardToHand(state.players[choice.player], pickedCardId, cont?.costReduction ?? 0)
  }
  if (cont) {
    PENDING_CONTINUATIONS.delete(state)
    runEffects(cont.effects, cont.ctx, events)
    return true
  }
  return false
}

/** Apply a single non-discover effect. */
function applyEffect(eff: EffectSpec, ctx: EffectContext, events: GameEvent[]): void {
  const state = ctx.state
  const me = ctx.sourcePlayer
  switch (eff.kind) {
    case 'damage': {
      const bonus = ctx.isSpellSource ? spellDamageBonus(state, me) : 0
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) dealDamageToEntity(state, t, eff.amount + bonus, events)
      break
    }
    case 'heal': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) healEntity(state, t, eff.amount, events)
      break
    }
    case 'draw': {
      const who = eff.who === 'opponent' ? opponentOf(me) : me
      for (let i = 0; i < eff.count; i++) drawCard(state, who, events)
      break
    }
    case 'addCardToHand': {
      const who = eff.who === 'opponent' ? opponentOf(me) : me
      const count = eff.count ?? 1
      for (let i = 0; i < count; i++) addCardToHand(state.players[who], eff.cardId)
      break
    }
    case 'addRandomCardToHand': {
      const pool = getPool(eff.pool, poolLockFor(state, me, eff.fromClass))
      const count = eff.count ?? 1
      for (let i = 0; i < count; i++) {
        const card = pick(state.rng, pool)
        if (card) addCardToHand(state.players[me], card.id, eff.costReduction ?? 0)
      }
      break
    }
    case 'gainCoin': {
      for (let i = 0; i < eff.count; i++) addCardToHand(state.players[me], 'the_coin')
      break
    }
    case 'shuffleIntoDeck': {
      const count = eff.count ?? 1
      const p = state.players[me]
      for (let i = 0; i < count; i++) {
        const inst = makeCardInstance(eff.cardId)
        const pos = nextInt(state.rng, p.deck.length + 1)
        p.deck.splice(pos, 0, inst)
      }
      break
    }
    case 'gainManaCrystal': {
      const p = state.players[me]
      const before = p.mana.max
      p.mana.max = Math.min(MAX_MANA, p.mana.max + eff.count)
      const gained = p.mana.max - before
      if (!eff.empty) p.mana.current = Math.min(p.mana.max, p.mana.current + gained)
      events.push({ type: 'manaChanged', player: me })
      break
    }
    case 'gainManaThisTurn': {
      const p = state.players[me]
      p.mana.current = Math.min(MAX_MANA, p.mana.current + eff.amount)
      events.push({ type: 'manaChanged', player: me })
      break
    }
    case 'refreshMana': {
      const p = state.players[me]
      p.mana.current = p.mana.max
      events.push({ type: 'manaChanged', player: me })
      break
    }
    case 'reduceCostInHand': {
      reduceCostInHand(state.players[me], eff.amount, eff.minCost, eff.filter)
      break
    }
    case 'summon': {
      const side = eff.side === 'enemy' ? opponentOf(me) : me
      for (let i = 0; i < eff.count; i++) {
        if (!hasCard(eff.token)) break
        const minion = makeMinion(getCard(eff.token))
        if (!placeMinion(state, side, minion, undefined, events)) break
      }
      break
    }
    case 'summonPerManaCrystal': {
      const p = state.players[me]
      const n = p.mana.max
      for (let i = 0; i < n; i++) {
        if (!hasCard(eff.token)) break
        const minion = makeMinion(getCard(eff.token))
        if (!placeMinion(state, me, minion, undefined, events)) break
      }
      break
    }
    case 'buff': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) {
        if (t.kind === 'minion') {
          t.minion.attack += eff.atk
          t.minion.maxHealth += eff.health
          t.minion.health += eff.health
        }
      }
      break
    }
    case 'buffThisTurn': {
      const internal = asInternal(state)
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) {
        if (t.kind === 'minion') {
          t.minion.attack += eff.atk
          internal._tempBuffs = internal._tempBuffs ?? []
          internal._tempBuffs.push({
            kind: 'minionAtk',
            instanceId: t.minion.instanceId,
            amount: eff.atk,
          })
        } else {
          const hero = state.players[t.player].hero
          hero.attack += eff.atk
          internal._tempBuffs = internal._tempBuffs ?? []
          internal._tempBuffs.push({ kind: 'heroAtk', player: t.player, amount: eff.atk })
        }
      }
      break
    }
    case 'giveKeyword': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) if (t.kind === 'minion') grantKeyword(t.minion, eff.keyword)
      break
    }
    case 'giveDivineShield': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) if (t.kind === 'minion') grantKeyword(t.minion, 'divineShield')
      break
    }
    case 'setStats': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) {
        if (t.kind === 'minion') {
          if (eff.atk !== undefined) t.minion.attack = eff.atk
          if (eff.health !== undefined) {
            t.minion.maxHealth = eff.health
            t.minion.health = eff.health
          }
        }
      }
      break
    }
    case 'silence': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) if (t.kind === 'minion') silenceMinion(t.minion)
      break
    }
    case 'destroy': {
      const targets = resolveTargets(state, ctx, eff.target)
      for (const t of targets) if (t.kind === 'minion') t.minion.health = -9999
      break
    }
    case 'gainArmor': {
      const who = eff.who === 'opponent' ? opponentOf(me) : me
      state.players[who].hero.armor += eff.amount
      events.push({ type: 'armorChanged', player: who, amount: eff.amount })
      break
    }
    case 'heroAttackThisTurn': {
      const internal = asInternal(state)
      const hero = state.players[me].hero
      hero.attack += eff.amount
      internal._tempBuffs = internal._tempBuffs ?? []
      internal._tempBuffs.push({ kind: 'heroAtk', player: me, amount: eff.amount })
      break
    }
    case 'spellDamageThisTurnHero': {
      const internal = asInternal(state)
      internal._heroSpellDamageThisTurn = internal._heroSpellDamageThisTurn ?? [0, 0]
      internal._heroSpellDamageThisTurn[me] += eff.amount
      break
    }
    case 'equipWeapon': {
      equipWeaponForPlayer(state, me, eff.cardId)
      break
    }
    case 'script': {
      runScript(eff.id, ctx, events)
      break
    }
    case 'discover': {
      // Handled in runEffects; reaching here means a script invoked it directly.
      startDiscover(eff, ctx, [], events)
      break
    }
    default: {
      const _exhaustive: never = eff
      throw new Error('Unhandled effect kind: ' + JSON.stringify(_exhaustive))
    }
  }
}

/* ----------------------------------------------------------------------------
 * Choose One application
 * ------------------------------------------------------------------------- */

/**
 * Apply a Choose One spell option's effects.
 * @param option - the chosen option
 * @param ctx - effect context
 * @param events - event sink
 * @returns whether resolution paused on a discover
 */
export function applyChooseOneSpell(
  option: ChooseOneOption,
  ctx: EffectContext,
  events: GameEvent[]
): { paused: boolean } {
  if (option.effects) return runEffects(option.effects, ctx, events)
  return { paused: false }
}

/* ----------------------------------------------------------------------------
 * ScriptId implementations
 * ------------------------------------------------------------------------- */

/** Run a hand-written compound script. */
function runScript(id: ScriptId, ctx: EffectContext, events: GameEvent[]): void {
  const state = ctx.state
  const me = ctx.sourcePlayer
  switch (id) {
    case 'harvestTime': {
      // Destroy the chosen minion; summon two saplings for THAT minion's owner.
      const id = ctx.chosenTargetId
      if (!id) break
      const f = findMinion(state, id)
      if (!f) break
      const owner = f.owner
      f.minion.health = -9999
      // Saplings summon after death resolution at engine level; queue via temp.
      const internal = asInternal(state)
      internal._postDeathSummons = internal._postDeathSummons ?? []
      internal._postDeathSummons.push({ token: 'sapling', count: 2, owner })
      break
    }
    case 'mulch': {
      // Destroy the chosen minion; add a random minion to the OPPONENT's hand.
      const id = ctx.chosenTargetId
      if (id) {
        const f = findMinion(state, id)
        if (f) f.minion.health = -9999
      }
      // The minion goes to the opponent's hand, so lock to THEIR class.
      const pool = getPool('minion', poolLockFor(state, opponentOf(me), undefined))
      const card = pick(state.rng, pool)
      if (card) addCardToHand(state.players[opponentOf(me)], card.id)
      break
    }
    case 'marvelousMycelium': {
      // 3x: discover a chooseOne card and shuffle it into the deck.
      // Simplified deterministic version: pick 3 random chooseOne cards and
      // shuffle them in (no interactive discover to keep the script atomic).
      const pool = getPool('chooseOne', poolLockFor(state, me, undefined))
      for (let i = 0; i < 3; i++) {
        const card = pick(state.rng, pool)
        if (!card) break
        const inst = makeCardInstance(card.id)
        const p = state.players[me]
        const pos = nextInt(state.rng, p.deck.length + 1)
        p.deck.splice(pos, 0, inst)
      }
      break
    }
    case 'herdingHornCopy': {
      // Weapon trigger: after playing a beast, summon a copy and lose 1 durability.
      const playedId = ctx.playedCardId
      if (playedId && hasCard(playedId)) {
        const def = getCard(playedId)
        if (def.type === 'minion' && def.tribe === 'beast') {
          const copy = makeMinion(def)
          placeMinion(state, me, copy, undefined, events)
          const w = state.players[me].weapon
          if (w) {
            w.durability -= 1
            if (w.durability <= 0) state.players[me].weapon = undefined
          }
        }
      }
      break
    }
    case 'zukaraRecast': {
      // Minion trigger: after playing a spell costing 4+, cast it again at random targets.
      const playedId = ctx.playedCardId
      if (playedId && hasCard(playedId)) {
        const def = getCard(playedId)
        if (def.type === 'spell' && def.cost >= 4 && def.spell) {
          const foe = opponentOf(me)
          const enemyMinions = state.players[foe].board
          const randomTargetId =
            enemyMinions.length > 0
              ? (pick(state.rng, enemyMinions) as MinionInstance).instanceId
              : HERO_TARGET(foe)
          const recastCtx: EffectContext = {
            state,
            sourcePlayer: me,
            isSpellSource: true,
            chosenTargetId: randomTargetId,
          }
          runEffects(def.spell, recastCtx, events)
        }
      }
      break
    }
    case 'awakenedAncientUpgrade': {
      // No-op v1.
      break
    }
    default: {
      const _exhaustive: never = id
      throw new Error('Unhandled script id: ' + JSON.stringify(_exhaustive))
    }
  }
}

/** Convenience re-export used by combat/engine for hasKeyword checks. */
export { hasKeyword }
