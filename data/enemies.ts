import type { EnemyDef } from '../game/types'

/**
 * Enemy definitions for the run.
 * Tiers 1–6; tier 6 is the boss (isBoss: true, startingHealth: 35).
 *
 * Enemy decks reference PLAYER card ids directly so the same-named card always
 * behaves identically on both sides of the board. The only enemy-exclusive
 * cards are in data/cards/enemy.ts (soulfire, assassinate — no player
 * counterpart exists).
 */
export const enemies: EnemyDef[] = [
  // -----------------------------------------------------------------------
  // Tier 1 — Aggro Hunter
  // -----------------------------------------------------------------------
  {
    id: 'enemy_aggro_hunter',
    name: 'Rexxar\'s Apprentice',
    tier: 1,
    heroName: 'Rexxar',
    heroClass: 'hunter',
    heroPowerId: 'hp_steady_shot',
    aiProfile: 'aggro',
    deck: [
      'wisp',
      'wisp',
      'hunter_arcane_shot',
      'hunter_arcane_shot',
      'elven_archer',
      'elven_archer',
      'river_crocolisk',
      'river_crocolisk',
      'bloodfen_raptor',
      'bloodfen_raptor',
      'hunter_animal_companion',
      'hunter_animal_companion',
      'hunter_kill_command',
      'hunter_kill_command',
      'ironfur_grizzly',
      'ironfur_grizzly',
    ],
  },

  // -----------------------------------------------------------------------
  // Tier 2 — Tempo Mage
  // -----------------------------------------------------------------------
  {
    id: 'enemy_tempo_mage',
    name: 'Khadgar\'s Disciple',
    tier: 2,
    heroName: 'Khadgar',
    heroClass: 'mage',
    heroPowerId: 'hp_fireblast',
    aiProfile: 'tempo',
    deck: [
      'wisp',
      'elven_archer',
      'elven_archer',
      'mage_frostbolt',
      'mage_frostbolt',
      'mage_arcane_intellect',
      'mage_arcane_intellect',
      'river_crocolisk',
      'chillwind_yeti',
      'chillwind_yeti',
      'mage_fireball',
      'mage_fireball',
      'gnomish_inventor',
      'gnomish_inventor',
      'boulderfist_ogre',
      'boulderfist_ogre',
      'fire_elemental',
    ],
  },

  // -----------------------------------------------------------------------
  // Tier 3 — Midrange Paladin
  // -----------------------------------------------------------------------
  {
    id: 'enemy_midrange_paladin',
    name: 'Uther\'s Champion',
    tier: 3,
    heroName: 'Uther',
    heroClass: 'paladin',
    heroPowerId: 'hp_reinforce',
    aiProfile: 'midrange',
    deck: [
      'elven_archer',
      'elven_archer',
      'river_crocolisk',
      'river_crocolisk',
      'ironfur_grizzly',
      'ironfur_grizzly',
      'paladin_consecration',
      'paladin_consecration',
      'paladin_truesilver_champion',
      'paladin_truesilver_champion',
      'sen_jin_shieldmasta',
      'sen_jin_shieldmasta',
      'chillwind_yeti',
      'chillwind_yeti',
      'sunwalker',
      'sunwalker',
      'boulderfist_ogre',
    ],
  },

  // -----------------------------------------------------------------------
  // Tier 4 — Zoo Warlock
  // -----------------------------------------------------------------------
  {
    id: 'enemy_zoo_warlock',
    name: 'Gul\'dan\'s Servant',
    tier: 4,
    heroName: 'Gul\'dan',
    heroClass: 'warlock',
    heroPowerId: 'hp_life_tap',
    aiProfile: 'aggro',
    deck: [
      'wisp',
      'wisp',
      'warlock_flame_imp',
      'warlock_flame_imp',
      'soulfire',
      'soulfire',
      'elven_archer',
      'elven_archer',
      'river_crocolisk',
      'river_crocolisk',
      'bloodfen_raptor',
      'bloodfen_raptor',
      'chillwind_yeti',
      'chillwind_yeti',
      'sen_jin_shieldmasta',
      'boulderfist_ogre',
      'war_golem',
      'stormwind_champion',
    ],
  },

  // -----------------------------------------------------------------------
  // Tier 5 — Control Warrior
  // -----------------------------------------------------------------------
  {
    id: 'enemy_control_warrior',
    name: 'Garrosh\'s Warlord',
    tier: 5,
    heroName: 'Garrosh',
    heroClass: 'warrior',
    heroPowerId: 'hp_armor_up',
    aiProfile: 'control',
    deck: [
      'warrior_shield_block',
      'warrior_shield_block',
      'warrior_shield_block',
      'ironfur_grizzly',
      'ironfur_grizzly',
      'sen_jin_shieldmasta',
      'sen_jin_shieldmasta',
      'chillwind_yeti',
      'chillwind_yeti',
      'oasis_snapjaw',
      'oasis_snapjaw',
      'sunwalker',
      'sunwalker',
      'boulderfist_ogre',
      'boulderfist_ogre',
      'war_golem',
      'war_golem',
      'stormwind_champion',
    ],
  },

  // -----------------------------------------------------------------------
  // Tier 6 — BOSS: The Arcane Amalgam
  // -----------------------------------------------------------------------
  {
    id: 'boss_arcane_amalgam',
    name: 'The Arcane Amalgam',
    tier: 6,
    heroName: 'The Arcane Amalgam',
    heroClass: 'mage',
    heroPowerId: 'hp_fireblast',
    startingHealth: 35,
    aiProfile: 'control',
    isBoss: true,
    passiveTreasureIds: ['tr_bitter_cold'],
    deck: [
      'mage_frostbolt',
      'mage_frostbolt',
      'hunter_arcane_shot',
      'hunter_arcane_shot',
      'mage_arcane_intellect',
      'mage_arcane_intellect',
      'mage_fireball',
      'mage_fireball',
      'mage_fireball',
      'hunter_kill_command',
      'hunter_kill_command',
      'assassinate',
      'assassinate',
      'paladin_consecration',
      'chillwind_yeti',
      'chillwind_yeti',
      'fire_elemental',
      'fire_elemental',
      'war_golem',
      'stormwind_champion',
    ],
  },
]
