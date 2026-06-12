import type { CardDef, TreasureDef } from '../../game/types'

// ── Token cards for signature treasure cards ─────────────────────────────────

/**
 * Saint Brackish, Risen — 7/7. The patron saint of Hollowmoor, up out of the
 * peat at last. Approximated as: while in play, Spell Damage +2 (the engine
 * has no "double" variant and Spell Damage does not boost healing). Encoded
 * via the spellDamage field — the canonical way minions grant Spell Damage.
 */
const velenCard: CardDef = {
  id: 'sig_priest_velen',
  name: 'Saint Brackish, Risen',
  cost: 7,
  type: 'minion',
  cardClass: 'priest',
  rarity: 'legendary',
  text: '**Spell Damage +2**',
  flavor: "Canonized for turning bogwater into wine. Beatified for what he turned it back into come morning.",
  attack: 7,
  health: 7,
  tribe: 'none',
  spellDamage: 2,
  token: true,
  art: undefined,
}

/**
 * The Bleeding Crozier — 3/3 weapon with Leeching.
 * Each attack heals your hero by the damage dealt.
 */
const lightbringerBladeCard: CardDef = {
  id: 'sig_priest_lightbringer_blade',
  name: 'The Bleeding Crozier',
  cost: 4,
  type: 'weapon',
  cardClass: 'priest',
  rarity: 'legendary',
  text: '**Leeching**',
  flavor: "A shepherd's crook at one end, last rites at the other. The flock stays wonderfully devout.",
  attack: 3,
  durability: 3,
  keywords: ['lifesteal'],
  token: true,
  art: undefined,
}

/**
 * Salvation by the Barrel — 4-mana communion spell.
 * Restore 8 Health to your hero and give all friendly minions Blessing.
 */
const apotheosisCard: CardDef = {
  id: 'sig_priest_apotheosis',
  name: 'Salvation by the Barrel',
  cost: 4,
  type: 'spell',
  cardClass: 'priest',
  rarity: 'legendary',
  text: 'Restore 8 Health to your hero. Give all friendly minions **Blessing**.',
  flavor: "Grace, the Priest preaches, is poured rather than earned. Seconds cost a shilling.",
  spell: [
    { kind: 'heal', amount: 8, target: 'friendlyHero' },
    { kind: 'giveDivineShield', target: 'friendlyMinions' },
  ],
  token: true,
  art: undefined,
}

/**
 * The Moor Takes Its Tithe — 8-mana shadow spell.
 * Destroy all enemy minions. Add a random minion to your hand.
 * (An overwhelming board wipe with a discovery bonus, costed at the
 * standard rate for an unconditional mass destroy.)
 */
const shadowEssenceCard: CardDef = {
  id: 'sig_priest_shadow_essence',
  name: 'The Moor Takes Its Tithe',
  cost: 8,
  type: 'spell',
  cardClass: 'priest',
  rarity: 'legendary',
  text: 'Destroy all enemy minions. Add a random minion to your hand.',
  flavor: "The peat claims everything in the end. Now and then it hands something back, still dripping.",
  spell: [
    { kind: 'destroy', target: 'enemyMinions' },
    { kind: 'addRandomCardToHand', pool: 'minion', count: 1 },
  ],
  token: true,
  art: undefined,
}

// ── Signature Treasures ───────────────────────────────────────────────────────

/**
 * All five signature treasures for Vicar Hezekiah Marrow.
 */
export const priestSignatureTreasures: TreasureDef[] = [
  /**
   * Saint Brackish, Risen — 7/7 legendary minion with Spell Damage +2.
   */
  {
    id: 'sig_priest_velen',
    name: 'Saint Brackish, Risen',
    kind: 'signature',
    text: '7/7. Spell Damage +2.',
    card: velenCard,
    tags: ['priest-good'],
  },

  /**
   * The Bleeding Crozier — 3/3 Leeching weapon.
   * Heals hero for attack damage each swing.
   */
  {
    id: 'sig_priest_lightbringer_blade',
    name: 'The Bleeding Crozier',
    kind: 'signature',
    text: 'Weapon (3/3). Leeching — your hero heals when it attacks.',
    card: lightbringerBladeCard,
    tags: ['priest-good'],
  },

  /**
   * Salvation by the Barrel — 4-mana spell.
   * Heal hero 8, give friendly minions Blessing.
   */
  {
    id: 'sig_priest_apotheosis',
    name: 'Salvation by the Barrel',
    kind: 'signature',
    text: 'Restore 8 Health to your hero. Give all friendly minions Blessing.',
    card: apotheosisCard,
    tags: ['priest-good'],
  },

  /**
   * The Moor Takes Its Tithe — 8-mana board clear with hand refill.
   */
  {
    id: 'sig_priest_shadow_essence',
    name: 'The Moor Takes Its Tithe',
    kind: 'signature',
    text: 'Destroy all enemy minions. Add a random minion to your hand.',
    card: shadowEssenceCard,
    tags: ['priest-good'],
  },

  /**
   * Daily Bread, Nightly Wine — passive aura.
   * At the start of each turn, restore 2 Health to your hero.
   * Modelled as a startOfTurn trigger attached to the player.
   */
  {
    id: 'sig_priest_benediction',
    name: 'Daily Bread, Nightly Wine',
    kind: 'signature',
    text: 'Passive: At the start of each of your turns, restore 2 Health to your hero.',
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'heal', amount: 2, target: 'friendlyHero' }],
      },
    ],
    tags: ['priest-good'],
  },
]
