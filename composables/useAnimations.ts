import { gsap } from 'gsap'

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
    if (!c || reduced || typeof document === 'undefined') return
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
      `background:radial-gradient(circle, ${tint} 0%, rgba(255,200,120,0.55) 42%, rgba(255,160,60,0) 72%)`,
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
   */
  function cardPlayGhost(node: Element | null | undefined): void {
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
    ].join(';')
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    if (reduced) {
      wrapper.remove()
      return
    }
    gsap.to(wrapper, {
      y: -48,
      scale: 1.12,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => wrapper.remove(),
    })
  }

  /**
   * Summon pop — a minion appearing on the board with an overshoot bounce and
   * a brief glow flash. A dust/sparkle bloom underlines the arrival.
   * @param node - the minion element
   */
  function summonPop(node: Element | null | undefined): gsap.core.Timeline | undefined {
    const e = el(node)
    if (!e) return
    if (reduced) {
      gsap.set(e, { opacity: 1, scale: 1 })
      return
    }
    impactFlash(e, 0.35, 'rgba(255,233,168,0.9)')
    const tl = gsap.timeline()
    tl.fromTo(
      e,
      { opacity: 0, scale: 0.2, y: 14, filter: 'brightness(2.4)' },
      { opacity: 1, scale: 1.16, y: 0, filter: 'brightness(1)', duration: 0.34, ease: 'back.out(2.4)' }
    ).to(e, { scale: 1, duration: 0.18, ease: 'power2.out', clearProps: 'filter' })
    return tl
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
    attackLunge,
    damageShake,
    shieldBreak,
    floatingNumber,
    death,
    heroHit,
    manaFill,
    manaSpend,
    heroPowerCharge,
    statTick,
    pulse,
  }
}
