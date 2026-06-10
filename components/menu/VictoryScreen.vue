<template>
  <div class="victory w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-auto relative">
    <!-- Backdrop: radiant shafts of light + rising embers + festive confetti -->
    <LightRays variant="gold" />
    <EmberField variant="ember" :count="26" direction="up" :intensity="1.1" />
    <div class="confetti-layer pointer-events-none">
      <span
        v-for="c in confetti"
        :key="c.id"
        class="confetti"
        :style="c.style"
      />
    </div>
    <!-- One-shot golden shard burst behind the title -->
    <ParticleBurst :count="34" :spread="320" :repeat-every="3200" />

    <div class="relative z-10 flex flex-col items-center text-center">
      <p class="font-engrave tracking-[0.4em] text-gold-200/80 text-xs uppercase mb-2 fade-down">Champion</p>
      <AnimatedTitle text="VICTORY!" variant="radiant" enter="stamp" />
      <p class="font-body text-parchment-light/85 text-base mt-3 max-w-md fade-up">
        You conquered all <strong class="text-gold-200">12</strong> rounds and claimed the run.
        The forest sings your name, {{ heroName }}.
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
          <span class="stat-num" style="color:#8cff7a">{{ run.maxHealth }}</span>
          <span class="stat-cap font-engrave">Max HP</span>
        </div>
        <span class="summary-div" />
        <div class="summary-stat">
          <span class="stat-num text-parchment-light">{{ deckTotal }}</span>
          <span class="stat-cap font-engrave">Cards</span>
        </div>
      </div>

      <div class="mt-9 flex flex-col sm:flex-row items-center gap-3 fade-up">
        <button class="play-again font-engrave" @click="playAgain">
          <span class="relative z-10">Play Again</span>
        </button>
        <BaseButton variant="wood" size="md" @click="toMenu">Main Menu</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** Celebratory victory screen shown when the player reaches 12 wins. */
const router = useRouter()
const run = useRunStore()
const game = useGameStore()

const heroName = computed(() => run.heroDef?.name ?? 'Warden')
const deckTotal = computed(() => run.deckCount + (run.signatureTreasureId ? 1 : 0))

interface Confetto {
  id: number
  style: Record<string, string>
}
const COLORS = ['#f0c850', '#ffe9a8', '#b14ee0', '#3d7ff0', '#e2503a', '#8cff7a']
const confetti = computed<Confetto[]>(() =>
  Array.from({ length: 40 }, (_, id) => ({
    id,
    style: {
      left: `${Math.random() * 100}%`,
      background: COLORS[id % COLORS.length],
      animationDelay: `${Math.random() * 2.5}s`,
      animationDuration: `${2.5 + Math.random() * 2.5}s`,
      width: `${5 + Math.random() * 6}px`,
      height: `${8 + Math.random() * 8}px`,
      transform: `rotate(${Math.random() * 360}deg)`,
    },
  }))
)

/** Start a fresh run and return to the draft. */
function playAgain(): void {
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
.victory {
  background: radial-gradient(120% 90% at 50% 38%, rgba(240, 200, 80, 0.12) 0%, rgba(0, 0, 0, 0) 60%);
}

.fade-down {
  animation: fadeDown 0.7s ease 0.2s both;
}
.fade-up {
  animation: fadeUp 0.8s ease 0.4s both;
}

.summary {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.75rem;
  animation: fadeUp 0.8s ease 0.5s both;
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
  color: rgba(243, 233, 210, 0.6);
  margin-top: 0.25rem;
}
.summary-div {
  width: 1px;
  height: 2rem;
  background: rgba(107, 74, 22, 0.6);
}

.play-again {
  position: relative;
  padding: 0.8rem 2.2rem;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #2a1607;
  border: 3px solid #6b4a16;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffe9a8 0%, #f0c850 30%, #d8a830 62%, #b8841f 100%);
  box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.8), 0 6px 18px rgba(0, 0, 0, 0.5), 0 0 22px 4px rgba(240, 200, 80, 0.5);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.14s ease, filter 0.14s ease;
  animation: victoryPulse 2.4s ease-in-out infinite, fadeUp 0.8s ease 0.6s both;
}
.play-again:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.06);
  box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.85), 0 10px 26px rgba(0, 0, 0, 0.55), 0 0 36px 10px rgba(240, 200, 80, 0.7);
}
.play-again:active {
  transform: translateY(1px);
}
@keyframes victoryPulse {
  0%, 100% { box-shadow: inset 0 2px 2px rgba(255,255,255,0.8), 0 6px 18px rgba(0,0,0,0.5), 0 0 18px 3px rgba(240,200,80,0.45); }
  50% { box-shadow: inset 0 2px 2px rgba(255,255,255,0.8), 0 6px 18px rgba(0,0,0,0.5), 0 0 32px 9px rgba(240,200,80,0.7); }
}

.confetti-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.confetti {
  position: absolute;
  top: -5%;
  border-radius: 2px;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(540deg); opacity: 0.4; }
}
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .confetti {
    animation: none;
    opacity: 0;
  }
  .play-again {
    animation: fadeUp 0.8s ease 0.6s both;
  }
}
</style>
