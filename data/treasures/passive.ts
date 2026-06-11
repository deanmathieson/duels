import type { TreasureDef } from '../../game/types';

/**
 * Passive treasures: ongoing auras/triggers/startOfGame effects attached to the
 * player for the entire run.
 *
 * DESIGN RULE: every passive should be a BUILD-AROUND, not a stat stick — it
 * should change which cards you draft after picking it. Tiers gate the
 * offering: tier 1 passives are archetype nudges (offered round 1), tier 2 are
 * game-warping (offered round 3). Treasures without a tier default to 1.
 *
 * Ids are stable across renames (saved runs reference them).
 */
export const passiveTreasures: TreasureDef[] = [
  /* --------------------------------------------------------------------------
   * TIER 1 — archetype nudges
   * ----------------------------------------------------------------------- */

  // --- cost reduction ---
  {
    id: 'tr_robe_of_the_magi',
    name: 'Witchweave Shawl',
    kind: 'passive',
    text: 'Your spells cost (1) less.',
    tier: 1,
    auras: [{ kind: 'costReduction', amount: 1, filter: 'spell' }],
    tags: ['spells'],
  },
  {
    id: 'tr_inspiring_presence',
    name: "The Recruiter's Wink",
    kind: 'passive',
    text: 'Your minions cost (1) less.',
    tier: 1,
    auras: [{ kind: 'costReduction', amount: 1, filter: 'minion' }],
  },

  // --- archetype stat auras ---
  {
    id: 'tr_hold_the_line',
    name: 'Lock Yer Doors',
    kind: 'passive',
    text: 'Your **Ward** minions have +1/+2.',
    tier: 1,
    auras: [{ kind: 'minionStat', atk: 1, health: 2, filter: 'taunt' }],
    tags: ['ward'],
  },
  {
    id: 'tr_natural_force',
    name: 'Red in Tooth',
    kind: 'passive',
    text: 'Your Beasts have +2 Attack.',
    tier: 1,
    auras: [{ kind: 'minionStat', atk: 2, filter: 'beast' }],
    tags: ['beasts'],
  },
  {
    id: 'tr_titans_favor',
    name: 'Big Bones',
    kind: 'passive',
    text: 'Your minions that cost (5) or more have +2/+2.',
    tier: 1,
    auras: [{ kind: 'minionStat', atk: 2, health: 2, filter: 'costGte5' }],
    tags: ['big'],
  },

  // --- archetype triggers ---
  // id kept for compatibility; re-themed from a flat beast stat stick into an
  // on-play beast tempo build-around.
  {
    id: 'tr_menagerie',
    name: 'Pack Manners',
    kind: 'passive',
    text: 'After you play a Beast, give it +1/+1 and **Rush**.',
    tier: 1,
    triggers: [
      {
        event: 'onPlayBeast',
        effects: [
          { kind: 'buff', atk: 1, health: 1, target: 'triggerSource' },
          { kind: 'giveKeyword', keyword: 'rush', target: 'triggerSource' },
        ],
      },
    ],
    tags: ['beasts'],
  },
  // id kept for compatibility; was "start with 10 Armor", now a weapon/attack
  // build-around.
  {
    id: 'tr_iron_hide',
    name: "Duelist's Swagger",
    kind: 'passive',
    text: 'After your hero attacks, draw a card.',
    tier: 1,
    triggers: [{ event: 'afterAttack', effects: [{ kind: 'draw', count: 1 }] }],
    tags: ['weapons'],
  },
  {
    id: 'tr_double_treant',
    name: 'Mandrake Chorus',
    kind: 'passive',
    text: 'After you cast a spell, summon a 1/1 Sapling.',
    tier: 1,
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'summon', token: 'sapling', count: 1 }],
      },
    ],
    tags: ['spells', 'swarm'],
  },
  {
    id: 'tr_grave_pact',
    name: "The Gravedigger's Cut",
    kind: 'passive',
    text: 'After a friendly **Haunt** minion dies, summon a 2/2 Revenant.',
    tier: 1,
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        condition: 'cardHasDeathrattle',
        effects: [{ kind: 'summon', token: 'revenant', count: 1 }],
      },
    ],
    tags: ['haunt'],
  },
  {
    id: 'tr_battle_drums',
    name: 'Wedding Drums',
    kind: 'passive',
    text: 'After you play an **Omen** minion, give it +1/+1.',
    tier: 1,
    triggers: [
      {
        event: 'onPlayMinion',
        condition: 'cardHasBattlecry',
        effects: [{ kind: 'buff', atk: 1, health: 1, target: 'triggerSource' }],
      },
    ],
    tags: ['omen'],
  },
  {
    id: 'tr_standing_army',
    name: 'The Night Watch',
    kind: 'passive',
    text: 'At the start of your turn, summon a 1/1 Pitchfork Volunteer.',
    tier: 1,
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'summon', token: 'hollow_recruit', count: 1 }],
      },
    ],
    tags: ['swarm'],
  },
  {
    id: 'tr_spell_spark',
    name: 'Spiteful Whispers',
    kind: 'passive',
    text: 'After you cast a spell, deal 1 damage to a random enemy.',
    tier: 1,
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'damage', amount: 1, target: 'randomEnemy' }],
      },
    ],
    tags: ['spells'],
  },
  {
    id: 'tr_fae_blood',
    name: 'Faewine Hangover',
    kind: 'passive',
    text: 'After a friendly Fae dies, deal 2 damage to the enemy hero.',
    tier: 1,
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        condition: 'cardIsDemon',
        effects: [{ kind: 'damage', amount: 2, target: 'enemyHero' }],
      },
    ],
    tags: ['fae'],
  },
  {
    id: 'tr_scholars_focus',
    name: 'Confession Booth',
    kind: 'passive',
    text: 'After you use your Hero Power, draw a card.',
    tier: 1,
    triggers: [{ event: 'onHeroPowerUsed', effects: [{ kind: 'draw', count: 1 }] }],
  },
  {
    id: 'tr_potion_of_sparking',
    name: "Gravedigger's Flask",
    kind: 'passive',
    text: 'After you play a card that costs (5) or more, draw a card.',
    tier: 1,
    triggers: [
      {
        event: 'onCardCost5Plus',
        effects: [{ kind: 'draw', count: 1 }],
      },
    ],
    tags: ['big'],
  },

  // --- start of game ---
  {
    id: 'tr_crystal_gem',
    name: 'Swallowed Moonstone',
    kind: 'passive',
    text: 'Start of Game: Gain an empty Mana Stone.',
    tier: 1,
    startOfGame: [{ kind: 'gainManaCrystal', count: 1, empty: true }],
    tags: ['big'],
  },

  // --- archetype cost reduction ---
  {
    id: 'tr_forewarnings',
    name: 'Dark Forewarnings',
    kind: 'passive',
    text: 'Your **Omen** minions cost (1) less.',
    tier: 1,
    auras: [{ kind: 'costReduction', amount: 1, filter: 'battlecry' }],
    tags: ['omen'],
  },
  {
    id: 'tr_paupers_funeral',
    name: "A Pauper's Funeral",
    kind: 'passive',
    text: 'Your **Haunt** minions cost (1) less.',
    tier: 1,
    auras: [{ kind: 'costReduction', amount: 1, filter: 'deathrattle' }],
    tags: ['haunt'],
  },
  {
    id: 'tr_poachers_snare',
    name: "Poacher's Snares",
    kind: 'passive',
    text: 'Your Beasts cost (1) less.',
    tier: 1,
    auras: [{ kind: 'costReduction', amount: 1, filter: 'beast' }],
    tags: ['beasts'],
  },

  // --- more archetype stat auras ---
  {
    id: 'tr_well_kept_graves',
    name: 'Well-Tended Graves',
    kind: 'passive',
    text: 'Your **Haunt** minions have +1/+2.',
    tier: 1,
    auras: [{ kind: 'minionStat', atk: 1, health: 2, filter: 'deathrattle' }],
    tags: ['haunt'],
  },
  {
    id: 'tr_loud_omens',
    name: 'Louder Omens',
    kind: 'passive',
    text: 'Your **Omen** minions have +1/+1.',
    tier: 1,
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'battlecry' }],
    tags: ['omen'],
  },

  // --- more archetype triggers ---
  {
    id: 'tr_changeling_gift',
    name: 'Changeling Gift',
    kind: 'passive',
    text: 'After you play a Fae, give it +2/+1.',
    tier: 1,
    triggers: [
      {
        event: 'onPlayMinion',
        condition: 'cardIsDemon',
        effects: [{ kind: 'buff', atk: 2, health: 1, target: 'triggerSource' }],
      },
    ],
    tags: ['fae'],
  },
  {
    id: 'tr_deep_lore',
    name: 'Deep Lore',
    kind: 'passive',
    text: 'After you cast a spell that costs (4) or more, draw a card.',
    tier: 1,
    triggers: [{ event: 'onSpellCast4Plus', effects: [{ kind: 'draw', count: 1 }] }],
    tags: ['spells', 'big'],
  },
  {
    id: 'tr_thrown_stones',
    name: 'Thrown Stones',
    kind: 'passive',
    text: 'After you play a minion, deal 1 damage to a random enemy minion.',
    tier: 1,
    triggers: [
      {
        event: 'onPlayMinion',
        effects: [{ kind: 'damage', amount: 1, target: 'randomEnemyMinion' }],
      },
    ],
    tags: ['swarm'],
  },
  {
    id: 'tr_waste_not',
    name: 'Waste Not',
    kind: 'passive',
    text: 'After a friendly minion dies, give a random friendly minion +1/+1.',
    tier: 1,
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        effects: [{ kind: 'buff', atk: 1, health: 1, target: 'randomFriendlyMinion' }],
      },
    ],
    tags: ['swarm', 'haunt'],
  },
  {
    id: 'tr_evensong',
    name: 'Evensong',
    kind: 'passive',
    text: 'At the end of your turn, restore 2 Health to all friendly characters.',
    tier: 1,
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'heal', amount: 2, target: 'allFriendlyCharacters' }],
      },
    ],
  },
  {
    id: 'tr_peat_plaster',
    name: 'Peat and Plaster',
    kind: 'passive',
    text: 'At the end of your turn, gain 2 Armor.',
    tier: 1,
    triggers: [{ event: 'endOfTurn', effects: [{ kind: 'gainArmor', amount: 2 }] }],
  },
  {
    id: 'tr_penance_paid',
    name: 'Penance Paid',
    kind: 'passive',
    text: 'After you use your Hero Power, restore 3 Health to your hero.',
    tier: 1,
    triggers: [
      {
        event: 'onHeroPowerUsed',
        effects: [{ kind: 'heal', amount: 3, target: 'friendlyHero' }],
      },
    ],
  },
  {
    id: 'tr_ox_plate',
    name: 'Ox-Cart Armour',
    kind: 'passive',
    text: 'After you play a card that costs (5) or more, gain 4 Armor.',
    tier: 1,
    triggers: [{ event: 'onCardCost5Plus', effects: [{ kind: 'gainArmor', amount: 4 }] }],
    tags: ['big'],
  },

  // --- start of game ---
  {
    id: 'tr_crooked_penny',
    name: 'The Crooked Penny',
    kind: 'passive',
    text: 'Start of Game: Add 2 Coins to your hand.',
    tier: 1,
    startOfGame: [{ kind: 'gainCoin', count: 2 }],
  },
  {
    id: 'tr_early_worm',
    name: 'The Early Worm',
    kind: 'passive',
    text: 'Start of Game: Draw 2 extra cards.',
    tier: 1,
    startOfGame: [{ kind: 'draw', count: 2 }],
  },
  {
    id: 'tr_hangmans_scythe',
    name: "The Hangman's Scythe",
    kind: 'passive',
    text: 'Start of Game: Equip a 2/3 Scythe.',
    tier: 1,
    startOfGame: [{ kind: 'equipWeapon', cardId: 'treasure_scythe' }],
    tags: ['weapons'],
  },

  /* --------------------------------------------------------------------------
   * TIER 2 — game-warping build-arounds
   * ----------------------------------------------------------------------- */

  {
    id: 'tr_haunt_double',
    name: 'Second Funeral',
    kind: 'passive',
    text: 'Your **Haunts** trigger twice.',
    tier: 2,
    auras: [{ kind: 'triggerTwice', what: 'deathrattle' }],
    tags: ['haunt'],
  },
  {
    id: 'tr_omen_double',
    name: 'Twice-Told Omen',
    kind: 'passive',
    text: 'Your **Omens** trigger twice.',
    tier: 2,
    auras: [{ kind: 'triggerTwice', what: 'battlecry' }],
    tags: ['omen'],
  },
  {
    id: 'tr_echo_chamber',
    name: "Witch's Echo",
    kind: 'passive',
    text: 'The first spell you cast each turn casts twice.',
    tier: 2,
    auras: [{ kind: 'firstSpellEachTurnTwice' }],
    tags: ['spells'],
  },
  {
    id: 'tr_grave_echo',
    name: 'Restless Lodgers',
    kind: 'passive',
    text: 'After a friendly **Haunt** minion dies, summon a 1/1 copy of it. (Copies don’t echo.)',
    tier: 2,
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        condition: 'cardHasDeathrattle',
        effects: [{ kind: 'summonCopy', of: 'triggerSource', atk: 1, health: 1 }],
      },
    ],
    tags: ['haunt'],
  },
  {
    id: 'tr_swarm_banner',
    name: 'Mob Justice',
    kind: 'passive',
    text: 'Your minions that cost (2) or less have +1/+1.',
    tier: 2,
    auras: [{ kind: 'minionStat', atk: 1, health: 1, filter: 'costLte2' }],
    tags: ['swarm'],
  },
  {
    id: 'tr_rocket_backpacks',
    name: 'Too Eager by Half',
    kind: 'passive',
    text: 'Your minions have **Rush**.',
    tier: 2,
    auras: [{ kind: 'giveKeyword', keyword: 'rush', filter: 'minion' }],
    tags: ['swarm'],
  },
  {
    id: 'tr_vampiric_fangs',
    name: 'A Taste for Blood',
    kind: 'passive',
    text: 'Your minions have **Leeching**.',
    tier: 2,
    auras: [{ kind: 'giveKeyword', keyword: 'lifesteal', filter: 'minion' }],
  },
  {
    id: 'tr_arcane_brilliance',
    name: 'Third Eye Open',
    kind: 'passive',
    text: 'Your hero has +1 Spell Damage.',
    tier: 2,
    auras: [{ kind: 'spellDamage', amount: 1 }],
    tags: ['spells'],
  },
  {
    id: 'tr_divine_illumination',
    name: 'Lamplighter Baptism',
    kind: 'passive',
    text: 'After you play a minion, give it **Blessing**.',
    tier: 2,
    triggers: [
      {
        event: 'onPlayMinion',
        effects: [{ kind: 'giveDivineShield', target: 'triggerSource' }],
      },
    ],
    tags: ['swarm'],
  },

  {
    id: 'tr_hemlock_pinch',
    name: 'A Pinch of Hemlock',
    kind: 'passive',
    text: 'Your minions have **Poisonous**.',
    tier: 2,
    auras: [{ kind: 'giveKeyword', keyword: 'poisonous', filter: 'minion' }],
    tags: ['swarm'],
  },
  {
    id: 'tr_pack_hunger',
    name: "The Pack's Hunger",
    kind: 'passive',
    text: 'After you play a Beast, draw a card.',
    tier: 2,
    triggers: [{ event: 'onPlayBeast', effects: [{ kind: 'draw', count: 1 }] }],
    tags: ['beasts'],
  },
  {
    id: 'tr_stray_blessings',
    name: 'Stray Blessings',
    kind: 'passive',
    text: 'After you cast a spell, give a random friendly minion +2/+2.',
    tier: 2,
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'buff', atk: 2, health: 2, target: 'randomFriendlyMinion' }],
      },
    ],
    tags: ['spells', 'swarm'],
  },
  {
    id: 'tr_whispering_shelf',
    name: 'The Whispering Shelf',
    kind: 'passive',
    text: 'At the start of your turn, add a random spell to your hand.',
    tier: 2,
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 1 }],
      },
    ],
    tags: ['spells'],
  },
  {
    id: 'tr_follow_me_lads',
    name: 'Follow Me, Lads',
    kind: 'passive',
    text: 'After your hero attacks, summon two 1/1 Pitchfork Volunteers.',
    tier: 2,
    triggers: [
      {
        event: 'afterAttack',
        effects: [{ kind: 'summon', token: 'hollow_recruit', count: 2 }],
      },
    ],
    tags: ['weapons', 'swarm'],
  },
  {
    id: 'tr_bad_tempers',
    name: 'Bad Tempers',
    kind: 'passive',
    text: 'After a friendly minion takes damage, give it +2 Attack.',
    tier: 2,
    triggers: [
      {
        event: 'onFriendlyMinionDamaged',
        effects: [{ kind: 'buff', atk: 2, health: 0, target: 'triggerSource' }],
      },
    ],
    tags: ['ward'],
  },

  /* --------------------------------------------------------------------------
   * JACKPOTS — run-warping crazies. Never in the normal rotation: they appear
   * only via the low-probability jackpot slot (guaranteed after elites),
   * ignore tier banding, and get the mythic presentation in the picker.
   * ----------------------------------------------------------------------- */

  {
    id: 'tr_jp_mirrored_moor',
    name: 'The Mirrored Moor',
    kind: 'passive',
    text: 'After you play a minion, summon a 1/1 copy of it.',
    jackpot: true,
    triggers: [
      {
        event: 'onPlayMinion',
        effects: [{ kind: 'summonCopy', of: 'triggerSource', atk: 1, health: 1 }],
      },
    ],
    tags: ['swarm', 'omen'],
  },
  {
    id: 'tr_jp_second_dawn',
    name: 'Litany of Second Dawns',
    kind: 'passive',
    text: 'Your spells cost (2) less.',
    jackpot: true,
    auras: [{ kind: 'costReduction', amount: 2, filter: 'spell' }],
    tags: ['spells'],
  },
  {
    id: 'tr_jp_harvest_due',
    name: "The Harvest Queen's Due",
    kind: 'passive',
    text: 'At the end of your turn, give your minions +1/+1.',
    jackpot: true,
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'buff', atk: 1, health: 1, target: 'friendlyMinions' }],
      },
    ],
    tags: ['swarm', 'ward'],
  },
  {
    id: 'tr_jp_old_hunger',
    name: 'The Old Hunger',
    kind: 'passive',
    text: 'Your hero has +3 Spell Damage.',
    jackpot: true,
    auras: [{ kind: 'spellDamage', amount: 3 }],
    tags: ['spells'],
  },
  {
    id: 'tr_jp_thrice_moon',
    name: 'The Thrice-Risen Moon',
    kind: 'passive',
    text: 'Start of Game: Gain 2 Mana Stones.',
    jackpot: true,
    startOfGame: [{ kind: 'gainManaCrystal', count: 2 }],
    tags: ['big'],
  },
  {
    id: 'tr_jp_unquiet_earth',
    name: 'The Unquiet Earth',
    kind: 'passive',
    text: 'After a friendly minion dies, summon a 1/1 copy of it. (Copies don’t echo.)',
    jackpot: true,
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        effects: [{ kind: 'summonCopy', of: 'triggerSource', atk: 1, health: 1 }],
      },
    ],
    tags: ['swarm', 'haunt'],
  },
  {
    id: 'tr_jp_long_midnight',
    name: 'The Long Midnight',
    kind: 'passive',
    text: 'At the start of your turn, gain 1 extra Mana this turn.',
    jackpot: true,
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'gainManaThisTurn', amount: 1 }],
      },
    ],
    tags: ['big'],
  },
  {
    id: 'tr_jp_hiring_fair',
    name: 'The Hiring Fair',
    kind: 'passive',
    text: 'Your minions cost (2) less.',
    jackpot: true,
    auras: [{ kind: 'costReduction', amount: 2, filter: 'minion' }],
  },
  {
    id: 'tr_jp_twin_litters',
    name: 'Twin Litters',
    kind: 'passive',
    text: 'After you play a Beast, summon a copy of it.',
    jackpot: true,
    triggers: [
      {
        event: 'onPlayBeast',
        effects: [{ kind: 'summonCopy', of: 'triggerSource' }],
      },
    ],
    tags: ['beasts'],
  },
  {
    id: 'tr_jp_parade_drowned',
    name: 'Parade of the Drowned',
    kind: 'passive',
    text: 'At the start of your turn, summon two 2/2 Revenants.',
    jackpot: true,
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'summon', token: 'revenant', count: 2 }],
      },
    ],
    tags: ['swarm', 'haunt'],
  },
  {
    id: 'tr_jp_book_reads_back',
    name: 'The Book That Reads Back',
    kind: 'passive',
    text: 'After you cast a spell, add a random spell to your hand.',
    jackpot: true,
    triggers: [
      {
        event: 'onPlaySpell',
        effects: [{ kind: 'addRandomCardToHand', pool: 'spell', count: 1 }],
      },
    ],
    tags: ['spells'],
  },
  {
    id: 'tr_jp_creeping_damp',
    name: 'The Creeping Damp',
    kind: 'passive',
    text: 'At the end of your turn, deal 2 damage to all enemies.',
    jackpot: true,
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'damage', amount: 2, target: 'allEnemyCharacters' }],
      },
    ],
  },
  {
    id: 'tr_jp_headsmans_pride',
    name: "The Headsman's Pride",
    kind: 'passive',
    text: "Start of Game: Equip a 4/4 Headsman's Axe.",
    jackpot: true,
    startOfGame: [{ kind: 'equipWeapon', cardId: 'treasure_headsman' }],
    tags: ['weapons'],
  },
];

/**
 * Retired passives: pure stat sticks cut from the offering pool. They stay
 * registered with the engine so old saved runs (and boss gimmicks) that
 * reference them keep working — they are simply never offered again.
 */
export const archivedPassiveTreasures: TreasureDef[] = [
  {
    id: 'tr_bitter_cold',
    name: 'Bitter Cold',
    kind: 'passive',
    text: 'Your minions have +1 Attack.',
    auras: [{ kind: 'minionStat', atk: 1, filter: 'minion' }],
  },
  {
    id: 'tr_barkskin',
    name: 'Barkskin',
    kind: 'passive',
    text: 'Your minions have +0/+2.',
    auras: [{ kind: 'minionStat', health: 2, filter: 'minion' }],
  },
  {
    id: 'tr_growing_season',
    name: 'Growing Season',
    kind: 'passive',
    text: 'Your **Ward** minions have +0/+2.',
    auras: [{ kind: 'minionStat', health: 2, filter: 'taunt' }],
  },
];
