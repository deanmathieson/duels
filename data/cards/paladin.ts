import type { CardDef } from '../../game/types'

/**
 * Lamplighter (paladin) class cards spanning the mana curve (1-9),
 * plus token cards for the Wickling and the watch's weapons.
 * Theme: Tallow Meg, the Lamplighter — go-wide Wickling tokens, buff
 * synergies, healing, and Blessing finishers. The parish watch of
 * Hollowmoor: wax, oaths, lanterns, and a modest protection racket.
 */
export const paladinCards: CardDef[] = [
  // -------------------------------------------------------------------------
  // TOKEN cards (not collectible)
  // -------------------------------------------------------------------------
  {
    id: 'paladin_recruit',
    name: 'Wickling',
    cost: 1,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'free',
    text: '',
    flavor: 'Give a lad a lantern and a halfpenny and he\'ll guard anything. Even the gallows.',
    attack: 1,
    health: 1,
    tribe: 'none',
    token: true,
    art: undefined,
  },
  {
    id: 'paladin_silver_hand_knight',
    name: 'Beadle of the Wax',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Omen:** Summon a 1/1 Wickling.',
    flavor: 'Collects fines for blasphemy, drunkenness and adultery. Pays most of them himself.',
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
    name: 'A Stiff One',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Give a friendly minion +3 Attack.',
    flavor: 'Poured in the cellar of the Goose & Gibbet. Stiffens the arm, the spine, and the resolve — in that order.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'buff', atk: 3, health: 0, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_humility',
    name: 'A Night in the Stocks',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: "Set a minion's Attack to 1.",
    flavor: 'The village supplies turnips, insults, and the occasional marriage proposal.',
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
    name: 'Hair of the Dog',
    cost: 2,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Restore 6 Health to your hero.',
    flavor: 'Father Ambrose prescribes it for wounds, agues, grief, and being awake before noon.',
    spell: [{ kind: 'heal', amount: 6, target: 'friendlyHero' }],
    art: undefined,
  },
  {
    id: 'paladin_argent_protector',
    name: "Chandler's Apprentice",
    cost: 2,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Omen:** Give a friendly minion **Blessing**.',
    flavor: 'She dips more than wicks down at the chandlery, if the verger\'s boasting is to be believed.',
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
    name: 'Candle-Sworn Novice',
    cost: 2,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Blessing**',
    flavor: 'Took her vows at midnight. Took the curate to bed by one.',
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
    name: 'The Parish Gelder',
    cost: 3,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'rare',
    text: "**Omen:** Set an enemy minion's Attack to 1.",
    flavor: 'One snip and the fiercest brute in the bog sings evensong two octaves higher.',
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
    name: 'Pass the Plate',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'rare',
    text: 'Draw 3 cards.',
    flavor: 'What the parish gives, the parish gets back. Minus a modest handling fee.',
    // Approximated as a flat draw 3 — an earlier design drew until hand size
    // matched the opponent's, but the engine has no conditional mechanics.
    // Costed at 4 since an unconditional draw 3 outdraws the 3-mana draw-2 anchor.
    spell: [{ kind: 'draw', count: 3 }],
    art: undefined,
  },
  {
    id: 'paladin_muster_for_battle',
    name: 'Rouse the Watch',
    cost: 3,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Summon three 1/1 Wicklings. Equip a 1/4 Parish Poker.',
    flavor: 'Half were dragged from the tavern and half from the widow Hartley\'s. All three arrived grinning.',
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
    name: 'Scalding Tallow',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Deal 2 damage to all enemies.',
    flavor: 'Hot wax has its enthusiasts in the village. Rather fewer at this volume.',
    spell: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
    art: undefined,
  },
  {
    id: 'paladin_blessing_of_kings',
    name: 'Alehouse Accolade',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Give a friendly minion +4/+4. <i>(+4 Attack/+4 Health)</i>',
    flavor: 'Kneel a plowboy, rise a knight, wake up betrothed to the innkeeper.',
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
    name: 'Wickhouse Matron',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'epic',
    text: '**Omen:** Give your other minions +2/+2.',
    flavor: 'She outfits the entire watch and entertains the better half of it.',
    attack: 2,
    health: 5,
    tribe: 'none',
    // Approximated: the engine has no Wickling-only target filter, so the
    // "give your Wicklings +2/+2" design buffs ALL other friendly minions instead.
    battlecry: [{ kind: 'buff', atk: 2, health: 2, target: 'otherFriendlyMinions' }],
    art: undefined,
  },
  {
    id: 'paladin_shielded_warden',
    name: 'Sister of Sweet Mercies',
    // Costed at 6: a full-budget 5/6 body plus a ~2.5-mana heal was well above
    // the 5-mana band.
    cost: 6,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'free',
    text: '**Omen:** Restore 6 Health to your hero.',
    flavor: 'Her mercies are legendary in the barracks. So, mercifully, is her discretion.',
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
    name: 'Torches and Pitchforks',
    cost: 6,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Deal 8 damage randomly split among all enemies.',
    flavor: 'Hollowmoor settles its grievances by committee. The committee brings fire.',
    // Approximated as 2 damage to a random enemy, four times (randomEnemy covers
    // the enemy hero too) — coarse chunks rather than eight single sparks.
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
    name: 'Midnight Ministrations',
    cost: 8,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Restore 8 Health. Draw 3 cards.',
    flavor: 'Father Ambrose tends his flock door to door. Widows first, and twice on feast days.',
    spell: [
      { kind: 'heal', amount: 8, target: 'friendlyHero' },
      { kind: 'draw', count: 3 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 8-cost
  // -------------------------------------------------------------------------
  {
    id: 'paladin_ragnaros_lightlord',
    name: 'The Wakefire',
    cost: 8,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: 'At the end of your turn, restore 8 Health to a random friendly minion.',
    flavor: 'Every funeral wake needs a good fire. This one attends uninvited, stays till dawn, and drinks the lamp oil.',
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
  // 5-cost legendary
  // -------------------------------------------------------------------------
  {
    id: 'paladin_bolvar_fordragon',
    name: 'Mother Mourncandle',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: 'Whenever a friendly minion dies, gain +1 Attack.',
    flavor: 'A professional mourner, paid by the funeral. My, how business booms.',
    attack: 1,
    health: 7,
    tribe: 'none',
    // Hand-based triggers are not in the engine's TriggerEvent set, so this is
    // modelled as an on-board trigger: whenever a friendly minion dies, buff
    // self +1/+0.
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
    name: 'Wickmaster Crowe',
    cost: 8,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Blessing. Ward. Haunt:** Equip a 5/3 Tallowbrand.',
    flavor: 'Swore to keep the lamps of Hollowmoor burning until his dying day. Kept the oath a full week past it.',
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
    name: 'The Bog Bishop',
    cost: 9,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Omen:** Give your other minions +3/+3 and **Blessing**.',
    flavor: 'Consecrates the gin before the chapel. A man of the cloth must keep his priorities straight.',
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
    name: 'Parish Poker',
    cost: 1,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'free',
    text: '',
    flavor: 'Good for stoking hearths, settling tabs, and other parish business.',
    attack: 1,
    durability: 4,
    token: true,
    art: undefined,
  },
  {
    id: 'paladin_ashbringer',
    name: 'Tallowbrand',
    cost: 5,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '',
    flavor: 'A blade dipped a thousand times in consecrated wax. It burns going in.',
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
    name: 'Wax Seal',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Give a friendly minion **Blessing**.',
    flavor: 'Dipped head to toe and twice about the breeches. Nothing gets in. Nothing gets out, neither.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'giveDivineShield', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_redemption',
    name: 'Hold the Lych-Gate',
    cost: 1,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'common',
    text: 'Give a friendly minion +1/+1 and **Ward**.',
    flavor: 'The dead come in through the lych-gate. So does the milkmaid. Hence the volunteers.',
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
    name: 'Waxwork Sentry',
    cost: 2,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'common',
    text: '**Blessing**',
    flavor: 'Melts a little come high summer. The choir finds this deeply relatable.',
    attack: 2,
    health: 2,
    tribe: 'mech',
    keywords: ['divineShield'],
    art: undefined,
  },
  {
    id: 'paladin_equality',
    name: 'The Leveller',
    cost: 2,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'rare',
    text: 'Set the Health of all minions to 1.',
    flavor: 'Death drinks at every table in Hollowmoor and has never once stood a round.',
    spell: [{ kind: 'setStats', health: 1, target: 'allMinions' }],
    art: undefined,
  },

  // --- 3-cost additions ---
  {
    id: 'paladin_coghammer',
    name: "Bellringer's Mallet",
    cost: 3,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'epic',
    text: '**Omen:** Give a random friendly minion **Blessing**, and a random friendly minion **Ward**.',
    flavor: 'He swings it at the great bell every night at ten. The whole parish hears him coming.',
    attack: 2,
    durability: 3,
    // Approximated: each effect rolls its own random target, so the Blessing and
    // the Ward can land on two different minions rather than one.
    battlecry: [
      { kind: 'giveDivineShield', target: 'randomFriendlyMinion' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'randomFriendlyMinion' },
    ],
    art: undefined,
  },
  {
    id: 'paladin_sound_the_bells',
    name: 'Ring the Curfew',
    cost: 2,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'common',
    text: 'Give a friendly minion +1/+2.',
    flavor: 'When the bell tolls, honest folk hurry home to bed. Nobody in this parish hurries, and rarely to their own.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'buff', atk: 1, health: 2, target: 'chosenTarget' }],
    art: undefined,
  },

  // --- 4-cost additions ---
  {
    id: 'paladin_truesilver_champion',
    name: "Snuffer's Pike",
    cost: 4,
    type: 'weapon',
    cardClass: 'paladin',
    rarity: 'free',
    text: 'Whenever your hero attacks, restore 2 Health to your hero.',
    flavor: 'For lighting lamps, trimming wicks, and putting out the occasional ruffian.',
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
    name: 'Empty the Taverns',
    cost: 4,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Summon five 1/1 Wicklings.',
    flavor: 'The watch recruits wherever brave men gather. Mostly the Goose & Gibbet, around closing.',
    // The engine cannot pull minions from your deck, so this summons five
    // Wicklings instead — kept above the floor set by the 3-mana Rouse the
    // Watch (three Wicklings plus a weapon).
    spell: [{ kind: 'summon', token: 'paladin_recruit', count: 5 }],
    art: undefined,
  },

  // --- 5-cost additions ---
  {
    id: 'paladin_ivory_knight',
    name: 'The Tallow Knight',
    cost: 5,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'rare',
    text: '**Omen:** Discover a spell. Restore 3 Health to your hero.',
    flavor: 'Armor of wax, heart of gold, reputation beyond all hope of salvage.',
    attack: 4,
    health: 4,
    tribe: 'none',
    // Approximated: the engine can't read the discovered pick to scale the heal,
    // so the heal is a flat 3. The discover pool uses the default class lock
    // (Lamplighter + neutral spells), matching the plain text.
    battlecry: [
      { kind: 'discover', pool: 'spell' },
      { kind: 'heal', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  // --- 6-cost additions ---
  // (The big all-minion buff lives in neutral.ts — Lamplighters draft the neutral copy.)
  {
    id: 'paladin_shirvallah_the_tiger',
    name: 'Grimalkin of the Vigil',
    cost: 7,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Rush. Blessing. Leeching.**',
    flavor: 'The parish cat takes her tithe in blood and leaves the rats for the poor box.',
    attack: 5,
    health: 8,
    tribe: 'beast',
    // Statted as an honest 7-drop: a 5/12 with three keywords was ~3 mana over
    // budget, so 5/8 keeps the triple-keyword identity inside the 7-mana band.
    keywords: ['rush', 'divineShield', 'lifesteal'],
    art: undefined,
  },

  // --- 8-cost additions ---
  {
    id: 'paladin_dinosize',
    name: 'Fatted for the Feast',
    cost: 8,
    type: 'spell',
    cardClass: 'paladin',
    rarity: 'epic',
    text: 'Set a friendly minion\'s Attack and Health to 10.',
    flavor: 'Eat, drink, and swell unto glory — the vicar\'s favorite commandment, and the only one he keeps.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [{ kind: 'setStats', atk: 10, health: 10, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'paladin_lothraxion_the_redeemed',
    name: 'Old Scratch, Reformed',
    cost: 6,
    type: 'minion',
    cardClass: 'paladin',
    rarity: 'legendary',
    text: '**Omen:** Summon two 1/1 Wicklings, then give your minions **Blessing**.',
    flavor: 'Sold his soul, bought it back at auction, and tithes most regular now. Still smells faintly of brimstone and gin.',
    attack: 5,
    health: 4,
    tribe: 'demon',
    keywords: ['divineShield'],
    // A "for the rest of the game" generation effect isn't expressible in the
    // engine, so on play it summons 2 Wicklings and shields the whole board.
    // Costed at 6 — a full-budget Blessing body plus a ~2-mana battlecry was
    // over the 5-mana band.
    battlecry: [
      { kind: 'summon', token: 'paladin_recruit', count: 2 },
      { kind: 'giveDivineShield', target: 'friendlyMinions' },
    ],
    art: undefined,
  },
]
