<template>
  <div class="reward w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-auto">
    <header class="header-block text-center mb-7 shrink-0">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">Spoils of Victory</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Choose a Card Bundle</h1>
      <div class="header-underline" />
      <p class="font-body text-parchment-light/70 text-sm mt-3">All three cards join your deck.</p>
    </header>

    <div class="bucket-row">
      <button
        v-for="(bucket, i) in buckets"
        :key="bucket.id"
        ref="bucketEls"
        class="bucket-card"
        :class="{ selected: selectedId === bucket.id }"
        :style="{ '--stagger': i }"
        @click="selectedId = bucket.id"
      >
        <!-- Golden selection ring -->
        <div class="selection-ring" :class="{ 'ring-visible': selectedId === bucket.id }" />

        <h2 class="bucket-name font-engrave">{{ bucket.name }}</h2>

        <!-- Fanned card stack -->
        <div class="bucket-cards">
          <div
            v-for="(card, ci) in bucket.cards"
            :key="card.id"
            class="bucket-card-slot"
            :class="{ 'slot-selected': selectedId === bucket.id }"
            :style="{ '--i': ci }"
          >
            <CardView :card="card" small :playable="selectedId === bucket.id" />
          </div>
        </div>

        <!-- Card count chips -->
        <div class="bucket-chips">
          <span
            v-for="card in bucket.cards"
            :key="card.id + '_chip'"
            class="card-chip font-engrave"
          >{{ card.name }}</span>
        </div>

        <!-- Selection indicator -->
        <div v-show="selectedId === bucket.id" class="bucket-chosen font-engrave">
          <span class="chosen-star">★</span> CHOSEN
        </div>
      </button>
    </div>

    <div class="mt-8 flex items-center gap-3 shrink-0 action-row">
      <BaseButton variant="wood" size="md" @click="skip">Skip</BaseButton>
      <BaseButton variant="gold" size="lg" :disabled="!selectedId" @click="take">Add to Deck</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCard } from '~/game/index'
import { getBucketDef } from '~/data/registry'
import { gsap } from 'gsap'

/** Post-combat card-bucket reward: choose 1 of 3 bundles to add 3 cards to the deck. */
const run = useRunStore()

const bucketEls = ref<HTMLElement[]>([])

const buckets = computed(() =>
  (run.offering?.choices ?? []).map((id) => {
    const def = getBucketDef(id)
    return { id: def.id, name: def.name, cards: def.cardIds.map((c) => getCard(c)) }
  })
)

const selectedId = ref<string | undefined>(undefined)

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.fromTo(
    '.header-block',
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )
  gsap.fromTo(
    bucketEls.value,
    { opacity: 0, y: 40, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.1 }
  )
  gsap.fromTo(
    '.action-row',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.55 }
  )
})

/** Take the selected bucket and proceed to the next combat. */
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

.bucket-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1100px;
}

.bucket-card {
  position: relative;
  width: 300px;
  max-width: 88vw;
  padding: 1rem 0.8rem 1.1rem;
  border: 2px solid #6b4a16;
  border-radius: 18px;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(120, 86, 44, 0.4), rgba(0, 0, 0, 0) 60%),
    linear-gradient(180deg, #3a2a18 0%, #2a1c10 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 24px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease, border-color 0.18s ease;
  will-change: transform;
  opacity: 0;
}
.bucket-card:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 18px 36px rgba(0, 0, 0, 0.65);
}
.bucket-card.selected {
  border-color: #f0c850;
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 16px 32px rgba(0, 0, 0, 0.65),
    0 0 32px 6px rgba(240, 200, 80, 0.55);
}

/* Transparent center — an opaque fill here would paint over the bucket text. */
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
.ring-visible {
  opacity: 1;
}

.bucket-name {
  font-size: 1.05rem;
  font-weight: 800;
  text-align: center;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  margin-bottom: 0.7rem;
  letter-spacing: 0.04em;
}

/* Fanned card stack */
.bucket-cards {
  display: flex;
  justify-content: center;
  height: 200px;
  position: relative;
}
.bucket-card-slot {
  transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), margin 0.22s ease;
  transform: rotate(calc((var(--i) - 1) * 7deg));
  margin-left: -52px;
  transform-origin: bottom center;
}
.bucket-card-slot:first-child {
  margin-left: 0;
}
.bucket-card:hover .bucket-card-slot {
  margin-left: -32px;
  transform: rotate(calc((var(--i) - 1) * 5deg)) translateY(-4px);
}
.bucket-card:hover .bucket-card-slot:first-child {
  margin-left: 0;
}
/* Fan out wider when selected */
.slot-selected {
  filter: drop-shadow(0 0 6px rgba(240, 200, 80, 0.4));
}

/* Card name chips */
.bucket-chips {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  margin-top: 0.5rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(107, 74, 22, 0.4);
}
.card-chip {
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  color: rgba(243, 233, 210, 0.7);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bucket-chosen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.45rem;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #ffe9a8;
  text-shadow: 0 0 10px rgba(240, 200, 80, 0.9);
  animation: chosen-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.5) both;
}
.chosen-star {
  color: #f0c850;
  font-size: 0.85rem;
}

@keyframes chosen-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
</style>
