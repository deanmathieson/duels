import { useSettingsStore } from '~/stores/settings'

/**
 * useAudio — a tiny Web Audio layer for the game.
 *
 * Design notes:
 *  - All state is a module-level singleton so the game store, the board and the
 *    buttons share one AudioContext + decoded-buffer cache.
 *  - Everything is lazy and gesture-gated: no network or AudioContext work
 *    happens until the first user interaction (browser autoplay policy), so it
 *    never blocks startup. Common SFX are then preloaded in the background.
 *  - Every entry point is defensive — on the server, in tests, or where Web
 *    Audio is unavailable, calls are silent no-ops rather than throwing.
 *  - The settings store is the single source of truth for on/off + volume; a
 *    watcher keeps the live gain nodes in sync (so the mute toggle is instant).
 */

/** Short, overlap-friendly sound effects. */
export type SfxName =
  | 'click'
  | 'cardDraw'
  | 'cardPlay'
  | 'attack'
  | 'death'
  | 'heroHit'
  | 'victory'
  | 'defeat'

/**
 * Procedurally-synthesised cues for actions that have no recorded SFX. They are
 * built live from oscillators, so they ship no asset files, can never 404, and
 * stay tonally consistent with the rest of the palette. These fill the moments
 * that previously played in silence (a spell resolving, a heal, mana spent, a
 * hero power, an illegal action) — the gaps that read as "lifeless".
 */
export type ToneName =
  | 'spell'
  | 'heal'
  | 'mana'
  | 'heroPower'
  | 'error'
  // Spell-school launch cues — the "whoosh" of a projectile leaving the caster,
  // played the instant a themed spell projectile is flung (see useAnimations).
  | 'fire'
  | 'frost'
  | 'arcane'
  | 'lightning'
  | 'shadow'
  | 'nature'
  | 'holy'

/** Looping ambient tracks. */
export type MusicName = 'menu' | 'board'

/** SFX name -> filename under /assets/sfx/. */
const SOUNDS: Record<SfxName, string> = {
  click: 'button_click.wav',
  cardDraw: 'card_draw.wav',
  cardPlay: 'card_play.wav',
  attack: 'minion_attack.wav',
  death: 'minion_death.wav',
  heroHit: 'hero_hit.wav',
  victory: 'victory_sting.wav',
  defeat: 'defeat_sting.wav',
}

/** Music name -> filename. */
const MUSIC: Record<MusicName, string> = {
  // Menu theme is a provided MP3 track ("Hollowmoor"), not a generated loop.
  menu: 'theme_hollowmoor.mp3',
  board: 'ambient_board.wav',
}

/** Per-sound relative gain trims so nothing is disproportionately loud. */
const TRIM: Record<SfxName, number> = {
  click: 0.5,
  cardDraw: 0.7,
  cardPlay: 0.85,
  attack: 0.9,
  death: 0.8,
  heroHit: 1.0,
  victory: 0.9,
  defeat: 0.9,
}

/** Minimum gap (ms) between repeats of the same sound — kills machine-gunning. */
const THROTTLE_MS: Record<SfxName, number> = {
  click: 30,
  cardDraw: 70,
  cardPlay: 60,
  attack: 50,
  death: 40,
  heroHit: 50,
  victory: 400,
  defeat: 400,
}

/** Minimum gap (ms) between repeats of a synth tone. */
const TONE_THROTTLE_MS: Record<ToneName, number> = {
  spell: 50,
  heal: 60,
  mana: 40,
  heroPower: 80,
  error: 120,
  // Launch cues fire in quick staggered bursts (AoE / missile barrages), so
  // keep their throttle short enough that each projectile still gets a voice.
  fire: 40,
  frost: 40,
  arcane: 40,
  lightning: 40,
  shadow: 40,
  nature: 40,
  holy: 40,
}

/** Ambient music sits well below the SFX bus. */
const MUSIC_LEVEL = 0.35
/** SFX preloaded right after the first user gesture (the common in-match set). */
const PRELOAD: SfxName[] = ['click', 'cardPlay', 'cardDraw', 'attack', 'death', 'heroHit']

interface MusicVoice {
  name: MusicName
  src: AudioBufferSourceNode
  gain: GainNode
}

interface AudioSingleton {
  ctx: AudioContext | null
  sfxBus: GainNode | null
  musicBus: GainNode | null
  buffers: Map<string, AudioBuffer>
  loading: Map<string, Promise<AudioBuffer | null>>
  lastPlayed: Map<SfxName, number>
  lastToned: Map<ToneName, number>
  settings: ReturnType<typeof useSettingsStore> | null
  desiredMusic: MusicName | null
  music: MusicVoice | null
  /** Track being started right now (guards against double-starts while loading). */
  loadingMusic: MusicName | null
  gestureBound: boolean
  watcherBound: boolean
  unlocked: boolean
}

/** The one and only audio state for the app session. */
const S: AudioSingleton = {
  ctx: null,
  sfxBus: null,
  musicBus: null,
  buffers: new Map(),
  loading: new Map(),
  lastPlayed: new Map(),
  lastToned: new Map(),
  settings: null,
  desiredMusic: null,
  music: null,
  loadingMusic: null,
  gestureBound: false,
  watcherBound: false,
  unlocked: false,
}

/** True when Web Audio is usable in this environment. */
function supported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window.AudioContext || (window as any).webkitAudioContext) === 'function'
  )
}

/** Monotonic-ish clock that is also safe under fake timers in tests. */
function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

/** Resolve (and cache) the settings store, binding the on/off + volume watcher once. */
function settings(): AudioSingleton['settings'] {
  if (S.settings) return S.settings
  try {
    S.settings = useSettingsStore()
  } catch {
    return null
  }
  if (S.settings && !S.watcherBound) {
    S.watcherBound = true
    // `detached: true` keeps the subscription alive for the whole session — a
    // plain `watch`/non-detached subscribe would be torn down with whichever
    // component first called useAudio(), silently breaking the mute toggle.
    S.settings.$subscribe(() => applyGains(), { detached: true })
  }
  return S.settings
}

/** The app base URL (so assets resolve under a GitHub Pages sub-path). */
function baseUrl(): string {
  try {
    if (typeof useRuntimeConfig === 'function') {
      return (useRuntimeConfig().app.baseURL || '/').replace(/\/$/, '')
    }
  } catch {
    /* not in a Nuxt runtime context */
  }
  return ''
}

/** Absolute URL for a sound file. */
function urlFor(file: string): string {
  return `${baseUrl()}/assets/sfx/${file}`
}

/** Create the AudioContext + the SFX / music gain buses (once). */
function ensureCtx(): AudioContext | null {
  if (S.ctx) return S.ctx
  if (!supported()) return null
  const Ctor = window.AudioContext || (window as any).webkitAudioContext
  const ctx: AudioContext = new Ctor()
  const sfxBus = ctx.createGain()
  const musicBus = ctx.createGain()
  sfxBus.connect(ctx.destination)
  musicBus.connect(ctx.destination)
  S.ctx = ctx
  S.sfxBus = sfxBus
  S.musicBus = musicBus
  applyGains()
  return ctx
}

/** Push the current settings (on/off + volume) onto the live gain nodes. */
function applyGains(): void {
  const s = settings()
  const on = s ? s.soundOn : true
  const vol = s ? s.volume : 0.7
  if (S.sfxBus && S.ctx) {
    S.sfxBus.gain.setTargetAtTime(on ? vol : 0, S.ctx.currentTime, 0.015)
  }
  if (S.musicBus && S.ctx) {
    S.musicBus.gain.setTargetAtTime(on ? vol * MUSIC_LEVEL : 0, S.ctx.currentTime, 0.05)
  }
}

/** decodeAudioData with both promise- and callback-style support. */
function decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer | null> {
  return new Promise((resolve) => {
    try {
      const p = ctx.decodeAudioData(
        data,
        (b) => resolve(b),
        () => resolve(null)
      )
      if (p && typeof (p as Promise<AudioBuffer>).then === 'function') {
        ;(p as Promise<AudioBuffer>).then((b) => resolve(b)).catch(() => resolve(null))
      }
    } catch {
      resolve(null)
    }
  })
}

/** Fetch + decode a file into an AudioBuffer, cached and de-duplicated. */
function load(file: string): Promise<AudioBuffer | null> {
  const cached = S.buffers.get(file)
  if (cached) return Promise.resolve(cached)
  const inflight = S.loading.get(file)
  if (inflight) return inflight
  const ctx = ensureCtx()
  if (!ctx) return Promise.resolve(null)
  const job = fetch(urlFor(file))
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((arr) => decode(ctx, arr))
    .then((buf) => {
      if (buf) S.buffers.set(file, buf)
      S.loading.delete(file)
      return buf
    })
    .catch(() => {
      S.loading.delete(file)
      return null
    })
  S.loading.set(file, job)
  return job
}

/** Resume a suspended context (best-effort). */
function resume(): void {
  if (S.ctx && S.ctx.state === 'suspended') void S.ctx.resume()
}

/** Fire a one-shot sound from a decoded buffer through the SFX bus. */
function fire(buffer: AudioBuffer, name: SfxName, rate: number, gain: number): void {
  if (!S.ctx || !S.sfxBus) return
  const src = S.ctx.createBufferSource()
  src.buffer = buffer
  src.playbackRate.value = rate
  const g = S.ctx.createGain()
  g.gain.value = TRIM[name] * gain
  src.connect(g)
  g.connect(S.sfxBus)
  src.start()
}

/**
 * Play a sound effect.
 * @param name - which sound
 * @param opts.rate - optional playback-rate multiplier (pitch / speed)
 * @param opts.gain - optional extra gain multiplier on top of the per-sound trim
 */
function play(name: SfxName, opts: { rate?: number; gain?: number } = {}): void {
  const s = settings()
  if (s && !s.soundOn) return
  if (!supported()) return

  // Throttle rapid repeats of the same sound.
  const t = now()
  const last = S.lastPlayed.get(name) ?? -Infinity
  if (t - last < (THROTTLE_MS[name] ?? 40)) return
  S.lastPlayed.set(name, t)

  const ctx = ensureCtx()
  if (!ctx) return
  resume()
  const rate = opts.rate ?? 1
  const gain = opts.gain ?? 1
  const file = SOUNDS[name]
  const buffered = S.buffers.get(file)
  if (buffered) {
    fire(buffered, name, rate, gain)
    return
  }
  // Not loaded yet — fetch then play (only if it resolves promptly enough to matter).
  void load(file).then((buf) => {
    if (buf && now() - t < 900) fire(buf, name, rate, gain)
  })
}

/**
 * One synthesised partial: an oscillator swept from `f0`→`f1` Hz over `dur`
 * seconds, shaped by a quick attack / exponential decay envelope, started at
 * `delay` seconds after now. Routed through the SFX bus so the mute toggle and
 * master volume apply exactly as they do to recorded sounds.
 */
function partial(opts: {
  type: OscillatorType
  f0: number
  f1?: number
  dur: number
  gain: number
  delay?: number
}): void {
  const ctx = S.ctx
  if (!ctx || !S.sfxBus) return
  const t = ctx.currentTime + (opts.delay ?? 0)
  const osc = ctx.createOscillator()
  osc.type = opts.type
  osc.frequency.setValueAtTime(opts.f0, t)
  if (opts.f1 != null && opts.f1 !== opts.f0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.f1), t + opts.dur)
  }
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(opts.gain, t + 0.012) // fast attack
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur) // decay to silence
  osc.connect(g)
  g.connect(S.sfxBus)
  osc.start(t)
  osc.stop(t + opts.dur + 0.02)
}

/** Recipes for each synthesised cue — a small stack of partials. */
const TONE_RECIPES: Record<ToneName, () => void> = {
  // Spell resolving: an airy shimmer rising in two detuned voices.
  spell() {
    partial({ type: 'triangle', f0: 520, f1: 1180, dur: 0.34, gain: 0.16 })
    partial({ type: 'sine', f0: 784, f1: 1568, dur: 0.3, gain: 0.1, delay: 0.02 })
  },
  // Heal: a soft consonant bell (root + major third), gentle and warm.
  heal() {
    partial({ type: 'sine', f0: 659, dur: 0.5, gain: 0.14 })
    partial({ type: 'sine', f0: 880, dur: 0.46, gain: 0.09, delay: 0.04 })
  },
  // Mana spent: a short hollow "ploink".
  mana() {
    partial({ type: 'triangle', f0: 420, f1: 240, dur: 0.16, gain: 0.13 })
  },
  // Hero power: a resonant thunk topped with a bright spark.
  heroPower() {
    partial({ type: 'square', f0: 180, f1: 110, dur: 0.22, gain: 0.12 })
    partial({ type: 'triangle', f0: 990, f1: 1480, dur: 0.26, gain: 0.08, delay: 0.04 })
  },
  // Illegal action: a low, flat buzz that reads instantly as "no".
  error() {
    partial({ type: 'sawtooth', f0: 200, f1: 150, dur: 0.18, gain: 0.11 })
    partial({ type: 'sawtooth', f0: 150, f1: 110, dur: 0.2, gain: 0.09, delay: 0.05 })
  },
  // --- Spell-school launch cues (the projectile leaving the caster) ---------
  // Fire: a guttural downward whoosh — the roar of a comet taking off.
  fire() {
    partial({ type: 'sawtooth', f0: 520, f1: 130, dur: 0.3, gain: 0.12 })
    partial({ type: 'triangle', f0: 300, f1: 90, dur: 0.34, gain: 0.1, delay: 0.01 })
  },
  // Frost: a high, glassy zing rising into a brittle shimmer.
  frost() {
    partial({ type: 'sine', f0: 1500, f1: 2300, dur: 0.26, gain: 0.1 })
    partial({ type: 'triangle', f0: 880, f1: 1320, dur: 0.22, gain: 0.07, delay: 0.02 })
  },
  // Arcane: two detuned voices sparkling upward — brighter/faster than `spell`.
  arcane() {
    partial({ type: 'triangle', f0: 680, f1: 1500, dur: 0.3, gain: 0.13 })
    partial({ type: 'sine', f0: 1020, f1: 2040, dur: 0.26, gain: 0.08, delay: 0.02 })
  },
  // Lightning: a fast square crack with a sawtooth snap on top.
  lightning() {
    partial({ type: 'square', f0: 1200, f1: 300, dur: 0.16, gain: 0.1 })
    partial({ type: 'sawtooth', f0: 2000, f1: 600, dur: 0.12, gain: 0.07 })
  },
  // Shadow: a low, swallowing dive — the air going cold.
  shadow() {
    partial({ type: 'sine', f0: 200, f1: 90, dur: 0.36, gain: 0.13 })
    partial({ type: 'triangle', f0: 150, f1: 70, dur: 0.34, gain: 0.09, delay: 0.03 })
  },
  // Nature: a soft, growing swell — sap rising.
  nature() {
    partial({ type: 'triangle', f0: 520, f1: 760, dur: 0.26, gain: 0.12 })
    partial({ type: 'sine', f0: 780, f1: 1040, dur: 0.24, gain: 0.07, delay: 0.02 })
  },
  // Holy: a clean consonant bell (root + fifth).
  holy() {
    partial({ type: 'sine', f0: 784, dur: 0.4, gain: 0.12 })
    partial({ type: 'sine', f0: 1175, dur: 0.36, gain: 0.08, delay: 0.03 })
  },
}

/**
 * Play a procedurally-synthesised cue. Same gating as {@link play}: muted →
 * silent, gesture-gated, and throttled against rapid repeats.
 */
function tone(name: ToneName): void {
  const s = settings()
  if (s && !s.soundOn) return
  if (!supported()) return

  const t = now()
  const last = S.lastToned.get(name) ?? -Infinity
  if (t - last < (TONE_THROTTLE_MS[name] ?? 60)) return
  S.lastToned.set(name, t)

  const ctx = ensureCtx()
  if (!ctx) return
  resume()
  TONE_RECIPES[name]()
}

/** Warm the buffer cache for a set of sounds (background, non-blocking). */
function preload(names: SfxName[] = PRELOAD): void {
  if (!supported()) return
  for (const n of names) void load(SOUNDS[n])
}

/** Begin (or crossfade to) a looping ambient track. */
function startMusic(name: MusicName): void {
  const ctx = ensureCtx()
  if (!ctx || !S.musicBus) return
  // Already playing it, or already spinning it up — nothing to do.
  if ((S.music && S.music.name === name) || S.loadingMusic === name) return
  // Fade out and retire the current track.
  fadeOutCurrentMusic()
  S.loadingMusic = name
  void load(MUSIC[name]).then((buffer) => {
    if (S.loadingMusic === name) S.loadingMusic = null
    // The desired track may have changed while loading.
    if (!buffer || !S.ctx || !S.musicBus || S.desiredMusic !== name) return
    const src = S.ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    const g = S.ctx.createGain()
    g.gain.value = 0
    src.connect(g)
    g.connect(S.musicBus)
    src.start()
    const tgt = S.ctx.currentTime
    g.gain.setValueAtTime(0, tgt)
    g.gain.linearRampToValueAtTime(1, tgt + 1.2) // gentle fade-in
    S.music = { name, src, gain: g }
  })
}

/** Fade out and stop whatever ambient track is currently playing. */
function fadeOutCurrentMusic(): void {
  const voice = S.music
  S.music = null
  if (!voice || !S.ctx) return
  const t = S.ctx.currentTime
  try {
    voice.gain.gain.cancelScheduledValues(t)
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, t)
    voice.gain.gain.linearRampToValueAtTime(0, t + 0.6)
    voice.src.stop(t + 0.7)
  } catch {
    /* source may already be stopped */
  }
}

/**
 * Request a looping ambient track. Safe to call before the first gesture: the
 * track is remembered and starts the moment audio unlocks.
 */
function playMusic(name: MusicName): void {
  S.desiredMusic = name
  if (!supported() || !S.unlocked) return
  startMusic(name)
}

/** Stop ambient music entirely. */
function stopMusic(): void {
  S.desiredMusic = null
  S.loadingMusic = null
  fadeOutCurrentMusic()
}

/** Resume the context, preload SFX, and start any desired music. Idempotent. */
function unlock(): void {
  if (!supported()) return
  ensureCtx()
  resume()
  if (!S.unlocked) {
    S.unlocked = true
    preload()
    if (S.desiredMusic) startMusic(S.desiredMusic)
  }
}

/** Attach one-time global gesture listeners that unlock audio. */
function bindGestureUnlock(): void {
  if (S.gestureBound || typeof window === 'undefined') return
  S.gestureBound = true
  const handler = () => {
    unlock()
    window.removeEventListener('pointerdown', handler)
    window.removeEventListener('keydown', handler)
    window.removeEventListener('touchstart', handler)
  }
  window.addEventListener('pointerdown', handler, { passive: true })
  window.addEventListener('keydown', handler, { passive: true })
  window.addEventListener('touchstart', handler, { passive: true })
}

/**
 * Composable accessor. Returns the shared audio API. Calling it also resolves
 * the settings store and arms the gesture-unlock listeners (cheap + idempotent).
 */
export function useAudio() {
  if (supported()) {
    settings()
    bindGestureUnlock()
    // Expose a debug handle in dev so audio can be poked from the console.
    try {
      if ((import.meta as any).dev) (window as any).__audio = { S, play, tone, playMusic, stopMusic, unlock }
    } catch {
      /* import.meta.dev not available */
    }
  }
  return { play, tone, preload, playMusic, stopMusic, unlock }
}
