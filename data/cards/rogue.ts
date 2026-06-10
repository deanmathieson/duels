import type { CardDef } from '../../game/types'

/**
 * Rogue class cards — 30 collectible cards spanning the mana curve (0–9),
 * plus token cards for summoned minions.
 * Theme: Infiltrator Lilian — tempo, cheap efficient minions, weapons,
 * direct damage, card draw, and SI:7-style Battlecries.
 * Extended with pirate synergies, stealth payoffs, burst finishers, and
 * weapon-focused archetypes.
 */
export const rogueCards: CardDef[] = [

  // =========================================================================
  // TOKEN CARDS (not collectible; referenced by other cards' effects)
  // =========================================================================

  /** Lackey — 1/1 Pirate token, used by Gang Up and Shadowstep value plays. */
  {
    id: 'rogue_lackey',
    name: 'Lackey',
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

  /** Shadow — 1/1 token summoned by Shadow Agent's deathrattle. */
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

  /** Shiv token — 0-cost weapon 1/2 produced by Deadly Poison effect placeholder. */
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
   * Backstab — deal 2 damage to an undamaged minion.
   * Approximation: targeted 2 damage to a minion (Combo/undamaged condition not
   * modelled by engine — kept as pure 2 dmg to any minion, on-theme).
   */
  {
    id: 'rogue_backstab',
    name: 'Backstab',
    cost: 0,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Deal 2 damage to a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  // =========================================================================
  // 1-COST
  // =========================================================================

  /**
   * Sinister Strike — deal 3 damage to the enemy hero.
   */
  {
    id: 'rogue_sinister_strike',
    name: 'Sinister Strike',
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Deal 3 damage to the enemy hero.',
    spell: [{ kind: 'damage', amount: 3, target: 'enemyHero' }],
  },

  /**
   * Deadly Poison — equip a 1/2 dagger.
   * Original buffs weapon by +2 attack; approximated as equipping a small weapon
   * since the engine has no "buff weapon" effect.
   */
  {
    id: 'rogue_deadly_poison',
    name: 'Deadly Poison',
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Equip a 1/2 Dagger.',
    spell: [{ kind: 'equipWeapon', cardId: 'rogue_whetted_dagger' }],
  },

  // =========================================================================
  // 2-COST
  // =========================================================================

  /**
   * Eviscerate — deal 2 damage, draw a card.
   * (Original deals 2/4 based on Combo; approximated as flat 2 damage + draw.)
   */
  {
    id: 'rogue_eviscerate',
    name: 'Eviscerate',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Deal 2 damage to any target. Draw a card.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
  },

  /**
   * Goblin Auto-Barber — 3/2 Pirate. Battlecry: equip a 1/2 dagger.
   * Classic SI:7 style cheap weapon + minion pressure.
   */
  {
    id: 'rogue_goblin_auto_barber',
    name: 'Goblin Auto-Barber',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Omen:** Equip a 1/2 Dagger.',
    attack: 3,
    health: 2,
    tribe: 'pirate',
    battlecry: [{ kind: 'equipWeapon', cardId: 'rogue_whetted_dagger' }],
  },

  /**
   * Defias Ringleader — 2/2. Battlecry: deal 2 damage to a minion.
   * SI:7-style pinpoint removal on a tempo body.
   */
  {
    id: 'rogue_defias_ringleader',
    name: 'Defias Ringleader',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Omen:** Deal 2 damage to a minion.',
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
   * Fan of Knives — deal 1 damage to all enemies, draw a card.
   */
  {
    id: 'rogue_fan_of_knives',
    name: 'Fan of Knives',
    cost: 3,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Deal 1 damage to all enemies. Draw a card.',
    spell: [
      { kind: 'damage', amount: 1, target: 'allEnemyCharacters' },
      { kind: 'draw', count: 1 },
    ],
  },

  /**
   * SI:7 Agent — 3/3. Battlecry: deal 2 damage.
   * Iconic rogue value minion.
   */
  {
    id: 'rogue_si7_agent',
    name: 'SI:7 Agent',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Omen:** Deal 2 damage.',
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
   * Shadow Agent — 3/4. **Stealth**. Deathrattle: summon two 1/1 Shadows with Stealth.
   */
  {
    id: 'rogue_shadow_agent',
    name: 'Shadow Agent',
    cost: 4,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Stealth.** **Haunt:** Summon two 1/1 Shadows with Stealth.',
    attack: 3,
    health: 4,
    tribe: 'none',
    keywords: ['stealth'],
    deathrattle: [{ kind: 'summon', token: 'rogue_shadow', count: 2 }],
  },

  /**
   * Blade Flurry — destroy your weapon, deal its Attack to all enemies.
   * Approximated as: deal 3 damage to all enemies (weapon-like payoff without
   * true weapon-check; engine has no weapon query in EffectSpec).
   * (Recosted 4 -> 5: with the destroy-your-weapon cost dropped, 3 damage to
   * all enemies including face sits at the 5-mana AoE anchor.)
   */
  {
    id: 'rogue_blade_flurry',
    name: 'Blade Flurry',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Deal 3 damage to all enemies.',
    spell: [{ kind: 'damage', amount: 3, target: 'allEnemyCharacters' }],
  },

  // =========================================================================
  // 1–5 COST
  // =========================================================================

  /**
   * Leeching Poison — give your hero +2 Attack and Lifesteal this turn.
   * Approximated as hero attack + a heal (lifesteal equivalent = gain 4 armor).
   * (Recosted 5 -> 3: +3 Attack ≈ 1.5 mana and 4 Armor ≈ 1.3 mana, so 5 was
   * ~2 mana of value short of its cost.)
   */
  {
    id: 'rogue_leeching_poison',
    name: 'Leeching Poison',
    cost: 3,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'Give your hero +3 Attack this turn. Gain 4 Armor.',
    spell: [
      { kind: 'heroAttackThisTurn', amount: 3 },
      { kind: 'gainArmor', amount: 4 },
    ],
  },

  /**
   * Shadowstep — add 2 Lackeys to your hand.
   * Original bounces a friendly minion; approximated as gaining cheap tempo
   * resources since bounce is not in the engine.
   * (Recosted 5 -> 1: two 1/1 Lackeys in hand are worth ~1-1.5 mana of value,
   * nowhere near a 5-cost.)
   */
  {
    id: 'rogue_shadowstep',
    name: 'Shadowstep',
    cost: 1,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Add two 1/1 Lackeys to your hand.',
    spell: [
      { kind: 'addCardToHand', cardId: 'rogue_lackey', count: 2 },
    ],
  },

  /**
   * Kingsbane — 1/3 Pirate weapon. Equip it.
   * Signature rogue blade with Rush minions theme.
   */
  {
    id: 'rogue_kingsbane',
    name: 'Kingsbane',
    cost: 5,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: '**Rush.** **Omen:** Equip a 2/3 Blade.',
    attack: 3,
    health: 4,
    tribe: 'pirate',
    keywords: ['rush'],
    battlecry: [{ kind: 'equipWeapon', cardId: 'rogue_kingsbane_blade' }],
  },

  // =========================================================================
  // 5-COST WEAPON TOKEN for Kingsbane
  // =========================================================================
  {
    id: 'rogue_kingsbane_blade',
    name: "Kingsbane Blade",
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
   * Vanish — original returns all minions to hand; approximated as an AoE
   * board clear + a cantrip since return-to-hand is not in EffectSpec.
   * (Trimmed from 4 damage + draw 2: that was ~10 mana of value — Flamestrike
   * plus Arcane Intellect — at 6. 3 damage + draw 1 fits the 6-mana AoE band.)
   */
  {
    id: 'rogue_vanish',
    name: 'Vanish',
    cost: 6,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Deal 3 damage to all enemy minions. Draw a card.',
    spell: [
      { kind: 'damage', amount: 3, target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
  },

  // =========================================================================
  // 7-COST
  // =========================================================================

  /**
   * Edwin VanCleef — 2/2. Battlecry: +2/+2 for each other card played this turn.
   * Approximated as an effective 7/7 Charge body for 7 (the engine can't count
   * play history, so the scaling is baked into a fixed battlecry buff).
   */
  {
    id: 'rogue_edwin_vancleef',
    name: 'Edwin VanCleef',
    cost: 7,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'legendary',
    text: '**Charge.** **Omen:** Gain +3/+3.',
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
   * Spectral Cutlass — 5/6 minion. Battlecry: deal 2 damage to all enemies.
   * (Trimmed the "draw 2 cards" rider: a 5/6 body plus AoE plus draw was
   * ~2 mana over an 8-cost budget. Body + Consecration-sized battlecry fits.)
   */
  {
    id: 'rogue_spectral_cutlass',
    name: 'Spectral Cutlass',
    cost: 8,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: '**Omen:** Deal 2 damage to all enemies.',
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
   * Patient Assassin — 1/1 with Stealth and Poisonous.
   * (Trimmed the recurring "start of turn: +1/+1 to your other minions"
   * trigger: Stealth + Poisonous already fills the 2-mana budget, and a
   * protected recurring team buff was several mana of free value on top.
   * Now matches the real card.)
   */
  {
    id: 'rogue_patient_assassin',
    name: 'Patient Assassin',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'epic',
    text: '**Stealth. Poisonous.**',
    attack: 1,
    health: 1,
    tribe: 'none',
    keywords: ['stealth', 'poisonous'],
  },

  // =========================================================================
  // 9-COST FINISHER
  // =========================================================================

  /**
   * Heistbaron Togwaggle — 5/5. Battlecry: add 3 random spells to your hand.
   * Big late-game value finisher.
   */
  {
    id: 'rogue_togwaggle',
    name: 'Heistbaron Togwaggle',
    cost: 9,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'legendary',
    text: '**Omen:** Add 3 random spells to your hand.',
    attack: 5,
    health: 5,
    tribe: 'none',
    // Pool defaults to Rogue + neutral spells per the generation class lock.
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

  /** Cutlass — 3/2 weapon token equipped by Tinker's Sharpsword Oil. */
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
   * Preparation — cheap rogue cycle spell: draw 2 cards.
   * (Reworked: the old version drew 2 AND reduced the cost of the whole hand
   * by (1) for 1 mana — ~4 mana of value, and the engine can't scope the
   * reduction to just the drawn cards as the text promised. Trimmed to pure
   * draw at 2 — a slightly pushed Arcane Intellect as rogue cycle identity.)
   */
  {
    id: 'rogue_preparation',
    name: 'Preparation',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'epic',
    text: 'Draw 2 cards.',
    spell: [
      { kind: 'draw', count: 2 },
    ],
  },

  /**
   * Southsea Deckhand — 2/1 Pirate. While you have a weapon equipped, has Charge.
   * Approximated as a 2/1 Pirate with unconditional Charge; with the weapon
   * condition dropped it is recosted 1 -> 2 (the Bluegill Warrior anchor).
   */
  {
    id: 'rogue_southsea_deckhand',
    name: 'Southsea Deckhand',
    cost: 2,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'common',
    text: '**Charge**',
    attack: 2,
    health: 1,
    tribe: 'pirate',
    keywords: ['charge'],
  },

  // ---- 2–3 COST ADDITIONS ----

  /**
   * Cold Blood — give a minion +4 Attack.
   * Great burst enabler / reach card. (Real card is +2, Combo +4; the engine
   * has no Combo, so this is the unconditional +4 at 2 mana.)
   */
  {
    id: 'rogue_cold_blood',
    name: 'Cold Blood',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Give a minion +4 Attack.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'buff', atk: 4, health: 0, target: 'chosenTarget' }],
  },

  /**
   * Underbelly Fence — 2/3 Pirate. Battlecry: discover a spell.
   * Pirate/tempo synergy with card selection.
   * (Recosted 2 -> 3: vanilla 2-drop stats plus a free discover (~1.5 mana)
   * was over budget. Discover pool defaults to Rogue + neutral spells per
   * the generation class lock.)
   */
  {
    id: 'rogue_underbelly_fence',
    name: 'Underbelly Fence',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Omen:** Discover a spell.',
    attack: 2,
    health: 3,
    tribe: 'pirate',
    battlecry: [{ kind: 'discover', pool: 'spell' }],
  },

  // ---- 3–4 COST ADDITIONS ----

  /**
   * Questing Adventurer — 2/2. At the end of your turn, gain +1/+1
   * for each card played this turn (approximated as +2/+2 per end of turn).
   */
  {
    id: 'rogue_questing_adventurer',
    name: 'Questing Adventurer',
    cost: 3,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'At the end of your turn, gain +2/+2.',
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
   * Tomb Pillager — 5/4. Deathrattle: add a Coin to your hand.
   * Classic combo/ramp enabler via death.
   * (Recosted 3 -> 4 to match the real card: 5/4 + a Coin is ~2 mana over a
   * 3-cost budget.)
   */
  {
    id: 'rogue_tomb_pillager',
    name: 'Tomb Pillager',
    cost: 4,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Haunt:** Add a Coin to your hand.',
    attack: 5,
    health: 4,
    tribe: 'none',
    deathrattle: [{ kind: 'gainCoin', count: 1 }],
  },

  // ---- 4–5 COST ADDITIONS ----

  /**
   * Tinker's Sharpsword Oil — equip a 3/2 Cutlass and buff a friendly minion +3 Attack.
   * Weapon + board buff combo at 4 mana.
   */
  {
    id: 'rogue_tinkers_sharpsword_oil',
    name: "Tinker's Sharpsword Oil",
    cost: 4,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Give a friendly minion +3 Attack. Equip a 3/2 Cutlass.',
    targeted: true,
    targetFilter: 'friendlyMinions',
    spell: [
      { kind: 'buff', atk: 3, health: 0, target: 'chosenTarget' },
      { kind: 'equipWeapon', cardId: 'rogue_cutlass' },
    ],
  },

  /**
   * Ethereal Peddler — 4/5. Battlecry: reduce the cost of cards in your hand by (1).
   * Board presence + hand-wide cost reduction.
   * (Was a 4-mana 5/6: over-statted body plus ~2 mana of hand discount. The
   * real card's "cards from other classes" condition isn't modelled, so the
   * unconditional version runs 5 mana at 4/5 — the Leyline Manipulator rate.)
   */
  {
    id: 'rogue_ethereal_peddler',
    name: 'Ethereal Peddler',
    cost: 5,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'rare',
    text: '**Omen:** Reduce the Cost of cards in your hand by (1).',
    attack: 4,
    health: 5,
    tribe: 'none',
    battlecry: [{ kind: 'reduceCostInHand', amount: 1, filter: 'all' }],
  },

  // ---- 5-COST ADDITIONS ----

  /**
   * Sprint — draw 4 cards.
   * Rogue's classic refill/draw spell for control/value builds.
   */
  {
    id: 'rogue_sprint',
    name: 'Sprint',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Draw 4 cards.',
    spell: [{ kind: 'draw', count: 4 }],
  },

  // ---- 2-COST ADDITIONS (CONTINUED) ----

  /**
   * Conceal — give all friendly minions Stealth.
   * Board protection / stealth payoff spell.
   * Approximated as a permanent Stealth grant (engine does not track "until
   * next turn" expiry), and the text now matches that behaviour.
   * (Recosted 6 -> 2: Stealth is ~0.5 mana per minion, so 6 was several mana
   * of value short.)
   */
  {
    id: 'rogue_conceal',
    name: 'Conceal',
    cost: 2,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'common',
    text: 'Give your minions **Stealth**.',
    spell: [{ kind: 'giveKeyword', keyword: 'stealth', target: 'friendlyMinions' }],
  },

  // ---- 5-COST ADDITIONS (CONTINUED) ----

  /**
   * Raiding Party — draw 2 cards and equip a 3/2 Cutlass.
   * Pirates / weapon synergy value card.
   * (Recosted 7 -> 5: draw 2 (~3 mana) + a 3/2 weapon (~2.5 mana at rogue
   * weapon rates) is ~5.5 mana of value, well short of a 7-cost.)
   */
  {
    id: 'rogue_raiding_party',
    name: 'Raiding Party',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'rare',
    text: 'Draw 2 cards. Equip a 3/2 Cutlass.',
    spell: [
      { kind: 'draw', count: 2 },
      { kind: 'equipWeapon', cardId: 'rogue_cutlass' },
    ],
  },

  // ---- 9-COST LEGENDARY FINISHER ----

  /**
   * Valeera the Hollow — 3/9 with Stealth. Battlecry: deal 2 damage to all enemies.
   * Legendary Rogue finisher: a hard-to-remove body plus an AoE swing.
   * (Trimmed from "3 damage to all enemies + draw 2 + hero +3 Attack" at 8:
   * that battlecry alone was ~10 mana of effects on top of a 6-mana body.
   * Recosted to 9 with a single Consecration-sized battlecry.)
   */
  {
    id: 'rogue_valeera_the_hollow',
    name: 'Valeera the Hollow',
    cost: 9,
    type: 'minion',
    cardClass: 'rogue',
    rarity: 'legendary',
    text: '**Stealth.** **Omen:** Deal 2 damage to all enemies.',
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
