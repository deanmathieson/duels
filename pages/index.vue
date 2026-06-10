<template>
  <div class="menu-root relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
    <!-- Layered backdrop: faint god-rays, warm hearth glow, drifting dust -->
    <LightRays variant="pale" />
    <div class="pointer-events-none absolute inset-0 menu-hearth" />
    <EmberField variant="dust" :count="22" direction="up" />
    <EmberField variant="ember" :count="8" direction="up" :intensity="0.7" />

    <!-- Vignette -->
    <div class="pointer-events-none absolute inset-0 menu-vignette" />

    <!-- Title block -->
    <div class="relative z-10 flex flex-col items-center px-6 text-center">
      <p class="font-engrave tracking-[0.5em] text-gold-200/70 text-xs sm:text-sm mb-2 uppercase title-sub">
        A Hearthstone Roguelike
      </p>

      <div class="title-wrap">
        <span class="title-halo" aria-hidden="true" />
        <AnimatedTitle text="DUELS" variant="gold" enter="rise" class="title-main" />
      </div>

      <p class="font-body text-parchment-light/80 text-sm sm:text-base mt-4 max-w-md tagline">
        Draft a hero, forge a deck, and climb to <span class="text-gold-200 font-semibold">12 wins</span> —
        but three defeats end your run.
      </p>

      <!-- Primary actions -->
      <div class="mt-10 flex flex-col items-center gap-4 w-full max-w-xs">
        <button class="play-btn font-engrave" @click="onPlay">
          <span class="play-btn-shine" />
          <span class="relative z-10">PLAY</span>
        </button>

        <BaseButton
          v-if="hasSavedRun"
          variant="wood"
          size="md"
          full-width
          @click="onContinue"
        >
          Continue Run
        </BaseButton>

        <BaseButton variant="wood" size="sm" full-width @click="showHelp = !showHelp">
          {{ showHelp ? 'Hide' : 'How to Play' }}
        </BaseButton>
      </div>
    </div>

    <!-- How to Play -->
    <Transition name="help-slide">
      <div v-if="showHelp" class="relative z-10 mt-8 w-full max-w-xl px-6">
        <Panel variant="parchment" title="How to Play">
          <ol class="space-y-2 text-sm font-body" style="color:#3a2410">
            <li v-for="(step, i) in howTo" :key="i" class="flex gap-3 items-start">
              <span class="step-num font-engrave">{{ i + 1 }}</span>
              <span v-html="step" />
            </li>
          </ol>
        </Panel>
      </div>
    </Transition>

    <!-- Settings shelf -->
    <div class="relative z-10 mt-8 flex items-center gap-3">
      <Tooltip :text="settings.soundOn ? 'Sound on' : 'Sound off'">
        <button class="icon-pill" @click="settings.toggleSound()">
          {{ settings.soundOn ? '🔊' : '🔇' }}
        </button>
      </Tooltip>
      <Tooltip :text="`Volume: ${volumePct}%`">
        <button
          class="icon-pill font-engrave text-xs tracking-wider"
          :disabled="!settings.soundOn"
          :style="{ opacity: settings.soundOn ? 1 : 0.4 }"
          @click="settings.cycleVolume()"
        >
          {{ volumePct }}%
        </button>
      </Tooltip>
      <Tooltip :text="`Animation: ${settings.animationSpeed}`">
        <button class="icon-pill font-engrave text-xs uppercase tracking-wider" @click="settings.cycleSpeed()">
          {{ settings.animationSpeed }}
        </button>
      </Tooltip>
    </div>

    <!-- Footer -->
    <footer class="absolute bottom-3 left-0 right-0 text-center z-10">
      <p class="font-body text-[10px] text-parchment-light/40 px-4">
        A fan project for learning &amp; love of the game. Not affiliated with or endorsed by Blizzard Entertainment.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAudio } from '~/composables/useAudio'

/** Main menu: title, glowing PLAY, how-to-play, settings shelf, footer. */
const router = useRouter()
const runStore = useRunStore()
const settings = useSettingsStore()
const audio = useAudio()

const showHelp = ref(false)
const hasSavedRun = ref(false)

/** Volume as a whole-number percentage for the settings pill. */
const volumePct = computed(() => Math.round(settings.volume * 100))

const howTo = [
  '<strong>Draft your champion.</strong> Pick a hero, a hero power, and a powerful signature treasure.',
  '<strong>Build a 15-card deck</strong> from the Druid &amp; neutral card pool.',
  '<strong>Fight the ladder.</strong> Each foe is tougher than the last — play minions, cast spells, and attack to drop your opponent to 0.',
  '<strong>Grow between fights.</strong> Win to earn <span class="text-engrave">card buckets</span> and <span class="text-engrave">treasures</span>; your hero gains +5 max health each round.',
  '<strong>Reach 12 wins to claim victory.</strong> Three losses, and the run is over.',
]

onMounted(() => {
  hasSavedRun.value = runStore.loadFromStorage()
  // Request the calm menu theme; it begins on the first user interaction.
  audio.playMusic('menu')
})

/** Start a brand-new run and head to the run controller. */
function onPlay(): void {
  runStore.startNewRun()
  router.push('/run')
}

/** Resume the saved run already loaded into the store. */
function onContinue(): void {
  router.push('/run')
}
</script>

<style scoped>
.menu-root {
  background:
    radial-gradient(120% 90% at 50% 22%, rgba(240, 200, 80, 0.12) 0%, rgba(0, 0, 0, 0) 55%);
}

/* Warm hearth glow pooling from below — adds depth under the wood-table backdrop. */
.menu-hearth {
  background:
    radial-gradient(80% 55% at 50% 116%, rgba(240, 150, 60, 0.28) 0%, rgba(180, 90, 30, 0) 60%),
    radial-gradient(120% 80% at 50% -10%, rgba(120, 86, 44, 0.35) 0%, rgba(0, 0, 0, 0) 55%);
}

.menu-vignette {
  background: radial-gradient(120% 100% at 50% 40%, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.6) 100%);
}

.title-sub {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
  animation: fadeDown 0.8s ease both;
}

/* Title + radial halo sitting behind the engraved word. */
.title-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title-halo {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 130%;
  aspect-ratio: 2 / 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, rgba(255, 220, 130, 0.28), rgba(255, 220, 130, 0) 72%);
  filter: blur(6px);
  pointer-events: none;
  animation: haloBreathe 5s ease-in-out infinite;
}
.title-wrap :deep(.title-main) {
  font-size: clamp(4.5rem, 16vw, 11rem);
}

.tagline {
  animation: fadeUp 1s ease 0.25s both;
}

/* Glowing play button */
.play-btn {
  position: relative;
  width: 100%;
  padding: 0.95rem 2rem;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #2a1607;
  text-shadow: 0 1px 0 rgba(255, 245, 210, 0.7);
  border: 3px solid #6b4a16;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffe9a8 0%, #f0c850 30%, #d8a830 62%, #b8841f 100%);
  box-shadow:
    inset 0 2px 2px rgba(255, 255, 255, 0.8),
    inset 0 -3px 6px rgba(0, 0, 0, 0.35),
    0 6px 18px rgba(0, 0, 0, 0.5),
    0 0 22px 4px rgba(240, 200, 80, 0.5);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
  animation: playPulse 2.4s ease-in-out infinite, fadeUp 1s ease 0.4s both;
}
.play-btn:hover {
  transform: translateY(-2px) scale(1.02);
  filter: brightness(1.06);
  box-shadow:
    inset 0 2px 2px rgba(255, 255, 255, 0.85),
    inset 0 -3px 6px rgba(0, 0, 0, 0.35),
    0 10px 26px rgba(0, 0, 0, 0.55),
    0 0 36px 10px rgba(240, 200, 80, 0.7);
}
.play-btn:active {
  transform: translateY(1px) scale(0.99);
}
.play-btn-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.55) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: shine 3.4s ease-in-out infinite;
}

.icon-pill {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 2px solid #6b4a16;
  background: linear-gradient(180deg, #4d3620 0%, #2a1c10 100%);
  color: #f3e9d2;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}
.icon-pill:hover {
  filter: brightness(1.2);
  transform: translateY(-1px);
}

.step-num {
  flex: none;
  width: 1.4rem;
  height: 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  background: radial-gradient(circle at 32% 26%, #f0c850, #b8841f 70%, #6b4a16);
  border: 1px solid #5e420a;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5);
}

@keyframes haloBreathe {
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.06); }
}
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes playPulse {
  0%, 100% { box-shadow: inset 0 2px 2px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.5), 0 0 18px 3px rgba(240,200,80,0.45); }
  50% { box-shadow: inset 0 2px 2px rgba(255,255,255,0.8), inset 0 -3px 6px rgba(0,0,0,0.35), 0 6px 18px rgba(0,0,0,0.5), 0 0 30px 8px rgba(240,200,80,0.7); }
}
@keyframes shine {
  0%, 60% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}

.help-slide-enter-active,
.help-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.help-slide-enter-from,
.help-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (prefers-reduced-motion: reduce) {
  .title-halo,
  .play-btn {
    animation: none !important;
  }
  .play-btn-shine {
    display: none;
  }
}
</style>
