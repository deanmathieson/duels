<template>
  <Teleport to="body">
    <Transition name="mull" appear>
      <div class="mulligan-overlay" role="dialog" aria-modal="true">
        <div class="scrim" />

        <div class="mull-panel">
          <header class="mull-head">
            <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">
              {{ goingFirst ? 'You hold the first move' : 'You move second — take the Coin' }}
            </p>
            <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Your Opening Hand</h1>
            <div class="head-underline" />
            <p class="font-body text-parchment-light/70 text-sm mt-2">
              Tap a card to send it back to the deck for a fresh draw. The moor draws what it draws.
            </p>
          </header>

          <div class="mull-cards">
            <div
              v-for="c in cards"
              :key="c.instanceId"
              class="mull-card"
              :class="{ replacing: replace.has(c.instanceId), locked: c.locked }"
              @click="toggle(c)"
            >
              <CardView :card="c.def" no-hover />
              <!-- Replace veil -->
              <div v-if="replace.has(c.instanceId)" class="replace-veil">
                <span class="replace-x">↺</span>
                <span class="replace-label font-engrave">REPLACE</span>
              </div>
              <!-- Coin lock -->
              <div v-else-if="c.locked" class="locked-tag font-engrave">KEPT</div>
            </div>
          </div>

          <div class="mull-foot">
            <p class="mull-count font-body">
              {{ replaceCount === 0 ? 'Keeping your whole hand' : `Replacing ${replaceCount} card${replaceCount === 1 ? '' : 's'}` }}
            </p>
            <BaseButton variant="gold" size="lg" :disabled="submitting" @click="confirm">
              {{ submitting ? 'Drawing…' : 'Begin the Duel' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { getCard, hasCard } from '~/game/index'
import type { CardDef } from '~/game/types'

/**
 * The opening-hand mulligan. Shown while the match is in the 'mulligan' phase:
 * the player marks cards to send back for a redraw, then confirms to begin.
 * The Coin (dealt when going second) is locked — always kept.
 */
const store = useGameStore()

/** Instance ids the player has marked for replacement (default: keep all). */
const replace = reactive(new Set<string>())
const submitting = ref(false)

/** Player 0 leads when they're the active player at match start. */
const goingFirst = computed(() => store.match?.activePlayer === 0)

interface MullCard {
  instanceId: string
  def: CardDef
  /** The Coin can't be mulliganed. */
  locked: boolean
}

const cards = computed<MullCard[]>(() =>
  (store.human?.hand ?? []).map((c) => ({
    instanceId: c.instanceId,
    def: hasCard(c.cardId)
      ? getCard(c.cardId)
      : ({ id: c.cardId, name: '?', cost: c.cost, type: 'spell', cardClass: 'neutral', rarity: 'common', text: '' } as CardDef),
    locked: c.cardId === 'the_coin',
  }))
)

const replaceCount = computed(() => replace.size)

/** Toggle a card between keep and replace (locked cards never toggle). */
function toggle(c: MullCard): void {
  if (c.locked || submitting.value) return
  if (replace.has(c.instanceId)) replace.delete(c.instanceId)
  else replace.add(c.instanceId)
}

/** Confirm: keep everything not marked for replacement, then start the game. */
function confirm(): void {
  if (submitting.value) return
  submitting.value = true
  const keep = cards.value.filter((c) => !replace.has(c.instanceId)).map((c) => c.instanceId)
  void store.humanMulligan(keep)
}
</script>

<style scoped>
.mulligan-overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 30%, rgba(20, 12, 6, 0.86), rgba(8, 5, 2, 0.95));
  backdrop-filter: blur(3px);
}

.mull-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.4rem;
  max-width: min(1000px, 94vw);
}

.mull-head {
  text-align: center;
}
.head-underline {
  width: 80px;
  height: 2px;
  margin: 0.5rem auto 0;
  background: linear-gradient(90deg, transparent, #f0c850, transparent);
  opacity: 0.6;
}

.mull-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.mull-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.16s cubic-bezier(0.2, 0.9, 0.3, 1), filter 0.16s ease;
  border-radius: 14px;
}
.mull-card:not(.locked):hover {
  transform: translateY(-8px) scale(1.02);
}
.mull-card.replacing {
  filter: grayscale(0.75) brightness(0.6);
  transform: translateY(4px) scale(0.96);
}
.mull-card.locked {
  cursor: default;
}

/* Replace veil over a marked card */
.replace-veil {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  border-radius: 14px;
  background: rgba(20, 10, 6, 0.45);
  pointer-events: none;
}
.replace-x {
  font-size: 2.4rem;
  color: #ff9b8c;
  text-shadow: 0 0 12px rgba(255, 80, 60, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9);
}
.replace-label {
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: #ffb3a0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
}

/* The Coin's "kept" tag */
.locked-tag {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 0.5rem;
  letter-spacing: 0.16em;
  color: #ffe9a8;
  background: rgba(20, 12, 6, 0.8);
  border: 1px solid rgba(240, 200, 80, 0.5);
  border-radius: 9999px;
  padding: 2px 8px;
  pointer-events: none;
}

.mull-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}
.mull-count {
  font-size: 0.8rem;
  color: rgba(243, 233, 210, 0.7);
  letter-spacing: 0.04em;
}

/* Enter/leave */
.mull-enter-active {
  transition: opacity 0.3s ease;
}
.mull-leave-active {
  transition: opacity 0.25s ease;
}
.mull-enter-from,
.mull-leave-to {
  opacity: 0;
}
.mull-enter-active .mull-panel {
  transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.mull-enter-from .mull-panel {
  transform: translateY(20px) scale(0.96);
}

@media (max-width: 640px) {
  .mull-cards {
    gap: 0.5rem;
  }
  .mull-card :deep(.hs-card) {
    width: 120px;
  }
}
</style>
