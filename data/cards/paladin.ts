import type { CardDef } from '../../game/types'

/**
 * Paladin class cards — 31 collectible cards spanning the mana curve (1-9),
 * plus token cards for Recruit and Silver Hand Knight.
 * Theme: Lothraxion the Redeemed — go-wide Recruit tokens, buff synergies,
 * healing, and Divine Shield finishers.
 */
export const paladinCards: CardDef[] = [
  // -------------------------------------------------------------------------
  // TOKEN cards (not collectible)
  // -------------------------------------------------------------------------
  {
    id: 'paladin_recruit',
    name: 'Recruit',
    cost: 1,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    tribe: 'none',
    token: true,
    art: undefined,
  },
  {
    id: 'paladin_silver_hand_knight',
    name: 'Silver Hand Knight',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Omen:** Summon a 1/1 Recruit.',
    attack: 4,
    health: 4,
    tribe: 'none',
    battlecry: [{ kind: 'summon', token: 'paladin_recruit', count: 1 }],
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 1-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_blessing_of_might',
    name: 'Blessing of Might',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Give a friendly minion +3 Attack.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'buff', atk: 3, health: 0, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_humility',
    name: 'Humility',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: "Set a minion's Attack to 1.",
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'setStats', atk: 1, target: 'chosenTarget' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 2-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_holy_light',
    name: 'Holy Light',
    cost: 2,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Restore 6 Health to your hero.',
    spell: [{ kind: 'heal', amount: 6, target: 'friendlyHero' }],
    art: undefined,
  },
  {
    id: 'paladin_argent_protector',
    name: 'Argent Protector',
    cost: 2,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Omen:** Give a friendly minion **Blessing**.',
    attack: 2,
    health: 2,
    tribe: 'none',
    targeted: true,
    targetFilter: 'friendlyMinions',
    battlecry: [{ kind: 'giveDivineShield', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_faerie_dragon',
    name: 'Shielded Initiate',
    cost: 2,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Blessing**',
    attack: 1,
    health: 2,
    tribe: 'none',
    keywords: ['divineShield'],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 3-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_aldor_peacekeeper',
    name: 'Aldor Peacekeeper',
    cost: 3,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'rare',
    text: "**Omen:** Set an enemy minion's Attack to 1.",
    attack: 3,
    health: 3,
    tribe: 'none',
    targeted: true,
    targetFilter: 'enemyMinions',
    battlecry: [{ kind: 'setStats', atk: 1, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_divine_favor',
    name: 'Divine Favor',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'rare',
    text: 'Draw 3 cards.',
    // Approximated as flat draw 3 — the original draws until hand size matches the
    // opponent's (no conditional mechanics in the engine). Costed at 4 since an
    // unconditional draw 3 outdraws the 3-mana draw-2 anchor.
    spell: [{ kind: 'draw', count: 3 }],
    art: undefined,
  },
  {
    id: 'paladin_muster_for_battle',
    name: 'Muster for Battle',
    cost: 3,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Summon three 1/1 Recruits. Equip a 1/4 Light\'s Justice.',
    spell: [
      { kind: 'summon', token: 'paladin_recruit', count: 3 },
      { kind: 'equipWeapon', cardId: 'paladin_lights_justice' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 4-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_consecration',
    name: 'Consecration',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Deal 2 damage to all enemies.',
    spell: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
    art: undefined,
  },
  {
    id: 'paladin_blessing_of_kings',
    name: 'Blessing of Kings',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Give a friendly minion +4/+4. <i>(+4 Attack/+4 Health)</i>',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'buff', atk: 4, health: 4, target: 'chosenTarget' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 5-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_tirion_fordring_token_summon',
    name: 'Quartermaster',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'epic',
    text: '**Omen:** Give your other minions +2/+2.',
    attack: 2,
    health: 5,
    tribe: 'none',
    // Approximated: the engine has no Recruit-only target filter, so the original
    // "give Recruits +2/+2" buffs ALL other friendly minions instead.
    battlecry: [{ kind: 'buff', atk: 2, health: 2, target: 'otherFriendlyMinions' }],
    art: undefined,
  },
  {
    id: 'paladin_shielded_warden',
    name: 'Guardian of Kings',
    // Costed at 6: a full-budget 5/6 body plus a ~2.5-mana heal was well above the
    // 5-mana band (the real card is 7 mana for the same package).
    cost: 6,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'free',
    text: '**Omen:** Restore 6 Health to your hero.',
    attack: 5,
    health: 6,
    tribe: 'none',
    battlecry: [{ kind: 'heal', amount: 6, target: 'friendlyHero' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 6-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_avenging_wrath',
    name: 'Avenging Wrath',
    cost: 6,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Deal 8 damage randomly split among all enemies.',
    // Approximated as 2 damage to a random enemy, four times (randomEnemy covers
    // the enemy hero too) — coarser chunks than the original's 8 single missiles.
    spell: [
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
    ],
    art: undefined,
  },
  {
    id: 'paladin_lay_on_hands',
    name: 'Lay on Hands',
    cost: 8,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Restore 8 Health. Draw 3 cards.',
    spell: [
      { kind: 'heal', amount: 8, target: 'friendlyHero' },
      { kind: 'draw', count: 3 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 6-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_ragnaros_lightlord',
    name: 'Ragnaros, Lightlord',
    cost: 8,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: 'At the end of your turn, restore 8 Health to a random friendly minion.',
    attack: 8,
    health: 8,
    tribe: 'elemental',
    // Approximated: the engine has no "damaged character" filter, so the heal hits
    // a random friendly minion (possibly undamaged, never the hero).
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'heal', amount: 8, target: 'randomFriendlyMinion' }],
      },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 7-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_bolvar_fordragon',
    name: 'Bolvar Fordragon',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: 'Whenever a friendly minion dies, gain +1 Attack.',
    attack: 1,
    health: 7,
    tribe: 'none',
    // Approximated: the original buffs while in your HAND, but hand-triggers are not
    // in the engine's TriggerEvent set. Modelled as an on-board trigger instead:
    // whenever a friendly minion dies, buff self +1/+0.
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }],
      },
    ],
    art: undefined,
  },
  {
    id: 'paladin_tirion_fordring',
    name: 'Tirion Fordring',
    cost: 8,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Blessing. Ward. Haunt:** Equip a 5/3 Ashbringer.',
    attack: 6,
    health: 6,
    tribe: 'none',
    keywords: ['divineShield', 'taunt'],
    deathrattle: [{ kind: 'equipWeapon', cardId: 'paladin_ashbringer' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 9-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_uther_of_the_ebon_blade',
    name: 'Uther of the Ebon Blade',
    cost: 9,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Omen:** Give your other minions +3/+3 and **Blessing**.',
    attack: 5,
    health: 9,
    tribe: 'none',
    battlecry: [
      { kind: 'buff', atk: 3, health: 3, target: 'otherFriendlyMinions' },
      { kind: 'giveDivineShield', target: 'otherFriendlyMinions' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // WEAPON tokens referenced by cards above
  // -------------------------------------------------------------------------
  {
    id: 'paladin_lights_justice',
    name: "Light's Justice",
    cost: 1,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'free',
    text: '',
    attack: 1,
    durability: 4,
    token: true,
    art: undefined,
  },
  {
    id: 'paladin_ashbringer',
    name: 'Ashbringer',
    cost: 5,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '',
    attack: 5,
    durability: 3,
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — filling curve gaps & archetype payoffs
  // -------------------------------------------------------------------------

  // --- 1-cost additions ---
  {
    id: 'paladin_hand_of_protection',
    name: 'Hand of Protection',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Give a friendly minion **Blessing**.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'giveDivineShield', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_redemption',
    name: 'Righteous Cause',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'common',
    text: 'Give a friendly minion +1/+1 and **Ward**.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 1, health: 1, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
    art: undefined,
  },

  // --- 2-cost additions ---
  {
    id: 'paladin_shielded_minibot',
    name: 'Shielded Minibot',
    cost: 2,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Blessing**',
    attack: 2,
    health: 2,
    tribe: 'mech',
    keywords: ['divineShield'],
    art: undefined,
  },
  {
    id: 'paladin_equality',
    name: 'Equality',
    cost: 2,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'rare',
    text: 'Set the Health of all minions to 1.',
    spell: [{ kind: 'setStats', health: 1, target: 'allMinions' }],
    art: undefined,
  },

  // --- 3-cost additions ---
  {
    id: 'paladin_coghammer',
    name: 'Coghammer',
    cost: 3,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'epic',
    text: '**Omen:** Give a random friendly minion **Blessing**, and a random friendly minion **Ward**.',
    attack: 2,
    durability: 3,
    // Approximated: each effect rolls its own random target, so the Shield and the
    // Taunt can land on two different minions (the original buffs one minion).
    battlecry: [
      { kind: 'giveDivineShield', target: 'randomFriendlyMinion' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'randomFriendlyMinion' },
    ],
    art: undefined,
  },
  {
    id: 'paladin_sound_the_bells',
    name: 'Sound the Bells!',
    cost: 2,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'common',
    text: 'Give a friendly minion +1/+2.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'buff', atk: 1, health: 2, target: 'chosenTarget' }],
    art: undefined,
  },

  // --- 4-cost additions ---
  {
    id: 'paladin_truesilver_champion',
    name: 'Truesilver Champion',
    cost: 4,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Whenever your hero attacks, restore 2 Health to your hero.',
    attack: 4,
    durability: 2,
    triggers: [
      {
        event: 'afterAttack',
        effects: [{ kind: 'heal', amount: 2, target: 'friendlyHero' }],
      },
    ],
    art: undefined,
  },
  {
    id: 'paladin_call_to_arms',
    name: 'Call to Arms',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Summon five 1/1 Recruits.',
    // Approximated: the original recruits minions from your deck, which the engine
    // cannot do. Summons five Recruits so it is not strictly worse than the 3-mana
    // Muster for Battle (three Recruits + a weapon).
    spell: [{ kind: 'summon', token: 'paladin_recruit', count: 5 }],
    art: undefined,
  },

  // --- 5-cost additions ---
  {
    id: 'paladin_ivory_knight',
    name: 'Ivory Knight',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'rare',
    text: '**Omen:** Discover a spell. Restore 3 Health to your hero.',
    attack: 4,
    health: 4,
    tribe: 'none',
    // Approximated: the original heals equal to the discovered spell's Cost; the
    // engine can't read the pick, so the heal is a flat 3. The discover pool uses
    // the default class lock (Paladin + neutral spells), matching the plain text.
    battlecry: [
      { kind: 'discover', pool: 'spell' },
      { kind: 'heal', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  // --- 6-cost additions ---
  {
    id: 'paladin_stormwind_champion',
    name: 'Stormwind Champion',
    cost: 7,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: 'Your other minions have +1/+1.',
    attack: 6,
    health: 6,
    tribe: 'none',
    auras: [{ kind: 'minionStat', atk: 1, health: 1 }],
    art: undefined,
  },
  {
    id: 'paladin_shirvallah_the_tiger',
    name: 'Shirvallah, the Tiger',
    cost: 7,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Rush. Blessing. Leeching.**',
    attack: 5,
    health: 8,
    tribe: 'beast',
    // Approximated: the original is a 25-mana card whose Cost drops as you cast
    // spells — no such mechanic here, so it's statted as an honest 7-drop. A 5/12
    // with three keywords was ~3 mana over budget; 5/8 keeps the triple-keyword
    // identity inside the 7-mana band.
    keywords: ['rush', 'divineShield', 'lifesteal'],
    art: undefined,
  },

  // --- 8-cost additions ---
  {
    id: 'paladin_dinosize',
    name: 'Dinosize',
    cost: 8,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Set a friendly minion\'s Attack and Health to 10.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'setStats', atk: 10, health: 10, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_lothraxion_the_redeemed',
    name: 'Lothraxion the Redeemed',
    cost: 6,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Omen:** Summon two 1/1 Recruits, then give your minions **Blessing**.',
    attack: 5,
    health: 4,
    tribe: 'demon',
    keywords: ['divineShield'],
    // Approximated: the original's "for the rest of the game, hand-generation"
    // effect isn't expressible, so on play it summons 2 Recruits and shields the
    // whole board. Costed at 6 — a full-budget Divine Shield body plus a ~2-mana
    // battlecry was over the 5-mana band.
    battlecry: [
      { kind: 'summon', token: 'paladin_recruit', count: 2 },
      { kind: 'giveDivineShield', target: 'friendlyMinions' },
    ],
    art: undefined,
  },
]
