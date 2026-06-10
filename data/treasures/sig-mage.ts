import type { CardDef, TreasureDef } from '../../game/types'

// ---------------------------------------------------------------------------
// Card definitions embedded in the Stargazer signature treasures (added to the
// deck as real cards, token: true so they are never offered elsewhere).
// ---------------------------------------------------------------------------

/**
 * The Long Brass Eye — 3/3 weapon. After you cast a spell, deal 2 damage to a
 * random enemy. (3/3 at 4 mana — the spell trigger is the ~1 mana signature
 * push over the 2.2x weapon-stat anchor.)
 */
const grandMagusStaffCard: CardDef = {
  id: 'sig_mage_grand_magus_staff',
  name: 'The Long Brass Eye',
  cost: 4,
  type: 'weapon',
  cardClass: 'mage',
  rarity: 'legendary',
  text: 'After you cast a spell, deal 2 damage to a random enemy.',
  flavor: 'Built for watching heaven. Balanced for braining neighbours.',
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
 * Midnight Comes Twice — 5-mana spell. Gain 8 mana this turn and draw 2 cards —
 * the "steal an extra night" fantasy without a real extra-turn engine.
 * (8 keeps it at roughly +1 mana over curve for a signature.)
 */
const timeWarpCard: CardDef = {
  id: 'sig_mage_time_warp',
  name: 'Midnight Comes Twice',
  cost: 5,
  type: 'spell',
  cardClass: 'mage',
  rarity: 'legendary',
  text: 'Gain 8 Mana Stones this turn only. Draw 2 cards.',
  flavor: 'The sexton rang twelve twice, then swore off communion wine for good.',
  spell: [
    { kind: 'gainManaThisTurn', amount: 8 },
    { kind: 'draw', count: 2 },
  ],
  token: true,
}

/**
 * Wisp-Spinster — 4/4 with Spell Damage +2 while in play.
 */
const spellweaverCard: CardDef = {
  id: 'sig_mage_spellweaver',
  name: 'Wisp-Spinster',
  cost: 5,
  type: 'minion',
  cardClass: 'mage',
  rarity: 'legendary',
  text: '**Spell Damage +2.**',
  flavor: 'She spins starlight into thread and scandal into curses.',
  attack: 4,
  health: 4,
  tribe: 'elemental',
  spellDamage: 2,
  token: true,
}

/**
 * Comet Gin — 2-mana spell. Spell Damage +3 this turn. Draw a card.
 * (Costed at 2: a free cantrip plus Spell Damage +3 was beyond the ~1 mana
 * signature push.)
 */
const arcaneOverdriveCard: CardDef = {
  id: 'sig_mage_arcane_overdrive',
  name: 'Comet Gin',
  cost: 2,
  type: 'spell',
  cardClass: 'mage',
  rarity: 'legendary',
  text: 'Spell Damage +3 this turn. Draw a card.',
  flavor: 'One sip and you can see God. Two, and He can see you.',
  spell: [
    { kind: 'spellDamageThisTurnHero', amount: 3 },
    { kind: 'draw', count: 1 },
  ],
  token: true,
}

/**
 * All five Stargazer signature treasures.
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
    name: 'The Long Brass Eye',
    kind: 'signature',
    text: '3/3 Weapon. After you cast a spell, deal 2 damage to a random enemy.',
    card: grandMagusStaffCard,
    tags: ['mage-good'],
  },
  {
    id: 'sig_mage_time_warp',
    name: 'Midnight Comes Twice',
    kind: 'signature',
    text: 'Gain 8 Mana Stones this turn only. Draw 2 cards.',
    card: timeWarpCard,
    tags: ['mage-good'],
  },
  {
    id: 'sig_mage_spellweaver',
    name: 'Wisp-Spinster',
    kind: 'signature',
    text: '4/4 Spirit with Spell Damage +2.',
    card: spellweaverCard,
    tags: ['mage-good'],
  },
  {
    id: 'sig_mage_arcane_overdrive',
    name: 'Comet Gin',
    kind: 'signature',
    text: 'Spell Damage +3 this turn. Draw a card.',
    card: arcaneOverdriveCard,
    tags: ['mage-good'],
  },
  /**
   * The Open Heavens — passive signature.
   * Your spells cost (1) less and have Spell Damage +1.
   */
  {
    id: 'sig_mage_infinite_arcane',
    name: 'The Open Heavens',
    kind: 'signature',
    text: 'Your spells cost (1) less and have Spell Damage +1.',
    auras: [
      { kind: 'costReduction', amount: 1, filter: 'spell' },
      { kind: 'spellDamage', amount: 1 },
    ],
    tags: ['mage-good'],
  },
]
