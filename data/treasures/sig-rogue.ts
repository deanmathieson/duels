import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Token weapon cards embedded in signature treasures
// ---------------------------------------------------------------------------

/**
 * Shadowblade — 3/2 weapon.
 * After your hero attacks, deal 2 damage to a random enemy (afterAttack trigger).
 * (Was 3/4: ~5.5 mana of weapon stats by the 2.2x anchor before the trigger.
 * Trimmed to 3/2 at 3 — the attack ping is the ~1 mana signature push.)
 */
const shadowbladeWeapon: CardDef = {
  id: 'sig_rogue_shadowblade_card',
  name: 'Shadowblade',
  cost: 3,
  type: 'weapon',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'After your hero attacks, deal 2 damage to a random enemy.',
  attack: 3,
  durability: 2,
  triggers: [
    {
      event: 'afterAttack',
      effects: [{ kind: 'damage', amount: 2, target: 'randomEnemy' }],
    },
  ],
  token: true,
}

/**
 * Thieves' Canvas — 3-mana spell.
 * Add 2 random spells from any class to your hand. Draw a card.
 * (Burgle flavour: the engine can't express "the opponent's class", so the
 * pool is fromClass 'any' and the text says "from any class". Recosted
 * 2 -> 3: two generated spells + a cantrip is ~4 mana of value — keeps it
 * at the ~1 mana signature push.)
 */
const thievesCanvasCard: CardDef = {
  id: 'sig_rogue_thieves_canvas_card',
  name: "Thieves' Canvas",
  cost: 3,
  type: 'spell',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'Add 2 random spells from any class to your hand. Draw a card.',
  spell: [
    { kind: 'addRandomCardToHand', pool: 'spell', count: 2, fromClass: 'any' },
    { kind: 'draw', count: 1 },
  ],
  token: true,
}

/**
 * Cloak of Shadows — 3-mana spell.
 * Original gives your hero Stealth; hero-stealth isn't in the engine, so it is
 * approximated as 5 Armor plus a 1-damage AoE.
 * (Recosted 0 -> 3: ~4 mana of value for free was far past the ~1 mana
 * signature push.)
 */
const cloakOfShadowsCard: CardDef = {
  id: 'sig_rogue_cloak_of_shadows_card',
  name: 'Cloak of Shadows',
  cost: 3,
  type: 'spell',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'Gain 5 Armor and deal 1 damage to all enemies.',
  spell: [
    { kind: 'gainArmor', amount: 5 },
    { kind: 'damage', amount: 1, target: 'allEnemyCharacters' },
  ],
  token: true,
}

/**
 * Pillage — 6-mana spell.
 * Deal 2 damage to all enemies. Draw 2 cards.
 * (Was 4 mana for 3 damage + draw 2 — ~9 mana of value. Trimmed to 2 damage
 * and recosted to 6, keeping it ~1 mana above curve as a signature.)
 */
const pillageCard: CardDef = {
  id: 'sig_rogue_pillage_card',
  name: 'Pillage',
  cost: 6,
  type: 'spell',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'Deal 2 damage to all enemies. Draw 2 cards.',
  spell: [
    { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
    { kind: 'draw', count: 2 },
  ],
  token: true,
}

/**
 * Kingpin — 4/4. Rush. Battlecry: summon three 1/1 Lackeys.
 * A powerful tempo threat that floods the board.
 * (Was 5/5: a full vanilla Rush body plus ~2.5 mana of tokens. Trimmed to
 * 4/4 so the Lackey flood is the ~1 mana signature push.)
 */
const kingpinCard: CardDef = {
  id: 'sig_rogue_kingpin_card',
  name: 'Kingpin',
  cost: 5,
  type: 'minion',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: '**Rush.** **Battlecry:** Summon three 1/1 Lackeys.',
  attack: 4,
  health: 4,
  tribe: 'pirate',
  keywords: ['rush'],
  battlecry: [{ kind: 'summon', token: 'rogue_lackey', count: 3 }],
  token: true,
}

/**
 * All 5 signature treasures for Infiltrator Lilian.
 */
export const rogueSignatureTreasures: TreasureDef[] = [
  /**
   * Shadowblade — equip a 3/2 weapon that pings a random enemy after each attack.
   */
  {
    id: 'sig_rogue_shadowblade',
    name: 'Shadowblade',
    kind: 'signature',
    text: 'Weapon (3/2). After your hero attacks, deal 2 damage to a random enemy.',
    card: shadowbladeWeapon,
    tags: ['rogue-good'],
  },

  /**
   * Thieves' Canvas — a 3-mana spell that adds 2 random spells from any class
   * and draws a card.
   */
  {
    id: 'sig_rogue_thieves_canvas',
    name: "Thieves' Canvas",
    kind: 'signature',
    text: "Add 2 random spells from any class to your hand. Draw a card.",
    card: thievesCanvasCard,
    tags: ['rogue-good'],
  },

  /**
   * Cloak of Shadows — 3-mana spell: gain 5 Armor and deal 1 damage to all enemies.
   */
  {
    id: 'sig_rogue_cloak_of_shadows',
    name: 'Cloak of Shadows',
    kind: 'signature',
    text: 'Gain 5 Armor and deal 1 damage to all enemies.',
    card: cloakOfShadowsCard,
    tags: ['rogue-good'],
  },

  /**
   * Pillage — 6-mana board clear + draw engine.
   */
  {
    id: 'sig_rogue_pillage',
    name: 'Pillage',
    kind: 'signature',
    text: 'Deal 2 damage to all enemies. Draw 2 cards.',
    card: pillageCard,
    tags: ['rogue-good'],
  },

  /**
   * Kingpin — a 5-mana 4/4 Rush Pirate that floods the board with Lackeys.
   */
  {
    id: 'sig_rogue_kingpin',
    name: 'Kingpin',
    kind: 'signature',
    text: '4/4 Pirate. Rush. Battlecry: Summon three 1/1 Lackeys.',
    card: kingpinCard,
    tags: ['rogue-good'],
  },
]
