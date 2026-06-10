import type { EnemyDef } from '../game/types'

/**
 * Enemy definitions for the Duels run.
 * Tiers 1–6; tier 6 is the boss (isBoss: true, startingHealth: 35).
 *
 * Deck card IDs drawn from:
 *   - Neutral:  wisp, elven_archer, river_crocolisk, bloodfen_raptor, ironfur_grizzly,
 *               sen_jin_shieldmasta, chillwind_yeti, oasis_snapjaw, gnomish_inventor,
 *               sunwalker, fire_elemental, boulderfist_ogre, war_golem, stormwind_champion
 *   - Enemy class cards (data/cards/enemy.ts):
 *               fireball, frostbolt, arcane_intellect, kill_command, arcane_shot,
 *               animal_companion, shield_block, consecration, soulfire, flame_imp,
 *               truesilver, assassinate
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
      'arcane_shot',
      'arcane_shot',
      'elven_archer',
      'elven_archer',
      'river_crocolisk',
      'river_crocolisk',
      'bloodfen_raptor',
      'bloodfen_raptor',
      'animal_companion',
      'animal_companion',
      'kill_command',
      'kill_command',
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
      'frostbolt',
      'frostbolt',
      'arcane_intellect',
      'arcane_intellect',
      'river_crocolisk',
      'chillwind_yeti',
      'chillwind_yeti',
      'fireball',
      'fireball',
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
      'consecration',
      'consecration',
      'truesilver',
      'truesilver',
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
      'flame_imp',
      'flame_imp',
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
      'shield_block',
      'shield_block',
      'shield_block',
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
      'frostbolt',
      'frostbolt',
      'arcane_shot',
      'arcane_shot',
      'arcane_intellect',
      'arcane_intellect',
      'fireball',
      'fireball',
      'fireball',
      'kill_command',
      'kill_command',
      'assassinate',
      'assassinate',
      'consecration',
      'chillwind_yeti',
      'chillwind_yeti',
      'fire_elemental',
      'fire_elemental',
      'war_golem',
      'stormwind_champion',
    ],
  },
]
