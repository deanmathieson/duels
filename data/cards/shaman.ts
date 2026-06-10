import type { CardDef } from '../../game/types'

/**
 * Shaman class cards for Instructor Fireheart.
 * Theme: Totems, Elementals, Lightning damage, board buffs.
 * ~18 collectible cards spanning the mana curve (1-9), plus token cards.
 */
export const shamanCards: CardDef[] = [

  // =========================================================================
  // TOKEN CARDS (token: true) — summoned by collectible cards below
  // =========================================================================

  /**
   * Stoneskin Totem token — 0/2 Totem with Taunt.
   * Summoned by Totemic Call hero power and Totem Golem.
   */
  {
    id: 'shaman_token_stoneskin_totem',
    name: 'Stoneskin Totem',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '**Ward**',
    attack: 0,
    health: 2,
    tribe: 'totem',
    keywords: ['taunt'],
    token: true,
  },

  /**
   * Searing Totem token — 1/1 Totem.
   * Summoned by Totemic Call hero power and Totemic Surge.
   */
  {
    id: 'shaman_token_searing_totem',
    name: 'Searing Totem',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    tribe: 'totem',
    token: true,
  },

  /**
   * Wrath of Air Totem token — 0/2 Totem with Spell Damage +1.
   * Summoned by Totemic Call hero power.
   */
  {
    id: 'shaman_token_wrath_of_air_totem',
    name: 'Wrath of Air Totem',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '**Spell Damage +1**',
    attack: 0,
    health: 2,
    tribe: 'totem',
    spellDamage: 1,
    token: true,
  },

  /**
   * Healing Stream Totem token — 0/2 Totem. At the end of your turn, restore 2 Health
   * to your hero.
   */
  {
    id: 'shaman_token_healing_stream_totem',
    name: 'Healing Stream Totem',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'At the end of your turn, restore 2 Health to your hero.',
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
   * Lightning Elemental token — 3-mana 3/5 Elemental. Added to hand by the
   * Ancestral Spirits signature treasure. (Costed at 3 so the generated card
   * is a fair on-curve play rather than a free 3/5.)
   */
  {
    id: 'shaman_token_lightning_elemental',
    name: 'Lightning Elemental',
    cost: 3,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '',
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
   * Lightning Bolt — 2 mana. Deal 3 damage. (Real card is 1 mana with Overload (1);
   * the engine has no Overload, so it is re-costed to 2 — the Frostbolt anchor.)
   */
  {
    id: 'shaman_lightning_bolt',
    name: 'Lightning Bolt',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Deal 3 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
  },

  /**
   * Rockbiter Weapon — 1 mana. Give your hero +3 Attack this turn.
   * (Hero-only version of the real card; requires attacking, so priced at 1.)
   */
  {
    id: 'shaman_rockbiter_weapon',
    name: 'Rockbiter Weapon',
    cost: 1,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Give your hero +3 Attack this turn.',
    spell: [{ kind: 'heroAttackThisTurn', amount: 3 }],
  },

  // --- 2-cost ---

  /**
   * Flametongue Totem — 0/3 Totem. Aura: your other minions have +1 Attack.
   * (Real card gives +2 to ADJACENT minions only; engine auras are board-wide,
   * so the bonus is halved to +1 to keep the total aura value comparable.)
   */
  {
    id: 'shaman_flametongue_totem',
    name: 'Flametongue Totem',
    cost: 2,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Your other minions have +1 Attack.',
    attack: 0,
    health: 3,
    tribe: 'totem',
    auras: [{ kind: 'minionStat', atk: 1, filter: 'minion' }],
  },

  /**
   * Totemic Surge — 2 mana. Summon a Searing Totem and a Stoneskin Totem.
   */
  {
    id: 'shaman_totemic_surge',
    name: 'Totemic Surge',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'common',
    text: 'Summon a 1/1 Searing Effigy and a 0/2 Stoneskin Effigy with Ward.',
    spell: [
      { kind: 'summon', token: 'shaman_token_searing_totem', count: 1 },
      { kind: 'summon', token: 'shaman_token_stoneskin_totem', count: 1 },
    ],
  },

  // --- 3-cost ---

  /**
   * Far Sight — 3 mana. Draw a card; cards in hand cost (1) less.
   * (Real card reduces only the DRAWN card by (3); the engine cannot target the
   * drawn card alone, so it is approximated as a hand-wide (1) discount — the
   * draw resolves first, so the drawn card is included.)
   */
  {
    id: 'shaman_far_sight',
    name: 'Far Sight',
    cost: 3,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'epic',
    text: 'Draw a card. Reduce the Cost of cards in your hand by (1).',
    spell: [
      { kind: 'draw', count: 1 },
      { kind: 'reduceCostInHand', amount: 1, filter: 'all' },
    ],
  },

  /**
   * Feral Spirit — 4 mana. Summon two 2/3 Spirit Wolves with Taunt.
   * (Real card is 3 mana with Overload (2); the engine has no Overload, so it is
   * re-costed to 4 to pay for the wolves up front. Token: shaman_token_spirit_wolf.)
   */
  {
    id: 'shaman_feral_spirit',
    name: 'Feral Spirit',
    cost: 4,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Summon two 2/3 Spirit Wolves with **Ward**.',
    spell: [{ kind: 'summon', token: 'shaman_token_spirit_wolf', count: 2 }],
  },

  /**
   * Lightning Storm — 3 mana. Deal 2 damage to all enemy minions.
   * (Real card deals 2-3 with Overload (2); the engine has neither random damage
   * ranges nor Overload, so it is fixed at 2 damage for the un-Overloaded cost.)
   */
  {
    id: 'shaman_lightning_storm',
    name: 'Lightning Storm',
    cost: 3,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 2 damage to all enemy minions.',
    spell: [{ kind: 'damage', amount: 2, target: 'enemyMinions' }],
  },

  // --- 4-cost ---

  /**
   * Hex — 4 mana. Transform a minion into a 0/1 Frog with Taunt.
   * Approximated as: silence the minion, then set its stats to 0/1 and give Taunt.
   */
  {
    id: 'shaman_hex',
    name: 'Hex',
    cost: 4,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Transform a minion into a 0/1 with **Ward**.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'silence', target: 'chosenTarget' },
      { kind: 'setStats', atk: 0, health: 1, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
  },

  /**
   * Totem Golem — 3/4 Elemental Totem. Battlecry: Summon a Stoneskin Totem.
   * (Overload approximated: no Overload in engine.)
   */
  {
    id: 'shaman_totem_golem',
    name: 'Totem Golem',
    cost: 4,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Omen:** Summon a 0/2 Stoneskin Effigy with **Ward**.',
    attack: 3,
    health: 4,
    tribe: 'totem',
    battlecry: [{ kind: 'summon', token: 'shaman_token_stoneskin_totem', count: 1 }],
  },

  // --- 5-cost ---

  /**
   * Bloodlust — 5 mana. Give your minions +3 Attack this turn.
   */
  {
    id: 'shaman_bloodlust',
    name: 'Bloodlust',
    cost: 5,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'free',
    text: 'Give your minions +3 Attack this turn.',
    spell: [{ kind: 'buffThisTurn', atk: 3, target: 'friendlyMinions' }],
  },

  /**
   * Earth Elemental — 7 mana 5/8 Elemental with Taunt. Battlecry: Gain 3 Armor.
   * (Real card is 5 mana with Overload (3); the engine has no Overload, so it is
   * re-costed to 7 to pay the full price up front. Armor battlecry replaces the
   * lost Overload flavor.)
   */
  {
    id: 'shaman_earth_elemental',
    name: 'Earth Elemental',
    cost: 7,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'epic',
    text: '**Ward.** **Omen:** Gain 3 Armor.',
    attack: 5,
    health: 8,
    tribe: 'elemental',
    keywords: ['taunt'],
    battlecry: [{ kind: 'gainArmor', amount: 3 }],
  },

  // --- 6-cost ---

  /**
   * Lava Burst — 6 mana. Deal 5 damage. Draw a card.
   * (Overload approximated: draw a card instead to compensate.)
   */
  {
    id: 'shaman_lava_burst',
    name: 'Lava Burst',
    cost: 6,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 5 damage. Draw a card.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 5, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
  },

  // (Fire Elemental lives in neutral.ts — shamans draft the neutral copy.)

  // --- 7-cost ---

  /**
   * Al'Akir the Windlord — 3/5 Elemental with Charge, Windfury, Taunt, and Divine Shield.
   * (Divine Shield is encoded as a static keyword — the engine applies it on summon —
   * rather than a hidden Battlecry, so the card text needs no Battlecry marker.)
   */
  {
    id: 'shaman_alakir_the_windlord',
    name: "Al'Akir the Windlord",
    cost: 8,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Charge, Flurry, Ward, Blessing.**',
    attack: 3,
    health: 5,
    tribe: 'elemental',
    keywords: ['charge', 'windfury', 'taunt', 'divineShield'],
  },

  /**
   * Thing from Below — 5 mana 5/5 Totem with Taunt.
   * (Real card costs (1) less for each Totem summoned; the engine has no
   * cost-tracking mechanic, so it is modelled as a pre-discounted 5-mana 5/5 Taunt.)
   */
  {
    id: 'shaman_thing_from_below',
    name: 'Thing from Below',
    cost: 5,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'rare',
    text: '**Ward**',
    attack: 5,
    health: 5,
    tribe: 'totem',
    keywords: ['taunt'],
  },

  // --- 8-cost ---

  /**
   * Kalimos, Primal Lord — 7/7 Elemental. Battlecry: Deal 2 damage to all enemies.
   * (Real card discovers an Elemental Invocation; approximated as a fixed AoE
   * battlecry. The earlier "3 to all enemies + draw 2" version was several mana
   * over budget, so the draw rider was removed and the AoE trimmed to 2 — the
   * same battlecry budget as Grommash Hellscream at 8.)
   */
  {
    id: 'shaman_kalimos_primal_lord',
    name: 'Kalimos, Primal Lord',
    cost: 8,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Omen:** Deal 2 damage to all enemies.',
    attack: 7,
    health: 7,
    tribe: 'elemental',
    battlecry: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
  },

  // --- 9-cost ---

  /**
   * Hagatha the Witch — 5/5. Battlecry: Deal 3 damage to all minions. After you play
   * a minion, add a random Shaman spell to your hand.
   * (The generation class lock now supports class-named pools, so the trigger uses
   * the authentic random-Shaman-spell effect; fromClass: 'shaman' because the text
   * names the class.)
   */
  {
    id: 'shaman_hagatha_the_witch',
    name: 'Hagatha the Witch',
    cost: 9,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Omen:** Deal 3 damage to all minions. After you play a minion, add a random Shaman spell to your hand.',
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
   * Spirit Wolf token — 2/3 Beast with Taunt. Summoned by Feral Spirit.
   */
  {
    id: 'shaman_token_spirit_wolf',
    name: 'Spirit Wolf',
    cost: 0,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'free',
    text: '**Ward**',
    attack: 2,
    health: 3,
    tribe: 'beast',
    keywords: ['taunt'],
    token: true,
  },

  /**
   * Doomhammer weapon token — 2/6 weapon. Equipped by the Doomhammer spell card.
   * (Hero Windfury — attacking twice — is not supported by the engine, so the
   * keyword text is dropped; durability trimmed from 8 to 6 since the real
   * card's Overload (2) drawback is also gone.)
   */
  {
    id: 'shaman_token_doomhammer_weapon',
    name: 'Doomhammer',
    cost: 0,
    type: 'weapon',
    cardClass: 'shaman',
    rarity: 'free',
    text: '',
    attack: 2,
    durability: 6,
    token: true,
  },

  // =========================================================================
  // NEW COLLECTIBLE CARDS — appended to reach ~29 collectibles
  // =========================================================================

  // --- 1-cost (new) ---

  /**
   * Maelstrom Portal — 2 mana. Deal 1 damage to all enemy minions.
   * Summon a 1/1 Searing Totem. (1-damage AoE alone is the 2-mana anchor;
   * re-costed from 1 to 2, matching the real card's cost.)
   */
  {
    id: 'shaman_maelstrom_portal',
    name: 'Maelstrom Portal',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 1 damage to all enemy minions. Summon a 1/1 Searing Effigy.',
    spell: [
      { kind: 'damage', amount: 1, target: 'enemyMinions' },
      { kind: 'summon', token: 'shaman_token_searing_totem', count: 1 },
    ],
  },

  /**
   * Tunnel Trogg — 1/3 minion. Rush.
   * Approximates the Overload-synergy body as a fast 1-drop with Rush.
   */
  {
    id: 'shaman_tunnel_trogg',
    name: 'Tunnel Trogg',
    cost: 1,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Rush**',
    attack: 1,
    health: 3,
    tribe: 'none',
    keywords: ['rush'],
  },

  // --- 2-cost (new) ---

  /**
   * Ancestral Knowledge — 3 mana. Draw 2 cards.
   * (Real card is 2 mana with Overload (2); the engine has no Overload, so it is
   * re-costed to 3 — the Arcane Intellect anchor.)
   */
  {
    id: 'shaman_ancestral_knowledge',
    name: 'Ancestral Knowledge',
    cost: 3,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'common',
    text: 'Draw 2 cards.',
    spell: [{ kind: 'draw', count: 2 }],
  },

  /**
   * Ancestral Spirit — 2 mana. Give a friendly minion +2/+2 and **Taunt**.
   * Approximates the deathrattle-resummon effect using a stat buff to represent
   * the value provided, since the engine has no "resummon on death" EffectSpec.
   */
  {
    id: 'shaman_ancestral_spirit',
    name: 'Ancestral Spirit',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Give a friendly minion +2/+2 and **Ward**.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 2, health: 2, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
  },

  /**
   * Lava Shock — 2 mana. Deal 2 damage to a minion. Draw a card.
   * Cheap instant removal that replaces itself.
   */
  {
    id: 'shaman_lava_shock',
    name: 'Lava Shock',
    cost: 2,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 2 damage to a minion. Draw a card.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
  },

  // --- 3-cost (new) ---

  /**
   * Hot Spring Guardian — 2/4 Elemental. Battlecry: Restore 4 Health to your hero.
   */
  {
    id: 'shaman_hot_spring_guardian',
    name: 'Hot Spring Guardian',
    cost: 3,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Omen:** Restore 4 Health to your hero.',
    attack: 2,
    health: 4,
    tribe: 'elemental',
    battlecry: [{ kind: 'heal', amount: 4, target: 'friendlyHero' }],
  },

  /**
   * Unbound Elemental — 2/4 Elemental with Rush.
   * Approximates the Overload-synergy grower as a solid elemental body with Rush.
   */
  {
    id: 'shaman_unbound_elemental',
    name: 'Unbound Elemental',
    cost: 3,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'common',
    text: '**Rush**',
    attack: 2,
    health: 4,
    tribe: 'elemental',
    keywords: ['rush'],
  },

  // --- 4-cost (new) ---

  /**
   * Storm Chaser — 3/4 Elemental. Battlecry: Draw a card.
   * Represents the elemental chain that draws a spell.
   */
  {
    id: 'shaman_storm_chaser',
    name: 'Storm Chaser',
    cost: 4,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'rare',
    text: '**Omen:** Draw a card.',
    attack: 3,
    health: 4,
    tribe: 'elemental',
    battlecry: [{ kind: 'draw', count: 1 }],
  },

  // --- 5-cost (new) ---

  /**
   * Doomhammer — 5 mana. Equip a 2/6 Doomhammer weapon. Give your hero +2 Attack this turn.
   * Classic Shaman weapon. (Hero Windfury is not supported by the engine —
   * approximated via the one-time heroAttackThisTurn bonus and a trimmed 2/6 weapon.)
   */
  {
    id: 'shaman_doomhammer',
    name: 'Doomhammer',
    cost: 5,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'epic',
    text: 'Equip a 2/6 weapon. Give your hero +2 Attack this turn.',
    spell: [
      { kind: 'equipWeapon', cardId: 'shaman_token_doomhammer_weapon' },
      { kind: 'heroAttackThisTurn', amount: 2 },
    ],
  },

  /**
   * Thunderbluff Valiant — 3/6 Totem. Taunt. Battlecry: Give your other minions +1/+1.
   * (Real card buffs only Totems; the engine has no tribe-filtered target selector,
   * so the buff hits all other friendly minions — reduced to +1/+1 to compensate
   * for the wider reach.)
   */
  {
    id: 'shaman_thunderbluff_valiant',
    name: 'Thunderbluff Valiant',
    cost: 5,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'rare',
    text: '**Ward. Omen:** Give your other minions +1/+1.',
    attack: 3,
    health: 6,
    tribe: 'totem',
    keywords: ['taunt'],
    battlecry: [{ kind: 'buff', atk: 1, health: 1, target: 'otherFriendlyMinions' }],
  },

  /**
   * Volcano — 5 mana. Deal 5 damage to all minions.
   * Approximates the Shaman board-wipe. (Overload not in engine.)
   */
  {
    id: 'shaman_volcano',
    name: 'Volcano',
    cost: 5,
    type: 'spell',
    cardClass: 'shaman',
    rarity: 'rare',
    text: 'Deal 5 damage to all minions.',
    spell: [{ kind: 'damage', amount: 5, target: 'allMinions' }],
  },

  /**
   * Thrall, Deathseer — 7 mana 5/5. Battlecry: Give all friendly minions +1/+1 and
   * summon a Spirit Wolf. Represents a board-wide buff finisher.
   * (Body + board buff + 2/3 Taunt summon is ~8 mana of value; re-costed from 5 to 7.)
   */
  {
    id: 'shaman_thrall_deathseer',
    name: 'Thrall, Deathseer',
    cost: 7,
    type: 'minion',
    cardClass: 'shaman',
    rarity: 'legendary',
    text: '**Omen:** Give your minions +1/+1. Summon a 2/3 Spirit Wolf with **Ward**.',
    attack: 5,
    health: 5,
    tribe: 'none',
    battlecry: [
      { kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' },
      { kind: 'summon', token: 'shaman_token_spirit_wolf', count: 1 },
    ],
  },
]
