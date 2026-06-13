import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'duels-settings'

/** Animation speed multiplier presets (smaller = faster delays). */
export type AnimationSpeed = 'slow' | 'normal' | 'fast'

interface PersistedSettings {
  soundOn: boolean
  volume: number
  animationSpeed: AnimationSpeed
}

/** Clamp a value into the 0..1 range (defensive against bad persisted data). */
function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/** Map a speed preset to a 0..1 multiplier applied to engine step delays. */
const SPEED_FACTOR: Record<AnimationSpeed, number> = {
  slow: 1.4,
  normal: 1,
  fast: 0.5,
}

/**
 * Lightweight player-preferences store: sound toggle + animation speed.
 * Persisted to localStorage under 'duels-settings'. Read by the game board
 * (animation pacing) and any sound layer.
 */
export const useSettingsStore = defineStore('settings', () => {
  const soundOn = ref(true)
  /** Master sound volume, 0..1. Read by the audio layer (`useAudio`). */
  const volume = ref(0.7)
  const animationSpeed = ref<AnimationSpeed>('normal')

  /** Multiplier the game store can apply to its per-step delays. */
  const speedFactor = computed(() => SPEED_FACTOR[animationSpeed.value])

  /** Load persisted settings from localStorage (no-op on the server). */
  function load(): void {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as Partial<PersistedSettings>
      if (typeof data.soundOn === 'boolean') soundOn.value = data.soundOn
      if (typeof data.volume === 'number') volume.value = clamp01(data.volume)
      if (data.animationSpeed && data.animationSpeed in SPEED_FACTOR) {
        animationSpeed.value = data.animationSpeed
      }
    } catch {
      // Ignore malformed settings — fall back to defaults.
    }
  }

  /** Persist the current settings to localStorage. */
  function save(): void {
    if (typeof window === 'undefined') return
    try {
      const data: PersistedSettings = {
        soundOn: soundOn.value,
        volume: volume.value,
        animationSpeed: animationSpeed.value,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage may be unavailable (private mode) — ignore.
    }
  }

  /** Flip the sound on/off toggle. */
  function toggleSound(): void {
    soundOn.value = !soundOn.value
  }

  /** Set the master volume (clamped to 0..1). */
  function setVolume(v: number): void {
    volume.value = clamp01(v)
  }

  /** Cycle the volume through a few preset levels (for the menu pill). */
  function cycleVolume(): void {
    const levels = [1, 0.66, 0.33]
    // Pick the next level strictly below the current one, wrapping to the top.
    const next = levels.find((l) => l < volume.value - 0.01) ?? levels[0]
    volume.value = next
  }

  /** Cycle through the animation-speed presets (slow -> normal -> fast). */
  function cycleSpeed(): void {
    const order: AnimationSpeed[] = ['slow', 'normal', 'fast']
    const i = order.indexOf(animationSpeed.value)
    animationSpeed.value = order[(i + 1) % order.length]
  }

  load()
  watch([soundOn, volume, animationSpeed], save)

  return {
    soundOn,
    volume,
    animationSpeed,
    speedFactor,
    toggleSound,
    setVolume,
    cycleVolume,
    cycleSpeed,
    load,
    save,
  }
})

// Accept hot updates so editing this store mid-session re-patches the live
// instance instead of wedging its reactivity.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
