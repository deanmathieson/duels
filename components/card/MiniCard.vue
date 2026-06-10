<template>
  <div
    ref="rootEl"
    class="relative flex items-center gap-2 pl-0 pr-3 h-9 rounded-md overflow-hidden select-none transition hover:brightness-110"
    :class="{ 'mc-legendary': isLegendary }"
    :style="rowStyle"
    @mouseenter="preview.show(card, rootEl)"
    @mouseleave="preview.hide()"
  >
    <!-- Rarity edge accent (left, behind the mana gem) -->
    <span class="absolute left-0 top-0 bottom-0 w-[3px] z-0" :style="rarityEdgeStyle" />

    <!-- Mana cost gem -->
    <div class="mana-gem h-9 w-9 text-sm shrink-0 rounded-l-md rounded-r-none relative z-10">
      {{ card.cost }}
    </div>

    <!-- Tiny art strip -->
    <div
      class="h-7 w-7 rounded-sm shrink-0 overflow-hidden border border-black/50 relative z-10"
      style="box-shadow: inset 0 0 4px rgba(0,0,0,0.6)"
    >
      <img
        v-if="card.art"
        :src="card.art"
        :alt="card.name"
        class="w-full h-full object-cover"
        draggable="false"
      />
      <div v-else class="w-full h-full flex items-center justify-center" :style="artStyle">
        <span class="font-engrave text-white/90 text-xs">{{ initial }}</span>
      </div>
    </div>

    <!-- Name -->
    <span
      class="font-engrave text-parchment-light text-xs truncate flex-1 relative z-10"
      style="text-shadow: 0 1px 1px rgba(0,0,0,0.8)"
      >{{ card.name }}</span
    >

    <!-- Count badge (deck list duplicates) -->
    <span
      v-if="count && count > 1"
      class="font-engrave text-gold-light text-xs shrink-0 relative z-10 px-1 rounded-[3px]"
      style="text-shadow: 0 1px 1px rgba(0,0,0,0.8); background: rgba(0,0,0,0.28)"
      >x{{ count }}</span
    >

    <!-- Rarity strip on the right edge -->
    <span class="absolute right-0 top-0 bottom-0 w-1 z-0" :style="rarityStripStyle" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CardDef, CardClass, Rarity } from '~/game/types'

/** Compact one-line card row for deck lists, buckets and hand overflow. */
const props = withDefaults(
  defineProps<{
    card: CardDef
    /** Optional duplicate count badge. */
    count?: number
  }>(),
  { count: 1 }
)

// Hovering a compact row surfaces the full card via the shared preview overlay.
const rootEl = ref<HTMLElement | null>(null)
const preview = useCardPreview()

const RARITY_COLOR: Record<Rarity, string> = {
  free: '#9aa0a6',
  common: '#c7ccd1',
  rare: '#3d7ff0',
  epic: '#b14ee0',
  legendary: '#f0902a'
}

const CLASS_TINT: Record<CardClass, string> = {
  neutral: '#8b7355',
  druid: '#6b8f3a',
  hunter: '#3f7a2e',
  mage: '#3f7fd6',
  paladin: '#d6b23f',
  priest: '#cfcabc',
  rogue: '#5a5f66',
  shaman: '#2f5fd6',
  warlock: '#8a3fd6',
  warrior: '#b3402a'
}

const initial = computed(() => props.card.name.charAt(0).toUpperCase())

const isLegendary = computed(() => props.card.rarity === 'legendary')

const rowStyle = computed(() => ({
  background: isLegendary.value
    ? 'linear-gradient(180deg, #4a3415 0%, #2a1c10 100%)'
    : 'linear-gradient(180deg, #3a2a18 0%, #2a1c10 100%)',
  border: isLegendary.value ? '1px solid #c79018' : '1px solid #6b4a16',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.4)'
}))

const artStyle = computed(() => {
  const tint = CLASS_TINT[props.card.cardClass] ?? CLASS_TINT.neutral
  return { background: `radial-gradient(circle at 35% 30%, ${tint}, #1d140b)` }
})

const rarityStripStyle = computed(() => {
  const c = RARITY_COLOR[props.card.rarity]
  return {
    background: `linear-gradient(180deg, ${c}, rgba(0,0,0,0.4))`,
    boxShadow: `0 0 6px ${c}66`
  }
})

/** A subtle colored sliver at the left edge echoing rarity. */
const rarityEdgeStyle = computed(() => {
  const c = RARITY_COLOR[props.card.rarity]
  return { background: `linear-gradient(180deg, ${c}, rgba(0,0,0,0.25))` }
})
</script>

<style scoped>
/* Legendary rows get a faint warm shimmer along the surface. */
.mc-legendary::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent 40%,
    rgba(255, 224, 138, 0.16) 50%,
    transparent 60%
  );
  background-size: 220% 100%;
  background-position: 150% 0;
  animation: mcLegendarySheen 5s ease-in-out infinite;
}
@keyframes mcLegendarySheen {
  0% {
    background-position: 150% 0;
  }
  60%,
  100% {
    background-position: -150% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mc-legendary::after {
    animation: none;
    background-position: -150% 0;
  }
}
</style>
