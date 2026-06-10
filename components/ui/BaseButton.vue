<template>
  <button
    ref="btn"
    :class="[variantClass, sizeClass, fullWidth ? 'w-full' : '', 'hs-btn']"
    :disabled="disabled"
    :aria-disabled="disabled ? 'true' : 'false'"
    type="button"
    @click="onClick"
  >
    <span class="hs-btn-label inline-flex items-center justify-center gap-2">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAudio } from '~/composables/useAudio'

const audio = useAudio()

/** Themed button. Variants: gold (primary), wood (secondary). */
const props = withDefaults(
  defineProps<{
    variant?: 'gold' | 'wood'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    fullWidth?: boolean
  }>(),
  { variant: 'gold', size: 'md', disabled: false, fullWidth: false }
)

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

const btn = ref<HTMLButtonElement | null>(null)

const variantClass = computed(() => (props.variant === 'wood' ? 'btn-wood' : 'btn-gold'))

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs px-3 py-1'
    case 'lg':
      return 'text-lg px-7 py-3'
    default:
      return 'text-sm px-5 py-2'
  }
})

/** Whether to skip the decorative ripple (accessibility). */
function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Spawn a short radial ripple from the click point for tactile feedback. */
function ripple(ev: MouseEvent): void {
  const el = btn.value
  if (!el || reducedMotion()) return
  const rect = el.getBoundingClientRect()
  const span = document.createElement('span')
  const size = Math.max(rect.width, rect.height)
  span.className = 'hs-btn-ripple'
  span.style.width = span.style.height = `${size}px`
  span.style.left = `${ev.clientX - rect.left - size / 2}px`
  span.style.top = `${ev.clientY - rect.top - size / 2}px`
  el.appendChild(span)
  span.addEventListener('animationend', () => span.remove())
}

/** Forward clicks unless disabled, with a UI click sound + ripple. */
function onClick(ev: MouseEvent): void {
  if (props.disabled) return
  ripple(ev)
  audio.play('click')
  emit('click', ev)
}
</script>

<style scoped>
/* Local enhancements layered on the global .btn-gold / .btn-wood classes.
 * No contract change: variant/size classes still drive the look. */
.hs-btn {
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}
.hs-btn-label {
  position: relative;
  z-index: 2;
}
.hs-btn-ripple {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 70%);
  transform: scale(0);
  opacity: 0.8;
  pointer-events: none;
  animation: hsBtnRipple 0.5s ease-out forwards;
}
@keyframes hsBtnRipple {
  to {
    transform: scale(2.4);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hs-btn-ripple {
    display: none;
  }
}
</style>
