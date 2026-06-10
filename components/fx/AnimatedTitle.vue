<template>
  <h1
    class="animated-title font-engrave"
    :class="[`at-${variant}`, `at-enter-${enter}`]"
  >
    <span class="at-text" :data-text="text">{{ text }}</span>
    <span v-if="variant !== 'crimson'" class="at-shine" aria-hidden="true" />
  </h1>
</template>

<script setup lang="ts">
/**
 * Reusable cinematic title — an engraved metal gradient with a sweeping
 * light shine and a configurable dramatic entrance. Used by the main menu
 * ('DUELS'), the victory screen ('VICTORY!') and the defeat screen ('DEFEAT').
 *
 * Variants:
 *  - 'gold'    : warm engraved gold (menu / generic)
 *  - 'radiant' : brighter gold with a stronger halo (victory)
 *  - 'crimson' : somber, dim crimson with no shine sweep (defeat)
 */
withDefaults(
  defineProps<{
    text: string
    variant?: 'gold' | 'radiant' | 'crimson'
    /** Entrance animation flavour. */
    enter?: 'rise' | 'stamp' | 'sink'
  }>(),
  { variant: 'gold', enter: 'rise' }
)
</script>

<style scoped>
.animated-title {
  position: relative;
  display: inline-block;
  margin: 0;
  line-height: 1;
  font-size: clamp(4rem, 15vw, 10rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  isolation: isolate;
}

.at-text {
  position: relative;
  display: inline-block;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

/* --- Gold (menu / default) --- */
.at-gold .at-text {
  background-image: linear-gradient(180deg, #fff3cf 0%, #f0c850 32%, #d8a830 55%, #8a5e16 100%);
  -webkit-text-stroke: 2px #4a3209;
  text-shadow: 0 0 30px rgba(240, 200, 80, 0.4);
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.7));
}

/* --- Radiant (victory) — brighter, bigger halo --- */
.at-radiant .at-text {
  background-image: linear-gradient(180deg, #fff8e2 0%, #ffe9a8 30%, #f0c850 58%, #b8841f 100%);
  -webkit-text-stroke: 2px #4a3209;
  filter: drop-shadow(0 0 34px rgba(240, 200, 80, 0.7));
  animation: titleHalo 2.8s ease-in-out infinite;
}

/* --- Crimson (defeat) — somber, no sweep --- */
.at-crimson .at-text {
  background-image: none;
  color: #a32a1c;
  -webkit-text-stroke: 1px #2a0a06;
  text-shadow: 0 0 30px rgba(160, 42, 28, 0.65), 0 3px 6px rgba(0, 0, 0, 0.9);
  letter-spacing: 0.14em;
}

/* --- Light-sweep shine (clipped to the text) --- */
.at-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 38%, rgba(255, 255, 255, 0.75) 50%, transparent 62%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  mix-blend-mode: screen;
  transform: translateX(-140%);
  animation: titleShine 4.5s ease-in-out 1.2s infinite;
  pointer-events: none;
}
/* Echo the title glyphs so the sweep only shows over the letters. */
.at-shine::before {
  content: attr(data-text);
}

/* --- Entrances --- */
.at-enter-rise {
  animation: titleRiseFx 1s cubic-bezier(0.2, 0.9, 0.3, 1) both;
}
.at-enter-stamp .at-text {
  animation: titleStampFx 0.8s cubic-bezier(0.2, 1.3, 0.4, 1) both;
}
.at-enter-stamp.at-radiant .at-text {
  animation: titleStampFx 0.8s cubic-bezier(0.2, 1.3, 0.4, 1) both, titleHalo 2.8s ease-in-out 0.8s infinite;
}
.at-enter-sink {
  animation: titleSinkFx 1.4s ease both;
}

@keyframes titleRiseFx {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes titleStampFx {
  0% {
    transform: scale(2);
    opacity: 0;
  }
  60% {
    transform: scale(0.95);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
@keyframes titleSinkFx {
  0% {
    opacity: 0;
    transform: translateY(-18px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes titleShine {
  0%,
  70% {
    transform: translateX(-140%);
  }
  100% {
    transform: translateX(140%);
  }
}
@keyframes titleHalo {
  0%,
  100% {
    filter: drop-shadow(0 0 28px rgba(240, 200, 80, 0.55));
  }
  50% {
    filter: drop-shadow(0 0 46px rgba(255, 230, 150, 0.85));
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-title,
  .at-text,
  .at-shine {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
  .at-shine {
    display: none;
  }
}
</style>
