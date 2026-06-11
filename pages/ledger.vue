<template>
  <div class="ledger-root w-full h-full flex flex-col items-center overflow-auto px-4 sm:px-8 py-6">
    <header class="text-center mb-6 shrink-0 relative z-10">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">The County Remembers</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">The Ledger</h1>
      <div class="header-underline" />
    </header>

    <div class="w-full max-w-4xl relative z-10 pb-10 flex flex-col gap-6">
      <!-- Lifetime totals -->
      <section class="totals-row">
        <div class="total-tile">
          <span class="total-num font-engrave">{{ meta.runsCompleted }}</span>
          <span class="total-label font-engrave">Runs</span>
        </div>
        <div class="total-tile">
          <span class="total-num font-engrave gold">{{ meta.victories }}</span>
          <span class="total-label font-engrave">Victories</span>
        </div>
        <div class="total-tile">
          <span class="total-num font-engrave">{{ meta.bestWins }}/12</span>
          <span class="total-label font-engrave">Best Climb</span>
        </div>
        <div class="total-tile">
          <span class="total-num font-engrave mythic">{{ meta.mythicsSeen.length }}/{{ mythicTotal }}</span>
          <span class="total-label font-engrave">Mythics Found</span>
        </div>
        <div class="total-tile">
          <span class="total-num font-engrave">{{ meta.daily.streak }}</span>
          <span class="total-label font-engrave">Daily Streak</span>
        </div>
      </section>

      <!-- Unlock progress -->
      <section v-if="upcoming" class="unlock-banner font-engrave">
        Next calling: <strong>{{ nameFor(upcoming.heroId) }}</strong> — complete
        {{ upcoming.runsNeeded === 1 ? '1 more run' : `${upcoming.runsNeeded} more runs` }}
      </section>

      <!-- Per-calling table -->
      <section>
        <h2 class="section-title font-engrave">By Calling</h2>
        <div class="calling-grid">
          <div v-for="c in callingRows" :key="c.heroId" class="calling-tile" :class="{ locked: c.locked }">
            <img v-if="c.art" :src="c.art" :alt="c.name" class="calling-art" loading="lazy" />
            <div v-else class="calling-art calling-art-fallback font-engrave">{{ c.name.charAt(0) }}</div>
            <div class="calling-body">
              <span class="calling-name font-engrave">{{ c.name }}</span>
              <span v-if="c.locked" class="calling-stats font-body">🔒 {{ c.lockHint }}</span>
              <span v-else class="calling-stats font-body">
                {{ c.stats.runs }} runs · {{ c.stats.victories }} victories · best {{ c.stats.bestWins }}/12
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Run history -->
      <section>
        <h2 class="section-title font-engrave">Recent Runs</h2>
        <p v-if="meta.history.length === 0" class="font-body text-parchment-light/60 text-sm">
          No runs recorded yet. The moor is patient.
        </p>
        <div v-else class="history-list">
          <div v-for="(r, i) in meta.history" :key="i" class="history-row" :class="r.result">
            <span class="hist-result font-engrave">{{ r.result === 'victory' ? '🏆' : '☠' }}</span>
            <span class="hist-calling font-engrave">{{ nameFor(r.heroId) }}</span>
            <span class="hist-score font-body">{{ r.wins }} wins · {{ r.losses }} losses</span>
            <span v-if="r.daily" class="hist-daily font-engrave">DAILY</span>
            <span class="hist-date font-body">{{ r.date }}</span>
          </div>
        </div>
      </section>
    </div>

    <div class="relative z-10 shrink-0 pb-6">
      <BaseButton variant="wood" size="md" @click="router.push('/')">Back to the Hearth</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { allTreasures, getHeroDef } from '~/data/registry'
import { CLASS_LABEL } from '~/data/terms'
import { ALL_CALLINGS } from '~/game/run/meta'

/** The Ledger — lifetime stats, calling unlock progress and run history. */
const router = useRouter()
const meta = useMetaStore()

onMounted(() => meta.load())

const mythicTotal = computed(() => allTreasures.filter((t) => t.jackpot).length)
const upcoming = computed(() => meta.upcomingUnlock)

/** Calling display name (class label) with a safe fallback. */
function nameFor(heroId: string): string {
  try {
    return CLASS_LABEL[getHeroDef(heroId).cardClass]
  } catch {
    return 'Champion'
  }
}

const callingRows = computed(() =>
  ALL_CALLINGS.map((heroId) => {
    let art: string | undefined
    try {
      const def = getHeroDef(heroId)
      art = def.portraitArt ?? def.art
    } catch {
      /* unknown id */
    }
    const locked = !meta.isCallingUnlocked(heroId)
    const n = meta.runsUntilUnlock(heroId)
    return {
      heroId,
      name: nameFor(heroId),
      art,
      locked,
      lockHint: n === 1 ? 'Complete 1 more run' : `Complete ${n} more runs`,
      stats: meta.byCalling[heroId] ?? { runs: 0, victories: 0, bestWins: 0 },
    }
  })
)
</script>

<style scoped>
.ledger-root {
  background: radial-gradient(120% 60% at 50% 0%, rgba(120, 86, 44, 0.3), rgba(0, 0, 0, 0) 60%);
}
.header-underline {
  width: 80px;
  height: 2px;
  margin: 0.5rem auto 0;
  background: linear-gradient(90deg, transparent, #f0c850, transparent);
  opacity: 0.6;
}

.totals-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.6rem;
}
.total-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.8rem 0.4rem;
  border: 2px solid #6b4a16;
  border-radius: 12px;
  background: linear-gradient(180deg, #3a2a18 0%, #241810 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 14px rgba(0, 0, 0, 0.45);
}
.total-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f3e9d2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}
.total-num.gold { color: #ffe9a8; text-shadow: 0 0 12px rgba(240, 200, 80, 0.5); }
.total-num.mythic { color: #ffb3c0; text-shadow: 0 0 12px rgba(255, 64, 96, 0.5); }
.total-label {
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(199, 168, 106, 0.8);
}

.unlock-banner {
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffe9a8;
  padding: 0.5rem;
  border: 1px dashed rgba(240, 200, 80, 0.45);
  border-radius: 10px;
  background: rgba(240, 200, 80, 0.06);
}

.section-title {
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 233, 168, 0.85);
  margin-bottom: 0.6rem;
}

.calling-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6rem;
}
.calling-tile {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem;
  border: 2px solid #6b4a16;
  border-radius: 12px;
  background: linear-gradient(180deg, #3a2a18 0%, #241810 100%);
}
.calling-tile.locked { filter: grayscale(0.8) brightness(0.75); }
.calling-art {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #6b4a16;
  flex: none;
}
.calling-art-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffe9a8;
  background: radial-gradient(circle at 34% 28%, #8b7355, #3a2c1d);
}
.calling-body { display: flex; flex-direction: column; min-width: 0; }
.calling-name { font-size: 0.78rem; font-weight: 800; color: #ffe9a8; }
.calling-stats { font-size: 0.68rem; color: rgba(243, 233, 210, 0.75); }

.history-list { display: flex; flex-direction: column; gap: 0.35rem; }
.history-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.45rem 0.8rem;
  border-radius: 10px;
  border: 1.5px solid rgba(107, 74, 22, 0.55);
  background: rgba(36, 24, 16, 0.7);
}
.history-row.victory { border-color: rgba(240, 200, 80, 0.55); }
.hist-result { font-size: 0.95rem; flex: none; }
.hist-calling { font-size: 0.74rem; font-weight: 800; color: #ffe9a8; min-width: 90px; }
.hist-score { font-size: 0.72rem; color: rgba(243, 233, 210, 0.8); flex: 1; }
.hist-daily {
  font-size: 0.52rem;
  letter-spacing: 0.16em;
  color: #ffb3c0;
  border: 1px solid rgba(255, 64, 96, 0.5);
  border-radius: 9999px;
  padding: 1px 8px;
}
.hist-date { font-size: 0.66rem; color: rgba(199, 168, 106, 0.6); }
</style>
