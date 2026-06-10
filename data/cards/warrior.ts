import type { CardDef } from '../../game/types'

/**
 * Warrior class cards for Rattlegore — Armor, weapons, big minions, board control.
 * ~30 collectible cards spanning the 1-9 mana curve, plus token cards.
 */
export const warriorCards: CardDef[] = [

  // -------------------------------------------------------------------------
  // Token cards (token: true) — referenced by warrior card effects
  // -------------------------------------------------------------------------

  /**
   * Warrior Recruit — 1/1 token summoned by various warrior effects.
   */
  {
    id: 'warrior_recruit',
    name: 'Recruit',
    cost: 1,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'free',
    text: '',
    attack: 1,
    health: 1,
    tribe: 'none',
    token: true,
    art: undefined,
  },

  /**
   * Damaged Golem — 2/1 Rush token kept available for warrior effects.
   * (Not currently summoned by any collectible card.)
   */
  {
    id: 'warrior_damaged_golem',
    name: 'Damaged Golem',
    cost: 1,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'free',
    text: '**Rush**',
    attack: 2,
    health: 1,
    tribe: 'none',
    keywords: ['rush'],
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 1-cost
  // -------------------------------------------------------------------------

  /**
   * Shield Slam — Deal 1 damage to a minion for each Armor you have.
   * Approximated as: deal 3 damage to a chosen minion + gain 2 Armor (on-theme).
   * (True Shield Slam scales off armor — no per-armor engine primitive, so we use
   *  a fixed strong value and pair it with small armor gain.)
   */
  {
    id: 'warrior_shield_slam',
    name: 'Shield Slam',
    cost: 1,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'epic',
    text: 'Gain 2 Armor. Deal 3 damage to a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'gainArmor', amount: 2 },
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /**
   * Heroic Strike — Give your hero +4 Attack this turn.
   */
  {
    id: 'warrior_heroic_strike',
    name: 'Heroic Strike',
    cost: 1,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Give your hero +4 Attack this turn.',
    spell: [{ kind: 'heroAttackThisTurn', amount: 4 }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 2-cost
  // -------------------------------------------------------------------------

  /**
   * Whirlwind — Deal 1 damage to all minions.
   */
  {
    id: 'warrior_whirlwind',
    name: 'Whirlwind',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Deal 1 damage to all minions.',
    spell: [{ kind: 'damage', amount: 1, target: 'allMinions' }],
    art: undefined,
  },

  /**
   * Fiery War Axe — Equip a 3/2 weapon.
   * Costed at 3 (post-nerf rate): a 3/2 weapon at 2 mana is above the
   * attack×durability ≈ 2.2×cost weapon budget.
   */
  {
    id: 'warrior_fiery_war_axe',
    name: 'Fiery War Axe',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Equip a 3/2 Weapon.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_fiery_war_axe_token' }],
    art: undefined,
  },

  /**
   * Fiery War Axe weapon token.
   */
  {
    id: 'warrior_fiery_war_axe_token',
    name: 'Fiery War Axe',
    cost: 3,
    type: 'weapon',
    cardClass: 'warrior',
    rarity: 'free',
    text: '',
    attack: 3,
    durability: 2,
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 3-cost
  // -------------------------------------------------------------------------

  /**
   * Shield Block — Gain 5 Armor. Draw a card.
   */
  {
    id: 'warrior_shield_block',
    name: 'Shield Block',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Gain 5 Armor. Draw a card.',
    spell: [
      { kind: 'gainArmor', amount: 5 },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Frothing Berserker — 2/4. Whenever a minion takes damage, gain +1 Attack
   * (the authentic effect, via the onMinionDamaged trigger — fires for minions
   * on both sides, including itself).
   */
  {
    id: 'warrior_frothing_berserker',
    name: 'Frothing Berserker',
    cost: 3,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: 'Whenever a minion takes damage, gain +1 Attack.',
    attack: 2,
    health: 4,
    tribe: 'none',
    triggers: [
      {
        event: 'onMinionDamaged',
        effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }],
      },
    ],
    art: undefined,
  },

  /**
   * Kor'kron Elite — 4/3 with Charge.
   */
  {
    id: 'warrior_korkron_elite',
    name: "Kor'kron Elite",
    cost: 4,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Charge**',
    attack: 4,
    health: 3,
    tribe: 'none',
    keywords: ['charge'],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 4-cost
  // -------------------------------------------------------------------------

  /**
   * Armorsmith — 1/4. Whenever a friendly minion takes damage, gain 1 Armor
   * (the authentic effect, via onFriendlyMinionDamaged — includes itself).
   */
  {
    id: 'warrior_armorsmith',
    name: 'Armorsmith',
    cost: 2,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: 'Whenever a friendly minion takes damage, gain 1 Armor.',
    attack: 1,
    health: 4,
    tribe: 'none',
    triggers: [
      {
        event: 'onFriendlyMinionDamaged',
        effects: [{ kind: 'gainArmor', amount: 1 }],
      },
    ],
    art: undefined,
  },

  /**
   * Execute — Destroy a damaged minion.
   * The engine has no "damaged minion" conditional, so this is an unconditional
   * destroy — re-costed to 5 (Assassinate rate); the original 2-mana price
   * assumed the damaged-minion condition.
   */
  {
    id: 'warrior_execute',
    name: 'Execute',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Destroy a minion.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 5-cost
  // -------------------------------------------------------------------------

  /**
   * Shieldmaiden — 5/5 with Taunt. Battlecry: Gain 5 Armor.
   * Costed at 6 (real-card rate): a budget 5/5 Taunt body plus ~2 mana of armor
   * was well over curve at 5.
   */
  {
    id: 'warrior_shieldmaiden',
    name: 'Shieldmaiden',
    cost: 6,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Taunt**. **Battlecry:** Gain 5 Armor.',
    attack: 5,
    health: 5,
    tribe: 'none',
    keywords: ['taunt'],
    battlecry: [{ kind: 'gainArmor', amount: 5 }],
    art: undefined,
  },

  /**
   * Arcanite Reaper — Equip a 5/2 weapon.
   */
  {
    id: 'warrior_arcanite_reaper',
    name: 'Arcanite Reaper',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Equip a 5/2 Weapon.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_arcanite_reaper_token' }],
    art: undefined,
  },

  /**
   * Arcanite Reaper weapon token.
   */
  {
    id: 'warrior_arcanite_reaper_token',
    name: 'Arcanite Reaper',
    cost: 5,
    type: 'weapon',
    cardClass: 'warrior',
    rarity: 'common',
    text: '',
    attack: 5,
    durability: 2,
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 6-cost
  // -------------------------------------------------------------------------

  /**
   * Brawl — Destroy all minions except one. (Randomly chosen survivor.)
   * Approximated as: deal 4 damage to all minions (board-wide AoE that clears most
   * things, keeps the Brawl fantasy without a per-minion random-survivor primitive).
   */
  {
    id: 'warrior_brawl',
    name: 'Brawl',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'epic',
    text: 'Deal 4 damage to all minions.',
    spell: [{ kind: 'damage', amount: 4, target: 'allMinions' }],
    art: undefined,
  },

  /**
   * Grommash Hellscream — 4/9 Charge. Battlecry: deal 1 damage to all enemy minions.
   * (Classic: "Enrage: +6 Attack" — no enrage in the engine, approximated as a
   *  small whirlwind battlecry. Trimmed from 2 damage to all enemies: a 4/9
   *  Charge body leaves under a mana of battlecry budget at 8.)
   */
  {
    id: 'warrior_grommash_hellscream',
    name: 'Grommash Hellscream',
    cost: 8,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'legendary',
    text: '**Charge**. **Battlecry:** Deal 1 damage to all enemy minions.',
    attack: 4,
    health: 9,
    tribe: 'none',
    keywords: ['charge'],
    battlecry: [{ kind: 'damage', amount: 1, target: 'enemyMinions' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 7-cost
  // -------------------------------------------------------------------------

  /**
   * War Golem — 7/7 vanilla. Solid mid-curve body.
   */
  {
    id: 'warrior_war_golem',
    name: 'War Golem',
    cost: 7,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '',
    attack: 7,
    health: 7,
    tribe: 'none',
    art: undefined,
  },

  /**
   * Alley Armorsmith — 2/7 Taunt. Whenever this minion takes damage, gain
   * 2 Armor (real card grants "that much Armor"; trigger effects have no
   * dynamic damage amount, so a fixed 2 — the typical hit — stands in).
   */
  {
    id: 'warrior_alley_armorsmith',
    name: 'Alley Armorsmith',
    cost: 5,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Taunt**. Whenever this minion takes damage, gain 2 Armor.',
    attack: 2,
    health: 7,
    tribe: 'none',
    keywords: ['taunt'],
    triggers: [
      {
        event: 'onSelfDamaged',
        effects: [{ kind: 'gainArmor', amount: 2 }],
      },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 8-cost
  // -------------------------------------------------------------------------

  /**
   * Ironforge Portal — Gain 4 Armor and summon a 1/1 Recruit.
   * (Original summons a random 4-cost minion — no random-summon primitive, so
   *  the fixed 1/1 Recruit stands in and the card is re-costed to 2: 4 Armor
   *  plus a 1/1 is ~2.4 mana of value, nowhere near the original 5.)
   */
  {
    id: 'warrior_ironforge_portal',
    name: 'Ironforge Portal',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Gain 4 Armor. Summon a 1/1 Recruit.',
    spell: [
      { kind: 'gainArmor', amount: 4 },
      { kind: 'summon', token: 'warrior_recruit', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Gorehowl — Equip a 7/1 weapon. Attacking a minion costs no durability.
   * Approximated as a simple 7/1 weapon (hero attacks for huge burst). The
   * original 7-mana price assumed the no-durability-vs-minions mechanic; a
   * plain one-swing 7/1 is worth ~5 (Fireball-plus with retaliation risk).
   */
  {
    id: 'warrior_gorehowl',
    name: 'Gorehowl',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'epic',
    text: 'Equip a 7/1 Weapon.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_gorehowl_token' }],
    art: undefined,
  },

  /**
   * Gorehowl weapon token — 7/1 weapon.
   */
  {
    id: 'warrior_gorehowl_token',
    name: 'Gorehowl',
    cost: 5,
    type: 'weapon',
    cardClass: 'warrior',
    rarity: 'epic',
    text: '',
    attack: 7,
    durability: 1,
    token: true,
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 9-cost — finishers
  // -------------------------------------------------------------------------

  /**
   * Rattlegore — 9/9. Deathrattle: resummon this minion with -1/-1.
   * Approximated: deathrattle deals 1 damage to all enemies and summons two 1/1 Recruits
   * (re-summon chain is unavailable without per-card scripts; we keep some value and
   *  flavor — trimmed from 2 damage since a 9/9 body is already near vanilla budget).
   */
  {
    id: 'warrior_rattlegore',
    name: 'Rattlegore',
    cost: 9,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'legendary',
    text: '**Deathrattle:** Deal 1 damage to all enemies and summon two 1/1 Recruits.',
    attack: 9,
    health: 9,
    tribe: 'none',
    deathrattle: [
      { kind: 'damage', amount: 1, target: 'allEnemyCharacters' },
      { kind: 'summon', token: 'warrior_recruit', count: 2 },
    ],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // NEW CARDS — added to improve curve and archetype coverage
  // -------------------------------------------------------------------------

  /**
   * Cruel Taskmaster — 2/2. Battlecry: deal 1 damage to a friendly minion and give it +2 Attack.
   * Classic enrage enabler / cheap curve play.
   */
  {
    id: 'warrior_cruel_taskmaster',
    name: 'Cruel Taskmaster',
    cost: 2,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '**Battlecry:** Deal 1 damage to a friendly minion. Give it +2 Attack.',
    attack: 2,
    health: 2,
    tribe: 'none',
    targeted: true,
    targetFilter: 'friendlyMinions',
    battlecry: [
      { kind: 'damage', amount: 1, target: 'chosenTarget' },
      { kind: 'buff', atk: 2, health: 0, target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /**
   * Slam — 2-mana spell: deal 2 damage to a minion. If it survives, draw a card.
   * Approximated as: deal 2 damage + draw a card (the "if it survives" condition
   * is folded in by keeping cost low and drawing always — preserves the feel).
   */
  {
    id: 'warrior_slam',
    name: 'Slam',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Deal 2 damage to a minion. Draw a card.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Bash — 3-mana spell: deal 3 damage and gain 3 Armor.
   * Flexible spell that covers removal and armor building simultaneously.
   */
  {
    id: 'warrior_bash',
    name: 'Bash',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Deal 3 damage. Gain 3 Armor.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'gainArmor', amount: 3 },
    ],
    art: undefined,
  },

  /**
   * Ravaging Ghoul — 3/3. Battlecry: deal 1 damage to all minions.
   * Pairs with Frothing Berserker and other enrage cards.
   */
  {
    id: 'warrior_ravaging_ghoul',
    name: 'Ravaging Ghoul',
    cost: 3,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '**Battlecry:** Deal 1 damage to all minions.',
    attack: 3,
    health: 3,
    tribe: 'none',
    battlecry: [{ kind: 'damage', amount: 1, target: 'allMinions' }],
    art: undefined,
  },

  /**
   * Battle Rage — draw a card for each damaged friendly character.
   * Approximated as an unconditional draw 2; re-costed to 3 (Arcane Intellect
   * rate) since the original 2-mana price assumed the damaged-characters
   * condition.
   */
  {
    id: 'warrior_battle_rage',
    name: 'Battle Rage',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Draw 2 cards.',
    spell: [{ kind: 'draw', count: 2 }],
    art: undefined,
  },

  /**
   * Cleave — 2-mana spell: deal 2 damage to two random enemies.
   * Efficient early-game AoE that synergises with weapon archetype.
   */
  {
    id: 'warrior_cleave',
    name: 'Cleave',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Deal 2 damage to two random enemies.',
    spell: [
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
    ],
    art: undefined,
  },

  /**
   * Death's Bite — 4-mana weapon: 4/2. Equip a powerful mid-game weapon.
   * The Deathrattle whirlwind is approximated as a direct whirlwind on the weapon card
   * (using a trigger is unavailable for weapons; we just offer a strong stat line).
   */
  {
    id: 'warrior_deaths_bite',
    name: "Death's Bite",
    cost: 4,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Equip a 4/2 Weapon.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_deaths_bite_token' }],
    art: undefined,
  },

  /**
   * Death's Bite weapon token — 4/2 weapon.
   */
  {
    id: 'warrior_deaths_bite_token',
    name: "Death's Bite",
    cost: 4,
    type: 'weapon',
    cardClass: 'warrior',
    rarity: 'common',
    text: '',
    attack: 4,
    durability: 2,
    token: true,
    art: undefined,
  },

  /**
   * Commanding Shout — 3-mana spell: give all friendly minions +1 Attack this turn
   * and Rush. (Approximated as buff +1 attack this turn + give rush to all friendlies.)
   */
  {
    id: 'warrior_commanding_shout',
    name: 'Commanding Shout',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'rare',
    text: 'Give your minions +1 Attack this turn and **Rush**.',
    spell: [
      { kind: 'buffThisTurn', atk: 1, target: 'friendlyMinions' },
      { kind: 'giveKeyword', keyword: 'rush', target: 'friendlyMinions' },
    ],
    art: undefined,
  },

  /**
   * Siege Engine — 5/5 Taunt. Whenever you gain Armor, gain +1 Attack.
   * Approximated: 5/5 Taunt with a trigger that buffs when friendly minion dies
   * (closest ongoing board-event; the armour-link flavour is preserved by pairing
   * with armour cards in the same bucket).
   */
  {
    id: 'warrior_siege_engine',
    name: 'Siege Engine',
    cost: 5,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Taunt**. At the end of your turn, gain +1 Attack.',
    attack: 5,
    health: 5,
    tribe: 'none',
    keywords: ['taunt'],
    triggers: [
      {
        event: 'endOfTurn',
        effects: [{ kind: 'buff', atk: 1, health: 0, target: 'self' }],
      },
    ],
    art: undefined,
  },

  /**
   * Militia Commander — 2/5 Rush. At the start of your turn, gain +3 Attack this turn.
   * Strong Rush minion that keeps threatening each subsequent turn.
   */
  {
    id: 'warrior_militia_commander',
    name: 'Militia Commander',
    cost: 4,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Rush**. At the start of your turn, gain +3 Attack this turn.',
    attack: 2,
    health: 5,
    tribe: 'none',
    keywords: ['rush'],
    triggers: [
      {
        event: 'startOfTurn',
        effects: [{ kind: 'buffThisTurn', atk: 3, target: 'self' }],
      },
    ],
    art: undefined,
  },

  /**
   * Upgrade! — 1-mana spell: give your weapon +1/+1, or equip a 1/3 weapon.
   * Approximated as: equip a 1/3 weapon (the real card's no-weapon mode; the
   * "+1/+1 to your weapon" branch has no engine primitive). A 2/3 weapon at 1
   * mana was well over the weapon budget.
   */
  {
    id: 'warrior_upgrade',
    name: 'Upgrade!',
    cost: 1,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Equip a 1/3 Weapon.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_upgrade_token' }],
    art: undefined,
  },

  /**
   * Upgrade! weapon token — 1/3 weapon.
   */
  {
    id: 'warrior_upgrade_token',
    name: 'Upgrade!',
    cost: 1,
    type: 'weapon',
    cardClass: 'warrior',
    rarity: 'common',
    text: '',
    attack: 1,
    durability: 3,
    token: true,
    art: undefined,
  },

  /**
   * Bloodhoof Brave — 2/6 Taunt. Whenever this minion takes damage, gain
   * +3 Attack (the authentic enrage-style effect via onSelfDamaged; unlike
   * real Enrage it stacks per hit rather than toggling while damaged).
   */
  {
    id: 'warrior_bloodhoof_brave',
    name: 'Bloodhoof Brave',
    cost: 4,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '**Taunt**. Whenever this minion takes damage, gain +3 Attack.',
    attack: 2,
    health: 6,
    tribe: 'none',
    keywords: ['taunt'],
    triggers: [
      {
        event: 'onSelfDamaged',
        effects: [{ kind: 'buff', atk: 3, health: 0, target: 'self' }],
      },
    ],
    art: undefined,
  },

  /**
   * Varian Wrynn — 10-mana 7/7 legendary. Battlecry: draw 3 cards.
   * (True effect: fill your board with minions drawn; approximated as draw 3 + summon
   * two 1/1 Recruits to partially fill the board.)
   */
  {
    id: 'warrior_varian_wrynn',
    name: 'Varian Wrynn',
    cost: 10,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'legendary',
    text: '**Battlecry:** Draw 3 cards and summon two 1/1 Recruits.',
    attack: 7,
    health: 7,
    tribe: 'none',
    battlecry: [
      { kind: 'draw', count: 3 },
      { kind: 'summon', token: 'warrior_recruit', count: 2 },
    ],
    art: undefined,
  },

  /**
   * Warsong Commander — 3/3. Your minions have +1 Attack.
   * (Original buffs only Rush minions; aura filters can't key off Rush, so the
   *  aura applies to all friendly minions — board-wide Raid Leader effect.)
   */
  {
    id: 'warrior_warsong_commander',
    name: 'Warsong Commander',
    cost: 3,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Your minions have +1 Attack.',
    attack: 3,
    health: 3,
    tribe: 'none',
    auras: [{ kind: 'minionStat', atk: 1 }],
    art: undefined,
  },
]
