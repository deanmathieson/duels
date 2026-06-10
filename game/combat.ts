import type {
  EffectContext,
  Entity,
} from './effects'
import type { GameEvent, GameState, MinionInstance, PlayerId, TriggerCondition, TriggerDef } from './types'
import { HERO_TARGET } from './types'
import { getCard, hasCard } from './cardDb'
import { asInternal } from './internal'
import { recomputeAuras } from './auras'
import { hasKeyword, isRushRestricted, removeKeyword } from './keywords'
import {
  dealDamageToEntity,
  findMinion,
  healEntity,
  makeMinion,
  opponentOf,
  placeMinion,
  resolveTargets,
  runEffects,
} from './effects'

/**
 * Enemy minions that enforce Taunt against an attacking player. Stealthed
 * Taunt minions do not enforce (Stealth overrides Taunt).
 */
export function enforcingTaunts(state: GameState, attackerOwner: PlayerId): MinionInstance[] {
  const foe = opponentOf(attackerOwner)
  return state.players[foe].board.filter(
    (m) => hasKeyword(m, 'taunt') && !m.silenced && !hasKeyword(m, 'stealth')
  )
}

/**
 * Whether a defender entity is a legal attack target given taunt/stealth rules.
 * Stealthed minions cannot be attacked.
 * @param state - game state
 * @param attackerOwner - the attacking player
 * @param targetId - the defender id (minion instance id or hero sentinel)
 * @param attacker - the attacking minion (for rush restriction)
 * @returns true if the attack is legal
 */
export function isLegalAttackTarget(
  state: GameState,
  attackerOwner: PlayerId,
  targetId: string,
  attacker: MinionInstance
): boolean {
  const foe = opponentOf(attackerOwner)
  const taunts = enforcingTaunts(state, attackerOwner)
  // Rush minions on their summon turn can only hit minions.
  if (isRushRestricted(attacker) && targetId === HERO_TARGET(foe)) return false
  if (taunts.length > 0) {
    // Must attack a taunt minion.
    return taunts.some((m) => m.instanceId === targetId)
  }
  // No taunts — any non-stealthed enemy character is legal.
  if (targetId === HERO_TARGET(foe)) return true
  return state.players[foe].board.some(
    (m) => m.instanceId === targetId && !hasKeyword(m, 'stealth')
  )
}

/**
 * Resolve a minion attack: simultaneous damage, divine shield, poisonous,
 * lifesteal, then deaths/deathrattles/onMinionDeath triggers.
 * @param state - game state
 * @param attackerId - attacking minion instance id
 * @param targetId - defender id (minion or hero sentinel)
 * @param events - event sink
 */
export function resolveAttack(
  state: GameState,
  attackerId: string,
  targetId: string,
  events: GameEvent[]
): void {
  const atk = findMinion(state, attackerId)
  if (!atk) return
  const attacker = atk.minion
  const attackerOwner = atk.owner

  // Attacking breaks Stealth.
  if (hasKeyword(attacker, 'stealth')) removeKeyword(attacker, 'stealth')

  events.push({ type: 'attack', attackerId, targetId })

  const attackerDamage = attacker.attack
  let dealtToDefender = 0

  // Hero target.
  if (targetId === HERO_TARGET(0) || targetId === HERO_TARGET(1)) {
    const defenderPlayer: PlayerId = targetId === HERO_TARGET(0) ? 0 : 1
    dealDamageToEntity(state, { kind: 'hero', player: defenderPlayer }, attackerDamage, events)
    dealtToDefender = attackerDamage
    if (hasKeyword(attacker, 'lifesteal') && dealtToDefender > 0) {
      healEntity(state, { kind: 'hero', player: attackerOwner }, dealtToDefender, events)
    }
  } else {
    const def = findMinion(state, targetId)
    if (!def) return
    const defender = def.minion
    const defenderDamage = defender.attack

    const attackerShield = attacker.divineShield
    const defenderShield = defender.divineShield

    // Simultaneous damage.
    dealDamageToEntity(state, { kind: 'minion', minion: defender, owner: def.owner }, attackerDamage, events)
    dealDamageToEntity(state, { kind: 'minion', minion: attacker, owner: attackerOwner }, defenderDamage, events)

    const defenderTookDamage = !defenderShield && attackerDamage > 0
    const attackerTookDamage = !attackerShield && defenderDamage > 0
    dealtToDefender = defenderTookDamage ? attackerDamage : 0

    // Poisonous: destroy any minion that took damage from a poisonous source.
    if (hasKeyword(attacker, 'poisonous') && defenderTookDamage) defender.health = -9999
    if (hasKeyword(defender, 'poisonous') && attackerTookDamage) attacker.health = -9999

    // Lifesteal both ways (heals the owner's hero).
    if (hasKeyword(attacker, 'lifesteal') && dealtToDefender > 0) {
      healEntity(state, { kind: 'hero', player: attackerOwner }, dealtToDefender, events)
    }
    if (hasKeyword(defender, 'lifesteal') && attackerTookDamage) {
      healEntity(state, { kind: 'hero', player: def.owner }, defenderDamage, events)
    }
  }

  attacker.attacksThisTurn += 1

  checkDeaths(state, events)
}

/**
 * Whether a target is a legal HERO attack target (taunt rules apply; heroes have
 * no summoning sickness or rush restriction).
 */
export function isLegalHeroAttackTarget(
  state: GameState,
  player: PlayerId,
  targetId: string
): boolean {
  const foe = opponentOf(player)
  const taunts = enforcingTaunts(state, player)
  if (taunts.length > 0) return taunts.some((m) => m.instanceId === targetId)
  if (targetId === HERO_TARGET(foe)) return true
  return state.players[foe].board.some(
    (m) => m.instanceId === targetId && !hasKeyword(m, 'stealth')
  )
}

/**
 * Resolve a hero attack (with the equipped weapon, or a temporary attack buff).
 * The hero deals its Attack to the target; a defending minion strikes back; the
 * weapon loses 1 Durability and is destroyed (removing its Attack) when it hits 0.
 * @param state - game state
 * @param player - the attacking player
 * @param targetId - defender id (minion instance id or enemy hero sentinel)
 * @param events - event sink
 */
export function resolveHeroAttack(
  state: GameState,
  player: PlayerId,
  targetId: string,
  events: GameEvent[]
): void {
  const p = state.players[player]
  const dmg = p.hero.attack
  if (dmg <= 0) return
  const foe = opponentOf(player)
  events.push({ type: 'attack', attackerId: HERO_TARGET(player), targetId })

  const weapon = p.weapon
  const weaponDef = weapon && hasCard(weapon.cardId) ? getCard(weapon.cardId) : undefined
  const lifesteal = !!weaponDef?.keywords?.includes('lifesteal')
  let dealt = 0

  if (targetId === HERO_TARGET(foe)) {
    dealDamageToEntity(state, { kind: 'hero', player: foe }, dmg, events)
    dealt = dmg
  } else {
    const def = findMinion(state, targetId)
    if (!def) return
    const defender = def.minion
    const defenderShield = defender.divineShield
    dealDamageToEntity(state, { kind: 'minion', minion: defender, owner: def.owner }, dmg, events)
    dealt = defenderShield ? 0 : dmg
    // The defending minion strikes back at the hero.
    if (defender.attack > 0) {
      dealDamageToEntity(state, { kind: 'hero', player }, defender.attack, events)
    }
  }

  if (lifesteal && dealt > 0) {
    healEntity(state, { kind: 'hero', player }, dealt, events)
  }

  // Spend weapon durability; destroy the weapon (and remove its attack) at 0.
  if (weapon) {
    weapon.durability -= 1
    if (weapon.durability <= 0) {
      p.hero.attack -= weapon.attack
      if (p.hero.attack < 0) p.hero.attack = 0
      p.weapon = undefined
    }
  }

  p.hero.attacksThisTurn += 1
  checkDeaths(state, events)
}

/* ----------------------------------------------------------------------------
 * Death resolution
 * ------------------------------------------------------------------------- */

/**
 * Resolve damage triggers and deaths until the board is stable.
 *
 * Each pass first flushes queued minion-damage notifications into
 * onSelfDamaged / onFriendlyMinionDamaged / onMinionDamaged triggers (so a
 * minion dealt lethal damage still fires before it is removed), then removes
 * all minions at <=0 health (in play order across both boards), firing
 * deathrattles and onMinionDeath / onFriendlyMinionDeath triggers, then
 * flushes queued post-death summons (e.g. Harvest Time saplings). Repeats
 * while triggers cause further damage or deaths, with a safety bound against
 * pathological trigger loops.
 * @param state - game state
 * @param events - event sink
 */
export function checkDeaths(state: GameState, events: GameEvent[]): void {
  const internal = asInternal(state)
  let guard = 0
  while (guard++ < 50) {
    flushDamageTriggers(state, events)
    const dead: { minion: MinionInstance; owner: PlayerId }[] = []
    // Collect in play order: player 0 board then player 1 board.
    for (const p of [0, 1] as PlayerId[]) {
      for (const m of state.players[p].board) {
        if (m.health <= 0) dead.push({ minion: m, owner: p })
      }
    }
    if (dead.length === 0) {
      // Damage triggers may have queued more damage without killing anything.
      if ((internal._damagedMinions?.length ?? 0) > 0) continue
      break
    }

    // Remove from boards first so they are gone during deathrattle resolution.
    for (const d of dead) {
      const board = state.players[d.owner].board
      const idx = board.findIndex((m) => m.instanceId === d.minion.instanceId)
      if (idx >= 0) board.splice(idx, 1)
      state.players[d.owner].graveyard.push({
        instanceId: d.minion.instanceId,
        cardId: d.minion.cardId,
        cost: hasCard(d.minion.cardId) ? getCard(d.minion.cardId).cost : 0,
      })
      events.push({ type: 'death', instanceId: d.minion.instanceId, player: d.owner })
    }

    // Removing minions may remove aura sources — recompute before triggers run.
    recomputeAuras(state)

    // Deathrattles fire in play order.
    for (const d of dead) {
      if (d.minion.silenced) continue
      const def = hasCard(d.minion.cardId) ? getCard(d.minion.cardId) : undefined
      if (def?.deathrattle) {
        const ctx: EffectContext = {
          state,
          sourcePlayer: d.owner,
          sourceInstanceId: d.minion.instanceId,
          triggerSourceId: d.minion.instanceId,
        }
        runEffects(def.deathrattle, ctx, events)
      }
    }

    // onMinionDeath / onFriendlyMinionDeath triggers fire after deathrattles.
    for (const d of dead) {
      fireDeathTriggers(state, d.minion, d.owner, events)
    }

    // Flush queued post-death summons.
    flushPostDeathSummons(state, events)
  }
}

/**
 * Flush queued minion-damage notifications into damage triggers. Fired while
 * the damaged minion is still on board (deaths are collected afterwards), so
 * lethal damage triggers too. Trigger effects may deal further damage — the
 * queue refills and checkDeaths loops another pass.
 */
function flushDamageTriggers(state: GameState, events: GameEvent[]): void {
  const internal = asInternal(state)
  const queue = internal._damagedMinions
  if (!queue || queue.length === 0) return
  internal._damagedMinions = []
  for (const d of queue) {
    for (const p of [0, 1] as PlayerId[]) {
      for (const m of [...state.players[p].board]) {
        if (m.silenced || !m.hasTriggers) continue
        const def = hasCard(m.cardId) ? getCard(m.cardId) : undefined
        if (!def?.triggers) continue
        for (const trig of def.triggers) {
          const fires =
            (trig.event === 'onSelfDamaged' && m.instanceId === d.instanceId) ||
            (trig.event === 'onFriendlyMinionDamaged' && p === d.owner) ||
            trig.event === 'onMinionDamaged'
          if (fires) fireTrigger(state, trig, p, m.instanceId, d.instanceId, events)
        }
      }
    }
  }
}

/** Fire onMinionDeath / onFriendlyMinionDeath triggers for surviving minions. */
function fireDeathTriggers(
  state: GameState,
  deadMinion: MinionInstance,
  deadOwner: PlayerId,
  events: GameEvent[]
): void {
  for (const p of [0, 1] as PlayerId[]) {
    for (const m of [...state.players[p].board]) {
      if (m.silenced || !m.hasTriggers) continue
      const def = hasCard(m.cardId) ? getCard(m.cardId) : undefined
      if (!def?.triggers) continue
      for (const trig of def.triggers) {
        if (trig.event === 'onMinionDeath') {
          fireTrigger(state, trig, p, m.instanceId, deadMinion.instanceId, events)
        } else if (trig.event === 'onFriendlyMinionDeath' && p === deadOwner) {
          fireTrigger(state, trig, p, m.instanceId, deadMinion.instanceId, events)
        }
      }
    }
  }
}

/** Resolve queued post-death summons (e.g. Harvest Time). */
function flushPostDeathSummons(state: GameState, events: GameEvent[]): void {
  const internal = asInternal(state)
  const queue = internal._postDeathSummons
  if (!queue || queue.length === 0) return
  internal._postDeathSummons = []
  for (const q of queue) {
    for (let i = 0; i < q.count; i++) {
      if (!hasCard(q.token)) break
      const minion = makeMinion(getCard(q.token))
      if (!placeMinion(state, q.owner, minion, undefined, events)) break
    }
  }
}

/* ----------------------------------------------------------------------------
 * Generic trigger firing (shared by engine for play / turn triggers)
 * ------------------------------------------------------------------------- */

/** Evaluate a trigger condition against the played card. */
export function conditionHolds(
  condition: TriggerCondition | undefined,
  playedCardId: string | undefined
): boolean {
  if (!condition || condition === 'always') return true
  if (!playedCardId || !hasCard(playedCardId)) return false
  const def = getCard(playedCardId)
  switch (condition) {
    case 'cardIsBeast':
      return def.type === 'minion' && def.tribe === 'beast'
    case 'cardIsSpell':
      return def.type === 'spell'
    case 'cardCost4Plus':
      return def.cost >= 4
    case 'cardCost5Plus':
      return def.cost >= 5
    default:
      return false
  }
}

/**
 * Fire a single trigger definition for a given source minion.
 * @param state - game state
 * @param trig - the trigger definition
 * @param owner - the trigger's owner player
 * @param sourceInstanceId - the minion that owns the trigger
 * @param triggerSourceId - the entity that fired the trigger (dead minion, etc.)
 * @param events - event sink
 * @param playedCardId - the card id that caused the trigger (for scripts/conditions)
 */
export function fireTrigger(
  state: GameState,
  trig: TriggerDef,
  owner: PlayerId,
  sourceInstanceId: string | undefined,
  triggerSourceId: string | undefined,
  events: GameEvent[],
  playedCardId?: string
): void {
  if (!conditionHolds(trig.condition, playedCardId)) return
  const ctx: EffectContext = {
    state,
    sourcePlayer: owner,
    sourceInstanceId,
    triggerSourceId,
    playedCardId,
  }
  if (trig.scriptId) {
    runEffects([{ kind: 'script', id: trig.scriptId }], ctx, events)
  }
  if (trig.effects) {
    runEffects(trig.effects, ctx, events)
  }
}

/** Re-export for engine convenience. */
export type { Entity }
