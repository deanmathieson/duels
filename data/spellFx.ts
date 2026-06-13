/**
 * Spell visual-effect styling — maps a card to a projectile "school" so its
 * cast flings a themed projectile (a real fireball, an icy shard, a swarm of
 * arcane darts…) from the caster toward each target.
 *
 * Coverage is keyword-driven so the whole card library is handled without
 * enumerating every card: an id/name is matched against a small table of
 * school keywords, falling back to a class-tinted `orb`. A handful of marquee
 * cards get explicit overrides where the keywords would guess wrong.
 *
 * Pure data + a resolver — no DOM, no GSAP. `useAnimations` owns the palette →
 * tween translation; this file just decides *which* school a card belongs to.
 */

/** A projectile school. `orb` is the class-tinted generic fallback. */
export type SpellFxStyle =
  | 'fire'
  | 'frost'
  | 'arcane'
  | 'shadow'
  | 'nature'
  | 'holy'
  | 'lightning'
  | 'orb'

/** Colour stops for a school's projectile + impact (independent of class). */
export interface SpellFxPalette {
  /** Hot center of the orb. */
  core: string
  /** Outer body / ring colour. */
  edge: string
  /** Soft glow + box-shadow colour (rgba). */
  glow: string
  /** Trailing wake colour (rgba). */
  trail: string
}

/** Per-school palettes. Tuned to read instantly against the dim board. */
export const SPELL_FX_PALETTE: Record<Exclude<SpellFxStyle, 'orb'>, SpellFxPalette> = {
  fire: { core: '#fff3c4', edge: '#ff5a1e', glow: 'rgba(255,120,40,0.8)', trail: 'rgba(255,150,60,0.7)' },
  frost: { core: '#eaffff', edge: '#5fc6ff', glow: 'rgba(120,200,255,0.8)', trail: 'rgba(180,230,255,0.7)' },
  arcane: { core: '#ffe6ff', edge: '#c46bff', glow: 'rgba(200,110,255,0.8)', trail: 'rgba(220,150,255,0.7)' },
  shadow: { core: '#e6c8ff', edge: '#6b3fa0', glow: 'rgba(120,60,180,0.8)', trail: 'rgba(90,50,140,0.7)' },
  nature: { core: '#eaffd0', edge: '#5fd23f', glow: 'rgba(120,220,80,0.8)', trail: 'rgba(150,230,110,0.7)' },
  holy: { core: '#fff8dc', edge: '#ffd86b', glow: 'rgba(255,220,120,0.85)', trail: 'rgba(255,235,170,0.7)' },
  lightning: { core: '#f0f8ff', edge: '#8fd0ff', glow: 'rgba(150,210,255,0.85)', trail: 'rgba(200,235,255,0.7)' },
}

/**
 * Explicit per-card overrides — used only where the keyword table would guess
 * wrong (e.g. a card whose name reads "frost" but plays as fire). Keyed by the
 * stable card id, which never changes across the rebrand.
 */
const FX_OVERRIDES: Record<string, SpellFxStyle> = {
  // Stargazer (mage) — split-star barrage reads as arcane, not "star → fire".
  mage_arcane_missiles: 'arcane',
  mage_arcane_explosion: 'arcane',
  mage_arcane_intellect: 'arcane',
}

/**
 * Keyword → school table, evaluated in order (first match wins). Tested against
 * the lowercased `"<id> <name>"` haystack so both the stable id and the
 * flavourful display name can trigger a school.
 */
const FX_KEYWORDS: ReadonlyArray<readonly [RegExp, SpellFxStyle]> = [
  [/fire|flame|comet|bonfire|pyro|cinder|ember|ash|blaz|burn|tallow|scorch|magma|lava|inferno/, 'fire'],
  [/frost|ice|snow|glaci|chill|cold|freez|winter|sleet|hail|rime|thaw/, 'frost'],
  [/storm|lightn|bolt|spark|thunder|shock|jolt|gale|tempest/, 'lightning'],
  [/shadow|dark|void|hex|curse|drown|bog|gallows|grave|wraith|rot|plague|venom|poison|blight/, 'shadow'],
  [/star|moon|astral|arcane|spite|missile|sigil|rune|portal|warp|spectr/, 'arcane'],
  [/thorn|grove|root|vine|bloom|nature|seed|wild|bramble|harvest|barb|spore/, 'nature'],
  [/holy|bless|sacred|radian|dawn|hallow|consecrat|smite|sun|light(?!n)/, 'holy'],
]

/**
 * Resolve a card's projectile school from its id (and optional display name).
 * Overrides win, then the keyword table, else the class-tinted `orb`.
 *
 * @param cardId - the stable card id (e.g. `mage_fireball`)
 * @param name - optional display name, also matched for keywords
 * @returns the projectile school to animate the cast with
 */
export function resolveSpellFx(cardId: string, name?: string): SpellFxStyle {
  const override = FX_OVERRIDES[cardId]
  if (override) return override
  const hay = `${cardId} ${name ?? ''}`.toLowerCase()
  for (const [re, style] of FX_KEYWORDS) if (re.test(hay)) return style
  return 'orb'
}
