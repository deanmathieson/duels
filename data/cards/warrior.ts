import type { CardDef } from '../../game/types'

/**
 * Banneret class cards for Ser Wystan Crowmarch — Armor, weapons, big minions,
 * board control. ~30 collectible cards spanning the 1-9 mana curve, plus token cards.
 */
export const warriorCards: CardDef[] = [

  // -------------------------------------------------------------------------
  // Token cards (token: true) — referenced by warrior card effects
  // -------------------------------------------------------------------------

  /**
   * Recruit — 1/1 token summoned by various Banneret effects (the militia levy).
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
   * (Not currently summoned by any collectible card. Name matches the
   * neutral 'Damaged Golem' token for consistency.)
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
   * Shieldwife's Greeting — a shield-bash answer to unwanted suitors.
   * (Scaling-off-armor isn't an engine primitive, so this is a fixed strong
   *  hit paired with small armor gain.)
   */
  {
    id: 'warrior_shield_slam',
    name: "Shieldwife's Greeting",
    cost: 1,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'epic',
    text: 'Gain 2 Armor. Deal 3 damage to a minion.',
    flavor: 'She greets every suitor the same way: shield first, teeth after. The lucky ones limp home by lauds.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'gainArmor', amount: 2 },
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
    ],
    art: undefined,
  },

  /**
   * Pot-Valour — Give your hero +4 Attack this turn.
   */
  {
    id: 'warrior_heroic_strike',
    name: 'Pot-Valour',
    cost: 1,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Give your hero +4 Attack this turn.',
    flavor: 'Four pints make any man a champion. The fifth is strictly for aiming.',
    spell: [{ kind: 'heroAttackThisTurn', amount: 4 }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 2-cost
  // -------------------------------------------------------------------------

  /**
   * Threshing Season — Deal 1 damage to all minions.
   */
  {
    id: 'warrior_whirlwind',
    name: 'Threshing Season',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Deal 1 damage to all minions.',
    flavor: "Come autumn, everything on the moor gets beaten — the barley, the hedges, and whoever's still standing in the barn.",
    spell: [{ kind: 'damage', amount: 1, target: 'allMinions' }],
    art: undefined,
  },

  /**
   * Rent Collector's Axe — Equip a 3/2 weapon.
   * Costed at 3: a 3/2 weapon at 2 mana is above the
   * attack×durability ≈ 2.2×cost weapon budget.
   */
  {
    id: 'warrior_fiery_war_axe',
    name: "Rent Collector's Axe",
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Equip a 3/2 Weapon.',
    flavor: 'She accepts payment in coin, kindling, or knuckles. Mostly knuckles.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_fiery_war_axe_token' }],
    art: undefined,
  },

  /**
   * Rent Collector's Axe weapon token.
   */
  {
    id: 'warrior_fiery_war_axe_token',
    name: "Rent Collector's Axe",
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
   * Coffin-Lid Buckler — Gain 5 Armor. Draw a card.
   */
  {
    id: 'warrior_shield_block',
    name: 'Coffin-Lid Buckler',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Gain 5 Armor. Draw a card.',
    flavor: "The previous owner lodged no complaints. None you'd repeat in church, anyway.",
    spell: [
      { kind: 'gainArmor', amount: 5 },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Red-Eyed Reveler — 2/4. Whenever a minion takes damage, gain +1 Attack
   * (via the onMinionDamaged trigger — fires for minions on both sides,
   * including itself).
   */
  {
    id: 'warrior_frothing_berserker',
    name: 'Red-Eyed Reveler',
    cost: 3,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: 'Whenever a minion takes damage, gain +1 Attack.',
    flavor: "Every spilled drop gets him going — ale, blood, he's long stopped asking which.",
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
   * Debt-Spurred Lancer — 4/3 with Charge.
   */
  {
    id: 'warrior_korkron_elite',
    name: 'Debt-Spurred Lancer',
    cost: 4,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Charge**',
    flavor: 'Nothing puts spurs to a knight like two creditors and one angry husband.',
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
   * Village Dentwright — 1/4. Whenever a friendly minion takes damage, gain
   * 1 Armor (via onFriendlyMinionDamaged — includes itself).
   */
  {
    id: 'warrior_armorsmith',
    name: 'Village Dentwright',
    cost: 2,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: 'Whenever a friendly minion takes damage, gain 1 Armor.',
    flavor: 'She hammers the dents from breastplates and the shame from husbands. Same rates, same grunting.',
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
   * Gallows-Hill Verdict — Destroy a minion.
   * The engine has no "damaged minion" conditional, so this is an unconditional
   * destroy — costed at 5, the going rate for unconditional removal.
   */
  {
    id: 'warrior_execute',
    name: 'Gallows-Hill Verdict',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Destroy a minion.',
    flavor: 'Hollowmoor justice is famously fair: everybody hangs.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
    art: undefined,
  },

  // -------------------------------------------------------------------------
  // 5-cost
  // -------------------------------------------------------------------------

  /**
   * Dame Ironbodice — 5/5 with Ward. Omen: Gain 5 Armor.
   * Costed at 6: a budget 5/5 Ward body plus ~2 mana of armor
   * was well over curve at 5.
   */
  {
    id: 'warrior_shieldmaiden',
    name: 'Dame Ironbodice',
    cost: 6,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Ward**. **Omen:** Gain 5 Armor.',
    flavor: 'Many have tried to get past her defenses. The survivors still send flowers.',
    attack: 5,
    health: 5,
    tribe: 'none',
    keywords: ['taunt'],
    battlecry: [{ kind: 'gainArmor', amount: 5 }],
    art: undefined,
  },

  /**
   * The Widowing Scythe — Equip a 5/2 weapon.
   */
  {
    id: 'warrior_arcanite_reaper',
    name: 'The Widowing Scythe',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Equip a 5/2 Weapon.',
    flavor: "It has made more widows than the war and the winter together — and unlike either, it's cheerful about it.",
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_arcanite_reaper_token' }],
    art: undefined,
  },

  /**
   * The Widowing Scythe weapon token.
   */
  {
    id: 'warrior_arcanite_reaper_token',
    name: 'The Widowing Scythe',
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
   * Closing Time — board-wide AoE that clears most things.
   * (A tavern-brawl wipe; no per-minion random-survivor primitive, so it's a
   *  flat 4 damage to all minions.)
   */
  {
    id: 'warrior_brawl',
    name: 'Closing Time',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'epic',
    text: 'Deal 4 damage to all minions.',
    flavor: 'The Stuck Pig has three house rules. No one has ever stayed sober long enough to learn the third.',
    spell: [{ kind: 'damage', amount: 4, target: 'allMinions' }],
    art: undefined,
  },

  /**
   * Hobnail Meg — 4/9 Charge. Omen: deal 1 damage to all enemy minions.
   * (A 4/9 Charge body leaves under a mana of battlecry budget at 8, hence
   *  the small board ping.)
   */
  {
    id: 'warrior_grommash_hellscream',
    name: 'Hobnail Meg',
    cost: 8,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'legendary',
    text: '**Charge**. **Omen:** Deal 1 damage to all enemy minions.',
    flavor: 'She has kicked open the church doors, the castle gate, and four marriages.',
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

  // (War Golem lives in neutral.ts — Bannerets draft the neutral copy.)

  /**
   * Back-Lane Tinker — 2/7 Ward. Whenever this minion takes damage, gain
   * 2 Armor (trigger effects have no dynamic damage amount, so a fixed 2 —
   * the typical hit — stands in).
   */
  {
    id: 'warrior_alley_armorsmith',
    name: 'Back-Lane Tinker',
    cost: 5,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Ward**. Whenever this minion takes damage, gain 2 Armor.',
    flavor: "He'll patch your hauberk, your kettle, and — for a penny extra — your reputation.",
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
   * The Muster-Drum — Gain 4 Armor and summon a 1/1 Recruit.
   * (4 Armor plus a 1/1 is ~2.4 mana of value, hence the cost of 2.)
   */
  {
    id: 'warrior_ironforge_portal',
    name: 'The Muster-Drum',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Gain 4 Armor. Summon a 1/1 Recruit.',
    flavor: 'One beat raises the militia. Two raises their wives, demanding to know whose idea this was.',
    spell: [
      { kind: 'gainArmor', amount: 4 },
      { kind: 'summon', token: 'warrior_recruit', count: 1 },
    ],
    art: undefined,
  },

  /**
   * Grandmother Ruin — Equip a 7/1 weapon. A plain one-swing 7/1 for huge
   * hero burst, worth ~5 with retaliation risk.
   */
  {
    id: 'warrior_gorehowl',
    name: 'Grandmother Ruin',
    cost: 5,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'epic',
    text: 'Equip a 7/1 Weapon.',
    flavor: 'The old poleaxe hangs above the bar. Once a generation, some fool takes her down. Once a generation is plenty.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_gorehowl_token' }],
    art: undefined,
  },

  /**
   * Grandmother Ruin weapon token — 7/1 weapon.
   */
  {
    id: 'warrior_gorehowl_token',
    name: 'Grandmother Ruin',
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
   * The Gallowsfather — 9/9. Haunt: deal 1 damage to all enemies and summon
   * two 1/1 Recruits. (A 9/9 body is already near vanilla budget, hence the
   * modest death effect.)
   */
  {
    id: 'warrior_rattlegore',
    name: 'The Gallowsfather',
    cost: 9,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'legendary',
    text: '**Haunt:** Deal 1 damage to all enemies and summon two 1/1 Recruits.',
    flavor: 'Every rope on the hill is his apron string, and every hanged lad calls him Da.',
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
   * Sergeant Thistlewhip — 2/2. Omen: deal 1 damage to a friendly minion and
   * give it +2 Attack. Cheap curve play and damage-trigger enabler.
   */
  {
    id: 'warrior_cruel_taskmaster',
    name: 'Sergeant Thistlewhip',
    cost: 2,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '**Omen:** Deal 1 damage to a friendly minion. Give it +2 Attack.',
    flavor: 'His motivational method is a stick. The stick is also named Sergeant Thistlewhip.',
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
   * Pewter Persuasion — 2-mana spell: deal 2 damage to a minion. Draw a card.
   * (The "if it survives" style condition is folded in by keeping cost low and
   * drawing always.)
   */
  {
    id: 'warrior_slam',
    name: 'Pewter Persuasion',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Deal 2 damage to a minion. Draw a card.',
    flavor: 'An honest Hollowmoor handshake: tankard first, questions after.',
    targeted: true,
    targetFilter: 'allMinions',
    spell: [
      { kind: 'damage', amount: 2, target: 'chosenTarget' },
      { kind: 'draw', count: 1 },
    ],
    art: undefined,
  },

  /**
   * The Bailiff's Knock — 3-mana spell: deal 3 damage and gain 3 Armor.
   * Flexible spell that covers removal and armor building simultaneously.
   */
  {
    id: 'warrior_bash',
    name: "The Bailiff's Knock",
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Deal 3 damage. Gain 3 Armor.',
    flavor: 'Once for courtesy. Twice for the debt. The third knock opens the door whether you do or not.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [
      { kind: 'damage', amount: 3, target: 'chosenTarget' },
      { kind: 'gainArmor', amount: 3 },
    ],
    art: undefined,
  },

  /**
   * The Knackerman — 3/3. Omen: deal 1 damage to all minions.
   * Pairs with Red-Eyed Reveler and other damage-trigger cards.
   */
  {
    id: 'warrior_ravaging_ghoul',
    name: 'The Knackerman',
    cost: 3,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '**Omen:** Deal 1 damage to all minions.',
    flavor: "He carts away the dead, and he's never been fussy about how recent.",
    attack: 3,
    health: 3,
    tribe: 'none',
    battlecry: [{ kind: 'damage', amount: 1, target: 'allMinions' }],
    art: undefined,
  },

  /**
   * Counsel of the Cask — draw 2 cards.
   * (Unconditional draw 2 at the standard 3-mana rate; the original
   * damaged-characters condition isn't an engine primitive.)
   */
  {
    id: 'warrior_battle_rage',
    name: 'Counsel of the Cask',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Draw 2 cards.',
    flavor: 'The third tankard knows things the first two were too shy to mention.',
    spell: [{ kind: 'draw', count: 2 }],
    art: undefined,
  },

  /**
   * The Wide Swathe — 2-mana spell: deal 2 damage to two random enemies.
   * Efficient early-game AoE that synergises with the weapon archetype.
   */
  {
    id: 'warrior_cleave',
    name: 'The Wide Swathe',
    cost: 2,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Deal 2 damage to two random enemies.',
    flavor: 'Aim is a luxury for sober men.',
    spell: [
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
      { kind: 'damage', amount: 2, target: 'randomEnemy' },
    ],
    art: undefined,
  },

  /**
   * The Sexton's Spade — 4-mana weapon spell: equip a 4/2 mid-game weapon.
   * (Weapons can't carry death-trigger effects, so it's a strong plain
   * stat line.)
   */
  {
    id: 'warrior_deaths_bite',
    name: "The Sexton's Spade",
    cost: 4,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Equip a 4/2 Weapon.',
    flavor: 'It digs graves coming and going.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_deaths_bite_token' }],
    art: undefined,
  },

  /**
   * The Sexton's Spade weapon token — 4/2 weapon.
   */
  {
    id: 'warrior_deaths_bite_token',
    name: "The Sexton's Spade",
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
   * Forward, You Sots! — 3-mana spell: give all friendly minions +1 Attack
   * this turn and Rush.
   */
  {
    id: 'warrior_commanding_shout',
    name: 'Forward, You Sots!',
    cost: 3,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'rare',
    text: 'Give your minions +1 Attack this turn and **Rush**.',
    flavor: "The sergeant's eloquence is legendary, unprintable, and astonishingly effective.",
    spell: [
      { kind: 'buffThisTurn', atk: 1, target: 'friendlyMinions' },
      { kind: 'giveKeyword', keyword: 'rush', target: 'friendlyMinions' },
    ],
    art: undefined,
  },

  /**
   * The Rolling Belfry — 5/5 Ward. At the end of your turn, gain +1 Attack.
   * (A siege relic that grinds ever forward; pairs naturally with the armor
   * buckets.)
   */
  {
    id: 'warrior_siege_engine',
    name: 'The Rolling Belfry',
    cost: 5,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Ward**. At the end of your turn, gain +1 Attack.',
    flavor: 'A siege tower from a war nobody remembers winning. It creaks toward the enemy out of pure habit.',
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
   * Captain of the Muster — 2/5 Rush. At the start of your turn, gain
   * +3 Attack this turn. Keeps threatening each subsequent turn.
   */
  {
    id: 'warrior_militia_commander',
    name: 'Captain of the Muster',
    cost: 4,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'rare',
    text: '**Rush**. At the start of your turn, gain +3 Attack this turn.',
    flavor: 'All spit and thunder at dawn. By dusk, mostly spit.',
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
   * Pawnbroker's Special — 1-mana spell: equip a 1/3 weapon.
   * (A 2/3 weapon at 1 mana was well over the weapon budget, so the
   *  secondhand blade stays humble.)
   */
  {
    id: 'warrior_upgrade',
    name: "Pawnbroker's Special",
    cost: 1,
    type: 'spell',
    cardClass: 'warrior',
    rarity: 'common',
    text: 'Equip a 1/3 Weapon.',
    flavor: 'Previous owner: deceased. The owner before that: also deceased. Lovely heft, though.',
    spell: [{ kind: 'equipWeapon', cardId: 'warrior_upgrade_token' }],
    art: undefined,
  },

  /**
   * Pawnbroker's Special weapon token — 1/3 weapon.
   */
  {
    id: 'warrior_upgrade_token',
    name: "Pawnbroker's Special",
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
   * The Goaded Drover — 2/6 Ward. Whenever this minion takes damage, gain
   * +3 Attack (via onSelfDamaged; stacks per hit).
   */
  {
    id: 'warrior_bloodhoof_brave',
    name: 'The Goaded Drover',
    cost: 4,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'common',
    text: '**Ward**. Whenever this minion takes damage, gain +3 Attack.',
    flavor: 'Twenty years of mud, oxen, and his mother-in-law. Go on. Hit him. See what happens.',
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
   * The Old Margrave — 10-mana 7/7 legendary. Omen: draw 3 cards and summon
   * two 1/1 Recruits — the county rides with him.
   */
  {
    id: 'warrior_varian_wrynn',
    name: 'The Old Margrave',
    cost: 10,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'legendary',
    text: '**Omen:** Draw 3 cards and summon two 1/1 Recruits.',
    flavor: 'He rides to war with three debts, two mistresses, and the whole county at his back.',
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
   * Bawdy Balladeer — 3/3. Your minions have +1 Attack.
   * (Board-wide attack aura; aura filters can't key off Rush.)
   */
  {
    id: 'warrior_warsong_commander',
    name: 'Bawdy Balladeer',
    cost: 3,
    type: 'minion',
    cardClass: 'warrior',
    rarity: 'free',
    text: 'Your minions have +1 Attack.',
    flavor: 'Her marching song has three hundred verses, each filthier than the last. Morale has never been higher.',
    attack: 3,
    health: 3,
    tribe: 'none',
    auras: [{ kind: 'minionStat', atk: 1 }],
    art: undefined,
  },
]
