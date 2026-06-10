<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="card-preview">
      <div
        v-if="card"
        class="card-preview-layer"
        :style="layerStyle"
        aria-hidden="true"
      >
        <div class="card-preview-inner" :style="innerStyle">
          <CardView :card="card" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * Global hovered-card preview overlay. A single instance lives at the app root
 * and renders a large, fully-readable copy of whatever card is being hovered.
 * It is teleported to <body> and positioned with `position: fixed`, so it escapes
 * every `overflow` container (deck-builder pool, reward fan, …) and is then clamped
 * to the viewport — it can never clip at a screen or container edge.
 */
const { card, anchor } = useCardPreview()

/** Base CardView dimensions (normal size) and the preview magnification. */
const BASE_W = 200
const BASE_H = 280
const SCALE = 1.45
const GAP = 16
const MARGIN = 12

const mounted = ref(false)
const viewport = ref({ w: 1280, h: 720 })

function syncViewport(): void {
  if (typeof window === 'undefined') return
  viewport.value = { w: window.innerWidth, h: window.innerHeight }
}

onMounted(() => {
  mounted.value = true
  syncViewport()
  window.addEventListener('resize', syncViewport, { passive: true })
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('resize', syncViewport)
})

/** Visual (post-scale) footprint of the preview card. */
const W = BASE_W * SCALE
const H = BASE_H * SCALE

/**
 * Place the preview above the hovered card by default (centred on it), flipping
 * below when there isn't room above, then clamp both axes into the viewport so the
 * whole card is always on-screen.
 */
const layerStyle = computed(() => {
  const r = anchor.value
  if (!r) return { display: 'none' }
  const { w: vw, h: vh } = viewport.value

  // Horizontal: centre on the anchor, then clamp.
  let left = r.left + r.width / 2 - W / 2
  left = Math.max(MARGIN, Math.min(left, vw - W - MARGIN))

  // Vertical: prefer above; flip below if it would overflow the top; then clamp.
  let top = r.top - H - GAP
  if (top < MARGIN) top = r.bottom + GAP
  top = Math.max(MARGIN, Math.min(top, vh - H - MARGIN))

  return { left: `${left}px`, top: `${top}px`, width: `${W}px`, height: `${H}px` }
})

/** The inner card scaled up from its top-left corner to fill the footprint. */
const innerStyle = computed(() => ({
  transform: `scale(${SCALE})`,
  transformOrigin: 'top left'
}))
</script>

<style scoped>
.card-preview-layer {
  position: fixed;
  z-index: 9999;
  /* Never intercept pointer events — purely a read-aid. */
  pointer-events: none;
  filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 22px rgba(240, 200, 80, 0.28));
}
.card-preview-inner {
  width: 200px;
  height: 280px;
}

/* A snappy pop-in: rises slightly and fades while scaling up. */
.card-preview-enter-active {
  transition: opacity 0.12s ease, transform 0.14s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.card-preview-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.card-preview-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.92);
}
.card-preview-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .card-preview-enter-active,
  .card-preview-leave-active {
    transition: opacity 0.1s ease;
  }
  .card-preview-enter-from,
  .card-preview-leave-to {
    transform: none;
  }
}
</style>
