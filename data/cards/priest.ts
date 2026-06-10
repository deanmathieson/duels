import type { CardDef } from '../../game/types'

/**
 * Priest class cards — 18 collectible cards spanning the mana curve (1-9),
 * plus token cards summoned by class effects.
 * Theme: heal/control, Shadow damage, Power Word buffs, sticky high-health minions.
 */
export const priestCards: CardDef[] = [

  // ── TOKENS ──────────────────────────────────────────────────────────────────

  /** 2/2 Spirit token summoned by Shadowy Figure. */
  {
    id: 'priest_spirit_token',
    name: 'Shadowy Apparition',
    cost: 1,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'free',
    text: '',
    attack: 2,
    health: 2,
    tribe: 'none',
    token: true,
    art: undefined,
  },

  /** 0/3 Lightwell token (heals on end of turn). */
  {
    id: 'priest_lightwell_token',
    name: 'Lightwell',
    cost: 0,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'free',
    text: 'At the end of your turn, restore 3 Health to your hero.',
    attack: 0,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'heal', amount: 3, target: 'friendlyHero' }],
      },
    ],
    token: true,
    art: undefined,
  },

  // ── 1-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_lesser_heal',
    name: 'Lesser Heal',
    cost: 1,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Restore 3 Health.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'heal', amount: 3, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'priest_power_word_shield',
    name: 'Power Word: Shield',
    cost: 1,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Give a minion +2 Health. Draw a card.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'buff', atk: 0, health: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  // ── 2-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_divine_hymn',
    name: 'Divine Hymn',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Restore 6 Health to all friendly characters.',
    spell: [
      { kind: 'heal', amount: 6, target: 'allFriendlyCharacters' },
    ],
    art: undefined,
  },
  /**
   * Approximates Northshire Cleric ("whenever a minion is healed, draw"):
   * the engine has no on-heal trigger, so it draws on Hero Power use instead
   * (pairs with the heal-centric Priest hero powers).
   */
  {
    id: 'priest_northshire_cleric',
    name: 'Northshire Cleric',
    cost: 2,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Whenever you use your Hero Power, draw a card.',
    attack: 1,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'onHeroPowerUsed',
        effects: [{ kind: 'draw', count: 1 }],
      },
    ],
    art: undefined,
  },
  /**
   * Shadow Word: Pain — destroy a minion with 3 or less Attack. The cap is
   * checked against the minion's CURRENT attack (targetMaxAttack), so a 3/2
   * buffed above 3 Attack by any spell, treasure or aura is no longer a legal
   * target — and a big minion shrunk below the cap becomes one.
   */
  {
    id: 'priest_shadow_word_pain',
    name: 'Shadow Word: Pain',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Destroy a minion with 3 or less Attack.',
    targeted: true,
    targetFilter: 'allMinions',
    targetMaxAttack: 3,
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },

  // ── 3-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_shadowy_figure',
    name: 'Shadowy Figure',
    cost: 3,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Battlecry:** Summon a 2/2 Shadowy Apparition.',
    attack: 2,
    health: 3,
    tribe: 'none',
    battlecry: [{ kind: 'summon', token: 'priest_spirit_token', count: 1 }],
    art: undefined,
  },
  {
    id: 'priest_mind_blast',
    name: 'Mind Blast',
    cost: 3,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Deal 5 damage to the enemy hero.',
    spell: [{ kind: 'damage', amount: 5, target: 'enemyHero' }],
    art: undefined,
  },

  // ── 4-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_holy_nova',
    name: 'Holy Nova',
    cost: 4,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Deal 2 damage to all enemies. Restore 2 Health to all friendly characters.',
    spell: [
      { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
      { kind: 'heal', amount: 2, target: 'allFriendlyCharacters' },
    ],
    art: undefined,
  },
  {
    id: 'priest_lightwell',
    name: 'Spawn Lightwell',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Summon a 0/3 Lightwell that heals your hero 3 at end of turn.',
    spell: [{ kind: 'summon', token: 'priest_lightwell_token', count: 1 }],
    art: undefined,
  },
  {
    id: 'priest_high_inquisitor',
    name: 'High Inquisitor Whitemane',
    cost: 4,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Lifesteal.** **Battlecry:** Restore 4 Health to your hero.',
    attack: 3,
    health: 4,
    tribe: 'none',
    keywords: ['lifesteal'],
    battlecry: [{ kind: 'heal', amount: 4, target: 'friendlyHero' }],
    art: undefined,
  },

  // ── 5-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_shadow_word_death',
    name: 'Shadow Word: Death',
    cost: 5,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Destroy a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'priest_mass_dispel',
    name: 'Mass Dispel',
    cost: 5,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'rare',
    text: 'Silence all enemy minions. Draw a card.',
    spell: [
      { kind: 'silence', target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },
  {
    id: 'priest_curious_glimmerroot',
    name: 'Curious Glimmerroot',
    cost: 5,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Battlecry:** Gain 3 Armor and draw a card.',
    attack: 3,
    health: 3,
    tribe: 'none',
    battlecry: [
      { kind: 'gainArmor', amount: 3 },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  // ── 6-COST ────────────────────────────────────────────────────────────────

  /**
   * Approximates Cabal Shadow Priest ("take control of an enemy minion with
   * 2 or less Attack"): the engine has no mind-control, so it disables an
   * enemy minion with a targeted Silence instead.
   */
  {
    id: 'priest_cabal_shadow_priest',
    name: 'Cabal Shadow Priest',
    cost: 6,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'epic',
    text: '**Battlecry:** **Silence** an enemy minion.',
    attack: 4,
    health: 5,
    tribe: 'none',
    targeted: true,
    targetFilter: 'enemyMinions',
    battlecry: [
      { kind: 'silence', target: 'chosenTarget' },
    ],
    art: undefined,
  },
  {
    id: 'priest_holy_champion',
    name: 'Holy Champion',
    cost: 6,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Divine Shield.** **Battlecry:** Restore 4 Health to your hero.',
    attack: 4,
    health: 4,
    tribe: 'none',
    keywords: ['divineShield'],
    battlecry: [{ kind: 'heal', amount: 4, target: 'friendlyHero' }],
    art: undefined,
  },

  // ── 7-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_lightbomb',
    name: 'Lightbomb',
    cost: 7,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'epic',
    text: 'Deal 4 damage to all enemy minions.',
    spell: [{ kind: 'damage', amount: 4, target: 'enemyMinions' }],
    art: undefined,
  },
  {
    id: 'priest_draenei_totem',
    name: 'Lightspawn',
    cost: 7,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Taunt.** **Lifesteal.** **Battlecry:** Restore 5 Health to your hero.',
    attack: 3,
    health: 7,
    tribe: 'none',
    keywords: ['taunt', 'lifesteal'],
    battlecry: [{ kind: 'heal', amount: 5, target: 'friendlyHero' }],
    art: undefined,
  },

  // ── 8-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_zerek',
    name: 'Zerek, Master Cloner',
    cost: 8,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Taunt.** **Battlecry:** Give your other friendly minions **Divine Shield**.',
    attack: 5,
    health: 5,
    tribe: 'none',
    keywords: ['taunt'],
    battlecry: [
      { kind: 'giveDivineShield', target: 'otherFriendlyMinions' },
    ],
    art: undefined,
  },

  // ── 9-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_shadowreaper_anduin',
    name: 'Shadowreaper Anduin',
    cost: 9,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Battlecry:** Deal 2 damage to all enemies. Restore 2 Health to all friendly characters.',
    attack: 5,
    health: 8,
    tribe: 'none',
    battlecry: [
      { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
      { kind: 'heal', amount: 2, target: 'allFriendlyCharacters' },
    ],
    art: undefined,
  },

  // ── NEW CARDS (appended) ─────────────────────────────────────────────────

  // ── 1-COST (new) ──────────────────────────────────────────────────────────

  /** Power Word: Fortitude — give a minion +0/+4 and Taunt. (Was "+3 Health,
   *  draw a card" — a near-copy of Power Word: Shield one slot up the curve.
   *  Dropping the cantrip for a bigger buff plus Taunt gives it a distinct
   *  defensive wall-builder role, and feeds Taunt-synergy passives.) */
  {
    id: 'priest_power_word_fortitude',
    name: 'Power Word: Fortitude',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Give a minion +4 Health and **Taunt**.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'buff', atk: 0, health: 4, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /** Cheap 1/2 that draws a card when played — reliable early cycle
   *  (Novice Engineer rate). */
  {
    id: 'priest_storecroom_helper',
    name: 'Storecroom Helper',
    cost: 2,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Battlecry:** Draw a card.',
    attack: 1,
    health: 2,
    tribe: 'none',
    battlecry: [{ kind: 'draw', count: 1 }],
    art: undefined,
  },

  // ── 2-COST (new) ──────────────────────────────────────────────────────────

  /** Discover a spell from your class pool — Shadow Visions-style value. */
  {
    id: 'priest_shadow_visions',
    name: 'Shadow Visions',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'epic',
    text: 'Discover a spell.',
    spell: [{ kind: 'discover', pool: 'spell' }],
    art: undefined,
  },

  /** 3/1 Rush minion — cheap early aggression and trade tool. */
  {
    id: 'priest_fanatical_acolyte',
    name: 'Fanatical Acolyte',
    cost: 2,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Rush**',
    attack: 3,
    health: 1,
    tribe: 'none',
    keywords: ['rush'],
    art: undefined,
  },

  // ── 3-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Approximates Velen's Chosen (+2/+4 and Spell Damage +1): the engine
   * cannot grant Spell Damage to a minion at runtime (the amount lives on
   * CardDef.spellDamage), so it is modelled as the pure stat buff.
   */
  {
    id: 'priest_velens_chosen',
    name: "Velen's Chosen",
    cost: 3,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Give a friendly minion +2/+4.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 2, health: 4, target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /**
   * 2/6 minion — sticky high-health body that is hard to remove.
   * Classic Priest defensive minion archetype.
   */
  {
    id: 'priest_injured_blademaster',
    name: 'Injured Blademaster',
    cost: 3,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Battlecry:** Give your other minions +0/+2.',
    attack: 2,
    health: 6,
    tribe: 'none',
    battlecry: [{ kind: 'buff', atk: 0, health: 2, target: 'otherFriendlyMinions' }],
    art: undefined,
  },

  // ── 4-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Thoughtsteal-style value generation. The original steals from the
   * opponent's class; the opponent's class can't be expressed, so the pool
   * is unrestricted (fromClass 'any') and the text says "from any class".
   */
  {
    id: 'priest_thoughtsteal',
    name: 'Thoughtsteal',
    cost: 3,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Add 2 random minions from any class to your hand.',
    spell: [{ kind: 'addRandomCardToHand', pool: 'minion', count: 2, fromClass: 'any' }],
    art: undefined,
  },

  /**
   * 3/5 Taunt with Lifesteal — a reliable defensive mid-game threat.
   */
  {
    id: 'priest_devout_chaplain',
    name: 'Devout Chaplain',
    cost: 4,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Taunt.** **Lifesteal.**',
    attack: 3,
    health: 5,
    tribe: 'none',
    keywords: ['taunt', 'lifesteal'],
    art: undefined,
  },

  // ── 5-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Heal all characters to full — Circle of Healing.
   * Massive board stabiliser and combo with damaged high-health minions.
   */
  {
    id: 'priest_circle_of_healing',
    name: 'Circle of Healing',
    cost: 5,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Restore all friendly characters to full Health.',
    spell: [{ kind: 'heal', amount: 30, target: 'allFriendlyCharacters' }],
    art: undefined,
  },

  /**
   * 4/5 that buffs a friendly minion on play — mid-game body plus a
   * Power Word-style +2/+2.
   */
  {
    id: 'priest_temple_enforcer',
    name: 'Temple Enforcer',
    cost: 5,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Battlecry:** Give a friendly minion +2/+2.',
    attack: 4,
    health: 5,
    tribe: 'none',
    targeted: true,
    targetFilter: 'friendlyMinions',
    battlecry: [{ kind: 'buff', atk: 2, health: 2, target: 'chosenTarget' }],
    art: undefined,
  },

  // ── 6-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Destroy a minion and draw a card — Entomb-inspired premium removal.
   */
  {
    id: 'priest_entomb',
    name: 'Entomb',
    cost: 6,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'epic',
    text: 'Destroy a minion. Draw a card.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'destroy', target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  // ── 7-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Prophet Velen — legendary that doubles the effect of your spells.
   * Approximation: the engine has no "double heal/damage" variant (and
   * Spell Damage does not boost healing), so it is modelled as a big
   * Spell Damage minion. Encoded via the spellDamage field only — an
   * additional spellDamage aura would be double-counted by the engine.
   */
  {
    id: 'priest_prophet_velen',
    name: 'Prophet Velen',
    cost: 7,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Spell Damage +2**',
    attack: 6,
    health: 7,
    tribe: 'none',
    spellDamage: 2,
    art: undefined,
  },

  // ── 8-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Catrina Muerte — on end of turn, summon a random friendly minion from
   * the graveyard. Approximated as: end-of-turn trigger that adds a random
   * minion card to hand (closest supported effect).
   */
  {
    id: 'priest_catrina_muerte',
    name: 'Catrina Muerte',
    cost: 8,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: 'At the end of your turn, add a random minion to your hand.',
    attack: 6,
    health: 8,
    tribe: 'none',
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'addRandomCardToHand', pool: 'minion', count: 1 }],
      },
    ],
    art: undefined,
  },
]
