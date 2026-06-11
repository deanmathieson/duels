<template>
  <div class="codex-root w-full h-full flex flex-col items-center overflow-auto px-4 sm:px-8 py-6">
    <!-- Header -->
    <header class="text-center mb-5 shrink-0 relative z-10">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">The County Ledger</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">Treasure Codex</h1>
      <div class="header-underline" />
      <p class="font-body text-parchment-light/70 text-sm mt-2">
        Every boon the moor has ever offered. {{ filtered.length }} of {{ entries.length }} shown.
      </p>
    </header>

    <!-- Controls: category tabs + search -->
    <div class="controls relative z-10 flex flex-wrap items-center justify-center gap-2 mb-6 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-pill font-engrave"
        :class="{ 'tab-active': activeTab === tab.key, 'tab-mythic': tab.key === 'mythic' }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
      </button>
      <input
        v-model="search"
        type="search"
        placeholder="Search the ledger…"
        class="search-box font-body"
      />
    </div>

    <!-- Tile grid (signatures get per-calling section headers) -->
    <div class="w-full max-w-6xl relative z-10 pb-10">
      <template v-for="group in groups" :key="group.title">
        <h2 v-if="group.title" class="group-title font-engrave">{{ group.title }}</h2>
        <div class="codex-grid">
          <article
            v-for="t in group.items"
            :key="t.id"
            class="codex-tile"
            :class="{ 'tile-mythic': t.mythic }"
          >
            <div class="tile-ambient" :class="t.mythic ? 'tile-ambient-mythic' : ''" />
            <span v-if="t.cost != null" class="mana-gem tile-cost">{{ t.cost }}</span>

            <div
              class="tile-emblem"
              :class="t.undiscovered ? 'emblem-undiscovered' : t.mythic ? 'emblem-mythic' : `emblem-${t.kind}`"
            >
              <img
                v-if="t.art && !t.undiscovered"
                :src="t.art"
                :alt="t.name"
                class="tile-art"
                loading="lazy"
                draggable="false"
              />
              <span v-else class="tile-rune font-engrave">{{ t.undiscovered ? '?' : t.name.charAt(0) }}</span>
            </div>

            <div class="tile-body">
              <h3 class="tile-name font-engrave">{{ t.undiscovered ? '???' : t.name }}</h3>
              <div class="tile-badges font-engrave">
                <span class="badge" :class="t.mythic ? 'badge-mythic' : `badge-${t.kind}`">{{ t.badge }}</span>
              </div>
              <p v-if="t.undiscovered" class="tile-text font-body tile-text-dim">
                Undiscovered. Mythics reveal themselves when the moor offers them.
              </p>
              <p v-else class="tile-text font-body" v-html="renderText(t.text)" />
            </div>
          </article>
        </div>
      </template>

      <p v-if="filtered.length === 0" class="font-body text-parchment-light/60 text-center mt-10">
        The ledger has no page for that. The moor suggests checking your spelling, or your luck.
      </p>
    </div>

    <!-- Back -->
    <div class="back-row relative z-10 shrink-0 pb-6">
      <BaseButton variant="wood" size="md" @click="router.push('/')">Back to the Hearth</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CardClass, TreasureDef } from '~/game/types'
import {
  activeTreasureIds,
  getTreasureDef,
  passiveTreasureIds,
  signatureTreasures,
} from '~/data/registry'
import { CLASS_LABEL } from '~/data/terms'

/**
 * Treasure Codex — a browsable ledger of every treasure in the game, reached
 * from the main menu. Offerable treasures (tiered passives, actives, mythic
 * jackpots) plus every calling's signature treasures. Mythics the player has
 * never been offered render obscured — discovery is part of the chase.
 */
useSeoMeta({
  title: 'Treasure Codex — Hollowmoor',
  description:
    'Every boon the moor has ever offered: tiered passives, active treasures, the seventeen mythic jackpots, and the signature treasures of all nine callings.',
  ogTitle: 'Treasure Codex — Hollowmoor',
  ogUrl: 'https://toast.house/duels/codex/',
})
useHead({ link: [{ rel: 'canonical', href: 'https://toast.house/duels/codex/' }] })

const router = useRouter()
const meta = useMetaStore()
onMounted(() => meta.load())

type TabKey = 'all' | 'mythic' | 'passive1' | 'passive2' | 'active' | 'signature'

interface CodexEntry {
  id: string
  name: string
  text: string
  art?: string
  kind: TreasureDef['kind']
  mythic: boolean
  /** Mythic the player has never been offered — shown obscured. */
  undiscovered?: boolean
  badge: string
  tab: TabKey
  cost?: number
  cardClass?: CardClass
}

function toEntry(def: TreasureDef): CodexEntry {
  const mythic = !!def.jackpot
  let tab: TabKey
  let badge: string
  if (mythic) {
    tab = 'mythic'
    badge = 'Mythic'
  } else if (def.kind === 'signature') {
    tab = 'signature'
    badge = `Signature — ${CLASS_LABEL[(def.card?.cardClass ?? 'neutral') as CardClass]}`
  } else if (def.kind === 'active') {
    tab = 'active'
    badge = 'Active'
  } else {
    tab = (def.tier ?? 1) === 2 ? 'passive2' : 'passive1'
    badge = (def.tier ?? 1) === 2 ? 'Passive — Tier II' : 'Passive — Tier I'
  }
  return {
    id: def.id,
    name: def.name,
    text: def.text,
    art: def.art ?? def.card?.art,
    kind: def.kind,
    mythic,
    undiscovered: mythic && !meta.isMythicSeen(def.id),
    badge,
    tab,
    cost: def.card?.cost,
    cardClass: def.card?.cardClass,
  }
}

/** Every codex entry: offered passives + actives (incl. jackpots) + signatures. */
const entries = computed<CodexEntry[]>(() => {
  const offered = [...passiveTreasureIds, ...activeTreasureIds].map((id) =>
    toEntry(getTreasureDef(id))
  )
  const sigs = signatureTreasures.map(toEntry)
  return [...offered, ...sigs]
})

const TAB_ORDER: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mythic', label: 'Mythic' },
  { key: 'passive1', label: 'Passives I' },
  { key: 'passive2', label: 'Passives II' },
  { key: 'active', label: 'Actives' },
  { key: 'signature', label: 'Signatures' },
]

const activeTab = ref<TabKey>('all')
const search = ref('')

const tabs = computed(() =>
  TAB_ORDER.map((t) => ({
    ...t,
    count: t.key === 'all' ? entries.value.length : entries.value.filter((e) => e.tab === t.key).length,
  }))
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return entries.value.filter((e) => {
    if (activeTab.value !== 'all' && e.tab !== activeTab.value) return false
    if (q && !`${e.name} ${e.text}`.toLowerCase().includes(q)) return false
    return true
  })
})

/** Mythics first, then by tab order; signatures grouped by calling. */
const groups = computed<{ title: string; items: CodexEntry[] }[]>(() => {
  const sigs = filtered.value.filter((e) => e.tab === 'signature')
  const rest = filtered.value.filter((e) => e.tab !== 'signature')
  const tabRank: Record<TabKey, number> = { all: 0, mythic: 0, passive1: 1, passive2: 2, active: 3, signature: 4 }
  const sorted = [...rest].sort(
    (a, b) => tabRank[a.tab] - tabRank[b.tab] || a.name.localeCompare(b.name)
  )
  const out: { title: string; items: CodexEntry[] }[] = []
  if (sorted.length) out.push({ title: '', items: sorted })
  if (sigs.length) {
    const byClass = new Map<string, CodexEntry[]>()
    for (const s of sigs) {
      const label = CLASS_LABEL[(s.cardClass ?? 'neutral') as CardClass]
      if (!byClass.has(label)) byClass.set(label, [])
      byClass.get(label)!.push(s)
    }
    for (const [label, items] of [...byClass.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      out.push({
        title: `Signatures of the ${label}`,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      })
    }
  }
  return out
})

/** Re-enable simple **bold** markup from treasure text, escaping the rest. */
function renderText(text: string): string {
  const escaped = (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}
</script>

<style scoped>
.codex-root {
  background:
    radial-gradient(120% 60% at 50% 0%, rgba(120, 86, 44, 0.3), rgba(0, 0, 0, 0) 60%);
}

.header-underline {
  width: 80px;
  height: 2px;
  margin: 0.5rem auto 0;
  background: linear-gradient(90deg, transparent, #f0c850, transparent);
  opacity: 0.6;
}

/* Category tab pills */
.tab-pill {
  padding: 0.35rem 0.85rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e8d9b8;
  border: 2px solid #6b4a16;
  border-radius: 9999px;
  background: linear-gradient(180deg, #4d3620 0%, #2a1c10 100%);
  cursor: pointer;
  transition: filter 0.12s ease, transform 0.12s ease, border-color 0.12s ease;
}
.tab-pill:hover { filter: brightness(1.2); transform: translateY(-1px); }
.tab-active {
  border-color: #f0c850;
  color: #ffe9a8;
  box-shadow: 0 0 14px 2px rgba(240, 200, 80, 0.35);
}
.tab-mythic.tab-active {
  border-color: rgba(255, 64, 96, 0.8);
  color: #ffb3c0;
  box-shadow: 0 0 14px 2px rgba(255, 64, 96, 0.4);
}
.tab-count { opacity: 0.65; margin-left: 0.2rem; }

.search-box {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  color: #f3e9d2;
  border: 2px solid #6b4a16;
  border-radius: 9999px;
  background: rgba(20, 12, 6, 0.7);
  outline: none;
  min-width: 180px;
}
.search-box:focus { border-color: #f0c850; }
.search-box::placeholder { color: rgba(243, 233, 210, 0.4); }

.group-title {
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 233, 168, 0.85);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  margin: 1.4rem 0 0.7rem 0.2rem;
}

.codex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.8rem;
}

/* Compact treasure tile */
.codex-tile {
  position: relative;
  display: flex;
  gap: 0.7rem;
  padding: 0.7rem;
  border: 2px solid #6b4a16;
  border-radius: 14px;
  background:
    radial-gradient(120% 70% at 50% 0%, rgba(120, 86, 44, 0.35), rgba(0, 0, 0, 0) 62%),
    linear-gradient(180deg, #3a2a18 0%, #241810 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 6px 14px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}
.tile-mythic {
  border-color: rgba(255, 64, 96, 0.7);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 6px 14px rgba(0, 0, 0, 0.45),
    0 0 16px 2px rgba(255, 64, 96, 0.3);
}
.tile-ambient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  background: radial-gradient(120% 60% at 50% 100%, rgba(240, 144, 42, 0.55), transparent 70%);
}
.tile-ambient-mythic {
  background: radial-gradient(120% 60% at 50% 100%, rgba(255, 64, 96, 0.65), transparent 70%);
  opacity: 0.22;
}

.tile-cost {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  width: 1.7rem;
  height: 1.7rem;
  font-size: 0.85rem;
}

.tile-emblem {
  flex: none;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #6b4a16;
  box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), inset 0 -4px 8px rgba(0, 0, 0, 0.5);
  align-self: center;
}
.emblem-passive { background: radial-gradient(circle at 34% 28%, #e6b4ff 0%, #b14ee0 45%, #7a23a8 100%); }
.emblem-active { background: radial-gradient(circle at 34% 28%, #ffd9a0 0%, #f0902a 45%, #b85e10 100%); }
.emblem-signature { background: radial-gradient(circle at 34% 28%, #aacbff 0%, #3d7ff0 45%, #1a4fb0 100%); }
.emblem-mythic { background: radial-gradient(circle at 34% 28%, #ffb3c0 0%, #ff4060 45%, #9c1030 100%); }
.emblem-undiscovered { background: radial-gradient(circle at 34% 28%, #4a3340 0%, #2a1b26 55%, #140a12 100%); }
.tile-art { width: 100%; height: 100%; object-fit: cover; }
.tile-rune {
  font-size: 1.7rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7);
}

.tile-body { min-width: 0; display: flex; flex-direction: column; gap: 0.18rem; }
.tile-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  line-height: 1.15;
}
.tile-badges { display: flex; gap: 0.3rem; }
.badge {
  font-size: 0.52rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 1px 7px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.badge-passive { color: #e6b4ff; background: rgba(122, 35, 168, 0.3); }
.badge-active { color: #ffd9a0; background: rgba(184, 94, 16, 0.3); }
.badge-signature { color: #aacbff; background: rgba(26, 79, 176, 0.3); }
.badge-mythic { color: #ffb3c0; background: rgba(156, 16, 48, 0.4); }

.tile-text {
  font-size: 0.72rem;
  line-height: 1.35;
  color: rgba(243, 233, 210, 0.85);
}
.tile-text :deep(strong) { color: #ffe9a8; }
.tile-text-dim { color: rgba(243, 233, 210, 0.45); font-style: italic; }
</style>
