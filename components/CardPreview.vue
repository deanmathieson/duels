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
          <CardView :card="card" :spell-damage="spellDamage" />
        </div>

        <!-- Keyword glossary plates (Hearthstone-style reference tiles) -->
        <div v-if="glossary.length" class="glossary-col" :class="glossarySide">
          <div v-for="g in glossary" :key="g.label" class="glossary-plate">
            <span class="glossary-term font-engrave">{{ g.label }}</span>
            <span class="glossary-text font-body">{{ g.text }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { Keyword } from '~/game/types'
import {
  KEYWORD_DESCRIPTION,
  KEYWORD_LABEL,
  MECHANIC_DESCRIPTION,
  MECHANIC_LABEL,
} from '~/data/terms'

/**
 * Global hovered-card preview overlay. A single instance lives at the app root
 * and renders a large, fully-readable copy of whatever card is being hovered.
 * It is teleported to <body> and positioned with `position: fixed`, so it escapes
 * every `overflow` container (deck-builder pool, reward fan, …) and is then clamped
 * to the viewport — it can never clip at a screen or container edge.
 */
const { card, anchor, spellDamage } = useCardPreview()

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

/* --------------------------------------------------------------------------
 * Keyword glossary — definition plates beside the zoomed card for every
 * Hollowmoor term the card carries (keywords) or references (rules text), so
 * new players never need outside knowledge to read a card.
 * ----------------------------------------------------------------------- */
interface GlossaryEntry {
  label: string
  text: string
}

const MAX_PLATES = 4

const glossary = computed<GlossaryEntry[]>(() => {
  const c = card.value
  if (!c) return []
  const out: GlossaryEntry[] = []
  const seen = new Set<string>()
  const add = (label: string, text: string): void => {
    if (seen.has(label) || out.length >= MAX_PLATES) return
    seen.add(label)
    out.push({ label, text })
  }

  // Mechanics the card has (or its text references by display name).
  if (c.battlecry || c.text.includes(MECHANIC_LABEL.battlecry)) {
    add(MECHANIC_LABEL.battlecry, MECHANIC_DESCRIPTION.battlecry)
  }
  if (c.deathrattle || c.text.includes(MECHANIC_LABEL.deathrattle)) {
    add(MECHANIC_LABEL.deathrattle, MECHANIC_DESCRIPTION.deathrattle)
  }
  if (c.chooseOne?.length) add(MECHANIC_LABEL.chooseOne, MECHANIC_DESCRIPTION.chooseOne)

  // Keywords on the card itself, then ones its text grants/references.
  for (const k of c.keywords ?? []) add(KEYWORD_LABEL[k], KEYWORD_DESCRIPTION[k])
  if (c.spellDamage) add(KEYWORD_LABEL.spellDamage, KEYWORD_DESCRIPTION.spellDamage)
  for (const k of Object.keys(KEYWORD_LABEL) as Keyword[]) {
    if (c.text.includes(KEYWORD_LABEL[k])) add(KEYWORD_LABEL[k], KEYWORD_DESCRIPTION[k])
  }
  return out
})

/** Put the plates on whichever side of the card has room (prefer right). */
const GLOSSARY_W = 190
const glossarySide = computed<'side-right' | 'side-left'>(() => {
  const r = anchor.value
  if (!r) return 'side-right'
  const { w: vw } = viewport.value
  let left = r.left + r.width / 2 - W / 2
  left = Math.max(MARGIN, Math.min(left, vw - W - MARGIN))
  return left + W + GLOSSARY_W + 24 <= vw ? 'side-right' : 'side-left'
})
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

/* Glossary plates beside the zoomed card */
.glossary-col {
  position: absolute;
  top: 4px;
  width: 190px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.glossary-col.side-right { left: calc(100% + 12px); }
.glossary-col.side-left { right: calc(100% + 12px); }

/* Narrow screens: no room beside the card — stack the plates underneath. */
@media (max-width: 700px) {
  .glossary-col.side-right,
  .glossary-col.side-left {
    left: 0;
    right: auto;
    top: calc(100% + 8px);
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .glossary-plate {
    flex: 1 1 45%;
    min-width: 140px;
  }
}
.glossary-plate {
  padding: 7px 10px;
  border-radius: 10px;
  border: 1.5px solid #6b4a16;
  background: linear-gradient(180deg, #f3e5c3 0%, #e2cb98 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 6px 14px rgba(0, 0, 0, 0.55);
}
.glossary-term {
  display: block;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5e420a;
  margin-bottom: 1px;
}
.glossary-text {
  display: block;
  font-size: 0.68rem;
  line-height: 1.3;
  color: #3a2410;
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
