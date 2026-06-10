import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Token weapon cards embedded in signature treasures
// ---------------------------------------------------------------------------

/**
 * The Gossip's Tongue — 3/2 weapon.
 * After your hero attacks, deal 2 damage to a random enemy (afterAttack trigger).
 * (Was 3/4: ~5.5 mana of weapon stats by the 2.2x anchor before the trigger.
 * Trimmed to 3/2 at 3 — the attack ping is the ~1 mana signature push.)
 */
const shadowbladeWeapon: CardDef = {
  id: 'sig_rogue_shadowblade_card',
  name: "The Gossip's Tongue",
  cost: 3,
  type: 'weapon',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'After your hero attacks, deal 2 damage to a random enemy.',
  flavor: 'Sharpest edge in the county, and it always draws blood from a bystander.',
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
 * The Widow's Letter-Opener — 2/3 weapon.
 * After your hero attacks, trigger a random friendly minion's Haunt.
 * (Weapon stats are deliberately lean — the trigger is the treasure.)
 */
const letterOpenerWeapon: CardDef = {
  id: 'sig_rogue_letter_opener_card',
  name: "The Widow's Letter-Opener",
  cost: 3,
  type: 'weapon',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: "After your hero attacks, trigger a random friendly minion's **Haunt**.",
  flavor: 'She opens correspondence, throats, and probate disputes — in that order.',
  attack: 2,
  durability: 3,
  triggers: [
    {
      event: 'afterAttack',
      effects: [{ kind: 'triggerDeathrattles', target: 'randomFriendlyDeathrattleMinion' }],
    },
  ],
  token: true,
}

/**
 * The Swindler's Satchel — 2-mana spell.
 * Add 2 random spells from any class to your hand. Draw a card.
 * (Stolen-goods flavour: the engine can't express "the opponent's class", so
 * the pool is fromClass 'any' and the text says "from any class". At 2 mana
 * the value play is tempo-positive — at 3 it never beat the weapon pick.)
 */
const thievesCanvasCard: CardDef = {
  id: 'sig_rogue_thieves_canvas_card',
  name: "The Swindler's Satchel",
  cost: 2,
  type: 'spell',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'Add 2 random spells from any class to your hand. Draw a card.',
  flavor: 'Lined with sermons, deeds, and love letters. None of them addressed to the bearer.',
  spell: [
    { kind: 'addRandomCardToHand', pool: 'spell', count: 2, fromClass: 'any' },
    { kind: 'draw', count: 1 },
  ],
  token: true,
}

/**
 * The Mourner's Veil — 2-mana spell.
 * Hero-stealth isn't in the engine, so it is approximated as 5 Armor plus a
 * 1-damage AoE.
 * (At 3 the armor+ping was exactly on curve — zero treasure push. 2 restores
 * the ~1 mana signature premium.)
 */
const cloakOfShadowsCard: CardDef = {
  id: 'sig_rogue_cloak_of_shadows_card',
  name: "The Mourner's Veil",
  cost: 2,
  type: 'spell',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'Gain 5 Armor and deal 1 damage to all enemies.',
  flavor: 'Black lace, second-hand. Worn by every widow in Hollowmoor — some of them practising.',
  spell: [
    { kind: 'gainArmor', amount: 5 },
    { kind: 'damage', amount: 1, target: 'allEnemyCharacters' },
  ],
  token: true,
}

/**
 * Ransack the Vestry — 5-mana spell.
 * Deal 2 damage to all enemies. Draw 2 cards.
 * (2 AoE ≈ 3 mana + draw 2 ≈ 3 mana: at 6 it carried no treasure premium at
 * all; 5 puts it ~1 above curve like the other signatures.)
 */
const pillageCard: CardDef = {
  id: 'sig_rogue_pillage_card',
  name: 'Ransack the Vestry',
  cost: 5,
  type: 'spell',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: 'Deal 2 damage to all enemies. Draw 2 cards.',
  flavor: "The vicar slept right through it. So did the vicar's wife — in a different house.",
  spell: [
    { kind: 'damage', amount: 2, target: 'allEnemyCharacters' },
    { kind: 'draw', count: 2 },
  ],
  token: true,
}

/**
 * The Gutter King — 4/4. Rush. Omen: summon three 1/1 Footpads.
 * A powerful tempo threat that floods the board.
 * (Was 5/5: a full vanilla Rush body plus ~2.5 mana of tokens. Trimmed to
 * 4/4 so the Footpad flood is the ~1 mana signature push.)
 */
const kingpinCard: CardDef = {
  id: 'sig_rogue_kingpin_card',
  name: 'The Gutter King',
  cost: 5,
  type: 'minion',
  cardClass: 'rogue',
  rarity: 'legendary',
  text: '**Rush.** **Omen:** Summon three 1/1 Footpads.',
  flavor: 'Crowned with a stolen chamber pot. His subjects bow low — mostly to pick pockets.',
  attack: 4,
  health: 4,
  tribe: 'pirate',
  keywords: ['rush'],
  battlecry: [{ kind: 'summon', token: 'rogue_lackey', count: 3 }],
  token: true,
}

/**
 * All 6 signature treasures for Nell Threefingers.
 */
export const rogueSignatureTreasures: TreasureDef[] = [
  /**
   * The Gossip's Tongue — equip a 3/2 weapon that pings a random enemy after
   * each attack.
   */
  {
    id: 'sig_rogue_shadowblade',
    name: "The Gossip's Tongue",
    kind: 'signature',
    text: 'Weapon (3/2). After your hero attacks, deal 2 damage to a random enemy.',
    card: shadowbladeWeapon,
    tags: ['rogue-good'],
  },

  /**
   * The Swindler's Satchel — a 2-mana spell that adds 2 random spells from any
   * class and draws a card.
   */
  {
    id: 'sig_rogue_thieves_canvas',
    name: "The Swindler's Satchel",
    kind: 'signature',
    text: "Add 2 random spells from any class to your hand. Draw a card.",
    card: thievesCanvasCard,
    tags: ['rogue-good'],
  },

  /**
   * The Mourner's Veil — 2-mana spell: gain 5 Armor and deal 1 damage to all enemies.
   */
  {
    id: 'sig_rogue_cloak_of_shadows',
    name: "The Mourner's Veil",
    kind: 'signature',
    text: 'Gain 5 Armor and deal 1 damage to all enemies.',
    card: cloakOfShadowsCard,
    tags: ['rogue-good'],
  },

  /**
   * Ransack the Vestry — 5-mana board clear + draw engine.
   */
  {
    id: 'sig_rogue_pillage',
    name: 'Ransack the Vestry',
    kind: 'signature',
    text: 'Deal 2 damage to all enemies. Draw 2 cards.',
    card: pillageCard,
    tags: ['rogue-good'],
  },

  /**
   * The Gutter King — a 5-mana 4/4 Rush Brigand that floods the board with
   * Footpads.
   */
  {
    id: 'sig_rogue_kingpin',
    name: 'The Gutter King',
    kind: 'signature',
    text: '4/4 Brigand. Rush. Omen: Summon three 1/1 Footpads.',
    card: kingpinCard,
    tags: ['rogue-good'],
  },

  /**
   * The Widow's Letter-Opener — Haunt-archetype signature weapon: every hero
   * swing re-fires a random friendly Haunt without spending the body.
   */
  {
    id: 'sig_rogue_letter_opener',
    name: "The Widow's Letter-Opener",
    kind: 'signature',
    text: "Weapon (2/3). After your hero attacks, trigger a random friendly minion's **Haunt**.",
    card: letterOpenerWeapon,
    tags: ['rogue-good'],
  },
]
