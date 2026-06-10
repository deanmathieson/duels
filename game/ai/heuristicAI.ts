import type {
  Action,
  AiProfile,
  AiProfileName,
  CardDef,
  CardInstance,
  ChooseAiAction,
  GameState,
  MinionInstance,
  PlayerId,
} from '../types'
import { HERO_TARGET } from '../types'
import { getCard, getHeroPower, hasCard, hasHeroPower } from '../cardDb'
import { hasKeyword } from '../keywords'
import {
  getAttackTargets,
  getAttackers,
  getHeroPowerTargets,
  getLiveCost,
  getPlayableCards,
  getValidTargets,
  isLethalAvailable,
} from '../queries'

/** Opponent helper local to the AI. */
function opp(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0
}

/** Weights for each named AI profile. */
const AI_PROFILES: Record<AiProfileName, AiProfile> = {
  aggro: { name: 'aggro', aggression: 0.85, heroPowerEagerness: 0.6 },
  tempo: { name: 'tempo', aggression: 0.6, heroPowerEagerness: 0.5 },
  midrange: { name: 'midrange', aggression: 0.5, heroPowerEagerness: 0.45 },
  control: { name: 'control', aggression: 0.25, heroPowerEagerness: 0.7 },
}

/**
 * Resolve a named AI profile to its weights.
 * @param name - the profile name
 * @returns the AiProfile (defaults to midrange if unknown)
 */
export function aiProfileFor(name: AiProfileName): AiProfile {
  return AI_PROFILES[name] ?? AI_PROFILES.midrange
}

/** A card definition lookup that tolerates unknown ids. */
function defOf(inst: CardInstance): CardDef | undefined {
  return hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
}

/**
 * Choose the next action for the AI player. Returns one action per call; the
 * run loop applies it then calls again until `endTurn` is returned.
 *
 * Strategy (greedy, profile-weighted):
 *  1. If a discover/choice is pending, resolve it (pick first option).
 *  2. If board lethal is available, swing everything face.
 *  3. Play the most expensive affordable card that makes sense (on curve),
 *     choosing sensible targets for targeted spells.
 *  4. Use the hero power per heroPowerEagerness.
 *  5. Attack with minions: trade into threats or go face per aggression.
 *  6. Otherwise end the turn.
 *
 * @param state - game state
 * @param player - the AI player id
 * @param profile - aggression / hero-power weights
 * @returns the next Action
 */
export const chooseAiAction: ChooseAiAction = (
  state: GameState,
  player: PlayerId,
  profile: AiProfile
): Action => {
  // 1. Resolve any pending choice first.
  if (state.pendingChoice && state.pendingChoice.player === player) {
    const opt = state.pendingChoice.options[0]
    return {
      type: 'resolveChoice',
      player,
      pick: { cardId: opt?.cardId, index: opt?.index },
    }
  }

  if (state.phase !== 'main' || state.activePlayer !== player) {
    return { type: 'endTurn', player }
  }

  const foe = opp(player)

  // 2. Lethal: if board can kill, attack face with any ready attacker.
  if (isLethalAvailable(state, player)) {
    const faceSwing = nextFaceAttack(state, player)
    if (faceSwing) return faceSwing
  }

  // 3. Play a card if affordable.
  const cardAction = pickCardToPlay(state, player, profile)
  if (cardAction) return cardAction

  // 4. Hero power.
  const hpAction = maybeUseHeroPower(state, player, profile)
  if (hpAction) return hpAction

  // 5. Attacks.
  const attackAction = pickAttack(state, player, profile)
  if (attackAction) return attackAction

  // 6. Nothing left.
  return { type: 'endTurn', player }
}

/** Return a face attack action for the first ready attacker, or undefined. */
function nextFaceAttack(state: GameState, player: PlayerId): Action | undefined {
  const foe = opp(player)
  const attackers = getAttackers(state, player)
  for (const id of attackers) {
    const targets = getAttackTargets(state, player, id)
    if (targets.includes(HERO_TARGET(foe))) {
      return { type: 'attack', player, attackerId: id, targetId: HERO_TARGET(foe) }
    }
  }
  return undefined
}

/** Choose the best affordable card to play this step. */
function pickCardToPlay(state: GameState, player: PlayerId, profile: AiProfile): Action | undefined {
  const playable = getPlayableCards(state, player)
  if (playable.length === 0) return undefined

  // Prefer the highest-cost affordable card (curve), minions before pure utility.
  const sorted = [...playable].sort((a, b) => {
    const ca = getLiveCost(state, player, a)
    const cb = getLiveCost(state, player, b)
    return cb - ca
  })

  for (const inst of sorted) {
    const def = defOf(inst)
    if (!def) continue
    const action = buildPlayAction(state, player, inst, def, profile)
    if (action) return action
  }
  return undefined
}

/** Build a playCard action for a card, resolving targets and choose-one. */
function buildPlayAction(
  state: GameState,
  player: PlayerId,
  inst: CardInstance,
  def: CardDef,
  profile: AiProfile
): Action | undefined {
  const foe = opp(player)
  const action: Extract<Action, { type: 'playCard' }> = {
    type: 'playCard',
    player,
    instanceId: inst.instanceId,
  }

  // Choose One: pick option 0 by default (data authors order the "default" first).
  if (def.chooseOne && def.chooseOne.length > 0) {
    action.chooseOneIndex = 0
  }

  // Targeted: pick a sensible target from the engine's legal-target list
  // (which enforces stealth and attack caps like Shadow Word: Pain).
  if (def.targeted) {
    const legal = getValidTargets(state, player, inst)
    if (legal.length === 0) return undefined
    const target = chooseSpellTarget(state, player, def, new Set(legal))
    if (!target) return undefined
    action.targetId = target
  }

  return action
}

/** Pick a target for a targeted card: damage→enemy, buff/heal→friendly. */
function chooseSpellTarget(
  state: GameState,
  player: PlayerId,
  def: CardDef,
  legal: Set<string>
): string | undefined {
  const foe = opp(player)
  const filter = def.targetFilter ?? 'chosenTarget'
  const isDamage = describesDamage(def)
  const isFriendlyBuff = describesFriendlyBuff(def)

  const enemyMinions = state.players[foe].board.filter((m) => legal.has(m.instanceId))
  const friendlyMinions = state.players[player].board.filter((m) => legal.has(m.instanceId))

  // Haunt triggers ("trigger a friendly minion's Deathrattle"): aim at the
  // most expensive friendly minion that actually HAS a non-silenced
  // deathrattle — anything else whiffs.
  if (describesDeathrattleTrigger(def)) {
    const withDr = friendlyMinions.filter(
      (m) => !m.silenced && hasCard(m.cardId) && !!getCard(m.cardId).deathrattle
    )
    if (withDr.length === 0) return undefined
    withDr.sort((a, b) => getCard(b.cardId).cost - getCard(a.cardId).cost)
    return withDr[0].instanceId
  }

  if (isFriendlyBuff) {
    // Buff the highest-attack friendly minion.
    const best = highestAttack(friendlyMinions)
    if (best) return best.instanceId
  }

  if (isDamage) {
    // Damage: prefer to kill an enemy minion, else hit face.
    const target = bestRemovalTarget(enemyMinions, def)
    if (target) return target.instanceId
    if (canTargetEnemyHero(filter) && legal.has(HERO_TARGET(foe))) return HERO_TARGET(foe)
    if (enemyMinions.length > 0) return enemyMinions[0].instanceId
  }

  // Fallback: any legal target.
  if (canTargetEnemyHero(filter) && legal.has(HERO_TARGET(foe))) return HERO_TARGET(foe)
  if (enemyMinions.length > 0) return enemyMinions[0].instanceId
  if (friendlyMinions.length > 0) return friendlyMinions[0].instanceId
  return undefined
}

/** Whether the target filter permits hitting the enemy hero. */
function canTargetEnemyHero(filter: string): boolean {
  return (
    filter === 'chosenTarget' ||
    filter === 'allEnemyCharacters' ||
    filter === 'allCharacters' ||
    filter === 'enemyHero'
  )
}

/** Crude check: does the card's effects/chooseOne deal damage? */
function describesDamage(def: CardDef): boolean {
  const all = [...(def.spell ?? []), ...(def.battlecry ?? [])]
  for (const opt of def.chooseOne ?? []) all.push(...(opt.effects ?? []))
  return all.some((e) => e.kind === 'damage' || e.kind === 'destroy')
}

/** Does the card trigger friendly deathrattles (Haunt-archetype tools)? */
function describesDeathrattleTrigger(def: CardDef): boolean {
  const all = [...(def.spell ?? []), ...(def.battlecry ?? [])]
  for (const opt of def.chooseOne ?? []) all.push(...(opt.effects ?? []))
  return all.some((e) => e.kind === 'triggerDeathrattles')
}

/** Crude check: does the card buff friendly minions? */
function describesFriendlyBuff(def: CardDef): boolean {
  const all = [...(def.spell ?? []), ...(def.battlecry ?? [])]
  for (const opt of def.chooseOne ?? []) all.push(...(opt.effects ?? []))
  return all.some(
    (e) =>
      (e.kind === 'buff' || e.kind === 'giveKeyword' || e.kind === 'giveDivineShield') &&
      'target' in e &&
      (e.target === 'friendlyMinions' ||
        e.target === 'chosenTarget' ||
        e.target === 'otherFriendlyMinions')
  )
}

/** Highest-attack minion in a list. */
function highestAttack(minions: MinionInstance[]): MinionInstance | undefined {
  let best: MinionInstance | undefined
  for (const m of minions) if (!best || m.attack > best.attack) best = m
  return best
}

/** The enemy minion this removal can ideally kill (highest attack we can reach). */
function bestRemovalTarget(enemyMinions: MinionInstance[], def: CardDef): MinionInstance | undefined {
  if (enemyMinions.length === 0) return undefined
  // Prefer the highest-attack enemy minion (biggest threat).
  return highestAttack(enemyMinions)
}

/** Decide whether to use the hero power, returning the action or undefined. */
function maybeUseHeroPower(state: GameState, player: PlayerId, profile: AiProfile): Action | undefined {
  const p = state.players[player]
  if (p.heroPower.usedThisTurn) return undefined
  if (p.mana.current < p.heroPower.cost) return undefined

  // Eagerness gate: only use proactively if eagerness is high enough relative to
  // leftover mana. Always allow if there is spare mana and eagerness > 0.3.
  const spare = p.mana.current - p.heroPower.cost
  if (profile.heroPowerEagerness < 0.3 && spare > 1) return undefined

  const action: Extract<Action, { type: 'useHeroPower' }> = { type: 'useHeroPower', player }
  const def = hasHeroPower(p.heroPower.id) ? getHeroPower(p.heroPower.id) : undefined
  if (!def) return action

  // Default chooseOne to 0 for hero powers that have it.
  if (def.chooseOne && def.chooseOne.length > 0) action.chooseOneIndex = 0

  // Targeted powers (Fireblast, Execute Strike, Drain Soul …) must carry a
  // target — the engine rejects a target-less use rather than wasting mana.
  if (def.targeted) {
    const target = chooseHeroPowerTarget(state, player, def, action.chooseOneIndex)
    if (!target) return undefined
    action.targetId = target
  }
  return action
}

/** Pick a target for a targeted hero power: damage→enemy, heal→own hero. */
function chooseHeroPowerTarget(
  state: GameState,
  player: PlayerId,
  def: ReturnType<typeof getHeroPower>,
  chooseOneIndex: number | undefined
): string | undefined {
  const foe = opp(player)
  const legal = new Set(getHeroPowerTargets(state, player, def))
  if (legal.size === 0) return undefined

  const effects =
    def.chooseOne && chooseOneIndex !== undefined
      ? def.chooseOne[chooseOneIndex]?.effects ?? []
      : def.effects ?? []
  const isDamage = effects.some((e) => e.kind === 'damage' || e.kind === 'destroy')
  const isHeal = effects.some((e) => e.kind === 'heal')

  const enemyMinions = state.players[foe].board.filter((m) => legal.has(m.instanceId))
  const friendlyMinions = state.players[player].board.filter((m) => legal.has(m.instanceId))

  if (isDamage) {
    const best = highestAttack(enemyMinions)
    if (best) return best.instanceId
    if (legal.has(HERO_TARGET(foe))) return HERO_TARGET(foe)
    return undefined
  }
  if (isHeal) {
    if (legal.has(HERO_TARGET(player))) return HERO_TARGET(player)
    const best = highestAttack(friendlyMinions)
    if (best) return best.instanceId
    return undefined
  }
  // Buff-style fallback: our best minion, else any legal id.
  const best = highestAttack(friendlyMinions)
  if (best) return best.instanceId
  return [...legal][0]
}

/** Decide the next attack: trade into threats or go face per aggression. */
function pickAttack(state: GameState, player: PlayerId, profile: AiProfile): Action | undefined {
  const foe = opp(player)
  const attackers = getAttackers(state, player)
  if (attackers.length === 0) return undefined

  const enemyTaunts = state.players[foe].board.filter((m) => hasKeyword(m, 'taunt') && !m.silenced)

  for (const id of attackers) {
    // Hero attack (equipped weapon): go face unless taunts force a trade.
    if (id === HERO_TARGET(player)) {
      const heroTargets = getAttackTargets(state, player, id)
      if (heroTargets.length === 0) continue
      const faceId = HERO_TARGET(foe)
      return {
        type: 'attack',
        player,
        attackerId: id,
        targetId: heroTargets.includes(faceId) ? faceId : heroTargets[0],
      }
    }
    const attacker = state.players[player].board.find((m) => m.instanceId === id)
    if (!attacker) continue
    const targets = getAttackTargets(state, player, id)
    if (targets.length === 0) continue

    // Forced to clear taunts.
    if (enemyTaunts.length > 0) {
      const t = chooseTradeTarget(attacker, enemyTaunts.filter((m) => targets.includes(m.instanceId)))
      if (t) return { type: 'attack', player, attackerId: id, targetId: t.instanceId }
      // Can't reach a taunt with this attacker (e.g. rush vs hero only) — skip.
      continue
    }

    const goFace = profile.aggression >= 0.5
    if (goFace && targets.includes(HERO_TARGET(foe))) {
      return { type: 'attack', player, attackerId: id, targetId: HERO_TARGET(foe) }
    }

    // Look for a favourable trade.
    const enemyMinions = state.players[foe].board.filter((m) => targets.includes(m.instanceId))
    const trade = chooseTradeTarget(attacker, enemyMinions)
    if (trade) return { type: 'attack', player, attackerId: id, targetId: trade.instanceId }

    // Otherwise go face if possible.
    if (targets.includes(HERO_TARGET(foe))) {
      return { type: 'attack', player, attackerId: id, targetId: HERO_TARGET(foe) }
    }
    if (enemyMinions.length > 0) {
      return { type: 'attack', player, attackerId: id, targetId: enemyMinions[0].instanceId }
    }
  }
  return undefined
}

/** Pick the best minion to trade into: a kill we survive, else biggest threat. */
function chooseTradeTarget(
  attacker: MinionInstance,
  candidates: MinionInstance[]
): MinionInstance | undefined {
  if (candidates.length === 0) return undefined
  // Prefer a target we can kill (attack >= its health) while surviving.
  const killSurvive = candidates
    .filter((m) => attacker.attack >= m.health && m.attack < attacker.health)
    .sort((a, b) => b.attack - a.attack)
  if (killSurvive.length > 0) return killSurvive[0]
  // Else any kill.
  const kills = candidates.filter((m) => attacker.attack >= m.health).sort((a, b) => b.attack - a.attack)
  if (kills.length > 0) return kills[0]
  // Else the biggest threat.
  return [...candidates].sort((a, b) => b.attack - a.attack)[0]
}
