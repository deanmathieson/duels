import type { TreasureDef } from '../../game/types'

/**
 * Boss gimmick passives — enemy-only. Registered with the engine (so matches
 * can resolve them) but never added to the player offering pools, exactly like
 * the scaling treasures.
 */
export const bossTreasures: TreasureDef[] = [
  /**
   * The Hollow Shepherd: the flock always comes back.
   */
  {
    id: 'boss_undying_flock',
    name: 'The Undying Flock',
    kind: 'passive',
    text: 'After a friendly minion dies, summon a 1/1 Pitchfork Volunteer.',
    triggers: [
      {
        event: 'onFriendlyMinionDeath',
        effects: [{ kind: 'summon', token: 'hollow_recruit', count: 1 }],
      },
    ],
  },
  /**
   * The Barrow-King: the cairn builds itself higher every turn.
   */
  {
    id: 'boss_living_cairn',
    name: 'The Living Cairn',
    kind: 'passive',
    text: 'At the start of its turn, this hero gains 2 Armor.',
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'gainArmor', amount: 2 }],
      },
    ],
  },
]
