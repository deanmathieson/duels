<template>
  <Transition name="splash" appear>
    <div
      v-if="visible"
      class="dmg-splash font-engrave"
      :class="[kind, { big: isBig }]"
      :style="posStyle"
    >
      <span class="splash-glyph" aria-hidden="true">{{ glyph }}</span>
      <span class="splash-num">{{ prefix }}{{ magnitude }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

/**
 * A self-removing floating combat number anchored to viewport coordinates.
 * The board spawns one per `damage` / `heal` event via a keyed v-for; it pops
 * in with an overshoot, drifts up in a slight arc, fades, then emits `done` so
 * the board can prune it. `lethal` hits render larger and bolder.
 */
const props = withDefaults(
  defineProps<{
    /** Signed amount: 'damage'/'lethal' shows red, 'heal' shows green. */
    amount: number
    kind?: 'damage' | 'heal' | 'lethal'
    /** Viewport anchor (center of the struck entity). */
    x: number
    y: number
    /** Lifetime before auto-removal (ms). */
    ttl?: number
  }>(),
  { kind: 'damage', ttl: 900 }
)

const emit = defineEmits<{ (e: 'done'): void }>()

const visible = ref(false)

const magnitude = computed(() => Math.abs(props.amount))
const prefix = computed(() => (props.kind === 'heal' ? '+' : '-'))
/** Big when it's a lethal blow or a heavy (6+) hit. */
const isBig = computed(() => props.kind === 'lethal' || Math.abs(props.amount) >= 6)
const glyph = computed(() => {
  if (props.kind === 'heal') return '✚'
  if (props.kind === 'lethal') return '☠'
  return ''
})

/** A little horizontal jitter so stacked numbers don't perfectly overlap. */
const drift = (Math.random() * 2 - 1) * 14

const posStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  '--drift': `${drift}px`,
}))

onMounted(() => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('done'), 420)
  }, props.ttl)
})
</script>

<style scoped>
.dmg-splash {
  position: fixed;
  z-index: 200;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 800;
  font-size: 34px;
  line-height: 1;
  pointer-events: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.6);
  will-change: transform, opacity;
}
.dmg-splash.big {
  font-size: 50px;
}
.splash-glyph {
  font-size: 0.72em;
  opacity: 0.92;
}
.dmg-splash.damage {
  color: #ff6a5a;
}
.dmg-splash.heal {
  color: #8cff7a;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95), 0 0 14px rgba(80, 220, 90, 0.6);
}
.dmg-splash.lethal {
  color: #ff8d4a;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.95), 0 0 18px rgba(255, 90, 40, 0.85);
}

/* Punchy pop in (overshoot), then arc up + fade out. */
.splash-enter-active {
  transition: transform 0.26s cubic-bezier(0.18, 1.6, 0.4, 1), opacity 0.2s ease;
}
.splash-leave-active {
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.7, 0.3), opacity 0.4s ease-in;
}
.splash-enter-from {
  transform: translate(-50%, -25%) scale(0.35);
  opacity: 0;
}
.splash-leave-to {
  transform: translate(calc(-50% + var(--drift, 0px)), -135%) scale(0.95);
  opacity: 0;
}
</style>
