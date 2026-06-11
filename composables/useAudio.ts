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
  // Menu theme is a provided track ("Gloomhollow"), not a generated loop.
  menu: 'theme_gloomhollow.wav',
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
      if ((import.meta as any).dev) (window as any).__audio = { S, play, playMusic, stopMusic, unlock }
    } catch {
      /* import.meta.dev not available */
    }
  }
  return { play, preload, playMusic, stopMusic, unlock }
}
