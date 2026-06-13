<template>
  <div class="run-root relative w-full h-full overflow-hidden">
    <!-- Persistent HUD (hidden on end screens for a clean curtain) -->
    <RunHud v-if="showHud" @abandon="confirmAbandon" />

    <!-- Stage view. NOTE: no `mode="out-in"` — out-in holds the outgoing stage
         until its leave transition's `transitionend` fires, and if that event
         is missed (a backgrounded tab, an interrupted transition) the swap
         hangs forever: the old stage gone, the next never mounted, which read
         as the draft "dying" after a pick. A simultaneous crossfade always
         mounts the incoming stage. The stages are absolutely positioned while
         transitioning so the brief overlap doesn't shift layout. -->
    <div class="stage-area" :class="{ 'with-hud': showHud }">
      <Transition name="stage-fade">
        <component :is="stageComponent" :key="run.stage" />
      </Transition>
    </div>

    <!-- Combat-end flourish overlay -->
    <Transition name="flourish-fade">
      <div v-if="flourish" class="flourish-overlay" :class="`flourish-${flourish}`">
        <div class="flourish-burst" />
        <h2 class="flourish-text font-engrave">
          {{ flourish === 'victory' ? 'VICTORY' : 'DEFEAT' }}
        </h2>
      </div>
    </Transition>

    <!-- Abandon confirm -->
    <Transition name="flourish-fade">
      <div v-if="askAbandon" class="modal-scrim" @click.self="askAbandon = false">
        <Panel variant="wood" title="Abandon Run?" class="max-w-sm w-full mx-4">
          <p class="font-body text-sm text-parchment-light/90 mb-4">
            Your progress will be lost. Are you sure you want to return to the menu?
          </p>
          <div class="flex gap-3 justify-end">
            <BaseButton variant="wood" size="sm" @click="askAbandon = false">Cancel</BaseButton>
            <BaseButton variant="gold" size="sm" @click="doAbandon">Abandon</BaseButton>
          </div>
        </Panel>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
// Explicit imports: a dynamic `<component :is="'Name'">` with a string name is NOT
// seen by Nuxt's static component auto-import scan, so the stage components must be
// imported here and mapped to their actual component objects.
import HeroSelect from '~/components/run/HeroSelect.vue'
import HeroPowerSelect from '~/components/run/HeroPowerSelect.vue'
import SignatureSelect from '~/components/run/SignatureSelect.vue'
import DeckBuilder from '~/components/run/DeckBuilder.vue'
import RunMap from '~/components/run/RunMap.vue'
import RewardBuckets from '~/components/run/RewardBuckets.vue'
import TreasureSelect from '~/components/run/TreasureSelect.vue'
import GameBoard from '~/components/board/GameBoard.vue'
import VictoryScreen from '~/components/menu/VictoryScreen.vue'
import DefeatScreen from '~/components/menu/DefeatScreen.vue'

/**
 * Run controller page. Renders the stage component for the current run stage,
 * keeps the RunHud overlaid, and — crucially — watches the game store for the
 * match to end, then resolves the combat after a short flourish.
 */
const router = useRouter()
const run = useRunStore()
const game = useGameStore()

const askAbandon = ref(false)
/** Active end-of-combat flourish: 'victory' | 'defeat' | null. */
const flourish = ref<null | 'victory' | 'defeat'>(null)
/** Guards against resolving the same gameOver twice. */
const resolving = ref(false)

/** Map each run stage to its view component. */
const STAGE_COMPONENTS: Record<string, unknown> = {
  heroSelect: HeroSelect,
  heroPowerSelect: HeroPowerSelect,
  signatureSelect: SignatureSelect,
  deckBuild: DeckBuilder,
  map: RunMap,
  combat: GameBoard,
  reward: RewardBuckets,
  treasure: TreasureSelect,
  victory: VictoryScreen,
  defeat: DefeatScreen,
}

const stageComponent = computed(() => STAGE_COMPONENTS[run.stage] ?? HeroSelect)

/** Hide the HUD on the menu-like end screens. */
const showHud = computed(() => run.stage !== 'victory' && run.stage !== 'defeat')

// Restore a saved run (e.g. hard refresh) SYNCHRONOUSLY in setup, before the
// first render — mutating the stage inside onMounted instead would fight the
// <Transition mode="out-in"> and leave the stale initial view mounted.
const hasRun = run.active || run.loadFromStorage()

// Only the run is persisted, not the live match. If we restored straight into a
// fight, the in-memory match is gone — restart the current combat so the board
// isn't left empty.
if (hasRun && run.stage === 'combat' && !game.match) {
  run.startNextCombat()
}

onMounted(() => {
  // Nothing to restore and no active run: bounce to the menu.
  if (!hasRun) router.replace('/')
})

/**
 * Watch the match phase. When the game reaches 'gameOver' during the combat
 * stage, show a victory/defeat flourish then hand the result to the run store.
 */
watch(
  () => game.phase,
  (phase) => {
    if (run.stage !== 'combat') return
    if (phase !== 'gameOver') return
    if (resolving.value) return

    resolving.value = true
    const didWin = game.winner === 0
    flourish.value = didWin ? 'victory' : 'defeat'

    window.setTimeout(() => {
      flourish.value = null
      run.resolveCombat(didWin)
      resolving.value = false
    }, 1900)
  }
)

/** Open the abandon confirmation modal. */
function confirmAbandon(): void {
  askAbandon.value = true
}

/** Abandon the run, reset the match, and return to the menu. */
function doAbandon(): void {
  askAbandon.value = false
  game.reset()
  run.abandon()
  router.replace('/')
}
</script>

<style scoped>
.stage-area {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}
.stage-area.with-hud {
  padding-top: 3.25rem;
}

.stage-fade-enter-active,
.stage-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
/* During a simultaneous crossfade both stages exist briefly; take the leaving
   one out of flow so the incoming stage holds the layout (no jump/shift). */
.stage-fade-leave-active {
  position: absolute;
  inset: 0;
  /* It's on its way out — don't let it intercept clicks meant for the incoming stage. */
  pointer-events: none;
}
.stage-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.stage-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.flourish-overlay {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.flourish-victory {
  background: radial-gradient(circle at 50% 50%, rgba(240, 200, 80, 0.28), rgba(0, 0, 0, 0.55) 70%);
}
.flourish-defeat {
  background: radial-gradient(circle at 50% 50%, rgba(120, 20, 16, 0.4), rgba(0, 0, 0, 0.7) 70%);
}
.flourish-burst {
  position: absolute;
  width: 60vmin;
  height: 60vmin;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 233, 168, 0.5), rgba(240, 200, 80, 0) 65%);
  animation: burst 1.9s ease-out both;
}
.flourish-defeat .flourish-burst {
  background: radial-gradient(circle, rgba(180, 40, 30, 0.45), rgba(120, 20, 16, 0) 65%);
}
.flourish-text {
  position: relative;
  font-size: clamp(3rem, 12vw, 8rem);
  font-weight: 800;
  letter-spacing: 0.12em;
  animation: stamp 0.6s cubic-bezier(0.2, 1.4, 0.4, 1) both;
}
.flourish-victory .flourish-text {
  background: linear-gradient(180deg, #fff3cf, #f0c850 50%, #8a5e16);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 2px #4a3209;
  filter: drop-shadow(0 0 24px rgba(240, 200, 80, 0.6));
}
.flourish-defeat .flourish-text {
  color: #e2503a;
  text-shadow: 0 0 24px rgba(180, 40, 30, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9);
}

@keyframes burst {
  0% { transform: scale(0.2); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes stamp {
  0% { transform: scale(2.2); opacity: 0; }
  60% { transform: scale(0.94); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-scrim {
  position: absolute;
  inset: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.flourish-fade-enter-active,
.flourish-fade-leave-active {
  transition: opacity 0.4s ease;
}
.flourish-fade-enter-from,
.flourish-fade-leave-to {
  opacity: 0;
}
</style>
