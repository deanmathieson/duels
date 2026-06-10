import type { CardDef } from '../../game/types'

/**
 * Trapper (Widow Bracken) class cards.
 * ~18 collectible cards spanning the curve (1-9 mana) plus token cards.
 * Theme: Beasts and aggression — cheap beasts, beast buffs, face damage, summon tokens.
 */
export const hunterCards: CardDef[] = [

  // =========================================================================
  // TOKEN CARDS (not collectible — referenced by other effects)
  // =========================================================================

  /**
   * Hound — 1/1 Beast token with Charge summoned by Slip the Leash and
   * other effects.
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
   * Runt — 1/1 Beast token (one of the widow's three companions).
   * The runt of the litter leads the pack: buffs other beasts while in play.
   */
  {
    id: 'hunter_timber_wolf',
    name: 'Runt',
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
   * Hexfeather — 2/4 Beast token (one of the widow's three companions).
   * A moor-harrier; gives friendly minions +1 Attack.
   */
  {
    id: 'hunter_leokk',
    name: 'Hexfeather',
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
   * Old Gristle — 4/4 Beast token with Ward (one of the widow's three companions).
   */
  {
    id: 'hunter_misha',
    name: 'Old Gristle',
    cost: 3,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Ward**',
    attack: 4,
    health: 4,
    tribe: 'beast',
    keywords: ['taunt'],
    token: true,
  },

  /**
   * Hyena — 2/1 Beast Rush token summoned by carrion-scavenger effects.
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
   * Quiet Word — deal 2 damage for 1 mana. Simple, efficient removal/face.
   */
  {
    id: 'hunter_arcane_shot',
    name: 'Quiet Word',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 2 damage.',
    flavor: 'How the widow ends an argument. The vicar ends his with prayer, which is why he loses.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  /**
   * Read the Droppings — pick what the trail offers.
   * Approximated as a Discover: the engine has no "from your deck" pool, so this
   * discovers from the class-locked (Trapper + neutral) card pool instead.
   */
  {
    id: 'hunter_tracking',
    name: 'Read the Droppings',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Discover a card.',
    flavor: "Tells you a beast's weight, diet and intentions. Works at the tavern too.",
    spell: [{ kind: 'discover', pool: 'any' }],
  },

  /**
   * Tattling Magpie — 1/1 Beast. Omen: add a random Beast to your hand.
   */
  {
    id: 'hunter_jeweled_macaw',
    name: 'Tattling Magpie',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Omen:** Add a random Beast to your hand.',
    flavor: "Knows who's poaching whose wife. Sells the names a feather at a time.",
    attack: 1,
    health: 1,
    tribe: 'beast',
    battlecry: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1 }],
  },

  // --- 2-cost ---

  /**
   * Wake-Eater — 2/1 Beast.
   * Whenever a friendly Beast dies, gain +2/+1.
   * Approximated via onFriendlyMinionDeath trigger with condition cardIsBeast.
   * NOTE: triggerSource is the dead minion; self is the Wake-Eater.
   * Engine buffs 'self' when a friendly beast dies (condition: cardIsBeast matches
   * the dead minion's tribe — closest available approximation).
   */
  {
    id: 'hunter_scavenging_hyena',
    name: 'Wake-Eater',
    cost: 2,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Whenever a friendly Beast dies, gain +2/+1.',
    flavor: 'Attends every funeral in the parish. Leaves fatter than the priest.',
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
   * Marked for the Pot — reduce a minion to 1 Health.
   * Approximated as setStats (health: 1).
   */
  {
    id: 'hunter_hunters_mark',
    name: 'Marked for the Pot',
    cost: 2,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: "Change a minion's Health to 1.",
    flavor: "Lord or hare, it all fits in the pot once she's done with it.",
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'setStats', health: 1, target: 'chosenTarget' }],
  },

  /**
   * Trespassers' Welcome — powder under the doormat:
   * Deal 2 damage to all enemies. (Modelled as immediate direct damage.)
   * Costed at 4: an immediate "2 to all enemies" board-wide burn — at the
   * original 2 mana it was ~2 mana under-costed.
   */
  {
    id: 'hunter_explosive_trap',
    name: "Trespassers' Welcome",
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Deal 2 damage to all enemies.',
    flavor: 'The mat says WELCOME. The mat is a liar.',
    spell: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
  },

  // --- 3-cost ---

  /**
   * Old Friends — summon one of Old Gristle, Hexfeather, or Runt.
   * The engine has no "summon a random token from a fixed set" effect, so this is
   * encoded as a Choose One among the three companions (player-chosen rather than
   * random — slightly stronger than the original, still reasonable at 3 mana).
   */
  {
    id: 'hunter_animal_companion',
    name: 'Old Friends',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Choose One - Summon Old Gristle (4/4, Ward); or Hexfeather (2/4, your other minions have +1 Attack); or Runt (1/1, your other Beasts have +1 Attack).',
    flavor: 'She buried four husbands and never once lost a dog. Priorities.',
    chooseOne: [
      {
        text: 'Summon Old Gristle, a 4/4 with Ward.',
        effects: [{ kind: 'summon', token: 'hunter_misha', count: 1 }],
      },
      {
        text: 'Summon Hexfeather, a 2/4 that gives your other minions +1 Attack.',
        effects: [{ kind: 'summon', token: 'hunter_leokk', count: 1 }],
      },
      {
        text: 'Summon Runt, a 1/1 that gives your other Beasts +1 Attack.',
        effects: [{ kind: 'summon', token: 'hunter_timber_wolf', count: 1 }],
      },
    ],
  },

  /**
   * Sic 'Em — the widow's word, the pack's work.
   * The engine has no conditional damage, so this is the unconditional version,
   * re-tuned to 4 damage at 3 mana — an always-on 5 would be ~1 mana under-costed.
   */
  {
    id: 'hunter_kill_command',
    name: "Sic 'Em",
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 4 damage.',
    flavor: "She says it sweetly, the way you'd call a cat in for cream.",
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 4, target: 'chosenTarget' }],
  },

  /**
   * Peatmaw — 4/3 Beast with Rush.
   * Rush stands in as the keyword tax on the above-vanilla body.
   */
  {
    id: 'hunter_bearshark',
    name: 'Peatmaw',
    cost: 3,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Rush**',
    flavor: 'Half bear, half eel, all appetite. The bog makes do with what sinks.',
    attack: 4,
    health: 3,
    tribe: 'beast',
    keywords: ['rush'],
  },

  // --- 4-cost ---

  /**
   * Kennel-Mistress — 4-mana. Omen: give a friendly minion +2/+2 and Ward.
   * There is no beast-restricted target filter, so the buff targets any
   * friendly minion (text matches the implementation).
   */
  {
    id: 'hunter_houndmaster',
    name: 'Kennel-Mistress',
    cost: 4,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Omen:** Give a friendly minion +2/+2 and **Ward**.',
    flavor: 'The hounds sleep in the bed. Suitors take the kennel, and thank her for it.',
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
   * Slip the Leash — summon 1/1 Hounds with Charge.
   * The engine has no per-enemy-minion scaling, so this summons a fixed 3 Hounds;
   * costed at 3 mana to match the fixed output.
   */
  {
    id: 'hunter_unleash_the_hounds',
    name: 'Slip the Leash',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Summon three 1/1 Hounds with **Charge**.',
    flavor: 'Three hounds, one trespasser. The arithmetic entertains the whole village.',
    spell: [{ kind: 'summon', token: 'hunter_hound', count: 3 }],
  },

  /**
   * Moon-Mad — give a friendly minion +2 Attack this turn and Rush.
   * Approximated as buffThisTurn +2 atk and giveKeyword rush.
   * Beast-only targeting is not representable (no beast target filter) so it hits
   * any friendly minion; the Rush grant is permanent (giveKeyword has no duration),
   * which only matters the turn the target was summoned anyway.
   */
  {
    id: 'hunter_bestial_wrath',
    name: 'Moon-Mad',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'epic',
    text: 'Give a friendly minion +2 Attack this turn and **Rush**.',
    flavor: "Come full moon the kennels howl all night. So does the smith's wife, but that's her business.",
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buffThisTurn', atk: 2, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'rush', target: 'chosenTarget' },
    ],
  },

  // --- 5-cost ---

  /**
   * Mire-Ox — 2/5 Beast. Your other Beasts have Charge.
   * Approximated as an aura giving Beasts Charge. Minion-sourced auras exclude
   * their own source, so the Ox itself does not gain Charge — text says
   * "other Beasts" to match.
   */
  {
    id: 'hunter_tundra_rhino',
    name: 'Mire-Ox',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Your other Beasts have **Charge**.',
    flavor: 'Slow as a sermon himself, but when he bellows the whole pack finds its legs.',
    attack: 2,
    health: 5,
    tribe: 'beast',
    auras: [{ kind: 'giveKeyword', keyword: 'charge', filter: 'beast' }],
  },

  /**
   * The Moor-Sow — 6/5 Beast. Haunt: summon two 2/1 Hyenas with Rush.
   * Costed at 6 — at 5 the vanilla-stat body plus ~2 mana of
   * deathrattle value was well over budget.
   */
  {
    id: 'hunter_savannah_highmane',
    name: 'The Moor-Sow',
    cost: 6,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '**Haunt:** Summon two 2/1 Hyenas with **Rush**.',
    flavor: 'Her litters outnumber the parish. So do her widowers.',
    attack: 6,
    health: 5,
    tribe: 'beast',
    deathrattle: [{ kind: 'summon', token: 'hunter_hyena', count: 2 }],
  },

  // --- 6-cost ---

  /**
   * Famished Moor-Kite — 3/2 Beast. Whenever you play a Beast, draw a card.
   * Approximated: triggers on onPlayBeast, so Beasts summoned by other effects
   * (Slip the Leash tokens, deathrattles) do NOT draw — text says "play".
   */
  {
    id: 'hunter_starving_buzzard',
    name: 'Famished Moor-Kite',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Whenever you play a Beast, draw a card.',
    flavor: "Circles weddings as keenly as battlefields. In Hollowmoor it's usually the same crowd.",
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
   * Two for the Pot — deal 3 damage to two random enemies.
   */
  {
    id: 'hunter_multi_shot',
    name: 'Two for the Pot',
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'free',
    text: 'Deal 3 damage to two random enemies.',
    flavor: 'One for the squire, one for the larder, and the taxman can whistle.',
    spell: [
      { kind: 'damage', amount: 3, target: 'randomEnemy' },
      { kind: 'damage', amount: 3, target: 'randomEnemy' },
    ],
  },

  /**
   * Gallows-Yew Longbow — 5/2 weapon. The original's Immune-while-attacking is
   * not in the engine, so the protection is approximated as an Omen granting
   * 6 Armor (roughly two attacks' worth of retaliation), keeping the 7-mana
   * cost honest for the 5/2 body.
   */
  {
    id: 'hunter_gladiators_longbow',
    name: 'Gallows-Yew Longbow',
    cost: 7,
    type: 'weapon',
    cardClass: 'hunter',
    rarity: 'epic',
    text: '**Omen:** Gain 6 Armor.',
    flavor: "Cut from the hanging tree. Pulls a little left, like everyone who's swung from it.",
    attack: 5,
    durability: 2,
    battlecry: [{ kind: 'gainArmor', amount: 6 }],
  },

  // --- 7-cost ---

  /**
   * The Widow's Whistle — summon all three companions (Old Gristle, Hexfeather, Runt).
   */
  {
    id: 'hunter_call_of_the_wild',
    name: "The Widow's Whistle",
    cost: 8,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'epic',
    text: 'Summon Old Gristle, Hexfeather, and Runt.',
    flavor: 'Two notes means supper. Three notes means run.',
    spell: [
      { kind: 'summon', token: 'hunter_misha', count: 1 },
      { kind: 'summon', token: 'hunter_leokk', count: 1 },
      { kind: 'summon', token: 'hunter_timber_wolf', count: 1 },
    ],
  },

  // --- 9-cost ---

  /**
   * The Parish-Eater — 8/8 Beast with Charge. The definitive Trapper finisher.
   */
  {
    id: 'hunter_king_krush',
    name: 'The Parish-Eater',
    cost: 9,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'legendary',
    text: '**Charge**',
    flavor: 'Ate three vicars, one bishop, and the entire harvest fair. A blessed appetite, says the widow.',
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
   * Wolf — 3/3 Beast token summoned by Hedge Ambush.
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
   * Rat — 1/1 Beast token summoned by The Rat King's Haunt.
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
   * Gallows Spinner — 1/1 Beast token summoned by Bride's Bouquet.
   * Haunt: add a random Beast (Trapper/neutral pool) to your hand.
   */
  {
    id: 'hunter_webspinner',
    name: 'Gallows Spinner',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'free',
    text: '**Haunt:** Add a random Beast to your hand.',
    attack: 1,
    health: 1,
    tribe: 'beast',
    deathrattle: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1 }],
    token: true,
  },

  // --- 1-cost new ---
  // (The 1-cost charge boar lives in neutral.ts — trappers draft the neutral copy.)

  /**
   * Larder Lynx — 1/1 Beast. Omen: add a 1/1 Lynx with Rush to your hand.
   * Approximated as battlecry: add hunter_lynx to hand.
   */
  {
    id: 'hunter_springpaw',
    name: 'Larder Lynx',
    cost: 1,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Omen:** Add a 1/1 Lynx with **Rush** to your hand.',
    flavor: 'Caught stealing sausages. Kept on for the same talent.',
    attack: 1,
    health: 1,
    tribe: 'beast',
    battlecry: [{ kind: 'addCardToHand', cardId: 'hunter_lynx', count: 1 }],
  },

  /**
   * Lynx — 1/1 Beast Rush token added to hand by Larder Lynx.
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
   * The Long Drop — destroy target enemy minion.
   * Costed at 5 — an unconditional targeted destroy at 2 mana
   * was ~3 mana under-costed once the delayed-trap downside was dropped.
   * Flavour: gallows justice, Hollowmoor style.
   */
  {
    id: 'hunter_freezing_trap',
    name: 'The Long Drop',
    cost: 5,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Destroy an enemy minion.',
    flavor: 'Hollowmoor justice: short rope, long drop, no appeal.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },

  // --- 3-cost new ---

  /**
   * Hedgerow Bow — 3-cost 3/2 weapon.
   * An on-budget vanilla 3/2 weapon (the original's Secret synergy is dropped —
   * Secrets are not in the engine).
   */
  {
    id: 'hunter_eaglehorn_bow',
    name: 'Hedgerow Bow',
    cost: 3,
    type: 'weapon',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '',
    flavor: 'Kept strung behind the chimney, between the good knife and the bad intentions.',
    attack: 3,
    durability: 2,
  },

  /**
   * Hedge Ambush — 3-cost spell: deal 3 damage to a minion and summon a 3/3 Wolf.
   */
  {
    id: 'hunter_flanking_strike',
    name: 'Hedge Ambush',
    cost: 3,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Deal 3 damage to a minion. Summon a 3/3 Wolf.',
    flavor: 'Round here, even the shrubbery holds a grudge.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'summon', token: 'hunter_wolf', count: 1 },
    ],
  },

  // --- 4-cost new ---

  /**
   * Fed Something Foul — give a minion +3/+3 and stuff the deck.
   * The engine cannot shuffle copies of an arbitrary target, so the
   * deck-stuffing is approximated with three fixed 2/3 Beasts (river_crocolisk);
   * the buff hits any friendly minion (no beast-only target filter). Text matches
   * the implementation; the shuffled card is named generically so it tracks the
   * neutral card's display name.
   */
  {
    id: 'hunter_dire_frenzy',
    name: 'Fed Something Foul',
    cost: 4,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Give a friendly minion +3/+3. Shuffle three 2/3 Beasts into your deck.',
    flavor: "Don't ask what's in the pail. The dog didn't, and look at the size of him now.",
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 3, health: 3, target: 'chosenTarget' },
      { kind: 'shuffleIntoDeck', cardId: 'river_crocolisk', count: 3 },
    ],
  },

  /**
   * The Rat King — 4-cost 2/2 Beast. Haunt: summon 3 Rats.
   * Flavour: kill the king and the court comes calling.
   */
  {
    id: 'hunter_rat_pack',
    name: 'The Rat King',
    cost: 4,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'epic',
    text: '**Haunt:** Summon three 1/1 Rats.',
    flavor: "Long live the king. And his court. And his court's fleas.",
    attack: 2,
    health: 2,
    tribe: 'beast',
    deathrattle: [{ kind: 'summon', token: 'hunter_rat', count: 3 }],
  },

  // --- 5-cost new ---

  /**
   * The Pale Stag — 5-cost 4/4 Beast. Haunt: add a random Beast to your hand.
   * A value-oriented beast that replaces itself on death.
   */
  {
    id: 'hunter_master_of_the_wild_hunt',
    name: 'The Pale Stag',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '**Haunt:** Add a random Beast to your hand.',
    flavor: "Every poacher shoots it once. Whatever steps out of the fog after, they don't shoot twice.",
    attack: 4,
    health: 4,
    tribe: 'beast',
    deathrattle: [{ kind: 'addRandomCardToHand', pool: 'beast', count: 1 }],
  },

  /**
   * Bride's Bouquet — 6-cost spell: summon three 1/1 Gallows Spinners, each with
   * "Haunt: Add a random Beast to your hand" (via the Gallows Spinner token).
   */
  {
    id: 'hunter_ball_of_spiders',
    name: "Bride's Bouquet",
    cost: 6,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'rare',
    text: 'Summon three 1/1 Gallows Spinners with "**Haunt:** Add a random Beast to your hand."',
    flavor: 'Tossed at every Hollowmoor wedding. The bridesmaids have learned to duck.',
    spell: [{ kind: 'summon', token: 'hunter_webspinner', count: 3 }],
  },

  // --- 6-cost new ---

  /**
   * Goodwife Henbane — 5-cost 4/2 legendary minion.
   * Aura giving your OTHER friendly minions Poisonous
   * (minion-sourced auras exclude their own source). Text matches the aura.
   * Flavour: the village apothecary; every remedy has a kick.
   */
  {
    id: 'hunter_professor_slate',
    name: 'Goodwife Henbane',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'legendary',
    text: 'Your other minions have **Poisonous**.',
    flavor: 'Her tonics cure gout, grief, and inconvenient heirs. Ask for the special.',
    attack: 4,
    health: 2,
    tribe: 'none',
    auras: [{ kind: 'giveKeyword', keyword: 'poisonous', filter: 'minion' }],
  },

  /**
   * The Gallows Huntsman — 7-cost 3/3 legendary minion.
   * **Omen:** Deal 2 damage to all enemy minions. Also draw a card.
   * Flavour: a hanged poacher who never stopped working the squire's land.
   */
  {
    id: 'hunter_deathstalker_rexxar',
    name: 'The Gallows Huntsman',
    cost: 7,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'legendary',
    text: '**Omen:** Deal 2 damage to all enemy minions. Draw a card.',
    flavor: "Hanged for taking the squire's deer. These nights he takes whatever the squire loves best.",
    attack: 3,
    health: 3,
    tribe: 'none',
    battlecry: [
      { kind: 'damage', amount: 2, target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
  },

  // -------------------------------------------------------------------------
  // HAUNT PACKAGE — Trapper flavour: dead beasts, dirty work, and things that
  // come back from the snare line.
  // -------------------------------------------------------------------------
  {
    id: 'h_cellar_broodmother',
    name: 'Cellar Brood-Mother',
    cost: 2,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Haunt:** Summon two 1/1 Spiderlings.',
    flavor: 'The vicar swears the rectory cellar is empty. The vicar swears a lot lately.',
    attack: 1,
    health: 3,
    tribe: 'beast',
    deathrattle: [{ kind: 'summon', token: 'spiderling', count: 2 }],
    art: undefined,
  },
  {
    id: 'h_carrion_hound',
    name: 'Carrion Hound',
    cost: 3,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'common',
    text: '**Haunt:** Summon a 2/1 Hyena.',
    flavor: 'Faithful past the grave. Hungry past it, too.',
    attack: 3,
    health: 2,
    tribe: 'beast',
    deathrattle: [{ kind: 'summon', token: 'hunter_hyena', count: 1 }],
    art: undefined,
  },
  {
    id: 'h_play_dead',
    name: 'Play Dead',
    cost: 1,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: "Trigger a friendly minion's **Haunt**.",
    flavor: 'Good girl. Stay. STAY. Perfect.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'triggerDeathrattles', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'h_shallow_diggings',
    name: 'Shallow Diggings',
    cost: 2,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'common',
    text: 'Resummon a friendly **Haunt** minion that died this game.',
    flavor: 'Two feet down is plenty when you plan on visiting.',
    spell: [{ kind: 'resummonDeadMinion', count: 1, filter: 'deathrattle' }],
    art: undefined,
  },
  {
    id: 'h_trophy_skinner',
    name: 'Trophy Skinner',
    cost: 4,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: "**Omen:** Trigger a friendly minion's **Haunt**.",
    flavor: 'Nothing on the moor goes to waste. Nothing on the moor stays buried, either.',
    attack: 3,
    health: 3,
    tribe: 'none',
    targeted: true,
    targetFilter: 'friendlyMinions',
    battlecry: [{ kind: 'triggerDeathrattles', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'h_gorecrow_matron',
    name: 'Gorecrow Matron',
    cost: 5,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: 'Whenever a friendly **Haunt** minion dies, draw a card.',
    flavor: 'She runs the rookery like a bawdy house: everyone welcome, nothing free.',
    attack: 5,
    health: 4,
    tribe: 'beast',
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        condition: 'cardHasDeathrattle',
        effects: [{ kind: 'draw', count: 1 }],
      },
    ],
    art: undefined,
  },
  {
    id: 'h_nest_of_teeth',
    name: 'Nest of Teeth',
    cost: 6,
    type: 'minion',
    cardClass: 'hunter',
    rarity: 'rare',
    text: '**Ward**. **Haunt:** Summon two 3/2 Fledglings.',
    flavor: 'The bailiff posted an eviction notice. The nest posted him back in pieces.',
    attack: 4,
    health: 6,
    tribe: 'beast',
    keywords: ['taunt'],
    deathrattle: [{ kind: 'summon', token: 'fledgling', count: 2 }],
    art: undefined,
  },
  {
    id: 'h_the_dead_hunt',
    name: 'The Dead Hunt',
    cost: 7,
    type: 'spell',
    cardClass: 'hunter',
    rarity: 'epic',
    text: 'Resummon 3 friendly Beasts that died this game.',
    flavor: 'On foggy nights the whole pack rides again — and they remember who held the whip.',
    spell: [{ kind: 'resummonDeadMinion', count: 3, filter: 'beast' }],
    art: undefined,
  },
]
