# Content Manifest (canonical IDs & module contracts)

All workers MUST use exactly these IDs and export names so the parts integrate without conflict.
Read `game/EFFECTSPEC.md` for how to encode behaviour. Cross-references (e.g. enemy decks, buckets)
may ONLY use IDs listed here.

## Module export names (the integrator's registry imports these)

| File | Owner | Exports |
|---|---|---|
| `data/cards/tokens.ts` | B | `export const tokenCards: CardDef[]` |
| `data/cards/druid.ts` | B | `export const druidCards: CardDef[]` |
| `data/cards/neutral.ts` | B | `export const neutralCards: CardDef[]` |
| `data/cards/enemy.ts` | D | `export const enemyCards: CardDef[]` |
| `data/heroes.ts` | B | `export const heroes: HeroDef[]`, `export const heroPowers: HeroPowerDef[]` |
| `data/buckets.ts` | B | `export const buckets: BucketDef[]` |
| `data/treasures/passive.ts` | C | `export const passiveTreasures: TreasureDef[]` |
| `data/treasures/active.ts` | C | `export const activeTreasures: TreasureDef[]` |
| `data/treasures/signature.ts` | C | `export const signatureTreasures: TreasureDef[]` |
| `data/enemies.ts` | D | `export const enemies: EnemyDef[]` |

The integrator writes `data/registry.ts` that imports all of the above, calls
`registerCards([...all CardDefs..., ...embedded treasure cards, ...hero-power-as-cards])`, and exports
`getCardDef(id)`, `getHeroPowerDef(id)`, `getTreasureDef(id)`, `getHeroDef(id)`, `getBucketDef(id)`,
`getEnemyDef(id)`, plus `allCollectibleDruidCardIds`, `allCollectibleNeutralCardIds`.

## Card-database injection (Worker A owns `game/cardDb.ts`)

The engine is pure but needs card lookups (summon tokens, add/discover by pool). Worker A creates
`game/cardDb.ts`:

```ts
import type { CardDef, CardPool } from './types'
let DB: Record<string, CardDef> = {}
export function registerCards(cards: CardDef[]): void { for (const c of cards) DB[c.id] = c }
export function getCard(id: string): CardDef { const c = DB[id]; if (!c) throw new Error('Unknown card '+id); return c }
export function hasCard(id: string): boolean { return !!DB[id] }
export function getPool(pool: CardPool, lock?: PoolClassLock): CardDef[] { /* filter DB by pool: spell/minion/beast/druidSpell/chooseOne/legendaryMinion/any, excluding token:true and set:'enemy'. Generation defaults to the caster's class + neutral; effects opt out via fromClass — see EFFECTSPEC.md "Generation class lock" */ }
```

A Nuxt plugin (Phase 2/integration) calls `registerCards(...)` at startup with the full registry.
Engine tests register a small fixture set themselves.

## Required tokens (`data/cards/tokens.ts`, all `token:true`)

| id | stats | notes |
|---|---|---|
| `treant` | 2/2 minion | Force of Nature, Warden's Insight |
| `treant_taunt` | 2/2 minion, Taunt | Cenarius |
| `sapling` | 1/1 minion | Harvest Time!, Living Roots |
| `panther` | 3/2 Beast minion | Power of the Wild |
| `the_coin` | 0 spell, `gainManaThisTurn 1` | coins |

## Druid cards (`data/cards/druid.ts`) — exactly these 20 ids

`innervate`(0 spell, gain 2 mana this turn) · `moonfire`(0 spell, targeted, deal 1) ·
`claw`(1 spell, hero +2 atk this turn & +2 armor) · `living_roots`(1 spell, targeted, ChooseOne: deal 2 / summon two saplings) ·
`mark_of_the_wild`(2 spell, targeted friendly minion, +2/+2 & Taunt) · `wild_growth`(2 spell, empty crystal) ·
`wrath`(2 spell, targeted, ChooseOne 3dmg / 1dmg+draw) · `power_of_the_wild`(2 spell, ChooseOne: friendly minions +1/+1 / summon 3/2 panther) ·
`savage_roar`(3 spell, friendly characters +2 atk this turn) · `mulch`(3 spell, targeted enemy minion, scriptId `mulch`) ·
`keeper_of_the_grove`(4 minion 2/4, ChooseOne battlecry: deal 2 / silence; targeted) · `swipe`(4 spell, targeted enemy, 4 + 1 splash) ·
`nourish`(5 spell, ChooseOne: gain 2 crystals / draw 3) · `force_of_nature`(5 spell, summon three treants) ·
`druid_of_the_claw`(5 minion 4/4 Beast, ChooseOne 4/4 Charge / 4/6 Taunt) · `starfire`(6 spell, targeted, deal 5 & draw 1) ·
`ancient_of_lore`(7 minion 5/5, ChooseOne battlecry: draw 2 / heal 5 to chosenTarget) ·
`ancient_of_war`(7 minion 5/5 Ancient, ChooseOne 10/10 Taunt / 10/5) · `ironbark_protector`(8 minion 8/8 Taunt) ·
`cenarius`(9 minion 5/8 legendary, ChooseOne: other friendly minions +2/+2 / summon two `treant_taunt`)

## Neutral cards (`data/cards/neutral.ts`) — exactly these 14 ids

`wisp`(0,1/1) · `elven_archer`(1 minion 1/1, battlecry deal 1, targeted) · `river_crocolisk`(2,2/3 Beast) ·
`bloodfen_raptor`(3,3/2 Beast) · `ironfur_grizzly`(3,3/3 Taunt Beast) · `sen_jin_shieldmasta`(4,3/5 Taunt) ·
`chillwind_yeti`(4,4/5) · `oasis_snapjaw`(4,2/7 Beast) · `gnomish_inventor`(4,2/4 battlecry draw 1) ·
`sunwalker`(6,4/5 Taunt + Divine Shield) · `fire_elemental`(6,6/5 Elemental, battlecry deal 3, targeted) ·
`boulderfist_ogre`(6,6/7) · `war_golem`(7,7/7) · `stormwind_champion`(7,6/6, aura: other friendly minions +1/+1)

> Minion-sourced auras (`stormwind_champion`) apply to OTHER friendly minions only — engine excludes the source.

## Treasures (`data/treasures/*.ts`)

Passive ids (~16, Worker C): `tr_robe_of_the_magi`, `tr_bitter_cold`, `tr_inspiring_presence`,
`tr_hold_the_line`, `tr_natural_force`, `tr_rocket_backpacks`, `tr_arcane_brilliance`(spellDamage+1),
`tr_potion_of_sparking`, `tr_divine_illumination`, `tr_crystal_gem`(startOfGame +1 crystal),
`tr_iron_hide`(startOfGame +10 armor), `tr_vampiric_fangs`(minions Lifesteal), `tr_menagerie`(beasts +1/+1),
`tr_barkskin`(minions +0/+2), `tr_double_treant`(beasts +1 atk — or Treant synergy), `tr_growing_season`(taunt minions +0/+2).

Active ids (~12, Worker C — each embeds a `token:true` card): `tr_supercharge`(0, +2 mana this turn),
`tr_bag_of_coins`(1, gain 2 coins), `tr_archmage_staff`(1, discover a spell), `tr_pure_cold`(3, 2 dmg to all enemy minions),
`tr_blood_moon`(2, 1 dmg to all enemy minions), `tr_mark_of_might`(2, give a minion +3/+3, targeted),
`tr_meteor_strike`(3, deal 8 to a minion, targeted), `tr_healing_touch`(0, restore 8 to your hero),
`tr_summon_grizzly`(4, summon a 5/5 Beast — embed token `treasure_grizzly` 5/5), `tr_devastation`(5, 3 dmg to all enemies),
`tr_research`(2, draw 2), `tr_fortify`(2, gain 10 Armor).

Signature ids (6, Worker C — Forest Warden Omu; each embeds a `token:true` card):
`sig_wardens_insight`, `sig_herding_horn`, `sig_marvelous_mycelium`, `sig_awakened_ancient`, `sig_zukara`, `sig_moonbeast`.

## Hero (`data/heroes.ts`)

One `HeroDef` id `forest_warden_omu` (class druid) with `heroPowers:['hp_natures_gifts','hp_invigorating_bloom','hp_harvest_time']`
and `signatureTreasures:['sig_wardens_insight','sig_herding_horn','sig_marvelous_mycelium','sig_awakened_ancient','sig_zukara','sig_moonbeast']`.
Hero powers as in EFFECTSPEC.md. Also define enemy hero-power ids used by enemies (see below).

## Enemies (`data/enemies.ts` + `data/cards/enemy.ts`, Worker D)

6 enemies, tiers 1–6, last `isBoss`. Enemy decks draw from `neutralCards` + `enemyCards` (D authors ~12
simple class cards: e.g. `fireball`(4 mage, 6 dmg targeted), `frostbolt`(2, 3 dmg targeted), `arcane_intellect`(3, draw 2),
`kill_command`(3 hunter, 5 dmg targeted), `arcane_shot`(1, 2 dmg targeted), `animal_companion`(3, summon a Beast),
`shield_block`(3 warrior, gain 5 armor + draw), `consecration`(4 paladin, 2 dmg to all enemies),
`soulfire`(1 warlock, 4 dmg targeted), `flame_imp`(1, 3/2 Demon), `truesilver`(4 weapon 4/2), `assassinate`(5, destroy a minion, targeted)).
Enemy hero-power ids (define in `data/heroes.ts` too, or `enemyCards.ts`): `hp_fireblast`(2, deal 1, targeted),
`hp_steady_shot`(2, 2 dmg to enemy hero), `hp_reinforce`(2, summon a 1/1), `hp_life_tap`(2, draw a card + 2 self damage),
`hp_armor_up`(2, gain 2 armor), `hp_lesser_heal`(2, restore 2, targeted). Keep enemy decks ~16–20 cards.
