import type { CardDef } from '../../game/types'

/**
 * Stargazer class cards — ~30 collectible cards spanning the curve (1-10 mana),
 * plus token cards summoned by class cards.
 * Theme: burn/spell damage — comet-fire, killing frosts, forbidden almanacs and
 * Spell Damage minions. Encoded per EFFECTSPEC.md conventions.
 */
export const mageCards: CardDef[] = [
  // =========================================================================
  // TOKEN cards (summoned by class cards — not collectible)
  // =========================================================================

  /**
   * The Drowned Maid token — 3/6.
   * Reserved for summoning treasures/effects (not currently referenced by a
   * collectible card).
   */
  {
    id: 'mage_water_elemental_token',
    name: 'The Drowned Maid',
    cost: 4,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'common',
    text: '',
    flavor: 'Still waiting by the millpond. Still patient.',
    attack: 3,
    health: 6,
    tribe: 'elemental',
    token: true,
  },

  /**
   * Corn Dolly token — 0/2 Ward. Summoned by the Corn Dollies spell.
   */
  {
    id: 'mage_mirror_image_token',
    name: 'Corn Dolly',
    cost: 0,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'free',
    text: '**Ward**',
    flavor: 'Straw where the heart should be. An improvement, says the widow.',
    attack: 0,
    health: 2,
    tribe: 'none',
    keywords: ['taunt'],
    token: true,
  },

  // =========================================================================
  // COLLECTIBLE cards
  // =========================================================================

  // --- 1-cost ---
  /**
   * Spiteful Stars — deal 3 damage randomly split among enemies.
   * (Approximated as deal 1 to each of three random enemies.)
   */
  {
    id: 'mage_arcane_missiles',
    name: 'Spiteful Stars',
    cost: 1,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 3 damage randomly split among all enemies.',
    flavor: 'Three falling stars, three old grudges. The parish keeps a ledger.',
    spell: [
      { kind: 'damage', amount: 1, target: 'randomEnemy' },
      { kind: 'damage', amount: 1, target: 'randomEnemy' },
      { kind: 'damage', amount: 1, target: 'randomEnemy' },
    ],
  },

  /**
   * Corn Dollies — summon two 0/2 minions with Ward.
   */
  {
    id: 'mage_mirror_image',
    name: 'Corn Dollies',
    cost: 1,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Summon two 0/2 Corn Dollies with Ward.',
    flavor: 'Stuffed with straw and good intentions. Same as her third husband.',
    spell: [{ kind: 'summon', token: 'mage_mirror_image_token', count: 2 }],
  },

  // --- 2-cost ---
  /**
   * Widow's Frost — deal 3 damage to a target. (The 2-mana burn anchor.)
   */
  {
    id: 'mage_frostbolt',
    name: "Widow's Frost",
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 3 damage to a character.',
    flavor: 'She kissed him goodnight in November. They found him come the thaw.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
  },

  /**
   * Spell-Suckling — 1/3. Whenever you cast a spell, gain +1 Attack.
   * (onPlaySpell trigger gives self +1/+0.)
   */
  {
    id: 'mage_mana_wyrm',
    name: 'Spell-Suckling',
    cost: 2,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Whenever you cast a spell, gain +1 Attack.',
    flavor: 'Weaned off milk and onto witchcraft. The midwife blames the father, on principle.',
    attack: 1,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }],
        condition: 'cardIsSpell',
      },
    ],
  },

  /**
   * The Curate's Daughter — 2-mana 3/2. Your spells cost (1) less.
   */
  {
    id: 'mage_sorcerers_apprentice',
    name: "The Curate's Daughter",
    cost: 2,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Your spells cost (1) less.',
    flavor: "She does her father's Latin and her own sums. Cheaper rates after vespers.",
    attack: 3,
    health: 2,
    tribe: 'none',
    auras: [{ kind: 'costReduction', amount: 1, filter: 'spell' }],
  },

  /**
   * Vestry Draught — deal 1 damage to all enemy minions.
   * (Costed at 2 to match the 1-damage AoE anchor; the cheap-ping niche
   * next to Black Frost and The Starving Snow.)
   */
  {
    id: 'mage_arcane_explosion',
    name: 'Vestry Draught',
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 1 damage to all enemy minions.',
    flavor: 'The congregation blames the door. The sexton knows the dead like to mingle.',
    spell: [{ kind: 'damage', amount: 1, target: 'enemyMinions' }],
  },

  // --- 3-cost ---
  /**
   * Forbidden Almanac — draw 2 cards.
   */
  {
    id: 'mage_arcane_intellect',
    name: 'Forbidden Almanac',
    cost: 3,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Draw 2 cards.',
    flavor: 'Banned by the bishop on account of the woodcuts. He kept his own copy, mind.',
    spell: [{ kind: 'draw', count: 2 }],
  },

  /**
   * Gallows Wind — deal 2 damage to an enemy minion and 1 to all other enemies.
   * (`otherEnemies` includes the enemy hero, which the text reflects. Costed
   * at 3 to sit on the AoE anchors.)
   */
  {
    id: 'mage_cone_of_cold',
    name: 'Gallows Wind',
    cost: 3,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Deal 2 damage to an enemy minion and 1 damage to all other enemies.',
    flavor: 'Blows in off the hanging-hill. The departed do love to share a chill.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'damage', amount: 1, target: 'otherEnemies' },
    ],
  },

  /**
   * Hedge Astrologer — 1/4. **Spell Damage +1.**
   */
  {
    id: 'mage_dalaran_mage',
    name: 'Hedge Astrologer',
    cost: 3,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'free',
    text: '**Spell Damage +1.**',
    flavor: "Reads your stars, your palm, and your husband's correspondence.",
    attack: 1,
    health: 4,
    tribe: 'none',
    spellDamage: 1,
  },

  // --- 4-cost ---
  /**
   * Tallow Comet — deal 6 damage. (The 4-mana burn anchor.)
   */
  {
    id: 'mage_fireball',
    name: 'Tallow Comet',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 6 damage.',
    flavor: 'The church choir hit a high note. So did the church.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 6, target: 'chosenTarget' }],
  },

  /**
   * The Moon's Bastard — 3/3. At the end of your turn, gain +2/+2.
   * (Unconditional growth body for the 4-slot.)
   */
  {
    id: 'mage_ethereal_arcanist',
    name: "The Moon's Bastard",
    cost: 4,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'At the end of your turn, gain +2/+2.',
    flavor: 'It grows bigger every night, and the moon will not name a father.',
    attack: 3,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'buff', atk: 2, health: 2, target: 'self' }],
      },
    ],
  },

  /**
   * The Drowned Maid — 3/6. Vanilla body.
   */
  {
    id: 'mage_water_elemental',
    name: 'The Drowned Maid',
    cost: 4,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'free',
    text: '',
    flavor: 'Went face-down in the millpond at her own wedding. Now she does the dunking.',
    attack: 3,
    health: 6,
    tribe: 'elemental',
  },

  // --- 5-cost ---
  /**
   * Star-Drunk Vicar — 4/7. **Spell Damage +1.**
   */
  {
    id: 'mage_archmage',
    name: 'Star-Drunk Vicar',
    cost: 5,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: '**Spell Damage +1.**',
    flavor: 'Preaches astronomy of a Sunday and gin the rest of the week.',
    attack: 4,
    health: 7,
    tribe: 'none',
    spellDamage: 1,
  },

  /**
   * The Parlour Medium — 5/3. Omen: Discover a spell.
   * (Discover pool defaults to Stargazer + neutral spells per the generation
   * class lock.)
   */
  {
    id: 'mage_ethereal_conjurer',
    name: 'The Parlour Medium',
    cost: 5,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'common',
    text: '**Omen:** Discover a spell.',
    flavor: 'A shilling to reach your late wife. Two shillings to lose the connection.',
    attack: 5,
    health: 3,
    tribe: 'none',
    battlecry: [{ kind: 'discover', pool: 'spell' }],
  },

  // --- 6-cost ---
  /**
   * The Starving Snow — deal 2 damage to all enemy minions. Draw a card.
   * (The 6-mana AoE anchor with a bonus draw.)
   */
  {
    id: 'mage_blizzard',
    name: 'The Starving Snow',
    cost: 6,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Deal 2 damage to all enemy minions. Draw a card.',
    flavor: 'Came down in October and ate clean through to Lent.',
    spell: [
      { kind: 'damage', amount: 2, target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
  },

  // --- 7-cost ---
  /**
   * Bonfire Sermon — deal 4 damage to all enemy minions.
   */
  {
    id: 'mage_flamestrike',
    name: 'Bonfire Sermon',
    cost: 7,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 4 damage to all enemy minions.',
    flavor: 'Hellfire preaching, now with practical demonstrations.',
    spell: [{ kind: 'damage', amount: 4, target: 'enemyMinions' }],
  },

  // --- 8-cost ---
  /**
   * Old Erasmus Vane — 7/7. Omen: equip a 1/3 Weathercock.
   * After you cast a spell, add a random minion to your hand.
   * (The hand pool defaults to Stargazer + neutral minions per the generation
   * class lock.)
   */
  {
    id: 'mage_medivh',
    name: 'Old Erasmus Vane',
    cost: 8,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'legendary',
    text: '**Omen:** Equip a 1/3 Weathercock. After you cast a spell, add a random minion to your hand.',
    flavor: 'Forty years watching the heavens. Lately the heavens have started watching back.',
    attack: 7,
    health: 7,
    tribe: 'none',
    battlecry: [{ kind: 'equipWeapon', cardId: 'mage_atiesh' }],
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'addRandomCardToHand', pool: 'minion', count: 1 }],
        condition: 'cardIsSpell',
      },
    ],
  },

  /**
   * The Weathercock — 1/3 weapon for Old Erasmus Vane.
   */
  {
    id: 'mage_atiesh',
    name: 'The Weathercock',
    cost: 0,
    type: 'weapon',
    cardClass: 'mage',
    rarity: 'legendary',
    text: 'Equip when Old Erasmus Vane enters play.',
    flavor: 'Points wherever trouble is coming from. Lately it just spins.',
    attack: 1,
    durability: 3,
    token: true,
  },

  // --- 10-cost ---
  /**
   * The Reckoning Star — deal 10 damage. (The class finisher; 10 mana = 10
   * damage anchor.)
   */
  {
    id: 'mage_pyroblast',
    name: 'The Reckoning Star',
    cost: 10,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Deal 10 damage.',
    flavor: "The almanac gave the county three weeks' notice. Nobody reads the almanac.",
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 10, target: 'chosenTarget' }],
  },

  // =========================================================================
  // ADDITIONAL COLLECTIBLE cards — extending curve and archetype coverage
  // =========================================================================

  // --- 1-cost ---
  /**
   * Eave-Spike — deal 2 damage to a single target. (The unconditional 1-mana
   * burn anchor: 2 damage to any character.)
   */
  {
    id: 'mage_ice_lance',
    name: 'Eave-Spike',
    cost: 1,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Deal 2 damage to a character.',
    flavor: "January's favourite murder weapon. Melts before the inquest.",
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  // --- 2-cost ---
  /**
   * Frost on the Glass — gain 8 Armor. The dedicated emergency survival tool
   * for control builds. (Slightly above the 2.5 armor-per-mana anchor.)
   */
  {
    id: 'mage_ice_block_scroll',
    name: 'Frost on the Glass',
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Gain 8 Armor.',
    flavor: 'The church windows ice over whenever the sermon turns to lust. So, most of December.',
    spell: [{ kind: 'gainArmor', amount: 8 }],
  },

  // --- 3-cost ---
  /**
   * Cinder Widow — 2/4. After you cast a spell, deal 1 damage to two random
   * enemies. Strong spell-synergy body for tempo/burn builds.
   */
  {
    id: 'mage_flamewaker',
    name: 'Cinder Widow',
    cost: 3,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'After you cast a spell, deal 1 damage to two random enemies.',
    flavor: 'Three husbands, three house fires. The fourth suitor proposed holding a bucket.',
    attack: 2,
    health: 4,
    tribe: 'none',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [
          { kind: 'damage', amount: 1, target: 'randomEnemy' },
          { kind: 'damage', amount: 1, target: 'randomEnemy' },
        ],
        condition: 'cardIsSpell',
      },
    ],
  },

  // --- 4-cost ---
  /**
   * Black Frost — deal 2 damage to all enemy minions.
   * (Costed at 4 to match the 2-damage AoE anchor; niche: mid-cost board sweep.)
   */
  {
    id: 'mage_frost_nova',
    name: 'Black Frost',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Deal 2 damage to all enemy minions.',
    flavor: "Took the harvest, the orchard, and old Tom's toes. Kept the toes.",
    spell: [{ kind: 'damage', amount: 2, target: 'enemyMinions' }],
  },

  /**
   * Toad Hex — silence a minion and set it to 1/1.
   * (The engine cannot replace a minion, so the hex silences away
   * abilities/buffs then sets stats to 1/1.)
   */
  {
    id: 'mage_polymorph',
    name: 'Toad Hex',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Silence a minion and set its Attack and Health to 1.',
    flavor: 'She turned him into a toad. The parish called it an improvement.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'silence', target: 'chosenTarget' },
      { kind: 'setStats', atk: 1, health: 1, target: 'chosenTarget' },
    ],
  },

  /**
   * Salt the Threshold — draw 2 cards and gain 3 Armor.
   * (Proactive card advantage plus a defensive rider, representing the
   * "we prevented something big" value. Costed at 4 so it sits above the
   * plain draw-2 of Forbidden Almanac.)
   */
  {
    id: 'mage_counterspell',
    name: 'Salt the Threshold',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Draw 2 cards. Gain 3 Armor.',
    flavor: "Keeps out devils, creditors, and the curate's wandering hands.",
    spell: [
      { kind: 'draw', count: 2 },
      { kind: 'gainArmor', amount: 3 },
    ],
  },

  // --- 5-cost ---
  /**
   * Into the Bog — destroy a minion.
   * (Unconditional single-target destroy, costed at the 5-mana hard-removal
   * anchor.)
   */
  {
    id: 'mage_vaporize',
    name: 'Into the Bog',
    cost: 5,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Destroy a minion.',
    flavor: 'The bog takes what it is offered and returns nothing. Much like the collection plate.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },

  /**
   * The Hagglewitch — 4/5. Omen: Reduce the cost of cards in your hand by (1).
   * (The unconditional discount is toned to (1) and costed at 5.)
   */
  {
    id: 'mage_leyline_manipulator',
    name: 'The Hagglewitch',
    cost: 5,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: '**Omen:** Reduce the Cost of cards in your hand by (1).',
    flavor: "She'll knock a penny off anything. Commandments included.",
    attack: 4,
    health: 5,
    tribe: 'none',
    battlecry: [{ kind: 'reduceCostInHand', amount: 1, filter: 'all' }],
  },

  /**
   * Sinner's Psalter — add 3 random Stargazer spells to your hand.
   * Key value engine for spell-heavy archetypes. (Text names the class, so the
   * pool is locked to the class via fromClass.)
   */
  {
    id: 'mage_cabalists_tome',
    name: "Sinner's Psalter",
    cost: 5,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Add 3 random Stargazer spells to your hand.',
    flavor: 'Three new prayers every printing, and not one of them fit for church.',
    spell: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 3, fromClass: 'mage' }],
  },

  // --- 6-cost ---
  /**
   * The Comet's Bride — 4/5. Spell Damage +2. A large mid-range body that
   * dramatically powers up your remaining burn spells.
   */
  {
    id: 'mage_nexus_champion',
    name: "The Comet's Bride",
    cost: 6,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'legendary',
    text: '**Spell Damage +2.**',
    flavor: 'Left the blacksmith at the altar for something hotter.',
    attack: 4,
    health: 5,
    tribe: 'elemental',
    spellDamage: 2,
  },

  /**
   * Star-Chart Séance — discover a spell; then add 2 random Stargazer spells
   * to your hand. (One mana above Sinner's Psalter for swapping a random
   * spell into a discovered one. The discover pool uses the default
   * class + neutral lock; the random spells are locked to the class because
   * the text names it.)
   */
  {
    id: 'mage_glacial_mysteries',
    name: 'Star-Chart Séance',
    cost: 6,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Discover a spell. Add 2 random Stargazer spells to your hand.',
    flavor: 'The dead know every constellation. They have the better view.',
    spell: [
      { kind: 'discover', pool: 'spell' },
      { kind: 'addRandomCardToHand', pool: 'spell', count: 2, fromClass: 'mage' },
    ],
  },

  // --- 7-cost ---
  /**
   * Old Mother Wick — 5/7. Whenever you cast a spell, add a Tallow Comet to
   * your hand. Legendary value engine and finisher for spell-heavy decks.
   */
  {
    id: 'mage_antonidas',
    name: 'Old Mother Wick',
    cost: 7,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'legendary',
    text: 'Whenever you cast a spell, add a Tallow Comet to your hand.',
    flavor: 'She dips her candles in something the church refuses to name. Repeat custom guaranteed.',
    attack: 5,
    health: 7,
    tribe: 'none',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'addCardToHand', cardId: 'mage_fireball', count: 1 }],
        condition: 'cardIsSpell',
      },
    ],
  },
]
