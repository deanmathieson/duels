/**
 * ============================================================================
 *  FROZEN CONTRACT — game/types.ts
 * ============================================================================
 *  Every worker (engine, data, AI, UI) codes against these types. They are the
 *  single source of truth. Do NOT add bespoke per-card fields here; express card
 *  behaviour through the `EffectSpec` / `TriggerDef` / `AuraDef` vocabularies, or
 *  the `ScriptId` escape hatch for genuinely compound effects.
 *
 *  Design rule: the engine in /game is PURE and FRAMEWORK-AGNOSTIC. State is fully
 *  serializable, RNG is seeded and stored in state, and every mutation flows through
 *  `applyAction(state, action) -> { state, events }`. This keeps a future PvP server
 *  able to run the exact same reducer authoritatively.
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * Identifiers & enums
 * ------------------------------------------------------------------------- */

export type PlayerId = 0 | 1

export type CardType = 'minion' | 'spell' | 'weapon' | 'hero_power'

export type Rarity = 'free' | 'common' | 'rare' | 'epic' | 'legendary'

export type CardClass =
  | 'neutral'
  | 'druid'
  | 'hunter'
  | 'mage'
  | 'paladin'
  | 'priest'
  | 'rogue'
  | 'shaman'
  | 'warlock'
  | 'warrior'

export type MinionTribe =
  | 'none'
  | 'beast'
  | 'dragon'
  | 'demon'
  | 'elemental'
  | 'mech'
  | 'murloc'
  | 'pirate'
  | 'totem'
  | 'ancient'

export type SpellSchool = 'none' | 'nature' | 'fire' | 'frost' | 'arcane' | 'shadow' | 'holy'

/** Keywords the engine understands. Static (on the card) or granted at runtime. */
export type Keyword =
  | 'taunt'
  | 'divineShield'
  | 'rush'
  | 'charge'
  | 'windfury'
  | 'lifesteal'
  | 'poisonous'
  | 'stealth'
  | 'spellDamage' // carries a numeric amount via CardDef.spellDamage

/* ----------------------------------------------------------------------------
 * Targeting & filtering vocabulary
 * ------------------------------------------------------------------------- */

/**
 * Where an effect applies. `chosenTarget` is resolved from the Action's
 * `targetInstanceId` (set when CardDef.targeted is true). `self`/`triggerSource`
 * are resolved from the firing context (battlecry self, deathrattle self, the
 * minion that died in onMinionDeath, etc.).
 */
export type TargetSelector =
  | 'none'
  | 'chosenTarget' // any character the player picked (minion or hero)
  | 'self' // the source minion of the effect
  | 'triggerSource' // the entity that fired the trigger (e.g. the dead minion)
  | 'friendlyHero'
  | 'enemyHero'
  | 'friendlyMinions'
  | 'enemyMinions'
  | 'otherFriendlyMinions' // friendly minions except `self`
  | 'allMinions'
  | 'allFriendlyCharacters'
  | 'allEnemyCharacters'
  | 'allCharacters'
  | 'otherEnemies' // enemy characters EXCEPT `chosenTarget` (e.g. Swipe splash)
  | 'adjacentToTarget' // minions adjacent to `chosenTarget` on its owner's board
  | 'randomEnemyMinion'
  | 'randomEnemy'
  | 'randomFriendlyMinion'
  | 'randomFriendlyDeathrattleMinion' // random friendly minion with a (non-silenced) deathrattle

/** Pools used by discover / add-random / random-summon style effects. */
export type CardPool =
  | 'any'
  | 'spell'
  | 'minion'
  | 'beast'
  | 'druidSpell'
  | 'chooseOne'
  | 'legendaryMinion'
  | 'deathrattleMinion'

/** Filters used by static auras and cost reduction. */
export type CardFilter =
  | 'all'
  | 'spell'
  | 'minion'
  | 'beast'
  | 'taunt'
  | 'dragon'
  | 'battlecry'
  | 'deathrattle'
  | 'costGte5'
  | 'costLte2'

/* ----------------------------------------------------------------------------
 * EffectSpec — the closed union the engine interprets.
 * Worker A MUST implement EVERY variant (throw on an unhandled kind in dev).
 * Workers B/C may ONLY use variants from this union (plus `script`).
 * ------------------------------------------------------------------------- */

export type EffectSpec =
  // --- damage / healing ---
  | { kind: 'damage'; amount: number; target: TargetSelector }
  | { kind: 'heal'; amount: number; target: TargetSelector }
  // --- card flow ---
  | { kind: 'draw'; count: number; who?: 'self' | 'opponent' }
  | { kind: 'addCardToHand'; cardId: string; count?: number; who?: 'self' | 'opponent' }
  /**
   * Generation class lock: by default `addRandomCardToHand`/`discover` pools are
   * restricted to the casting hero's class + neutral. Set `fromClass` to a
   * specific class ("Add 3 random Mage spells") or 'any' ("from any class").
   */
  | { kind: 'addRandomCardToHand'; pool: CardPool; count?: number; costReduction?: number; fromClass?: CardClass | 'any' }
  | { kind: 'gainCoin'; count: number } // adds N copies of the 'the_coin' card
  | { kind: 'discover'; pool: CardPool; costReduction?: number; fromClass?: CardClass | 'any' }
  | { kind: 'shuffleIntoDeck'; cardId: string; count?: number }
  // --- mana ---
  | { kind: 'gainManaCrystal'; count: number; empty?: boolean } // permanent crystal(s); empty=Wild Growth
  | { kind: 'gainManaThisTurn'; amount: number } // temporary mana (Innervate, Supercharge)
  | { kind: 'refreshMana' } // refill current mana to max
  | { kind: 'reduceCostInHand'; amount: number; minCost?: number; filter?: CardFilter }
  // --- summon / board ---
  | { kind: 'summon'; token: string; count: number; side?: 'friendly' | 'enemy' }
  | { kind: 'summonPerManaCrystal'; token: string } // Warden's Insight option 2
  // --- buffs / keywords ---
  | { kind: 'buff'; atk: number; health: number; target: TargetSelector }
  | { kind: 'buffThisTurn'; atk: number; target: TargetSelector } // Savage Roar / Power of the Wild-ish
  | { kind: 'giveKeyword'; keyword: Keyword; target: TargetSelector }
  | { kind: 'giveDivineShield'; target: TargetSelector }
  | { kind: 'setStats'; atk?: number; health?: number; target: TargetSelector }
  | { kind: 'silence'; target: TargetSelector }
  // --- removal / armor / hero ---
  | { kind: 'destroy'; target: TargetSelector }
  | { kind: 'gainArmor'; amount: number; who?: 'self' | 'opponent' }
  | { kind: 'heroAttackThisTurn'; amount: number } // Nature's Gifts option 1
  | { kind: 'spellDamageThisTurnHero'; amount: number } // Nature's Gifts option 2
  | { kind: 'equipWeapon'; cardId: string }
  // --- deathrattle archetype ---
  /** Fire the deathrattles of the targeted minion(s) without killing them. */
  | { kind: 'triggerDeathrattles'; target: TargetSelector }
  /** Resummon up to `count` random friendly minions that DIED this game. */
  | { kind: 'resummonDeadMinion'; count: number; filter?: CardFilter }
  /** Summon a copy of the referenced minion (works for dead trigger sources);
   *  `atk`/`health` are ABSOLUTE overrides (e.g. a 1/1 copy). */
  | { kind: 'summonCopy'; of: 'triggerSource' | 'chosenTarget'; atk?: number; health?: number }
  // --- escape hatch for compound logic (Worker A implements each ScriptId) ---
  | { kind: 'script'; id: ScriptId }

/** Compound / multi-step effects implemented by hand in game/effects scripts. */
export type ScriptId =
  | 'harvestTime' // destroy chosen minion, summon two 1/1 Saplings for THAT minion's owner
  | 'mulch' // destroy chosen minion, add a random minion to the opponent's hand
  | 'marvelousMycelium' // discover a Choose One card (both effects combined), shuffle in; repeat 3x
  | 'herdingHornCopy' // weapon trigger: after you play a Beast, summon a copy of it, lose 1 durability
  | 'zukaraRecast' // minion trigger: after you play a spell costing 4+, cast it again at random targets
  | 'awakenedAncientUpgrade' // signature: improves each round (optional, can be a no-op initially)

/** A "Choose One" option set. For minion choose-one (e.g. Druid of the Claw) the
 *  chosen `stats`/`keywords` are applied to the summoned minion itself; for spells
 *  the `effects` are run. `stats` are ABSOLUTE final values (data author computes). */
export interface ChooseOneOption {
  text: string
  effects?: EffectSpec[]
  stats?: { attack?: number; health?: number }
  keywords?: Keyword[]
}

/* ----------------------------------------------------------------------------
 * Triggers & auras (ongoing effects — used by minions and passive treasures)
 * ------------------------------------------------------------------------- */

export type TriggerEvent =
  | 'startOfGame'
  | 'startOfTurn' // owner's turn begins
  | 'endOfTurn' // owner's turn ends
  | 'onPlayCard' // owner plays any card
  | 'onPlayMinion'
  | 'onPlaySpell'
  | 'onPlayBeast'
  | 'onSpellCast4Plus'
  | 'onCardCost5Plus'
  | 'onMinionDeath' // any minion dies (triggerSource = the dead minion)
  | 'onFriendlyMinionDeath'
  // Damage triggers fire when a minion loses health (Divine Shield absorbs do
  // not count). triggerSource = the damaged minion. Lethal damage still fires.
  | 'onSelfDamaged' // the trigger's own minion takes damage (Imp Gang Boss)
  | 'onFriendlyMinionDamaged' // a friendly minion (incl. self) takes damage (Armorsmith)
  | 'onMinionDamaged' // any minion takes damage (Frothing Berserker)
  | 'afterAttack'
  | 'onHeroPowerUsed'

export interface TriggerDef {
  event: TriggerEvent
  effects?: EffectSpec[]
  scriptId?: ScriptId
  /** Optional gate, e.g. only when the played card is a Beast. Engine evaluates. */
  condition?: TriggerCondition
}

export type TriggerCondition =
  | 'always'
  | 'cardIsBeast'
  | 'cardIsSpell'
  | 'cardCost4Plus'
  | 'cardCost5Plus'
  | 'cardHasDeathrattle'
  | 'cardHasBattlecry'
  | 'cardIsDemon'

/** Static, continuous modifiers (passive treasures, aura minions). */
export type AuraDef =
  | { kind: 'costReduction'; amount: number; filter: CardFilter }
  | { kind: 'minionStat'; atk?: number; health?: number; filter?: CardFilter }
  | { kind: 'spellDamage'; amount: number }
  | { kind: 'giveKeyword'; keyword: Keyword; filter?: CardFilter }
  /** The owner's deathrattles/battlecries fire one extra time (stacks). */
  | { kind: 'triggerTwice'; what: 'deathrattle' | 'battlecry' }
  /** The first spell the owner casts each turn is cast twice. */
  | { kind: 'firstSpellEachTurnTwice' }

/* ----------------------------------------------------------------------------
 * Card / Hero / Treasure definitions (static data in /data)
 * ------------------------------------------------------------------------- */

export interface CardDef {
  id: string
  name: string
  cost: number
  type: CardType
  cardClass: CardClass
  rarity: Rarity
  /** Display text (may contain simple markup like **Battlecry:**). */
  text: string
  /** Asset path filled in from the art manifest (Worker E). */
  art?: string
  flavor?: string

  // minion
  attack?: number
  health?: number
  tribe?: MinionTribe
  keywords?: Keyword[]
  /** Spell Damage amount this minion grants while on board. */
  spellDamage?: number

  // weapon
  durability?: number

  // behaviour (all optional)
  battlecry?: EffectSpec[]
  deathrattle?: EffectSpec[]
  spell?: EffectSpec[] // run when a spell card is cast
  chooseOne?: ChooseOneOption[] // present => player picks one on play
  triggers?: TriggerDef[] // ongoing triggered effects while in play
  auras?: AuraDef[] // ongoing static auras while in play
  scriptId?: ScriptId // fully custom on-play behaviour

  /** Requires a target to play (spell/battlecry). */
  targeted?: boolean
  /** Which targets are legal when `targeted`. Engine validates. */
  targetFilter?: TargetSelector
  /** Max CURRENT Attack a minion may have to be a legal target (Shadow Word:
   *  Pain). Checked against the live attack — buffs and auras included — both
   *  in getValidTargets and at play time; hero targets are never legal. */
  targetMaxAttack?: number
  /** Token cards (Treant, Sapling, The Coin) are not collectible/offered. */
  token?: boolean
  /** Set/expansion id, used to build card buckets. */
  set?: string
}

export type HeroPowerId = string

export interface HeroPowerDef {
  id: HeroPowerId
  name: string
  cost: number
  text: string
  art?: string
  effects?: EffectSpec[]
  chooseOne?: ChooseOneOption[]
  scriptId?: ScriptId
  targeted?: boolean
  targetFilter?: TargetSelector
}

export interface HeroDef {
  id: string
  name: string
  cardClass: CardClass
  /** Hero powers the player may choose from at run start. */
  heroPowers: HeroPowerId[]
  /** Signature treasure ids the player may choose from at run start. */
  signatureTreasures: string[]
  art?: string
  portraitArt?: string
}

export type TreasureKind = 'passive' | 'active' | 'signature'

export interface TreasureDef {
  id: string
  name: string
  kind: TreasureKind
  text: string
  art?: string

  // passive treasures: ongoing effects attached to the player
  auras?: AuraDef[]
  triggers?: TriggerDef[]
  startOfGame?: EffectSpec[]

  // active & signature treasures: a real card added to the deck/hand
  card?: CardDef

  /** Hint for the AI / UI on who this is good for. */
  tags?: string[]

  /** Passive offering band: tier 1 = early (round 1), tier 2 = game-warping
   *  (round 3). Treasures without a tier default to 1. */
  tier?: 1 | 2
}

/** A card "bucket" reward: pick 1 of 3 buckets, each adds these cards to the deck. */
export interface BucketDef {
  id: string
  name: string
  set?: string
  /** Class this bucket belongs to ('neutral' buckets are offered to every hero). */
  cardClass?: CardClass
  cardIds: string[] // typically 3
}

/* ----------------------------------------------------------------------------
 * Enemies & AI
 * ------------------------------------------------------------------------- */

export type AiProfileName = 'aggro' | 'midrange' | 'control' | 'tempo'

export interface EnemyDef {
  id: string
  name: string
  /** Difficulty bracket: enemies get tougher as win-count climbs. */
  tier: number
  heroName: string
  heroClass: CardClass
  heroPowerId: HeroPowerId
  /** 30 unless a boss overrides. */
  startingHealth?: number
  /** Card ids forming the enemy deck (duplicates allowed for enemies). */
  deck: string[]
  aiProfile: AiProfileName
  passiveTreasureIds?: string[] // bosses may carry treasures
  /** Elite encounters grant a bonus treasure reward on defeat. */
  elite?: boolean
  portraitArt?: string
  isBoss?: boolean
}

/** Aggression / planning weights for the heuristic AI. */
export interface AiProfile {
  name: AiProfileName
  /** 0..1 — how much the AI values hitting face vs trading. */
  aggression: number
  /** 0..1 — willingness to use hero power proactively. */
  heroPowerEagerness: number
}

/* ----------------------------------------------------------------------------
 * Runtime instances (live in GameState, mutable)
 * ------------------------------------------------------------------------- */

export interface CardInstance {
  instanceId: string
  cardId: string
  /** Base cost snapshot; live cost is computed via queries with auras applied. */
  cost: number
  /** Chosen option index if the player pre-selected (usually decided on play). */
  chooseOneIndex?: number
  /** Temporary "costs N less" reductions accrued in hand (sticky reductions). */
  costReduction?: number
}

export interface MinionInstance {
  instanceId: string
  cardId: string
  attack: number
  health: number
  maxHealth: number
  tribe: MinionTribe
  keywords: Keyword[]
  divineShield: boolean
  /** Attacks already made this turn. */
  attacksThisTurn: number
  /** 1 normally, 2 with windfury. */
  maxAttacks: number
  summonedThisTurn: boolean
  silenced: boolean
  spellDamage: number
  /** Snapshot of triggers/auras this minion contributes (resolved from CardDef). */
  hasTriggers: boolean
  hasAuras: boolean
}

export interface WeaponInstance {
  instanceId: string
  cardId: string
  attack: number
  durability: number
}

export interface HeroState {
  name: string
  cardClass: CardClass
  health: number
  maxHealth: number
  armor: number
  /** Attack granted by weapon / temporary buffs for this turn. */
  attack: number
  attacksThisTurn: number
  art?: string
}

export interface ManaState {
  current: number
  max: number
}

/** A passive treasure attached to a player for the whole run. */
export interface PassiveState {
  treasureId: string
  auras: AuraDef[]
  triggers: TriggerDef[]
}

export interface PlayerState {
  id: PlayerId
  hero: HeroState
  mana: ManaState
  hand: CardInstance[]
  deck: CardInstance[]
  board: MinionInstance[]
  graveyard: CardInstance[]
  weapon?: WeaponInstance
  heroPower: { id: HeroPowerId; cost: number; usedThisTurn: boolean }
  fatigue: number
  passives: PassiveState[]
  /** Live Spell Damage from board + auras (recomputed by engine). */
  spellDamage: number
  isAI: boolean
}

/* ----------------------------------------------------------------------------
 * Game state, events, actions
 * ------------------------------------------------------------------------- */

/** Seeded RNG state (e.g. Mulberry32). Stored in state for determinism/replay. */
export interface RngState {
  seed: number
}

export type GamePhase = 'mulligan' | 'main' | 'gameOver'

/** When the engine needs further input mid-resolution (discover/choose/target). */
export interface PendingChoice {
  type: 'discover' | 'chooseOne' | 'target'
  player: PlayerId
  sourceInstanceId?: string
  /** Candidate cards for discover, or option metadata for chooseOne. */
  options: { cardId?: string; index?: number; text?: string }[]
}

export interface GameState {
  turn: number
  activePlayer: PlayerId
  players: [PlayerState, PlayerState]
  rng: RngState
  phase: GamePhase
  winner?: PlayerId | 'draw'
  pendingChoice?: PendingChoice
  /** Append-only log of events this game (UI animation + replay). */
  log: GameEvent[]
}

/** Per-side setup passed to `startGame`. */
export interface PlayerSetup {
  hero: HeroState
  heroPowerId: HeroPowerId
  deckCardIds: string[] // includes signature treasure card
  passiveTreasureIds: string[]
  isAI: boolean
}

export interface GameSetup {
  players: [PlayerSetup, PlayerSetup]
  /** Player who goes first (the other gets The Coin). */
  firstPlayer: PlayerId
}

/** Events emitted by the engine for the UI to animate. Closed-ish union. */
export type GameEvent =
  | { type: 'gameStarted' }
  | { type: 'turnStarted'; player: PlayerId; turn: number }
  | { type: 'turnEnded'; player: PlayerId }
  | { type: 'cardDrawn'; player: PlayerId; instanceId: string; cardId: string; fatigue?: boolean }
  | { type: 'cardPlayed'; player: PlayerId; instanceId: string; cardId: string }
  | { type: 'minionSummoned'; player: PlayerId; instanceId: string; cardId: string; position: number }
  | { type: 'attack'; attackerId: string; targetId: string }
  | { type: 'damage'; targetId: string; amount: number }
  | { type: 'heal'; targetId: string; amount: number }
  | { type: 'death'; instanceId: string; player: PlayerId }
  | { type: 'manaChanged'; player: PlayerId }
  | { type: 'armorChanged'; player: PlayerId; amount: number }
  | { type: 'heroPowerUsed'; player: PlayerId }
  | { type: 'choiceRequired'; choice: PendingChoice }
  | { type: 'gameOver'; winner: PlayerId | 'draw' }

/** Sentinel target ids for heroes (board entities use their instanceId). */
export const HERO_TARGET = (player: PlayerId): string => `hero:${player}`

export type Action =
  | { type: 'startGame'; seed: number; setup: GameSetup }
  | { type: 'mulligan'; player: PlayerId; keepInstanceIds: string[] }
  | {
      type: 'playCard'
      player: PlayerId
      instanceId: string
      targetId?: string // MinionInstance.instanceId or HERO_TARGET(p)
      position?: number // board insert index for minions
      chooseOneIndex?: number
    }
  | { type: 'attack'; player: PlayerId; attackerId: string; targetId: string }
  | { type: 'useHeroPower'; player: PlayerId; targetId?: string; chooseOneIndex?: number }
  | { type: 'endTurn'; player: PlayerId }
  | { type: 'resolveChoice'; player: PlayerId; pick: { cardId?: string; index?: number } }
  | { type: 'concede'; player: PlayerId }

export interface ApplyResult {
  state: GameState
  events: GameEvent[]
}

/* ----------------------------------------------------------------------------
 * Engine / query / AI public signatures (implementations live in their modules)
 * ------------------------------------------------------------------------- */

/** game/engine.ts */
export type ApplyAction = (state: GameState, action: Action) => ApplyResult

/** game/queries.ts — read-only helpers used by UI and AI. */
export interface EngineQueries {
  getLiveCost: (state: GameState, player: PlayerId, inst: CardInstance) => number
  getPlayableCards: (state: GameState, player: PlayerId) => CardInstance[]
  getValidTargets: (state: GameState, player: PlayerId, inst: CardInstance) => string[]
  getAttackers: (state: GameState, player: PlayerId) => string[]
  getAttackTargets: (state: GameState, player: PlayerId, attackerId: string) => string[]
  isLethalAvailable: (state: GameState, player: PlayerId) => boolean
  getWinner: (state: GameState) => PlayerId | 'draw' | undefined
}

/** game/ai/heuristicAI.ts — returns the next Action the AI wants to take, or an
 *  endTurn when it has nothing left to do. UI/run loop applies it via applyAction. */
export type ChooseAiAction = (
  state: GameState,
  player: PlayerId,
  profile: AiProfile
) => Action

/* ----------------------------------------------------------------------------
 * Run / meta progression (Pinia run store + game/run)
 * ------------------------------------------------------------------------- */

export type RunStage =
  | 'heroSelect'
  | 'heroPowerSelect'
  | 'signatureSelect'
  | 'deckBuild'
  | 'map'
  | 'combat'
  | 'reward' // pick a card bucket
  | 'treasure' // pick a treasure
  | 'victory'
  | 'defeat'

export type RewardType = 'bucket' | 'passiveTreasure' | 'activeTreasure'

export interface RunState {
  stage: RunStage
  heroId?: string
  heroPowerId?: HeroPowerId
  signatureTreasureId?: string
  /** The 15 card ids (+ signature) the player has assembled. */
  deck: string[]
  passiveTreasureIds: string[]
  activeTreasureIds: string[]
  wins: number
  losses: number
  maxHealth: number // grows +5 per round
  round: number // 1-based; reward type keys off this
  seed: number
  /** The reward offering currently being presented (stage reward/treasure). */
  offering?: RewardOffering
  /** Further reward offerings queued after the current one (e.g. a treasure
   *  round offers a treasure AND then a card bucket). */
  rewardQueue?: RewardOffering[]
  /** The enemy for the current/next combat. */
  currentEnemyId?: string
}

export interface RewardOffering {
  type: RewardType
  /** For 'bucket': 3 BucketDef ids. For treasures: 3 TreasureDef ids. */
  choices: string[]
}

/** game/run/rewards.ts — what the player is offered after a given round. */
export type RewardScheduleFor = (round: number) => RewardType

export const RUN_TARGET_WINS = 12
export const RUN_MAX_LOSSES = 3
export const STARTING_HEALTH = 30
export const HEALTH_PER_ROUND = 5
export const STARTING_DECK_SIZE = 15
export const MAX_HAND = 10
export const MAX_BOARD = 7
export const MAX_MANA = 10
