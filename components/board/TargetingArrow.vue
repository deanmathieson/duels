<template>
  <svg class="targeting-arrow" :viewBox="`0 0 ${vw} ${vh}`" :width="vw" :height="vh">
    <defs>
      <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="grad.from" stop-opacity="0.8" />
        <stop offset="100%" :stop-color="grad.to" stop-opacity="1" />
      </linearGradient>
      <filter :id="glowId" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Curved shaft -->
    <path
      :d="pathD"
      fill="none"
      :stroke="`url(#${gradId})`"
      :stroke-width="13"
      stroke-linecap="round"
      :filter="`url(#${glowId})`"
    />
    <!-- Dotted overlay: marching ants flowing toward the target -->
    <path
      class="arrow-ants"
      :d="pathD"
      fill="none"
      stroke="#fff7df"
      stroke-width="3.5"
      stroke-linecap="round"
      stroke-dasharray="4 12"
      opacity="0.95"
    />

    <!-- Arrowhead at the target end -->
    <polygon :points="headPoints" :fill="grad.head" :filter="`url(#${glowId})`" />
    <!-- Origin nub -->
    <circle :cx="from.x" :cy="from.y" r="9" :fill="grad.to" :filter="`url(#${glowId})`" opacity="0.9" />
  </svg>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/** A glowing curved arrow drawn from a source point to the cursor / a target.
 *  The arrow self-detects whether the cursor is over a legal target (an element
 *  carrying a `.minion-target` / `.hero-target` highlight class) and tints green
 *  when it is, red otherwise — no extra props required. */
const props = defineProps<{
  /** Source point (viewport coords). */
  from: { x: number; y: number }
  /** Destination point (cursor or target center, viewport coords). */
  to: { x: number; y: number }
}>()

// Live viewport size (kept fresh by a resize listener so the SVG canvas never
// goes stale if the window resizes mid-aim).
const vw = ref(typeof window !== 'undefined' ? window.innerWidth : 1280)
const vh = ref(typeof window !== 'undefined' ? window.innerHeight : 720)
function syncViewport(): void {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}
onMounted(() => window.addEventListener('resize', syncViewport, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('resize', syncViewport))

/** Unique ids so multiple arrows (and SSR) never collide on defs. */
const uid = Math.random().toString(36).slice(2, 8)
const gradId = `arrowGrad-${uid}`
const glowId = `arrowGlow-${uid}`

/** True when the cursor/target point sits over a highlighted legal target. */
const overValidTarget = computed(() => {
  if (typeof document === 'undefined') return false
  const node = document.elementFromPoint(props.to.x, props.to.y)
  return !!node?.closest('.minion-target, .hero-target, [data-valid-target="true"]')
})

/** Colour ramp: green over a valid target, red while hovering empty space. */
const grad = computed(() => {
  if (overValidTarget.value) {
    return { from: '#d7ffb8', to: '#4fc93a', head: '#aaffaa' }
  }
  return { from: '#ffc1b3', to: '#e2503a', head: '#ff9b8c' }
})

/** Quadratic bezier that bows the arrow upward for the classic card-game arc. */
const control = computed(() => {
  const mx = (props.from.x + props.to.x) / 2
  const my = (props.from.y + props.to.y) / 2
  // Bow the curve perpendicular-ish, biased upward.
  const dist = Math.hypot(props.to.x - props.from.x, props.to.y - props.from.y)
  return { x: mx, y: my - Math.min(160, dist * 0.35) }
})

const pathD = computed(
  () => `M ${props.from.x} ${props.from.y} Q ${control.value.x} ${control.value.y} ${props.to.x} ${props.to.y}`
)

/** Arrowhead built from the tangent at the curve's endpoint. */
const headPoints = computed(() => {
  // Tangent at t=1 of a quadratic bezier points from control -> end.
  const ang = Math.atan2(props.to.y - control.value.y, props.to.x - control.value.x)
  const size = 26
  const tip = props.to
  const left = {
    x: tip.x - size * Math.cos(ang - Math.PI / 7),
    y: tip.y - size * Math.sin(ang - Math.PI / 7),
  }
  const right = {
    x: tip.x - size * Math.cos(ang + Math.PI / 7),
    y: tip.y - size * Math.sin(ang + Math.PI / 7),
  }
  return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`
})
</script>

<style scoped>
.targeting-arrow {
  position: fixed;
  inset: 0;
  z-index: 150;
  pointer-events: none;
}

/* Dashes flow toward the target — one dash period (4+12=16) per cycle. */
.arrow-ants {
  animation: arrowAnts 0.5s linear infinite;
}
@keyframes arrowAnts {
  from {
    stroke-dashoffset: 16;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .arrow-ants {
    animation: none;
  }
}
</style>
