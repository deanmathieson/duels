<template>
  <div class="deck-build w-full h-full flex flex-col px-4 py-4 overflow-hidden">
    <header class="text-center mb-3 shrink-0 header-block">
      <h1 class="font-engrave font-extrabold text-2xl sm:text-3xl text-engrave">Build Your Deck</h1>
      <p class="font-body text-parchment-light/70 text-xs sm:text-sm mt-1">
        Pick {{ DECK_LIMIT }} cards. Your signature treasure is already locked in as the 16th card.
      </p>
    </header>

    <div class="builder-grid flex-1 min-h-0">
      <!-- ===================== POOL ===================== -->
      <section class="pool-panel panel-wood pool-section">
        <div class="pool-head">
          <h2 class="font-engrave text-gold-light text-sm tracking-wide">Card Pool</h2>
          <div class="filter-row">
            <button
              v-for="f in filters"
              :key="f.key"
              class="filter-chip font-engrave"
              :class="{ active: activeFilter === f.key }"
              @click="activeFilter = f.key"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <div class="pool-scroll">
          <div v-for="group in groupedPool" :key="group.cost" class="cost-group">
            <div class="cost-divider">
              <span class="cost-orb mana-gem">{{ group.cost > 9 ? '9+' : group.cost }}</span>
              <span class="cost-line" />
              <span class="cost-count font-engrave">{{ group.cards.length }}</span>
            </div>
            <div class="pool-cards">
              <div
                v-for="card in group.cards"
                :key="card.id"
                class="pool-card"
                :class="{
                  'in-deck': inDeck(card.id),
                  disabled: !canAdd(card.id) && !inDeck(card.id)
                }"
                @click="onPoolClick(card.id)"
              >
                <CardView :card="card" small :playable="!inDeck(card.id) && run.canAdd(card.id)" />
                <span v-if="inDeck(card.id)" class="added-badge font-engrave">
                  <span class="added-check">✓</span> IN DECK
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================== DECK ===================== -->
      <section class="deck-panel panel-wood deck-section">
        <div class="deck-head">
          <h2 class="font-engrave text-gold-light text-sm tracking-wide">Your Deck</h2>
          <div class="deck-counter-wrap">
            <span class="deck-counter font-engrave" :class="{ full: run.deckCount === DECK_LIMIT }">
              {{ run.deckCount }}/{{ DECK_LIMIT }}
            </span>
            <div v-if="run.deckCount === DECK_LIMIT" class="deck-full-glow" />
          </div>
        </div>

        <!-- Mana curve bar chart -->
        <div class="curve" title="Mana curve">
          <div v-for="c in 8" :key="c" class="curve-col">
            <div class="curve-bar-track">
              <div
                class="curve-bar"
                :class="{ 'curve-bar-active': (curve[c - 1] || 0) > 0 }"
                :style="{ height: `${curveHeight(c - 1)}%` }"
                :title="`${curve[c - 1] || 0} card(s) at cost ${c - 1}${c - 1 === 7 ? '+' : ''}`"
              />
            </div>
            <span class="curve-label font-engrave">{{ c - 1 === 7 ? '7+' : c - 1 }}</span>
          </div>
        </div>
        <!-- Curve label -->
        <p class="curve-title font-engrave">Mana Curve</p>

        <div class="deck-scroll">
          <!-- Signature treasure: fixed 16th card, shown elegantly -->
          <div v-if="signatureCard" class="sig-row">
            <div class="sig-lock-band">
              <div class="sig-band-text font-engrave">
                <span class="sig-gem rarity-gem rarity-legendary" />
                SIGNATURE
              </div>
            </div>
            <MiniCard :card="signatureCard" />
          </div>

          <!-- Deck divider -->
          <div v-if="signatureCard && run.deckCount > 0" class="deck-divider">
            <span class="divider-line" />
            <span class="divider-label font-engrave">{{ run.deckCount }} cards</span>
            <span class="divider-line" />
          </div>

          <TransitionGroup name="deck-row" tag="div" class="deck-list">
            <div
              v-for="entry in deckRows"
              :key="entry.id"
              class="deck-row"
              @click="run.deckRemove(entry.id)"
            >
              <MiniCard :card="entry.card" />
              <button class="remove-btn" title="Remove" @click.stop="run.deckRemove(entry.id)">−</button>
            </div>
          </TransitionGroup>

          <p v-if="run.deckCount === 0" class="empty-hint font-body">
            Click cards on the left to add them here.
          </p>
        </div>

        <div class="deck-foot">
          <BaseButton
            variant="gold"
            size="lg"
            full-width
            :disabled="run.deckCount !== DECK_LIMIT"
            @click="confirm"
          >
            {{ run.deckCount === DECK_LIMIT ? 'Confirm Deck &amp; Fight' : `Add ${DECK_LIMIT - run.deckCount} more` }}
          </BaseButton>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CardDef } from '~/game/types'
import { getCard } from '~/game/index'
import { collectibleCardIdsForClass, getTreasureDef } from '~/data/registry'
import { CLASS_LABEL } from '~/data/terms'
import { gsap } from 'gsap'

/** The deck-building screen: pool grouped by cost + the live deck list with a mana curve. */
const run = useRunStore()

const DECK_LIMIT = 15

/** The chosen hero's class — drives the deck pool and the class filter tab. */
const heroClass = computed(() => run.heroDef?.cardClass ?? 'neutral')
const className = computed(() => CLASS_LABEL[heroClass.value])

type FilterKey = 'all' | 'minion' | 'spell' | 'class' | 'neutral'
const filters = computed<{ key: FilterKey; label: string }[]>(() => [
  { key: 'all', label: 'All' },
  { key: 'minion', label: 'Minions' },
  { key: 'spell', label: 'Spells' },
  { key: 'class', label: className.value },
  { key: 'neutral', label: 'Neutral' },
])
const activeFilter = ref<FilterKey>('all')

/** All collectible CardDefs (deduped) in cost-then-name order. */
const allPool = computed<CardDef[]>(() => {
  const seen = new Set<string>()
  const out: CardDef[] = []
  for (const id of collectibleCardIdsForClass(heroClass.value)) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(getCard(id))
  }
  return out.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
})

/** Pool filtered by the active type/class filter. */
const filteredPool = computed(() => {
  const f = activeFilter.value
  return allPool.value.filter((c) => {
    switch (f) {
      case 'minion':
        return c.type === 'minion'
      case 'spell':
        return c.type === 'spell'
      case 'class':
        return c.cardClass === heroClass.value
      case 'neutral':
        return c.cardClass === 'neutral'
      default:
        return true
    }
  })
})

/** Pool grouped into cost buckets (8+ collapses into the last bucket). */
const groupedPool = computed(() => {
  const map = new Map<number, CardDef[]>()
  for (const card of filteredPool.value) {
    const key = Math.min(card.cost, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(card)
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cost, cards]) => ({ cost, cards }))
})

const deckSet = computed(() => new Set(run.deck))

/** Is the card already in the deck? */
function inDeck(id: string): boolean {
  return deckSet.value.has(id)
}

/** Can the card be added (under limit, not duplicated)? */
function canAdd(id: string): boolean {
  return run.canAdd(id)
}

/** Toggle a pool card in/out of the deck. */
function onPoolClick(id: string): void {
  run.deckToggle(id)
}

/** Live deck rows resolved to CardDefs, kept in cost order. */
const deckRows = computed(() =>
  run.deck
    .map((id) => ({ id, card: getCard(id) }))
    .sort((a, b) => a.card.cost - b.card.cost || a.card.name.localeCompare(b.card.name))
)

/** Histogram of deck counts indexed by cost (index 7 holds 7+). */
const curve = computed(() => {
  const bins = new Array(8).fill(0)
  for (const id of run.deck) {
    const cost = getCard(id).cost
    bins[Math.min(cost, 7)] += 1
  }
  return bins
})
const curveMax = computed(() => Math.max(1, ...curve.value))

/** Bar height percentage for a given cost bin. */
function curveHeight(i: number): number {
  return ((curve.value[i] || 0) / curveMax.value) * 100
}

/** The locked-in signature treasure card (the 16th deck card). */
const signatureCard = computed(() =>
  run.signatureTreasureId ? getTreasureDef(run.signatureTreasureId).card ?? null : null
)

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.fromTo(
    '.header-block',
    { opacity: 0, y: -14 },
    { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
  )
  gsap.fromTo(
    '.pool-section',
    { opacity: 0, x: -24 },
    { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 }
  )
  gsap.fromTo(
    '.deck-section',
    { opacity: 0, x: 24 },
    { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', delay: 0.14 }
  )
})

/** Confirm the deck and begin the run's first combat. */
function confirm(): void {
  run.confirmDeck()
}
</script>

<style scoped>
.builder-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
}
@media (max-width: 720px) {
  .builder-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
}

/* ---- pool ---- */
.pool-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0.75rem;
  opacity: 0;
}
.pool-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(107, 74, 22, 0.6);
}
.filter-row {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.filter-chip {
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid #6b4a16;
  background: rgba(42, 28, 16, 0.8);
  color: #c7a86a;
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-chip:hover {
  filter: brightness(1.25);
  transform: translateY(-1px);
}
.filter-chip.active {
  background: linear-gradient(180deg, #f0c850, #b8841f);
  color: #2a1607;
  border-color: #6b4a16;
  box-shadow: 0 2px 8px rgba(240, 200, 80, 0.35);
}

.pool-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.4rem;
}
.cost-group {
  margin-bottom: 0.55rem;
}
.cost-divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.45rem 0;
}
.cost-orb {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.7rem;
  flex: none;
}
.cost-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(107, 74, 22, 0.7), rgba(107, 74, 22, 0));
}
.cost-count {
  font-size: 0.58rem;
  color: rgba(199, 168, 106, 0.6);
  flex: none;
}
.pool-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.4rem;
}
.pool-card {
  position: relative;
  cursor: pointer;
  transition: filter 0.14s ease, transform 0.14s ease;
}
.pool-card:not(.in-deck):not(.disabled):hover {
  transform: translateY(-2px);
}
.pool-card.in-deck {
  filter: brightness(0.5) saturate(0.6);
}
.pool-card.disabled {
  filter: grayscale(0.65) brightness(0.55);
  cursor: not-allowed;
}
.added-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  color: #8cff7a;
  text-shadow: 0 0 8px rgba(80, 255, 90, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9);
  pointer-events: none;
}
.added-check {
  font-size: 0.85rem;
}

/* ---- deck ---- */
.deck-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0.75rem;
  opacity: 0;
}
.deck-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}
.deck-counter-wrap {
  position: relative;
}
.deck-counter {
  font-size: 0.9rem;
  font-weight: 800;
  color: #d8a830;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  transition: color 0.2s ease;
}
.deck-counter.full {
  color: #8cff7a;
  text-shadow: 0 0 8px rgba(80, 255, 90, 0.7), 0 1px 2px rgba(0, 0, 0, 0.9);
}
.deck-full-glow {
  position: absolute;
  inset: -4px;
  border-radius: 4px;
  background: rgba(80, 255, 90, 0.15);
  animation: full-pulse 1.4s ease-in-out infinite;
  pointer-events: none;
}

/* Mana curve chart */
.curve {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 48px;
  padding: 0.3rem 0.2rem 0.1rem;
  margin-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: rgba(20, 14, 8, 0.5);
  border: 1px solid rgba(107, 74, 22, 0.4);
  border-bottom: none;
}
.curve-title {
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-align: center;
  color: rgba(199, 168, 106, 0.5);
  margin: 0 0 0.5rem;
  border: 1px solid rgba(107, 74, 22, 0.4);
  border-top: none;
  border-radius: 0 0 6px 6px;
  background: rgba(20, 14, 8, 0.35);
  padding: 1px 0 2px;
}
.curve-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.curve-bar-track {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}
.curve-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, #9bcfff, #4a9fdf 50%, #1d5ca0);
  transition: height 0.35s cubic-bezier(0.2, 0.9, 0.3, 1);
}
.curve-bar-active {
  background: linear-gradient(180deg, #aaddff, #3d8fd0 50%, #11447f);
  box-shadow: 0 0 6px rgba(70, 160, 220, 0.4);
}
.curve-label {
  font-size: 0.5rem;
  color: #c7a86a;
  margin-top: 1px;
}

.deck-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.3rem;
}

/* Elegant signature locked row */
.sig-row {
  position: relative;
  margin-bottom: 0.4rem;
}
.sig-lock-band {
  position: absolute;
  right: 0.3rem;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}
.sig-band-text {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.5rem;
  letter-spacing: 0.14em;
  color: #ffe9a8;
  text-shadow: 0 0 8px rgba(240, 200, 80, 0.75);
}
.sig-gem {
  width: 0.55rem;
  height: 0.55rem;
}
.sig-row :deep(.mana-gem) {
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.65), 0 0 8px rgba(240, 200, 80, 0.6);
}

.deck-divider {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.3rem 0;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(107, 74, 22, 0) 0%, rgba(107, 74, 22, 0.5) 100%);
}
.divider-line:last-child {
  background: linear-gradient(270deg, rgba(107, 74, 22, 0) 0%, rgba(107, 74, 22, 0.5) 100%);
}
.divider-label {
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  color: rgba(199, 168, 106, 0.6);
  white-space: nowrap;
}

.deck-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.deck-row {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.12s ease;
}
.deck-row:hover {
  background: rgba(107, 74, 22, 0.15);
}
.remove-btn {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  border: 1.5px solid #5e0d05;
  background: radial-gradient(circle at 34% 28%, #ff9b8c, #e2503a 60%, #b32414);
  color: #fff;
  font-weight: 800;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease, filter 0.12s ease, transform 0.12s ease;
}
.deck-row:hover .remove-btn {
  opacity: 1;
}
.remove-btn:hover {
  filter: brightness(1.2);
  transform: translateY(-50%) scale(1.1);
}
.empty-hint {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(243, 233, 210, 0.45);
}

.deck-foot {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(107, 74, 22, 0.6);
}

/* row transitions */
.deck-row-enter-active,
.deck-row-leave-active {
  transition: all 0.24s cubic-bezier(0.2, 0.9, 0.3, 1);
}
.deck-row-enter-from {
  opacity: 0;
  transform: translateX(22px) scale(0.96);
}
.deck-row-leave-to {
  opacity: 0;
  transform: translateX(-22px) scale(0.96);
}
.deck-row-move {
  transition: transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1);
}

@keyframes full-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
</style>
