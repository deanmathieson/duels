# EffectSpec & Engine Contract (read me first)

This is the shared spec for the parallel build. `game/types.ts` is the frozen TypeScript
contract; this doc explains the conventions and the exact behaviour the engine must implement
so that the **data** workers and the **engine** worker agree.

> Golden rule: cards/treasures/hero-powers are **data**. New content = new data, not new engine
> code — unless it needs a `ScriptId` (a hand-written compound effect), which the engine worker
> implements once.

## Naming conventions

- **Card ids**: lowercase snake_case, stable, e.g. `innervate`, `wild_growth`, `druid_of_the_claw`,
  `chillwind_yeti`, `ancient_of_lore`. Tokens: `treant`, `sapling`, `panther`, `the_coin`.
- **Hero power ids**: `hp_natures_gifts`, `hp_invigorating_bloom`, `hp_harvest_time`, plus enemy
  ones like `hp_fireblast`, `hp_steady_shot`, `hp_reinforce`, `hp_life_tap`, `hp_armor_up`.
- **Treasure ids**: `tr_<name>` e.g. `tr_robe_of_the_magi`, `tr_supercharge`. Signature: `sig_<name>`.
- **Enemy ids**: `enemy_aggro_hunter`, `enemy_control_mage`, ... `boss_<name>`.

## Token cards required (data/cards/tokens.ts, `token: true`)

`treant` 2/2 minion · `sapling` 1/1 minion · `panther` 3/2 Beast · `the_coin` 0-cost spell
(`gainManaThisTurn 1`). Any token referenced by a `summon`/`addCardToHand` effect MUST exist.

## EffectSpec variants — engine behaviour

The engine interprets `EffectSpec[]` **in order**. Implement every variant; throw in dev on an
unhandled `kind`. Targeting resolves via `TargetSelector` (see types.ts).

| kind | behaviour |
|---|---|
| `damage` | Deal `amount` to target(s). Spell Damage bonus applies when the source is a spell/hero-power. Divine Shield absorbs. |
| `heal` | Restore up to missing health. Cannot exceed maxHealth. |
| `draw` | Draw `count` for `who` (default self). Empty deck → fatigue (escalating 1,2,3… to hero). Overdraw (hand>10) burns the card. |
| `addCardToHand` | Add `count`×`cardId` to hand (burn if full). |
| `addRandomCardToHand` | Pick `count` random cards from `pool`; apply `costReduction`. Class-locked (see below). |
| `gainCoin` | Add `count`× `the_coin` to hand. |
| `discover` | Present 3 random cards from `pool` as a `PendingChoice` (type `discover`); chosen card → hand with optional `costReduction`. Pauses resolution until `resolveChoice`. Class-locked (see below). |

### Generation class lock

Card generation (`discover`, `addRandomCardToHand`, and generation scripts) is **locked to
the receiving hero's class plus neutral** by default — a Mage's "Discover a spell" only
offers Mage/neutral spells. Cards whose text names a class or says "from any class" opt
out via the optional `fromClass` field on the effect:

- `fromClass: 'mage'` → exactly that class ("Add 3 random **Mage** spells to your hand").
- `fromClass: 'any'` → unrestricted ("Add a random spell **from any class**").

Pools always exclude `token: true` cards and enemy-deck-only cards (`set: 'enemy'`).
If a lock would empty a pool, the engine falls back to the unlocked pool.

### Keywords & the aura layer

A minion's effective keywords/stats are three layers, materialized into
`MinionInstance.keywords`/stats after every board change by `recomputeAuras`:

1. **Base** — the card def's `keywords` (plus Choose One overrides).
2. **Permanent grants** — `giveKeyword`/`giveDivineShield` effects. Permanent:
   they survive aura sources leaving play (a grant takes ownership of the
   keyword even if an aura was already providing it).
3. **Aura layer** — `giveKeyword`/`minionStat` auras from board minions and
   passive treasures. Continuous: recomputed from live sources, so the grant
   disappears when the source dies, leaves play or is silenced. Reverting an
   aura never strips base or permanently granted keywords.

Rules the engine enforces:

- **Stat auras retain damage**: losing a `+health` aura subtracts the full aura
  amount, so a damaged minion can drop to 0 and die (the Mal'Ganis rule).
- **Stateful keywords can't be auras**: `divineShield` (consumed by damage) and
  `stealth` (breaks on attack) are ignored by `giveKeyword` AURAS — a re-applied
  continuous grant would resurrect them every recompute. Grant them via
  one-time `giveKeyword` effects instead.
- **Silence** strips all three layers from the minion and stops it projecting
  or receiving auras.
- **Keyword filters are live**: "your Taunt minions" auras match minions
  *granted* Taunt later, not just cards printed with it.
- **Stealth**: a stealthed minion can't be attacked or targeted by the enemy
  (random/AoE effects still hit it), its Taunt does not enforce, and Stealth
  breaks when it attacks.

### Damage triggers

Three trigger events fire when a minion loses health (mirroring the
onMinionDeath / onFriendlyMinionDeath pair; `triggerSource` = the damaged minion):

- `onSelfDamaged` — the trigger's own minion took the damage (Imp Gang Boss).
- `onFriendlyMinionDamaged` — a friendly minion (including the trigger's owner
  minion itself) took damage (Armorsmith).
- `onMinionDamaged` — any minion on either side took damage (Frothing Berserker).

Rules: Divine Shield absorbs do NOT fire them (no health was lost); hero damage
never fires them; lethal damage DOES fire them — the trigger resolves while the
dying minion is still on board, before deaths are processed (Imp Gang Boss
summons his Imp even on the killing blow). Each point-of-contact counts once per
damage instance (an AoE hitting three friendly minions fires Armorsmith three
times). Trigger effects that deal further damage re-enter the cycle; the engine
bounds resolution to guard against infinite trigger loops.
| `shuffleIntoDeck` | Insert `count`×`cardId` at random deck positions. |
| `gainManaCrystal` | +`count` permanent crystals (cap 10). `empty:true` = crystal not refilled this turn (Wild Growth). |
| `gainManaThisTurn` | +`amount` available mana this turn only (can exceed current max, capped at 10 available). |
| `refreshMana` | Set current mana = max. |
| `reduceCostInHand` | Reduce cost of cards in hand matching `filter`/`minCost` by `amount` (sticky via `CardInstance.costReduction`). |
| `summon` | Summon `count`×`token` minions on `side` (default friendly). Respect 7-board cap. |
| `summonPerManaCrystal` | Summon one `token` per current max mana crystal (board cap applies). |
| `buff` | +atk/+health permanently to target(s) (raises maxHealth). |
| `buffThisTurn` | +atk to target(s) until end of turn (Savage Roar). |
| `giveKeyword` | Grant keyword to target(s). |
| `giveDivineShield` | Set divine shield on target(s). |
| `setStats` | Override atk/health on target(s). |
| `silence` | Remove keywords, buffs, triggers, auras, deathrattles; reset to base stats (min). |
| `destroy` | Destroy target minion(s) (fires deathrattle). |
| `gainArmor` | +armor to hero (`who`). |
| `heroAttackThisTurn` | Give friendly hero +amount attack this turn. |
| `spellDamageThisTurnHero` | Friendly hero gains +amount Spell Damage this turn. |
| `equipWeapon` | Equip `cardId` weapon (replaces existing). |
| `script` | Run the named `ScriptId` (see below). |

### Treasure offerings: synergy weighting & jackpots

Treasure offerings (game/run/rewards.ts `generateTreasureOffering`) are not a
flat shuffle:

- **Synergy weighting** — `deckSynergies(cards)` scores the player's deck per
  `SynergyTag` (`spells`, `beasts`, `fae`, `ward`, `omen`, `haunt`, `swarm`,
  `big`, `weapons`); a treasure whose `tags` match the deck's lean is weighted
  up (`treasureWeight`: baseline 1 + 2.5 per matched signal point, so a hard
  lean ≈ 3.5x as likely). Untagged treasures are universal and stay baseline.
- **Jackpots** — treasures with `jackpot: true` are run-warping crazies kept
  OUT of the normal rotation. Each offering rolls one jackpot slot with
  probability `JACKPOT_CHANCE` (0.2 in the run store); elite-kill bonus
  offerings always include one. Jackpot passives ignore tier banding (a
  round-1 offering can hit one). The picker renders them as **mythic**.
- Authoring rules: a jackpot must read as absurd on sight (Hollowmoor voice,
  mythic-worthy); give every non-universal treasure 1–2 `SynergyTag`s; ids use
  the `tr_jp_` prefix for jackpots.

### ScriptId implementations (engine worker)

- `harvestTime`: destroy the chosen minion; summon two `sapling` on **that minion's owner's** side.
- `mulch`: destroy the chosen minion; add one `addRandomCardToHand {pool:'minion'}` to the **opponent**.
- `marvelousMycelium`: 3×{ discover `chooseOne` card, mark it "both effects combined", shuffle into deck }.
- `herdingHornCopy`: weapon trigger `onPlayBeast` → `summon` a copy of the just-played beast; weapon loses 1 durability.
- `zukaraRecast`: minion trigger `onSpellCast4Plus` → cast that spell again with random legal targets.
- `awakenedAncientUpgrade`: may be a no-op v1.

## Engine rules the tests will assert

1. **Turn start**: active player gains a mana crystal (cap 10), refills mana to max, draws 1, untaps
   minions (`attacksThisTurn=0`, clear `summonedThisTurn`), resets hero power, fires `startOfTurn`.
2. **Summoning sickness**: a summoned minion can't attack the turn it's played unless it has `charge`
   (can attack anything) or `rush` (can attack minions only) that turn.
3. **Combat**: attacker and defender deal their attack to each other simultaneously. Divine Shield
   absorbs one instance of damage (no health lost). 0-or-less health → death. `poisonous` destroys any
   damaged minion. `lifesteal` heals the attacking hero/owner. Taunt must be cleared before non-taunt
   targets can be attacked. Windfury = 2 attacks/turn.
4. **Deaths**: after any damage step, all 0-health minions die together; deathrattles fire in play order;
   then `onMinionDeath` triggers fire.
5. **Spell Damage**: sum of board `spellDamage` + hero temp bonus, added to spell/hero-power `damage`.
6. **Win/Loss**: a hero at ≤0 health (after armor) loses. Both → draw. Sets `phase='gameOver'`, `winner`.
7. **Choose One**: if `chooseOneIndex` is set on `playCard`, apply that option (stats for minions, effects
   for spells). If a hero power has `chooseOne`, same via `useHeroPower.chooseOneIndex`.
8. **Pending choices**: `discover` sets `pendingChoice` + emits `choiceRequired`; the next legal action
   must be `resolveChoice`. Engine resumes any queued effects after resolution.

## Encoding examples (data workers copy these patterns)

```ts
// Innervate — 0 mana spell: gain 2 mana this turn
{ id:'innervate', name:'Innervate', cost:0, type:'spell', cardClass:'druid', rarity:'free',
  text:'Gain 2 Mana Crystals this turn only.', spell:[{kind:'gainManaThisTurn',amount:2}] }

// Wild Growth — gain an empty Mana Crystal
{ id:'wild_growth', cost:2, type:'spell', cardClass:'druid', ...,
  spell:[{kind:'gainManaCrystal',count:1,empty:true}] }

// Wrath — Choose One: 3 dmg; or 1 dmg + draw
{ id:'wrath', cost:2, type:'spell', cardClass:'druid', targeted:true, targetFilter:'allMinions',
  chooseOne:[
    { text:'Deal 3 damage.', effects:[{kind:'damage',amount:3,target:'chosenTarget'}] },
    { text:'Deal 1 damage. Draw a card.', effects:[{kind:'damage',amount:1,target:'chosenTarget'},{kind:'draw',count:1}] }
  ] }

// Swipe — 4 to a target, 1 to other enemies
{ id:'swipe', cost:4, type:'spell', cardClass:'druid', targeted:true, targetFilter:'allEnemyCharacters',
  spell:[{kind:'damage',amount:4,target:'chosenTarget'},{kind:'damage',amount:1,target:'otherEnemies'}] }

// Savage Roar — your characters +2 Attack this turn
{ id:'savage_roar', cost:3, type:'spell', cardClass:'druid',
  spell:[{kind:'buffThisTurn',atk:2,target:'allFriendlyCharacters'},{kind:'heroAttackThisTurn',amount:2}] }

// Druid of the Claw — minion Choose One (stats applied to the played minion)
{ id:'druid_of_the_claw', cost:5, type:'minion', cardClass:'druid', attack:4, health:4, tribe:'beast',
  chooseOne:[
    { text:'4/4 Charge', stats:{attack:4,health:4}, keywords:['charge'] },
    { text:'4/6 Taunt', stats:{attack:4,health:6}, keywords:['taunt'] } ] }

// Force of Nature — summon three 2/2 Treants
{ id:'force_of_nature', cost:5, type:'spell', cardClass:'druid',
  spell:[{kind:'summon',token:'treant',count:3}] }

// Chillwind Yeti — vanilla 4/5
{ id:'chillwind_yeti', cost:4, type:'minion', cardClass:'neutral', attack:4, health:5, rarity:'common', text:'' }

// PASSIVE treasure — Robe of the Magi: your spells cost (1) less
{ id:'tr_robe_of_the_magi', name:'Robe of the Magi', kind:'passive',
  text:'Your spells cost (1) less.', auras:[{kind:'costReduction',amount:1,filter:'spell'}] }

// PASSIVE — Bitter Cold: your minions have +1 Attack
{ id:'tr_bitter_cold', kind:'passive', text:'Your minions have +1 Attack.',
  auras:[{kind:'minionStat',atk:1,filter:'minion'}] }

// ACTIVE treasure — Supercharge: gain 2 Mana Crystals this turn (a 0-cost card)
{ id:'tr_supercharge', name:'Supercharge', kind:'active', text:'Gain 2 Mana Crystals this turn.',
  card:{ id:'tr_supercharge', name:'Supercharge', cost:0, type:'spell', cardClass:'neutral',
         rarity:'epic', text:'Gain 2 Mana Crystals this turn.', spell:[{kind:'gainManaThisTurn',amount:2}], token:true } }

// SIGNATURE — Warden's Insight: Choose One — refresh mana; or a Treant per crystal
{ id:'sig_wardens_insight', name:"Warden's Insight", kind:'signature', text:'Choose One - Refresh your Mana Crystals; or Summon a Treant for each Mana Crystal you have.',
  card:{ id:'sig_wardens_insight', name:"Warden's Insight", cost:4, type:'spell', cardClass:'druid', rarity:'legendary',
    text:'Choose One - Refresh your Mana Crystals; or Summon a Treant for each Mana Crystal you have.',
    chooseOne:[ { text:'Refresh your Mana Crystals.', effects:[{kind:'refreshMana'}] },
                { text:'Summon a Treant for each Mana Crystal.', effects:[{kind:'summonPerManaCrystal',token:'treant'}] } ], token:true } }
```

## Hero powers — Forest Warden Omu (data/heroes.ts)

```ts
{ id:'hp_natures_gifts', name:"Nature's Gifts", cost:2, text:'Choose One - +2 Attack this turn; or Spell Damage +2 this turn.',
  chooseOne:[ {text:'+2 Attack this turn',effects:[{kind:'heroAttackThisTurn',amount:2}]},
              {text:'Spell Damage +2 this turn',effects:[{kind:'spellDamageThisTurnHero',amount:2}]} ] }
{ id:'hp_invigorating_bloom', name:'Invigorating Bloom', cost:2, text:'Reduce the Cost of cards in your hand that cost (5) or more by (1).',
  effects:[{kind:'reduceCostInHand',amount:1,minCost:5}] }
{ id:'hp_harvest_time', name:'Harvest Time!', cost:3, targeted:true, targetFilter:'allMinions',
  text:'Destroy a minion, then summon two 1/1 Saplings for that minion\'s owner.', scriptId:'harvestTime' }
```

## Engine public API (for Phase 2 UI workers)

- `applyAction(state, action): { state, events }` — the only mutator. Returns NEW state.
- `queries`: `getPlayableCards`, `getValidTargets`, `getAttackers`, `getAttackTargets`, `getLiveCost`,
  `isLethalAvailable`, `getWinner` (see `EngineQueries` in types.ts).
- `chooseAiAction(state, player, profile): Action` — AI's next move.
- `createInitialState(setup, seed): GameState` and `startGame` action both available; UI uses the
  store which wraps these.
