<template>
  <div class="mana-tray select-none" :class="{ compact }">
    <div class="pips">
      <span
        v-for="i in MAX_MANA"
        :key="i"
        ref="pipEls"
        class="pip"
        :class="pipClass(i)"
        aria-hidden="true"
      />
    </div>
    <div v-if="!compact" class="mana-label font-engrave">
      {{ current }}<span class="slash">/</span>{{ max }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAnimations } from '~/composables/useAnimations'
import { useAudio } from '~/composables/useAudio'

/** 10 crystal pips: filled = available, dim = spent, locked beyond max. */
const props = withDefaults(
  defineProps<{
    /** Mana currently available. */
    current: number
    /** Crystals unlocked this turn. */
    max: number
    /** Tighter pip-only layout (used for the enemy). */
    compact?: boolean
  }>(),
  { compact: false }
)

const MAX_MANA = 10

const { manaFill, manaSpend } = useAnimations()
const audio = useAudio()
const pipEls = ref<HTMLElement[]>([])

/**
 * Pip state for crystal `i` (1-based):
 *  - filled: available now (i <= current)
 *  - used: unlocked but spent (current < i <= max)
 *  - locked: not yet unlocked (i > max)
 */
function pipClass(i: number): string {
  if (i <= props.current) return 'pip-filled'
  if (i <= props.max) return 'pip-used'
  return 'pip-locked'
}

/**
 * Animate crystals as they change:
 *  - gain (refill / Wild Growth): pop each newly available pip,
 *  - spend (playing a card / hero power): flick the crystals just consumed.
 */
watch(
  () => props.current,
  (now, before) => {
    if (now > before) {
      // Crystals before..now just became available — pop them in.
      for (let i = before; i < now && i < MAX_MANA; i++) manaFill(pipEls.value[i])
    } else if (now < before) {
      // Crystals now..before were just spent — flick the highest ones down.
      for (let i = now; i < before && i < MAX_MANA; i++) manaSpend(pipEls.value[i])
      // One soft "spend" cue per outlay, the player's tray only (the compact
      // tray is the enemy's — its spends are covered by their card/power SFX).
      if (!props.compact) audio.tone('mana')
    }
  }
)
</script>

<style scoped>
.mana-tray {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pips {
  display: flex;
  gap: 3px;
}
.pip {
  width: 16px;
  height: 20px;
  border-radius: 4px 4px 6px 6px;
  /* faceted crystal shard shape */
  clip-path: polygon(50% 0, 100% 32%, 82% 100%, 18% 100%, 0 32%);
  transition: filter 0.2s ease, opacity 0.2s ease;
}
.compact .pip {
  width: 12px;
  height: 15px;
}
.pip-filled {
  background: radial-gradient(circle at 36% 24%, #bfe2ff 0%, #6fb6ff 24%, #2e7fd6 58%, #11447f 100%);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.7),
    0 0 6px rgba(46, 127, 214, 0.7);
  border-bottom: 1px solid #0c3361;
}
.pip-used {
  background: radial-gradient(circle at 36% 24%, #5a6470 0%, #39424c 60%, #232b33 100%);
  opacity: 0.85;
}
.pip-locked {
  background: linear-gradient(180deg, #2a2a30, #15151a);
  opacity: 0.4;
}
.mana-label {
  font-weight: 800;
  font-size: 16px;
  color: #bfe2ff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 0 8px rgba(46, 127, 214, 0.5);
}
.slash {
  color: #6fb6ff;
  opacity: 0.7;
  margin: 0 1px;
}
</style>
