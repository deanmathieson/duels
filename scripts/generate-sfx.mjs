/**
 * generate-sfx.mjs — procedural sound-effect generator
 *
 * Synthesises every sound effect + ambient loop the game needs and writes them
 * as 16-bit PCM WAV files into public/assets/sfx/. The sounds are generated from
 * pure math (oscillators + filtered noise), so they are ORIGINAL works released
 * into the public domain (CC0) — nothing is downloaded or sampled, which keeps
 * the repo license-clean for a public fan project with zero attribution burden.
 *
 * The loader (composables/useAudio.ts) addresses files by name, so these can be
 * swapped 1:1 for files from a CC0 pack (e.g. kenney.nl) by overwriting them.
 *
 * Usage: node scripts/generate-sfx.mjs   (or: npm run gen-sfx)
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(ROOT, 'public/assets/sfx')

/* ---------------------------------------------------------------------------
 * WAV writing (16-bit PCM, mono)
 * ------------------------------------------------------------------------- */

/**
 * Encode a Float32 sample array (range -1..1) as a 16-bit PCM mono WAV buffer.
 * @param {Float32Array|number[]} samples
 * @param {number} sampleRate
 * @returns {Buffer}
 */
function encodeWav(samples, sampleRate) {
  const data = Buffer.alloc(samples.length * 2)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    data.writeInt16LE(Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16) // fmt chunk size
  header.writeUInt16LE(1, 20) // audio format = PCM
  header.writeUInt16LE(1, 22) // channels = mono
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28) // byte rate (mono * 2 bytes)
  header.writeUInt16LE(2, 32) // block align
  header.writeUInt16LE(16, 34) // bits per sample
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

/* ---------------------------------------------------------------------------
 * DSP helpers — all operate on / return Float32Array buffers
 * ------------------------------------------------------------------------- */

const SR = 44100 // SFX sample rate (crisp highs for clicks/impacts)
const AMB_SR = 22050 // ambient loops at half rate (smaller files, fine for pads)

/** Allocate a silent buffer of `seconds` length at the given rate. */
function buf(seconds, rate = SR) {
  return new Float32Array(Math.max(1, Math.round(seconds * rate)))
}

/** TAU. */
const TAU = Math.PI * 2

/**
 * A simple seeded PRNG so generated noise is deterministic (stable git diffs).
 * Mulberry32.
 */
function makeRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Exponential decay envelope value at time t (s) with time-constant tau (s). */
function expDecay(t, tau) {
  return Math.exp(-t / tau)
}

/** Linear attack / exponential decay envelope. */
function ad(t, attack, tau) {
  if (t < attack) return t / attack
  return expDecay(t - attack, tau)
}

/** One-pole low-pass filter applied in place; cutoff is a 0..1 coefficient. */
function lowpass(b, coeff) {
  let y = 0
  for (let i = 0; i < b.length; i++) {
    y += coeff * (b[i] - y)
    b[i] = y
  }
  return b
}

/** One-pole high-pass (signal minus low-passed signal). */
function highpass(b, coeff) {
  let y = 0
  const out = new Float32Array(b.length)
  for (let i = 0; i < b.length; i++) {
    y += coeff * (b[i] - y)
    out[i] = b[i] - y
  }
  return out
}

/** Add a sine partial into buffer b. freqFn(t)->Hz, ampFn(t)->0..1. */
function addOsc(b, rate, freqFn, ampFn, phase0 = 0, type = 'sine') {
  let phase = phase0
  for (let i = 0; i < b.length; i++) {
    const t = i / rate
    const f = typeof freqFn === 'function' ? freqFn(t) : freqFn
    phase += (TAU * f) / rate
    let v
    switch (type) {
      case 'triangle':
        v = (2 / Math.PI) * Math.asin(Math.sin(phase))
        break
      case 'square':
        v = Math.sin(phase) >= 0 ? 1 : -1
        break
      case 'saw':
        v = ((phase / TAU) % 1) * 2 - 1
        break
      default:
        v = Math.sin(phase)
    }
    b[i] += v * (typeof ampFn === 'function' ? ampFn(t) : ampFn)
  }
  return b
}

/** Peak-normalise to `peak` (default 0.95). */
function normalize(b, peak = 0.95) {
  let max = 0
  for (let i = 0; i < b.length; i++) max = Math.max(max, Math.abs(b[i]))
  if (max < 1e-6) return b
  const g = peak / max
  for (let i = 0; i < b.length; i++) b[i] *= g
  return b
}

/** Apply a short fade-in / fade-out (ms) to avoid clicks at edges. */
function fadeEdges(b, rate, ms = 4) {
  const n = Math.min(b.length >> 1, Math.round((ms / 1000) * rate))
  for (let i = 0; i < n; i++) {
    const g = i / n
    b[i] *= g
    b[b.length - 1 - i] *= g
  }
  return b
}

/* ---------------------------------------------------------------------------
 * Individual sound designers
 * ------------------------------------------------------------------------- */

/** UI click — a tight, bright tick. */
function buttonClick() {
  const b = buf(0.08)
  const rng = makeRng(101)
  // Short tonal blip + a sliver of high noise.
  addOsc(b, SR, (t) => 1500 - 600 * t, (t) => 0.6 * expDecay(t, 0.018), 0, 'triangle')
  const noise = buf(0.08)
  for (let i = 0; i < noise.length; i++) {
    const t = i / SR
    noise[i] = (rng() * 2 - 1) * 0.5 * expDecay(t, 0.008)
  }
  const hp = highpass(noise, 0.6)
  for (let i = 0; i < b.length; i++) b[i] += hp[i]
  return fadeEdges(normalize(b, 0.7), SR, 2)
}

/** Card draw — an airy upward swish. */
function cardDraw() {
  const dur = 0.3
  const b = buf(dur)
  const rng = makeRng(202)
  // Filtered noise whose body swells then fades — the "whoosh".
  const noise = buf(dur)
  for (let i = 0; i < noise.length; i++) noise[i] = rng() * 2 - 1
  // Rising low-pass: brighten over time for an upward sweep feel.
  const swept = buf(dur)
  let y = 0
  for (let i = 0; i < noise.length; i++) {
    const t = i / SR
    const coeff = 0.02 + 0.25 * (t / dur) // open the filter over time
    y += coeff * (noise[i] - y)
    const env = Math.sin(Math.PI * (t / dur)) // 0..1..0 swell
    swept[i] = y * env * 0.9
  }
  // A faint rising tone gives it pitch.
  addOsc(b, SR, (t) => 320 + 520 * (t / dur), (t) => 0.12 * Math.sin(Math.PI * (t / dur)), 0, 'sine')
  for (let i = 0; i < b.length; i++) b[i] += swept[i]
  return fadeEdges(normalize(b, 0.75), SR, 3)
}

/** Card play — a soft, woody "place / thunk". */
function cardPlay() {
  const dur = 0.24
  const b = buf(dur)
  const rng = makeRng(303)
  // Low woody thump.
  addOsc(b, SR, (t) => 150 - 40 * t, (t) => 0.9 * ad(t, 0.004, 0.05), 0, 'triangle')
  addOsc(b, SR, (t) => 95 - 20 * t, (t) => 0.5 * ad(t, 0.004, 0.07), 0, 'sine')
  // Brief paper/contact noise burst at the front.
  const noise = buf(dur)
  for (let i = 0; i < noise.length; i++) {
    const t = i / SR
    noise[i] = (rng() * 2 - 1) * 0.6 * expDecay(t, 0.02)
  }
  const shaped = lowpass(noise, 0.25)
  for (let i = 0; i < b.length; i++) b[i] += shaped[i] * 0.5
  return fadeEdges(normalize(b, 0.85), SR, 3)
}

/** Minion attack — a swing whoosh resolving into a punchy impact. */
function minionAttack() {
  const dur = 0.34
  const b = buf(dur)
  const rng = makeRng(404)
  const impactAt = 0.14 // seconds: when the swing "lands"
  for (let i = 0; i < b.length; i++) {
    const t = i / SR
    // Swing: descending band of noise before impact.
    let v = 0
    if (t < impactAt) {
      const swing = Math.sin((Math.PI * t) / impactAt)
      v += (rng() * 2 - 1) * 0.5 * swing
    } else {
      const td = t - impactAt
      // Impact: noise crack + low body thump.
      v += (rng() * 2 - 1) * 0.8 * expDecay(td, 0.04)
      v += Math.sin(TAU * (180 - 120 * td) * td) * 0.6 * expDecay(td, 0.06)
    }
    b[i] = v
  }
  lowpass(b, 0.5)
  return fadeEdges(normalize(b, 0.9), SR, 3)
}

/** Hero hit — a heavy, low thud with a downward pitch drop. */
function heroHit() {
  const dur = 0.32
  const b = buf(dur)
  const rng = makeRng(505)
  // Deep body with a fast downward pitch envelope.
  addOsc(b, SR, (t) => 140 * expDecay(t, 0.06) + 55, (t) => 1.0 * ad(t, 0.003, 0.09), 0, 'sine')
  addOsc(b, SR, (t) => 220 * expDecay(t, 0.04) + 70, (t) => 0.5 * ad(t, 0.003, 0.05), 0, 'triangle')
  // Impact grit.
  const noise = buf(dur)
  for (let i = 0; i < noise.length; i++) {
    const t = i / SR
    noise[i] = (rng() * 2 - 1) * 0.7 * expDecay(t, 0.03)
  }
  const shaped = lowpass(noise, 0.18)
  for (let i = 0; i < b.length; i++) b[i] += shaped[i] * 0.6
  return fadeEdges(normalize(b, 0.95), SR, 3)
}

/** Minion death — a descending, crumbling tone. */
function minionDeath() {
  const dur = 0.5
  const b = buf(dur)
  const rng = makeRng(606)
  // Downward "pew" (saw sliding down) + airy decay.
  addOsc(b, SR, (t) => 300 * expDecay(t, 0.18) + 70, (t) => 0.7 * expDecay(t, 0.22), 0, 'saw')
  addOsc(b, SR, (t) => 150 * expDecay(t, 0.25) + 55, (t) => 0.45 * expDecay(t, 0.28), 0, 'sine')
  // Crumble noise tail.
  const noise = buf(dur)
  for (let i = 0; i < noise.length; i++) {
    const t = i / SR
    noise[i] = (rng() * 2 - 1) * 0.4 * expDecay(t, 0.12)
  }
  const shaped = lowpass(noise, 0.12)
  for (let i = 0; i < b.length; i++) b[i] += shaped[i] * 0.5
  return fadeEdges(normalize(b, 0.85), SR, 4)
}

/** A plucked/bell tone (additive) for the stings. */
function bellInto(b, rate, freq, startT, amp, tau) {
  const partials = [
    [1, 1],
    [2, 0.5],
    [3, 0.28],
    [4.2, 0.16],
  ]
  for (let i = 0; i < b.length; i++) {
    const t = i / rate
    if (t < startT) continue
    const td = t - startT
    const env = amp * expDecay(td, tau)
    let v = 0
    for (const [mult, pamp] of partials) {
      v += Math.sin(TAU * freq * mult * td) * pamp
    }
    b[i] += v * env
  }
  return b
}

/** Victory sting — a bright ascending major arpeggio with a final shimmer. */
function victorySting() {
  const dur = 1.4
  const b = buf(dur)
  // C5 E5 G5 C6 (Hz), then a held high shimmer.
  const notes = [
    [523.25, 0.0],
    [659.25, 0.12],
    [783.99, 0.24],
    [1046.5, 0.38],
  ]
  for (const [f, t0] of notes) bellInto(b, SR, f, t0, 0.5, 0.45)
  // Sustained chord shimmer underneath.
  addOsc(b, SR, 523.25, (t) => 0.12 * Math.min(1, t / 0.4) * expDecay(Math.max(0, t - 0.4), 0.9), 0, 'triangle')
  addOsc(b, SR, 783.99, (t) => 0.1 * Math.min(1, t / 0.4) * expDecay(Math.max(0, t - 0.4), 0.9), 0, 'triangle')
  return fadeEdges(normalize(b, 0.9), SR, 6)
}

/** Defeat sting — a somber descending minor figure with a low drone. */
function defeatSting() {
  const dur = 1.6
  const b = buf(dur)
  // A4 F4 D4 (descending) — minor, mournful.
  const notes = [
    [440.0, 0.0],
    [349.23, 0.22],
    [293.66, 0.46],
  ]
  for (const [f, t0] of notes) bellInto(b, SR, f, t0, 0.42, 0.7)
  // Low minor drone (D3 + F3) swelling and fading.
  addOsc(b, SR, 146.83, (t) => 0.28 * Math.min(1, t / 0.5) * expDecay(Math.max(0, t - 0.5), 1.1), 0, 'triangle')
  addOsc(b, SR, 174.61, (t) => 0.2 * Math.min(1, t / 0.5) * expDecay(Math.max(0, t - 0.5), 1.1), 0, 'sine')
  return fadeEdges(normalize(b, 0.85), SR, 8)
}

/**
 * Build a seamlessly-looping ambient pad. Frequencies are snapped so each
 * oscillator completes a whole number of cycles over `dur`, which makes the
 * end sample line up with the start for gapless looping.
 */
function ambientPad({ dur, baseFreqs, lfoHz, peak, seed }) {
  const rate = AMB_SR
  const b = buf(dur, rate)
  const snap = (f) => Math.round(f * dur) / dur
  const lfo = snap(lfoHz)
  const rng = makeRng(seed)
  for (const f0 of baseFreqs) {
    // Each chord tone with a slightly detuned twin for warmth.
    const detune = snap(f0 * 1.005)
    const phase = rng() * TAU
    addOsc(
      b,
      rate,
      snap(f0),
      (t) => 0.5 * (0.6 + 0.4 * Math.sin(TAU * lfo * t)),
      phase,
      'sine'
    )
    addOsc(
      b,
      rate,
      detune,
      (t) => 0.35 * (0.6 + 0.4 * Math.sin(TAU * lfo * t + 1.3)),
      phase + 0.7,
      'triangle'
    )
  }
  lowpass(b, 0.4)
  normalize(b, peak)
  return b
}

/* ---------------------------------------------------------------------------
 * Menu jingle — note-based synthesis helpers
 * ------------------------------------------------------------------------- */

/** Semitone offsets for note-name parsing. */
const SEMITONES = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
}

/** Equal-temperament frequency for a note name like 'C5', 'F#4' or 'Bb3'. */
function noteFreq(name) {
  const m = /^([A-G][#b]?)(\d)$/.exec(name)
  if (!m) throw new Error(`Bad note name: ${name}`)
  const midi = (Number(m[2]) + 1) * 12 + SEMITONES[m[1]]
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/**
 * Write a decaying pluck (3 partials, fast attack) into a loop buffer. Writes
 * wrap past the end of the buffer so a tail near the loop point spills into
 * the start — that's what keeps the loop seamless without edge fades.
 */
function pluckInto(b, rate, freq, startSec, amp, tau) {
  const start = Math.round(startSec * rate)
  const len = Math.min(b.length, Math.round(tau * 6 * rate))
  const attack = 0.004
  for (let i = 0; i < len; i++) {
    const t = i / rate
    const env = amp * (t < attack ? t / attack : Math.exp(-(t - attack) / tau))
    const v =
      Math.sin(TAU * freq * t) +
      0.4 * Math.sin(TAU * freq * 2 * t) +
      0.15 * Math.sin(TAU * freq * 3 * t)
    b[(start + i) % b.length] += v * env
  }
}

/** A tiny soft noise tick (percussive pulse), wrap-around like pluckInto. */
function tickInto(b, rate, rng, startSec, amp) {
  const start = Math.round(startSec * rate)
  const len = Math.round(0.03 * rate)
  for (let i = 0; i < len; i++) {
    const t = i / rate
    b[(start + i) % b.length] += (rng() * 2 - 1) * amp * Math.exp(-t / 0.008)
  }
}

/**
 * Menu music — a jaunty 16-bar folk jig in 6/8 (dotted-quarter = 120 BPM):
 * plucked melody over an oom-pah root/fifth bass with a soft tick pulse.
 * Two 8-bar phrases (statement + higher answer) so the loop stays fresh.
 */
function menuJingle() {
  const rate = AMB_SR
  const BAR = 1.0 // seconds per 6/8 bar
  const SLOT = BAR / 6 // eighth-note grid
  // 6 tokens per bar; '.' = rest. C-major jig over C/F/G/Am.
  const MELODY = [
    'C5 E5 G5 C6 G5 E5', // C
    'G5 A5 G5 E5 C5 E5', // C
    'F5 A5 C6 A5 F5 A5', // F
    'B5 G5 B5 D6 B5 G5', // G
    'C6 G5 E5 C5 E5 G5', // C
    'A5 C6 A5 E5 A5 C6', // Am
    'F5 A5 C6 B5 G5 D5', // F -> G
    'C5 E5 G5 C6 .  . ', // C (landing)
    'G5 C6 G5 E5 G5 C6', // C
    'D6 B5 G5 B5 D6 B5', // G
    'C6 A5 E5 A5 C6 A5', // Am
    'A5 F5 C5 F5 A5 C6', // F
    'E5 G5 C6 G5 E5 G5', // C
    'F5 A5 F5 D5 F5 A5', // F
    'G5 B5 G5 D5 G5 B5', // G
    'C6 G5 E5 C5 .  . ', // C (final landing, tail wraps into bar 1)
  ]
  // Oom-pah bass per bar: [beat 1, beat 2] = root, fifth (or next chord root).
  const BASS = [
    ['C3', 'G3'], ['C3', 'G3'], ['F3', 'C4'], ['G3', 'D4'],
    ['C3', 'G3'], ['A3', 'E4'], ['F3', 'G3'], ['C3', 'G3'],
    ['C3', 'G3'], ['G3', 'D4'], ['A3', 'E4'], ['F3', 'C4'],
    ['C3', 'G3'], ['F3', 'C4'], ['G3', 'D4'], ['C3', 'G3'],
  ]
  const b = buf(MELODY.length * BAR, rate)
  const rng = makeRng(909)
  MELODY.forEach((barStr, bar) => {
    barStr.trim().split(/\s+/).forEach((tok, slot) => {
      if (tok === '.') return
      const accent = slot === 0 || slot === 3 ? 1 : 0.78 // lilt on the two beats
      pluckInto(b, rate, noteFreq(tok), bar * BAR + slot * SLOT, 0.5 * accent, 0.16)
    })
    const [oom, pah] = BASS[bar]
    pluckInto(b, rate, noteFreq(oom), bar * BAR, 0.55, 0.22)
    pluckInto(b, rate, noteFreq(pah), bar * BAR + 3 * SLOT, 0.38, 0.2)
    tickInto(b, rate, rng, bar * BAR, 0.14)
    tickInto(b, rate, rng, bar * BAR + 3 * SLOT, 0.08)
  })
  // No global filter / edge fades: they would put a state or gain discontinuity
  // exactly at the loop point. The plucks are band-limited already.
  normalize(b, 0.55)
  return b
}

/** Tenser board ambience — a low minor drone pad. */
function ambientBoard() {
  return ambientPad({
    dur: 8,
    baseFreqs: [110.0, 164.81, 220.0, 277.18], // A2 E3 A3 C#4-ish
    lfoHz: 0.18,
    peak: 0.45,
    seed: 808,
  })
}

/* ---------------------------------------------------------------------------
 * Main
 * ------------------------------------------------------------------------- */

const SFX = [
  ['button_click.wav', buttonClick, SR],
  ['card_draw.wav', cardDraw, SR],
  ['card_play.wav', cardPlay, SR],
  ['minion_attack.wav', minionAttack, SR],
  ['minion_death.wav', minionDeath, SR],
  ['hero_hit.wav', heroHit, SR],
  ['victory_sting.wav', victorySting, SR],
  ['defeat_sting.wav', defeatSting, SR],
  ['ambient_menu.wav', menuJingle, AMB_SR],
  ['ambient_board.wav', ambientBoard, AMB_SR],
]

function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Generating ${SFX.length} sounds into ${OUT_DIR}\n`)
  let totalBytes = 0
  for (const [file, gen, rate] of SFX) {
    const samples = gen()
    const wav = encodeWav(samples, rate)
    const out = resolve(OUT_DIR, file)
    writeFileSync(out, wav)
    totalBytes += wav.length
    console.log(`  [OK] ${file.padEnd(20)} ${(wav.length / 1024).toFixed(1)} KB`)
  }
  console.log(`\nDone. Total ${(totalBytes / 1024).toFixed(0)} KB.`)
}

main()
