# Hollowmoor content

The single source of truth for game content is the TypeScript data in this
directory — start at `registry.ts`, which aggregates every card, hero, hero
power, treasure, bucket and enemy and registers them with the engine.

- `terms.ts` — the Hollowmoor dictionary (game title, keyword/tribe/class display names).
- `cards/` — class pools, neutral pool, tokens, and the two enemy-only cards.
- `heroes.ts`, `heroes/` — the nine callings and their hero powers.
- `treasures/` — passive (tiered), active, signature, boss and scaling treasures.
- `buckets/`, `buckets.ts` — draft buckets per calling + neutral.
- `enemies.ts` — the 18-encounter roster (tiers, elites, bosses).

Conventions: ids are stable snake_case and never renamed; display `name`,
`text` and `flavor` carry the Hollowmoor voice; all behavior is `EffectSpec`
data (see `game/types.ts`) — new content should be new data, not engine code.
`tests/original-ip.spec.ts` and `tests/classes.spec.ts` validate every id
reference and ban third-party IP from display fields.
