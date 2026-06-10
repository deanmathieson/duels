import type { TreasureDef } from '../../game/types';

/**
 * All passive treasures for Hearthstone Duels.
 * Passive treasures attach auras, triggers, or startOfGame effects to the player
 * for the entire run. They do NOT grant a card — the engine reads their
 * auras/triggers/startOfGame directly from PassiveState.
 */
export const passiveTreasures: TreasureDef[] = [
  // --- cost-reduction auras ---
  {
    id: 'tr_robe_of_the_magi',
    name: 'Robe of the Magi',
    kind: 'passive',
    text: 'Your spells cost (1) less.',
    auras: [{ kind: 'costReduction', amount: 1, filter: 'spell' }],
    tags: ['druid-good'],
  },
  {
    id: 'tr_inspiring_presence',
    name: 'Inspiring Presence',
    kind: 'passive',
    text: 'Your minions cost (1) less.',
    auras: [{ kind: 'costReduction', amount: 1, filter: 'minion' }],
  },

  // --- stat auras ---
  {
    id: 'tr_bitter_cold',
    name: 'Bitter Cold',
    kind: 'passive',
    text: 'Your minions have +1 Attack.',
    auras: [{ kind: 'minionStat', atk: 1, filter: 'minion' }],
  },
  {
    id: 'tr_hold_the_line',
    name: 'Hold the Line',
    kind: 'passive',
    text: 'Your Taunt minions have +1/+2.',
    auras: [{ kind: 'minionStat', atk: 1, health: 2, filter: 'taunt' }],
  },
  {
    id: 'tr_natural_force',
    name: 'Natural Force',
    kind: 'passive',
    text: 'Your Beasts have +2 Attack.',
    auras: [{ kind: 'minionStat', atk: 2, filter: 'beast' }],
    tags: ['druid-good'],
  },
  {
    id: 'tr_barkskin',
    name: 'Barkskin',
    kind: 'passive',
    text: 'Your minions have +0/+2.',
    auras: [{ kind: 'minionStat', health: 2, filter: 'minion' }],
  },
  {
    id: 'tr_menagerie',
    name: 'Menagerie',
    kind: 'passive',
    text: 'Your Beasts have +1/+1.',
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'beast' }],
    tags: ['druid-good'],
  },
  // id kept for compatibility; was a strictly-worse duplicate of Natural Force
  // (Beasts +1 vs +2 Attack), re-themed into a distinct spell-synergy passive.
  {
    id: 'tr_double_treant',
    name: 'Sapling Surge',
    kind: 'passive',
    text: 'After you cast a spell, summon a 1/1 Sapling.',
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'summon', token: 'sapling', count: 1 }],
      },
    ],
    tags: ['druid-good'],
  },
  {
    id: 'tr_growing_season',
    name: 'Growing Season',
    kind: 'passive',
    text: 'Your Taunt minions have +0/+2.',
    auras: [{ kind: 'minionStat', health: 2, filter: 'taunt' }],
  },

  // --- keyword auras ---
  {
    id: 'tr_rocket_backpacks',
    name: 'Rocket Backpacks',
    kind: 'passive',
    text: 'Your minions have Rush.',
    auras: [{ kind: 'giveKeyword', keyword: 'rush', filter: 'minion' }],
  },
  {
    id: 'tr_vampiric_fangs',
    name: 'Vampiric Fangs',
    kind: 'passive',
    text: 'Your minions have Lifesteal.',
    auras: [{ kind: 'giveKeyword', keyword: 'lifesteal', filter: 'minion' }],
  },

  // --- spell damage aura ---
  {
    id: 'tr_arcane_brilliance',
    name: 'Arcane Brilliance',
    kind: 'passive',
    text: 'Your hero has +1 Spell Damage.',
    auras: [{ kind: 'spellDamage', amount: 1 }],
    tags: ['druid-good'],
  },

  // --- draw trigger ---
  {
    id: 'tr_potion_of_sparking',
    name: 'Potion of Sparking',
    kind: 'passive',
    text: 'After you play a card that costs (5) or more, draw a card.',
    triggers: [
      {
        event: 'onCardCost5Plus',
        effects: [{ kind: 'draw', count: 1 }],
      },
    ],
  },

  // --- divine shield trigger ---
  {
    id: 'tr_divine_illumination',
    name: 'Divine Illumination',
    kind: 'passive',
    text: 'After you play a minion, give it Divine Shield.',
    triggers: [
      {
        event: 'onPlayMinion',
        effects: [{ kind: 'giveDivineShield', target: 'triggerSource' }],
      },
    ],
  },

  // --- startOfGame effects ---
  {
    id: 'tr_crystal_gem',
    name: 'Crystal Gem',
    kind: 'passive',
    text: 'Start of Game: Gain an empty Mana Crystal.',
    startOfGame: [{ kind: 'gainManaCrystal', count: 1, empty: true }],
    tags: ['druid-good'],
  },
  {
    id: 'tr_iron_hide',
    name: 'Iron Hide',
    kind: 'passive',
    text: 'Start of Game: Gain 10 Armor.',
    startOfGame: [{ kind: 'gainArmor', amount: 10 }],
  },
];
