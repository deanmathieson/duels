import type {
  AuraDef,
  CardDef,
  CardInstance,
  EffectSpec,
  EngineQueries,
  GameState,
  HeroPowerDef,
  MinionInstance,
  PlayerId,
  TargetSelector,
} from './types'
import { HERO_TARGET } from './types'
import { getCard, hasCard } from './cardDb'
import { hasKeyword, isRushRestricted } from './keywords'

/** Opponent of a player id (local copy to keep queries dependency-free). */
function opp(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0
}

/**
 * The live mana cost of a card in hand: base cost, minus sticky reductions,
 * minus matching cost-reduction auras (from passives), floored at 0.
 * @param state - game state
 * @param player - the owning player
 * @param inst - the card instance
 * @returns the current playable cost
 */
export function getLiveCost(state: GameState, player: PlayerId, inst: CardInstance): number {
  const def = hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  let cost = inst.cost
  cost -= inst.costReduction ?? 0

  if (def) {
    // Cost-reduction auras come from two sources: passive treasures, and
    // non-silenced board minions (e.g. Sorcerer's Apprentice). Mirror the
    // source-gathering in recomputeAuras() so both are honoured.
    const auraLists: AuraDef[][] = []
    for (const passive of state.players[player].passives) auraLists.push(passive.auras)
    for (const m of state.players[player].board) {
      if (m.silenced || !m.hasAuras) continue
      const mdef = hasCard(m.cardId) ? getCard(m.cardId) : undefined
      if (mdef?.auras) auraLists.push(mdef.auras)
    }
    for (const auras of auraLists) {
      for (const aura of auras) {
        if (aura.kind === 'costReduction' && cardMatchesCostFilter(def, aura.filter)) {
          cost -= aura.amount
        }
      }
    }
  }
  return Math.max(0, cost)
}

/** Whether a card matches a cost-reduction filter. */
function cardMatchesCostFilter(def: CardDef, filter: string): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'spell':
      return def.type === 'spell'
    case 'minion':
      return def.type === 'minion'
    case 'beast':
      return def.type === 'minion' && def.tribe === 'beast'
    case 'taunt':
      return (def.keywords ?? []).includes('taunt')
    case 'dragon':
      return def.tribe === 'dragon'
    case 'battlecry':
      return !!def.battlecry
    case 'deathrattle':
      return !!def.deathrattle
    case 'costGte5':
      return def.cost >= 5
    case 'costLte2':
      return def.cost <= 2
    default:
      return false
  }
}

/** Whether a card requires a target but has none available. */
function hasLegalTargetIfNeeded(state: GameState, player: PlayerId, inst: CardInstance): boolean {
  const def = hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  if (!def || !def.targeted) return true
  return getValidTargets(state, player, inst).length > 0
}

/** Whether every effect in a list is a friendly-side summon. */
function allFriendlySummons(effects: EffectSpec[]): boolean {
  return (
    effects.length > 0 &&
    effects.every(
      (e) =>
        (e.kind === 'summon' || e.kind === 'summonPerManaCrystal') &&
        ('side' in e ? e.side !== 'enemy' : true)
    )
  )
}

/**
 * Whether a spell can ONLY summon friendly minions, whichever way it is played
 * (e.g. Animal Companion, Force of Nature). Such spells are unplayable on a
 * full board — matching Hearthstone — instead of fizzling for full mana.
 */
function isPureSummonSpell(def: CardDef): boolean {
  if (def.type !== 'spell') return false
  if (def.chooseOne && def.chooseOne.length > 0) {
    return def.chooseOne.every((o) => allFriendlySummons(o.effects ?? []))
  }
  return def.spell ? allFriendlySummons(def.spell) : false
}

/**
 * Cards in hand the player can afford (and, for targeted cards, that have a
 * legal target) and that fit board space for minions.
 * @param state - game state
 * @param player - the player id
 * @returns playable card instances
 */
export function getPlayableCards(state: GameState, player: PlayerId): CardInstance[] {
  const p = state.players[player]
  if (state.phase !== 'main' || state.activePlayer !== player || state.pendingChoice) return []
  return p.hand.filter((inst) => {
    const def = hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
    if (!def) return false
    if (getLiveCost(state, player, inst) > p.mana.current) return false
    if (p.board.length >= 7 && (def.type === 'minion' || isPureSummonSpell(def))) return false
    if (!hasLegalTargetIfNeeded(state, player, inst)) return false
    return true
  })
}

/**
 * Resolve a targetFilter selector into concrete target ids. Enemy minions with
 * Stealth cannot be targeted (your own stealthed minions remain targetable).
 */
function targetsForSelector(
  state: GameState,
  player: PlayerId,
  selector: TargetSelector | undefined
): string[] {
  const foe = opp(player)
  const out: string[] = []
  const sel = selector ?? 'chosenTarget'
  const friendlyMinionIds = state.players[player].board.map((m) => m.instanceId)
  const enemyMinionIds = state.players[foe].board
    .filter((m) => !hasKeyword(m, 'stealth'))
    .map((m) => m.instanceId)
  switch (sel) {
    case 'allMinions':
      return [...friendlyMinionIds, ...enemyMinionIds]
    case 'enemyMinions':
      return enemyMinionIds
    case 'friendlyMinions':
    case 'otherFriendlyMinions':
      return friendlyMinionIds
    case 'allEnemyCharacters':
      return [...enemyMinionIds, HERO_TARGET(foe)]
    case 'allFriendlyCharacters':
      return [...friendlyMinionIds, HERO_TARGET(player)]
    case 'allCharacters':
    case 'chosenTarget':
      return [
        ...friendlyMinionIds,
        ...enemyMinionIds,
        HERO_TARGET(player),
        HERO_TARGET(foe),
      ]
    case 'enemyHero':
      return [HERO_TARGET(foe)]
    case 'friendlyHero':
      return [HERO_TARGET(player)]
    default:
      return out
  }
}

/**
 * Legal target ids for playing a targeted card.
 * @param state - game state
 * @param player - the player id
 * @param inst - the card instance
 * @returns legal target ids (minion instance ids and/or hero sentinels)
 */
export function getValidTargets(state: GameState, player: PlayerId, inst: CardInstance): string[] {
  const def = hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  if (!def || !def.targeted) return []
  let ids = targetsForSelector(state, player, def.targetFilter)
  // Attack-capped removal (Shadow Word: Pain): only minions whose CURRENT
  // attack — buffs and auras included — is within the cap are legal.
  if (def.targetMaxAttack !== undefined) {
    const cap = def.targetMaxAttack
    ids = ids.filter((id) => {
      const m = findBoardMinion(state, id)
      return !!m && m.attack <= cap
    })
  }
  return ids
}

/** Find a board minion across both players by instance id (heroes return undefined). */
function findBoardMinion(state: GameState, instanceId: string): MinionInstance | undefined {
  for (const p of [0, 1] as PlayerId[]) {
    const m = state.players[p].board.find((x) => x.instanceId === instanceId)
    if (m) return m
  }
  return undefined
}

/**
 * Legal target ids for a targeted hero power (resolved from its targetFilter).
 * Shared by the AI and any UI that needs engine-accurate hero power targeting.
 * @param state - game state
 * @param player - the player id
 * @param hp - the hero power definition
 * @returns legal target ids (minion instance ids and/or hero sentinels)
 */
export function getHeroPowerTargets(
  state: GameState,
  player: PlayerId,
  hp: HeroPowerDef
): string[] {
  if (!hp.targeted) return []
  return targetsForSelector(state, player, hp.targetFilter)
}

/**
 * Minion instance ids that can currently attack for a player.
 * @param state - game state
 * @param player - the player id
 * @returns attacker instance ids
 */
export function getAttackers(state: GameState, player: PlayerId): string[] {
  if (state.phase !== 'main' || state.activePlayer !== player || state.pendingChoice) return []
  const ids = state.players[player].board.filter((m) => canMinionAttack(m)).map((m) => m.instanceId)
  // The hero can attack if it has Attack (weapon or buff) and hasn't attacked yet.
  const hero = state.players[player].hero
  if (hero.attack > 0 && hero.attacksThisTurn === 0) ids.push(HERO_TARGET(player))
  return ids
}

/** Whether a minion can declare an attack this turn. */
function canMinionAttack(m: MinionInstance): boolean {
  if (m.attack <= 0) return false
  if (m.attacksThisTurn >= m.maxAttacks) return false
  if (m.summonedThisTurn) return hasKeyword(m, 'charge') || hasKeyword(m, 'rush')
  return true
}

/**
 * Legal attack target ids for a given attacker, honouring taunt and rush rules.
 * @param state - game state
 * @param player - the attacking player
 * @param attackerId - the attacker instance id
 * @returns legal defender ids
 */
export function getAttackTargets(state: GameState, player: PlayerId, attackerId: string): string[] {
  const foe = opp(player)
  // Stealthed minions can't be attacked and stealthed Taunts don't enforce.
  // Keyword presence is the single source of truth (treasure auras may
  // re-grant Taunt to a silenced minion — that still enforces).
  const attackable = state.players[foe].board.filter((m) => !hasKeyword(m, 'stealth'))
  const taunts = attackable.filter((m) => hasKeyword(m, 'taunt'))

  // Hero attacker (no rush restriction).
  if (attackerId === HERO_TARGET(player)) {
    if (taunts.length > 0) return taunts.map((m) => m.instanceId)
    return [...attackable.map((m) => m.instanceId), HERO_TARGET(foe)]
  }

  const attacker = state.players[player].board.find((m) => m.instanceId === attackerId)
  if (!attacker) return []
  if (taunts.length > 0) return taunts.map((m) => m.instanceId)
  const ids = attackable.map((m) => m.instanceId)
  if (!isRushRestricted(attacker)) ids.push(HERO_TARGET(foe))
  return ids
}

/** Total potential face damage available this turn (attacks + charge minions). */
function potentialFaceDamage(state: GameState, player: PlayerId): number {
  const foe = opp(player)
  const taunts = state.players[foe].board.filter(
    (m) => hasKeyword(m, 'taunt') && !hasKeyword(m, 'stealth')
  )
  if (taunts.length > 0) return 0 // must clear taunts first; conservative
  let dmg = 0
  for (const m of state.players[player].board) {
    if (!canMinionAttack(m)) continue
    if (isRushRestricted(m)) continue
    const attacks = m.maxAttacks - m.attacksThisTurn
    dmg += m.attack * Math.max(0, attacks)
  }
  // Hero weapon attack.
  if (state.players[player].hero.attack > 0 && state.players[player].hero.attacksThisTurn === 0) {
    dmg += state.players[player].hero.attack
  }
  return dmg
}

/**
 * Whether the player has lethal on board this turn (ignores spells in hand;
 * a conservative board-damage check used by the AI).
 * @param state - game state
 * @param player - the player id
 * @returns true if board damage covers the enemy hero's effective health
 */
export function isLethalAvailable(state: GameState, player: PlayerId): boolean {
  const foe = opp(player)
  const enemyHero = state.players[foe].hero
  const effectiveHealth = enemyHero.health + enemyHero.armor
  if (effectiveHealth <= 0) return false
  return potentialFaceDamage(state, player) >= effectiveHealth
}

/**
 * The winner of the game, if decided.
 * @param state - game state
 * @returns the winning player, 'draw', or undefined
 */
export function getWinner(state: GameState): PlayerId | 'draw' | undefined {
  return state.winner
}

/** The public EngineQueries bundle. */
export const queries: EngineQueries = {
  getLiveCost,
  getPlayableCards,
  getValidTargets,
  getAttackers,
  getAttackTargets,
  isLethalAvailable,
  getWinner,
}
