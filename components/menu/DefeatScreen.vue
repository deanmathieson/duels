<template>
  <div class="defeat w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-auto relative">
    <!-- Smouldering embers drifting up through falling ash -->
    <EmberField variant="ash" :count="26" direction="up" :intensity="0.9" />
    <EmberField variant="ash" :count="14" direction="down" :intensity="0.6" />
    <div class="defeat-vignette pointer-events-none" />

    <div class="relative z-10 flex flex-col items-center text-center">
      <p class="font-engrave tracking-[0.4em] text-parchment-light/40 text-xs uppercase mb-2 fade-down">
        The Run Ends
      </p>
      <AnimatedTitle text="DEFEAT" variant="crimson" enter="sink" />
      <p class="font-body text-parchment-light/70 text-base mt-3 max-w-md fade-up">
        Three losses have felled you, {{ heroName }}. The forest will remember — and so will you.
        Rise again, wiser than before.
      </p>

      <!-- Summary -->
      <div class="summary panel-wood mt-8">
        <div class="summary-stat">
          <span class="stat-num text-gold-200">{{ run.wins }}</span>
          <span class="stat-cap font-engrave">Wins</span>
        </div>
        <span class="summary-div" />
        <div class="summary-stat">
          <span class="stat-num" style="color:#ff8c7a">{{ run.losses }}</span>
          <span class="stat-cap font-engrave">Losses</span>
        </div>
        <span class="summary-div" />
        <div class="summary-stat">
          <span class="stat-num text-parchment-light">{{ run.round }}</span>
          <span class="stat-cap font-engrave">Reached</span>
        </div>
        <span class="summary-div" />
        <div class="summary-stat">
          <span class="stat-num text-parchment-light">{{ deckTotal }}</span>
          <span class="stat-cap font-engrave">Cards</span>
        </div>
      </div>

      <div class="mt-9 flex flex-col sm:flex-row items-center gap-3 fade-up">
        <BaseButton variant="gold" size="lg" @click="tryAgain">Try Again</BaseButton>
        <BaseButton variant="wood" size="md" @click="onShare">{{ shared ? 'Copied!' : 'Share Result' }}</BaseButton>
        <BaseButton variant="wood" size="md" @click="toMenu">Main Menu</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CLASS_LABEL } from '~/data/terms'
import { RUN_TARGET_WINS, RUN_MAX_LOSSES } from '~/game/types'
import { dailyDateKey, shareText } from '~/game/run/meta'

/** Somber defeat screen shown after the player suffers 3 losses. */
const router = useRouter()
const run = useRunStore()
const game = useGameStore()

const heroName = computed(() => run.heroDef?.name ?? 'Warden')
const deckTotal = computed(() => run.deckCount + (run.signatureTreasureId ? 1 : 0))

const shared = ref(false)

/** Copy a Wordle-style run summary to the clipboard. */
async function onShare(): Promise<void> {
  const text = shareText({
    result: 'defeat',
    wins: run.wins,
    losses: run.losses,
    callingName: run.heroDef ? CLASS_LABEL[run.heroDef.cardClass] : 'Champion',
    targetWins: RUN_TARGET_WINS,
    maxLosses: RUN_MAX_LOSSES,
    dateKey: run.mode === 'daily' ? dailyDateKey(new Date()) : undefined,
  })
  try {
    await navigator.clipboard.writeText(text)
    shared.value = true
    setTimeout(() => (shared.value = false), 1800)
  } catch {
    window.prompt('Copy your result:', text)
  }
}

/** Start a fresh run and head back to the draft. */
function tryAgain(): void {
  game.reset()
  run.startNewRun()
  router.replace('/run')
}

/** Wipe the finished run and return to the main menu. */
function toMenu(): void {
  game.reset()
  run.abandon()
  router.replace('/')
}
</script>

<style scoped>
.defeat {
  background: radial-gradient(120% 90% at 50% 40%, rgba(60, 20, 16, 0.25) 0%, rgba(0, 0, 0, 0) 60%);
}
.defeat-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 100% at 50% 45%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.7) 100%);
}

.fade-down {
  animation: fadeDown 0.8s ease 0.2s both;
}
.fade-up {
  animation: fadeUp 0.9s ease 0.5s both;
}

.summary {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.75rem;
  animation: fadeUp 0.9s ease 0.6s both;
}
.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 1.8rem;
  font-weight: 800;
  font-family: 'Cinzel', Georgia, serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  line-height: 1;
}
.stat-cap {
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(243, 233, 210, 0.55);
  margin-top: 0.25rem;
}
.summary-div {
  width: 1px;
  height: 2rem;
  background: rgba(107, 74, 22, 0.5);
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
