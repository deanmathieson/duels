import type { CardDef } from '../../game/types'

/**
 * Vicar class cards — 18+ collectible cards spanning the mana curve (1-9),
 * plus token cards summoned by class effects.
 * Theme: mending the flock with one hand and unraveling minds with the other —
 * communion wine, confession-box leverage, shadow bargains, sticky high-health minions.
 */
export const priestCards: CardDef[] = [

  // ── TOKENS ──────────────────────────────────────────────────────────────────

  /** 2/2 token summoned by Resurrection Man. */
  {
    id: 'priest_spirit_token',
    name: 'Unshriven Soul',
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

  /** 0/3 Communion Cask token (heals on end of turn). */
  {
    id: 'priest_lightwell_token',
    name: 'Communion Cask',
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
    name: 'Hair of the Dog',
    cost: 1,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Restore 3 Health.',
    flavor: "The Vicar prescribes it for fever, heartbreak, and whatever happened at the harvest dance.",
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'heal', amount: 3, target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'priest_power_word_shield',
    name: 'Fortifying Swig',
    cost: 1,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Give a minion +2 Health. Draw a card.',
    flavor: "Communion wine: take twice daily, or as circumstance demands. Circumstance is generous in Hollowmoor.",
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
    name: 'Drunken Evensong',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Restore 6 Health to all friendly characters.',
    flavor: "By the fourth verse the choir was weeping, embracing, and confessing to one another. Attendance has never been better.",
    spell: [
      { kind: 'heal', amount: 6, target: 'allFriendlyCharacters' },
    ],
    art: undefined,
  },
  /**
   * Heal-synergy card-draw engine: the engine has no on-heal trigger, so she
   * draws on Hero Power use instead (pairs with the heal-centric Vicar hero
   * powers).
   */
  {
    id: 'priest_northshire_cleric',
    name: 'Parish Gossip',
    cost: 2,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Whenever you use your Hero Power, draw a card.',
    flavor: "She hears confessions through the wall, the keyhole, and the floorboards. Strictly for the parish record, of course.",
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
   * Conditional removal — destroy a minion with 3 or less Attack. The cap is
   * checked against the minion's CURRENT attack (targetMaxAttack), so a 3/2
   * buffed above 3 Attack by any spell, treasure or aura is no longer a legal
   * target — and a big minion shrunk below the cap becomes one.
   */
  {
    id: 'priest_shadow_word_pain',
    name: 'A Pox Upon Thee',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Destroy a minion with 3 or less Attack.',
    flavor: "Entry the third in the Vicar's book of petty grievances, between 'the Miller's tone' and 'whoever keeps watering the wine.'",
    targeted: true,
    targetFilter: 'allMinions',
    targetMaxAttack: 3,
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },

  // ── 3-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_shadowy_figure',
    name: 'Resurrection Man',
    cost: 3,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Omen:** Summon a 2/2 Unshriven Soul.',
    flavor: "Digs them up cheaper than the sexton plants them. The Vicar takes a finder's fee in both directions.",
    attack: 2,
    health: 3,
    tribe: 'none',
    battlecry: [{ kind: 'summon', token: 'priest_spirit_token', count: 1 }],
    art: undefined,
  },
  {
    id: 'priest_mind_blast',
    name: 'Sins Read Aloud',
    cost: 3,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Deal 5 damage to the enemy hero.',
    flavor: "Third Sunday of the month, the Vicar reads the list from the pulpit. Bring a cushion — thine runs long.",
    spell: [{ kind: 'damage', amount: 5, target: 'enemyHero' }],
    art: undefined,
  },

  // ── 4-COST ────────────────────────────────────────────────────────────────

  {
    id: 'priest_holy_nova',
    name: 'Bell, Book & Candle',
    cost: 4,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Deal 2 damage to all enemies. Restore 2 Health to all friendly characters.',
    flavor: "Ring it, slam it, snuff it. Works on devils, debtors, and visiting in-laws.",
    spell: [
      { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
      { kind: 'heal', amount: 2, target: 'allFriendlyCharacters' },
    ],
    art: undefined,
  },
  {
    id: 'priest_lightwell',
    name: 'Tap the Cask',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Summon a 0/3 Communion Cask that heals your hero 3 at end of turn.',
    flavor: "The Vicar blesses every barrel personally. Quality control, he calls it. Twice nightly.",
    spell: [{ kind: 'summon', token: 'priest_lightwell_token', count: 1 }],
    art: undefined,
  },
  {
    id: 'priest_high_inquisitor',
    name: 'Abbess Winifred the Unquenched',
    cost: 4,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Leeching.** **Omen:** Restore 4 Health to your hero.',
    flavor: "Vows of poverty, chastity and obedience: one is negotiable after vespers, all three after the second bottle.",
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
    name: 'Struck from the Register',
    cost: 5,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'free',
    text: 'Destroy a minion.',
    flavor: "No baptism, no banns, no burial. As far as the parish is concerned, thou never happened.",
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },
  {
    id: 'priest_mass_dispel',
    name: 'Excommunicate the Lot',
    cost: 5,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'rare',
    text: 'Silence all enemy minions. Draw a card.',
    flavor: "The Vicar damns the entire front row on principle, then consults the ledger to see who can afford absolution.",
    spell: [
      { kind: 'silence', target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },
  {
    id: 'priest_curious_glimmerroot',
    name: 'Verger with the Ledger',
    cost: 5,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Omen:** Gain 3 Armor and draw a card.',
    flavor: "Page one: the Squire's bastards. Page two: the Magistrate's debts. Page three: thee. Shall we renegotiate?",
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
   * Mind-control flavour without mind-control mechanics: the engine has no
   * take-control effect, so he disables an enemy minion with a targeted
   * Silence instead.
   */
  {
    id: 'priest_cabal_shadow_priest',
    name: 'Friar Hushwell',
    cost: 6,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'epic',
    text: '**Omen:** **Silence** an enemy minion.',
    flavor: "Takes thy confession, thy tongue, and — if thou aren't quick about it — thy sweetheart to the harvest dance.",
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
    name: 'Penitent Knuckler',
    cost: 6,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Blessing.** **Omen:** Restore 4 Health to your hero.',
    flavor: "Breaks noses behind the alehouse six days a week. On the seventh he rests, repents, and passes the collection plate.",
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
    name: 'Swing the Thurible',
    cost: 7,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'epic',
    text: 'Deal 4 damage to all enemy minions.',
    flavor: "Incense for the faithful. Eight pounds of consecrated brass on a chain for everybody else.",
    spell: [{ kind: 'damage', amount: 4, target: 'enemyMinions' }],
    art: undefined,
  },
  {
    id: 'priest_draenei_totem',
    name: 'The Walking Font',
    cost: 7,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Ward.** **Leeching.** **Omen:** Restore 5 Health to your hero.',
    flavor: "Holy water sloshing since the year of the wet plague. Several parishioners swear it winked during a christening.",
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
    name: 'The Bog-Bishop',
    cost: 8,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Ward.** **Omen:** Give your other friendly minions **Blessing**.',
    flavor: "Consecrated in peat, ordained by lightning, owed money by half the diocese.",
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
    name: 'Hezekiah Marrow, Unfrocked',
    cost: 9,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Omen:** Deal 2 damage to all enemies. Restore 2 Health to all friendly characters.',
    flavor: "The parish council voted to defrock him. The meeting did not adjourn so much as scatter.",
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

  /** Give a minion +0/+4 and Ward. (Was "+3 Health, draw a card" — a
   *  near-copy of Fortifying Swig one slot up the curve. Dropping the cantrip
   *  for a bigger buff plus Ward gives it a distinct defensive wall-builder
   *  role, and feeds Ward-synergy passives.) */
  {
    id: 'priest_power_word_fortitude',
    name: 'Stand at the Lychgate',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Give a minion +4 Health and **Ward**.',
    flavor: "Corpse-watch is a sacred parish duty: keep the dead in, the diggers out, and the gate shut regardless.",
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'buff', atk: 0, health: 4, target: 'chosenTarget' },
      { kind: 'giveKeyword', keyword: 'taunt', target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /** Cheap 1/2 that draws a card when played — reliable early cycle. */
  {
    id: 'priest_storecroom_helper',
    name: 'Vestry Scrounger',
    cost: 2,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Omen:** Draw a card.',
    flavor: "Paid in candle stubs and whatever's left in the chalice. Truthfully, he works for the chalice.",
    attack: 1,
    health: 2,
    tribe: 'none',
    battlecry: [{ kind: 'draw', count: 1 }],
    art: undefined,
  },

  // ── 2-COST (new) ──────────────────────────────────────────────────────────

  /** Discover a spell from your class pool — flexible value. */
  {
    id: 'priest_shadow_visions',
    name: 'Reading the Dregs',
    cost: 2,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'epic',
    text: 'Discover a spell.',
    flavor: "The future lies at the bottom of the chalice. The Vicar checks several times a night, for accuracy.",
    spell: [{ kind: 'discover', pool: 'spell' }],
    art: undefined,
  },

  /** 3/1 Rush minion — cheap early aggression and trade tool. */
  {
    id: 'priest_fanatical_acolyte',
    name: 'Frothing Flagellant',
    cost: 2,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Rush**',
    flavor: "Asked for penance; the Vicar, half asleep, said 'lay it on thick.' He has not stopped since Michaelmas.",
    attack: 3,
    health: 1,
    tribe: 'none',
    keywords: ['rush'],
    art: undefined,
  },

  // ── 3-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Premium single-target buff (+2/+4). The engine cannot grant Spell Damage
   * to a minion at runtime (the amount lives on CardDef.spellDamage), so it
   * is modelled as the pure stat buff.
   */
  {
    id: 'priest_velens_chosen',
    name: "The Vicar's Favourite",
    cost: 3,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Give a friendly minion +2/+4.',
    flavor: "Front pew, double helpings at the harvest supper, and certain pastoral attentions best left unminuted.",
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 2, health: 4, target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /**
   * 2/6 minion — sticky high-health body that is hard to remove.
   * Classic Vicar defensive minion archetype.
   */
  {
    id: 'priest_injured_blademaster',
    name: 'Martyr of the Moor',
    cost: 3,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Omen:** Give your other minions +0/+2.',
    flavor: "His suffering puts iron in the congregation's spine. His moaning puts them off their breakfast.",
    attack: 2,
    health: 6,
    tribe: 'none',
    battlecry: [{ kind: 'buff', atk: 0, health: 2, target: 'otherFriendlyMinions' }],
    art: undefined,
  },

  // ── 4-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Hand-value generation. The opponent's class can't be expressed in the
   * engine, so the pool is unrestricted (fromClass 'any') and the text says
   * "from any class".
   */
  {
    id: 'priest_thoughtsteal',
    name: 'Secrets of the Confessional',
    cost: 3,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Add 2 random minions from any class to your hand.',
    flavor: "What's said in the box stays in the box. The box, however, is for sale.",
    spell: [{ kind: 'addRandomCardToHand', pool: 'minion', count: 2, fromClass: 'any' }],
    art: undefined,
  },

  /**
   * 3/5 Ward with Leeching — a reliable defensive mid-game threat.
   */
  {
    id: 'priest_devout_chaplain',
    name: 'Gallows Chaplain',
    cost: 4,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'rare',
    text: '**Ward.** **Leeching.**',
    flavor: "Offers the condemned last rites, last requests and last orders. They rarely finish the pint.",
    attack: 3,
    health: 5,
    tribe: 'none',
    keywords: ['taunt', 'lifesteal'],
    art: undefined,
  },

  // ── 5-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Heal all friendly characters to full — massive board stabiliser and
   * combo with damaged high-health minions.
   */
  {
    id: 'priest_circle_of_healing',
    name: 'The Hollowmoor Miracle',
    cost: 5,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'common',
    text: 'Restore all friendly characters to full Health.',
    flavor: "The lame walked. The blind saw. The Vicar took ten percent and called it a tithe on grace.",
    spell: [{ kind: 'heal', amount: 30, target: 'allFriendlyCharacters' }],
    art: undefined,
  },

  /**
   * 4/5 that buffs a friendly minion on play — mid-game body plus a +2/+2.
   */
  {
    id: 'priest_temple_enforcer',
    name: 'Tithe-Taker',
    cost: 5,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'common',
    text: '**Omen:** Give a friendly minion +2/+2.',
    flavor: "Ten percent of the harvest or ten percent of thy teeth — the Vicar lets every parishioner choose.",
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
   * Destroy a minion and draw a card — premium removal with a cantrip.
   */
  {
    id: 'priest_entomb',
    name: 'A Plot Out Back',
    cost: 6,
    type: 'spell',
    cardClass: 'priest',
    rarity: 'epic',
    text: 'Destroy a minion. Draw a card.',
    flavor: "The churchyard's been full for a century, but the Vicar always finds room for one more. Shovel's extra.",
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
   * Legendary spell-amplifier. The engine has no "double heal/damage"
   * variant (and Spell Damage does not boost healing), so it is modelled as
   * a big Spell Damage minion. Encoded via the spellDamage field only — an
   * additional spellDamage aura would be double-counted by the engine.
   */
  {
    id: 'priest_prophet_velen',
    name: 'The Gospeller of Gallows Hill',
    cost: 7,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: '**Spell Damage +2**',
    flavor: "Preaches nightly to the hanged. A captive audience — though lately they've begun preaching back.",
    attack: 6,
    health: 7,
    tribe: 'none',
    spellDamage: 2,
    art: undefined,
  },

  // ── 8-COST (new) ──────────────────────────────────────────────────────────

  /**
   * Recurring late-game value — at end of turn, adds a random minion card to
   * hand (the engine's closest supported effect to graveyard recursion).
   */
  {
    id: 'priest_catrina_muerte',
    name: 'Widow Wormwood',
    cost: 8,
    type: 'minion',
    cardClass: 'priest',
    rarity: 'legendary',
    text: 'At the end of your turn, add a random minion to your hand.',
    flavor: "Four husbands buried, none mourned, company nightly. The churchyard gate squeaks something dreadful.",
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
