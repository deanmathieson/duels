import type { AuraDef, CardDef, CardFilter, GameState, Keyword, MinionInstance, PlayerId } from './types'
import { getCard, hasCard } from './cardDb'
import { asInternalMinion } from './internal'
import { addKeyword, hasKeyword } from './keywords'

/**
 * Stateful keywords that auras must NOT grant: divine shield is consumed by
 * damage and stealth breaks on attack, so a continuous re-applied grant would
 * resurrect them on every recompute. Grant these via giveKeyword effects only.
 */
const STATEFUL_KEYWORDS: Keyword[] = ['divineShield', 'stealth']

/**
 * Whether a board minion matches a CardFilter (for minion auras). Keyword-based
 * filters (taunt) check the LIVE instance — at evaluation time the minion's
 * aura delta has been reverted, so this sees base + permanent grants — meaning
 * a minion granted Taunt by a spell correctly benefits from Taunt auras.
 */
function minionMatchesFilter(def: CardDef, m: MinionInstance, filter: CardFilter | undefined): boolean {
  if (!filter || filter === 'all') return true
  switch (filter) {
    case 'minion':
      return def.type === 'minion'
    case 'beast':
      return m.tribe === 'beast'
    case 'taunt':
      return hasKeyword(m, 'taunt')
    case 'dragon':
      return m.tribe === 'dragon'
    case 'costGte5':
      return def.cost >= 5
    case 'spell':
      return false
    case 'battlecry':
      return !!def.battlecry
    case 'deathrattle':
      return !!def.deathrattle
    default:
      return false
  }
}

type AuraSource = { auras: AuraDef[]; sourceInstanceId?: string }

/**
 * Recompute all continuous auras for both players. Minion stat / keyword aura
 * deltas are tracked per-instance (clone-safe) so this is idempotent and can be
 * called freely after any board change. Also recomputes each player's live
 * Spell Damage from board minions + spellDamage auras.
 * Minion-sourced auras exclude their own source minion.
 * @param state - game state to recompute (mutated)
 */
export function recomputeAuras(state: GameState): void {
  for (const p of [0, 1] as PlayerId[]) {
    const player = state.players[p]

    let spellDamage = 0
    for (const m of player.board) {
      if (!m.silenced) spellDamage += m.spellDamage
    }

    const sources: AuraSource[] = []
    for (const m of player.board) {
      if (m.silenced || !m.hasAuras) continue
      const def = hasCard(m.cardId) ? getCard(m.cardId) : undefined
      if (def?.auras) sources.push({ auras: def.auras, sourceInstanceId: m.instanceId })
    }
    for (const passive of player.passives) {
      if (passive.auras.length) sources.push({ auras: passive.auras })
    }

    for (const src of sources) {
      for (const aura of src.auras) {
        if (aura.kind === 'spellDamage') spellDamage += aura.amount
      }
    }

    player.spellDamage = spellDamage

    applyMinionAuras(state, p, sources)
  }
}

function applyMinionAuras(state: GameState, player: PlayerId, sources: AuraSource[]): void {
  const p = state.players[player]
  for (const m of p.board) {
    // Always revert the previous aura delta first.
    revertAuraDelta(m)
    if (m.silenced) continue
    const def = hasCard(m.cardId) ? getCard(m.cardId) : undefined
    if (!def) continue

    let atk = 0
    let health = 0
    const keywords: Keyword[] = []
    for (const src of sources) {
      // Minion-sourced auras exclude their own source.
      if (src.sourceInstanceId && src.sourceInstanceId === m.instanceId) continue
      for (const aura of src.auras) {
        if (aura.kind === 'minionStat' && minionMatchesFilter(def, m, aura.filter)) {
          atk += aura.atk ?? 0
          health += aura.health ?? 0
        } else if (aura.kind === 'giveKeyword' && minionMatchesFilter(def, m, aura.filter)) {
          if (STATEFUL_KEYWORDS.includes(aura.keyword)) continue
          if (!keywords.includes(aura.keyword)) keywords.push(aura.keyword)
        }
      }
    }

    if (atk || health || keywords.length) {
      m.attack += atk
      m.maxHealth += health
      m.health += health
      // Record only keywords the aura layer actually ADDED: keywords the minion
      // already owns (base or permanently granted) stay when the aura source
      // leaves play — the revert must not strip them.
      const added: Keyword[] = []
      for (const k of keywords) {
        if (!hasKeyword(m, k)) {
          addKeyword(m, k)
          added.push(k)
        }
      }
      const im = asInternalMinion(m)
      im._auraAtk = atk
      im._auraHealth = health
      im._auraKeywords = added
    }
  }
}

/**
 * Revert any aura delta currently baked into a minion. Health is reduced by the
 * full aura amount (damage taken is retained), so losing a health aura CAN drop
 * a damaged minion to 0 — the subsequent checkDeaths kills it (the Mal'Ganis
 * rule). Only keywords the aura layer itself added are removed; base and
 * permanently granted keywords are untouched.
 */
function revertAuraDelta(m: MinionInstance): void {
  const im = asInternalMinion(m)
  const atk = im._auraAtk ?? 0
  const health = im._auraHealth ?? 0
  const keywords = im._auraKeywords ?? []
  if (!atk && !health && keywords.length === 0) return
  m.attack -= atk
  m.maxHealth -= health
  m.health -= health
  for (const k of keywords) {
    // Stateful keywords (divineShield/stealth) are never aura-granted.
    m.keywords = m.keywords.filter((kw) => kw !== k)
    if (k === 'windfury') m.maxAttacks = 1
  }
  im._auraAtk = 0
  im._auraHealth = 0
  im._auraKeywords = []
}
