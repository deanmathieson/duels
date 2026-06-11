import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CardDef,
  EnemyDef,
  GameSetup,
  HeroState,
  PlayerSetup,
  RewardOffering,
  RewardType,
  RngState,
  RunStage,
  RunState,
} from '~/game/types'
import {
  RUN_TARGET_WINS,
  RUN_MAX_LOSSES,
  STARTING_HEALTH,
  HEALTH_PER_ROUND,
} from '~/game/types'
import {
  getCard,
  hasCard,
  generateOffering,
  generateTreasureOffering,
  deckSynergies,
  treasureWeight,
} from '~/game/index'
import type { RewardPools, TreasureCandidate } from '~/game/index'
import { dailyDateKey } from '~/game/run/meta'
import { nextInt, shuffle } from '~/game/rng'
import {
  getHeroDef,
  getTreasureDef,
  getBucketDef,
  getEnemyDef,
  hasEnemyDef,
  migrateCardIds,
  enemies,
  bucketIdsForClass,
  passiveTreasureIds,
  activeTreasureIds,
  initializeContent,
  isContentInitialized,
} from '~/data/registry'
import { scalingTreasureForRound } from '~/data/treasures/scaling'

const STORAGE_KEY = 'duels-run'

/** Cap on the player-built deck (signature treasure is the +1 16th card). */
const DECK_LIMIT = 15

/** Make sure the engine has its content registered before we build state. */
function ensureContent(): void {
  if (!isContentInitialized()) initializeContent()
}

/** Build a fresh, empty RunState at the hero-select stage. */
function freshRunState(seed: number): RunState {
  return {
    stage: 'heroSelect',
    heroId: undefined,
    heroPowerId: undefined,
    signatureTreasureId: undefined,
    deck: [],
    passiveTreasureIds: [],
    activeTreasureIds: [],
    wins: 0,
    losses: 0,
    maxHealth: STARTING_HEALTH,
    round: 1,
    seed,
    offering: undefined,
    currentEnemyId: undefined,
  }
}

/**
 * The run / meta-progression store. Owns the whole roguelike loop: hero draft,
 * deck build, the 12-win / 3-loss combat ladder, and reward offerings. Drives a
 * single match at a time through {@link useGameStore}. Persisted to localStorage
 * under 'duels-run' on every mutation and reloaded on startup.
 */
/**
 * Chance that a regular treasure offering rolls its jackpot slot (one of the
 * three choices drawn from the run-warping jackpot pool). Elite-kill bonus
 * offerings always roll it.
 */
const JACKPOT_CHANCE = 0.2

export const useRunStore = defineStore('run', () => {
  // --- core state (mirrors RunState) ---
  const stage = ref<RunStage>('heroSelect')
  const heroId = ref<string | undefined>(undefined)
  const heroPowerId = ref<string | undefined>(undefined)
  const signatureTreasureId = ref<string | undefined>(undefined)
  const deck = ref<string[]>([])
  const passiveTreasures = ref<string[]>([])
  const activeTreasures = ref<string[]>([])
  const wins = ref(0)
  const losses = ref(0)
  const maxHealth = ref(STARTING_HEALTH)
  const round = ref(1)
  const seed = ref(Date.now() & 0x7fffffff)
  const offering = ref<RewardOffering | undefined>(undefined)
  /** Reward offerings queued behind the current one (treasure round → treasure + bucket). */
  const rewardQueue = ref<RewardOffering[]>([])
  const currentEnemyId = ref<string | undefined>(undefined)
  /** 'daily' = the seeded one-attempt daily hunt; 'free' = a normal run. */
  const mode = ref<'free' | 'daily'>('free')

  /** True once a run has been started (used by the run page to gate redirects). */
  const active = ref(false)

  /** Seeded RNG advanced for reward generation (kept inside the persisted seed). */
  function rngState(): RngState {
    return { seed: seed.value }
  }

  /* ------------------------------------------------------------------------
   * Getters
   * --------------------------------------------------------------------- */

  /** The chosen hero's definition, or undefined before selection. */
  const heroDef = computed(() => (heroId.value ? getHeroDef(heroId.value) : undefined))

  /** Resolved CardDefs for every card in the built deck (excludes signature). */
  const deckCardDefs = computed<CardDef[]>(() => deck.value.map((id) => getCard(id)))

  /** Number of cards in the built deck (signature not counted). */
  const deckCount = computed(() => deck.value.length)

  /** Whether the deck has reached the 15-card build limit. */
  const deckFull = computed(() => deck.value.length >= DECK_LIMIT)

  /** The enemy definition for the current/next combat. */
  const currentEnemyDef = computed(() =>
    currentEnemyId.value ? getEnemyDef(currentEnemyId.value) : enemyForFight()
  )

  /** Human-readable run progress, e.g. "Round 3 · 2 Wins · 1 Loss". */
  const progressText = computed(() => {
    const w = `${wins.value} ${wins.value === 1 ? 'Win' : 'Wins'}`
    const l = `${losses.value} ${losses.value === 1 ? 'Loss' : 'Losses'}`
    return `Round ${round.value} · ${w} · ${l}`
  })

  /**
   * Can the given card still be added to the deck?
   * Rules: deck not full, card not already present (no duplicates), card exists.
   * @param cardId - the candidate card id
   */
  function canAdd(cardId: string): boolean {
    if (deck.value.length >= DECK_LIMIT) return false
    if (deck.value.includes(cardId)) return false
    return true
  }

  /* ------------------------------------------------------------------------
   * Persistence
   * --------------------------------------------------------------------- */

  /** Snapshot the reactive state into a plain RunState. */
  function snapshot(): RunState {
    return {
      stage: stage.value,
      heroId: heroId.value,
      heroPowerId: heroPowerId.value,
      signatureTreasureId: signatureTreasureId.value,
      deck: [...deck.value],
      passiveTreasureIds: [...passiveTreasures.value],
      activeTreasureIds: [...activeTreasures.value],
      wins: wins.value,
      losses: losses.value,
      maxHealth: maxHealth.value,
      round: round.value,
      seed: seed.value,
      offering: offering.value ? { ...offering.value, choices: [...offering.value.choices] } : undefined,
      rewardQueue: rewardQueue.value.map((o) => ({ ...o, choices: [...o.choices] })),
      currentEnemyId: currentEnemyId.value,
      mode: mode.value,
    }
  }

  /** Write the current run to localStorage. Safe to call from any mutation. */
  function save(): void {
    if (typeof window === 'undefined') return
    if (!active.value) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()))
    } catch {
      // Storage may be unavailable — ignore.
    }
  }

  /** Apply a plain RunState onto the reactive refs. */
  function hydrate(s: RunState): void {
    stage.value = s.stage
    heroId.value = s.heroId
    heroPowerId.value = s.heroPowerId
    signatureTreasureId.value = s.signatureTreasureId
    // Saved decks may reference card ids retired by content updates — map them
    // to their replacements (or drop them) instead of crashing on getCard.
    deck.value = migrateCardIds([...(s.deck ?? [])])
    passiveTreasures.value = [...(s.passiveTreasureIds ?? [])]
    activeTreasures.value = [...(s.activeTreasureIds ?? [])]
    wins.value = s.wins ?? 0
    losses.value = s.losses ?? 0
    maxHealth.value = s.maxHealth ?? STARTING_HEALTH
    round.value = s.round ?? 1
    seed.value = s.seed ?? (Date.now() & 0x7fffffff)
    offering.value = s.offering
    rewardQueue.value = (s.rewardQueue ?? []).map((o) => ({ ...o, choices: [...o.choices] }))
    // A retired enemy id falls back to the round-based lineup.
    currentEnemyId.value = s.currentEnemyId && hasEnemyDef(s.currentEnemyId) ? s.currentEnemyId : undefined
    mode.value = s.mode ?? 'free'
    active.value = true
  }

  /**
   * Load a saved run from localStorage, if any.
   * @returns true when an in-progress run was restored.
   */
  function loadFromStorage(): boolean {
    if (typeof window === 'undefined') return false
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw) as RunState
      if (!data || typeof data.stage !== 'string') return false
      // Content must be registered before hydrate() can validate card ids.
      ensureContent()
      hydrate(data)
      return true
    } catch {
      return false
    }
  }

  /** Remove any persisted run. */
  function clearStorage(): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------------------
   * Run lifecycle
   * --------------------------------------------------------------------- */

  /**
   * Begin a brand-new run at the hero-select stage. Clears any prior progress.
   * @param newSeed - optional deterministic seed (defaults to a time-based seed)
   */
  function startNewRun(newSeed?: number): void {
    ensureContent()
    const s = freshRunState(newSeed ?? (Date.now() & 0x7fffffff))
    hydrate(s)
    mode.value = 'free'
    active.value = true
    // Auto-pick the only hero so the player lands on the hero portrait screen,
    // but leave selection explicit (HeroSelect calls selectHero to advance).
    save()
  }

  /**
   * Start today's Daily Hunt: the date-seeded run with the day's fixed calling
   * (locks don't apply — the daily is a teaser for locked callings). One
   * attempt per day; a no-op if today's hunt is already done.
   */
  function startDailyRun(): void {
    const meta = useMetaStore()
    const d = meta.dailyStatus()
    if (d.playedToday) return
    startNewRun(d.seed)
    mode.value = 'daily'
    selectHero(d.heroId)
    save()
  }

  /** Abandon the current run entirely and wipe its save. */
  function abandon(): void {
    clearStorage()
    active.value = false
    const s = freshRunState(Date.now() & 0x7fffffff)
    hydrate(s)
    active.value = false
  }

  /* ------------------------------------------------------------------------
   * Draft stages
   * --------------------------------------------------------------------- */

  /** Pick the run hero and advance to hero-power selection. */
  function selectHero(id: string): void {
    ensureContent()
    heroId.value = id
    stage.value = 'heroPowerSelect'
    save()
  }

  /** Pick the hero power and advance to signature-treasure selection. */
  function selectHeroPower(id: string): void {
    heroPowerId.value = id
    stage.value = 'signatureSelect'
    save()
  }

  /** Pick the signature treasure and advance to deck building. */
  function selectSignature(id: string): void {
    signatureTreasureId.value = id
    stage.value = 'deckBuild'
    save()
  }

  /* ------------------------------------------------------------------------
   * Deck building
   * --------------------------------------------------------------------- */

  /** Add a card to the deck if allowed (no duplicates, under the limit). */
  function deckAdd(cardId: string): void {
    if (!canAdd(cardId)) return
    deck.value = [...deck.value, cardId]
    save()
  }

  /** Remove the first matching card from the deck. */
  function deckRemove(cardId: string): void {
    const i = deck.value.indexOf(cardId)
    if (i < 0) return
    const next = [...deck.value]
    next.splice(i, 1)
    deck.value = next
    save()
  }

  /** Toggle a card in/out of the deck (add if absent & allowed, else remove). */
  function deckToggle(cardId: string): void {
    if (deck.value.includes(cardId)) deckRemove(cardId)
    else deckAdd(cardId)
  }

  /** Lock in the deck (must be exactly the build limit) and start the first combat. */
  function confirmDeck(): void {
    if (deck.value.length !== DECK_LIMIT) return
    stage.value = 'map'
    save()
    startNextCombat()
  }

  /* ------------------------------------------------------------------------
   * Combat
   * --------------------------------------------------------------------- */

  /**
   * The run's full 12-fight enemy lineup — a pure function of the run seed
   * (dedicated RNG stream, mirroring enemyGrowthCards) so it needs no extra
   * persisted state and old saves recompute the same lineup.
   *
   * Band structure: 2 from each of tiers 1-4, all 3 elites (shuffled), then
   * 1 of the bosses. Fights are indexed by WINS, so a loss is a rematch
   * against the same lineup entry (the round-based HP scaling makes the
   * rematch slightly harder).
   */
  function enemyLineup(): EnemyDef[] {
    const rng: RngState = { seed: (seed.value ^ 0x2545f491) | 0 }
    const band = (tier: number): EnemyDef[] => {
      const pool = enemies.filter((e) => !e.isBoss && e.tier === tier)
      shuffle(rng, pool)
      return pool
    }
    const lineup: EnemyDef[] = []
    for (const tier of [1, 2, 3, 4]) lineup.push(...band(tier).slice(0, 2))
    lineup.push(...band(5).slice(0, 3))
    const bosses = enemies.filter((e) => e.isBoss)
    shuffle(rng, bosses)
    if (bosses.length > 0) lineup.push(bosses[0])
    // Safety: if bands are short (test fixtures), pad by cycling what we have.
    while (lineup.length < RUN_TARGET_WINS && lineup.length > 0) {
      lineup.push(lineup[lineup.length % Math.max(1, lineup.length - 1)])
    }
    return lineup
  }

  /** The enemy for the current fight: the lineup entry at the win count. */
  function enemyForFight(): EnemyDef {
    const lineup = enemyLineup()
    return lineup[Math.min(wins.value, RUN_TARGET_WINS - 1)] ?? enemies[0]
  }

  /**
   * Cards the enemy has "drafted" by a given (1-based) round: one bucket from
   * its class/neutral pool per completed round, mirroring the player's
   * bucket-after-every-fight growth so opposing decks keep pace with ours.
   * Deterministic for a given run seed; uses a local RNG stream so enemy
   * drafting never disturbs the persisted reward RNG.
   */
  function enemyGrowthCards(heroClass: string, r: number): string[] {
    const pool = bucketIdsForClass(heroClass)
    if (pool.length === 0 || r <= 1) return []
    const rng: RngState = { seed: (seed.value ^ 0xb7e15163) | 0 }
    const cards: string[] = []
    for (let i = 1; i < r; i++) {
      const bucketId = pool[nextInt(rng, pool.length)]
      cards.push(...getBucketDef(bucketId).cardIds)
    }
    return cards
  }

  /**
   * Build both PlayerSetups, assemble the GameSetup, and hand off to the game
   * store to begin the fight. Sets stage to 'combat'.
   */
  function startNextCombat(): void {
    ensureContent()
    const game = useGameStore()

    const enemyDef = enemyForFight()
    currentEnemyId.value = enemyDef.id

    // --- human setup ---
    const hDef = getHeroDef(heroId.value as string)
    const humanHero: HeroState = {
      name: hDef.name,
      cardClass: hDef.cardClass,
      health: maxHealth.value,
      maxHealth: maxHealth.value,
      armor: 0,
      attack: 0,
      attacksThisTurn: 0,
      art: hDef.portraitArt ?? hDef.art,
    }
    // Signature treasure: most embed a card added to the deck; a few are PASSIVE
    // (auras/triggers, no card) and instead attach to the player like a passive treasure.
    const sigDef = signatureTreasureId.value ? getTreasureDef(signatureTreasureId.value) : undefined
    const humanDeck = sigDef?.card ? [sigDef.card.id, ...deck.value] : [...deck.value]
    const sigPassiveIds = sigDef && !sigDef.card ? [sigDef.id] : []

    const human: PlayerSetup = {
      hero: humanHero,
      heroPowerId: heroPowerId.value as string,
      deckCardIds: humanDeck,
      passiveTreasureIds: [...passiveTreasures.value, ...sigPassiveIds],
      isAI: false,
    }

    // --- enemy setup --- scales with the run: more health each round, a minion
    // stat buff at higher rounds, and extra drafted cards so the enemy's deck
    // grows alongside the player's.
    const baseHealth = enemyDef.startingHealth ?? STARTING_HEALTH
    const enemyHealth = baseHealth + Math.max(0, round.value - 1) * 4
    const enemyHero: HeroState = {
      name: enemyDef.heroName,
      cardClass: enemyDef.heroClass,
      health: enemyHealth,
      maxHealth: enemyHealth,
      armor: 0,
      attack: 0,
      attacksThisTurn: 0,
      art: enemyDef.portraitArt,
    }
    const scaleId = scalingTreasureForRound(round.value)
    const enemyPassives = [
      ...(enemyDef.passiveTreasureIds ?? []),
      ...(scaleId ? [scaleId] : []),
    ]
    const enemy: PlayerSetup = {
      hero: enemyHero,
      heroPowerId: enemyDef.heroPowerId,
      deckCardIds: [...enemyDef.deck, ...enemyGrowthCards(enemyDef.heroClass, round.value)],
      passiveTreasureIds: enemyPassives,
      isAI: true,
    }

    // Odd rounds: human goes first; even rounds: enemy first.
    const firstPlayer = round.value % 2 === 1 ? 0 : 1
    const setup: GameSetup = { players: [human, enemy], firstPlayer }

    stage.value = 'combat'
    save()

    // Tell the game store which enemy this is so it can resolve the AI profile.
    if (typeof (game as { setEnemyById?: (id: string) => void }).setEnemyById === 'function') {
      ;(game as unknown as { setEnemyById: (id: string) => void }).setEnemyById(enemyDef.id)
    }

    // Derive a per-combat seed from the run seed + round so matches are
    // deterministic for a given run but differ each round.
    const combatSeed = (seed.value ^ (round.value * 0x9e3779b1)) | 0
    game.startMatch(setup, combatSeed)
  }

  /* ------------------------------------------------------------------------
   * Combat resolution -> rewards
   * --------------------------------------------------------------------- */

  /**
   * Resolve the just-finished combat. Called by the run page's watcher when the
   * game store reaches phase 'gameOver'.
   * @param didWin - true when the human (player 0) won
   */
  function resolveCombat(didWin: boolean): void {
    // Capture the beaten enemy BEFORE state advances (elite bonus reward).
    const beaten =
      currentEnemyId.value && hasEnemyDef(currentEnemyId.value)
        ? getEnemyDef(currentEnemyId.value)
        : undefined

    if (didWin) wins.value += 1
    else losses.value += 1

    // Heal/grow between fights.
    maxHealth.value += HEALTH_PER_ROUND

    if (wins.value >= RUN_TARGET_WINS) {
      stage.value = 'victory'
      recordToLedger('victory')
      save()
      return
    }
    if (losses.value >= RUN_MAX_LOSSES) {
      stage.value = 'defeat'
      recordToLedger('defeat')
      save()
      return
    }

    // Build this round's rewards, then advance the ladder.
    const completedRound = round.value
    round.value += 1
    buildRewards(completedRound, didWin && !!beaten?.elite)
  }

  /** Write the finished run into the permanent ledger (abandons never get here). */
  function recordToLedger(result: 'victory' | 'defeat'): void {
    const meta = useMetaStore()
    meta.recordRunEnd({
      date: dailyDateKey(new Date()),
      heroId: heroId.value ?? 'unknown',
      wins: wins.value,
      losses: losses.value,
      result,
      daily: mode.value === 'daily' || undefined,
    })
  }

  /**
   * Reward pools handed to the engine's pure offering generator.
   * Passive treasures are tier-banded: the round-1 pick offers tier 1
   * (archetype nudges), the round-3 pick offers tier 2 (game-warping).
   * Treasures without a tier count as tier 1.
   * @param completedRound - the round whose rewards are being built
   */
  function rewardPools(completedRound?: number): RewardPools {
    const heroClass = heroDef.value?.cardClass ?? 'neutral'
    const passiveTier = completedRound === 3 ? 2 : 1
    return {
      buckets: bucketIdsForClass(heroClass),
      passiveTreasures: passiveTreasureIds.filter((id) => {
        if (passiveTreasures.value.includes(id)) return false
        if (getTreasureDef(id).jackpot) return false
        if (completedRound === undefined) return true
        return (getTreasureDef(id).tier ?? 1) === passiveTier
      }),
      activeTreasures: activeTreasureIds.filter(
        (id) => !activeTreasures.value.includes(id) && !getTreasureDef(id).jackpot
      ),
    }
  }

  /**
   * Synergy-weighted treasure candidates for an offering. The deck's archetype
   * lean (deckSynergies) boosts treasures whose tags match what the player is
   * building. Jackpot treasures are always eligible (they ignore the passive
   * tier banding) but are only ever drawn via the offering's jackpot slot.
   * @param type - which treasure pool to draw from
   * @param completedRound - the round whose rewards are being built (passive tier banding)
   */
  function treasureCandidates(
    type: 'passiveTreasure' | 'activeTreasure',
    completedRound?: number
  ): TreasureCandidate[] {
    const synergies = deckSynergies(deck.value.filter((id) => hasCard(id)).map((id) => getCard(id)))
    const owned = type === 'passiveTreasure' ? passiveTreasures.value : activeTreasures.value
    const ids = type === 'passiveTreasure' ? passiveTreasureIds : activeTreasureIds
    const passiveTier = completedRound === 3 ? 2 : 1
    return ids
      .filter((id) => {
        if (owned.includes(id)) return false
        const def = getTreasureDef(id)
        if (def.jackpot) return true
        if (type === 'passiveTreasure' && completedRound !== undefined) {
          return (def.tier ?? 1) === passiveTier
        }
        return true
      })
      .map((id) => {
        const def = getTreasureDef(id)
        return { id, weight: treasureWeight(def.tags, synergies), jackpot: def.jackpot }
      })
  }

  /**
   * The treasure (if any) offered after a given completed round, per Duels rules:
   *  - passive treasure after rounds 1 & 3
   *  - active treasure after rounds 2, 4, 5, 7, 9, 11, 13
   *  - no treasure on other rounds (bucket only)
   */
  function treasureTypeForRound(r: number): 'passiveTreasure' | 'activeTreasure' | null {
    if (r === 1 || r === 3) return 'passiveTreasure'
    if ([2, 4, 5, 7, 9, 11, 13].includes(r)) return 'activeTreasure'
    return null
  }

  /**
   * Build the reward offerings for a completed round and present the first.
   * A card bucket comes after EVERY round, plus a treasure on scheduled
   * rounds — so a treasure round queues a treasure pick THEN a bucket pick.
   * Beating an ELITE adds a bonus active-treasure pick on top.
   * @param completedRound - the round just finished (1-based)
   * @param eliteBonus - true when an elite enemy was just defeated
   */
  function buildRewards(completedRound: number, eliteBonus = false): void {
    const rng = rngState()
    const queue: RewardOffering[] = []

    const tType = treasureTypeForRound(completedRound)
    if (tType) {
      const t = generateTreasureOffering(
        tType,
        rng,
        treasureCandidates(tType, completedRound),
        JACKPOT_CHANCE
      )
      if (t.choices.length > 0) queue.push(t)
    }
    if (eliteBonus) {
      // Elite kills guarantee a jackpot among the bonus treasure choices.
      const bonus = generateTreasureOffering(
        'activeTreasure',
        rng,
        treasureCandidates('activeTreasure', completedRound),
        1
      )
      if (bonus.choices.length > 0) queue.push(bonus)
    }
    const bucket = generateOffering('bucket', completedRound, rng, rewardPools(completedRound))
    if (bucket.choices.length > 0) queue.push(bucket)

    // Any mythic the player is about to be SHOWN counts as discovered (codex).
    const offeredMythics = queue
      .flatMap((o) => o.choices)
      .filter((id) => {
        try {
          return !!getTreasureDef(id).jackpot
        } catch {
          return false
        }
      })
    if (offeredMythics.length) useMetaStore().markMythicsSeen(offeredMythics)

    seed.value = rng.seed // persist the advanced RNG
    rewardQueue.value = queue
    presentNextReward()
  }

  /** Present the next queued reward, or start the next fight when none remain. */
  function presentNextReward(): void {
    const q = [...rewardQueue.value]
    const next = q.shift()
    rewardQueue.value = q
    if (!next) {
      offering.value = undefined
      save()
      startNextCombat()
      return
    }
    offering.value = next
    stage.value = next.type === 'bucket' ? 'reward' : 'treasure'
    save()
  }

  /** Whether the current offering may be skipped (buckets are optional; treasures are not). */
  const canSkipReward = computed(() => offering.value?.type === 'bucket')

  /* ------------------------------------------------------------------------
   * Reward selection
   * --------------------------------------------------------------------- */

  /**
   * Apply the chosen reward (bucket cards or a treasure) and proceed to the next
   * combat. Buckets push all 3 cards into the deck (allowed to exceed 15 as run
   * growth). Treasures attach themselves; active treasures also add their card.
   * @param id - the chosen bucket or treasure id
   */
  function chooseReward(id: string): void {
    const type = offering.value?.type
    if (type === 'bucket') {
      const bucket = getBucketDef(id)
      deck.value = [...deck.value, ...bucket.cardIds]
    } else if (type === 'passiveTreasure') {
      if (!passiveTreasures.value.includes(id)) {
        passiveTreasures.value = [...passiveTreasures.value, id]
      }
    } else if (type === 'activeTreasure') {
      if (!activeTreasures.value.includes(id)) {
        activeTreasures.value = [...activeTreasures.value, id]
      }
      const def = getTreasureDef(id)
      if (def.card) deck.value = [...deck.value, def.card.id]
    }

    // Present the next queued reward (e.g. the bucket after a treasure), else fight.
    presentNextReward()
  }

  /** Skip the current reward without taking anything (buckets only), then continue. */
  function skipReward(): void {
    presentNextReward()
  }

  return {
    // state
    stage,
    heroId,
    heroPowerId,
    signatureTreasureId,
    deck,
    passiveTreasureIds: passiveTreasures,
    activeTreasureIds: activeTreasures,
    wins,
    losses,
    maxHealth,
    round,
    seed,
    offering,
    currentEnemyId,
    active,
    // getters
    heroDef,
    deckCardDefs,
    deckCount,
    deckFull,
    currentEnemyDef,
    progressText,
    canAdd,
    canSkipReward,
    mode,
    // lifecycle
    startNewRun,
    startDailyRun,
    abandon,
    loadFromStorage,
    save,
    // draft
    selectHero,
    selectHeroPower,
    selectSignature,
    // deck
    deckAdd,
    deckRemove,
    deckToggle,
    confirmDeck,
    // combat
    enemyLineup,
    startNextCombat,
    resolveCombat,
    // rewards
    chooseReward,
    skipReward,
  }
})
