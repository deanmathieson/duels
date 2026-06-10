import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Card definitions embedded in the Mage signature treasures (added to the
// deck as real cards, token: true so they are never offered elsewhere).
// ---------------------------------------------------------------------------

/**
 * Grand Magus Staff — 3/3 weapon. After you cast a spell, deal 2 damage to a random enemy.
 * (Was a 3-mana 3/5: ~7 mana of weapon stats by the 2.2x anchor before the
 * trigger. Trimmed to 3/3 and recosted to 4 — the spell trigger is the ~1 mana
 * signature push.)
 */
const grandMagusStaffCard: CardDef = {
  id: 'sig_mage_grand_magus_staff',
  name: 'Grand Magus Staff',
  cost: 4,
  type: 'weapon',
  cardClass: 'mage',
  rarity: 'legendary',
  text: 'After you cast a spell, deal 2 damage to a random enemy.',
  attack: 3,
  durability: 3,
  triggers: [
    {
      event: 'onPlaySpell',
      effects: [{ kind: 'damage', amount: 2, target: 'randomEnemy' }],
      condition: 'cardIsSpell',
    },
  ],
  token: true,
}

/**
 * Time Warp — 5-mana spell. Take an extra turn. (Approximated: gain 8 mana this turn
 * and draw 2 cards — captures the "do more stuff" fantasy without a real extra-turn
 * engine. Was gain 10: a guaranteed +5 net mana plus 2 cards for 5 was ~3 mana
 * above curve even for a signature; 8 keeps it at roughly +1.)
 */
const timeWarpCard: CardDef = {
  id: 'sig_mage_time_warp',
  name: 'Time Warp',
  cost: 5,
  type: 'spell',
  cardClass: 'mage',
  rarity: 'legendary',
  text: 'Gain 8 Mana Stones this turn only. Draw 2 cards.',
  spell: [
    { kind: 'gainManaThisTurn', amount: 8 },
    { kind: 'draw', count: 2 },
  ],
  token: true,
}

/**
 * Spellweaver — 4/4 Elemental with Spell Damage +2 while in play.
 */
const spellweaverCard: CardDef = {
  id: 'sig_mage_spellweaver',
  name: 'Spellweaver',
  cost: 5,
  type: 'minion',
  cardClass: 'mage',
  rarity: 'legendary',
  text: '**Spell Damage +2.**',
  attack: 4,
  health: 4,
  tribe: 'elemental',
  spellDamage: 2,
  token: true,
}

/**
 * Arcane Overdrive — 2-mana spell. Spell Damage +3 this turn. Draw a card.
 * (Recosted 0 -> 2: a free cantrip plus Spell Damage +3 was ~3 mana of value
 * at no cost, beyond the ~1 mana signature push.)
 */
const arcaneOverdriveCard: CardDef = {
  id: 'sig_mage_arcane_overdrive',
  name: 'Arcane Overdrive',
  cost: 2,
  type: 'spell',
  cardClass: 'mage',
  rarity: 'legendary',
  text: 'Spell Damage +3 this turn. Draw a card.',
  spell: [
    { kind: 'spellDamageThisTurnHero', amount: 3 },
    { kind: 'draw', count: 1 },
  ],
  token: true,
}

/**
 * All five Mage signature treasures.
 *
 * sig_mage_grand_magus_staff  — active  (weapon)
 * sig_mage_time_warp          — active  (spell)
 * sig_mage_spellweaver        — active  (minion)
 * sig_mage_arcane_overdrive   — active  (spell)
 * sig_mage_infinite_arcane    — passive (aura: spells cost 1 less + Spell Damage +1)
 */
export const mageSignatureTreasures: TreasureDef[] = [
  {
    id: 'sig_mage_grand_magus_staff',
    name: 'Grand Magus Staff',
    kind: 'signature',
    text: '3/3 Weapon. After you cast a spell, deal 2 damage to a random enemy.',
    card: grandMagusStaffCard,
    tags: ['mage-good'],
  },
  {
    id: 'sig_mage_time_warp',
    name: 'Time Warp',
    kind: 'signature',
    text: 'Gain 8 Mana Stones this turn only. Draw 2 cards.',
    card: timeWarpCard,
    tags: ['mage-good'],
  },
  {
    id: 'sig_mage_spellweaver',
    name: 'Spellweaver',
    kind: 'signature',
    text: '4/4 Spirit with Spell Damage +2.',
    card: spellweaverCard,
    tags: ['mage-good'],
  },
  {
    id: 'sig_mage_arcane_overdrive',
    name: 'Arcane Overdrive',
    kind: 'signature',
    text: 'Spell Damage +3 this turn. Draw a card.',
    card: arcaneOverdriveCard,
    tags: ['mage-good'],
  },
  /**
   * Infinite Arcane — passive signature.
   * Your spells cost (1) less and have Spell Damage +1.
   */
  {
    id: 'sig_mage_infinite_arcane',
    name: 'Infinite Arcane',
    kind: 'signature',
    text: 'Your spells cost (1) less and have Spell Damage +1.',
    auras: [
      { kind: 'costReduction', amount: 1, filter: 'spell' },
      { kind: 'spellDamage', amount: 1 },
    ],
    tags: ['mage-good'],
  },
]
