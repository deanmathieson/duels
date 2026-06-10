import type { CardDef } from '../../game/types'

/**
 * Cutpurse class cards (internal class id: 'rogue') — 30 collectible cards
 * spanning the mana curve (0–9), plus token cards for summoned minions.
 * Theme: Nell Threefingers and the Hollowmoor underbelly — tempo, cheap
 * knives, smugglers' Brigands, direct damage, card draw, and back-alley Omens.
 * Extended with Brigand synergies, stealth payoffs, burst finishers, and
 * weapon-focused archetypes.
 */
export const rogueCards: CardDef[] = [

  // =========================================================================
  // TOKEN CARDS (not collectible; referenced by other cards' effects)
  // =========================================================================

  /** Footpad — 1/1 Brigand token, used by Call in the Lads and The Gutter King. */
  {
    id: 'rogue_lackey',
    name: 'Footpad',
    cost: 1,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    tribe: 'pirate',
    token: true,
  },

  /** Shadow — 1/1 token summoned by Lamp-Snuffer's Haunt. */
  {
    id: 'rogue_shadow',
    name: 'Shadow',
    cost: 1,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'free',
    text: '**Stealth**',
    attack: 1,
    health: 1,
    tribe: 'none',
    keywords: ['stealth'],
    token: true,
  },

  /** Dagger token — 0-cost 1/2 weapon equipped by Adder's Kiss and Knife-Work. */
  {
    id: 'rogue_whetted_dagger',
    name: 'Whetted Dagger',
    cost: 0,
    type: 'weapon',
    cardClass: 'rogue',
    rarity: 'free',
    text: '',
    attack: 1,
    durability: 2,
    token: true,
  },

  // =========================================================================
  // 0-COST SPELLS
  // =========================================================================

  /**
   * Knife Between Friends — deal 2 damage to a minion.
   * (Kept as pure 2 dmg to any minion — no play-condition modelled by engine.)
   */
  {
    id: 'rogue_backstab',
    name: 'Knife Between Friends',
    cost: 0,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Deal 2 damage to a minion.',
    flavor: 'Friendship in Hollowmoor is measured in inches. Usually four, between the ribs.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  // =========================================================================
  // 1-COST
  // =========================================================================

  /**
   * Low Blow — deal 3 damage to the enemy hero.
   */
  {
    id: 'rogue_sinister_strike',
    name: 'Low Blow',
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Deal 3 damage to the enemy hero.',
    flavor: "Aim below the belt. Nothing down there he hasn't already lost to the pox.",
    spell: [{ kind: 'damage', amount: 3, target: 'enemyHero' }],
  },

  /**
   * Adder's Kiss — equip a 1/2 dagger.
   * (A venom-buff isn't in the engine, so it's approximated as equipping a
   * small envenomed blade.)
   */
  {
    id: 'rogue_deadly_poison',
    name: "Adder's Kiss",
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Equip a 1/2 Dagger.',
    flavor: "Sweeter than the tavern girls', and only slightly more likely to kill you.",
    spell: [{ kind: 'equipWeapon', cardId: 'rogue_whetted_dagger' }],
  },

  // =========================================================================
  // 2-COST
  // =========================================================================

  /**
   * Unseam — deal 2 damage, draw a card.
   * (Flat 2 damage + draw; no play-condition scaling in the engine.)
   */
  {
    id: 'rogue_eviscerate',
    name: 'Unseam',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Deal 2 damage to any target. Draw a card.',
    flavor: "The tailor's widow does alterations. Mostly subtractions.",
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
  },

  /**
   * Back-Alley Barber — 3/2 Brigand. Omen: equip a 1/2 dagger.
   * Cheap weapon + minion pressure in one card.
   */
  {
    id: 'rogue_goblin_auto_barber',
    name: 'Back-Alley Barber',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Omen:** Equip a 1/2 Dagger.',
    flavor: "A shave, a trim, and a little off the top of your purse.",
    attack: 3,
    health: 2,
    tribe: 'pirate',
    battlecry: [{ kind: 'equipWeapon', cardId: 'rogue_whetted_dagger' }],
  },

  /**
   * Marshway Ringleader — 2/2. Omen: deal 2 damage to a minion.
   * Pinpoint removal on a tempo body.
   */
  {
    id: 'rogue_defias_ringleader',
    name: 'Marshway Ringleader',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Omen:** Deal 2 damage to a minion.',
    flavor: 'He runs three lads, two stills, and one very accommodating widow.',
    attack: 2,
    health: 2,
    tribe: 'pirate',
    targeted: true,
    targetFilter: 'allMinions',
    battlecry: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  // =========================================================================
  // 3-COST
  // =========================================================================

  /**
   * Wedding Cutlery — deal 1 damage to all enemies, draw a card.
   */
  {
    id: 'rogue_fan_of_knives',
    name: 'Wedding Cutlery',
    cost: 3,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Deal 1 damage to all enemies. Draw a card.',
    flavor: 'Every Hollowmoor wedding ends the same way: tears, debts, and forks in the groom.',
    spell: [
      { kind: 'damage', amount: 1, target: 'allEnemyCharacters' },
      { kind: 'draw', count: 1 },
    ],
  },

  /**
   * Parish Cutthroat — 3/3. Omen: deal 2 damage.
   * The class's iconic value minion.
   */
  {
    id: 'rogue_si7_agent',
    name: 'Parish Cutthroat',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Omen:** Deal 2 damage.',
    flavor: 'The vicar keeps him on retainer. Forgiveness is easier to arrange in advance.',
    attack: 3,
    health: 3,
    tribe: 'none',
    targeted: true,
    targetFilter: 'allCharacters',
    battlecry: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  // =========================================================================
  // 4–5 COST
  // =========================================================================

  /**
   * Lamp-Snuffer — 3/4. **Stealth**. Haunt: summon two 1/1 Shadows with Stealth.
   */
  {
    id: 'rogue_shadow_agent',
    name: 'Lamp-Snuffer',
    cost: 4,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Stealth.** **Haunt:** Summon two 1/1 Shadows with Stealth.',
    flavor: 'He puts out the lights for lovers, thieves, and lovers of thieves.',
    attack: 3,
    health: 4,
    tribe: 'none',
    keywords: ['stealth'],
    deathrattle: [{ kind: 'summon', token: 'rogue_shadow', count: 2 }],
  },

  /**
   * Threshing Night — deal 3 damage to all enemies.
   * (Recosted 4 -> 5: 3 damage to all enemies including face sits at the
   * 5-mana AoE anchor.)
   */
  {
    id: 'rogue_blade_flurry',
    name: 'Threshing Night',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Deal 3 damage to all enemies.',
    flavor: 'Come harvest, every soul in Hollowmoor swings something sharp. Few aim at the wheat.',
    spell: [{ kind: 'damage', amount: 3, target: 'allEnemyCharacters' }],
  },

  // =========================================================================
  // 1–5 COST
  // =========================================================================

  /**
   * Quack's Remedy — give your hero +3 Attack this turn and gain 4 Armor.
   * (Recosted 5 -> 3: +3 Attack ≈ 1.5 mana and 4 Armor ≈ 1.3 mana, so 5 was
   * ~2 mana of value short of its cost.)
   */
  {
    id: 'rogue_leeching_poison',
    name: "Quack's Remedy",
    cost: 3,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'Give your hero +3 Attack this turn. Gain 4 Armor.',
    flavor: "Doctor Mossback's tonic cures gout, dropsy, and fidelity.",
    spell: [
      { kind: 'heroAttackThisTurn', amount: 3 },
      { kind: 'gainArmor', amount: 4 },
    ],
  },

  /**
   * Call in the Lads — add 2 Footpads to your hand.
   * (Recosted 5 -> 1: two 1/1 Footpads in hand are worth ~1-1.5 mana of
   * value, nowhere near a 5-cost.)
   */
  {
    id: 'rogue_shadowstep',
    name: 'Call in the Lads',
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Add two 1/1 Footpads to your hand.',
    flavor: 'Whistle twice at the Drowned Rat and the back room empties of husbands.',
    spell: [
      { kind: 'addCardToHand', cardId: 'rogue_lackey', count: 2 },
    ],
  },

  /**
   * The Hangman's Daughter — 3/4 Brigand with Rush. Omen: equip a 2/3 Blade.
   * Signature Cutpurse blade-bearer.
   */
  {
    id: 'rogue_kingsbane',
    name: "The Hangman's Daughter",
    cost: 5,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: '**Rush.** **Omen:** Equip a 2/3 Blade.',
    flavor: 'Every suitor gets the same dowry: two yards of rope or one of steel.',
    attack: 3,
    health: 4,
    tribe: 'pirate',
    keywords: ['rush'],
    battlecry: [{ kind: 'equipWeapon', cardId: 'rogue_kingsbane_blade' }],
  },

  // =========================================================================
  // WEAPON TOKEN for The Hangman's Daughter
  // =========================================================================
  {
    id: 'rogue_kingsbane_blade',
    name: 'Dowry Blade',
    cost: 0,
    type: 'weapon',
    cardClass: 'rogue',
    rarity: 'free',
    text: '',
    attack: 2,
    durability: 3,
    token: true,
  },

  // =========================================================================
  // 6-COST
  // =========================================================================

  /**
   * The Reeking Fog — AoE board damage + a cantrip.
   * (Trimmed from 4 damage + draw 2: that was ~10 mana of value at 6.
   * 3 damage + draw 1 fits the 6-mana AoE band.)
   */
  {
    id: 'rogue_vanish',
    name: 'The Reeking Fog',
    cost: 6,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Deal 3 damage to all enemy minions. Draw a card.',
    flavor: "It rolls off the bog at dusk, smelling of peat, regret, and someone else's wife.",
    spell: [
      { kind: 'damage', amount: 3, target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
  },

  // =========================================================================
  // 7-COST
  // =========================================================================

  /**
   * Magpie Tom — 4/4. Charge. Omen: gain +3/+3.
   * An effective 7/7 Charge body for 7 (the engine can't count play history,
   * so the scaling is baked into a fixed battlecry buff).
   */
  {
    id: 'rogue_edwin_vancleef',
    name: 'Magpie Tom',
    cost: 7,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'legendary',
    text: '**Charge.** **Omen:** Gain +3/+3.',
    flavor: "He's stolen the church bell, the squire's bride, and the squire. The bell he gave back.",
    attack: 4,
    health: 4,
    tribe: 'none',
    keywords: ['charge'],
    battlecry: [{ kind: 'buff', atk: 3, health: 3, target: 'self' }],
  },

  // =========================================================================
  // 8-COST
  // =========================================================================

  /**
   * The Drowned Smuggler — 5/6 minion. Omen: deal 2 damage to all enemies.
   * (Trimmed the "draw 2 cards" rider: a 5/6 body plus AoE plus draw was
   * ~2 mana over an 8-cost budget. Body + mid-sized AoE battlecry fits.)
   */
  {
    id: 'rogue_spectral_cutlass',
    name: 'The Drowned Smuggler',
    cost: 8,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: '**Omen:** Deal 2 damage to all enemies.',
    flavor: "Sank with his brandy in '09. Comes up with every fog to settle the tab.",
    attack: 5,
    health: 6,
    tribe: 'none',
    battlecry: [
      { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
    ],
  },

  // =========================================================================
  // 2-COST (CONTINUED)
  // =========================================================================

  /**
   * Hemlock Bridie — 1/1 with Stealth and Poisonous.
   * (Stealth + Poisonous fills the 2-mana budget on its own; no extra riders.)
   */
  {
    id: 'rogue_patient_assassin',
    name: 'Hemlock Bridie',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: '**Stealth. Poisonous.**',
    flavor: 'She courts slow, cooks lovely, and inherits often.',
    attack: 1,
    health: 1,
    tribe: 'none',
    keywords: ['stealth', 'poisonous'],
  },

  // =========================================================================
  // 9-COST FINISHER
  // =========================================================================

  /**
   * Fat Agnes, the Fence — 5/5. Omen: add 3 random spells to your hand.
   * Big late-game value finisher.
   */
  {
    id: 'rogue_togwaggle',
    name: 'Fat Agnes, the Fence',
    cost: 9,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'legendary',
    text: '**Omen:** Add 3 random spells to your hand.',
    flavor: "She'll fence anything: silver, secrets, sons. Ask after her bulk rates.",
    attack: 5,
    health: 5,
    tribe: 'none',
    // Pool defaults to Cutpurse + neutral spells per the generation class lock.
    battlecry: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 3 }],
  },

  // =========================================================================
  // NEW CARDS — EXTENDED SET
  // =========================================================================

  // ---- WEAPON TOKEN used by new cards ----

  /** Sharp Dagger — spare 1/2 weapon token (not currently referenced by any collectible card). */
  {
    id: 'rogue_sharp_dagger',
    name: 'Sharp Dagger',
    cost: 0,
    type: 'weapon',
    cardClass: 'rogue',
    rarity: 'free',
    text: '',
    attack: 1,
    durability: 2,
    token: true,
  },

  /** Cutlass — 3/2 weapon token equipped by Knacker's Oil and Moonless Run. */
  {
    id: 'rogue_cutlass',
    name: 'Cutlass',
    cost: 0,
    type: 'weapon',
    cardClass: 'rogue',
    rarity: 'free',
    text: '',
    attack: 3,
    durability: 2,
    token: true,
  },

  // ---- 1-COST ADDITIONS ----

  /**
   * Casing the Chapel — cheap Cutpurse cycle spell: draw 2 cards.
   * (Pure draw at 2 — slightly pushed cycle as class identity.)
   */
  {
    id: 'rogue_preparation',
    name: 'Casing the Chapel',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Draw 2 cards.',
    flavor: 'The collection plate makes its rounds at ten. So do we.',
    spell: [
      { kind: 'draw', count: 2 },
    ],
  },

  /**
   * Marsh-Runner — 2/1 Brigand with Charge.
   * (Unconditional Charge at the 2-mana 2/1 Charge anchor.)
   */
  {
    id: 'rogue_southsea_deckhand',
    name: 'Marsh-Runner',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Charge**',
    flavor: 'Fastest lad in the fens — ask any husband come home early.',
    attack: 2,
    health: 1,
    tribe: 'pirate',
    keywords: ['charge'],
  },

  // ---- 2–3 COST ADDITIONS ----

  /**
   * Old Grudge — give a minion +4 Attack.
   * Great burst enabler / reach card.
   */
  {
    id: 'rogue_cold_blood',
    name: 'Old Grudge',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Give a minion +4 Attack.',
    flavor: 'Hollowmoor folk keep three things well: peat, pickles, and scores.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'buff', atk: 4, health: 0, target: 'chosenTarget' }],
  },

  /**
   * Back-Room Fence — 2/3 Brigand. Omen: discover a spell.
   * Brigand/tempo synergy with card selection.
   * (Recosted 2 -> 3: vanilla 2-drop stats plus a free discover (~1.5 mana)
   * was over budget. Discover pool defaults to Cutpurse + neutral spells per
   * the generation class lock.)
   */
  {
    id: 'rogue_underbelly_fence',
    name: 'Back-Room Fence',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Omen:** Discover a spell.',
    flavor: 'Everything in the back of the Drowned Rat fell off a cart. Some of it fell off a corpse.',
    attack: 2,
    health: 3,
    tribe: 'pirate',
    battlecry: [{ kind: 'discover', pool: 'spell' }],
  },

  // ---- 3–4 COST ADDITIONS ----

  /**
   * Aspiring Cutthroat — 2/2. At the end of your turn, gain +2/+2.
   */
  {
    id: 'rogue_questing_adventurer',
    name: 'Aspiring Cutthroat',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'At the end of your turn, gain +2/+2.',
    flavor: 'Started on purses. Moved up to throats. Management material.',
    attack: 2,
    health: 2,
    tribe: 'none',
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'buff', atk: 2, health: 2, target: 'self' }],
      },
    ],
  },

  /**
   * Barrow-Thief — 5/4. Haunt: add a Coin to your hand.
   * Classic combo/ramp enabler via death.
   * (Costed at 4: 5/4 + a Coin is ~2 mana over a 3-cost budget.)
   */
  {
    id: 'rogue_tomb_pillager',
    name: 'Barrow-Thief',
    cost: 4,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Haunt:** Add a Coin to your hand.',
    flavor: 'The dead get two pennies for the ferryman. He reckons they can swim.',
    attack: 5,
    health: 4,
    tribe: 'none',
    deathrattle: [{ kind: 'gainCoin', count: 1 }],
  },

  // ---- 4–5 COST ADDITIONS ----

  /**
   * Knacker's Oil — equip a 3/2 Cutlass and buff a friendly minion +3 Attack.
   * Weapon + board buff combo at 4 mana.
   */
  {
    id: 'rogue_tinkers_sharpsword_oil',
    name: "Knacker's Oil",
    cost: 4,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Give a friendly minion +3 Attack. Equip a 3/2 Cutlass.',
    flavor: "Rendered from the squire's prize stallion. Keeps a blade keen and a conscience quiet.",
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 3, health: 0, target: 'chosenTarget' },
      { kind: 'equipWeapon', cardId: 'rogue_cutlass' },
    ],
  },

  /**
   * Midnight Peddler — 4/5. Omen: reduce the cost of cards in your hand by (1).
   * Board presence + hand-wide cost reduction at the 5-mana rate.
   */
  {
    id: 'rogue_ethereal_peddler',
    name: 'Midnight Peddler',
    cost: 5,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Omen:** Reduce the Cost of cards in your hand by (1).',
    flavor: "Knock thrice. He stocks what the day-market won't say aloud.",
    attack: 4,
    health: 5,
    tribe: 'none',
    battlecry: [{ kind: 'reduceCostInHand', amount: 1, filter: 'all' }],
  },

  // ---- 5-COST ADDITIONS ----

  /**
   * Leg It! — draw 4 cards.
   * The class's classic refill/draw spell for control/value builds.
   */
  {
    id: 'rogue_sprint',
    name: 'Leg It!',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Draw 4 cards.',
    flavor: "Half the village's marriages began with someone legging it. The other half should have.",
    spell: [{ kind: 'draw', count: 4 }],
  },

  // ---- 2-COST ADDITIONS (CONTINUED) ----

  /**
   * Peat Smoke — give all friendly minions Stealth.
   * Board protection / stealth payoff spell.
   * Approximated as a permanent Stealth grant (engine does not track "until
   * next turn" expiry), and the text matches that behaviour.
   * (Costed at 2: Stealth is ~0.5 mana per minion.)
   */
  {
    id: 'rogue_conceal',
    name: 'Peat Smoke',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Give your minions **Stealth**.',
    flavor: 'Thick enough to hide a still, a tryst, or a body. The bog provides.',
    spell: [{ kind: 'giveKeyword', keyword: 'stealth', target: 'friendlyMinions' }],
  },

  // ---- 5-COST ADDITIONS (CONTINUED) ----

  /**
   * Moonless Run — draw 2 cards and equip a 3/2 Cutlass.
   * Brigand / weapon synergy value card.
   * (Costed at 5: draw 2 (~3 mana) + a 3/2 weapon (~2.5 mana at Cutpurse
   * weapon rates) is ~5.5 mana of value.)
   */
  {
    id: 'rogue_raiding_party',
    name: 'Moonless Run',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'Draw 2 cards. Equip a 3/2 Cutlass.',
    flavor: 'Brandy in, bodies out. The tide keeps no ledger.',
    spell: [
      { kind: 'draw', count: 2 },
      { kind: 'equipWeapon', cardId: 'rogue_cutlass' },
    ],
  },

  // ---- 9-COST LEGENDARY FINISHER ----

  /**
   * The Hollowmoor Widow — 3/9 with Stealth. Omen: deal 2 damage to all enemies.
   * Legendary Cutpurse finisher: a hard-to-remove body plus an AoE swing.
   * (Costed at 9 with a single mid-sized AoE battlecry on a 6-mana body.)
   */
  {
    id: 'rogue_valeera_the_hollow',
    name: 'The Hollowmoor Widow',
    cost: 9,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'legendary',
    text: '**Stealth.** **Omen:** Deal 2 damage to all enemies.',
    flavor: 'Six husbands in the ground, and not one of them dead first.',
    attack: 3,
    health: 9,
    tribe: 'none',
    keywords: ['stealth'],
    battlecry: [
      { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
    ],
  },

  // -------------------------------------------------------------------------
  // HAUNT PACKAGE — Cutpurse flavour: the corpse trade. Bodies are inventory,
  // funerals are networking, and everything is for sale twice.
  // NOTE: r_shallow_grave is PLAYER-ONLY — the greedy AI would destroy its own
  // best minion with it. Never add it to an enemy deck (data/enemies.ts).
  // -------------------------------------------------------------------------
  {
    id: 'r_shallow_grave',
    name: 'Shallow Grave',
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Destroy a friendly minion. Draw 2 cards.',
    flavor: 'Cheaper than severance, and the references stay glowing.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'destroy', target: 'chosenTarget' },
      { kind: 'draw', count: 2 },
    ],
    art: undefined,
  },
  {
    id: 'r_garrote_ghost',
    name: 'Garrote Ghost',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Stealth**. **Haunt:** Deal 2 damage to a random enemy.',
    flavor: 'Strangled in 1842. Still takes commissions.',
    attack: 2,
    health: 2,
    tribe: 'none',
    keywords: ['stealth'],
    deathrattle: [{ kind: 'damage', amount: 2, target: 'randomEnemy' }],
    art: undefined,
  },
  {
    id: 'r_embalmers_oil',
    name: "Embalmer's Oil",
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: "Trigger a friendly minion's **Haunt**. Draw a card.",
    flavor: 'Rub it in well. The dead like to feel pampered before a performance.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'triggerDeathrattles', target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },
  {
    id: 'r_corpse_broker',
    name: 'The Corpse Broker',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'Whenever a friendly **Haunt** minion dies, gain a Coin.',
    flavor: 'Every body has a price. His ledger has two columns: "fresh" and "negotiable".',
    attack: 3,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        condition: 'cardHasDeathrattle',
        effects: [{ kind: 'gainCoin', count: 1 }],
      },
    ],
    art: undefined,
  },
  {
    id: 'r_reliquary_fence',
    name: 'Reliquary Fence',
    cost: 4,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Haunt:** Add a random **Haunt** minion to your hand. It costs (2) less.',
    flavor: 'Saint knuckles, martyr teeth, your grandmother — all priced to move.',
    attack: 3,
    health: 4,
    tribe: 'none',
    deathrattle: [
      { kind: 'addRandomCardToHand', pool: 'deathrattleMinion', count: 1, costReduction: 2 },
    ],
    art: undefined,
  },
  {
    id: 'r_ossuary_creeper',
    name: 'Ossuary Creeper',
    cost: 4,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Stealth**. **Haunt:** Summon two 1/1 Shadows.',
    flavor: 'It moved in under the chapel and never pays rent. Relatable, honestly.',
    attack: 4,
    health: 3,
    tribe: 'none',
    keywords: ['stealth'],
    deathrattle: [{ kind: 'summon', token: 'rogue_shadow', count: 2 }],
    art: undefined,
  },
  {
    id: 'r_mistress_velvetshroud',
    name: 'Mistress Velvetshroud',
    cost: 5,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Your **Haunts** trigger twice.',
    flavor: 'She hears every last word twice. She insists on it — and charges for the encore.',
    attack: 4,
    health: 5,
    tribe: 'none',
    auras: [{ kind: 'triggerTwice', what: 'deathrattle' }],
    art: undefined,
  },
  {
    id: 'r_midnight_exhumation',
    name: 'Midnight Exhumation',
    cost: 6,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Resummon 2 friendly **Haunt** minions that died this game.',
    flavor: 'The parish calls it grave-robbing. The trade calls it a second opinion.',
    spell: [{ kind: 'resummonDeadMinion', count: 2, filter: 'deathrattle' }],
    art: undefined,
  },
]
