<template>
  <div class="run-hud font-engrave">
    <!-- Left: wins / losses pips -->
    <div class="hud-cluster">
      <!-- Win pips -->
      <div class="pip-group">
        <span class="pip-label text-gold-200">WINS</span>
        <div class="pips">
          <span
            v-for="i in targetWins"
            :key="'w' + i"
            class="pip pip-win"
            :class="{ 'pip-on': i <= run.wins }"
          />
        </div>
        <span class="pip-count">{{ run.wins }}/{{ targetWins }}</span>
      </div>

      <!-- Lives pips -->
      <div class="pip-group">
        <span class="pip-label lives-label">LIVES</span>
        <div class="pips">
          <span
            v-for="i in maxLosses"
            :key="'l' + i"
            class="pip pip-life"
            :class="{ 'pip-spent': i <= run.losses }"
          />
        </div>
        <span class="pip-count lives-count">{{ maxLosses - run.losses }}</span>
      </div>
    </div>

    <!-- Center: round badge -->
    <div class="hud-center">
      <div class="round-badge">
        <span class="round-label">ROUND</span>
        <span class="round-num">{{ run.round }}</span>
        <div class="round-shine" />
      </div>
    </div>

    <!-- Right: health + deck count + abandon. The HUD hugs the top edge of the
         viewport, so these tooltips must drop DOWN — placed up they open
         off-screen. -->
    <div class="hud-cluster justify-end">
      <Tooltip text="Hero max health (grows each round)" placement="bottom">
        <div class="stat-chip health-chip">
          <span class="chip-icon">♥</span>
          <span class="chip-val">{{ run.maxHealth }}</span>
        </div>
      </Tooltip>
      <Tooltip text="View your deck" placement="bottom">
        <button class="stat-chip deck-chip deck-btn" @click="deckOpen = !deckOpen">
          <span class="chip-icon deck-icon">🂠</span>
          <span class="chip-val">{{ deckTotal }}</span>
        </button>
      </Tooltip>
      <Tooltip text="Abandon run" placement="bottom">
        <button class="abandon-btn" @click="$emit('abandon')">
          <span class="abandon-x">✕</span>
        </button>
      </Tooltip>
    </div>

    <!-- Deck list side panel (teleported to body) -->
    <DeckOverlay :open="deckOpen" @close="deckOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RUN_TARGET_WINS, RUN_MAX_LOSSES } from '~/game/types'
import { getTreasureDef } from '~/data/registry'
import { gsap } from 'gsap'

/** Persistent top overlay showing run progress (wins/losses/round/health/deck). */
const run = useRunStore()

defineEmits<{ (e: 'abandon'): void }>()

/** Whether the deck-list side panel is open. */
const deckOpen = ref(false)

const targetWins = RUN_TARGET_WINS
const maxLosses = RUN_MAX_LOSSES

/** Deck size including the signature treasure's card (+1) when it adds one —
 *  passive signatures (Beast Bond, Demonic Tide, …) put nothing in the deck. */
const deckTotal = computed(() => {
  let sigCard = 0
  try {
    if (run.signatureTreasureId && getTreasureDef(run.signatureTreasureId).card) sigCard = 1
  } catch {
    /* unknown id — count the deck only */
  }
  return run.deckCount + sigCard
})

/** Animate a pip "pop" when wins or losses change. */
function popPip(selector: string): void {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return
  gsap.fromTo(
    selector,
    { scale: 1.5 },
    { scale: 1, duration: 0.35, ease: 'back.out(2)' }
  )
}

watch(() => run.wins, (newVal) => {
  popPip(`.pip-win.pip-on:nth-child(${newVal})`)
})
watch(() => run.losses, (newVal) => {
  popPip(`.pip-life.pip-spent:nth-child(${newVal})`)
})

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return
  gsap.fromTo(
    '.run-hud',
    { opacity: 0, y: -10 },
    { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
  )
})
</script>

<style scoped>
.run-hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background:
    linear-gradient(180deg, rgba(26, 18, 10, 0.96) 0%, rgba(26, 18, 10, 0.6) 75%, rgba(26, 18, 10, 0) 100%);
  border-bottom: 1px solid rgba(107, 74, 22, 0.55);
  pointer-events: none;
}
.run-hud > * {
  pointer-events: auto;
}

.hud-cluster {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-width: 0;
}

.pip-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.pip-label {
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}
.lives-label {
  color: #ff8c7a;
}
.pip-count {
  font-size: 0.68rem;
  color: #f3e9d2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}
.lives-count {
  color: #ff8c7a;
}
.pips {
  display: flex;
  gap: 3px;
}
.pip {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.07);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  transition: background 0.25s ease, box-shadow 0.25s ease;
  will-change: transform;
}
/* Win pip — golden gem */
.pip-win.pip-on {
  background: radial-gradient(circle at 32% 28%, #ffe9a8, #f0c850 55%, #b8841f);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.7), 0 0 7px rgba(240, 200, 80, 0.85);
  border-color: #5e420a;
}
/* Life pip — red gem (full = alive) */
.pip-life {
  background: radial-gradient(circle at 32% 28%, #ff9b8c, #e2503a 55%, #b32414);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 0 6px rgba(226, 80, 58, 0.7);
  border-color: #5e0d05;
  transition: all 0.3s ease;
}
/* Spent life pip — cracked/dark */
.pip-life.pip-spent {
  background: rgba(80, 30, 24, 0.35);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
  border-color: #3a1210;
  filter: grayscale(0.8);
}

.hud-center {
  display: flex;
  justify-content: center;
}
.round-badge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2rem 1.1rem;
  border: 2px solid #6b4a16;
  border-radius: 10px;
  background: linear-gradient(180deg, #4d3620 0%, #2a1c10 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 3px 10px rgba(0, 0, 0, 0.55),
    0 0 12px rgba(240, 200, 80, 0.15);
  overflow: hidden;
}
.round-label {
  font-size: 0.52rem;
  letter-spacing: 0.28em;
  color: #d8a830;
}
.round-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffe9a8;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 0 10px rgba(240, 200, 80, 0.35);
}
.round-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border: 1.5px solid #6b4a16;
  border-radius: 9999px;
  background: linear-gradient(180deg, #3a2a18 0%, #2a1c10 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: filter 0.12s ease;
}
.stat-chip:hover {
  filter: brightness(1.15);
}
.health-chip {
  border-color: rgba(179, 36, 20, 0.6);
}
.deck-chip {
  border-color: rgba(107, 74, 22, 0.8);
}
.chip-icon {
  font-size: 0.85rem;
  line-height: 1;
}
.health-chip .chip-icon {
  color: #ff6a5a;
  text-shadow: 0 0 6px rgba(255, 80, 60, 0.6);
}
.deck-icon {
  color: #d8a830;
}
.chip-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f3e9d2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}

.abandon-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1.5px solid #6b4a16;
  background: linear-gradient(180deg, #4d3620 0%, #2a1c10 100%);
  color: #c7a86a;
  font-size: 0.75rem;
  cursor: pointer;
  transition: filter 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.abandon-btn:hover {
  filter: brightness(1.2);
  border-color: #ff6a5a;
  box-shadow: 0 0 8px rgba(255, 80, 60, 0.4);
}
.abandon-x {
  color: inherit;
  transition: color 0.12s ease;
}
.abandon-btn:hover .abandon-x {
  color: #ff8c7a;
}

/* Phones: the pip rows can't fit beside the round badge — the numeric counts
   carry the same info, so collapse to "WINS 0/12 · LIVES 3" chips. */
@media (max-width: 640px) {
  .run-hud {
    padding: 0.4rem 0.5rem;
    gap: 0.3rem;
  }
  .hud-cluster {
    gap: 0.55rem;
  }
  .pips {
    display: none;
  }
  .round-badge {
    padding: 0.15rem 0.7rem;
  }
  .stat-chip {
    padding: 0.15rem 0.45rem;
  }
  .abandon-btn {
    width: 1.7rem;
    height: 1.7rem;
  }
}
</style>
