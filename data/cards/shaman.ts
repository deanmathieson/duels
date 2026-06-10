import type { CardDef } from '../../game/types'

/**
 * Augur class cards for Granny Mireweather.
 * Theme: staked Effigies, bog-spirits, bartered storms, board buffs.
 * ~18 collectible cards spanning the mana curve (1-9), plus token cards.
 */
export const shamanCards: CardDef[] = [

  // =========================================================================
  // TOKEN CARDS (token: true) — summoned by collectible cards below
  // =========================================================================

  /**
   * Gallowstone Effigy token — 0/2 Effigy with Ward.
   * Summoned by the Stake an Effigy hero power and Great Wicker Effigy.
   */
  {
    id: 'shaman_token_stoneskin_totem',
    name: 'Gallowstone Effigy',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '**Ward**',
    flavor: 'Quarried from the hanging-hill. It stands very still and it judges.',
    attack: 0,
    health: 2,
    tribe: 'totem',
    keywords: ['taunt'],
    token: true,
  },

  /**
   * Candlewick Effigy token — 1/1 Effigy.
   * Summoned by the Stake an Effigy hero power and Stake the Marsh.
   */
  {
    id: 'shaman_token_searing_totem',
    name: 'Candlewick Effigy',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '',
    flavor: 'One spark of spite keeps it lit all winter.',
    attack: 1,
    health: 1,
    tribe: 'totem',
    token: true,
  },

  /**
   * Weathervane Effigy token — 0/2 Effigy with Spell Damage +1.
   * Summoned by the Stake an Effigy hero power.
   */
  {
    id: 'shaman_token_wrath_of_air_totem',
    name: 'Weathervane Effigy',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '**Spell Damage +1**',
    flavor: 'It points wherever the storm wants to be. Usually at somebody.',
    attack: 0,
    health: 2,
    tribe: 'totem',
    spellDamage: 1,
    token: true,
  },

  /**
   * Rain-Calling Effigy token — 0/2 Effigy. At the end of your turn, restore 2 Health
   * to your hero.
   */
  {
    id: 'shaman_token_healing_stream_totem',
    name: 'Rain-Calling Effigy',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'At the end of your turn, restore 2 Health to your hero.',
    flavor: 'It weeps all night so the village does not have to.',
    attack: 0,
    health: 2,
    tribe: 'totem',
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'heal', amount: 2, target: 'friendlyHero' }],
      },
    ],
    token: true,
  },

  /**
   * Storm-Bought Spirit token — 3-mana 3/5 Spirit. Added to hand by the
   * Riotous Wake signature treasure. (Costed at 3 so the generated card
   * is a fair on-curve play rather than a free 3/5.)
   */
  {
    id: 'shaman_token_lightning_elemental',
    name: 'Storm-Bought Spirit',
    cost: 3,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '',
    flavor: 'Paid for in full. The receipt was struck by lightning.',
    attack: 3,
    health: 5,
    tribe: 'elemental',
    token: true,
  },

  // =========================================================================
  // COLLECTIBLE CARDS
  // =========================================================================

  // --- 1-cost ---

  /**
   * Stolen Thunder — 2 mana. Deal 3 damage.
   */
  {
    id: 'shaman_lightning_bolt',
    name: 'Stolen Thunder',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Deal 3 damage.',
    flavor: 'Lifted off a sleeping storm. The storm woke up poorer and furious.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
  },

  /**
   * Bog-Iron Knuckles — 1 mana. Give your hero +3 Attack this turn.
   * (Hero-only attack buff; requires attacking, so priced at 1.)
   */
  {
    id: 'shaman_rockbiter_weapon',
    name: 'Bog-Iron Knuckles',
    cost: 1,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Give your hero +3 Attack this turn.',
    flavor: 'The midwife owns a pair. Deliveries are remarkably prompt.',
    spell: [{ kind: 'heroAttackThisTurn', amount: 3 }],
  },

  // --- 2-cost ---

  /**
   * War-Drum Effigy — 0/3 Effigy. Aura: your other minions have +1 Attack.
   * (Engine auras are board-wide, so the bonus is a flat +1 to keep the
   * total aura value in budget.)
   */
  {
    id: 'shaman_flametongue_totem',
    name: 'War-Drum Effigy',
    cost: 2,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Your other minions have +1 Attack.',
    flavor: 'It has no drum. It beats time on whichever villager stands nearest.',
    attack: 0,
    health: 3,
    tribe: 'totem',
    auras: [{ kind: 'minionStat', atk: 1, filter: 'minion' }],
  },

  /**
   * Stake the Marsh — 2 mana. Summon a Candlewick Effigy and a Gallowstone Effigy.
   */
  {
    id: 'shaman_totemic_surge',
    name: 'Stake the Marsh',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'common',
    text: 'Summon a 1/1 Candlewick Effigy and a 0/2 Gallowstone Effigy with Ward.',
    flavor: 'Two stakes, one muttered prayer, and a rude gesture at the heavens.',
    spell: [
      { kind: 'summon', token: 'shaman_token_searing_totem', count: 1 },
      { kind: 'summon', token: 'shaman_token_stoneskin_totem', count: 1 },
    ],
  },

  // --- 3-cost ---

  /**
   * Read the Entrails — 3 mana. Draw a card; cards in hand cost (1) less.
   * (The engine cannot discount the drawn card alone, so it is approximated
   * as a hand-wide (1) discount — the draw resolves first, so the drawn card
   * is included.)
   */
  {
    id: 'shaman_far_sight',
    name: 'Read the Entrails',
    cost: 3,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'epic',
    text: 'Draw a card. Reduce the Cost of cards in your hand by (1).',
    flavor: 'The pig knew its future. Now you know yours. Neither of you is pleased.',
    spell: [
      { kind: 'draw', count: 1 },
      { kind: 'reduceCostInHand', amount: 1, filter: 'all' },
    ],
  },

  /**
   * Whistle Up the Hounds — 4 mana. Summon two 2/3 Gallows Hounds with Ward.
   * (Token: shaman_token_spirit_wolf.)
   */
  {
    id: 'shaman_feral_spirit',
    name: 'Whistle Up the Hounds',
    cost: 4,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Summon two 2/3 Gallows Hounds with **Ward**.',
    flavor: 'Every gallows in the county kept a dog that stayed past the hanging. Nan collects them.',
    spell: [{ kind: 'summon', token: 'shaman_token_spirit_wolf', count: 2 }],
  },

  /**
   * Bartered Squall — 3 mana. Deal 2 damage to all enemy minions.
   */
  {
    id: 'shaman_lightning_storm',
    name: 'Bartered Squall',
    cost: 3,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 2 damage to all enemy minions.',
    flavor: 'Price: one wedding ring, two confessions, and whatever was in the poor-box.',
    spell: [{ kind: 'damage', amount: 2, target: 'enemyMinions' }],
  },

  // --- 4-cost ---

  /**
   * The Toading — 4 mana. Transform a minion into a 0/1 with Ward.
   * Approximated as: silence the minion, then set its stats to 0/1 and give Ward.
   */
  {
    id: 'shaman_hex',
    name: 'The Toading',
    cost: 4,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Transform a minion into a 0/1 with **Ward**.',
    flavor: 'The magistrate has been "away on business" since Michaelmas. The pond has a new magistrate.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'silence', target: 'chosenTarget' },
      { kind: 'setStats', atk: 0, health: 1, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
  },

  /**
   * Great Wicker Effigy — 3/4 Effigy. Omen: Summon a Gallowstone Effigy.
   */
  {
    id: 'shaman_totem_golem',
    name: 'Great Wicker Effigy',
    cost: 4,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Omen:** Summon a 0/2 Gallowstone Effigy with **Ward**.',
    flavor: 'Built for the harvest festival. Nobody remembers what they put inside it. It remembers.',
    attack: 3,
    health: 4,
    tribe: 'totem',
    battlecry: [{ kind: 'summon', token: 'shaman_token_stoneskin_totem', count: 1 }],
  },

  // --- 5-cost ---

  /**
   * Devil's Round — 5 mana. Give your minions +3 Attack this turn.
   */
  {
    id: 'shaman_bloodlust',
    name: "Devil's Round",
    cost: 5,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Give your minions +3 Attack this turn.',
    flavor: 'The Devil stood drinks at the Hanged Man till closing. The tab came due at dawn.',
    spell: [{ kind: 'buffThisTurn', atk: 3, target: 'friendlyMinions' }],
  },

  /**
   * Barrowheart — 7 mana 5/8 Spirit with Ward. Omen: Gain 3 Armor.
   */
  {
    id: 'shaman_earth_elemental',
    name: 'Barrowheart',
    cost: 7,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'epic',
    text: '**Ward.** **Omen:** Gain 3 Armor.',
    flavor: 'The hill was here before the church. It will be here after. It is keeping score.',
    attack: 5,
    health: 8,
    tribe: 'elemental',
    keywords: ['taunt'],
    battlecry: [{ kind: 'gainArmor', amount: 3 }],
  },

  // --- 6-cost ---

  /**
   * Corpse-Candle — 6 mana. Deal 5 damage. Draw a card.
   */
  {
    id: 'shaman_lava_burst',
    name: 'Corpse-Candle',
    cost: 6,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 5 damage. Draw a card.',
    flavor: 'Follow the pretty light, dearie. It knows a shortcut.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 5, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
  },

  // (The big fire Spirit lives in neutral.ts — Augurs draft the neutral copy.)

  // --- 7-cost ---

  /**
   * Grandmother Gale — 3/5 Spirit with Charge, Flurry, Ward, and Blessing.
   * (Blessing is encoded as a static keyword — the engine applies it on summon —
   * rather than a hidden Omen, so the card text needs no Omen marker.)
   */
  {
    id: 'shaman_alakir_the_windlord',
    name: 'Grandmother Gale',
    cost: 8,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Charge, Flurry, Ward, Blessing.**',
    flavor: "She blew the parson's roof off over a sermon she disliked. He preaches charity now, hatless.",
    attack: 3,
    health: 5,
    tribe: 'elemental',
    keywords: ['charge', 'windfury', 'taunt', 'divineShield'],
  },

  /**
   * The Moss King — 5 mana 5/5 Effigy with Ward.
   * (Modelled as a pre-discounted 5-mana 5/5 Ward body.)
   */
  {
    id: 'shaman_thing_from_below',
    name: 'The Moss King',
    cost: 5,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'rare',
    text: '**Ward**',
    flavor: 'Staked in the fen before the parish had a name. Lately the offerings come back chewed.',
    attack: 5,
    health: 5,
    tribe: 'totem',
    keywords: ['taunt'],
  },

  // --- 8-cost ---

  /**
   * The Drowned Bell — 7/7 Spirit. Omen: Deal 2 damage to all enemies.
   */
  {
    id: 'shaman_kalimos_primal_lord',
    name: 'The Drowned Bell',
    cost: 8,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Omen:** Deal 2 damage to all enemies.',
    flavor: 'The old church sank with the congregation mid-hymn. On still nights it takes requests.',
    attack: 7,
    health: 7,
    tribe: 'elemental',
    battlecry: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
  },

  // --- 9-cost ---

  /**
   * Auntie Hemlock — 5/5. Omen: Deal 3 damage to all minions. After you play
   * a minion, add a random Augur spell to your hand.
   * (The generation class lock supports class-named pools, so the trigger uses
   * the random-Augur-spell effect; fromClass: 'shaman' because the text
   * names the calling.)
   */
  {
    id: 'shaman_hagatha_the_witch',
    name: 'Auntie Hemlock',
    cost: 9,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Omen:** Deal 3 damage to all minions. After you play a minion, add a random Augur spell to your hand.',
    flavor: 'She delivered half the parish and poisoned the other half. A few lucky souls got both.',
    attack: 5,
    health: 5,
    tribe: 'none',
    battlecry: [{ kind: 'damage', amount: 3, target: 'allMinions' }],
    triggers: [
      {
        event: 'onPlayMinion',
        effects: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 1, fromClass: 'shaman' }],
      },
    ],
  },

  // =========================================================================
  // ADDITIONAL TOKENS referenced above
  // =========================================================================

  /**
   * Gallows Hound token — 2/3 Beast with Ward. Summoned by Whistle Up the Hounds.
   */
  {
    id: 'shaman_token_spirit_wolf',
    name: 'Gallows Hound',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '**Ward**',
    flavor: 'Loyal to whoever fed it last. Nobody asks what.',
    attack: 2,
    health: 3,
    tribe: 'beast',
    keywords: ['taunt'],
    token: true,
  },

  /**
   * Bog-Iron Maul weapon token — 2/6 weapon. Equipped by the Bog-Iron Maul spell card.
   * (Hero Flurry — attacking twice — is not supported by the engine, so no
   * keyword text; durability sits at 6 to keep the weapon fairly costed.)
   */
  {
    id: 'shaman_token_doomhammer_weapon',
    name: 'Bog-Iron Maul',
    cost: 0,
    type: 'weapon',
    cardClass: 'shaman',
    rarity: 'free',
    text: '',
    flavor: 'Rust, peat and grudge in equal measure.',
    attack: 2,
    durability: 6,
    token: true,
  },

  // =========================================================================
  // NEW COLLECTIBLE CARDS — appended to reach ~29 collectibles
  // =========================================================================

  // --- 1-cost (new) ---

  /**
   * Stir the Drowning-Pool — 2 mana. Deal 1 damage to all enemy minions.
   * Summon a 1/1 Candlewick Effigy. (1-damage AoE alone is the 2-mana anchor.)
   */
  {
    id: 'shaman_maelstrom_portal',
    name: 'Stir the Drowning-Pool',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 1 damage to all enemy minions. Summon a 1/1 Candlewick Effigy.',
    flavor: 'Widdershins, three times, and never mind the hands that stir back.',
    spell: [
      { kind: 'damage', amount: 1, target: 'enemyMinions' },
      { kind: 'summon', token: 'shaman_token_searing_totem', count: 1 },
    ],
  },

  /**
   * Bog-Born Urchin — 1/3 minion. Rush.
   * A fast 1-drop that bites ankles the moment it lands.
   */
  {
    id: 'shaman_tunnel_trogg',
    name: 'Bog-Born Urchin',
    cost: 1,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Rush**',
    flavor: 'Found in a reed basket. Returned twice. Kept on the third try, out of fear.',
    attack: 1,
    health: 3,
    tribe: 'none',
    keywords: ['rush'],
  },

  // --- 2-cost (new) ---

  /**
   * Ask the Dead — 3 mana. Draw 2 cards.
   */
  {
    id: 'shaman_ancestral_knowledge',
    name: 'Ask the Dead',
    cost: 3,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'common',
    text: 'Draw 2 cards.',
    flavor: 'The dead never stop talking. The trick is getting a word in.',
    spell: [{ kind: 'draw', count: 2 }],
  },

  /**
   * Watchful Dead — 2 mana. Give a friendly minion +2/+2 and **Ward**.
   * The departed kin shoulder in beside the living and refuse to budge.
   */
  {
    id: 'shaman_ancestral_spirit',
    name: 'Watchful Dead',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Give a friendly minion +2/+2 and **Ward**.',
    flavor: 'Grandfather never approved of fighting. He approves of losing even less.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 2, health: 2, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
  },

  /**
   * Witch's Pinch — 2 mana. Deal 2 damage to a minion. Draw a card.
   * Cheap instant removal that replaces itself.
   */
  {
    id: 'shaman_lava_shock',
    name: "Witch's Pinch",
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 2 damage to a minion. Draw a card.',
    flavor: 'Just a little pinch, love. The bruise lasts a fortnight and the shame forever.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
  },

  // --- 3-cost (new) ---

  /**
   * Stew-House Matron — 2/4 Spirit. Omen: Restore 4 Health to your hero.
   */
  {
    id: 'shaman_hot_spring_guardian',
    name: 'Stew-House Matron',
    cost: 3,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Omen:** Restore 4 Health to your hero.',
    flavor: 'Her bath-house cures the ague, the gout and the loneliness. The third costs extra.',
    attack: 2,
    health: 4,
    tribe: 'elemental',
    battlecry: [{ kind: 'heal', amount: 4, target: 'friendlyHero' }],
  },

  /**
   * Unquiet Spirit — 2/4 Spirit with Rush.
   * A solid spirit body that hits the ground haunting.
   */
  {
    id: 'shaman_unbound_elemental',
    name: 'Unquiet Spirit',
    cost: 3,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Rush**',
    flavor: "The exorcism didn't take. Neither did the second. The vicar takes long walks now.",
    attack: 2,
    health: 4,
    tribe: 'elemental',
    keywords: ['rush'],
  },

  // --- 4-cost (new) ---

  /**
   * Weather-Eyed Vagrant — 3/4 Spirit. Omen: Draw a card.
   * Reads tomorrow's sky and yesterday's pockets.
   */
  {
    id: 'shaman_storm_chaser',
    name: 'Weather-Eyed Vagrant',
    cost: 4,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'rare',
    text: '**Omen:** Draw a card.',
    flavor: 'He smells rain three days out and ale through a sealed cellar door.',
    attack: 3,
    health: 4,
    tribe: 'elemental',
    battlecry: [{ kind: 'draw', count: 1 }],
  },

  // --- 5-cost (new) ---

  /**
   * Bog-Iron Maul — 5 mana. Equip a 2/6 weapon. Give your hero +2 Attack this turn.
   * The Augur's signature peat-pulled cudgel.
   */
  {
    id: 'shaman_doomhammer',
    name: 'Bog-Iron Maul',
    cost: 5,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'epic',
    text: 'Equip a 2/6 weapon. Give your hero +2 Attack this turn.',
    flavor: "Pulled from the peat with the last owner still attached. He didn't haggle.",
    spell: [
      { kind: 'equipWeapon', cardId: 'shaman_token_doomhammer_weapon' },
      { kind: 'heroAttackThisTurn', amount: 2 },
    ],
  },

  /**
   * Harvest-Queen Effigy — 3/6 Effigy. Ward. Omen: Give your other minions +1/+1.
   * (The engine has no tribe-filtered target selector, so the buff hits all
   * other friendly minions — kept at +1/+1 to pay for the wider reach.)
   */
  {
    id: 'shaman_thunderbluff_valiant',
    name: 'Harvest-Queen Effigy',
    cost: 5,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'rare',
    text: '**Ward. Omen:** Give your other minions +1/+1.',
    flavor: 'Crowned every autumn, kissed by every fool, burned by spring. She holds a grudge about the kissing.',
    attack: 3,
    health: 6,
    tribe: 'totem',
    keywords: ['taunt'],
    battlecry: [{ kind: 'buff', atk: 1, health: 1, target: 'otherFriendlyMinions' }],
  },

  /**
   * The Bog Boils — 5 mana. Deal 5 damage to all minions.
   * The Augur board-wipe.
   */
  {
    id: 'shaman_volcano',
    name: 'The Bog Boils',
    cost: 5,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 5 damage to all minions.',
    flavor: 'The marsh keeps its secrets at a simmer. Once a generation, it shares.',
    spell: [{ kind: 'damage', amount: 5, target: 'allMinions' }],
  },

  /**
   * Gravesinger Cobb — 7 mana 5/5. Omen: Give all friendly minions +1/+1 and
   * summon a Gallows Hound. A board-wide buff finisher.
   * (Body + board buff + 2/3 Ward summon is ~8 mana of value; costed at 7.)
   */
  {
    id: 'shaman_thrall_deathseer',
    name: 'Gravesinger Cobb',
    cost: 7,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Omen:** Give your minions +1/+1. Summon a 2/3 Gallows Hound with **Ward**.',
    flavor: 'He leads the funeral choir in a filthy shanty, and the departed always join the chorus.',
    attack: 5,
    health: 5,
    tribe: 'none',
    battlecry: [
      { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
      { kind: 'summon', token: 'shaman_token_spirit_wolf', count: 1 },
    ],
  },
]
