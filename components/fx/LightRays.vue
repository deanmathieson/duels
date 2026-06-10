<template>
  <div class="light-rays pointer-events-none" :class="`rays-${variant}`" aria-hidden="true">
    <div class="rays-spin" />
    <div class="rays-glow" />
  </div>
</template>

<script setup lang="ts">
/**
 * Slowly rotating volumetric "god-ray" shafts radiating from a point, plus a
 * soft central glow. Reusable backdrop accent for triumphant / focal moments
 * (victory screen, and a subtle version behind the menu title).
 *
 * Variants:
 *  - 'gold'  : warm golden shafts (default)
 *  - 'pale'  : faint, low-contrast shafts for subtle menu ambience
 */
withDefaults(
  defineProps<{
    variant?: 'gold' | 'pale'
  }>(),
  { variant: 'gold' }
)
</script>

<style scoped>
.light-rays {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.rays-spin {
  position: absolute;
  inset: -25%;
  transform-origin: center;
  animation: raysSpin 40s linear infinite;
}

.rays-gold .rays-spin {
  background: repeating-conic-gradient(
    from 0deg at 50% 42%,
    rgba(240, 200, 80, 0.14) 0deg,
    rgba(240, 200, 80, 0.14) 5deg,
    rgba(240, 200, 80, 0) 5deg,
    rgba(240, 200, 80, 0) 13deg
  );
  mask-image: radial-gradient(60% 60% at 50% 42%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(60% 60% at 50% 42%, #000 30%, transparent 80%);
}
.rays-pale .rays-spin {
  background: repeating-conic-gradient(
    from 0deg at 50% 30%,
    rgba(240, 220, 170, 0.06) 0deg,
    rgba(240, 220, 170, 0.06) 6deg,
    rgba(240, 220, 170, 0) 6deg,
    rgba(240, 220, 170, 0) 16deg
  );
  mask-image: radial-gradient(55% 55% at 50% 30%, #000 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(55% 55% at 50% 30%, #000 20%, transparent 75%);
}

.rays-glow {
  position: absolute;
  inset: 0;
}
.rays-gold .rays-glow {
  background: radial-gradient(48% 42% at 50% 40%, rgba(255, 230, 150, 0.22) 0%, rgba(255, 230, 150, 0) 70%);
  animation: raysPulse 5s ease-in-out infinite;
}
.rays-pale .rays-glow {
  background: radial-gradient(45% 40% at 50% 28%, rgba(255, 235, 175, 0.1) 0%, rgba(255, 235, 175, 0) 70%);
}

@keyframes raysSpin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes raysPulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rays-spin {
    animation: none;
  }
  .rays-glow {
    animation: none;
  }
}
</style>
