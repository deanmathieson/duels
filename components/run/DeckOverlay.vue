<template>
  <Teleport to="body">
    <Transition name="deck-fade">
      <div v-if="open" class="deck-scrim" @click.self="$emit('close')">
        <aside class="deck-panel font-body" role="dialog" aria-label="Your deck">
          <header class="deck-head">
            <h2 class="deck-title font-engrave">Your Deck</h2>
            <span class="deck-total font-engrave">{{ totalCount }} cards</span>
            <button class="deck-close" aria-label="Close" @click="$emit('close')">✕</button>
          </header>

          <div class="deck-scroll">
            <!-- Signature treasure (the locked-in 16th card) -->
            <template v-if="signature">
              <p class="sec-label font-engrave">Signature</p>
              <MiniCard v-if="signature.card" :card="signature.card" class="sig-row" />
              <div v-else class="passive-row sig-row">
                <span class="pr-name font-engrave">{{ signature.name }}</span>
                <span class="pr-text">{{ signature.text }}</span>
              </div>
            </template>

            <!-- Main deck, grouped + sorted by cost -->
            <p class="sec-label font-engrave">Cards</p>
            <div class="deck-list">
              <MiniCard v-for="row in grouped" :key="row.card.id" :card="row.card" :count="row.count" />
              <p v-if="grouped.length === 0" class="deck-empty">No cards drafted yet.</p>
            </div>

            <!-- Passive treasures attached to the run -->
            <template v-if="passives.length">
              <p class="sec-label font-engrave">Passive Treasures</p>
              <div v-for="p in passives" :key="p.id" class="passive-row">
                <span class="pr-name font-engrave">{{ p.name }}</span>
                <span class="pr-text">{{ p.text }}</span>
              </div>
            </template>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import type { CardDef } from '~/game/types'
import { getCard, hasCard } from '~/game/index'
import { getTreasureDef } from '~/data/registry'

/**
 * Run-wide deck viewer: the drafted deck list (grouped, sorted by cost), the
 * signature treasure and any passive treasures. Opened from the RunHud deck
 * chip on every stage; rows hover-preview the full card via the global overlay.
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const run = useRunStore()

/** Deck ids grouped into {card, count} rows, sorted by cost then name. */
const grouped = computed<{ card: CardDef; count: number }[]>(() => {
  const counts = new Map<string, number>()
  for (const id of run.deck) counts.set(id, (counts.get(id) ?? 0) + 1)
  return [...counts.entries()]
    .filter(([id]) => hasCard(id))
    .map(([id, count]) => ({ card: getCard(id), count }))
    .sort((a, b) => a.card.cost - b.card.cost || a.card.name.localeCompare(b.card.name))
})

const totalCount = computed(() => run.deck.length + (run.signatureTreasureId ? 1 : 0))

const signature = computed(() =>
  run.signatureTreasureId ? getTreasureDef(run.signatureTreasureId) : undefined
)

const passives = computed(() => run.passiveTreasureIds.map((id: string) => getTreasureDef(id)))

/** Escape closes the overlay (only while open). */
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.deck-scrim {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(10, 6, 2, 0.45);
  backdrop-filter: blur(1.5px);
  display: flex;
  justify-content: flex-end;
}

.deck-panel {
  width: min(340px, 92vw);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #2e2013 0%, #1f1409 100%);
  border-left: 2px solid #6b4a16;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.6);
}

.deck-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(107, 74, 22, 0.55);
  background: linear-gradient(180deg, rgba(120, 86, 44, 0.25), transparent);
}
.deck-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}
.deck-total {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  color: #d8a830;
  margin-left: auto;
}
.deck-close {
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 9999px;
  border: 1.5px solid #6b4a16;
  background: linear-gradient(180deg, #4d3620 0%, #2a1c10 100%);
  color: #c7a86a;
  font-size: 0.7rem;
  cursor: pointer;
  transition: filter 0.12s ease, border-color 0.12s ease;
}
.deck-close:hover {
  filter: brightness(1.2);
  border-color: #ff6a5a;
  color: #ff8c7a;
}

.deck-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0.7rem 0.8rem 1rem;
}

.sec-label {
  font-size: 0.58rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #d8a830;
  margin: 0.7rem 0 0.35rem;
}
.sec-label:first-child {
  margin-top: 0;
}

.deck-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.deck-empty {
  font-size: 0.78rem;
  color: rgba(243, 233, 210, 0.6);
  padding: 0.4rem 0.2rem;
}

.sig-row {
  box-shadow: 0 0 10px rgba(240, 144, 42, 0.35);
  border-radius: 6px;
}

.passive-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.45rem 0.6rem;
  margin-bottom: 4px;
  border: 1px solid #6b4a16;
  border-radius: 8px;
  background: linear-gradient(180deg, #3a2a18 0%, #2a1c10 100%);
}
.pr-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffe9a8;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}
.pr-text {
  font-size: 0.7rem;
  line-height: 1.3;
  color: rgba(243, 233, 210, 0.8);
}

.deck-fade-enter-active,
.deck-fade-leave-active {
  transition: opacity 0.2s ease;
}
.deck-fade-enter-active .deck-panel,
.deck-fade-leave-active .deck-panel {
  transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1);
}
.deck-fade-enter-from,
.deck-fade-leave-to {
  opacity: 0;
}
.deck-fade-enter-from .deck-panel,
.deck-fade-leave-to .deck-panel {
  transform: translateX(30px);
}
</style>
