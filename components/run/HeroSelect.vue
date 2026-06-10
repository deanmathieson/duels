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
        :class="{ selected: selectedId === hero.id }"
        :style="{ '--stagger': i }"
        @click="selectedId = hero.id"
      >
        <!-- Selected golden ring overlay -->
        <div class="selection-ring" :class="{ 'ring-visible': selectedId === hero.id }" />

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
          <span class="class-tag font-engrave">{{ hero.cardClass }}</span>
        </div>

        <h2 class="hero-name font-engrave">{{ hero.name }}</h2>
        <p class="hero-lore font-body">{{ loreFor(hero.id) }}</p>

        <div class="hero-meta">
          <span class="meta-chip font-engrave">{{ hero.heroPowers.length }} Hero Powers</span>
          <span class="meta-chip font-engrave">{{ hero.signatureTreasures.length }} Signatures</span>
        </div>

        <!-- One-click pick, right in the card — no scrolling to a footer button. -->
        <button class="choose-btn font-engrave" @click.stop="chooseHero(hero.id)">
          Choose
        </button>

        <!-- Selected checkmark badge -->
        <div v-show="selectedId === hero.id" class="selected-badge font-engrave">
          <span class="selected-check">✓</span>
          SELECTED
        </div>
      </article>
    </div>

    <div class="mt-8 confirm-row">
      <BaseButton variant="gold" size="lg" :disabled="!selectedId" @click="choose">
        Choose {{ selectedName }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { heroes } from '~/data/registry'
import { gsap } from 'gsap'

/** Hero draft screen. Currently Forest Warden Omu is the only champion; the
 *  layout already supports a row of selectable hero portraits for future heroes. */
const run = useRunStore()

const rootEl = ref<HTMLElement>()
const cardEls = ref<HTMLElement[]>([])

const heroDefs = heroes
const selectedId = ref<string | undefined>(heroDefs.length === 1 ? heroDefs[0].id : undefined)

/** Per-hero flavour text shown under the portrait. */
const LORE: Record<string, string> = {
  forest_warden_omu:
    'A revered druid of the Gilnean wilds, Omu channels the raw renewal of the forest — summoning treants, ramping mana, and bending the cycle of seasons to his will.',
  hero_hunter:
    'A master marksman of the Alterac peaks, Tavish leads packs of beasts and never misses a killing shot.',
  hero_mage:
    'An arcane duelist who bends raw spellpower to her will — out-burn your foe before they can draw breath.',
  hero_paladin:
    'A redeemed commander of the Light, calling forth ranks of Recruits and shielding them in holy radiance.',
  hero_priest:
    'A shadow-touched priest who mends her own and unravels the minds of her enemies.',
  hero_rogue:
    'A shadow operative trading in cheap tricks, swift blades and stolen spells.',
  hero_shaman:
    'A primalist who plants totems and calls down lightning and elemental fury.',
  hero_warlock:
    'She pays in her own lifeblood to flood the board with demons and drain her foes.',
  hero_warrior:
    'An unkillable bone colossus — stack armor, swing massive weapons, and outlast everything.'
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

  // Confirm row entrance
  gsap.fromTo(
    '.confirm-row',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.6 }
  )
})

/** Lock in the chosen hero and advance to hero-power selection. */
function choose(): void {
  if (!selectedId.value) return
  run.selectHero(selectedId.value)
}

/** One-click pick from a card's own Choose button: select + confirm. */
function chooseHero(id: string): void {
  selectedId.value = id
  run.selectHero(id)
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

/* In-card confirm button */
.choose-btn {
  display: block;
  margin: 0.8rem auto 0;
  padding: 0.45rem 1.6rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3a2410;
  border-radius: 9999px;
  border: 1px solid #6b4a0e;
  background: linear-gradient(180deg, #ffe9a8 0%, #f0c850 45%, #c79018 100%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.7),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25),
    0 3px 8px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.choose-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.7),
    inset 0 -2px 4px rgba(0, 0, 0, 0.25),
    0 5px 12px rgba(0, 0, 0, 0.55),
    0 0 14px rgba(240, 200, 80, 0.5);
}
.choose-btn:active {
  transform: translateY(0);
  filter: brightness(0.96);
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
