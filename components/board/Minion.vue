<template>
  <div
    ref="rootEl"
    class="minion-root relative select-none"
    :class="[
      small ? 'w-[78px] h-[100px]' : 'w-[112px] h-[144px]',
      {
        'cursor-pointer': canAttack || targetable,
        'minion-sick': sleeping && !canAttack,
        'minion-attacker': canAttack,
        'minion-target': targetable,
        'minion-selected': selected
      }
    ]"
    @click="$emit('select')"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <!-- Taunt shield backdrop -->
    <div v-if="hasTaunt" class="taunt-frame" aria-hidden="true" />

    <!-- Portrait disc -->
    <div class="portrait-wrap" :class="{ 'divine-ring': divineShield }">
      <div class="portrait-disc" :style="portraitStyle">
        <img
          v-if="def?.art"
          :src="def.art"
          :alt="def?.name"
          class="w-full h-full object-cover"
          draggable="false"
        />
        <span
          v-else
          class="font-engrave font-bold text-white/90"
          :class="small ? 'text-2xl' : 'text-3xl'"
          style="text-shadow: 0 2px 6px rgba(0,0,0,0.8)"
          >{{ initial }}</span
        >
        <!-- Divine shield shimmer overlay -->
        <div v-if="divineShield" class="divine-shimmer" aria-hidden="true" />
        <!-- Stealth veil -->
        <div v-if="hasStealth" class="stealth-veil" aria-hidden="true" />
      </div>

      <!-- Ready-to-attack green glow ring -->
      <div v-if="canAttack" class="attack-glow" aria-hidden="true" />
    </div>

    <!-- Name plate -->
    <div class="name-plate" :class="small ? 'text-[8px]' : 'text-[10px]'">
      {{ def?.name }}
    </div>

    <!-- Keyword pips (taunt/rush/etc) shown as small markers -->
    <div v-if="keywordBadges.length" class="kw-row">
      <span
        v-for="kw in keywordBadges"
        :key="kw.key"
        class="kw-pip"
        :style="{ background: kw.color }"
        :title="kw.label"
        >{{ kw.glyph }}</span
      >
    </div>

    <!-- Attack gem (bottom-left) -->
    <div
      ref="atkGemEl"
      class="stat-gem stat-gem-attack absolute -bottom-1 -left-1 z-20"
      :class="[small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base', { 'gem-buffed': attackClass === 'stat-buffed' }]"
    >
      <span :class="attackClass">{{ minion.attack }}</span>
    </div>

    <!-- Health gem (bottom-right) -->
    <div
      ref="hpGemEl"
      class="stat-gem stat-gem-health absolute -bottom-1 -right-1 z-20"
      :class="[small ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base', { 'gem-buffed': healthClass === 'stat-buffed', 'gem-damaged': healthClass === 'stat-damaged' }]"
    >
      <span :class="healthClass">{{ minion.health }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CardClass, Keyword, MinionInstance } from '~/game/types'
import { getCard, hasCard } from '~/game/index'
import { useAnimations } from '~/composables/useAnimations'

/** Render a live minion on the battlefield. */
const props = withDefaults(
  defineProps<{
    minion: MinionInstance
    /** This minion can attack right now (friendly + ready). */
    canAttack?: boolean
    /** This minion is a legal target for the current targeting action. */
    targetable?: boolean
    /** This minion is the currently selected attacker. */
    selected?: boolean
    /** Summoning sick / cannot act this turn (dim it). */
    sleeping?: boolean
    /** Compact render. */
    small?: boolean
  }>(),
  {
    canAttack: false,
    targetable: false,
    selected: false,
    sleeping: false,
    small: false,
  }
)

defineEmits<{ (e: 'select'): void }>()

const hovered = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const preview = useCardPreview()

/** Hover a board minion: lift it and surface the full readable card preview. */
function onEnter(): void {
  hovered.value = true
  if (def.value) preview.show(def.value, rootEl.value)
}
function onLeave(): void {
  hovered.value = false
  preview.hide()
}

/* Stat-gem refs + a "tick" pop whenever the underlying value changes. */
const atkGemEl = ref<HTMLElement | null>(null)
const hpGemEl = ref<HTMLElement | null>(null)
const { statTick } = useAnimations()

watch(
  () => props.minion.attack,
  (now, before) => {
    if (before !== undefined && now !== before) statTick(atkGemEl.value, now > before ? 'up' : 'down')
  }
)
watch(
  () => props.minion.health,
  (now, before) => {
    if (before !== undefined && now !== before) statTick(hpGemEl.value, now > before ? 'up' : 'down')
  }
)

/** Base card definition (for base stats + art); tolerates unknown ids. */
const def = computed(() => (hasCard(props.minion.cardId) ? getCard(props.minion.cardId) : undefined))

const initial = computed(() => def.value?.name.charAt(0).toUpperCase() ?? '?')

const hasTaunt = computed(() => props.minion.keywords.includes('taunt') && !props.minion.silenced)
const divineShield = computed(() => props.minion.divineShield)
const hasStealth = computed(
  () => props.minion.keywords.includes('stealth') && !props.minion.silenced
)

/** Attack colored green if buffed above base. */
const attackClass = computed(() => {
  const base = def.value?.attack ?? props.minion.attack
  if (props.minion.attack > base) return 'stat-buffed'
  if (props.minion.attack < base) return 'stat-damaged'
  return ''
})

/** Health colored green if buffed (maxHealth above base) or red if damaged. */
const healthClass = computed(() => {
  const base = def.value?.health ?? props.minion.maxHealth
  if (props.minion.health < props.minion.maxHealth) return 'stat-damaged'
  if (props.minion.maxHealth > base) return 'stat-buffed'
  return ''
})

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
  warrior: ['#b3402a', '#5a1810'],
}

const portraitStyle = computed(() => {
  const g = CLASS_GRADIENT[def.value?.cardClass ?? 'neutral'] ?? CLASS_GRADIENT.neutral
  return { background: `radial-gradient(120% 120% at 35% 25%, ${g[0]} 0%, ${g[1]} 100%)` }
})

/** Small keyword markers (skip taunt/stealth/divineShield which have visuals). */
const KW_META: Partial<Record<Keyword, { glyph: string; label: string; color: string }>> = {
  rush: { glyph: '»', label: 'Rush', color: 'linear-gradient(180deg,#7fe06b,#2c7a1f)' },
  charge: { glyph: '⚡', label: 'Charge', color: 'linear-gradient(180deg,#ffe07f,#b8841f)' },
  windfury: { glyph: '⟳', label: 'Windfury', color: 'linear-gradient(180deg,#9fd6ff,#2e7fd6)' },
  lifesteal: { glyph: '✚', label: 'Lifesteal', color: 'linear-gradient(180deg,#ff9b8c,#b32414)' },
  poisonous: { glyph: '☠', label: 'Poisonous', color: 'linear-gradient(180deg,#a6ff7f,#2c7a1f)' },
}

const keywordBadges = computed(() => {
  if (props.minion.silenced) return []
  return props.minion.keywords
    .map((k) => {
      const meta = KW_META[k]
      return meta ? { key: k, ...meta } : null
    })
    .filter((x): x is { key: Keyword; glyph: string; label: string; color: string } => !!x)
})
</script>

<style scoped>
.minion-root {
  transition: transform 0.15s ease, filter 0.15s ease;
}
.minion-root:hover {
  transform: translateY(-4px);
  z-index: 40;
}

/* Portrait disc */
.portrait-wrap {
  position: relative;
  width: 100%;
  height: 76%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.portrait-disc {
  width: 86%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #c79018;
  box-shadow:
    inset 0 2px 6px rgba(255, 255, 255, 0.3),
    inset 0 -6px 12px rgba(0, 0, 0, 0.55),
    0 3px 8px rgba(0, 0, 0, 0.6);
}

/* Name plate — sits over the portrait's bottom edge, clear of the stat gems
   whose tops reach into the lower ~22% of the tile. */
.name-plate {
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
  line-height: 1;
  pointer-events: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 16px;
}

/* Taunt: a stone shield-shaped backplate */
.taunt-frame {
  position: absolute;
  inset: -8px -4px 6px -4px;
  border-radius: 14px 14px 40% 40%;
  background: linear-gradient(180deg, #9a7a4a 0%, #6b4a2a 60%, #3a2614 100%);
  border: 3px solid #2a1c10;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.25),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.6);
  z-index: 0;
}

/* Divine shield: golden ring + shimmer sweep */
.divine-ring .portrait-disc {
  border-color: #ffe9a8;
  box-shadow:
    0 0 12px 3px rgba(255, 233, 168, 0.85),
    inset 0 -6px 12px rgba(0, 0, 0, 0.4);
}
.divine-shimmer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255, 245, 200, 0.85) 50%,
    transparent 70%
  );
  background-size: 250% 250%;
  animation: shimmerSweep 2.2s linear infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}
@keyframes shimmerSweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Stealth: translucent veil */
.stealth-veil {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(20, 30, 50, 0.55), rgba(20, 30, 50, 0.2));
  backdrop-filter: blur(1px);
}

/* Summoning sick: desaturate + dim */
.minion-sick {
  filter: grayscale(0.55) brightness(0.78);
}

/* Ready-to-attack green glow */
.minion-attacker .portrait-disc {
  border-color: #8cff7a;
}
.attack-glow {
  position: absolute;
  inset: 4%;
  border-radius: 50%;
  box-shadow: 0 0 14px 4px rgba(110, 255, 110, 0.7);
  animation: attackPulse 1.6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes attackPulse {
  0%,
  100% {
    box-shadow: 0 0 10px 2px rgba(110, 255, 110, 0.55);
  }
  50% {
    box-shadow: 0 0 18px 6px rgba(110, 255, 110, 0.85);
  }
}

/* Legal target highlight (when something is being aimed) */
.minion-target .portrait-disc {
  border-color: #ff5b5b;
  box-shadow:
    0 0 16px 5px rgba(255, 80, 80, 0.8),
    inset 0 -6px 12px rgba(0, 0, 0, 0.4);
  animation: targetPulse 1s ease-in-out infinite;
}
/* Cursor actually on the target: faster, brighter — "release here". */
.minion-target:hover .portrait-disc {
  animation-duration: 0.5s;
  box-shadow:
    0 0 24px 8px rgba(255, 80, 80, 0.95),
    inset 0 -6px 12px rgba(0, 0, 0, 0.4);
}
@keyframes targetPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Selected attacker */
.minion-selected {
  transform: translateY(-6px) scale(1.05);
}

/* Buffed / damaged stat gems get a coloured halo so changes pop at a glance. */
.gem-buffed {
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.6),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 0 8px 2px rgba(120, 255, 120, 0.85);
}
.gem-damaged {
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.55),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 0 8px 2px rgba(255, 80, 60, 0.85);
}

/* Keyword pips */
.kw-row {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  z-index: 25;
}
.kw-pip {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  font-weight: 700;
}
</style>
