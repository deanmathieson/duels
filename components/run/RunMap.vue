<template>
  <div class="run-map w-full h-full flex flex-col items-center justify-center px-6 py-8 overflow-auto">
    <header class="header-block text-center mb-8 shrink-0">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">The Road Ahead</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Run Progress</h1>
      <div class="header-underline" />
      <!-- Win/loss summary strip -->
      <div class="progress-strip">
        <span class="strip-badge wins-badge font-engrave">
          <span class="strip-icon">★</span> {{ run.wins }}/{{ totalWins }} Wins
        </span>
        <span class="strip-sep">·</span>
        <span class="strip-badge lives-badge font-engrave">
          <span class="strip-icon-life">♥</span> {{ maxLosses - run.losses }}/{{ maxLosses }} Lives
        </span>
      </div>
    </header>

    <!-- Progress track -->
    <div class="track track-block">
      <!-- Background rail -->
      <div class="track-rail">
        <div class="track-fill" :style="{ width: `${fillPct}%` }" />
      </div>
      <!-- Node row -->
      <div class="nodes">
        <div
          v-for="n in totalWins"
          :key="n"
          class="node"
          :class="{
            done: n <= run.wins,
            current: n === run.wins + 1,
            boss: n === totalWins,
            'upcoming-boss': n === totalWins && n > run.wins + 1,
          }"
          :title="n === totalWins ? 'Final Boss' : `Round ${n}`"
        >
          <!-- Connector glow for done nodes -->
          <div v-if="n <= run.wins" class="node-trail" />

          <div class="node-dot-wrap">
            <span class="node-dot" />
            <!-- "Current" beacon ring -->
            <span v-if="n === run.wins + 1" class="node-beacon" />
          </div>
          <span v-if="n === totalWins" class="node-crown">♛</span>
          <!-- Round number label below -->
          <span class="node-label font-engrave">{{ n }}</span>
        </div>
      </div>
    </div>

    <!-- Next opponent preview card -->
    <div v-if="enemy" class="opponent-card panel-wood opp-block mt-10">
      <!-- Threat level indicator -->
      <div class="threat-bar">
        <span class="threat-label font-engrave">
          {{ enemy.isBoss ? 'FINAL BOSS' : `TIER ${enemy.tier} THREAT` }}
        </span>
      </div>

      <div class="opp-body">
        <div class="opp-portrait" :class="{ 'portrait-boss': enemy.isBoss }">
          <img v-if="enemy.portraitArt" :src="enemy.portraitArt" :alt="enemy.heroName" class="opp-img" draggable="false" />
          <div v-else class="opp-fallback">
            <span class="opp-initial font-engrave">{{ enemy.heroName.charAt(0) }}</span>
          </div>
          <div class="opp-portrait-glaze" />
          <span v-if="enemy.isBoss" class="boss-flag font-engrave">BOSS</span>
        </div>

        <div class="opp-info">
          <p class="opp-label font-engrave">Next Opponent</p>
          <h2 class="opp-name font-engrave">{{ enemy.name }}</h2>
          <p class="opp-sub font-body">{{ enemy.heroName }} · <span class="opp-class">{{ enemy.heroClass }}</span></p>
          <div class="opp-meta">
            <span class="opp-chip font-engrave">Tier {{ enemy.tier }}</span>
            <span class="opp-chip font-engrave" :class="`profile-${enemy.aiProfile}`">{{ profileLabel }}</span>
            <span class="opp-chip font-engrave health-chip">
              <span class="chip-heart">♥</span> {{ enemy.startingHealth ?? 30 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No enemy fallback (shouldn't appear in normal flow) -->
    <div v-else class="no-enemy font-body">
      No opponent assigned for this round.
    </div>

    <div class="mt-8 shrink-0 begin-btn">
      <BaseButton variant="gold" size="lg" @click="begin">Begin Combat</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RUN_TARGET_WINS, RUN_MAX_LOSSES } from '~/game/types'
import { gsap } from 'gsap'

/** Stylized 12-round progress track with the next-opponent preview. */
const run = useRunStore()

const totalWins = RUN_TARGET_WINS
const maxLosses = RUN_MAX_LOSSES
const enemy = computed(() => run.currentEnemyDef)

const fillPct = computed(() => (run.wins / (totalWins - 1)) * 100)

const PROFILE_LABEL: Record<string, string> = {
  aggro: 'Aggressive',
  midrange: 'Midrange',
  control: 'Control',
  tempo: 'Tempo',
}
const profileLabel = computed(() => PROFILE_LABEL[enemy.value?.aiProfile ?? ''] ?? 'Unknown')

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  gsap.fromTo(
    '.header-block',
    { opacity: 0, y: -18 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )
  gsap.fromTo(
    '.track-block',
    { opacity: 0, scaleX: 0.88 },
    { opacity: 1, scaleX: 1, duration: 0.55, ease: 'back.out(1.2)', delay: 0.12 }
  )
  gsap.fromTo(
    '.opp-block',
    { opacity: 0, y: 28, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.3)', delay: 0.25 }
  )
  gsap.fromTo(
    '.begin-btn',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.45 }
  )
})

/** Start (or restart) the combat for the current round. */
function begin(): void {
  run.startNextCombat()
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

.progress-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
.strip-badge {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.strip-icon { color: #f0c850; }
.strip-icon-life { color: #ff6a5a; }
.wins-badge { color: #ffe9a8; }
.lives-badge { color: #ff9b8c; }
.strip-sep { color: rgba(243, 233, 210, 0.35); }

/* Progress track */
.track {
  position: relative;
  width: 100%;
  max-width: 720px;
  padding: 1.6rem 0.5rem;
}
.track-rail {
  position: absolute;
  left: 1.2rem;
  right: 1.2rem;
  top: 50%;
  height: 7px;
  transform: translateY(-50%);
  border-radius: 9999px;
  background: rgba(20, 14, 8, 0.75);
  border: 1px solid rgba(107, 74, 22, 0.5);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
}
.track-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #8a5e16, #d8a830 50%, #f0c850);
  box-shadow: 0 0 12px rgba(240, 200, 80, 0.65);
  transition: width 0.6s cubic-bezier(0.2, 0.9, 0.3, 1);
}

.nodes {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.node-dot-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.node-dot {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(60, 44, 26, 0.9);
  border: 2px solid #6b4a16;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}
.node.done .node-dot {
  background: radial-gradient(circle at 32% 28%, #ffe9a8, #f0c850 55%, #b8841f);
  box-shadow: 0 0 9px rgba(240, 200, 80, 0.85);
  border-color: #5e420a;
  width: 15px;
  height: 15px;
}
.node.current .node-dot {
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at 32% 28%, #fff 0%, #f0c850 45%, #d8a830 100%);
  box-shadow: 0 0 16px 4px rgba(240, 200, 80, 0.95);
  border-color: #8a5e16;
}
.node.boss .node-dot {
  width: 22px;
  height: 22px;
  background: radial-gradient(circle at 32% 28%, #ff9b8c, #e2503a 55%, #b32414);
  box-shadow: 0 0 14px 3px rgba(226, 80, 58, 0.8);
  border-color: #5e0d05;
}
/* Pulsing beacon ring on the current node */
.node-beacon {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2px solid rgba(240, 200, 80, 0.7);
  animation: beacon-ring 1.6s ease-out infinite;
  pointer-events: none;
}
/* Trail glow between done nodes */
.node-trail {
  position: absolute;
  /* covered by the track fill — decorative only */
  pointer-events: none;
}
.node-crown {
  position: absolute;
  top: -1.6rem;
  font-size: 1rem;
  color: #f0c850;
  text-shadow: 0 0 10px rgba(240, 200, 80, 0.9);
  animation: crown-bob 3s ease-in-out infinite;
}
.node-label {
  font-size: 0.5rem;
  color: rgba(199, 168, 106, 0.55);
  margin-top: 0.1rem;
}
.node.current .node-label {
  color: #f0c850;
  text-shadow: 0 0 6px rgba(240, 200, 80, 0.7);
}
.node.done .node-label {
  color: rgba(240, 200, 80, 0.5);
}

/* Opponent preview card */
.opponent-card {
  width: 100%;
  max-width: 500px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid #6b4a16;
  opacity: 0;
}
.threat-bar {
  padding: 0.3rem 1rem;
  background: linear-gradient(90deg, rgba(107, 74, 22, 0.6), rgba(107, 74, 22, 0.3), rgba(107, 74, 22, 0));
  border-bottom: 1px solid rgba(107, 74, 22, 0.4);
}
.threat-label {
  font-size: 0.55rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #d8a830;
}
.opp-body {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
}
.opp-portrait {
  position: relative;
  width: 92px;
  height: 92px;
  flex: none;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #4a3209;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.7);
  transition: box-shadow 0.2s ease;
}
.portrait-boss {
  border-color: #5e0d05;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.7), 0 0 16px rgba(226, 80, 58, 0.5);
}
.opp-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.opp-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 120% at 35% 25%, #7c5c39, #2a1c10);
}
.opp-initial {
  font-size: 2.4rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.8);
}
.opp-portrait-glaze {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
}
.boss-flag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.5rem;
  letter-spacing: 0.22em;
  padding: 2px 0;
  color: #fff;
  background: rgba(179, 36, 20, 0.9);
}

.opp-info {
  min-width: 0;
  flex: 1;
}
.opp-label {
  font-size: 0.52rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #d8a830;
  margin-bottom: 0.1rem;
}
.opp-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.opp-sub {
  font-size: 0.75rem;
  color: rgba(243, 233, 210, 0.65);
  text-transform: capitalize;
}
.opp-class {
  color: #cfe8a0;
}
.opp-meta {
  margin-top: 0.55rem;
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.opp-chip {
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid #6b4a16;
  background: rgba(42, 28, 16, 0.8);
  color: #c7a86a;
}
.health-chip {
  border-color: rgba(179, 36, 20, 0.5);
  color: #ff9b8c;
}
.chip-heart {
  color: #ff6a5a;
}
/* Profile color tints */
.profile-aggro { color: #ff9b8c; border-color: rgba(179, 36, 20, 0.4); }
.profile-control { color: #aacbff; border-color: rgba(61, 127, 240, 0.4); }
.profile-tempo { color: #cfe8a0; border-color: rgba(107, 160, 50, 0.4); }

.no-enemy {
  font-size: 0.85rem;
  color: rgba(243, 233, 210, 0.5);
  margin-top: 2rem;
}

.begin-btn {
  opacity: 0;
}

@keyframes beacon-ring {
  0% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 0; transform: scale(2); }
}
@keyframes crown-bob {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-4px) rotate(3deg); }
}
</style>
