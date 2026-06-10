<template>
  <button
    type="button"
    class="end-turn-btn font-engrave select-none"
    :class="stateClass"
    :disabled="!enabled"
    @click="onClick"
  >
    <span class="label">{{ label }}</span>
    <span class="sub">{{ sub }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * The end-turn rope/button. Glows green and pulses when it's your turn and you
 * have nothing left to do (no plays / no attacks). Shows an "Enemy Turn"
 * waiting state otherwise.
 */
const props = withDefaults(
  defineProps<{
    /** It is the human's turn and they may act. */
    isHumanTurn?: boolean
    /** The enemy / animations are running. */
    busy?: boolean
    /** The human has no remaining plays or attacks (idle) — emphasise the button. */
    noPlays?: boolean
  }>(),
  { isHumanTurn: false, busy: false, noPlays: false }
)

const emit = defineEmits<{ (e: 'end'): void }>()

const enabled = computed(() => props.isHumanTurn)

const label = computed(() => {
  if (props.busy) return 'Enemy Turn'
  if (props.isHumanTurn) return 'End Turn'
  return 'Waiting…'
})

const sub = computed(() => {
  if (props.busy) return 'thinking…'
  if (props.isHumanTurn && props.noPlays) return 'nothing to do'
  if (props.isHumanTurn) return ''
  return ''
})

const stateClass = computed(() => ({
  ready: props.isHumanTurn,
  emphasise: props.isHumanTurn && props.noPlays,
  waiting: props.busy || !props.isHumanTurn,
}))

function onClick(): void {
  if (enabled.value) emit('end')
}
</script>

<style scoped>
.end-turn-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 64px;
  border-radius: 12px;
  border: 2px solid #6b4a16;
  cursor: pointer;
  color: #2a1607;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #ffe9a8 0%, #f0c850 32%, #d8a830 62%, #b8841f 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.7),
    inset 0 -2px 4px rgba(0, 0, 0, 0.35),
    0 4px 10px rgba(0, 0, 0, 0.45);
  transition: transform 0.12s ease, filter 0.12s ease, box-shadow 0.2s ease;
}
.end-turn-btn .label {
  font-weight: 800;
  font-size: 15px;
  text-shadow: 0 1px 0 rgba(255, 240, 200, 0.6);
}
.end-turn-btn .sub {
  font-size: 9px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.end-turn-btn.ready:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
}
.end-turn-btn.ready:active {
  transform: translateY(1px);
}

/* Emphasise when there is nothing left to do. */
.end-turn-btn.emphasise {
  background: linear-gradient(180deg, #d7ffb8 0%, #8cff7a 38%, #4fc93a 70%, #2c7a1f 100%);
  color: #0e2a06;
  border-color: #2c7a1f;
  animation: etPulse 1.4s ease-in-out infinite;
}
@keyframes etPulse {
  0%,
  100% {
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.7),
      0 0 10px 2px rgba(110, 255, 110, 0.55);
  }
  50% {
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.7),
      0 0 22px 8px rgba(110, 255, 110, 0.85);
  }
}

/* Enemy turn / busy */
.end-turn-btn.waiting {
  background: linear-gradient(180deg, #4d3620 0%, #2a1c10 100%);
  color: #cdb888;
  cursor: not-allowed;
  filter: brightness(0.92);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 3px 8px rgba(0, 0, 0, 0.5);
}
.end-turn-btn:disabled {
  cursor: not-allowed;
}
</style>
