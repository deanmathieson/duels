import type { Keyword, MinionInstance } from './types'
import { asInternalMinion } from './internal'

/**
 * Does a minion have a keyword (after silence considerations handled elsewhere)?
 * @param minion - the minion instance
 * @param keyword - the keyword to test
 * @returns true if present
 */
export function hasKeyword(minion: MinionInstance, keyword: Keyword): boolean {
  return minion.keywords.includes(keyword)
}

/**
 * Add a keyword to a minion (idempotent). Updates maxAttacks for windfury.
 * @param minion - the minion instance
 * @param keyword - the keyword to grant
 */
export function addKeyword(minion: MinionInstance, keyword: Keyword): void {
  if (!minion.keywords.includes(keyword)) minion.keywords.push(keyword)
  if (keyword === 'windfury') minion.maxAttacks = 2
  if (keyword === 'divineShield') minion.divineShield = true
}

/**
 * Permanently grant a keyword to a minion (giveKeyword / giveDivineShield
 * effects). Unlike aura-layer keywords, a permanent grant survives the loss of
 * any aura source: if an aura is currently providing this keyword, ownership is
 * transferred to the permanent layer so the next aura recompute won't strip it.
 * @param minion - the minion instance
 * @param keyword - the keyword to grant
 */
export function grantKeyword(minion: MinionInstance, keyword: Keyword): void {
  addKeyword(minion, keyword)
  const im = asInternalMinion(minion)
  if (im._auraKeywords?.includes(keyword)) {
    im._auraKeywords = im._auraKeywords.filter((k) => k !== keyword)
  }
}

/**
 * Remove a keyword from a minion. Updates maxAttacks for windfury.
 * @param minion - the minion instance
 * @param keyword - the keyword to remove
 */
export function removeKeyword(minion: MinionInstance, keyword: Keyword): void {
  minion.keywords = minion.keywords.filter((k) => k !== keyword)
  if (keyword === 'windfury') minion.maxAttacks = 1
  if (keyword === 'divineShield') minion.divineShield = false
}

/**
 * Whether a minion is currently able to declare an attack, considering
 * summoning sickness, charge/rush, windfury and zero attack.
 * Does not consider taunt on the defending side (see combat/queries).
 * @param minion - the attacking minion
 * @returns true if the minion may attack at all this turn
 */
export function canAttack(minion: MinionInstance): boolean {
  if (minion.attack <= 0) return false
  if (minion.attacksThisTurn >= minion.maxAttacks) return false
  if (minion.summonedThisTurn) {
    // Charge and rush can attack the turn they are summoned.
    return hasKeyword(minion, 'charge') || hasKeyword(minion, 'rush')
  }
  return true
}

/**
 * Whether a freshly-summoned minion (still summoning sick) may only hit minions.
 * Rush minions can attack minions only on their first turn; charge has no
 * such restriction.
 * @param minion - the attacking minion
 * @returns true if the minion is restricted to minion targets this turn
 */
export function isRushRestricted(minion: MinionInstance): boolean {
  return (
    minion.summonedThisTurn && hasKeyword(minion, 'rush') && !hasKeyword(minion, 'charge')
  )
}

/**
 * Consume a divine shield if present, returning whether damage was absorbed.
 * @param minion - the minion taking damage
 * @returns true if a shield absorbed the hit (no damage applied)
 */
export function absorbWithDivineShield(minion: MinionInstance): boolean {
  if (minion.divineShield) {
    minion.divineShield = false
    removeKeyword(minion, 'divineShield')
    return true
  }
  return false
}
