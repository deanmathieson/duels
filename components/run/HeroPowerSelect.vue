<template>
  <div class="hp-select w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-auto">
    <header class="header-block text-center mb-8">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">Step 2 of 3</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Choose a Hero Power</h1>
      <div class="header-underline" />
      <p class="font-body text-parchment-light/70 text-sm mt-3">Your signature ability, usable every turn.</p>
    </header>

    <div class="hp-row">
      <button
        v-for="(power, i) in powers"
        :key="power.id"
        ref="cardEls"
        class="hp-card"
        :class="{ selected: selectedId === power.id }"
        :style="{ '--stagger': i }"
        @click="selectedId = power.id"
      >
        <!-- Golden selection ring -->
        <div class="selection-ring" :class="{ 'ring-visible': selectedId === power.id }" />

        <!-- Crystal art disc -->
        <div class="hp-disc" :class="{ 'disc-selected': selectedId === power.id }">
          <img v-if="power.art" :src="power.art" :alt="power.name" class="hp-disc-img" draggable="false" />
          <span v-else class="hp-disc-cost font-engrave">{{ power.cost }}</span>
          <!-- Shine overlay -->
          <div class="disc-shine" />
          <span class="hp-cost-gem mana-gem">{{ power.cost }}</span>
        </div>

        <h2 class="hp-name font-engrave">{{ power.name }}</h2>
        <div class="hp-text-plate panel-parchment">
          <p class="hp-text font-body" v-html="renderText(power.text)" />
        </div>

        <span v-if="selectedId === power.id" class="hp-chosen-flag font-engrave">
          <span class="chosen-check">✓</span> SELECTED
        </span>
      </button>
    </div>

    <div class="mt-8 flex items-center gap-3 action-row">
      <BaseButton variant="wood" size="md" @click="goBack">Back</BaseButton>
      <BaseButton variant="gold" size="lg" :disabled="!selectedId" @click="choose">Confirm Power</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getHeroDef, getHeroPowerDef } from '~/data/registry'
import { gsap } from 'gsap'

/** Hero-power draft: presents the chosen hero's powers as large selectable cards. */
const run = useRunStore()

const cardEls = ref<HTMLElement[]>([])

const powers = computed(() => {
  const heroId = run.heroId
  if (!heroId) return []
  return getHeroDef(heroId).heroPowers.map((id) => getHeroPowerDef(id))
})

const selectedId = ref<string | undefined>(undefined)

/** Re-enable simple **bold** markup from card/power text, escaping the rest. */
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
    { opacity: 0, y: -18 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )
  gsap.fromTo(
    cardEls.value,
    { opacity: 0, y: 36, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.09, ease: 'back.out(1.5)', delay: 0.12 }
  )
  gsap.fromTo(
    '.action-row',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.55 }
  )
})

/** Lock in the chosen hero power and advance. */
function choose(): void {
  if (!selectedId.value) return
  run.selectHeroPower(selectedId.value)
}

/** Step back to hero selection. */
function goBack(): void {
  run.stage = 'heroSelect'
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

.hp-row {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
}

.hp-card {
  position: relative;
  width: 250px;
  max-width: 86vw;
  padding: 1.25rem 1rem 1rem;
  border: 2px solid #6b4a16;
  border-radius: 16px;
  text-align: center;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(122, 79, 176, 0.28), rgba(0, 0, 0, 0) 60%),
    linear-gradient(180deg, #3a2a18 0%, #2a1c10 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 24px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease, border-color 0.18s ease;
  will-change: transform;
  opacity: 0;
}
.hp-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 16px 32px rgba(0, 0, 0, 0.62);
}
.hp-card.selected {
  border-color: #f0c850;
  transform: translateY(-6px) scale(1.01);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 14px 30px rgba(0, 0, 0, 0.65),
    0 0 30px 5px rgba(240, 200, 80, 0.55);
}

/* Transparent center — an opaque fill here would paint over the card text. */
.selection-ring {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 3px solid #f0c850;
  box-shadow:
    0 0 18px 4px rgba(240, 200, 80, 0.5),
    inset 0 0 14px rgba(240, 200, 80, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.ring-visible {
  opacity: 1;
}

.hp-disc {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 0.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #6b4a16;
  background: radial-gradient(circle at 35% 28%, #c79bff 0%, #7a4fb0 45%, #3a115f 100%);
  box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.4), inset 0 -6px 12px rgba(0, 0, 0, 0.55), 0 4px 10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.disc-selected {
  border-color: #f0c850;
  box-shadow:
    inset 0 2px 6px rgba(255, 255, 255, 0.5),
    inset 0 -6px 12px rgba(0, 0, 0, 0.55),
    0 0 20px 4px rgba(177, 78, 224, 0.6),
    0 0 8px 2px rgba(240, 200, 80, 0.4);
  animation: disc-float 3s ease-in-out infinite;
}
.disc-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50% 50% 0 0;
  pointer-events: none;
}
.hp-disc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hp-disc-cost {
  font-size: 2.4rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.8);
}
.hp-cost-gem {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 1.9rem;
  height: 1.9rem;
  font-size: 0.85rem;
}

.hp-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  margin-bottom: 0.5rem;
}
.hp-text-plate {
  padding: 0.5rem 0.6rem;
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hp-text {
  font-size: 0.78rem;
  line-height: 1.35;
  color: #3a2410;
}
.hp-chosen-flag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.55rem;
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  color: #ffe9a8;
  text-shadow: 0 0 8px rgba(240, 200, 80, 0.8);
  animation: flag-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.5) both;
}
.chosen-check {
  color: #8cff7a;
  font-size: 0.8rem;
  text-shadow: 0 0 8px rgba(80, 255, 90, 0.8);
}

@keyframes disc-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes flag-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
</style>
