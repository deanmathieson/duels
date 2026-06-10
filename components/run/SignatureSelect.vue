<template>
  <div class="sig-select w-full h-full flex flex-col items-center px-6 py-8 overflow-auto">
    <header class="header-block text-center mb-6 shrink-0">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">Step 3 of 3</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Choose a Signature Treasure</h1>
      <div class="header-underline" />
      <p class="font-body text-parchment-light/70 text-sm mt-3">
        A unique card added to your deck — the cornerstone of your run.
      </p>
    </header>

    <div class="sig-grid">
      <button
        v-for="(sig, i) in signatures"
        :key="sig.id"
        ref="cellEls"
        class="sig-cell"
        :class="{ selected: selectedId === sig.id }"
        :style="{ '--stagger': i }"
        @click="selectedId = sig.id"
      >
        <!-- Legendary glow ring on selected -->
        <div class="sig-glow-ring" :class="{ 'ring-on': selectedId === sig.id }" />

        <div class="sig-card-wrap" :class="{ 'wrap-selected': selectedId === sig.id }">
          <CardView v-if="sig.card" :card="sig.card" :playable="selectedId === sig.id" />
          <!-- PASSIVE signatures (auras only, no playable card) render in the
               same golden legendary frame as a CardView so they read as a real
               pick, with an always-on gem where the mana cost would sit. -->
          <div v-else class="sig-passive-card">
            <div class="sp-inner">
              <div class="sp-art">
                <img v-if="sig.art" :src="sig.art" :alt="sig.name" draggable="false" />
                <span v-else class="sp-initial font-engrave">{{ sig.name.charAt(0) }}</span>
              </div>
              <div class="sp-name-banner">
                <span class="sp-name font-engrave">{{ sig.name }}</span>
              </div>
              <div class="sp-ribbon font-engrave">
                <span class="sp-ribbon-rule" />
                <span>Passive</span>
                <span class="sp-ribbon-rule" />
              </div>
              <div class="sp-text-plate panel-parchment">
                <p class="sp-text font-body">{{ sig.text }}</p>
              </div>
            </div>
            <!-- Always-active marker in the mana gem's corner -->
            <span class="sp-gem font-engrave" title="Passive — always active">∞</span>
          </div>
        </div>

        <div class="sig-footer">
          <span class="sig-name font-engrave">{{ sig.name }}</span>
          <!-- Signature legendary indicator -->
          <span class="sig-legend-pip rarity-gem rarity-legendary" />
        </div>

        <!-- Selected checkmark -->
        <div v-show="selectedId === sig.id" class="sig-selected-mark font-engrave">
          <span class="sig-check">✓</span>
        </div>
      </button>
    </div>

    <div class="mt-6 flex items-center gap-3 shrink-0 action-row">
      <BaseButton variant="wood" size="md" @click="goBack">Back</BaseButton>
      <BaseButton variant="gold" size="lg" :disabled="!selectedId" @click="choose">
        Take {{ selectedName }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getHeroDef, getTreasureDef } from '~/data/registry'
import { gsap } from 'gsap'

/** Signature-treasure draft: shows the hero's signatures as full CardViews. */
const run = useRunStore()

const cellEls = ref<HTMLElement[]>([])

const signatures = computed(() => {
  const heroId = run.heroId
  if (!heroId) return []
  return getHeroDef(heroId).signatureTreasures.map((id) => getTreasureDef(id))
})

const selectedId = ref<string | undefined>(undefined)

const selectedName = computed(() =>
  selectedId.value ? signatures.value.find((s) => s.id === selectedId.value)?.name ?? 'Treasure' : 'Treasure'
)

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.fromTo(
    '.header-block',
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )
  gsap.fromTo(
    cellEls.value,
    { opacity: 0, y: 30, scale: 0.93 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)', delay: 0.1 }
  )
  gsap.fromTo(
    '.action-row',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.55 }
  )
})

/** Lock in the chosen signature and advance to deck building. */
function choose(): void {
  if (!selectedId.value) return
  run.selectSignature(selectedId.value)
}

/** Step back to hero-power selection. */
function goBack(): void {
  run.stage = 'heroPowerSelect'
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

.sig-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem 1.25rem;
  width: 100%;
  max-width: 780px;
  padding: 0.5rem;
  justify-items: center;
}

.sig-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  background: transparent;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  will-change: transform;
  opacity: 0;
}
.sig-cell:hover {
  transform: translateY(-6px);
  background: rgba(240, 200, 80, 0.06);
}
.sig-cell.selected {
  border-color: #f0c850;
  background: radial-gradient(120% 100% at 50% 0%, rgba(240, 200, 80, 0.18), rgba(0, 0, 0, 0) 70%);
  box-shadow: 0 0 30px 5px rgba(240, 200, 80, 0.45);
  transform: translateY(-8px);
}

/* Legendary shimmer ring — transparent center so the card stays readable. */
.sig-glow-ring {
  position: absolute;
  inset: -5px;
  border-radius: 22px;
  border: 2px solid #f0902a;
  box-shadow:
    0 0 18px 4px rgba(240, 144, 42, 0.5),
    inset 0 0 14px rgba(240, 144, 42, 0.3);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.ring-on {
  opacity: 1;
  animation: legendary-pulse 2.5s ease-in-out infinite;
}

/* Treasure tile for PASSIVE signatures — the same golden legendary frame and
   inner layout as a CardView (art window, name banner, parchment text), so a
   passive pick no longer looks like a broken/missing card next to real ones. */
.sig-passive-card {
  position: relative;
  width: 200px;
  height: 280px;
  border-radius: 12px;
  border: 2px solid #6b4a0e;
  background: linear-gradient(180deg, #fff3c8 0%, #ffe08a 14%, #f0c850 42%, #c79018 74%, #8a5e16 100%);
  box-shadow:
    inset 0 0 0 1px rgba(255, 243, 200, 0.6),
    inset 0 1px 3px rgba(255, 255, 255, 0.7),
    inset 0 -3px 7px rgba(0, 0, 0, 0.5),
    0 0 6px rgba(240, 144, 42, 0.35);
}
.sp-inner {
  position: absolute;
  inset: 6px;
  display: flex;
  flex-direction: column;
}
.sp-art {
  position: relative;
  margin: 24px auto 0;
  width: 88%;
  height: 51%;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #6b4a0e;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 120% at 35% 25%, #3f7fd6 0%, #11335f 100%);
}
.sp-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sp-initial {
  font-size: 3rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
}
.sp-name-banner {
  position: relative;
  margin: -14px auto 0;
  width: 92%;
  z-index: 1;
  padding: 2px 8px;
  text-align: center;
  border-radius: 6px;
  background: linear-gradient(180deg, #5a4022 0%, #311f0e 100%);
  border: 1px solid #c79018;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.5);
}
.sp-name {
  display: block;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sp-ribbon {
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 8px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(58, 36, 16, 0.85);
}
.sp-ribbon-rule {
  width: 14%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 50, 9, 0.55), transparent);
}
.sp-text-plate {
  flex: 1;
  margin: 2px auto 0;
  width: 88%;
  min-height: 0;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sp-text {
  font-size: 9px;
  line-height: 1.35;
  text-align: center;
  color: #2a1607;
}
/* Always-active gem where a card's mana cost would sit. */
.sp-gem {
  position: absolute;
  top: -2px;
  left: -2px;
  z-index: 20;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  background: radial-gradient(circle at 34% 28%, #e6b4ff 0%, #b14ee0 45%, #7a23a8 100%);
  border: 2px solid #4a1070;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.55),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 2px 5px rgba(0, 0, 0, 0.6);
}

.sig-card-wrap {
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.2s ease;
}
.wrap-selected {
  transform: scale(1.03);
  filter: drop-shadow(0 0 12px rgba(240, 144, 42, 0.5));
}

.sig-footer {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.15rem;
}
.sig-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffe9a8;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}
.sig-legend-pip {
  flex-shrink: 0;
  width: 0.6rem;
  height: 0.6rem;
}

.sig-selected-mark {
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  animation: mark-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.6) both;
}
.sig-check {
  font-size: 1rem;
  color: #8cff7a;
  text-shadow: 0 0 10px rgba(80, 255, 90, 0.8);
}

@keyframes legendary-pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
@keyframes mark-pop {
  from { opacity: 0; transform: scale(0.5) rotate(-15deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}
</style>
