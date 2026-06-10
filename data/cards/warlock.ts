import type { CardDef } from '../../game/types'

/**
 * Bargainer class cards — 28 collectible cards spanning the mana curve (1-10),
 * plus token cards for Pennywisps and other summoned minions.
 * Theme: Fae creditors, debts paid in lifeblood, board flood, predatory
 * contracts signed at the crossroads.
 * Encoded per EFFECTSPEC.md conventions.
 */
export const warlockCards: CardDef[] = [

  // -------------------------------------------------------------------------
  // Tokens (token: true — not collectible)
  // -------------------------------------------------------------------------

  /** 1/1 Fae token summoned by several Bargainer cards. */
  {
    id: 'warlock_imp',
    name: 'Pennywisp',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '',
    flavor: 'The smallest coin the fae mint. It bites.',
    attack: 1,
    health: 1,
    tribe: 'demon',
    token: true,
    art: undefined,
  },

  /** 3/2 Fae token (board-flood variant summon). */
  {
    id: 'warlock_flame_imp_token',
    name: 'Wickfinger',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '',
    flavor: 'Lights your pipe for a penny, your hearth for a kiss, and your breeches free of charge.',
    attack: 3,
    health: 2,
    tribe: 'demon',
    token: true,
    art: undefined,
  },

  /** 1/3 Ward Fae — token twin of the collectible, for signature use. */
  {
    id: 'warlock_voidwalker_token',
    name: 'Bogbound Surety',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '**Ward**',
    flavor: 'Stands surety for your soul. Smells like the underside of a promise.',
    attack: 1,
    health: 3,
    tribe: 'demon',
    keywords: ['taunt'],
    token: true,
    art: undefined,
  },

  /** 5/5 Fae token summoned by several Bargainer effects. */
  {
    id: 'warlock_void_terror_token',
    name: 'Crooked Gentleman',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '',
    flavor: 'All smiles. Far too many of them.',
    attack: 5,
    health: 5,
    tribe: 'demon',
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 1-cost
  // -------------------------------------------------------------------------

  /**
   * Wickfinger — 3/2 Fae.
   * Omen: Deal 3 damage to your hero.
   */
  {
    id: 'warlock_flame_imp',
    name: 'Wickfinger',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Omen:** Deal 3 damage to your hero.',
    flavor: 'Lights your pipe for a penny, your hearth for a kiss, and your breeches free of charge.',
    attack: 3,
    health: 2,
    tribe: 'demon',
    battlecry: [{ kind: 'damage', amount: 3, target: 'friendlyHero' }],
    art: undefined,
  },

  /**
   * Parting Words — 1-mana Bargainer spell.
   * Deal 1 damage to a minion. Draw a card.
   * (The dead never stop talking — a last whisper that pays for itself.)
   */
  {
    id: 'warlock_mortal_coil',
    name: 'Parting Words',
    cost: 1,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Deal 1 damage to a minion. Draw a card.',
    flavor: 'The dead always have one last thing to say. It is usually about your wife.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 1, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 2-cost
  // -------------------------------------------------------------------------

  /**
   * Bogbound Surety — 1/3 Fae with Ward.
   * (Vanilla Ward body — a guarantor that stands between you and the debt.)
   */
  {
    id: 'warlock_voidwalker',
    name: 'Bogbound Surety',
    cost: 2,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '**Ward**',
    flavor: 'Stands surety for your soul. Smells like the underside of a promise.',
    attack: 1,
    health: 3,
    tribe: 'demon',
    keywords: ['taunt'],
    art: undefined,
  },

  /**
   * First Taste Free — 2-mana spell.
   * Deal 4 damage to your hero. Restore 8 Health to it.
   * (Self-damage + heal combo — the introductory offer of every fae creditor.)
   */
  {
    id: 'warlock_dark_pact',
    name: 'First Taste Free',
    cost: 2,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Deal 4 damage to your hero. Restore 8 Health to your hero.',
    flavor: 'Every creditor in Hollowmoor offers it. Not one of them has ever meant it.',
    spell: [
      { kind: 'damage', amount: 4, target: 'friendlyHero' },
      { kind: 'heal', amount: 8, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 3-cost
  // -------------------------------------------------------------------------

  /**
   * Wisp-House Madam — 2/4 Fae. Whenever this minion takes damage, summon a
   * 1/1 Pennywisp (via the onSelfDamaged trigger; fires even on lethal damage,
   * and not when Divine Shield absorbs the hit).
   */
  {
    id: 'warlock_imp_gang_boss',
    name: 'Wisp-House Madam',
    cost: 3,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Whenever this minion takes damage, summon a 1/1 Pennywisp.',
    flavor: 'Strike her and she rings the bell, and down the stairs come more girls than you can afford.',
    attack: 2,
    health: 4,
    tribe: 'demon',
    triggers: [
      {
        event: 'onSelfDamaged',
        effects: [{ kind: 'summon', token: 'warlock_imp', count: 1 }],
      },
    ],
    art: undefined,
  },

  /**
   * The Crooked Finger — 3-mana Bargainer spell.
   * Deal 4 damage to a minion.
   */
  {
    id: 'warlock_shadow_bolt',
    name: 'The Crooked Finger',
    cost: 3,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'free',
    text: 'Deal 4 damage to a minion.',
    flavor: 'Point it at a man and a bell tolls. Point it at a husband and a widow starts baking.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'damage', amount: 4, target: 'chosenTarget' }],
    art: undefined,
  },

  /**
   * Burst Purse — 3-mana Bargainer spell.
   * Deal 2 damage to a minion. Summon two 1/1 Pennywisps.
   * Cost 4 → 3: the fixed version (~0.7 mana of damage + ~1.6 mana of tokens)
   * was ~1.5 mana under rate at 4; the variable-payoff upside that justified
   * 4 is gone.
   */
  {
    id: 'warlock_imp_losion',
    name: 'Burst Purse',
    cost: 3,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'rare',
    text: 'Deal 2 damage to a minion. Summon two 1/1 Pennywisps.',
    flavor: 'Squeeze anything in Hollowmoor hard enough and the fae come tumbling out.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'summon', token: 'warlock_imp', count: 2 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 4-cost
  // -------------------------------------------------------------------------

  /**
   * The Parish Burns — 4-mana Bargainer spell.
   * Deal 3 damage to ALL characters.
   */
  {
    id: 'warlock_hellfire',
    name: 'The Parish Burns',
    cost: 4,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'free',
    text: 'Deal 3 damage to ALL characters.',
    flavor: 'It began as a midsummer dance. It ended the way most midsummer dances do.',
    spell: [{ kind: 'damage', amount: 3, target: 'allCharacters' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 5-cost
  // -------------------------------------------------------------------------

  /**
   * The Bog Bailiff — 5/7 Fae with Charge.
   * The drawback is 4 damage to your own hero (the Bargainer self-damage
   * idiom), which keeps the Charge body honestly paid for.
   */
  {
    id: 'warlock_doomguard',
    name: 'The Bog Bailiff',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Charge**. **Omen:** Deal 4 damage to your hero.',
    flavor: 'Arrives before the ink dries, takes his fee in flesh, and leaves the door in splinters.',
    attack: 5,
    health: 7,
    tribe: 'demon',
    keywords: ['charge'],
    battlecry: [{ kind: 'damage', amount: 4, target: 'friendlyHero' }],
    art: undefined,
  },

  /**
   * Marrow Pawnbroker — 3/5 Fae with Ward.
   * Omen: Deal 3 damage to your hero. Gain an empty Mana Stone.
   * (Pawn your lifeblood today for spending power tomorrow.)
   */
  {
    id: 'warlock_felguard',
    name: 'Marrow Pawnbroker',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Ward**. **Omen:** Deal 3 damage to your hero. Gain an empty Mana Stone.',
    flavor: 'Lends against anything: heirlooms, teeth, your good name, your better leg.',
    attack: 3,
    health: 5,
    tribe: 'demon',
    keywords: ['taunt'],
    battlecry: [
      { kind: 'damage', amount: 3, target: 'friendlyHero' },
      { kind: 'gainManaCrystal', count: 1, empty: true },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 6-cost
  // -------------------------------------------------------------------------

  /**
   * Foreclosure — 6-mana Bargainer spell.
   * Destroy a minion. Restore 3 Health to your hero.
   */
  {
    id: 'warlock_siphon_soul',
    name: 'Foreclosure',
    cost: 6,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'rare',
    text: 'Destroy a minion. Restore 3 Health to your hero.',
    flavor: 'The house always collects. In Hollowmoor, the house is a bog.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'destroy', target: 'chosenTarget' },
      { kind: 'heal', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 7-cost
  // -------------------------------------------------------------------------

  /**
   * The Wedding Crasher — 6/6 Fae.
   * Omen: Deal 3 damage to ALL characters.
   * Approximated: the targeting vocabulary has no all-but-self selector, so
   * 'allCharacters' includes the Crasher itself (it arrives as a 6/3).
   * Cost 6 → 7: at 6 it was a 4-mana AoE plus a 6/6 body for only 2 extra
   * mana — ~1.5-2 mana over rate; 7 matches the anchor.
   */
  {
    id: 'warlock_abyssal_enforcer',
    name: 'The Wedding Crasher',
    cost: 7,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Omen:** Deal 3 damage to ALL characters.',
    flavor: 'Kissed the bride, brained the groom, drank the font dry.',
    attack: 6,
    health: 6,
    tribe: 'demon',
    battlecry: [{ kind: 'damage', amount: 3, target: 'allCharacters' }],
    art: undefined,
  },

  /**
   * Hespera of the Red Quill — 5/5 Fae Legendary.
   * Omen: Deal 3 damage to your hero. Draw 3 cards.
   * (Self-damage draw — the Bargainer's resource engine, notarised in blood.)
   */
  {
    id: 'warlock_blood_queen_lanathel',
    name: 'Hespera of the Red Quill',
    cost: 7,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'legendary',
    text: '**Omen:** Deal 3 damage to your hero. Draw 3 cards.',
    flavor: "She'll witness your contract, consummate the deal, and notarise the regret — all in your own red.",
    attack: 5,
    health: 5,
    tribe: 'demon',
    battlecry: [
      { kind: 'damage', amount: 3, target: 'friendlyHero' },
      { kind: 'draw', count: 3 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 8-cost
  // -------------------------------------------------------------------------

  /**
   * The Mire Takes All — 8-mana Bargainer spell.
   * Destroy all minions. Summon a 5/5 Crooked Gentleman.
   * (Full board wipe with a compensating Fae so the caster isn't left empty.)
   */
  {
    id: 'warlock_twisting_nether',
    name: 'The Mire Takes All',
    cost: 8,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'epic',
    text: 'Destroy all minions. Summon a 5/5 Crooked Gentleman.',
    flavor: 'Whatever the bog swallows, it sends back one gentleman to say thank you.',
    spell: [
      { kind: 'destroy', target: 'allMinions' },
      { kind: 'summon', token: 'warlock_void_terror_token', count: 1 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 10-cost
  // -------------------------------------------------------------------------

  /**
   * Old Scratch of the Crossroads — Legendary Bargainer finisher. 3/15 Fae.
   * Omen: Deal 5 damage to ALL characters. Give your hero +5 Attack this turn.
   * Approximated: no all-but-self selector exists, so 'allCharacters' includes
   * Old Scratch himself (he arrives as a 3/10). Cost 9 → 10: a one-card board
   * reset + 10 potential face damage + a sticky 3/10 was ~2 mana over rate at 9.
   */
  {
    id: 'warlock_lord_jaraxxus',
    name: 'Old Scratch of the Crossroads',
    cost: 10,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'legendary',
    text: '**Omen:** Deal 5 damage to ALL characters. Give your hero +5 Attack this turn.',
    flavor: 'Every bargain in the county bears his thumbprint. Usually somewhere unmentionable.',
    attack: 3,
    health: 15,
    tribe: 'demon',
    battlecry: [
      { kind: 'damage', amount: 5, target: 'allCharacters' },
      { kind: 'heroAttackThisTurn', amount: 5 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 1-cost
  // -------------------------------------------------------------------------

  /**
   * Quill-Licker — 2/1 Fae.
   * Omen: Draw a card. Deal 2 damage to your hero.
   * Classic cheap draw engine at the cost of life.
   * 2/3 → 2/1: a 1-mana 2/3 PLUS a free cantrip was ~2 mana of value over
   * band; 2/1 matches the anchor.
   */
  {
    id: 'warlock_kobold_librarian',
    name: 'Quill-Licker',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Omen:** Draw a card. Deal 2 damage to your hero.',
    flavor: 'Fetches any paper you please. Best not to ask what it does to the quills.',
    attack: 2,
    health: 1,
    tribe: 'demon',
    battlecry: [
      { kind: 'draw', count: 1 },
      { kind: 'damage', amount: 2, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 2-cost
  // -------------------------------------------------------------------------

  /**
   * Leech-Kiss — 2-mana Bargainer spell.
   * Deal 3 damage to a minion. Restore 3 Health to your hero.
   * The quintessential drain effect.
   */
  {
    id: 'warlock_drain_soul',
    name: 'Leech-Kiss',
    cost: 2,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Deal 3 damage to a minion. Restore 3 Health to your hero.',
    flavor: 'The barber prescribes leeches. The fae prescribe themselves, and they do linger.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'heal', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  /**
   * Lewd Hob — 2/4 Fae with Ward.
   * Omen: Deal 2 damage to your hero.
   * Great stats with Ward at the cost of self-damage.
   */
  {
    id: 'warlock_vulgar_homunculus',
    name: 'Lewd Hob',
    cost: 2,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Ward**. **Omen:** Deal 2 damage to your hero.',
    flavor: 'Guards the threshold and flashes the milkmaids. The village keeps him for both reasons.',
    attack: 2,
    health: 4,
    tribe: 'demon',
    keywords: ['taunt'],
    battlecry: [{ kind: 'damage', amount: 2, target: 'friendlyHero' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 3-cost
  // -------------------------------------------------------------------------

  /**
   * Tithe-Glutton — 2/2 Fae.
   * Omen: Gain +2/+2 (the "hungry fae" flavour as a fixed stat boost).
   * 3/3 → 2/2: the unconditional self-buff made it a vanilla 5/5 for 3 mana
   * (~1.5 mana over band); a 4/4-on-play sits just above the vanilla 3/4 line.
   */
  {
    id: 'warlock_void_terror',
    name: 'Tithe-Glutton',
    cost: 3,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Omen:** Gain +2/+2.',
    flavor: 'Started on the communion bread. Worked its way up to the congregation.',
    attack: 2,
    health: 2,
    tribe: 'demon',
    battlecry: [{ kind: 'buff', atk: 2, health: 2, target: 'self' }],
    art: undefined,
  },

  /**
   * Crooked Alderman — 1/5 Fae.
   * After you play a minion, gain +1 Attack.
   * Board-flood payoff: grows as you play more minions.
   * The trigger vocabulary has no tribe condition, so the onPlayMinion
   * trigger fires for ANY minion you play (matching the any-minion text).
   */
  {
    id: 'warlock_darkshire_councilman',
    name: 'Crooked Alderman',
    cost: 3,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'After you play a minion, gain +1 Attack.',
    flavor: 'Every soul that settles in the parish fattens his purse. Every soul that leaves fattens the bog.',
    attack: 1,
    health: 5,
    tribe: 'demon',
    triggers: [
      {
        event: 'onPlayMinion',
        effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }],
      },
    ],
    art: undefined,
  },

  /**
   * Whistle at the Crossroads — 3-mana Bargainer spell.
   * Add two random Bargainer minions to your hand.
   * Tutor effect to fuel the Fae synergy package.
   * Approximated: there is no tribe generation pool, so the minion pool is
   * locked to the class via fromClass (every collectible Bargainer minion in
   * this set is a Fae). Cost 4 → 3: two random cards are worth ~2-3 mana of
   * generation.
   */
  {
    id: 'warlock_sense_demons',
    name: 'Whistle at the Crossroads',
    cost: 3,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Add two random Bargainer minions to your hand.',
    flavor: 'Whistle after dark and something always answers. Rarely what you hoped. Never alone.',
    spell: [
      { kind: 'addRandomCardToHand', pool: 'minion', count: 2, fromClass: 'warlock' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 4-cost
  // -------------------------------------------------------------------------

  /**
   * Bog-Lurcher — 2/4 Fae with Rush.
   * Omen: Gain +2/+2 (a fixed battlecry, on-curve for hand-size synergy).
   */
  {
    id: 'warlock_felhunter',
    name: 'Bog-Lurcher',
    cost: 4,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Rush**. **Omen:** Gain +2/+2.',
    flavor: "A poacher's best friend: eats the evidence, the gamekeeper, and on lean weeks the poacher.",
    attack: 2,
    health: 4,
    tribe: 'demon',
    keywords: ['rush'],
    battlecry: [{ kind: 'buff', atk: 2, health: 2, target: 'self' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 5-cost
  // -------------------------------------------------------------------------

  /**
   * Matchmaker of the Mire — 3/4 Fae.
   * Haunt: Summon a 5/5 Crooked Gentleman.
   * Generates a large Fae threat on death — Fae package payoff.
   */
  {
    id: 'warlock_void_caller',
    name: 'Matchmaker of the Mire',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Haunt:** Summon a 5/5 Crooked Gentleman.',
    flavor: "Give her your hand and she'll introduce you to a gentleman of her acquaintance. The wedding doubles as the wake.",
    attack: 3,
    health: 4,
    tribe: 'demon',
    deathrattle: [{ kind: 'summon', token: 'warlock_void_terror_token', count: 1 }],
    art: undefined,
  },

  /**
   * A Gentleman Calls — 5-mana Bargainer spell.
   * Deal 2 damage to a character. Summon a 5/5 Crooked Gentleman.
   */
  {
    id: 'warlock_bane_of_doom',
    name: 'A Gentleman Calls',
    cost: 5,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'epic',
    text: 'Deal 2 damage to a character. Summon a 5/5 Crooked Gentleman.',
    flavor: 'He knocks twice, very politely, then asks after the contents of your ribcage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'summon', token: 'warlock_void_terror_token', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Repossession — 5-mana Bargainer spell.
   * Destroy an enemy minion.
   * Priced at the unconditional targeted-destroy anchor (5 mana); the engine
   * has no delayed-destroy, so it resolves immediately.
   */
  {
    id: 'warlock_corruption',
    name: 'Repossession',
    cost: 5,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Destroy an enemy minion.',
    flavor: 'Read clause nine again, slowly. You signed away rather more than the cow.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },

  /**
   * Sign in Red — 5-mana Bargainer spell.
   * Draw 3 cards. Deal 3 damage to your hero.
   * Iconic heavy draw at life cost.
   * Cost 6 → 5: draw 3 is ~4.5 mana at the standard rate, and the Bargainer
   * pays health ON TOP here — at 6 the card was ~2 mana over fair cost.
   */
  {
    id: 'warlock_hand_of_guldan',
    name: 'Sign in Red',
    cost: 5,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'rare',
    text: 'Draw 3 cards. Deal 3 damage to your hero.',
    flavor: 'Three pages, three drops. The pen is provided. The vein is yours.',
    spell: [
      { kind: 'draw', count: 3 },
      { kind: 'damage', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 7-cost
  // -------------------------------------------------------------------------

  /**
   * The Velvet Creditor — 5/7 Fae with Leeching.
   * Omen: Summon a 1/1 Pennywisp.
   * High-impact Leeching body that also floods the board.
   */
  {
    id: 'warlock_enhanced_dreadlord',
    name: 'The Velvet Creditor',
    cost: 7,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Leeching**. **Omen:** Summon a 1/1 Pennywisp.',
    flavor: 'Such generous terms, such soft hands. The interest is collected nightly, by mouth.',
    attack: 5,
    health: 7,
    tribe: 'demon',
    keywords: ['lifesteal'],
    battlecry: [{ kind: 'summon', token: 'warlock_imp', count: 1 }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 8-cost (Legendary Finisher)
  // -------------------------------------------------------------------------

  /**
   * Mister Teeth, the Magnanimous — 9/7 Fae Legendary.
   * Aura: Your other minions have +2/+2.
   * The aura vocabulary has no tribe CardFilter, so the buff applies to ALL
   * your other minions (the engine excludes the aura's own source).
   */
  {
    id: 'warlock_malganis',
    name: 'Mister Teeth, the Magnanimous',
    cost: 8,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'legendary',
    text: 'Your other minions have +2/+2.',
    flavor: 'So generous with his gifts. So very precise about the repayment schedule.',
    attack: 9,
    health: 7,
    tribe: 'demon',
    auras: [{ kind: 'minionStat', atk: 2, health: 2, filter: 'all' }],
    art: undefined,
  },
]
