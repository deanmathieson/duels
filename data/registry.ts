/**
 * Content registry — the single integration point between the static /data content
 * and the pure engine. Aggregates every CardDef, hero, hero power, treasure and
 * bucket across ALL classes, registers them with the engine, and exposes lookups.
 */
import type {
  BucketDef,
  CardClass,
  CardDef,
  EnemyDef,
  HeroDef,
  HeroPowerDef,
  TreasureDef,
} from '../game/types'
import { hasCard, registerCards, registerHeroPowers, registerTreasures } from '../game/index'

// Re-export the engine card lookups through the content facade so UI components
// can import getCard/hasCard from '~/data/registry' alongside the def lookups.
export { getCard, hasCard } from '../game/index'

// --- shared cards ---
import { tokenCards } from './cards/tokens'
import { neutralCards } from './cards/neutral'
import { enemyCards } from './cards/enemy'

// --- class card pools ---
import { druidCards } from './cards/druid'
import { hunterCards } from './cards/hunter'
import { mageCards } from './cards/mage'
import { paladinCards } from './cards/paladin'
import { priestCards } from './cards/priest'
import { rogueCards } from './cards/rogue'
import { shamanCards } from './cards/shaman'
import { warlockCards } from './cards/warlock'
import { warriorCards } from './cards/warrior'

// --- heroes + hero powers (base = Druid hero + enemy hero powers) ---
import { heroes as baseHeroes, heroPowers as baseHeroPowers } from './heroes'
import { hunterHero, hunterHeroPowers } from './heroes/hunter'
import { mageHero, mageHeroPowers } from './heroes/mage'
import { paladinHero, paladinHeroPowers } from './heroes/paladin'
import { priestHero, priestHeroPowers } from './heroes/priest'
import { rogueHero, rogueHeroPowers } from './heroes/rogue'
import { shamanHero, shamanHeroPowers } from './heroes/shaman'
import { warlockHero, warlockHeroPowers } from './heroes/warlock'
import { warriorHero, warriorHeroPowers } from './heroes/warrior'

// --- treasures ---
import { buckets as druidBuckets } from './buckets'
import { enemies } from './enemies'
import { archivedPassiveTreasures, passiveTreasures } from './treasures/passive'
import { activeTreasures, activeTreasureTokens } from './treasures/active'
import { signatureTreasures as omuSignatureTreasures, signatureTreasureTokens } from './treasures/signature'
import { hunterSignatureTreasures } from './treasures/sig-hunter'
import { mageSignatureTreasures } from './treasures/sig-mage'
import { paladinSignatureTreasures } from './treasures/sig-paladin'
import { priestSignatureTreasures } from './treasures/sig-priest'
import { rogueSignatureTreasures } from './treasures/sig-rogue'
import { shamanSignatureTreasures } from './treasures/sig-shaman'
import { warlockSignatureTreasures } from './treasures/sig-warlock'
import { warriorSignatureTreasures, warriorSignatureTreasureTokens } from './treasures/sig-warrior'
import { scalingTreasures } from './treasures/scaling'

// --- authored per-class + neutral card buckets ---
import { hunterBuckets } from './buckets/hunter'
import { mageBuckets } from './buckets/mage'
import { paladinBuckets } from './buckets/paladin'
import { priestBuckets } from './buckets/priest'
import { rogueBuckets } from './buckets/rogue'
import { shamanBuckets } from './buckets/shaman'
import { warlockBuckets } from './buckets/warlock'
import { warriorBuckets } from './buckets/warrior'
import { neutralBuckets } from './buckets/neutral'

/* ----------------------------------------------------------------------------
 * Aggregations
 * ------------------------------------------------------------------------- */

/** Class card pools keyed by class. */
const classCardArrays: Record<string, CardDef[]> = {
  druid: druidCards,
  hunter: hunterCards,
  mage: mageCards,
  paladin: paladinCards,
  priest: priestCards,
  rogue: rogueCards,
  shaman: shamanCards,
  warlock: warlockCards,
  warrior: warriorCards,
}

/** All heroes (one per class). HeroSelect renders this. */
export const heroes: HeroDef[] = [
  ...baseHeroes,
  hunterHero,
  mageHero,
  paladinHero,
  priestHero,
  rogueHero,
  shamanHero,
  warlockHero,
  warriorHero,
]

/** All hero powers (Druid + enemy + every class). */
export const heroPowers: HeroPowerDef[] = [
  ...baseHeroPowers,
  ...hunterHeroPowers,
  ...mageHeroPowers,
  ...paladinHeroPowers,
  ...priestHeroPowers,
  ...rogueHeroPowers,
  ...shamanHeroPowers,
  ...warlockHeroPowers,
  ...warriorHeroPowers,
]

/** Signature treasures across every class (chosen at run start). */
export const signatureTreasures: TreasureDef[] = [
  ...omuSignatureTreasures,
  ...hunterSignatureTreasures,
  ...mageSignatureTreasures,
  ...paladinSignatureTreasures,
  ...priestSignatureTreasures,
  ...rogueSignatureTreasures,
  ...shamanSignatureTreasures,
  ...warlockSignatureTreasures,
  ...warriorSignatureTreasures,
]

/** All treasures across kinds (incl. enemy-only scaling passives and retired
 *  passives the engine must still resolve for old saves / boss gimmicks). */
export const allTreasures: TreasureDef[] = [
  ...passiveTreasures,
  ...archivedPassiveTreasures,
  ...activeTreasures,
  ...signatureTreasures,
  ...scalingTreasures,
]

/** Every CardDef in the game (collectibles + tokens + embedded treasure cards). */
export const allCards: CardDef[] = [
  ...tokenCards,
  ...neutralCards,
  ...enemyCards,
  ...druidCards,
  ...hunterCards,
  ...mageCards,
  ...paladinCards,
  ...priestCards,
  ...rogueCards,
  ...shamanCards,
  ...warlockCards,
  ...warriorCards,
  ...activeTreasureTokens,
  ...signatureTreasureTokens,
  ...warriorSignatureTreasureTokens,
  ...(activeTreasures.map((t) => t.card).filter(Boolean) as CardDef[]),
  ...(signatureTreasures.map((t) => t.card).filter(Boolean) as CardDef[]),
]

/* ----------------------------------------------------------------------------
 * Card buckets — Druid (authored) + per-class authored archetype buckets + neutral.
 * Each bucket carries a cardClass; 'neutral' buckets are offered to every hero.
 * ------------------------------------------------------------------------- */

const druidBucketsTagged: BucketDef[] = druidBuckets.map((b) => ({
  ...b,
  cardClass: (b.cardClass ?? 'druid') as CardClass,
}))

/** Every card bucket in the game. */
export const buckets: BucketDef[] = [
  ...druidBucketsTagged,
  ...hunterBuckets,
  ...mageBuckets,
  ...paladinBuckets,
  ...priestBuckets,
  ...rogueBuckets,
  ...shamanBuckets,
  ...warlockBuckets,
  ...warriorBuckets,
  ...neutralBuckets,
]

/* ----------------------------------------------------------------------------
 * Indexes
 * ------------------------------------------------------------------------- */

const heroIndex: Record<string, HeroDef> = Object.fromEntries(heroes.map((h) => [h.id, h]))
const heroPowerIndex: Record<string, HeroPowerDef> = Object.fromEntries(
  heroPowers.map((h) => [h.id, h])
)
const treasureIndex: Record<string, TreasureDef> = Object.fromEntries(
  allTreasures.map((t) => [t.id, t])
)
const bucketIndex: Record<string, BucketDef> = Object.fromEntries(buckets.map((b) => [b.id, b]))
const enemyIndex: Record<string, EnemyDef> = Object.fromEntries(enemies.map((e) => [e.id, e]))

let initialized = false

/**
 * Register all content with the engine. Idempotent — safe to call repeatedly.
 */
export function initializeContent(): void {
  registerCards(allCards)
  registerHeroPowers(heroPowers)
  registerTreasures(allTreasures)
  initialized = true
}

/** @returns true once initializeContent has run. */
export function isContentInitialized(): boolean {
  return initialized
}

/* ----------------------------------------------------------------------------
 * Lookups
 * ------------------------------------------------------------------------- */

/** @returns the hero definition for an id (throws if unknown). */
export function getHeroDef(id: string): HeroDef {
  const h = heroIndex[id]
  if (!h) throw new Error('Unknown hero ' + id)
  return h
}

/** @returns the hero-power definition for an id (throws if unknown). */
export function getHeroPowerDef(id: string): HeroPowerDef {
  const h = heroPowerIndex[id]
  if (!h) throw new Error('Unknown hero power ' + id)
  return h
}

/** @returns the treasure definition for an id (throws if unknown). */
export function getTreasureDef(id: string): TreasureDef {
  const t = treasureIndex[id]
  if (!t) throw new Error('Unknown treasure ' + id)
  return t
}

/** @returns the bucket definition for an id (throws if unknown). */
export function getBucketDef(id: string): BucketDef {
  const b = bucketIndex[id]
  if (!b) throw new Error('Unknown bucket ' + id)
  return b
}

/** @returns the enemy definition for an id (throws if unknown). */
export function getEnemyDef(id: string): EnemyDef {
  const e = enemyIndex[id]
  if (!e) throw new Error('Unknown enemy ' + id)
  return e
}

/** @returns true if the enemy id is known (saved runs may hold retired ids). */
export function hasEnemyDef(id: string): boolean {
  return !!enemyIndex[id]
}

/* ----------------------------------------------------------------------------
 * Saved-run migration
 * ------------------------------------------------------------------------- */

/**
 * Card ids that were removed during the duplicate-cleanup pass, mapped to the
 * surviving (neutral) copy. Saved decks in localStorage may still hold them.
 */
export const LEGACY_CARD_IDS: Record<string, string> = {
  hunter_stonetusk_boar: 'stonetusk_boar',
  paladin_stormwind_champion: 'stormwind_champion',
  warrior_war_golem: 'war_golem',
  shaman_fire_elemental: 'fire_elemental',
}

/**
 * Migrate a saved deck's card ids: map retired ids to their replacements and
 * drop anything the registry no longer knows (getCard throws on unknown ids,
 * which would brick a saved run).
 * @param ids - card ids from a persisted run
 * @returns ids that are safe to resolve via getCard
 */
export function migrateCardIds(ids: string[]): string[] {
  const out: string[] = []
  for (const raw of ids) {
    const id = LEGACY_CARD_IDS[raw] ?? raw
    if (hasCard(id)) {
      out.push(id)
    } else if (typeof console !== 'undefined') {
      console.warn(`[duels] Dropping unknown card id from saved run: ${raw}`)
    }
  }
  return out
}

/* ----------------------------------------------------------------------------
 * Collections for the deck-builder / reward pools
 * ------------------------------------------------------------------------- */

/** Collectible (non-token) neutral card ids — added to every class's deck pool. */
export const collectibleNeutralCardIds: string[] = neutralCards
  .filter((c) => !c.token)
  .map((c) => c.id)

/** Collectible (non-token) Druid card ids. */
export const collectibleDruidCardIds: string[] = druidCards
  .filter((c) => !c.token)
  .map((c) => c.id)

/** Druid + neutral collectible ids (legacy convenience). */
export const collectibleCardIds: string[] = [
  ...collectibleDruidCardIds,
  ...collectibleNeutralCardIds,
]

/** Collectible card ids a hero of the given class may add to its deck (class + neutral). */
export function collectibleCardIdsForClass(cardClass: string): string[] {
  const cls = (classCardArrays[cardClass] ?? []).filter((c) => !c.token).map((c) => c.id)
  return [...cls, ...collectibleNeutralCardIds]
}

/** Bucket ids offered to a hero of the given class (its class buckets + neutral). */
export function bucketIdsForClass(cardClass: string): string[] {
  return buckets
    .filter((b) => b.cardClass === cardClass || b.cardClass === 'neutral')
    .map((b) => b.id)
}

export const passiveTreasureIds: string[] = passiveTreasures.map((t) => t.id)
export const activeTreasureIds: string[] = activeTreasures.map((t) => t.id)
export const bucketIds: string[] = buckets.map((b) => b.id)
export const enemyIds: string[] = enemies.map((e) => e.id)

export {
  tokenCards,
  neutralCards,
  enemyCards,
  druidCards,
  enemies,
  passiveTreasures,
  activeTreasures,
}

/* ----------------------------------------------------------------------------
 * Art manifest
 * ------------------------------------------------------------------------- */

/**
 * Patch downloaded art paths onto card / treasure / hero definitions.
 * The manifest maps our ids -> '/assets/.../<id>.png'. Cosmetic only.
 * @param manifest - id -> asset path map
 */
export function applyArtManifest(manifest: Record<string, string>): void {
  for (const card of allCards) {
    if (manifest[card.id]) card.art = manifest[card.id]
  }
  for (const t of allTreasures) {
    if (manifest[t.id]) {
      t.art = manifest[t.id]
      if (t.card && !t.card.art) t.card.art = manifest[t.id]
    }
  }
  for (const hp of heroPowers) {
    if (manifest[hp.id]) hp.art = manifest[hp.id]
  }
  for (const h of heroes) {
    if (manifest[h.id]) {
      h.art = manifest[h.id]
      h.portraitArt = manifest[h.id]
    }
  }
  // Enemy hero portraits (the run store copies portraitArt into the match's
  // enemy HeroState, and the run map shows the upcoming opponent with it).
  for (const e of enemies) {
    if (manifest[e.id]) e.portraitArt = manifest[e.id]
  }
}
