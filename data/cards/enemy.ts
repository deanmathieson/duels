import type { CardDef } from '../../game/types'

/**
 * Enemy-ONLY cards: effects that exist in enemy decks but have no player
 * counterpart. Everything an enemy deck shares with players now references the
 * player card id directly (data/enemies.ts), so the same-named card always
 * behaves identically on both sides of the board.
 *
 * All are tagged `set: 'enemy'` (below) so generation pools never offer them.
 */
const cards: CardDef[] = [
  // --- Warlock ---
  // Real Soulfire's discount is paid for by a discard; the engine has no discard,
  // so 4 damage costs 2 mana here.
  {
    id: 'soulfire',
    name: 'Soulfire',
    cost: 2,
    type: 'spell',
    cardClass: 'warlock',
    rarity: 'free',
    text: 'Deal 4 damage.',
    targeted: true,
    targetFilter: 'allCharacters',
    spell: [{ kind: 'damage', amount: 4, target: 'chosenTarget' }],
  },

  // --- Rogue ---
  {
    id: 'assassinate',
    name: 'Assassinate',
    cost: 5,
    type: 'spell',
    cardClass: 'rogue',
    rarity: 'free',
    text: 'Destroy an enemy minion.',
    targeted: true,
    targetFilter: 'enemyMinions',
    spell: [{ kind: 'destroy', target: 'chosenTarget' }],
  },
]

export const enemyCards: CardDef[] = cards.map((c) => ({ ...c, set: 'enemy' }))
