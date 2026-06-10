<template>
  <div class="treasure w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-auto">
    <header class="header-block text-center mb-7 shrink-0">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">A Powerful Boon</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Choose a Treasure</h1>
      <div class="header-underline" />
      <p class="font-body text-parchment-light/70 text-sm mt-3">{{ subtitle }}</p>
    </header>

    <div class="treasure-row">
      <button
        v-for="(t, i) in treasures"
        :key="t.id"
        ref="cardEls"
        class="treasure-card"
        :class="[`rarity-border-${t.rarity}`, { selected: selectedId === t.id }]"
        :style="{ '--stagger': i }"
        @click="selectedId = t.id"
      >
        <!-- Rarity-coloured ambient glow layer -->
        <div class="rarity-ambient" :class="`ambient-${t.rarity}`" />

        <!-- Selection ring (golden) -->
        <div class="selection-ring" :class="{ 'ring-visible': selectedId === t.id }" />

        <!-- Gilded emblem disc -->
        <div class="emblem" :class="[`emblem-${t.rarity}`, { 'emblem-selected': selectedId === t.id }]">
          <img v-if="t.art" :src="t.art" :alt="t.name" class="emblem-img" draggable="false" />
          <span v-else class="emblem-rune font-engrave">{{ t.name.charAt(0) }}</span>
          <!-- Shine cap -->
          <div class="emblem-shine" />
          <span class="emblem-kind font-engrave">{{ t.kindLabel }}</span>
        </div>

        <h2 class="treasure-name font-engrave">{{ t.name }}</h2>

        <!-- Rarity gem row -->
        <div class="rarity-row">
          <span class="rarity-gem" :class="`rarity-${t.rarity}`" />
          <span class="rarity-tag font-engrave" :class="`tag-${t.rarity}`">{{ t.rarity }}</span>
          <span class="rarity-gem" :class="`rarity-${t.rarity}`" />
        </div>

        <div class="treasure-text-plate panel-parchment">
          <p class="treasure-text font-body" v-html="renderText(t.text)" />
        </div>

        <!-- Selected indicator -->
        <div v-show="selectedId === t.id" class="treasure-chosen font-engrave">
          <span class="chosen-check">✓</span> CLAIMED
        </div>
      </button>
    </div>

    <div class="mt-8 flex items-center gap-3 shrink-0 action-row">
      <!-- Treasures are mandatory in Duels; Skip only appears if the rules ever allow it. -->
      <BaseButton v-if="run.canSkipReward" variant="wood" size="md" @click="skip">Skip</BaseButton>
      <BaseButton variant="gold" size="lg" :disabled="!selectedId" @click="take">Claim Treasure</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Rarity } from '~/game/types'
import { getTreasureDef } from '~/data/registry'
import { gsap } from 'gsap'

/** Post-combat treasure reward: choose 1 of 3 passive/active treasures. */
const run = useRunStore()

const cardEls = ref<HTMLElement[]>([])

interface TreasureView {
  id: string
  name: string
  text: string
  art?: string
  rarity: Rarity
  kindLabel: string
}

const treasures = computed<TreasureView[]>(() =>
  (run.offering?.choices ?? []).map((id) => {
    const def = getTreasureDef(id)
    const rarity: Rarity = def.card?.rarity ?? (def.kind === 'signature' ? 'legendary' : 'epic')
    return {
      id: def.id,
      name: def.name,
      text: def.text,
      art: def.art ?? def.card?.art,
      rarity,
      kindLabel: def.kind === 'active' ? 'Active' : def.kind === 'passive' ? 'Passive' : 'Signature',
    }
  })
)

const subtitle = computed(() => {
  const type = run.offering?.type
  if (type === 'passiveTreasure') return 'A permanent passive effect for the rest of your run.'
  if (type === 'activeTreasure') return 'A powerful card added to your deck.'
  return 'A boon to strengthen your run.'
})

const selectedId = ref<string | undefined>(undefined)

/** Re-enable simple **bold** markup from treasure text, escaping the rest. */
function renderText(text: string): string {
  const escaped = (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.fromTo(
    '.header-block',
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )
  gsap.fromTo(
    cardEls.value,
    { opacity: 0, y: 36, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.1 }
  )
  gsap.fromTo(
    '.action-row',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.55 }
  )
})

/** Claim the selected treasure and proceed to the next combat. */
function take(): void {
  if (!selectedId.value) return
  run.chooseReward(selectedId.value)
}

/** Skip the reward and fight on. */
function skip(): void {
  run.skipReward()
}
</script>

<style scoped>
.header-underline {
  width: 80px;
  height: 2px;
  margin: 0.5rem auto 0;
  background: linear-gradient(90deg, transparent, #f0c850, transparent);
  opacity: 0.6;
}

.treasure-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
}

.treasure-card {
  position: relative;
  width: 262px;
  max-width: 88vw;
  padding: 1.5rem 1rem 1.1rem;
  border: 2px solid #6b4a16;
  border-radius: 18px;
  text-align: center;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(120, 86, 44, 0.45), rgba(0, 0, 0, 0) 62%),
    linear-gradient(180deg, #3a2a18 0%, #241810 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 12px 28px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease, border-color 0.18s ease;
  will-change: transform;
  overflow: hidden;
  opacity: 0;
}
.treasure-card:hover {
  transform: translateY(-9px) scale(1.01);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0, 0, 0, 0.65);
}
.treasure-card.selected {
  border-color: #f0c850;
  transform: translateY(-9px) scale(1.025);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 16px 36px rgba(0, 0, 0, 0.7),
    0 0 36px 7px rgba(240, 200, 80, 0.6);
}

/* Rarity-tinted borders */
.rarity-border-epic { border-color: rgba(177, 78, 224, 0.55); }
.rarity-border-legendary { border-color: rgba(240, 144, 42, 0.6); }
.rarity-border-rare { border-color: rgba(61, 127, 240, 0.5); }

/* Rarity ambient glow (bottom fill) */
.rarity-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 18px;
  opacity: 0.18;
  transition: opacity 0.2s ease;
}
.treasure-card:hover .rarity-ambient,
.treasure-card.selected .rarity-ambient { opacity: 0.3; }
.ambient-epic {
  background: radial-gradient(120% 60% at 50% 100%, rgba(177, 78, 224, 0.7), transparent 70%);
}
.ambient-legendary {
  background: radial-gradient(120% 60% at 50% 100%, rgba(240, 144, 42, 0.7), transparent 70%);
}
.ambient-rare {
  background: radial-gradient(120% 60% at 50% 100%, rgba(61, 127, 240, 0.6), transparent 70%);
}
.ambient-common,
.ambient-free {
  background: radial-gradient(120% 60% at 50% 100%, rgba(199, 204, 209, 0.4), transparent 70%);
}

/* Transparent center — an opaque fill here would paint over the card text. */
.selection-ring {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  border: 3px solid #f0c850;
  box-shadow:
    0 0 18px 4px rgba(240, 200, 80, 0.5),
    inset 0 0 14px rgba(240, 200, 80, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.ring-visible { opacity: 1; }

/* Emblem disc */
.emblem {
  position: relative;
  width: 104px;
  height: 104px;
  margin: 0 auto 0.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid #6b4a16;
  box-shadow:
    inset 0 2px 6px rgba(255, 255, 255, 0.35),
    inset 0 -8px 14px rgba(0, 0, 0, 0.55),
    0 4px 12px rgba(0, 0, 0, 0.5);
  animation: emblem-float 4s ease-in-out infinite;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.emblem-selected {
  border-color: #f0c850;
  box-shadow:
    inset 0 2px 6px rgba(255, 255, 255, 0.4),
    inset 0 -8px 14px rgba(0, 0, 0, 0.55),
    0 0 22px 5px rgba(240, 200, 80, 0.45),
    0 6px 14px rgba(0, 0, 0, 0.5);
}
.emblem-epic {
  background: radial-gradient(circle at 34% 28%, #e6b4ff 0%, #b14ee0 45%, #7a23a8 100%);
}
.emblem-legendary {
  background: radial-gradient(circle at 34% 28%, #ffd9a0 0%, #f0902a 45%, #b85e10 100%);
}
.emblem-rare {
  background: radial-gradient(circle at 34% 28%, #aacbff 0%, #3d7ff0 45%, #1a4fb0 100%);
}
.emblem-common,
.emblem-free {
  background: radial-gradient(circle at 34% 28%, #ffffff 0%, #c7ccd1 50%, #8b9197 100%);
}
.emblem-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.emblem-rune {
  font-size: 2.8rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}
.emblem-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 42%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50% 50% 0 0;
  pointer-events: none;
}
.emblem-kind {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 0.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 2px 0;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;
}

.treasure-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  margin-bottom: 0.35rem;
}

.rarity-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.rarity-tag {
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.tag-epic { color: #e6b4ff; text-shadow: 0 0 8px rgba(177, 78, 224, 0.7); }
.tag-legendary { color: #ffd9a0; text-shadow: 0 0 8px rgba(240, 144, 42, 0.7); }
.tag-rare { color: #aacbff; }
.tag-common, .tag-free { color: #c7ccd1; }

.treasure-text-plate {
  padding: 0.6rem 0.7rem;
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.treasure-text {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #3a2410;
}

.treasure-chosen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.55rem;
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  color: #ffe9a8;
  text-shadow: 0 0 8px rgba(240, 200, 80, 0.8);
  animation: chosen-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.5) both;
}
.chosen-check {
  color: #8cff7a;
  font-size: 0.8rem;
  text-shadow: 0 0 8px rgba(80, 255, 90, 0.8);
}

@keyframes emblem-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes chosen-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
</style>
