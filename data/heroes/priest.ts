import type { HeroDef, HeroPowerDef } from '../../game/types'

/**
 * Mindrender Illucia — Priest hero definition.
 * Theme: heal and control, Shadow direct damage, sticky high-health minions.
 */
export const priestHero: HeroDef = {
  id: 'hero_priest',
  name: 'Mindrender Illucia',
  cardClass: 'priest',
  heroPowers: [
    'hp_priest_mending',
    'hp_priest_shadowform',
    'hp_priest_holy_words',
  ],
  signatureTreasures: [
    'sig_priest_velen',
    'sig_priest_lightbringer_blade',
    'sig_priest_apotheosis',
    'sig_priest_shadow_essence',
    'sig_priest_benediction',
  ],
  art: undefined,
  portraitArt: undefined,
}

/**
 * Mindrender Illucia's three hero powers.
 */
export const priestHeroPowers: HeroPowerDef[] = [
  /**
   * Mending — 2 mana.
   * Restore 4 Health to your hero.
   */
  {
    id: 'hp_priest_mending',
    name: 'Mending',
    cost: 2,
    text: 'Restore 4 Health to your hero.',
    effects: [{ kind: 'heal', amount: 4, target: 'friendlyHero' }],
    art: undefined,
  },

  /**
   * Shadowform — 2 mana.
   * Choose One - Deal 2 damage to a minion; or deal 1 damage to all enemies.
   */
  {
    id: 'hp_priest_shadowform',
    name: 'Shadowform',
    cost: 2,
    text: 'Choose One - Deal 2 damage to a minion; or deal 1 damage to all enemies.',
    targeted: true,
    targetFilter: 'allMinions',
    chooseOne: [
      {
        text: 'Deal 2 damage to a minion.',
        effects: [{ kind: 'damage', amount: 2, target: 'chosenTarget' }],
      },
      {
        text: 'Deal 1 damage to all enemies.',
        effects: [{ kind: 'damage', amount: 1, target: 'allEnemyCharacters' }],
      },
    ],
    art: undefined,
  },

  /**
   * Holy Words — 3 mana.
   * Choose One - Restore 4 Health to your hero; or draw a card.
   * (Draw is capped at 1; heal trimmed 6 -> 4: the flexibility IS the power —
   * with the heal also beating Mending's rate, this mode-switching power
   * dominated the other two picks outright.)
   */
  {
    id: 'hp_priest_holy_words',
    name: 'Holy Words',
    cost: 3,
    text: 'Choose One - Restore 4 Health to your hero; or draw a card.',
    chooseOne: [
      {
        text: 'Restore 4 Health to your hero.',
        effects: [{ kind: 'heal', amount: 4, target: 'friendlyHero' }],
      },
      {
        text: 'Draw a card.',
        effects: [{ kind: 'draw', count: 1 }],
      },
    ],
    art: undefined,
  },
]
