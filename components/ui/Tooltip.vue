<template>
  <span class="relative inline-flex" @mouseenter="show = true" @mouseleave="show = false">
    <slot />
    <Transition :name="transitionName">
      <span
        v-if="show && (text || $slots.content)"
        class="tip-bubble panel-wood font-body"
        :class="placementClass"
        role="tooltip"
      >
        <span class="tip-inner">
          <slot name="content">{{ text }}</slot>
        </span>
        <span class="tip-arrow" :class="placementClass" aria-hidden="true" />
      </span>
    </Transition>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/** Lightweight themed tooltip. Wrap a trigger in the default slot. */
const props = withDefaults(
  defineProps<{
    text?: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
  }>(),
  { placement: 'top' }
)

const show = ref(false)

const placementClass = computed(() => `tip-${props.placement}`)
/** Slide direction follows placement so the bubble grows out of the trigger. */
const transitionName = computed(() => `tip-${props.placement}-fade`)
</script>

<style scoped>
.tip-bubble {
  position: absolute;
  z-index: 60;
  width: max-content;
  max-width: 240px;
  padding: 0.45rem 0.65rem;
  font-size: 0.75rem;
  line-height: 1.25;
  color: #f3e9d2;
  pointer-events: none;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
  /* Stronger lift than a flat panel so it clearly floats above the UI. */
  box-shadow:
    inset 0 1px 0 rgba(255, 245, 210, 0.12),
    0 6px 18px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(0, 0, 0, 0.4);
}
.tip-inner {
  position: relative;
  z-index: 1;
  display: block;
}

/* Diamond arrow rendered as a rotated gilt-edged square that tucks under the
 * bubble border, matching the wood panel surface. */
.tip-arrow {
  position: absolute;
  width: 9px;
  height: 9px;
  background: linear-gradient(135deg, #42301c, #2a1c10);
  border: 1px solid #6b4a16;
  transform: rotate(45deg);
}
.tip-arrow.tip-top {
  bottom: -5px;
  left: 50%;
  margin-left: -4.5px;
  border-top: none;
  border-left: none;
}
.tip-arrow.tip-bottom {
  top: -5px;
  left: 50%;
  margin-left: -4.5px;
  border-bottom: none;
  border-right: none;
}
.tip-arrow.tip-left {
  right: -5px;
  top: 50%;
  margin-top: -4.5px;
  border-bottom: none;
  border-left: none;
}
.tip-arrow.tip-right {
  left: -5px;
  top: 50%;
  margin-top: -4.5px;
  border-top: none;
  border-right: none;
}

.tip-top {
  bottom: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%);
}
.tip-bottom {
  top: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%);
}
.tip-left {
  right: calc(100% + 9px);
  top: 50%;
  transform: translateY(-50%);
}
.tip-right {
  left: calc(100% + 9px);
  top: 50%;
  transform: translateY(-50%);
}

/* Directional enter/leave: fade + a short slide from the trigger.
 * Each keeps the placement's centering translate so it doesn't jump. */
.tip-top-fade-enter-active,
.tip-top-fade-leave-active,
.tip-bottom-fade-enter-active,
.tip-bottom-fade-leave-active,
.tip-left-fade-enter-active,
.tip-left-fade-leave-active,
.tip-right-fade-enter-active,
.tip-right-fade-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.tip-top-fade-enter-from,
.tip-top-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
.tip-bottom-fade-enter-from,
.tip-bottom-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
.tip-left-fade-enter-from,
.tip-left-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(4px);
}
.tip-right-fade-enter-from,
.tip-right-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .tip-top-fade-enter-active,
  .tip-top-fade-leave-active,
  .tip-bottom-fade-enter-active,
  .tip-bottom-fade-leave-active,
  .tip-left-fade-enter-active,
  .tip-left-fade-leave-active,
  .tip-right-fade-enter-active,
  .tip-right-fade-leave-active {
    transition: opacity 0.1s ease;
  }
  .tip-top-fade-enter-from,
  .tip-top-fade-leave-to {
    transform: translateX(-50%);
  }
  .tip-bottom-fade-enter-from,
  .tip-bottom-fade-leave-to {
    transform: translateX(-50%);
  }
  .tip-left-fade-enter-from,
  .tip-left-fade-leave-to {
    transform: translateY(-50%);
  }
  .tip-right-fade-enter-from,
  .tip-right-fade-leave-to {
    transform: translateY(-50%);
  }
}
</style>
