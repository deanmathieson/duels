import type { CardDef } from '../../game/types'

/**
 * Hunter (Beaststalker Tavish) class cards.
 * ~18 collectible cards spanning the curve (1-9 mana) plus token cards.
 * Theme: Beasts and aggression — cheap beasts, beast buffs, face damage, summon tokens.
 */
export const hunterCards: CardDef[] = [

  // =========================================================================
  // TOKEN CARDS (not collectible — referenced by other effects)
  // =========================================================================

  /**
   * Hound — 1/1 Beast token with Charge summoned by Unleash the Hounds and
   * other effects (matches the classic Hound token).
   */
  {
    id: 'hunter_hound',
    name: 'Hound',
    cost: 0,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Charge**',
    attack: 1,
    health: 1,
    tribe: 'beast',
    keywords: ['charge'],
    token: true,
  },

  /**
   * Timber Wolf — 1/1 Beast token (used by Animal Companion variant).
   * While in play it would buff other beasts, but as a basic summon token
   * it is just a 1/1 Beast.
   */
  {
    id: 'hunter_timber_wolf',
    name: 'Timber Wolf',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Your other Beasts have +1 Attack.',
    attack: 1,
    health: 1,
    tribe: 'beast',
    auras: [{ kind: 'minionStat', atk: 1, filter: 'beast' }],
    token: true,
  },

  /**
   * Leokk — 2/4 Beast token (Animal Companion companion).
   * Gives friendly minions +1 Attack.
   */
  {
    id: 'hunter_leokk',
    name: 'Leokk',
    cost: 2,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Your other minions have +1 Attack.',
    attack: 2,
    health: 4,
    tribe: 'beast',
    auras: [{ kind: 'minionStat', atk: 1, filter: 'minion' }],
    token: true,
  },

  /**
   * Misha — 4/4 Beast token with Taunt (Animal Companion companion).
   */
  {
    id: 'hunter_misha',
    name: 'Misha',
    cost: 3,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Taunt**',
    attack: 4,
    health: 4,
    tribe: 'beast',
    keywords: ['taunt'],
    token: true,
  },

  /**
   * Hyena — 2/1 Beast Rush token summoned by Scavenging Hyena-style effects.
   */
  {
    id: 'hunter_hyena',
    name: 'Hyena',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Rush**',
    attack: 2,
    health: 1,
    tribe: 'beast',
    keywords: ['rush'],
    token: true,
  },

  // =========================================================================
  // COLLECTIBLE CARDS
  // =========================================================================

  // --- 1-cost ---

  /**
   * Arcane Shot — deal 2 damage for 1 mana. Simple, efficient removal/face.
   */
  {
    id: 'hunter_arcane_shot',
    name: 'Arcane Shot',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 2 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  /**
   * Tracking — look at the top 3 cards of your deck, keep one.
   * Approximated as a Discover: the engine has no "from your deck" pool, so this
   * discovers from the class-locked (Hunter + neutral) card pool instead.
   */
  {
    id: 'hunter_tracking',
    name: 'Tracking',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Discover a card.',
    spell: [{ kind: 'discover', pool: 'any' }],
  },

  /**
   * Jeweled Macaw — 1/1 Beast. Battlecry: add a random Beast to your hand.
   */
  {
    id: 'hunter_jeweled_macaw',
    name: 'Jeweled Macaw',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Battlecry:** Add a random Beast to your hand.',
    attack: 1,
    health: 1,
    tribe: 'beast',
    battlecry: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1 }],
  },

  // --- 2-cost ---

  /**
   * Scavenging Hyena — 2/1 Beast.
   * Whenever a friendly Beast dies, gain +2/+1.
   * Approximated via onFriendlyMinionDeath trigger with condition cardIsBeast.
   * NOTE: triggerSource is the dead minion; self is Scavenging Hyena.
   * Engine buffs 'self' when a friendly beast dies (condition: cardIsBeast matches
   * the dead minion's tribe — closest available approximation).
   */
  {
    id: 'hunter_scavenging_hyena',
    name: 'Scavenging Hyena',
    cost: 2,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Whenever a friendly Beast dies, gain +2/+1.',
    attack: 2,
    health: 1,
    tribe: 'beast',
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        effects: [{ kind: 'buff', atk: 2, health: 1, target: 'self' }],
        condition: 'cardIsBeast',
      },
    ],
  },

  /**
   * Hunter's Mark — reduce a minion to 1 Health.
   * Approximated as setStats (health: 1).
   */
  {
    id: 'hunter_hunters_mark',
    name: "Hunter's Mark",
    cost: 2,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: "Change a minion's Health to 1.",
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'setStats', health: 1, target: 'chosenTarget' }],
  },

  /**
   * Explosive Trap — Secret approximation:
   * Deal 2 damage to all enemies. (Secrets not in engine; modelled as direct damage.)
   * Costed at 4: an immediate "2 to all enemies" is Consecration, not a delayed
   * Secret — at the original 2 mana it was ~2 mana under-costed.
   */
  {
    id: 'hunter_explosive_trap',
    name: 'Explosive Trap',
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Deal 2 damage to all enemies.',
    spell: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
  },

  // --- 3-cost ---

  /**
   * Animal Companion — summon one of Misha, Leokk, or Timber Wolf.
   * The engine has no "summon a random token from a fixed set" effect, so this is
   * encoded as a Choose One among the three companions (player-chosen rather than
   * random — slightly stronger than the original, still reasonable at 3 mana).
   */
  {
    id: 'hunter_animal_companion',
    name: 'Animal Companion',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Choose One - Summon Misha (4/4, Taunt); or Leokk (2/4, your other minions have +1 Attack); or Timber Wolf (1/1, your other Beasts have +1 Attack).',
    chooseOne: [
      {
        text: 'Summon Misha, a 4/4 with Taunt.',
        effects: [{ kind: 'summon', token: 'hunter_misha', count: 1 }],
      },
      {
        text: 'Summon Leokk, a 2/4 that gives your other minions +1 Attack.',
        effects: [{ kind: 'summon', token: 'hunter_leokk', count: 1 }],
      },
      {
        text: 'Summon Timber Wolf, a 1/1 that gives your other Beasts +1 Attack.',
        effects: [{ kind: 'summon', token: 'hunter_timber_wolf', count: 1 }],
      },
    ],
  },

  /**
   * Kill Command — deal 3 damage (5 if you control a Beast).
   * The engine has no conditional damage, so this is the unconditional version,
   * re-tuned to 4 damage at 3 mana (between Frostbolt's 2-mana 3 and Fireball's
   * 4-mana 6) — an always-on 5 would be ~1 mana under-costed.
   */
  {
    id: 'hunter_kill_command',
    name: 'Kill Command',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 4 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 4, target: 'chosenTarget' }],
  },

  /**
   * Bearshark — 4/3 Beast with Rush.
   * The real card's "Can't be targeted by spells or Hero Powers" (Elusive) is not
   * in the engine; Rush stands in as the keyword tax on the above-vanilla body.
   */
  {
    id: 'hunter_bearshark',
    name: 'Bearshark',
    cost: 3,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Rush**',
    attack: 4,
    health: 3,
    tribe: 'beast',
    keywords: ['rush'],
  },

  // --- 4-cost ---

  /**
   * Houndmaster — 4-mana. Battlecry: give a friendly minion +2/+2 and Taunt.
   * The real card is Beast-only, but there is no beast-restricted target filter,
   * so the buff targets any friendly minion (text matches the implementation).
   */
  {
    id: 'hunter_houndmaster',
    name: 'Houndmaster',
    cost: 4,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Battlecry:** Give a friendly minion +2/+2 and **Taunt**.',
    attack: 4,
    health: 3,
    tribe: 'none',
    targeted: true,
    targetFilter: 'friendlyMinions',
    battlecry: [
      { kind: 'buff', atk: 2, health: 2, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
  },

  /**
   * Unleash the Hounds — summon a 1/1 Hound with Charge for each enemy minion.
   * The engine has no per-enemy-minion scaling, so this summons a fixed 3 Hounds;
   * re-costed to 3 mana to match the fixed output (4 was ~1.5 mana over for
   * three 1/1 Charge bodies).
   */
  {
    id: 'hunter_unleash_the_hounds',
    name: 'Unleash the Hounds',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Summon three 1/1 Hounds with **Charge**.',
    spell: [{ kind: 'summon', token: 'hunter_hound', count: 3 }],
  },

  /**
   * Bestial Wrath — give a Beast Immune and +2 Attack this turn.
   * Approximated as buffThisTurn +2 atk and giveKeyword rush (no Immune in engine).
   * Beast-only targeting is not representable (no beast target filter) so it hits
   * any friendly minion; the Rush grant is permanent (giveKeyword has no duration),
   * which only matters the turn the target was summoned anyway.
   */
  {
    id: 'hunter_bestial_wrath',
    name: 'Bestial Wrath',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'epic',
    text: 'Give a friendly minion +2 Attack this turn and **Rush**.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buffThisTurn', atk: 2, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'rush', target: 'chosenTarget' },
    ],
  },

  // --- 5-cost ---

  /**
   * Tundra Rhino — 2/5 Beast. Your Beasts have Charge.
   * Approximated as an aura giving Beasts Charge. Minion-sourced auras exclude
   * their own source, so unlike the real card the Rhino itself does not gain
   * Charge — text says "other Beasts" to match.
   */
  {
    id: 'hunter_tundra_rhino',
    name: 'Tundra Rhino',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Your other Beasts have **Charge**.',
    attack: 2,
    health: 5,
    tribe: 'beast',
    auras: [{ kind: 'giveKeyword', keyword: 'charge', filter: 'beast' }],
  },

  /**
   * Savannah Highmane — 6/5 Beast. Deathrattle: summon two 2/1 Hyenas with Rush.
   * Costed at 6 like the real card — at 5 the vanilla-stat body plus ~2 mana of
   * deathrattle value was well over budget.
   */
  {
    id: 'hunter_savannah_highmane',
    name: 'Savannah Highmane',
    cost: 6,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '**Deathrattle:** Summon two 2/1 Hyenas with **Rush**.',
    attack: 6,
    health: 5,
    tribe: 'beast',
    deathrattle: [{ kind: 'summon', token: 'hunter_hyena', count: 2 }],
  },

  // --- 6-cost ---

  /**
   * Starving Buzzard — 3/2 Beast. Whenever you play a Beast, draw a card.
   * Approximated: triggers on onPlayBeast, so Beasts summoned by other effects
   * (Unleash the Hounds tokens, deathrattles) do NOT draw — text says "play".
   */
  {
    id: 'hunter_starving_buzzard',
    name: 'Starving Buzzard',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Whenever you play a Beast, draw a card.',
    attack: 3,
    health: 2,
    tribe: 'beast',
    triggers: [
      {
        event: 'onPlayBeast',
        effects: [{ kind: 'draw', count: 1 }],
        condition: 'cardIsBeast',
      },
    ],
  },

  /**
   * Multi-Shot — deal 3 damage to two random enemies.
   */
  {
    id: 'hunter_multi_shot',
    name: 'Multi-Shot',
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 3 damage to two random enemies.',
    spell: [
      { kind: 'damage', amount: 3, target: 'randomEnemy' },
      { kind: 'damage', amount: 3, target: 'randomEnemy' },
    ],
  },

  /**
   * Gladiator's Longbow — 5/2 weapon. Real card: your hero is Immune while
   * attacking. Immune is not in the engine, so the protection is approximated
   * as a Battlecry granting 6 Armor (roughly two attacks' worth of retaliation),
   * keeping the 7-mana cost honest for the 5/2 body.
   */
  {
    id: 'hunter_gladiators_longbow',
    name: "Gladiator's Longbow",
    cost: 7,
    type: 'weapon',
    cardClass: 'hunter',
    rarity: 'epic',
    text: '**Battlecry:** Gain 6 Armor.',
    attack: 5,
    durability: 2,
    battlecry: [{ kind: 'gainArmor', amount: 6 }],
  },

  // --- 7-cost ---

  /**
   * Call of the Wild — summon all three Animal Companions (Misha, Leokk, Timber Wolf).
   */
  {
    id: 'hunter_call_of_the_wild',
    name: 'Call of the Wild',
    cost: 8,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'epic',
    text: 'Summon all three Animal Companions.',
    spell: [
      { kind: 'summon', token: 'hunter_misha', count: 1 },
      { kind: 'summon', token: 'hunter_leokk', count: 1 },
      { kind: 'summon', token: 'hunter_timber_wolf', count: 1 },
    ],
  },

  // --- 9-cost ---

  /**
   * King Krush — 8/8 Beast with Charge. The definitive Hunter finisher.
   */
  {
    id: 'hunter_king_krush',
    name: 'King Krush',
    cost: 9,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'legendary',
    text: '**Charge**',
    attack: 8,
    health: 8,
    tribe: 'beast',
    keywords: ['charge'],
  },

  // =========================================================================
  // NEW CARDS — extend curve and archetype coverage
  // =========================================================================

  // --- tokens for new cards ---

  /**
   * Wolf — 3/3 Beast token summoned by Flanking Strike.
   */
  {
    id: 'hunter_wolf',
    name: 'Wolf',
    cost: 3,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '',
    attack: 3,
    health: 3,
    tribe: 'beast',
    token: true,
  },

  /**
   * Rat — 1/1 Beast token summoned by Rat Pack deathrattle.
   */
  {
    id: 'hunter_rat',
    name: 'Rat',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    tribe: 'beast',
    token: true,
  },

  /**
   * Webspinner — 1/1 Beast token summoned by Ball of Spiders.
   * Deathrattle: add a random Beast (Hunter/neutral pool) to your hand.
   */
  {
    id: 'hunter_webspinner',
    name: 'Webspinner',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Deathrattle:** Add a random Beast to your hand.',
    attack: 1,
    health: 1,
    tribe: 'beast',
    deathrattle: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1 }],
    token: true,
  },

  // --- 1-cost new ---

  /**
   * Stonetusk Boar — 1/1 Beast with Rush.
   * A cheap aggressive beast that can trade into minions immediately.
   */
  {
    id: 'hunter_stonetusk_boar',
    name: 'Stonetusk Boar',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Rush**',
    attack: 1,
    health: 1,
    tribe: 'beast',
    keywords: ['rush'],
  },

  /**
   * Springpaw — 1/1 Beast. Battlecry: add a 1/1 Lynx with Rush to your hand.
   * Approximated as battlecry: add hunter_lynx to hand.
   */
  {
    id: 'hunter_springpaw',
    name: 'Springpaw',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Battlecry:** Add a 1/1 Lynx with **Rush** to your hand.',
    attack: 1,
    health: 1,
    tribe: 'beast',
    battlecry: [{ kind: 'addCardToHand', cardId: 'hunter_lynx', count: 1 }],
  },

  /**
   * Lynx — 1/1 Beast Rush token added to hand by Springpaw.
   */
  {
    id: 'hunter_lynx',
    name: 'Lynx',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Rush**',
    attack: 1,
    health: 1,
    tribe: 'beast',
    keywords: ['rush'],
    token: true,
  },

  // --- 2-cost new ---

  /**
   * Freezing Trap — originally: return an enemy minion to its owner's hand and
   * increase its cost by (2). Approximated as destroy target enemy minion
   * (the "return" mechanic cannot be represented; destroy is the best approximation).
   * Costed at 5 like Assassinate — an unconditional targeted destroy at 2 mana
   * was ~3 mana under-costed once the Secret/return downside was dropped.
   * Flavour: classic Hunter trap removal.
   */
  {
    id: 'hunter_freezing_trap',
    name: 'Freezing Trap',
    cost: 5,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Destroy an enemy minion.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },

  // --- 3-cost new ---

  /**
   * Eaglehorn Bow — 3-cost 3/2 weapon.
   * The real card's Secret synergy ("gain +1 Durability when a friendly Secret is
   * revealed") is dropped — Secrets are not in the engine — leaving an on-budget
   * vanilla 3/2 weapon.
   */
  {
    id: 'hunter_eaglehorn_bow',
    name: 'Eaglehorn Bow',
    cost: 3,
    type: 'weapon',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '',
    attack: 3,
    durability: 2,
  },

  /**
   * Flanking Strike — 3-cost spell: deal 3 damage to a minion and summon a 3/3 Wolf.
   */
  {
    id: 'hunter_flanking_strike',
    name: 'Flanking Strike',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Deal 3 damage to a minion. Summon a 3/3 Wolf.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'summon', token: 'hunter_wolf', count: 1 },
    ],
  },

  // --- 4-cost new ---

  /**
   * Dire Frenzy — originally: give a Beast +3/+3 and shuffle 3 buffed copies of it
   * into your deck. The engine cannot shuffle copies of an arbitrary target, so the
   * deck-stuffing is approximated with three fixed River Crocolisks; the buff hits
   * any friendly minion (no beast-only target filter). Text matches the implementation.
   */
  {
    id: 'hunter_dire_frenzy',
    name: 'Dire Frenzy',
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Give a friendly minion +3/+3. Shuffle three 2/3 River Crocolisks into your deck.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 3, health: 3, target: 'chosenTarget' },
      { kind: 'shuffleIntoDeck', cardId: 'river_crocolisk', count: 3 },
    ],
  },

  /**
   * Rat Pack — 4-cost 2/2 Beast. Deathrattle: summon 3 Rats.
   * Flavour: when this rat dies, its pack swarms out.
   */
  {
    id: 'hunter_rat_pack',
    name: 'Rat Pack',
    cost: 4,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'epic',
    text: '**Deathrattle:** Summon three 1/1 Rats.',
    attack: 2,
    health: 2,
    tribe: 'beast',
    deathrattle: [{ kind: 'summon', token: 'hunter_rat', count: 3 }],
  },

  // --- 5-cost new ---

  /**
   * Master of the Wild Hunt — 5-cost 4/4 Beast. Deathrattle: add a random Beast to your hand.
   * A value-oriented beast that replaces itself on death.
   */
  {
    id: 'hunter_master_of_the_wild_hunt',
    name: 'Master of the Wild Hunt',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '**Deathrattle:** Add a random Beast to your hand.',
    attack: 4,
    health: 4,
    tribe: 'beast',
    deathrattle: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1 }],
  },

  /**
   * Ball of Spiders — 6-cost spell: summon three 1/1 Webspinners, each with
   * "Deathrattle: Add a random Beast to your hand" (faithful via the Webspinner
   * token — the previous three-plain-Hounds version was ~3 mana under-value).
   */
  {
    id: 'hunter_ball_of_spiders',
    name: 'Ball of Spiders',
    cost: 6,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'rare',
    text: 'Summon three 1/1 Webspinners with "**Deathrattle:** Add a random Beast to your hand."',
    spell: [{ kind: 'summon', token: 'hunter_webspinner', count: 3 }],
  },

  // --- 6-cost new ---

  /**
   * Professor Slate — 5-cost 4/2 legendary minion.
   * Real card: "Your spells are Poisonous." Spell-poison is not representable, so
   * this is approximated as an aura giving your OTHER friendly minions Poisonous
   * (minion-sourced auras exclude their own source). Text matches the aura.
   * Flavour: the mad scientist who laces every bullet with toxin.
   */
  {
    id: 'hunter_professor_slate',
    name: 'Professor Slate',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'legendary',
    text: 'Your other minions have **Poisonous**.',
    attack: 4,
    health: 2,
    tribe: 'none',
    auras: [{ kind: 'giveKeyword', keyword: 'poisonous', filter: 'minion' }],
  },

  /**
   * Deathstalker Rexxar — 7-cost 3/3 legendary minion.
   * **Battlecry:** Deal 2 damage to all enemy minions. Also draw a card.
   * Flavour: the undead hunter commanding the army of beasts in undeath.
   */
  {
    id: 'hunter_deathstalker_rexxar',
    name: 'Deathstalker Rexxar',
    cost: 7,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'legendary',
    text: '**Battlecry:** Deal 2 damage to all enemy minions. Draw a card.',
    attack: 3,
    health: 3,
    tribe: 'none',
    battlecry: [
      { kind: 'damage', amount: 2, target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
  },
]
