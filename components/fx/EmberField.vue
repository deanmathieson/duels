<template>
  <div class="ember-field pointer-events-none" :class="`ember-${variant}`" aria-hidden="true">
    <span
      v-for="p in particles"
      :key="p.id"
      class="ember-particle"
      :style="p.style"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Reusable ambient particle field — drifting embers, golden dust/motes, or
 * falling ash. Purely decorative (CSS-keyframe driven, no JS loop), so it is
 * cheap and used by the menu, victory and defeat screens.
 *
 * Variants:
 *  - 'ember' : warm orange embers drifting upward (victory / fire moments)
 *  - 'dust'  : soft golden motes drifting upward (main menu ambience)
 *  - 'ash'   : grey/ember flecks drifting upward and sideways (defeat)
 *  - 'snow'  : cool pale flecks drifting downward (generic frost ambience)
 */
const props = withDefaults(
  defineProps<{
    variant?: 'ember' | 'dust' | 'ash' | 'snow'
    /** Number of particles. Kept modest by default for performance. */
    count?: number
    /** Travel direction. 'up' rises from the floor, 'down' falls from the top. */
    direction?: 'up' | 'down'
    /** Overall opacity multiplier for the whole field. */
    intensity?: number
  }>(),
  { variant: 'dust', count: 20, direction: 'up', intensity: 1 }
)

interface Particle {
  id: number
  style: Record<string, string>
}

/**
 * Pre-compute each particle's randomized geometry/timing once. Animation runs
 * entirely in CSS so this list never needs to update after mount.
 */
const particles = computed<Particle[]>(() => {
  const down = props.direction === 'down'
  return Array.from({ length: props.count }, (_, id) => {
    const size = sizeFor() * 2
    const drift = (Math.random() * 2 - 1) * 60 // px sideways sway
    const dur = durationFor()
    const delay = Math.random() * dur
    const base: Record<string, string> = {
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: `${(0.2 + Math.random() * 0.5) * props.intensity}`,
      animationDuration: `${dur}s`,
      animationDelay: `-${delay}s`,
      '--drift': `${drift}px`,
    }
    if (down) base.top = `${-8 - Math.random() * 12}%`
    else base.bottom = `${-12 + Math.random() * 18}%`
    return { id, style: base }
  })
})

function sizeFor(): number {
  switch (props.variant) {
    case 'ash':
      return 1 + Math.random() * 2.5
    case 'snow':
      return 1.5 + Math.random() * 2.5
    case 'ember':
      return 1.5 + Math.random() * 3
    default:
      return 1 + Math.random() * 2.5
  }
}

function durationFor(): number {
  switch (props.variant) {
    case 'ember':
      return 6 + Math.random() * 6
    case 'ash':
      return 9 + Math.random() * 9
    case 'snow':
      return 8 + Math.random() * 8
    default:
      return 9 + Math.random() * 10
  }
}
</script>

<style scoped>
.ember-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.ember-particle {
  position: absolute;
  border-radius: 50%;
  will-change: transform, opacity;
}

/* Rising (default) — used by ember/dust/ash variants. */
.ember-field:not(.ember-snow) .ember-particle {
  animation-name: emberRiseFx;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}

/* Falling — used by the snow variant. */
.ember-snow .ember-particle {
  animation-name: emberFallFx;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* --- Variant looks --- */
.ember-dust .ember-particle {
  background: radial-gradient(circle, rgba(255, 233, 168, 0.95), rgba(240, 200, 80, 0) 70%);
  box-shadow: 0 0 6px rgba(240, 200, 80, 0.5);
}
.ember-ember .ember-particle {
  background: radial-gradient(circle, rgba(255, 210, 120, 0.95), rgba(240, 130, 42, 0) 70%);
  box-shadow: 0 0 7px rgba(240, 150, 60, 0.65);
}
.ember-ash .ember-particle {
  background: radial-gradient(circle, rgba(190, 120, 92, 0.85), rgba(90, 40, 24, 0) 72%);
}
.ember-snow .ember-particle {
  background: radial-gradient(circle, rgba(200, 224, 255, 0.9), rgba(120, 170, 230, 0) 70%);
  box-shadow: 0 0 5px rgba(160, 200, 255, 0.5);
}

@keyframes emberRiseFx {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  88% {
    opacity: 0.55;
  }
  100% {
    transform: translate3d(var(--drift, 20px), -98vh, 0);
    opacity: 0;
  }
}

@keyframes emberFallFx {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  88% {
    opacity: 0.6;
  }
  100% {
    transform: translate3d(var(--drift, 20px), 110vh, 0);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ember-particle {
    animation: none !important;
    opacity: 0.18 !important;
  }
}
</style>
