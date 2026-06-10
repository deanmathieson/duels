import type { CardClass, CardDef, CardPool, HeroPowerDef } from './types'

/** In-memory card database, populated at startup via registerCards. */
let DB: Record<string, CardDef> = {}

/** In-memory hero-power database. */
let HERO_POWERS: Record<string, HeroPowerDef> = {}

/**
 * Register card definitions into the global card database.
 * Called once at startup (Nuxt plugin) with the full registry, or by tests
 * with a small fixture set. Later registrations overwrite earlier ones by id.
 * @param cards - the card definitions to register
 */
export function registerCards(cards: CardDef[]): void {
  for (const c of cards) DB[c.id] = c
}

/**
 * Look up a card definition by id.
 * @param id - the card id
 * @returns the CardDef
 * @throws if the id is not registered
 */
export function getCard(id: string): CardDef {
  const c = DB[id]
  if (!c) throw new Error('Unknown card ' + id)
  return c
}

/**
 * Check whether a card id is registered.
 * @param id - the card id
 * @returns true if registered
 */
export function hasCard(id: string): boolean {
  return !!DB[id]
}

/**
 * Reset the card database. Primarily for test isolation.
 */
export function clearCards(): void {
  DB = {}
  HERO_POWERS = {}
}

/**
 * Register hero-power definitions so the engine can resolve hero powers.
 * @param powers - the hero-power definitions to register
 */
export function registerHeroPowers(powers: HeroPowerDef[]): void {
  for (const hp of powers) HERO_POWERS[hp.id] = hp
}

/**
 * Look up a hero-power definition by id.
 * @param id - the hero-power id
 * @returns the HeroPowerDef
 * @throws if the id is not registered
 */
export function getHeroPower(id: string): HeroPowerDef {
  const hp = HERO_POWERS[id]
  if (!hp) throw new Error('Unknown hero power ' + id)
  return hp
}

/**
 * Check whether a hero-power id is registered.
 * @param id - the hero-power id
 * @returns true if registered
 */
export function hasHeroPower(id: string): boolean {
  return !!HERO_POWERS[id]
}

/** Does the card match the given pool filter? */
function matchesPool(card: CardDef, pool: CardPool): boolean {
  switch (pool) {
    case 'any':
      return true
    case 'spell':
      return card.type === 'spell'
    case 'minion':
      return card.type === 'minion'
    case 'beast':
      return card.type === 'minion' && card.tribe === 'beast'
    case 'druidSpell':
      return card.type === 'spell' && card.cardClass === 'druid'
    case 'chooseOne':
      return Array.isArray(card.chooseOne) && card.chooseOne.length > 0
    case 'legendaryMinion':
      return card.type === 'minion' && card.rarity === 'legendary'
    case 'deathrattleMinion':
      return card.type === 'minion' && !!card.deathrattle
    default:
      return false
  }
}

/** Optional class restriction for generation pools. */
export interface PoolClassLock {
  /** Only cards of this class may be generated. */
  cardClass: CardClass
  /** Also allow neutral cards (the default "your class" lock includes neutral). */
  includeNeutral?: boolean
}

/**
 * Return all registered cards matching a pool, excluding token cards and
 * enemy-deck-only cards (`set: 'enemy'`).
 *
 * Generation is class-locked: when `lock` is provided, only cards of that class
 * (plus neutral when `includeNeutral`) are returned. The already class-specific
 * `druidSpell` pool ignores the lock. If the lock empties the pool entirely,
 * the unlocked pool is returned as a fallback so discovers never offer nothing.
 *
 * @param pool - the pool filter (spell/minion/beast/druidSpell/chooseOne/legendaryMinion/any)
 * @param lock - optional class restriction (omit for an unrestricted pool)
 * @returns matching, non-token card definitions
 */
export function getPool(pool: CardPool, lock?: PoolClassLock): CardDef[] {
  const applyLock = lock !== undefined && pool !== 'druidSpell'
  const out: CardDef[] = []
  for (const id in DB) {
    const card = DB[id]
    if (card.token) continue
    if (card.set === 'enemy') continue
    if (!matchesPool(card, pool)) continue
    if (applyLock) {
      const isNeutral = card.cardClass === 'neutral'
      if (card.cardClass !== lock.cardClass && !(lock.includeNeutral && isNeutral)) continue
    }
    out.push(card)
  }
  if (out.length === 0 && applyLock) return getPool(pool)
  return out
}
