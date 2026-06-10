import type { CardDef } from '../../game/types'

/**
 * Mage class cards — ~30 collectible cards spanning the curve (1-10 mana),
 * plus token cards summoned by class cards.
 * Theme: burn/spell damage — direct-damage spells, Spell Damage minions, board clears.
 * Encoded per EFFECTSPEC.md conventions.
 */
export const mageCards: CardDef[] = [
  // =========================================================================
  // TOKEN cards (summoned by class cards — not collectible)
  // =========================================================================

  /**
   * Water Elemental token — 3/6 Elemental.
   * Reserved for elemental-summoning treasures/effects (not currently
   * referenced by a collectible card).
   */
  {
    id: 'mage_water_elemental_token',
    name: 'Water Elemental',
    cost: 4,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'common',
    text: '',
    attack: 3,
    health: 6,
    tribe: 'elemental',
    token: true,
  },

  /**
   * Mirror Image token — 0/2 Taunt. Summoned by Mirror Image spell.
   */
  {
    id: 'mage_mirror_image_token',
    name: 'Mirror Image',
    cost: 0,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'free',
    text: '**Ward**',
    attack: 0,
    health: 2,
    tribe: 'none',
    keywords: ['taunt'],
    token: true,
  },

  // =========================================================================
  // COLLECTIBLE cards
  // =========================================================================

  // --- 1-cost ---
  /**
   * Arcane Missiles — deal 3 damage randomly split among enemies.
   * (Approximated as deal 1 to each of three random enemies.)
   */
  {
    id: 'mage_arcane_missiles',
    name: 'Arcane Missiles',
    cost: 1,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 3 damage randomly split among all enemies.',
    spell: [
      { kind: 'damage', amount: 1, target: 'randomEnemy' },
      { kind: 'damage', amount: 1, target: 'randomEnemy' },
      { kind: 'damage', amount: 1, target: 'randomEnemy' },
    ],
  },

  /**
   * Mirror Image — summon two 0/2 minions with Taunt.
   */
  {
    id: 'mage_mirror_image',
    name: 'Mirror Image',
    cost: 1,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Summon two 0/2 minions with Ward.',
    spell: [{ kind: 'summon', token: 'mage_mirror_image_token', count: 2 }],
  },

  // --- 2-cost ---
  /**
   * Frostbolt — deal 3 damage to a target. (Freeze approximated away;
   * the engine has no Freeze mechanic — plain 3 damage matches the 2-mana
   * burn anchor.)
   */
  {
    id: 'mage_frostbolt',
    name: 'Frostbolt',
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 3 damage to a character.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 3, target: 'chosenTarget' }],
  },

  /**
   * Mana Wyrm — 1/3. Whenever you cast a spell, gain +1 Attack.
   * (onPlaySpell trigger gives self +1/+0.)
   */
  {
    id: 'mage_mana_wyrm',
    name: 'Mana Wyrm',
    cost: 2,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Whenever you cast a spell, gain +1 Attack.',
    attack: 1,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }],
        condition: 'cardIsSpell',
      },
    ],
  },

  /**
   * Sorcerer's Apprentice — 2-mana 3/2. Your spells cost (1) less.
   */
  {
    id: 'mage_sorcerers_apprentice',
    name: "Sorcerer's Apprentice",
    cost: 2,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Your spells cost (1) less.',
    attack: 3,
    health: 2,
    tribe: 'none',
    auras: [{ kind: 'costReduction', amount: 1, filter: 'spell' }],
  },

  /**
   * Arcane Explosion — deal 1 damage to all enemy minions.
   * (Recosted 3 -> 2 to match the real card and the 1-damage AoE anchor;
   * the cheap-ping niche next to Frost Nova and Blizzard.)
   */
  {
    id: 'mage_arcane_explosion',
    name: 'Arcane Explosion',
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 1 damage to all enemy minions.',
    spell: [{ kind: 'damage', amount: 1, target: 'enemyMinions' }],
  },

  // --- 3-cost ---
  /**
   * Arcane Intellect — draw 2 cards.
   */
  {
    id: 'mage_arcane_intellect',
    name: 'Arcane Intellect',
    cost: 3,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Draw 2 cards.',
    spell: [{ kind: 'draw', count: 2 }],
  },

  /**
   * Cone of Cold — deal 2 damage to an enemy minion and 1 to all other enemies.
   * (Freeze approximated as splash damage; `otherEnemies` includes the enemy
   * hero, which the text reflects. Recosted 5 -> 3 — at 5 it was ~2 mana under
   * the AoE anchors.)
   */
  {
    id: 'mage_cone_of_cold',
    name: 'Cone of Cold',
    cost: 3,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Deal 2 damage to an enemy minion and 1 damage to all other enemies.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'damage', amount: 1, target: 'otherEnemies' },
    ],
  },

  /**
   * Dalaran Mage — 1/4. **Spell Damage +1.**
   */
  {
    id: 'mage_dalaran_mage',
    name: 'Dalaran Mage',
    cost: 3,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'free',
    text: '**Spell Damage +1.**',
    attack: 1,
    health: 4,
    tribe: 'none',
    spellDamage: 1,
  },

  // --- 4-cost ---
  /**
   * Fireball — deal 6 damage.
   */
  {
    id: 'mage_fireball',
    name: 'Fireball',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 6 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 6, target: 'chosenTarget' }],
  },

  /**
   * Ethereal Arcanist — 3/3. At the end of your turn, gain +2/+2.
   * (Real card's "if you control a Secret" condition dropped — the engine has
   * no secrets — so the growth is unconditional; the Spell Damage +1 rider was
   * removed to pay for that upgrade.)
   */
  {
    id: 'mage_ethereal_arcanist',
    name: 'Ethereal Arcanist',
    cost: 4,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'At the end of your turn, gain +2/+2.',
    attack: 3,
    health: 3,
    tribe: 'none',
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'buff', atk: 2, health: 2, target: 'self' }],
      },
    ],
  },

  /**
   * Water Elemental — 3/6 Elemental. Vanilla (Freeze approximated away).
   */
  {
    id: 'mage_water_elemental',
    name: 'Water Elemental',
    cost: 4,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'free',
    text: '',
    attack: 3,
    health: 6,
    tribe: 'elemental',
  },

  // --- 5-cost ---
  /**
   * Archmage — 4/7. **Spell Damage +1.**
   */
  {
    id: 'mage_archmage',
    name: 'Archmage',
    cost: 5,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: '**Spell Damage +1.**',
    attack: 4,
    health: 7,
    tribe: 'none',
    spellDamage: 1,
  },

  /**
   * Ethereal Conjurer — 5/3. Battlecry: Discover a spell.
   * (Discover pool defaults to Mage + neutral spells per the generation
   * class lock.)
   */
  {
    id: 'mage_ethereal_conjurer',
    name: 'Ethereal Conjurer',
    cost: 5,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'common',
    text: '**Omen:** Discover a spell.',
    attack: 5,
    health: 3,
    tribe: 'none',
    battlecry: [{ kind: 'discover', pool: 'spell' }],
  },

  // --- 6-cost ---
  /**
   * Blizzard — deal 2 damage to all enemy minions. Draw a card.
   * (Freeze approximated as the bonus draw; this is the 6-mana AoE anchor.)
   */
  {
    id: 'mage_blizzard',
    name: 'Blizzard',
    cost: 6,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Deal 2 damage to all enemy minions. Draw a card.',
    spell: [
      { kind: 'damage', amount: 2, target: 'enemyMinions' },
      { kind: 'draw', count: 1 },
    ],
  },

  // --- 7-cost ---
  /**
   * Flamestrike — deal 4 damage to all enemy minions.
   */
  {
    id: 'mage_flamestrike',
    name: 'Flamestrike',
    cost: 7,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Deal 4 damage to all enemy minions.',
    spell: [{ kind: 'damage', amount: 4, target: 'enemyMinions' }],
  },

  // --- 8-cost ---
  /**
   * Medivh, the Guardian — 7/7. Battlecry: equip a 1/3 Atiesh weapon.
   * After you cast a spell, add a random minion to your hand.
   * (Approximation: the real card SUMMONS a minion of the spell's cost; this
   * engine adds a random minion CARD to hand instead — weaker, so Medivh costs
   * 8 like the real card rather than 9. The hand pool defaults to
   * Mage + neutral minions per the generation class lock.)
   */
  {
    id: 'mage_medivh',
    name: 'Medivh, the Guardian',
    cost: 8,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'legendary',
    text: '**Omen:** Equip a 1/3 Atiesh. After you cast a spell, add a random minion to your hand.',
    attack: 7,
    health: 7,
    tribe: 'none',
    battlecry: [{ kind: 'equipWeapon', cardId: 'mage_atiesh' }],
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'addRandomCardToHand', pool: 'minion', count: 1 }],
        condition: 'cardIsSpell',
      },
    ],
  },

  /**
   * Atiesh — 1/3 weapon for Medivh.
   */
  {
    id: 'mage_atiesh',
    name: 'Atiesh',
    cost: 0,
    type: 'weapon',
    cardClass: 'mage',
    rarity: 'legendary',
    text: 'Equip when Medivh enters play.',
    attack: 1,
    durability: 3,
    token: true,
  },

  // --- 10-cost ---
  /**
   * Pyroblast — deal 10 damage. (Iconic mage finisher; 10 mana = 10 damage anchor.)
   */
  {
    id: 'mage_pyroblast',
    name: 'Pyroblast',
    cost: 10,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Deal 10 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 10, target: 'chosenTarget' }],
  },

  // =========================================================================
  // ADDITIONAL COLLECTIBLE cards — extending curve and archetype coverage
  // =========================================================================

  // --- 1-cost ---
  /**
   * Ice Lance — deal 2 damage to a single target.
   * (Classic: 4 damage only if the target is Frozen, else Freeze; the engine
   * has no Freeze, so this is re-tuned to the unconditional 1-mana burn
   * anchor: 2 damage to any character.)
   */
  {
    id: 'mage_ice_lance',
    name: 'Ice Lance',
    cost: 1,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Deal 2 damage to a character.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
  },

  // --- 2-cost ---
  /**
   * Ice Block Scroll — gain 8 Armor. Represents the protective "Ice Block" fantasy
   * as emergency survival tool for control mage. (Slightly above the 2.5
   * armor-per-mana anchor, kept as the dedicated survival card.)
   */
  {
    id: 'mage_ice_block_scroll',
    name: 'Ice Block Scroll',
    cost: 2,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Gain 8 Armor.',
    spell: [{ kind: 'gainArmor', amount: 8 }],
  },

  // --- 3-cost ---
  /**
   * Flamewaker — 2/4. After you cast a spell, deal 1 damage to two random enemies.
   * Strong spell-synergy body for tempo/burn builds.
   */
  {
    id: 'mage_flamewaker',
    name: 'Flamewaker',
    cost: 3,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'After you cast a spell, deal 1 damage to two random enemies.',
    attack: 2,
    health: 4,
    tribe: 'none',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [
          { kind: 'damage', amount: 1, target: 'randomEnemy' },
          { kind: 'damage', amount: 1, target: 'randomEnemy' },
        ],
        condition: 'cardIsSpell',
      },
    ],
  },

  // --- 4-cost ---
  /**
   * Frost Nova — deal 2 damage to all enemy minions.
   * (Freeze approximated as damage. Previously 3 mana with a bonus draw, which
   * was strictly better than Blizzard — the draw was trimmed and the cost set
   * to 4 to match the 2-damage AoE anchor; niche: mid-cost board sweep.)
   */
  {
    id: 'mage_frost_nova',
    name: 'Frost Nova',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'common',
    text: 'Deal 2 damage to all enemy minions.',
    spell: [{ kind: 'damage', amount: 2, target: 'enemyMinions' }],
  },

  /**
   * Polymorph — silence a minion and set it to 1/1.
   * (Approximates "Transform a minion into a 1/1 Sheep": the engine cannot
   * replace a minion, so it silences away abilities/buffs then sets stats
   * to 1/1.)
   */
  {
    id: 'mage_polymorph',
    name: 'Polymorph',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'free',
    text: 'Silence a minion and set its Attack and Health to 1.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'silence', target: 'chosenTarget' },
      { kind: 'setStats', atk: 1, health: 1, target: 'chosenTarget' },
    ],
  },

  /**
   * Counterspell — draw 2 cards and gain 3 Armor.
   * (Secret approximated as proactive card advantage + defensive armor gain,
   * representing the "we prevented something big" value. Recosted 3 -> 4 —
   * at 3 it was strictly better than Arcane Intellect.)
   */
  {
    id: 'mage_counterspell',
    name: 'Counterspell',
    cost: 4,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Draw 2 cards. Gain 3 Armor.',
    spell: [
      { kind: 'draw', count: 2 },
      { kind: 'gainArmor', amount: 3 },
    ],
  },

  // --- 5-cost ---
  /**
   * Vaporize — destroy a minion.
   * (Classic: a Secret that destroys a minion attacking your hero; approximated
   * as unconditional single-target destroy, so it is costed at the Assassinate
   * anchor of 5 rather than its original 3.)
   */
  {
    id: 'mage_vaporize',
    name: 'Vaporize',
    cost: 5,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'rare',
    text: 'Destroy a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },

  /**
   * Leyline Manipulator — 4/5. Battlecry: Reduce the cost of cards in your hand by (1).
   * (Real card only discounts cards that didn't start in your deck; the engine
   * has no such condition, so the unconditional version is toned down to (1)
   * and recosted 4 -> 5.)
   */
  {
    id: 'mage_leyline_manipulator',
    name: 'Leyline Manipulator',
    cost: 5,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'rare',
    text: '**Omen:** Reduce the Cost of cards in your hand by (1).',
    attack: 4,
    health: 5,
    tribe: 'none',
    battlecry: [{ kind: 'reduceCostInHand', amount: 1, filter: 'all' }],
  },

  /**
   * Cabalist's Tome — add 3 random Mage spells to your hand.
   * Key value engine for spell-heavy archetypes. (Text names the class, so the
   * pool is locked to Mage via fromClass.)
   */
  {
    id: 'mage_cabalists_tome',
    name: "Cabalist's Tome",
    cost: 5,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Add 3 random Mage spells to your hand.',
    spell: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 3, fromClass: 'mage' }],
  },

  // --- 6-cost ---
  /**
   * Nexus Champion Saraad — 4/5. Elemental. Spell Damage +2. A large mid-range
   * body that dramatically powers up your remaining burn spells.
   */
  {
    id: 'mage_nexus_champion',
    name: 'Nexus Champion Saraad',
    cost: 6,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'legendary',
    text: '**Spell Damage +2.**',
    attack: 4,
    health: 5,
    tribe: 'elemental',
    spellDamage: 2,
  },

  /**
   * Glacial Mysteries — discover a spell; then add 2 random Mage spells
   * to your hand. (Recosted 8 -> 6 to match the generation anchors — one
   * mana above Cabalist's Tome for swapping a random spell into a discovered
   * one. The discover pool uses the default Mage + neutral class lock; the
   * random spells are locked to Mage because the text names the class.)
   */
  {
    id: 'mage_glacial_mysteries',
    name: 'Glacial Mysteries',
    cost: 6,
    type: 'spell',
    cardClass: 'mage',
    rarity: 'epic',
    text: 'Discover a spell. Add 2 random Mage spells to your hand.',
    spell: [
      { kind: 'discover', pool: 'spell' },
      { kind: 'addRandomCardToHand', pool: 'spell', count: 2, fromClass: 'mage' },
    ],
  },

  // --- 7-cost ---
  /**
   * Archmage Antonidas — 5/7. Whenever you cast a spell, add a Fireball to your hand.
   * Legendary value engine and finisher for spell-heavy decks.
   */
  {
    id: 'mage_antonidas',
    name: 'Archmage Antonidas',
    cost: 7,
    type: 'minion',
    cardClass: 'mage',
    rarity: 'legendary',
    text: 'Whenever you cast a spell, add a Fireball to your hand.',
    attack: 5,
    health: 7,
    tribe: 'none',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'addCardToHand', cardId: 'mage_fireball', count: 1 }],
        condition: 'cardIsSpell',
      },
    ],
  },
]
