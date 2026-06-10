<template>
  <Transition name="banner">
    <div v-if="visible" class="turn-banner-wrap" aria-hidden="true">
      <div class="turn-banner" :class="kind">
        <div class="rule" />
        <div class="banner-text font-engrave">
          {{ text }}
          <span class="sweep" aria-hidden="true" />
        </div>
        <div class="rule" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * A sweeping "Your Turn" / "Enemy Turn" banner. The board bumps `trigger`
 * (a counter) whenever the active player changes; the banner punches in, a light
 * sweep crosses the text, then it sweeps away after ~1.2s.
 */
const props = withDefaults(
  defineProps<{
    /** 'you' or 'enemy' — drives styling + default text. */
    kind: 'you' | 'enemy'
    /** Increment to (re)show the banner. */
    trigger: number
    /** Override the displayed text. */
    label?: string
    /** Visible duration (ms). */
    duration?: number
  }>(),
  { label: '', duration: 1200 }
)

const visible = ref(false)
const text = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.trigger,
  (n) => {
    if (n <= 0) return
    text.value = props.label || (props.kind === 'you' ? 'Your Turn' : 'Enemy Turn')
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
    }, props.duration)
  }
)
</script>

<style scoped>
.turn-banner-wrap {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 180;
  pointer-events: none;
}
.turn-banner {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 56px;
  width: min(680px, 86vw);
  justify-content: center;
}
.banner-text {
  position: relative;
  font-size: 52px;
  font-weight: 800;
  letter-spacing: 0.06em;
  white-space: nowrap;
  overflow: hidden;
}
/* A bright light-sweep that crosses the text on entry. */
.sweep {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 255, 255, 0.85) 50%,
    transparent 70%
  );
  background-size: 250% 100%;
  background-position: 200% 0;
  mix-blend-mode: screen;
  pointer-events: none;
}
.rule {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, currentColor, transparent);
  opacity: 0.5;
}
.turn-banner.you {
  color: #ffe9a8;
}
.turn-banner.you .banner-text {
  color: #ffe9a8;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9), 0 0 24px rgba(240, 200, 80, 0.7);
}
.turn-banner.enemy {
  color: #ff9b8c;
}
.turn-banner.enemy .banner-text {
  color: #ff9b8c;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9), 0 0 22px rgba(226, 80, 58, 0.6);
}

/* Punch in (scale + drop), hold while a light sweep crosses, then sweep out. */
.banner-enter-active {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease;
}
.banner-enter-active .sweep {
  animation: bannerSweep 0.85s ease-out 0.12s forwards;
}
.banner-leave-active {
  transition: transform 0.5s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.4s ease;
}
.banner-enter-from {
  transform: translateY(-10%) scale(0.82);
  opacity: 0;
}
.banner-leave-to {
  transform: translateX(14%) scale(1.04);
  opacity: 0;
}
@keyframes bannerSweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .banner-enter-active,
  .banner-leave-active {
    transition: opacity 0.3s ease;
  }
  .banner-enter-from,
  .banner-leave-to {
    transform: none;
  }
  .banner-enter-active .sweep {
    animation: none;
  }
}
</style>
