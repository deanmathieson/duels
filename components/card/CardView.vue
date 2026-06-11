<template>
  <div
    ref="rootEl"
    class="hs-card select-none"
    :class="[
      `frame-${card.type}`,
      small ? 'w-[140px] hs-card-sm' : 'w-[200px]',
      { 'hs-card-hover': !faceDown && !noHover, 'hs-card-playable': playable && !faceDown }
    ]"
    @mouseenter="onHoverEnter"
    @mouseleave="onHoverLeave"
  >
    <!-- Face down: decorative back -->
    <CardBack v-if="faceDown" :small="small" />

    <!-- Face up -->
    <div
      v-else
      class="relative rounded-card overflow-hidden"
      :class="{ 'cv-legendary': isLegendary }"
      :style="{ aspectRatio: '200 / 280' }"
    >
      <!-- Outer golden frame (rarity-tinted rim) -->
      <div
        class="absolute inset-0 rounded-card"
        :style="outerFrameStyle"
      />
      <!-- Rarity rim glow (epic/legendary) -->
      <div
        v-if="rimGlow"
        class="absolute inset-0 rounded-card pointer-events-none"
        :style="rimGlowStyle"
      />
      <!-- Type tint glaze -->
      <div
        class="absolute inset-0 rounded-card opacity-30 pointer-events-none"
        :style="{
          background: `radial-gradient(120% 90% at 50% 0%, var(--frame-tint), transparent 60%)`
        }"
      />

      <!-- Inner content stack -->
      <div class="absolute inset-[6px] flex flex-col">
        <!-- Art window -->
        <div
          class="relative mt-[30px] mx-auto rounded-[8px] overflow-hidden"
          :class="small ? 'w-[86%] h-[49%]' : 'w-[88%] h-[51%]'"
          :style="artWindowStyle"
        >
          <img
            v-if="card.art"
            :src="card.art"
            :alt="card.name"
            class="w-full h-full object-cover"
            draggable="false"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
            :style="placeholderArtStyle"
          >
            <span
              class="font-engrave font-bold text-white/90"
              :class="small ? 'text-3xl' : 'text-5xl'"
              style="text-shadow: 0 2px 6px rgba(0,0,0,0.7)"
            >{{ initial }}</span>
          </div>
          <!-- Inner vignette to seat the art in its window -->
          <div
            class="absolute inset-0 pointer-events-none rounded-[8px]"
            style="box-shadow: inset 0 0 10px rgba(0,0,0,0.55), inset 0 2px 3px rgba(0,0,0,0.4)"
          />
          <!-- FOIL shimmer sweep over the art (epic & legendary) -->
          <div v-if="foil" class="cv-foil absolute inset-0 pointer-events-none" />
        </div>

        <!-- Name banner -->
        <div class="relative mx-auto -mt-[14px] w-[92%] z-10">
          <div
            class="px-2 py-[2px] text-center rounded-[6px] relative overflow-hidden"
            :style="nameBannerStyle"
          >
            <!-- engraved top sheen -->
            <span
              class="absolute inset-x-1 top-0 h-1/2 pointer-events-none rounded-t-[5px]"
              style="background: linear-gradient(180deg, rgba(255,233,168,0.18), transparent)"
            />
            <span
              class="font-engrave font-bold leading-tight text-engrave block truncate relative"
              :class="small ? 'text-[10px]' : 'text-[12px]'"
            >{{ card.name }}</span>
          </div>
        </div>

        <!-- Tribe / type ribbon -->
        <div
          v-if="ribbonLabel"
          class="mx-auto mt-[2px] flex items-center justify-center gap-1 font-engrave uppercase tracking-wider text-parchment-light/80"
          :class="small ? 'text-[7px]' : 'text-[8px]'"
        >
          <span class="cv-ribbon-rule" />
          <span>{{ ribbonLabel }}</span>
          <span class="cv-ribbon-rule" />
        </div>

        <!-- Card text (parchment) -->
        <div class="flex-1 mx-auto mt-[2px] w-[88%] flex items-center justify-center min-h-0">
          <div
            class="panel-parchment w-full h-full px-1.5 py-1 flex items-center justify-center overflow-hidden"
          >
            <p
              class="text-center leading-tight break-words hyphens-auto"
              :class="small ? 'text-[7px]' : 'text-[9px]'"
              style="color: #2a1607"
              v-html="renderedText"
            />
          </div>
        </div>
      </div>

      <!-- Rarity gem (center, under name banner) -->
      <div
        v-if="showRarityGem"
        class="absolute left-1/2 -translate-x-1/2 z-20"
        :class="small ? 'top-[46%]' : 'top-[48%]'"
      >
        <span class="rarity-gem block" :class="[rarityClass, { 'cv-gem-glow': rimGlow }]" />
      </div>
    </div>

    <!-- Corner gems live OUTSIDE the face's overflow-hidden/rounded container —
         inside it their -2px offsets get clipped by the border radius. -->
    <template v-if="!faceDown">
      <!-- Mana gem (top-left). Renders the LIVE cost when provided, recolored
           green (reduced) / red (increased) — one gem, never an overlay. -->
      <div
        class="mana-gem absolute -top-[2px] -left-[2px] z-20"
        :class="[
          small ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-lg',
          {
            'cv-cost-reduced': displayCost != null && displayCost < card.cost,
            'cv-cost-increased': displayCost != null && displayCost > card.cost
          }
        ]"
      >
        {{ displayCost ?? card.cost }}
      </div>

      <!-- Minion stats: attack (bottom-left) + health (bottom-right) -->
      <template v-if="card.type === 'minion'">
        <div
          class="stat-gem stat-gem-attack absolute -bottom-[2px] -left-[2px] z-20"
          :class="small ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-lg'"
        >
          {{ card.attack ?? 0 }}
        </div>
        <div
          class="stat-gem stat-gem-health absolute -bottom-[2px] -right-[2px] z-20"
          :class="small ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-lg'"
        >
          {{ card.health ?? 0 }}
        </div>
      </template>

      <!-- Weapon stats: attack (bottom-left) + durability (bottom-right) -->
      <template v-else-if="card.type === 'weapon'">
        <div
          class="stat-gem stat-gem-attack absolute -bottom-[2px] -left-[2px] z-20"
          :class="small ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-lg'"
        >
          {{ card.attack ?? 0 }}
        </div>
        <div
          class="stat-gem absolute -bottom-[2px] -right-[2px] z-20 text-white"
          :class="small ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-lg'"
          :style="durabilityGemStyle"
        >
          {{ card.durability ?? 0 }}
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CardDef, CardClass, Rarity } from '~/game/types'
import { TRIBE_LABEL } from '~/data/terms'

/** A polished collectible-card render. */
const props = withDefaults(
  defineProps<{
    card: CardDef
    /** Apply the golden playable glow + hover lift. */
    playable?: boolean
    /** Compact render (hand overflow / dense layouts). */
    small?: boolean
    /** Show the decorative card back instead of the face. */
    faceDown?: boolean
    /** Suppress the built-in hover expand (e.g. the hand manages its own hover). */
    noHover?: boolean
    /** Live (aura/reduction-adjusted) cost to show in the mana gem instead of
     *  the printed cost. The gem recolors when it differs. */
    displayCost?: number | null
    /** The owner's current Spell Damage bonus: spell text "Deal N damage"
     *  numbers render boosted (N+bonus, highlighted) (boosted-number convention). */
    spellDamage?: number
  }>(),
  { playable: false, small: false, faceDown: false, noHover: false, displayCost: null, spellDamage: 0 }
)

/**
 * On hover, surface a large, viewport-clamped copy via the global CardPreview
 * overlay so the card stays fully readable even at screen/container edges.
 * Suppressed for face-down cards and when a parent (e.g. the hand) drives its
 * own preview.
 */
const rootEl = ref<HTMLElement | null>(null)
const preview = useCardPreview()

function onHoverEnter(): void {
  if (props.faceDown || props.noHover) return
  preview.show(props.card, rootEl.value)
}
function onHoverLeave(): void {
  if (props.faceDown || props.noHover) return
  preview.hide()
}

/** Class-keyed gradient used for the placeholder art when no asset is set. */
const CLASS_GRADIENT: Record<CardClass, [string, string]> = {
  neutral: ['#8b7355', '#3a2c1d'],
  druid: ['#6b8f3a', '#26410f'],
  hunter: ['#3f7a2e', '#16310d'],
  mage: ['#3f7fd6', '#11335f'],
  paladin: ['#d6b23f', '#6b5410'],
  priest: ['#e8e4d8', '#8b8674'],
  rogue: ['#5a5f66', '#1d2024'],
  shaman: ['#2f5fd6', '#11275f'],
  warlock: ['#8a3fd6', '#3a115f'],
  warrior: ['#b3402a', '#5a1810']
}

/** Per-rarity accent colors for the gem glow + rim treatment. */
const RARITY_ACCENT: Record<Rarity, string> = {
  free: '#9aa0a6',
  common: '#c7ccd1',
  rare: '#3d7ff0',
  epic: '#b14ee0',
  legendary: '#f0902a'
}

const initial = computed(() => props.card.name.charAt(0).toUpperCase())

const gradient = computed(() => CLASS_GRADIENT[props.card.cardClass] ?? CLASS_GRADIENT.neutral)

const placeholderArtStyle = computed(() => ({
  background: `radial-gradient(120% 120% at 35% 25%, ${gradient.value[0]} 0%, ${gradient.value[1]} 100%)`
}))

const isLegendary = computed(() => props.card.rarity === 'legendary')

/** Foil shimmer over the art for the two flashiest rarities. */
const foil = computed(() => props.card.rarity === 'epic' || props.card.rarity === 'legendary')

/** Colored rim aura on epic + legendary (legendary uses its richer gold rim). */
const rimGlow = computed(() => props.card.rarity === 'epic' || props.card.rarity === 'legendary')

const accent = computed(() => RARITY_ACCENT[props.card.rarity] ?? RARITY_ACCENT.common)

const outerFrameStyle = computed(() => {
  // Legendary earns an ornate, brighter gold frame; others keep the warm gold rim.
  if (isLegendary.value) {
    return {
      background:
        'linear-gradient(180deg, #fff3c8 0%, #ffe08a 14%, #f0c850 42%, #c79018 74%, #8a5e16 100%)',
      border: '2px solid #6b4a0e',
      boxShadow:
        'inset 0 0 0 1px rgba(255,243,200,0.6), inset 0 1px 3px rgba(255,255,255,0.7), inset 0 -3px 7px rgba(0,0,0,0.5), 0 0 6px rgba(240,144,42,0.35)'
    }
  }
  return {
    background:
      'linear-gradient(180deg, #f6da86 0%, #d8a830 16%, #b8841f 48%, #8a5e16 82%, #5e420a 100%)',
    border: '2px solid #4a3209',
    boxShadow:
      'inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.55), inset 0 -2px 6px rgba(0,0,0,0.45)'
  }
})

const rimGlowStyle = computed(() => ({
  boxShadow: `inset 0 0 0 1px ${accent.value}66, 0 0 9px ${accent.value}55`
}))

const artWindowStyle = computed(() => ({
  border: isLegendary.value ? '2px solid #6b4a0e' : '2px solid #4a3209',
  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)'
}))

const nameBannerStyle = computed(() => ({
  background: isLegendary.value
    ? 'linear-gradient(180deg, #5a4022 0%, #311f0e 100%)'
    : 'linear-gradient(180deg, #4d3620 0%, #2a1c10 100%)',
  border: isLegendary.value ? '1px solid #c79018' : '1px solid #6b4a16',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.12), 0 2px 4px rgba(0,0,0,0.5)'
}))

const durabilityGemStyle = computed(() => ({
  background: 'radial-gradient(circle at 34% 28%, #cfe0ff 0%, #7c93b8 35%, #3a4a6b 70%, #1a2336 100%)',
  border: '2px solid #1a2336',
  boxShadow:
    'inset 0 2px 4px rgba(255,255,255,0.55), inset 0 -4px 8px rgba(0,0,0,0.5), 0 2px 5px rgba(0,0,0,0.6)',
  fontFamily: 'Cinzel, Georgia, serif',
  fontWeight: 800,
  textShadow: '0 1px 2px rgba(0,0,0,0.9)'
}))

const showRarityGem = computed(() => props.card.rarity !== 'free' && !props.card.token)

const rarityClass = computed(() => `rarity-${props.card.rarity}`)

// Tribe display names come from the Hollowmoor dictionary (see data/terms.ts).

/** Small ribbon under the name: tribe for minions, type otherwise. */
const ribbonLabel = computed(() => {
  if (props.card.type === 'minion') {
    const t = props.card.tribe
    return t && t !== 'none' ? TRIBE_LABEL[t] : ''
  }
  if (props.card.type === 'weapon') return 'Weapon'
  if (props.card.type === 'spell') return 'Spell'
  return ''
})

/** Escape HTML so card text cannot inject markup, then re-enable **bold**. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Render card text: escape, convert **keyword** to bold spans, newlines to <br>.
 *  For spells with an active Spell Damage bonus, "Deal N damage" shows the base
 *  number followed by a highlighted "(+B)" bonus — e.g. "Deal 1(+1) damage". */
const renderedText = computed(() => {
  let escaped = escapeHtml(props.card.text ?? '')
  if (props.card.type === 'spell' && (props.spellDamage ?? 0) > 0) {
    const bonus = props.spellDamage
    escaped = escaped.replace(
      /Deal (\d+) damage/gi,
      (_m, n: string) => `Deal ${n}<span class="card-text-sd">(+${bonus})</span> damage`
    )
  }
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<span class="card-text-kw">$1</span>')
    .replace(/\n/g, '<br>')
})
</script>

<style scoped>
/* Live cost differs from printed: green = discounted, red = taxed. */
.cv-cost-reduced {
  background: radial-gradient(circle at 32% 26%, #d7ffb8 0%, #8cff7a 24%, #4fc93a 58%, #1f6a14 100%);
  border-color: #1f6a14;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.65),
    0 0 8px rgba(110, 255, 110, 0.7);
}
.cv-cost-increased {
  background: radial-gradient(circle at 32% 26%, #ffd0c4 0%, #ff9b8c 24%, #e2503a 58%, #7a1d12 100%);
  border-color: #7a1d12;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.6),
    0 0 8px rgba(255, 110, 90, 0.7);
}

/* Thin engraved rule on either side of the tribe/type ribbon. */
.cv-ribbon-rule {
  width: 14%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240, 200, 80, 0.55), transparent);
}

/* Soft rarity gem glow for epic/legendary. */
.cv-gem-glow {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.55));
}

/* Legendary: a slow ambient breathing on the frame glow. */
.cv-legendary {
  animation: cvLegendaryPulse 3.6s ease-in-out infinite;
}
@keyframes cvLegendaryPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 2px rgba(240, 144, 42, 0.0));
  }
  50% {
    filter: drop-shadow(0 0 5px rgba(240, 144, 42, 0.45));
  }
}

/* FOIL: a diagonal light streak that sweeps across the art window. */
.cv-foil {
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255, 255, 255, 0.0) 42%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0.0) 58%,
    transparent 70%
  );
  background-size: 250% 250%;
  background-position: 150% 0;
  mix-blend-mode: screen;
  animation: cvFoilSweep 4.5s ease-in-out infinite;
}
@keyframes cvFoilSweep {
  0% {
    background-position: 150% 0;
  }
  /* hold dark between sweeps so it reads as an occasional glint */
  55%,
  100% {
    background-position: -150% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cv-legendary,
  .cv-foil {
    animation: none;
  }
  .cv-foil {
    background-position: -150% 0;
  }
}
</style>
