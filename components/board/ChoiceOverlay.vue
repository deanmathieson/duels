<template>
  <Teleport to="body">
    <Transition name="overlay" appear>
      <div class="choice-overlay" role="dialog" aria-modal="true">
        <div class="scrim" @click="onScrimClick" />

        <div class="choice-panel">
          <h2 class="choice-title font-engrave text-engrave">{{ title }}</h2>

          <div class="choice-row" :class="{ 'is-cards': mode === 'discover' }">
            <!-- Discover: render full CardViews from the option cardIds -->
            <template v-if="mode === 'discover'">
              <button
                v-for="(opt, i) in resolvedCards"
                :key="opt.key"
                type="button"
                class="card-choice"
                @click="$emit('pick', { cardId: opt.cardId })"
              >
                <CardView v-if="opt.card" :card="opt.card" :playable="true" />
                <div v-else class="card-fallback panel-wood">{{ opt.cardId }}</div>
              </button>
            </template>

            <!-- Choose One: render labelled option panels -->
            <template v-else>
              <button
                v-for="(opt, i) in options"
                :key="i"
                type="button"
                class="option-choice panel-parchment"
                @click="$emit('pick', { index: opt.index ?? i })"
              >
                <span class="opt-num font-engrave">{{ i + 1 }}</span>
                <span class="opt-text">{{ opt.text || `Option ${i + 1}` }}</span>
              </button>
            </template>
          </div>

          <p v-if="hint" class="choice-hint">{{ hint }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCard, hasCard } from '~/game/index'
import type { CardDef } from '~/game/types'

/**
 * Modal chooser used for both **Discover** (pick 1 of N cards) and
 * **Choose One** (pick an option). The board passes the engine's pending-choice
 * options straight through.
 */
const props = withDefaults(
  defineProps<{
    /** 'discover' renders full cards; 'chooseOne' renders option text panels. */
    mode: 'discover' | 'chooseOne'
    /** Engine pending-choice options: { cardId?, index?, text? }. */
    options: { cardId?: string; index?: number; text?: string }[]
    /** Heading text. */
    title?: string
    /** Optional helper line under the choices. */
    hint?: string
    /** Allow dismissing by clicking the scrim (chooseOne shouldn't usually). */
    dismissible?: boolean
  }>(),
  { title: '', hint: '', dismissible: false }
)

const emit = defineEmits<{
  (e: 'pick', pick: { cardId?: string; index?: number }): void
  (e: 'dismiss'): void
}>()

/** Resolve discover option cardIds into CardDefs (tolerate unknown ids). */
const resolvedCards = computed(() =>
  props.options.map((o, i) => ({
    key: `${o.cardId ?? 'opt'}-${i}`,
    cardId: o.cardId ?? '',
    card: (o.cardId && hasCard(o.cardId) ? getCard(o.cardId) : undefined) as CardDef | undefined,
  }))
)

function onScrimClick(): void {
  if (props.dismissible) emit('dismiss')
}
</script>

<style scoped>
.choice-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(20, 14, 8, 0.55), rgba(0, 0, 0, 0.82));
  backdrop-filter: blur(2px);
}
.choice-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 22px 30px 26px;
  max-width: 92vw;
}
.choice-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.choice-row {
  display: flex;
  gap: 22px;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
}

/* Discover card buttons */
.card-choice {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transform: translateY(0);
  transition: transform 0.18s ease, filter 0.18s ease;
}
.card-choice:hover {
  transform: translateY(-12px) scale(1.05);
  filter: drop-shadow(0 0 18px rgba(240, 200, 80, 0.7));
  z-index: 2;
}
.card-fallback {
  width: 200px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: #f3e9d2;
}

/* Choose One option panels */
.option-choice {
  position: relative;
  width: 240px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 18px 18px;
  cursor: pointer;
  border: 2px solid #6b4a16;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.option-choice:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 0 24px 6px rgba(240, 200, 80, 0.6);
  filter: brightness(1.04);
}
.opt-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  background: radial-gradient(circle at 35% 25%, #7a4fb0, #2a1240);
  border: 2px solid #2a1240;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
}
.opt-text {
  text-align: center;
  font-family: 'Marcellus', Georgia, serif;
  font-size: 14px;
  line-height: 1.25;
  color: #3a2410;
}
.choice-hint {
  font-size: 13px;
  color: #cdb888;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.22s ease;
}
.overlay-enter-active .choice-panel {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.overlay-enter-from {
  opacity: 0;
}
.overlay-enter-from .choice-panel {
  transform: scale(0.9) translateY(14px);
}
.overlay-leave-to {
  opacity: 0;
}
</style>
