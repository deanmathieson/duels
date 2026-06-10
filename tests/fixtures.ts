import type { CardDef, GameSetup, HeroPowerDef, HeroState, PlayerSetup } from '../game/types'
import {
  clearCards,
  registerCards,
  registerHeroPowers,
} from '../game/cardDb'
import { makeCardInstance, resetInstanceCounter } from '../game/effects'
import type { GameState, PlayerId } from '../game/types'

/**
 * A small, self-contained fixture card set used by engine tests. Does NOT import
 * from /data — these ids only exist within the test process. Covers tokens,
 * vanilla minions, keyword minions, targeted spells, choose-one, discover, and
 * a deathrattle/aura/spell-damage minion.
 */
export const fixtureCards: CardDef[] = [
  // --- tokens (must exist for summon/coin) ---
  {
    id: 'the_coin',
    name: 'The Coin',
    cost: 0,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'free',
    text: 'Gain 1 Mana Crystal this turn only.',
    token: true,
    spell: [{ kind: 'gainManaThisTurn', amount: 1 }],
  },
  {
    id: 'sapling',
    name: 'Sapling',
    cost: 1,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    token: true,
  },
  {
    id: 'treant',
    name: 'Treant',
    cost: 2,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'free',
    text: '',
    attack: 2,
    health: 2,
    token: true,
  },
  // --- vanilla minions ---
  {
    id: 'wisp',
    name: 'Wisp',
    cost: 0,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: '',
    attack: 1,
    health: 1,
  },
  {
    id: 'yeti',
    name: 'Chillwind Yeti',
    cost: 4,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: '',
    attack: 4,
    health: 5,
  },
  {
    id: 'raptor',
    name: 'Bloodfen Raptor',
    cost: 2,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: '',
    attack: 3,
    health: 2,
    tribe: 'beast',
  },
  // --- keyword minions ---
  {
    id: 'taunt_bear',
    name: 'Taunt Bear',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Taunt',
    attack: 2,
    health: 4,
    keywords: ['taunt'],
  },
  {
    id: 'shield_bot',
    name: 'Shield Bot',
    cost: 2,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Divine Shield',
    attack: 2,
    health: 2,
    keywords: ['divineShield'],
  },
  {
    id: 'charger',
    name: 'Charger',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Charge',
    attack: 3,
    health: 2,
    keywords: ['charge'],
  },
  {
    id: 'rusher',
    name: 'Rusher',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Rush',
    attack: 3,
    health: 3,
    keywords: ['rush'],
  },
  {
    id: 'poison_snake',
    name: 'Poison Snake',
    cost: 2,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Poisonous',
    attack: 1,
    health: 1,
    keywords: ['poisonous'],
  },
  {
    id: 'stealth_cat',
    name: 'Jungle Panther',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Stealth',
    attack: 4,
    health: 2,
    keywords: ['stealth'],
  },
  {
    id: 'stealth_taunt',
    name: 'Hidden Guardian',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Taunt. Stealth.',
    attack: 2,
    health: 5,
    keywords: ['taunt', 'stealth'],
  },
  // --- keyword aura minion (other friendly minions gain Taunt) ---
  {
    id: 'taunt_giver',
    name: 'Taunt Totem',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Your other minions have Taunt.',
    attack: 0,
    health: 4,
    auras: [{ kind: 'giveKeyword', keyword: 'taunt', filter: 'minion' }],
  },
  // --- taunt-filtered stat aura (your Taunt minions have +1/+2) ---
  {
    id: 'taunt_drill',
    name: 'Drill Sergeant',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Your Taunt minions have +1/+2.',
    attack: 2,
    health: 2,
    auras: [{ kind: 'minionStat', atk: 1, health: 2, filter: 'taunt' }],
  },
  // --- damage-trigger minions ---
  {
    id: 'imp_boss',
    name: 'Imp Boss',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Whenever this minion takes damage, summon a 1/1 Sapling.',
    attack: 2,
    health: 4,
    triggers: [
      { event: 'onSelfDamaged', effects: [{ kind: 'summon', token: 'sapling', count: 1 }] },
    ],
  },
  {
    id: 'armorsmith',
    name: 'Armorsmith',
    cost: 2,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Whenever a friendly minion takes damage, gain 1 Armor.',
    attack: 1,
    health: 4,
    triggers: [
      { event: 'onFriendlyMinionDamaged', effects: [{ kind: 'gainArmor', amount: 1 }] },
    ],
  },
  {
    id: 'frother',
    name: 'Frother',
    cost: 3,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Whenever a minion takes damage, gain +1 Attack.',
    attack: 2,
    health: 4,
    triggers: [
      { event: 'onMinionDamaged', effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }] },
    ],
  },
  // --- deathrattle minion ---
  {
    id: 'leper',
    name: 'Leper Gnome',
    cost: 1,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Deathrattle: deal 2 to enemy hero.',
    attack: 1,
    health: 1,
    deathrattle: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
  },
  // --- spell damage minion ---
  {
    id: 'mage_imp',
    name: 'Mage Imp',
    cost: 2,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Spell Damage +1',
    attack: 1,
    health: 3,
    spellDamage: 1,
  },
  // --- aura minion (other friendly minions +1/+1) ---
  {
    id: 'warchief',
    name: 'Stormwind Champion',
    cost: 7,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'rare',
    text: 'Your other minions have +1/+1.',
    attack: 6,
    health: 6,
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'minion' }],
  },
  // --- targeted spells ---
  {
    id: 'bolt',
    name: 'Bolt',
    cost: 1,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Deal 3 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
  },
  {
    id: 'heal_spell',
    name: 'Healing Word',
    cost: 1,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Restore 5 health.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'heal', amount: 5, target: 'chosenTarget' }],
  },
  {
    id: 'destroy_spell',
    name: 'Assassinate',
    cost: 5,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Destroy a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },
  {
    id: 'silence_spell',
    name: 'Silence',
    cost: 0,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Silence a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'silence', target: 'chosenTarget' }],
  },
  {
    id: 'buff_spell',
    name: 'Mark',
    cost: 1,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Give a minion +2/+2.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'buff', atk: 2, health: 2, target: 'chosenTarget' }],
  },
  {
    id: 'shield_spell',
    name: 'Blessing',
    cost: 1,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Give a minion Divine Shield.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'giveDivineShield', target: 'chosenTarget' }],
  },
  {
    id: 'taunt_spell',
    name: 'Rally',
    cost: 1,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Give a minion Taunt.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' }],
  },
  // --- non-targeted spells ---
  {
    id: 'draw_spell',
    name: 'Arcane Intellect',
    cost: 3,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Draw 2 cards.',
    spell: [{ kind: 'draw', count: 2 }],
  },
  {
    id: 'innervate',
    name: 'Innervate',
    cost: 0,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Gain 2 Mana this turn.',
    spell: [{ kind: 'gainManaThisTurn', amount: 2 }],
  },
  {
    id: 'wild_growth',
    name: 'Wild Growth',
    cost: 2,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'free',
    text: 'Gain an empty Mana Crystal.',
    spell: [{ kind: 'gainManaCrystal', count: 1, empty: true }],
  },
  {
    id: 'summon_spell',
    name: 'Force of Nature',
    cost: 5,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Summon three 2/2 Treants.',
    spell: [{ kind: 'summon', token: 'treant', count: 3 }],
  },
  {
    id: 'discover_spell',
    name: 'Discoverer',
    cost: 1,
    type: 'spell',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Discover a minion.',
    spell: [{ kind: 'discover', pool: 'minion' }],
  },
  // --- choose one spell ---
  {
    id: 'wrath',
    name: 'Wrath',
    cost: 2,
    type: 'spell',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Choose One - 3 damage; or 1 damage and draw.',
    targeted: true,
    targetFilter: 'allMinions',
    chooseOne: [
      { text: 'Deal 3 damage.', effects: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }] },
      {
        text: 'Deal 1 damage. Draw a card.',
        effects: [
          { kind: 'damage', amount: 1, target: 'chosenTarget' },
          { kind: 'draw', count: 1 },
        ],
      },
    ],
  },
  // --- choose one minion ---
  {
    id: 'claw_druid',
    name: 'Druid of the Claw',
    cost: 5,
    type: 'minion',
    cardClass: 'druid',
    rarity: 'common',
    text: 'Choose One - 4/4 Charge; or 4/6 Taunt.',
    attack: 4,
    health: 4,
    tribe: 'beast',
    chooseOne: [
      { text: '4/4 Charge', stats: { attack: 4, health: 4 }, keywords: ['charge'] },
      { text: '4/6 Taunt', stats: { attack: 4, health: 6 }, keywords: ['taunt'] },
    ],
  },
  // --- battlecry minion (targeted) ---
  {
    id: 'archer',
    name: 'Elven Archer',
    cost: 1,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Battlecry: deal 1 damage.',
    attack: 1,
    health: 1,
    targeted: true,
    targetFilter: 'allCharacters',
    battlecry: [{ kind: 'damage', amount: 1, target: 'chosenTarget' }],
  },
  // --- gain mana crystal (non-empty) ---
  {
    id: 'mana_minion',
    name: 'Mana Giver',
    cost: 1,
    type: 'minion',
    cardClass: 'neutral',
    rarity: 'common',
    text: 'Battlecry: gain a Mana Crystal.',
    attack: 1,
    health: 1,
    battlecry: [{ kind: 'gainManaCrystal', count: 1 }],
  },
]

/** Fixture hero powers (a simple targeted ping and a non-targeted draw). */
export const fixtureHeroPowers: HeroPowerDef[] = [
  {
    id: 'hp_ping',
    name: 'Fireblast',
    cost: 2,
    text: 'Deal 1 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    effects: [{ kind: 'damage', amount: 1, target: 'chosenTarget' }],
  },
  {
    id: 'hp_draw',
    name: 'Inspiration',
    cost: 2,
    text: 'Draw a card.',
    effects: [{ kind: 'draw', count: 1 }],
  },
  {
    id: 'hp_steady',
    name: 'Steady Shot',
    cost: 2,
    text: 'Deal 2 to the enemy hero.',
    effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
  },
]

/** Install the fixture cards/hero powers into the engine registries. */
export function installFixtures(): void {
  clearCards()
  resetInstanceCounter()
  registerCards(fixtureCards)
  registerHeroPowers(fixtureHeroPowers)
}

/** Build a HeroState with sensible defaults. */
export function makeHero(overrides: Partial<HeroState> = {}): HeroState {
  return {
    name: 'Hero',
    cardClass: 'druid',
    health: 30,
    maxHealth: 30,
    armor: 0,
    attack: 0,
    attacksThisTurn: 0,
    ...overrides,
  }
}

/** Build a PlayerSetup from a list of deck card ids. */
export function makeSetup(
  deck0: string[],
  deck1: string[],
  opts: {
    heroPower0?: string
    heroPower1?: string
    isAI0?: boolean
    isAI1?: boolean
  } = {}
): GameSetup {
  const p0: PlayerSetup = {
    hero: makeHero(),
    heroPowerId: opts.heroPower0 ?? 'hp_ping',
    deckCardIds: deck0,
    passiveTreasureIds: [],
    isAI: opts.isAI0 ?? false,
  }
  const p1: PlayerSetup = {
    hero: makeHero(),
    heroPowerId: opts.heroPower1 ?? 'hp_ping',
    deckCardIds: deck1,
    passiveTreasureIds: [],
    isAI: opts.isAI1 ?? false,
  }
  return { players: [p0, p1], firstPlayer: 0 }
}

/** Pad a deck to N cards with wisps so opening hands don't fatigue immediately. */
export function padDeck(cards: string[], size = 30): string[] {
  const out = [...cards]
  while (out.length < size) out.push('wisp')
  return out
}

/**
 * Deterministically place a card into a player's hand (test convenience).
 * Mutates the passed state, which tests own (it is a fresh clone from applyAction).
 * @param state - running game state to mutate
 * @param player - the player to give the card to
 * @param cardId - the card id to add
 * @returns the new card instance id
 */
export function giveCard(state: GameState, player: PlayerId, cardId: string): string {
  const inst = makeCardInstance(cardId)
  state.players[player].hand.push(inst)
  return inst.instanceId
}

/**
 * Grant a player free mana (set current and max) for deterministic tests.
 * @param state - running game state to mutate
 * @param player - the player
 * @param mana - the mana value to set for both current and max
 */
export function setMana(state: GameState, player: PlayerId, mana: number): void {
  state.players[player].mana.max = mana
  state.players[player].mana.current = mana
}
