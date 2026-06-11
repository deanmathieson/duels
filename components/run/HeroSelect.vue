<template>
  <!-- NOTE: no justify-center here — with overflow-auto it makes the overflowing
       top row unreachable (clipped under the HUD) on shorter screens. -->
  <div ref="rootEl" class="hero-select w-full h-full flex flex-col items-center px-6 py-8 overflow-auto">
    <header class="header-block text-center mb-8">
      <p class="font-engrave tracking-[0.35em] text-gold-200/70 text-xs uppercase mb-1">Choose Your Champion</p>
      <h1 class="font-engrave font-extrabold text-3xl sm:text-4xl text-engrave">The Draft Begins</h1>
      <div class="header-underline" />
    </header>

    <div class="hero-card-row">
      <article
        v-for="(hero, i) in heroDefs"
        :key="hero.id"
        ref="cardEls"
        class="hero-portrait-card"
        :class="{ selected: selectedId === hero.id, locked: isLocked(hero.id) }"
        :style="{ '--stagger': i }"
        @click="onHeroClick(hero.id)"
      >
        <!-- Selected golden ring overlay -->
        <div class="selection-ring" :class="{ 'ring-visible': selectedId === hero.id }" />

        <!-- Locked veil: unlock condition over a dimmed portrait -->
        <div v-if="isLocked(hero.id)" class="lock-veil">
          <span class="lock-rune">🔒</span>
          <span class="lock-text font-engrave">{{ lockHint(hero.id) }}</span>
        </div>

        <!-- Portrait -->
        <div class="portrait-frame">
          <img
            v-if="hero.portraitArt || hero.art"
            :src="hero.portraitArt || hero.art"
            :alt="hero.name"
            class="portrait-img"
            draggable="false"
          />
          <div v-else class="portrait-fallback">
            <span class="portrait-initial font-engrave">{{ hero.name.charAt(0) }}</span>
          </div>
          <div class="portrait-glaze" />
          <div class="portrait-bottom-fade" />
          <span class="class-tag font-engrave">{{ CLASS_LABEL[hero.cardClass] }}</span>
        </div>

        <h2 class="hero-name font-engrave">{{ hero.name }}</h2>
        <p class="hero-lore font-body">{{ loreFor(hero.id) }}</p>

        <div class="hero-meta">
          <span class="meta-chip font-engrave">{{ hero.heroPowers.length }} Hero Powers</span>
          <span class="meta-chip font-engrave">{{ hero.signatureTreasures.length }} Signatures</span>
        </div>

        <!-- Selected checkmark badge -->
        <div v-show="selectedId === hero.id" class="selected-badge font-engrave">
          <span class="selected-check">✓</span>
          SELECTED
        </div>
      </article>
    </div>

    <!-- Floating mid-screen confirm: appears once a hero is selected, so the
         pick is confirmable without scrolling to a footer. The wrapper ignores
         pointer events — other hero cards stay clickable around it. -->
    <Transition name="confirm-pop">
      <div v-if="selectedId" class="confirm-float">
        <div class="confirm-card">
          <p class="confirm-label font-engrave">Champion selected</p>
          <p class="confirm-name font-engrave">{{ selectedName }}</p>
          <BaseButton variant="gold" size="lg" @click="choose">
            Confirm Selection
          </BaseButton>
          <button class="confirm-cancel font-engrave" @click="selectedId = undefined">
            Pick someone else
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { heroes } from '~/data/registry'
import { CLASS_LABEL } from '~/data/terms'
import { gsap } from 'gsap'

/** Hero draft screen. Clicking a portrait selects the hero; a floating
 *  mid-screen panel then confirms the pick — no scrolling to a footer button.
 *  Callings unlock one per completed run (the ledger tracks progress). */
const run = useRunStore()
const meta = useMetaStore()

/** Locked in FREE runs only — the daily hunt fixes (and bypasses) the calling. */
function isLocked(heroId: string): boolean {
  return run.mode !== 'daily' && !meta.isCallingUnlocked(heroId)
}

/** The unlock requirement line shown on a locked portrait. */
function lockHint(heroId: string): string {
  const n = meta.runsUntilUnlock(heroId)
  return n === 1 ? 'Complete 1 more run' : `Complete ${n} more runs`
}

/** Select an unlocked hero; locked portraits just shake their chains. */
function onHeroClick(heroId: string): void {
  if (isLocked(heroId)) return
  selectedId.value = heroId
}

const rootEl = ref<HTMLElement>()
const cardEls = ref<HTMLElement[]>([])

const heroDefs = heroes
const selectedId = ref<string | undefined>(heroDefs.length === 1 ? heroDefs[0].id : undefined)

/** Per-hero flavour text shown under the portrait. */
const LORE: Record<string, string> = {
  forest_warden_omu:
    'The Hedgewitch of Hollowmoor. Four husbands buried — three of them properly dead — and a standing bargain with the Briar. Her garden grows overnight, and so do her grudges.',
  hero_hunter:
    "The poacher matriarch of the moor. Never lost a dog, never missed a shot, never paid the gamekeeper in anything he could bank. Her snares catch dinner; her smile catches everything else.",
  hero_mage:
    'A scandalous hedge-astrologer who reads ruin in the night sky and sells the good news at a markup. Burn bright, burn fast, and bill the survivors.',
  hero_paladin:
    'Captain of the lantern processions. Half the parish owes her protection money; the other half owes her apologies. Light every wick, shield every debtor — collection comes later.',
  hero_priest:
    'Shepherd of the crookedest parish in the county. Mends his flock with one hand, unravels their secrets with the other, and drinks the communion cellar dry in between.',
  hero_rogue:
    'The most-acquitted woman in Hollowmoor: smuggler, fence, and dealer in the corpse trade. Knives cheap, silence extra, no refunds.',
  hero_shaman:
    'The bog-witch who reads tomorrow in entrails and stakes carved Effigies in the marsh. The weather owes her favors. So does half the drowned.',
  hero_warlock:
    'The crossroads creditor. She pays in her own blood, lends at ruinous interest, and the Fae who hold her notes are always, always hungry.',
  hero_warrior:
    'The last Banneret of a mortgaged keep — rusting plate, tavern debts, and a tourney title nobody dares ask him to defend. Stack armor, swing iron, outlast the county.'
}

/** Lore for a hero, with a graceful fallback. */
function loreFor(id: string): string {
  return LORE[id] ?? 'A champion ready to forge a deck and climb the gauntlet.'
}

const selectedName = computed(() =>
  selectedId.value ? heroes.find((h) => h.id === selectedId.value)?.name ?? 'Hero' : 'Hero'
)

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  // Header entrance
  gsap.fromTo(
    '.header-block',
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
  )

  // Staggered card entrance
  gsap.fromTo(
    cardEls.value,
    { opacity: 0, y: 40, scale: 0.92 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.55,
      stagger: 0.1,
      ease: 'back.out(1.4)',
      delay: 0.15
    }
  )

})

/** Lock in the chosen hero and advance to hero-power selection. */
function choose(): void {
  if (!selectedId.value) return
  run.selectHero(selectedId.value)
}
</script>

<style scoped>
.header-underline {
  width: 80px;
  height: 2px;
  margin: 0.6rem auto 0;
  background: linear-gradient(90deg, transparent, #f0c850, transparent);
  opacity: 0.6;
}

.hero-card-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hero-portrait-card {
  position: relative;
  width: 320px;
  max-width: 86vw;
  padding: 1rem;
  border: 2px solid #6b4a16;
  border-radius: 16px;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(120, 86, 44, 0.4), rgba(0, 0, 0, 0) 60%),
    linear-gradient(180deg, #42301c 0%, #2a1c10 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 28px rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease, border-color 0.18s ease;
  will-change: transform;
  /* Initial hidden state — GSAP will reveal it */
  opacity: 0;
}
.hero-portrait-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 18px 36px rgba(0, 0, 0, 0.65);
}
.hero-portrait-card.selected {
  border-color: #f0c850;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 14px 32px rgba(0, 0, 0, 0.6),
    0 0 30px 6px rgba(240, 200, 80, 0.55);
  transform: translateY(-6px) scale(1.01);
}

/* Locked calling: dimmed, desaturated, with the unlock requirement overlaid. */
.hero-portrait-card.locked {
  cursor: not-allowed;
  filter: grayscale(0.85) brightness(0.7);
}
.hero-portrait-card.locked:hover {
  transform: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 28px rgba(0, 0, 0, 0.55);
}
.lock-veil {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 14px;
  background: rgba(10, 6, 2, 0.45);
}
.lock-rune {
  font-size: 2rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9));
}
.lock-text {
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #ffe9a8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
  background: rgba(20, 12, 6, 0.8);
  border: 1px solid rgba(240, 200, 80, 0.4);
  border-radius: 9999px;
  padding: 3px 12px;
}

/* Golden ring overlay for selected state. Transparent center — an opaque
   padding-box fill here paints OVER the card's static text content. */
.selection-ring {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 3px solid #f0c850;
  box-shadow:
    0 0 18px 4px rgba(240, 200, 80, 0.5),
    inset 0 0 14px rgba(240, 200, 80, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.ring-visible {
  opacity: 1;
}

.portrait-frame {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #4a3209;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.7);
}
.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.hero-portrait-card:hover .portrait-img {
  transform: scale(1.04);
}
.portrait-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 120% at 35% 25%, #6b8f3a 0%, #26410f 100%);
}
.portrait-initial {
  font-size: 5rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.7);
}
.portrait-glaze {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0) 35%);
}
.portrait-bottom-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.55) 100%);
}
.class-tag {
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #cfe8a0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

.hero-name {
  margin-top: 0.75rem;
  font-size: 1.35rem;
  font-weight: 800;
  text-align: center;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 0 10px rgba(240, 200, 80, 0.25);
}
.hero-lore {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  line-height: 1.4;
  text-align: center;
  color: rgba(243, 233, 210, 0.78);
}
.hero-meta {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.meta-chip {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  border: 1px solid #6b4a16;
  background: rgba(58, 42, 24, 0.8);
  color: #d8a830;
}

/* Floating mid-screen confirm. The wrapper spans the viewport center but lets
   clicks fall through; only the panel itself is interactive. */
.confirm-float {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 60;
  pointer-events: none;
}
.confirm-card {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  padding: 1.1rem 2rem 1rem;
  border-radius: 16px;
  border: 2px solid #f0c850;
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(240, 200, 80, 0.16), transparent 65%),
    linear-gradient(180deg, rgba(58, 42, 24, 0.97) 0%, rgba(32, 22, 12, 0.97) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 18px 44px rgba(0, 0, 0, 0.75),
    0 0 36px 6px rgba(240, 200, 80, 0.4);
}
.confirm-label {
  font-size: 0.58rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #d8a830;
}
.confirm-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffe9a8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 0 12px rgba(240, 200, 80, 0.35);
}
.confirm-cancel {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(243, 233, 210, 0.55);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}
.confirm-cancel:hover {
  color: #ffe9a8;
}
.confirm-pop-enter-active,
.confirm-pop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.4);
}
.confirm-pop-enter-from,
.confirm-pop-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.85);
}

.selected-badge {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.55rem;
  letter-spacing: 0.18em;
  color: #ffe9a8;
  text-shadow: 0 0 8px rgba(240, 200, 80, 0.9);
  animation: badge-pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.5) both;
}
.selected-check {
  font-size: 0.75rem;
  color: #8cff7a;
  text-shadow: 0 0 8px rgba(80, 255, 90, 0.8);
}

@keyframes badge-pop {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}
</style>
