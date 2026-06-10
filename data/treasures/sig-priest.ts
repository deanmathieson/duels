import type { CardDef, TreasureDef } from '../../game/types'

// ── Token cards for signature treasure cards ─────────────────────────────────

/**
 * Prophet Velen — 7/7. Your spells deal double damage and healing.
 * Approximated as: while in play, Spell Damage +2 (the engine has no
 * "double" variant and Spell Damage does not boost healing). Encoded via
 * the spellDamage field — the canonical way minions grant Spell Damage.
 */
const velenCard: CardDef = {
  id: 'sig_priest_velen',
  name: 'Prophet Velen',
  cost: 7,
  type: 'minion',
  cardClass: 'priest',
  rarity: 'legendary',
  text: '**Spell Damage +2**',
  attack: 7,
  health: 7,
  tribe: 'none',
  spellDamage: 2,
  token: true,
  art: undefined,
}

/**
 * Lightbringer's Blade — 3/3 weapon with Lifesteal.
 * Each attack heals your hero by the damage dealt.
 */
const lightbringerBladeCard: CardDef = {
  id: 'sig_priest_lightbringer_blade',
  name: "Lightbringer's Blade",
  cost: 4,
  type: 'weapon',
  cardClass: 'priest',
  rarity: 'legendary',
  text: '**Lifesteal**',
  attack: 3,
  durability: 3,
  keywords: ['lifesteal'],
  token: true,
  art: undefined,
}

/**
 * Apotheosis — 4-mana holy spell.
 * Restore 8 Health to your hero and give all friendly minions Divine Shield.
 */
const apotheosisCard: CardDef = {
  id: 'sig_priest_apotheosis',
  name: 'Apotheosis',
  cost: 4,
  type: 'spell',
  cardClass: 'priest',
  rarity: 'legendary',
  text: 'Restore 8 Health to your hero. Give all friendly minions **Divine Shield**.',
  spell: [
    { kind: 'heal', amount: 8, target: 'friendlyHero' },
    { kind: 'giveDivineShield', target: 'friendlyMinions' },
  ],
  token: true,
  art: undefined,
}

/**
 * Shadow Essence — 8-mana shadow spell.
 * Destroy all enemy minions. Add a random minion to your hand.
 * (Approximates an overwhelming board wipe with a discovery bonus.
 * Costed at Twisting Nether rate for an unconditional mass destroy.)
 */
const shadowEssenceCard: CardDef = {
  id: 'sig_priest_shadow_essence',
  name: 'Shadow Essence',
  cost: 8,
  type: 'spell',
  cardClass: 'priest',
  rarity: 'legendary',
  text: 'Destroy all enemy minions. Add a random minion to your hand.',
  spell: [
    { kind: 'destroy', target: 'enemyMinions' },
    { kind: 'addRandomCardToHand', pool: 'minion', count: 1 },
  ],
  token: true,
  art: undefined,
}

// ── Signature Treasures ───────────────────────────────────────────────────────

/**
 * All five signature treasures for Mindrender Illucia.
 */
export const priestSignatureTreasures: TreasureDef[] = [
  /**
   * Prophet Velen — 7/7 legendary minion with Spell Damage +2.
   */
  {
    id: 'sig_priest_velen',
    name: 'Prophet Velen',
    kind: 'signature',
    text: '7/7. Spell Damage +2.',
    card: velenCard,
    tags: ['priest-good'],
  },

  /**
   * Lightbringer's Blade — 3/3 Lifesteal weapon.
   * Heals hero for attack damage each swing.
   */
  {
    id: 'sig_priest_lightbringer_blade',
    name: "Lightbringer's Blade",
    kind: 'signature',
    text: 'Weapon (3/3). Lifesteal — your hero heals when it attacks.',
    card: lightbringerBladeCard,
    tags: ['priest-good'],
  },

  /**
   * Apotheosis — 4-mana spell.
   * Heal hero 8, give friendly minions Divine Shield.
   */
  {
    id: 'sig_priest_apotheosis',
    name: 'Apotheosis',
    kind: 'signature',
    text: 'Restore 8 Health to your hero. Give all friendly minions Divine Shield.',
    card: apotheosisCard,
    tags: ['priest-good'],
  },

  /**
   * Shadow Essence — 8-mana board clear with hand refill.
   */
  {
    id: 'sig_priest_shadow_essence',
    name: 'Shadow Essence',
    kind: 'signature',
    text: 'Destroy all enemy minions. Add a random minion to your hand.',
    card: shadowEssenceCard,
    tags: ['priest-good'],
  },

  /**
   * Benediction — passive aura.
   * At the start of each turn, restore 2 Health to your hero.
   * Modelled as a startOfTurn trigger attached to the player.
   */
  {
    id: 'sig_priest_benediction',
    name: 'Benediction',
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
