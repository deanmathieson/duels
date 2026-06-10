import type { CardDef } from '../../game/types'

/**
 * Warlock class cards — 28 collectible cards spanning the mana curve (1-10),
 * plus token cards for Imps and other summoned minions.
 * Theme: Demons, self-damage value, board flood, sacrifice for power.
 * Encoded per EFFECTSPEC.md conventions.
 */
export const warlockCards: CardDef[] = [

  // -------------------------------------------------------------------------
  // Tokens (token: true — not collectible)
  // -------------------------------------------------------------------------

  /** 1/1 Demon token summoned by several Warlock cards. */
  {
    id: 'warlock_imp',
    name: 'Imp',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    tribe: 'demon',
    token: true,
    art: undefined,
  },

  /** 3/2 Demon token summoned by Doomguard's board-flood variant. */
  {
    id: 'warlock_flame_imp_token',
    name: 'Flame Imp',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '',
    attack: 3,
    health: 2,
    tribe: 'demon',
    token: true,
    art: undefined,
  },

  /** 1/3 Taunt Demon — Voidwalker token for signature use. */
  {
    id: 'warlock_voidwalker_token',
    name: 'Voidwalker',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '**Ward**',
    attack: 1,
    health: 3,
    tribe: 'demon',
    keywords: ['taunt'],
    token: true,
    art: undefined,
  },

  /** 5/5 Demon token summoned by Twisting Nether partial effect. */
  {
    id: 'warlock_void_terror_token',
    name: 'Void Terror',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '',
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
   * Flame Imp — 3/2 Demon.
   * Battlecry: Deal 3 damage to your hero.
   */
  {
    id: 'warlock_flame_imp',
    name: 'Flame Imp',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Omen:** Deal 3 damage to your hero.',
    attack: 3,
    health: 2,
    tribe: 'demon',
    battlecry: [{ kind: 'damage', amount: 3, target: 'friendlyHero' }],
    art: undefined,
  },

  /**
   * Mortal Coil — 1-mana Warlock spell.
   * Deal 1 damage to a minion. If that kills it, draw a card.
   * Approximated: deal 1 damage + draw 1 (on-theme; engine cannot gate draw
   * on kill, so we always draw — equivalent flavour, slight upside).
   */
  {
    id: 'warlock_mortal_coil',
    name: 'Mortal Coil',
    cost: 1,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Deal 1 damage to a minion. Draw a card.',
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
   * Voidwalker — 1/3 Demon with Taunt.
   * Battlecry: none (vanilla Taunt body).
   */
  {
    id: 'warlock_voidwalker',
    name: 'Voidwalker',
    cost: 2,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'free',
    text: '**Ward**',
    attack: 1,
    health: 3,
    tribe: 'demon',
    keywords: ['taunt'],
    art: undefined,
  },

  /**
   * Dark Pact — 2-mana spell.
   * Deal 4 damage to your hero. Restore 8 Health to it.
   * (Warlock self-damage + heal combo card)
   */
  {
    id: 'warlock_dark_pact',
    name: 'Dark Pact',
    cost: 2,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Deal 4 damage to your hero. Restore 8 Health to your hero.',
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
   * Imp Gang Boss — 2/4 Demon. Whenever this minion takes damage, summon a
   * 1/1 Imp (the authentic effect, via the onSelfDamaged trigger; fires even
   * on lethal damage, and not when Divine Shield absorbs the hit).
   */
  {
    id: 'warlock_imp_gang_boss',
    name: 'Imp Gang Boss',
    cost: 3,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Whenever this minion takes damage, summon a 1/1 Imp.',
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
   * Shadow Bolt — 3-mana Warlock spell (Shadow).
   * Deal 4 damage to a minion.
   */
  {
    id: 'warlock_shadow_bolt',
    name: 'Shadow Bolt',
    cost: 3,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'free',
    text: 'Deal 4 damage to a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'damage', amount: 4, target: 'chosenTarget' }],
    art: undefined,
  },

  /**
   * Imp-losion — 3-mana Warlock spell.
   * Deal 2 damage to a minion. Summon a 1/1 Imp for each damage dealt.
   * Approximated: deal 2 damage to a minion + summon 2 Imps (fixed 2 damage = 2 Imps).
   * Cost 4 → 3: the fixed version (~0.7 mana of damage + ~1.6 mana of Imps) was
   * ~1.5 mana under rate at 4; the variable-payoff upside that justified 4 is gone.
   */
  {
    id: 'warlock_imp_losion',
    name: 'Imp-losion',
    cost: 3,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'rare',
    text: 'Deal 2 damage to a minion. Summon two 1/1 Imps.',
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
   * Hellfire — 4-mana Warlock spell (Fire).
   * Deal 3 damage to ALL characters.
   */
  {
    id: 'warlock_hellfire',
    name: 'Hellfire',
    cost: 4,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'free',
    text: 'Deal 3 damage to ALL characters.',
    spell: [{ kind: 'damage', amount: 3, target: 'allCharacters' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 5-cost
  // -------------------------------------------------------------------------

  /**
   * Doomguard — 5/7 Demon with Charge.
   * Original battlecry discards two cards; the engine has no discard mechanic,
   * so the drawback is approximated as 4 damage to your own hero (the warlock
   * self-damage idiom), which keeps the Charge body honestly paid for.
   */
  {
    id: 'warlock_doomguard',
    name: 'Doomguard',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Charge**. **Omen:** Deal 4 damage to your hero.',
    attack: 5,
    health: 7,
    tribe: 'demon',
    keywords: ['charge'],
    battlecry: [{ kind: 'damage', amount: 4, target: 'friendlyHero' }],
    art: undefined,
  },

  /**
   * Felguard — 3/5 Demon with Taunt.
   * Battlecry: Gain a Mana Crystal (empty).
   * Approximated: original destroys a Mana Crystal; here it grants one empty crystal
   * (opposing flavour using available effect — self-sacrifice for power).
   * Re-themed as: sacrifice your life total for future mana (deal 3 self + gain empty crystal).
   */
  {
    id: 'warlock_felguard',
    name: 'Felguard',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Ward**. **Omen:** Deal 3 damage to your hero. Gain an empty Mana Stone.',
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
   * Siphon Soul — 6-mana Warlock spell.
   * Destroy a minion. Restore 3 Health to your hero.
   */
  {
    id: 'warlock_siphon_soul',
    name: 'Siphon Soul',
    cost: 6,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'rare',
    text: 'Destroy a minion. Restore 3 Health to your hero.',
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
   * Abyssal Enforcer — 6/6 Demon.
   * Battlecry: Deal 3 damage to ALL characters.
   * Approximated: the original hits "all other characters", but the targeting
   * vocabulary has no all-but-self selector, so 'allCharacters' includes the
   * Enforcer itself (it arrives as a 6/3). Cost 6 → 7: at 6 it was Hellfire
   * (a 4-mana effect) plus a 6/6 body for only 2 extra mana — ~1.5-2 mana over
   * rate; 7 matches the real-card anchor.
   */
  {
    id: 'warlock_abyssal_enforcer',
    name: 'Abyssal Enforcer',
    cost: 7,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Omen:** Deal 3 damage to ALL characters.',
    attack: 6,
    health: 6,
    tribe: 'demon',
    battlecry: [{ kind: 'damage', amount: 3, target: 'allCharacters' }],
    art: undefined,
  },

  /**
   * Blood-Queen Lana'thel — 5/5 Demon Legendary.
   * Battlecry: Deal 3 damage to your hero. Draw 3 cards.
   * (Self-damage draw — iconic Warlock resource engine)
   */
  {
    id: 'warlock_blood_queen_lanathel',
    name: "Blood-Queen Lana'thel",
    cost: 7,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'legendary',
    text: '**Omen:** Deal 3 damage to your hero. Draw 3 cards.',
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
   * Twisting Nether — 8-mana Warlock spell.
   * Destroy all minions. Summon a 5/5 Void Terror.
   * (Original: destroy all minions. Here we add a compensating Demon to avoid total board wipe loss.)
   */
  {
    id: 'warlock_twisting_nether',
    name: 'Twisting Nether',
    cost: 8,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'epic',
    text: 'Destroy all minions. Summon a 5/5 Void Terror.',
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
   * Lord Jaraxxus — Legendary Warlock finisher. 3/15 Demon.
   * Battlecry: Deal 5 damage to ALL characters. Give your hero +5 Attack this turn.
   * (Original replaces hero — approximated as a massive Demon with board-warping battlecry.)
   * Approximated: no all-but-self selector exists, so 'allCharacters' includes
   * Jaraxxus himself (he arrives as a 3/10). Cost 9 → 10: a one-card board
   * reset + 10 potential face damage + a sticky 3/10 was ~2 mana over rate at 9.
   */
  {
    id: 'warlock_lord_jaraxxus',
    name: 'Lord Jaraxxus',
    cost: 10,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'legendary',
    text: '**Omen:** Deal 5 damage to ALL characters. Give your hero +5 Attack this turn.',
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
   * Kobold Librarian — 2/1 Demon.
   * Battlecry: Draw a card. Deal 2 damage to your hero.
   * Classic cheap Warlock draw engine at the cost of life.
   * 2/3 → 2/1: a 1-mana 2/3 PLUS a free cantrip was ~2 mana of value over
   * band; 2/1 matches the real-card anchor.
   */
  {
    id: 'warlock_kobold_librarian',
    name: 'Kobold Librarian',
    cost: 1,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Omen:** Draw a card. Deal 2 damage to your hero.',
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
   * Drain Soul — 2-mana Warlock spell (Shadow).
   * Deal 3 damage to a minion. Restore 3 Health to your hero.
   * The quintessential Warlock drain effect.
   */
  {
    id: 'warlock_drain_soul',
    name: 'Drain Soul',
    cost: 2,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Deal 3 damage to a minion. Restore 3 Health to your hero.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'heal', amount: 3, target: 'friendlyHero' },
    ],
    art: undefined,
  },

  /**
   * Vulgar Homunculus — 2/4 Demon with Taunt.
   * Battlecry: Deal 2 damage to your hero.
   * Great stats with Taunt at the cost of self-damage.
   */
  {
    id: 'warlock_vulgar_homunculus',
    name: 'Vulgar Homunculus',
    cost: 2,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Ward**. **Omen:** Deal 2 damage to your hero.',
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
   * Void Terror — 2/2 Demon.
   * Battlecry: Gain +2/+2 (approximation of consuming adjacent minions).
   * Original eats adjacent Demons for their combined stats; approximated as a fixed
   * stat boost to keep the "hungry Demon" flavour without a dedicated ScriptId.
   * 3/3 → 2/2: the unconditional self-buff made it a vanilla 5/5 for 3 mana
   * (~1.5 mana over band); a 4/4-on-play sits just above the vanilla 3/4 line.
   */
  {
    id: 'warlock_void_terror',
    name: 'Void Terror',
    cost: 3,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Omen:** Gain +2/+2.',
    attack: 2,
    health: 2,
    tribe: 'demon',
    battlecry: [{ kind: 'buff', atk: 2, health: 2, target: 'self' }],
    art: undefined,
  },

  /**
   * Darkshire Councilman — 1/5 Demon.
   * After you play a minion, gain +1 Attack.
   * Board-flood payoff: grows as you play more minions.
   * Approximated: the trigger vocabulary has no Demon condition, so the
   * onPlayMinion trigger fires for ANY minion you play (matching the real
   * card's any-minion text rather than a Demon-only version).
   */
  {
    id: 'warlock_darkshire_councilman',
    name: 'Darkshire Councilman',
    cost: 3,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'After you play a minion, gain +1 Attack.',
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
   * Sense Demons — 3-mana Warlock spell.
   * Add two random Warlock minions to your hand.
   * Tutor effect to fuel the Demon synergy package.
   * Approximated: there is no Demon-tribe generation pool, so the minion pool
   * is locked to the Warlock class via fromClass (every collectible Warlock
   * minion in this set is a Demon). Cost 4 → 3: two random cards are worth
   * ~2-3 mana of generation; 3 also matches the real-card anchor.
   */
  {
    id: 'warlock_sense_demons',
    name: 'Sense Demons',
    cost: 3,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Add two random Warlock minions to your hand.',
    spell: [
      { kind: 'addRandomCardToHand', pool: 'minion', count: 2, fromClass: 'warlock' },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW ADDITIONS — 4-cost
  // -------------------------------------------------------------------------

  /**
   * Felhunter — 2/4 Demon with Rush.
   * Battlecry: Gain +1/+1 for each card in your hand.
   * Approximated as a fixed +2/+2 battlecry (on-curve for hand-size synergy).
   */
  {
    id: 'warlock_felhunter',
    name: 'Felhunter',
    cost: 4,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'common',
    text: '**Rush**. **Omen:** Gain +2/+2.',
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
   * Void Caller — 3/4 Demon.
   * Deathrattle: Summon a 5/5 Void Terror.
   * Generates a large Demon threat on death — Demon package payoff.
   */
  {
    id: 'warlock_void_caller',
    name: 'Void Caller',
    cost: 5,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Haunt:** Summon a 5/5 Void Terror.',
    attack: 3,
    health: 4,
    tribe: 'demon',
    deathrattle: [{ kind: 'summon', token: 'warlock_void_terror_token', count: 1 }],
    art: undefined,
  },

  /**
   * Bane of Doom — 5-mana Warlock spell (Shadow).
   * Deal 2 damage to a character. Summon a 5/5 Void Terror.
   * Original summons a random Demon if it kills; approximated as damage + fixed Demon summon.
   */
  {
    id: 'warlock_bane_of_doom',
    name: 'Bane of Doom',
    cost: 5,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'epic',
    text: 'Deal 2 damage to a character. Summon a 5/5 Void Terror.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'summon', token: 'warlock_void_terror_token', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Corruption — 5-mana Warlock spell (Shadow).
   * Destroy an enemy minion.
   * Approximated: the original destroys the minion at the start of YOUR NEXT
   * turn; the engine has no delayed-destroy, so it resolves immediately and is
   * priced at the unconditional targeted-destroy anchor (Assassinate, 5 mana).
   * It was previously 1 mana — ~4 mana under band with the delay dropped.
   */
  {
    id: 'warlock_corruption',
    name: 'Corruption',
    cost: 5,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'common',
    text: 'Destroy an enemy minion.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },

  /**
   * Hand of Gul'dan — 5-mana Warlock spell (Shadow).
   * Draw 3 cards. Deal 3 damage to your hero.
   * Iconic heavy draw at life cost.
   * Cost 6 → 5: draw 3 is ~4.5 mana at the Arcane Intellect rate, and warlock
   * pays health ON TOP here — at 6 the card was ~2 mana over fair cost.
   */
  {
    id: 'warlock_hand_of_guldan',
    name: "Hand of Gul'dan",
    cost: 5,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'rare',
    text: 'Draw 3 cards. Deal 3 damage to your hero.',
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
   * Enhanced Dreadlord — 5/7 Demon with Lifesteal.
   * Battlecry: Summon a 1/1 Imp.
   * High-impact Lifesteal body that also floods the board.
   */
  {
    id: 'warlock_enhanced_dreadlord',
    name: 'Enhanced Dreadlord',
    cost: 7,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'rare',
    text: '**Leeching**. **Omen:** Summon a 1/1 Imp.',
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
   * Mal'Ganis — 9/7 Demon Legendary.
   * Aura: Your other minions have +2/+2.
   * Approximated: the aura vocabulary has no Demon CardFilter, so the buff
   * applies to ALL your other minions (the engine excludes the aura's own
   * source). Text widened from "Demons" to match the implemented behaviour.
   */
  {
    id: 'warlock_malganis',
    name: "Mal'Ganis",
    cost: 8,
    type: 'minion',
    cardClass: 'warlock',
    rarity: 'legendary',
    text: 'Your other minions have +2/+2.',
    attack: 9,
    health: 7,
    tribe: 'demon',
    auras: [{ kind: 'minionStat', atk: 2, health: 2, filter: 'all' }],
    art: undefined,
  },
]
