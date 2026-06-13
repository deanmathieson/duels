import { gsap } from 'gsap'
import { SPELL_FX_PALETTE, type SpellFxStyle } from '../data/spellFx'

/** A minimal class-colour tint passed into the FX helpers (see data/terms.ts). */
export interface FxTint {
  light: string
  glow: string
}

/** A viewport point — the currency of the point-based FX helpers. */
interface Pt {
  x: number
  y: number
}

/**
 * GSAP-based animation helpers for the board. Every function is defensive: a
 * missing / null element is a no-op so callers can pass `ref.value` straight
 * through without guarding. Functions return the underlying tween/timeline (or
 * a resolved Promise for the `*Async` flavours) so callers may await or chain.
 *
 * Coordinates are derived from `getBoundingClientRect()` so we can lunge one
 * element toward another regardless of layout.
 *
 * Heavy / showy motion is gated behind `prefers-reduced-motion`: those callers
 * fall back to an instant set (or a no-op) so the board stays fully legible.
 *
 * @returns a bundle of imperative animation helpers
 */
export function useAnimations() {
  /** True when the user prefers reduced motion — we then skip showy tweens. */
  const reduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /** Resolve an element from a ref-ish value or selector. */
  function el(target: Element | null | undefined): HTMLElement | null {
    return (target as HTMLElement) ?? null
  }

  /** Center point of an element in viewport coordinates. */
  function centerOf(node: Element | null | undefined): { x: number; y: number } | null {
    const e = el(node)
    if (!e) return null
    const r = e.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  /* --------------------------------------------------------------------------
   * Low-level FX primitives (composed by the higher-level helpers below)
   * ----------------------------------------------------------------------- */

  /**
   * A short, bright impact flash overlaid on an element's center — a soft
   * radial bloom that scales out and fades. Tuned by `power` (0..1) so big hits
   * read harder. Self-removing.
   * @param node - the struck element (flash spawns at its center)
   * @param power - 0..1 intensity (size + brightness of the bloom)
   * @param tint - css color of the bloom core
   */
  function impactFlash(
    node: Element | null | undefined,
    power = 0.5,
    tint = 'rgba(255,240,200,0.95)'
  ): void {
    const c = centerOf(node)
    if (!c) return
    flashAt(c, power, tint)
  }

  /**
   * Screen / board shake — a quick decaying jitter on the board root. Use for
   * impacts; `power` (0..1) scales amplitude. Heroes taking face damage warrant
   * a bigger shake than minion trades.
   * @param node - usually the board root element
   * @param power - 0..1 intensity
   */
  function screenShake(node: Element | null | undefined, power = 0.5): gsap.core.Timeline | undefined {
    const e = el(node)
    if (!e || reduced) return
    const amp = 3 + power * 11
    gsap.killTweensOf(e, 'x,y')
    const tl = gsap.timeline({ onComplete: () => gsap.set(e, { x: 0, y: 0 }) })
    const steps = 5
    for (let i = 0; i < steps; i++) {
      const decay = 1 - i / steps
      tl.to(e, {
        x: gsap.utils.random(-amp, amp) * decay,
        y: gsap.utils.random(-amp, amp) * decay * 0.6,
        duration: 0.05,
        ease: 'sine.inOut',
      })
    }
    tl.to(e, { x: 0, y: 0, duration: 0.08, ease: 'power2.out' })
    return tl
  }

  /* --------------------------------------------------------------------------
   * Card flow
   * ----------------------------------------------------------------------- */

  /**
   * Draw tween — a card sliding/scaling into the hand from the deck side.
   * @param node - the card element entering the hand
   */
  function cardDraw(node: Element | null | undefined): gsap.core.Tween | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) {
      gsap.set(e, { opacity: 1, x: 0, y: 0, scale: 1 })
      return
    }
    return gsap.fromTo(
      e,
      { opacity: 0, x: 120, y: -60, scale: 0.6, rotateZ: 18 },
      { opacity: 1, x: 0, y: 0, scale: 1, rotateZ: 0, duration: 0.45, ease: 'back.out(1.5)' }
    )
  }

  /**
   * Play flourish — a fire-and-forget GHOST of the played card lifting and
   * fading toward the board. The real hand node can unmount immediately (the
   * store dispatch no longer waits on this animation): we clone the slot's
   * untransformed inner card, pin the clone at the slot's current screen rect
   * in a fixed wrapper, and animate the wrapper. Self-removing.
   * @param node - the played card's hand-slot element
   * @param tint - the calling's colour (the ghost lifts with a hue-matched glow)
   */
  function cardPlayGhost(node: Element | null | undefined, tint?: FxTint): void {
    const e = el(node)
    if (!e || typeof document === 'undefined') return
    const rect = e.getBoundingClientRect()
    // The slot carries the fan rotate/scale transform; its first child is the
    // clean card. Clone that so the ghost isn't double-transformed.
    const inner = (e.firstElementChild as HTMLElement) ?? e
    const naturalW = inner.offsetWidth || rect.width
    const clone = inner.cloneNode(true) as HTMLElement
    clone.style.transform = `scale(${rect.width / naturalW})`
    clone.style.transformOrigin = 'top left'

    const wrapper = document.createElement('div')
    wrapper.style.cssText = [
      'position:fixed',
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      'pointer-events:none',
      'z-index:120',
      tint ? `filter:drop-shadow(0 0 12px ${tint.glow})` : '',
    ].join(';')
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    if (reduced) {
      wrapper.remove()
      return
    }
    gsap.to(wrapper, {
      y: -54,
      scale: 1.14,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => wrapper.remove(),
    })
  }

  /**
   * Spell cast glow — a class-tinted ring + bloom at a point (the caster /
   * board centre) when a spell resolves, giving spells a colour signature.
   * @param node - the element to centre the glow on
   * @param tint - the calling's colour
   */
  function castGlow(node: Element | null | undefined, tint: FxTint): void {
    const c = centerOf(node)
    if (!c || reduced || typeof document === 'undefined') return
    classBloom(node, 0.7, tint.light, tint.glow)
    const size = 64
    const ring = document.createElement('div')
    ring.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'margin-left:' + -size / 2 + 'px',
      'margin-top:' + -size / 2 + 'px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:186',
      'mix-blend-mode:screen',
      `border:2px solid ${tint.light}`,
      `box-shadow:0 0 16px 4px ${tint.glow}, inset 0 0 12px ${tint.glow}`,
    ].join(';')
    document.body.appendChild(ring)
    gsap.fromTo(
      ring,
      { scale: 0.5, opacity: 0.9 },
      { scale: 2.1, opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => ring.remove() }
    )
  }

  /**
   * Summon pop — a minion appearing on the board with an overshoot bounce and
   * a brief glow flash. A class-tinted bloom + a ring underline the arrival, so
   * each calling's minions enter in their own colour.
   * @param node - the minion element
   * @param tint - the calling's colour (defaults to warm gold)
   */
  function summonPop(
    node: Element | null | undefined,
    tint?: FxTint
  ): gsap.core.Timeline | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) {
      gsap.set(e, { opacity: 1, scale: 1 })
      return
    }
    const core = tint?.light ?? 'rgba(255,233,168,0.95)'
    const glow = tint?.glow ?? 'rgba(255,200,120,0.5)'
    classBloom(e, 0.5, core, glow)
    const tl = gsap.timeline()
    tl.fromTo(
      e,
      { opacity: 0, scale: 0.2, y: 14, filter: 'brightness(2.4)' },
      { opacity: 1, scale: 1.16, y: 0, filter: 'brightness(1)', duration: 0.34, ease: 'back.out(2.4)' }
    ).to(e, { scale: 1, duration: 0.18, ease: 'power2.out', clearProps: 'filter' })
    return tl
  }

  /**
   * A class-tinted bloom: like impactFlash but the whole gradient is the
   * calling's hue (core → glow → out), so summons/casts read in-colour rather
   * than the generic warm flash. Self-removing.
   */
  function classBloom(
    node: Element | null | undefined,
    power: number,
    core: string,
    glow: string
  ): void {
    const c = centerOf(node)
    if (!c || reduced || typeof document === 'undefined') return
    const size = 52 + power * 80
    const bloom = document.createElement('div')
    bloom.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'margin-left:' + -size / 2 + 'px',
      'margin-top:' + -size / 2 + 'px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:185',
      'mix-blend-mode:screen',
      `background:radial-gradient(circle, ${core} 0%, ${glow} 45%, rgba(0,0,0,0) 72%)`,
    ].join(';')
    document.body.appendChild(bloom)
    gsap.fromTo(
      bloom,
      { scale: 0.4, opacity: 0.95 },
      {
        scale: 1.6 + power,
        opacity: 0,
        duration: 0.42 + power * 0.18,
        ease: 'power2.out',
        onComplete: () => bloom.remove(),
      }
    )
  }

  /* --------------------------------------------------------------------------
   * Spell projectiles — themed orbs/shards flung from caster to target, with a
   * school-specific impact (explosion, frost shatter, arcane spark…). The whole
   * subsystem is gated behind reduced-motion: those callers get an instantly
   * resolved Promise so spell *damage* still lands without delay.
   * ----------------------------------------------------------------------- */

  /** Point-based impact flash (the node-based {@link impactFlash} delegates here). */
  function flashAt(c: Pt, power = 0.5, tint = 'rgba(255,240,200,0.95)'): void {
    if (reduced || typeof document === 'undefined') return
    const size = 46 + power * 70
    const bloom = document.createElement('div')
    bloom.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'margin-left:' + -size / 2 + 'px',
      'margin-top:' + -size / 2 + 'px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:190',
      'mix-blend-mode:screen',
      `background:radial-gradient(circle, ${tint} 0%, rgba(255,200,120,0.5) 42%, rgba(255,160,60,0) 72%)`,
    ].join(';')
    document.body.appendChild(bloom)
    gsap.fromTo(
      bloom,
      { scale: 0.4, opacity: 0.95 },
      {
        scale: 1.5 + power,
        opacity: 0,
        duration: 0.3 + power * 0.18,
        ease: 'power2.out',
        onComplete: () => bloom.remove(),
      }
    )
  }

  /** An expanding tinted ring at a point — the shockwave of an impact. */
  function ringAt(c: Pt, color: string, glow: string, size = 64): void {
    if (reduced || typeof document === 'undefined') return
    const ring = document.createElement('div')
    ring.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'margin-left:' + -size / 2 + 'px',
      'margin-top:' + -size / 2 + 'px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:189',
      'mix-blend-mode:screen',
      `border:2px solid ${color}`,
      `box-shadow:0 0 16px 4px ${glow}, inset 0 0 12px ${glow}`,
    ].join(';')
    document.body.appendChild(ring)
    gsap.fromTo(
      ring,
      { scale: 0.45, opacity: 0.9 },
      { scale: 1.9, opacity: 0, duration: 0.46, ease: 'power2.out', onComplete: () => ring.remove() }
    )
  }

  /** A burst of shards flung from a point — embers (orb) or ice (shard). */
  function shardsAt(
    c: Pt,
    opts: { color: string; glow: string; count: number; dist: number; shape: 'orb' | 'shard'; gravity: number }
  ): void {
    if (reduced || typeof document === 'undefined') return
    for (let i = 0; i < opts.count; i++) {
      const shard = document.createElement('div')
      const s = gsap.utils.random(5, 10)
      const isOrb = opts.shape === 'orb'
      shard.style.cssText = [
        'position:fixed',
        `left:${c.x}px`,
        `top:${c.y}px`,
        `width:${s}px`,
        `height:${isOrb ? s : s * gsap.utils.random(1.4, 2.4)}px`,
        'margin-left:' + -s / 2 + 'px',
        'margin-top:' + -s / 2 + 'px',
        'pointer-events:none',
        'z-index:191',
        'mix-blend-mode:screen',
        isOrb
          ? `background:radial-gradient(circle, ${opts.color} 0%, rgba(0,0,0,0) 72%)`
          : `background:linear-gradient(${opts.color}, rgba(0,0,0,0))`,
        `box-shadow:0 0 6px ${opts.glow}`,
        isOrb ? 'border-radius:50%' : 'border-radius:1px',
      ].join(';')
      document.body.appendChild(shard)
      const ang = (Math.PI * 2 * i) / opts.count + gsap.utils.random(-0.3, 0.3)
      const dist = gsap.utils.random(0.7, 1.25) * opts.dist
      gsap.fromTo(
        shard,
        { x: 0, y: 0, opacity: 1, rotateZ: 0, scale: 1 },
        {
          x: Math.cos(ang) * dist,
          y: Math.sin(ang) * dist + opts.gravity * gsap.utils.random(20, 44),
          rotateZ: gsap.utils.random(-200, 200),
          opacity: 0,
          scale: 0.3,
          duration: gsap.utils.random(0.34, 0.56),
          ease: 'power2.out',
          onComplete: () => shard.remove(),
        }
      )
    }
  }

  /** A four-point sparkle that blooms and fades — the arcane impact accent. */
  function sparkleAt(c: Pt, color: string, glow: string): void {
    if (reduced || typeof document === 'undefined') return
    const size = 46
    const star = document.createElement('div')
    star.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'margin-left:' + -size / 2 + 'px',
      'margin-top:' + -size / 2 + 'px',
      'pointer-events:none',
      'z-index:191',
      'mix-blend-mode:screen',
      // Two crossed gradient bars form a + / sparkle; the radial adds a core.
      `background:linear-gradient(${color},${color}) center/100% 14% no-repeat,` +
        `linear-gradient(${color},${color}) center/14% 100% no-repeat,` +
        `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 60%)`,
      `filter:drop-shadow(0 0 8px ${glow})`,
    ].join(';')
    document.body.appendChild(star)
    gsap.fromTo(
      star,
      { scale: 0.3, opacity: 1, rotate: 0 },
      { scale: 1.6, opacity: 0, rotate: 45, duration: 0.42, ease: 'power2.out', onComplete: () => star.remove() }
    )
  }

  /** A fading wake dot dropped behind a moving projectile. */
  function spawnTrail(x: number, y: number, color: string, size: number): void {
    if (typeof document === 'undefined') return
    const d = document.createElement('div')
    const s = size * gsap.utils.random(0.45, 0.75)
    d.style.cssText = [
      'position:fixed',
      `left:${x}px`,
      `top:${y}px`,
      `width:${s}px`,
      `height:${s}px`,
      'margin-left:' + -s / 2 + 'px',
      'margin-top:' + -s / 2 + 'px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:191',
      'mix-blend-mode:screen',
      `background:radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
    ].join(';')
    document.body.appendChild(d)
    gsap.to(d, { opacity: 0, scale: 0.3, duration: 0.34, ease: 'power2.out', onComplete: () => d.remove() })
  }

  /** The visual recipe for a single projectile (built per-school by {@link buildSpec}). */
  interface ProjectileSpec {
    core: string
    edge: string
    glow: string
    /** Trail wake colour, or undefined for a trail-less bolt. */
    trail?: string
    size: number
    /** Perpendicular lift (px) of the flight arc's apex — 0 is dead straight. */
    arc: number
    duration: number
    /** Total spin (deg) over the flight. */
    spin: number
    shape: 'orb' | 'shard' | 'dart'
    onImpact: (x: number, y: number) => void
  }

  /** Fly one projectile from → to along an arc, resolving at the moment of impact. */
  function projectile(from: Pt, to: Pt, spec: ProjectileSpec): Promise<void> {
    if (reduced || typeof document === 'undefined') return Promise.resolve()
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.hypot(dx, dy) || 1
    // Perpendicular unit vector — the arc bows the flight off the straight line.
    const nx = -dy / len
    const ny = dx / len
    const mid: Pt = { x: (from.x + to.x) / 2 + nx * spec.arc, y: (from.y + to.y) / 2 + ny * spec.arc }
    const s = spec.size
    const radius = spec.shape === 'orb' ? '50%' : spec.shape === 'shard' ? '2px' : '46% 46% 52% 52%'
    const node = document.createElement('div')
    node.style.cssText = [
      'position:fixed',
      `left:${from.x}px`,
      `top:${from.y}px`,
      `width:${s}px`,
      `height:${s}px`,
      'margin-left:' + -s / 2 + 'px',
      'margin-top:' + -s / 2 + 'px',
      `border-radius:${radius}`,
      'pointer-events:none',
      'z-index:192',
      'mix-blend-mode:screen',
      `background:radial-gradient(circle at 40% 35%, ${spec.core} 0%, ${spec.edge} 55%, rgba(0,0,0,0) 80%)`,
      `box-shadow:0 0 ${Math.round(s * 0.8)}px ${Math.round(s * 0.3)}px ${spec.glow}`,
    ].join(';')
    document.body.appendChild(node)
    return new Promise<void>((resolve) => {
      const proxy = { t: 0 }
      let lastTrail = 0
      gsap.to(proxy, {
        t: 1,
        duration: spec.duration,
        ease: 'power1.in',
        onUpdate() {
          const t = proxy.t
          const u = 1 - t
          // Quadratic Bézier from → mid → to.
          const x = u * u * from.x + 2 * u * t * mid.x + t * t * to.x
          const y = u * u * from.y + 2 * u * t * mid.y + t * t * to.y
          gsap.set(node, {
            x: x - from.x,
            y: y - from.y,
            rotation: spec.spin * t,
            scale: 1 + 0.16 * Math.sin(t * Math.PI),
          })
          if (spec.trail && t - lastTrail > 0.055) {
            lastTrail = t
            spawnTrail(x, y, spec.trail, s)
          }
        },
        onComplete() {
          node.remove()
          spec.onImpact(to.x, to.y)
          resolve()
        },
      })
    })
  }

  /** Build the per-school projectile recipe (palette + arc + impact). */
  function buildSpec(style: SpellFxStyle, tint?: FxTint): ProjectileSpec {
    if (style === 'orb') {
      const core = tint?.light ?? '#ffe9a8'
      const glow = tint?.glow ?? 'rgba(255,200,120,0.6)'
      return {
        core: '#ffffff',
        edge: core,
        glow,
        trail: glow,
        size: 18,
        arc: 36,
        duration: 0.4,
        spin: 240,
        shape: 'orb',
        onImpact: (x, y) => {
          const c = { x, y }
          flashAt(c, 0.55, core)
          ringAt(c, core, glow, 60)
        },
      }
    }
    const p = SPELL_FX_PALETTE[style]
    const base = { core: p.core, edge: p.edge, glow: p.glow, trail: p.trail }
    switch (style) {
      case 'fire':
        return {
          ...base,
          size: 26,
          arc: 54,
          duration: 0.46,
          spin: 0,
          shape: 'orb',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.85, 'rgba(255,210,130,0.95)')
            ringAt(c, p.edge, p.glow, 84)
            shardsAt(c, { color: p.edge, glow: p.glow, count: 9, dist: 60, shape: 'orb', gravity: 0.5 })
          },
        }
      case 'frost':
        return {
          ...base,
          size: 18,
          arc: 26,
          duration: 0.4,
          spin: 520,
          shape: 'shard',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.5, 'rgba(210,245,255,0.95)')
            ringAt(c, p.edge, p.glow, 70)
            shardsAt(c, { color: p.core, glow: p.glow, count: 6, dist: 52, shape: 'shard', gravity: 0.2 })
          },
        }
      case 'arcane':
        return {
          ...base,
          size: 14,
          arc: 18,
          duration: 0.34,
          spin: 360,
          shape: 'dart',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.5, 'rgba(240,200,255,0.95)')
            sparkleAt(c, p.core, p.glow)
            ringAt(c, p.edge, p.glow, 52)
          },
        }
      case 'lightning':
        return {
          ...base,
          size: 14,
          arc: 10,
          duration: 0.26,
          spin: 0,
          shape: 'dart',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.7, 'rgba(220,240,255,0.97)')
            ringAt(c, p.edge, p.glow, 64)
            shardsAt(c, { color: p.core, glow: p.glow, count: 5, dist: 46, shape: 'shard', gravity: 0 })
          },
        }
      case 'shadow':
        return {
          ...base,
          size: 20,
          arc: 40,
          duration: 0.44,
          spin: 200,
          shape: 'orb',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.6, 'rgba(190,140,230,0.9)')
            ringAt(c, p.edge, p.glow, 72)
            shardsAt(c, { color: p.edge, glow: p.glow, count: 7, dist: 54, shape: 'orb', gravity: 0.6 })
          },
        }
      case 'nature':
        return {
          ...base,
          size: 18,
          arc: 46,
          duration: 0.42,
          spin: 120,
          shape: 'orb',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.5, 'rgba(200,255,170,0.9)')
            ringAt(c, p.edge, p.glow, 66)
          },
        }
      case 'holy':
        return {
          ...base,
          size: 20,
          arc: 30,
          duration: 0.4,
          spin: 0,
          shape: 'orb',
          onImpact: (x, y) => {
            const c = { x, y }
            flashAt(c, 0.6, 'rgba(255,245,200,0.95)')
            ringAt(c, p.edge, p.glow, 72)
          },
        }
    }
  }

  /**
   * Fling a spell's projectiles from the caster toward each target. Single-target
   * spells get one projectile; AoE / multi-hit spells fan a staggered barrage.
   * Resolves when the FIRST projectile lands, so the engine's damage impacts can
   * begin firing in sync while later projectiles are still mid-flight.
   *
   * @param fromNode - the caster's hero element
   * @param toNodes - one element per target (duplicates allowed for multi-hit)
   * @param style - the projectile school (see resolveSpellFx)
   * @param tint - class colour, used only by the generic `orb` school
   */
  function spellProjectiles(
    fromNode: Element | null | undefined,
    toNodes: (Element | null | undefined)[],
    style: SpellFxStyle,
    tint?: FxTint
  ): Promise<void> {
    if (reduced || typeof document === 'undefined') return Promise.resolve()
    const from = centerOf(fromNode)
    if (!from) return Promise.resolve()
    const tos = toNodes
      .map((n) => centerOf(n))
      .filter((c): c is Pt => !!c)
    if (!tos.length) return Promise.resolve()
    const stagger = style === 'arcane' || style === 'lightning' ? 0.11 : 0.085
    // Launch the trailing projectiles on a stagger (fire-and-forget); they land
    // and explode on their own timeline as the barrage rolls in.
    for (let i = 1; i < tos.length; i++) {
      const to = tos[i]
      gsap.delayedCall(i * stagger, () => void projectile(from, to, buildSpec(style, tint)))
    }
    // Gate the caller on the first projectile's flight only.
    return projectile(from, tos[0], buildSpec(style, tint))
  }

  /* --------------------------------------------------------------------------
   * Combat
   * ----------------------------------------------------------------------- */

  /**
   * Attack lunge — wind up (anticipation), lunge along the real attacker→defender
   * vector, then recoil/settle. Resolves at impact (the apex) so callers can fire
   * damage + flash exactly when contact lands.
   * @param attacker - attacking element
   * @param defender - defending element
   */
  function attackLunge(
    attacker: Element | null | undefined,
    defender: Element | null | undefined
  ): Promise<void> {
    const a = el(attacker)
    const from = centerOf(attacker)
    const to = centerOf(defender)
    if (!a || !from || !to) return Promise.resolve()
    // Travel most of the way toward the target for a convincing clash.
    const dx = (to.x - from.x) * 0.66
    const dy = (to.y - from.y) * 0.66
    // Unit vector back toward the attacker — the wind-up pulls away from the target.
    const len = Math.hypot(to.x - from.x, to.y - from.y) || 1
    const ux = (to.x - from.x) / len
    const uy = (to.y - from.y) / len
    if (reduced) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const tl = gsap.timeline()
      tl
        // wind-up: pull back + cock slightly the other way
        .to(a, {
          x: -ux * 14,
          y: -uy * 14,
          scale: 0.96,
          duration: 0.13,
          ease: 'power2.out',
          zIndex: 50,
        })
        // lunge: drive hard into the target
        .to(a, {
          x: dx,
          y: dy,
          scale: 1.16,
          duration: 0.11,
          ease: 'power3.in',
        })
        // impact lands here — let damage + flash fire while the recoil plays out
        .add(() => resolve())
        // recoil + elastic settle back home
        .to(a, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: 'elastic.out(1, 0.55)',
          clearProps: 'zIndex',
        })
    })
  }

  /**
   * Damage shake — a sharp jitter + bright hit-flash to convey a struck entity.
   * @param node - the struck element
   * @param power - 0..1 intensity (heroes/face hits read harder)
   */
  function damageShake(
    node: Element | null | undefined,
    power = 0.5
  ): gsap.core.Tween | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) return
    gsap.killTweensOf(e, 'x')
    const amp = 5 + power * 6
    return gsap.fromTo(
      e,
      { x: -amp },
      {
        x: 0,
        duration: 0.4 + power * 0.12,
        ease: 'elastic.out(1.6, 0.25)',
        onStart: () => {
          gsap.fromTo(
            e,
            { filter: 'brightness(2.1)' },
            { filter: 'brightness(1)', duration: 0.3 }
          )
        },
      }
    )
  }

  /**
   * Divine-shield break — a bright golden ring that snaps outward and fades when
   * a divine shield pops. Self-removing.
   * @param node - the minion that lost its shield
   */
  function shieldBreak(node: Element | null | undefined): void {
    const c = centerOf(node)
    const e = el(node)
    if (!c || reduced || typeof document === 'undefined') return
    const size = e ? Math.max(e.getBoundingClientRect().width, 72) : 80
    const ring = document.createElement('div')
    ring.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      `width:${size}px`,
      `height:${size}px`,
      'margin-left:' + -size / 2 + 'px',
      'margin-top:' + -size / 2 + 'px',
      'border-radius:50%',
      'pointer-events:none',
      'z-index:195',
      'mix-blend-mode:screen',
      'border:3px solid rgba(255,245,200,0.95)',
      'box-shadow:0 0 18px 6px rgba(255,233,168,0.9), inset 0 0 14px rgba(255,233,168,0.7)',
    ].join(';')
    document.body.appendChild(ring)
    gsap.fromTo(
      ring,
      { scale: 0.55, opacity: 1 },
      {
        scale: 1.7,
        opacity: 0,
        duration: 0.42,
        ease: 'power2.out',
        onComplete: () => ring.remove(),
      }
    )
    impactFlash(node, 0.5, 'rgba(255,245,200,0.95)')
  }

  /**
   * Floating damage / heal number. Spawns a transient element at the target's
   * center, pops it with an overshoot, drifts it up in a slight arc, then fades.
   * (The board normally uses the <DamageSplash> component; this is the imperative
   * fallback flavour used elsewhere.)
   * @param node - the target element (number spawns at its center)
   * @param amount - the magnitude shown
   * @param kind - 'damage' (red) or 'heal' (green)
   */
  function floatingNumber(
    node: Element | null | undefined,
    amount: number,
    kind: 'damage' | 'heal' = 'damage'
  ): void {
    const c = centerOf(node)
    if (!c || typeof document === 'undefined') return
    const big = Math.abs(amount) >= 6
    const span = document.createElement('div')
    span.textContent = (kind === 'heal' ? '+' : '-') + Math.abs(amount)
    span.style.cssText = [
      'position:fixed',
      `left:${c.x}px`,
      `top:${c.y}px`,
      'transform:translate(-50%,-50%)',
      'pointer-events:none',
      'z-index:200',
      "font-family:'Cinzel',Georgia,serif",
      'font-weight:800',
      `font-size:${big ? 46 : 34}px`,
      kind === 'heal' ? 'color:#8cff7a' : 'color:#ff6a5a',
      'text-shadow:0 2px 4px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.7)',
    ].join(';')
    document.body.appendChild(span)
    if (reduced) {
      gsap.delayedCall(0.6, () => span.remove())
      return
    }
    const drift = gsap.utils.random(-22, 22)
    gsap.fromTo(
      span,
      { opacity: 0, y: 0, scale: 0.4 },
      {
        opacity: 1,
        scale: big ? 1.5 : 1.3,
        y: -18,
        duration: 0.2,
        ease: 'back.out(3)',
        onComplete: () => {
          gsap.to(span, {
            opacity: 0,
            x: drift,
            y: -68,
            scale: 1,
            duration: 0.55,
            ease: 'power1.in',
            onComplete: () => span.remove(),
          })
        },
      }
    )
  }

  /**
   * Death animation — a minion dissolving: it dims, shatters into a couple of
   * sheared shards, shrinks and spins off. Falls back to a clean fade for
   * reduced-motion.
   * @param node - the dying minion element
   */
  function death(node: Element | null | undefined): Promise<void> {
    const e = el(node)
    if (!e) return Promise.resolve()
    if (reduced) {
      return new Promise<void>((resolve) => {
        gsap.to(e, { opacity: 0, duration: 0.2, onComplete: () => resolve() })
      })
    }
    return new Promise<void>((resolve) => {
      gsap.to(e, {
        opacity: 0,
        scale: 0.3,
        rotateZ: gsap.utils.random(-28, 28),
        y: 10,
        filter: 'grayscale(1) brightness(0.4)',
        duration: 0.42,
        ease: 'power2.in',
        onComplete: () => resolve(),
      })
    })
  }

  /**
   * Death shatter — a burst of small shards flung outward from a dying minion's
   * centre, each tumbling, falling under a touch of gravity and fading. This is
   * the "weight" on a kill the clean CSS fade lacked: minions now break apart
   * instead of politely vanishing. Self-removing; a no-op under reduced-motion.
   * @param node - the dying minion element (shards spawn at its centre)
   * @param tint - optional class colour; shards take its hue, else bone-grey
   */
  function deathShatter(node: Element | null | undefined, tint?: FxTint): void {
    const c = centerOf(node)
    if (!c || reduced || typeof document === 'undefined') return
    const e = el(node)
    const rect = e?.getBoundingClientRect()
    const spread = rect ? Math.min(rect.width, rect.height) * 0.4 : 26
    const color = tint?.light ?? '#cfc6b4'
    const glow = tint?.glow ?? 'rgba(160,150,130,0.5)'
    const count = 9
    for (let i = 0; i < count; i++) {
      const shard = document.createElement('div')
      const s = gsap.utils.random(5, 11)
      shard.style.cssText = [
        'position:fixed',
        `left:${c.x}px`,
        `top:${c.y}px`,
        `width:${s}px`,
        `height:${s * gsap.utils.random(0.6, 1.4)}px`,
        'margin-left:' + -s / 2 + 'px',
        'margin-top:' + -s / 2 + 'px',
        'pointer-events:none',
        'z-index:188',
        `background:linear-gradient(140deg, ${color}, rgba(40,32,24,0.9))`,
        `box-shadow:0 0 6px ${glow}`,
        'border-radius:1px',
      ].join(';')
      document.body.appendChild(shard)
      const ang = (Math.PI * 2 * i) / count + gsap.utils.random(-0.3, 0.3)
      const dist = gsap.utils.random(0.6, 1.3) * (spread + 28)
      gsap.fromTo(
        shard,
        { x: 0, y: 0, opacity: 1, rotateZ: 0, scale: 1 },
        {
          x: Math.cos(ang) * dist,
          // bias downward so shards fall, not just radiate
          y: Math.sin(ang) * dist * 0.7 + gsap.utils.random(18, 40),
          rotateZ: gsap.utils.random(-220, 220),
          opacity: 0,
          scale: 0.4,
          duration: gsap.utils.random(0.4, 0.62),
          ease: 'power2.out',
          onComplete: () => shard.remove(),
        }
      )
    }
  }

  /* --------------------------------------------------------------------------
   * Hero / mana / hero power
   * ----------------------------------------------------------------------- */

  /** A short hit-flash + nudge for a hero portrait taking damage (heavy). */
  function heroHit(node: Element | null | undefined): void {
    damageShake(node, 0.95)
    impactFlash(node, 0.8, 'rgba(255,120,90,0.95)')
  }

  /**
   * Mana orb fill — a quick pop on a gem becoming available.
   * @param node - the mana pip element
   */
  function manaFill(node: Element | null | undefined): gsap.core.Tween | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) return
    return gsap.fromTo(
      e,
      { scale: 0.5, filter: 'brightness(2.6)' },
      { scale: 1, filter: 'brightness(1)', duration: 0.4, ease: 'back.out(2.6)' }
    )
  }

  /**
   * Mana orb spend — a brief dim/desaturate flick as a crystal is consumed.
   * @param node - the mana pip element
   */
  function manaSpend(node: Element | null | undefined): gsap.core.Tween | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) return
    return gsap.fromTo(
      e,
      { filter: 'brightness(1.6)', scale: 1.12 },
      { filter: 'brightness(1)', scale: 1, duration: 0.32, ease: 'power2.out' }
    )
  }

  /**
   * Hero power charge/flash — a quick wind-up scale + bright flash on use.
   * @param node - the hero power element
   */
  function heroPowerCharge(node: Element | null | undefined): gsap.core.Timeline | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) return
    impactFlash(e, 0.5, 'rgba(200,160,255,0.95)')
    const tl = gsap.timeline()
    tl.to(e, { scale: 0.86, duration: 0.1, ease: 'power2.in' })
      .to(e, {
        scale: 1.2,
        filter: 'brightness(1.8)',
        duration: 0.14,
        ease: 'back.out(3)',
      })
      .to(e, { scale: 1, filter: 'brightness(1)', duration: 0.3, ease: 'elastic.out(1, 0.5)' })
    return tl
  }

  /**
   * Stat tick — a small punch on a stat gem whose value just changed (buff/heal
   * pops gold/up, damage pops red/down).
   * @param node - the stat gem element
   * @param dir - 'up' (buff/heal) or 'down' (damage)
   */
  function statTick(
    node: Element | null | undefined,
    dir: 'up' | 'down' = 'up'
  ): gsap.core.Tween | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) return
    const glow =
      dir === 'up'
        ? '0 0 14px 5px rgba(120,255,120,0.95)'
        : '0 0 14px 5px rgba(255,90,70,0.95)'
    // Punch the gem, flashing a coloured halo, then clear the inline box-shadow
    // so any persistent .gem-buffed / .gem-damaged class halo takes over again.
    return gsap.fromTo(
      e,
      { scale: 1.5, boxShadow: glow },
      {
        scale: 1,
        duration: 0.5,
        ease: 'back.out(2)',
        clearProps: 'boxShadow',
      }
    )
  }

  /**
   * A celebratory / impactful pulse on an arbitrary element (e.g. lethal,
   * turn banner emphasis).
   * @param node - the element to pulse
   */
  function pulse(node: Element | null | undefined): gsap.core.Tween | undefined {
    const e = el(node)
    if (!e) return
    return gsap.fromTo(
      e,
      { scale: 0.9 },
      { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
    )
  }

  return {
    reduced,
    centerOf,
    impactFlash,
    screenShake,
    cardDraw,
    cardPlayGhost,
    summonPop,
    castGlow,
    spellProjectiles,
    attackLunge,
    damageShake,
    shieldBreak,
    floatingNumber,
    death,
    deathShatter,
    heroHit,
    manaFill,
    manaSpend,
    heroPowerCharge,
    statTick,
    pulse,
  }
}
