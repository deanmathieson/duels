<template>
  <div :class="[surfaceClass, paddingClass, 'relative']">
    <!-- Ornamental gilt corner brackets (wood variant, decorative) -->
    <template v-if="variant === 'wood' && corners">
      <span class="panel-corner panel-corner--tl" aria-hidden="true" />
      <span class="panel-corner panel-corner--tr" aria-hidden="true" />
      <span class="panel-corner panel-corner--bl" aria-hidden="true" />
      <span class="panel-corner panel-corner--br" aria-hidden="true" />
    </template>

    <!-- Optional engraved title bar -->
    <header
      v-if="title || $slots.title"
      class="panel-header mb-3 pb-2 flex items-center justify-between"
    >
      <h2
        class="font-engrave font-bold text-gold-light text-lg tracking-wide"
        style="text-shadow: 0 1px 2px rgba(0,0,0,0.85)"
      >
        <slot name="title">{{ title }}</slot>
      </h2>
      <div v-if="$slots.actions"><slot name="actions" /></div>
    </header>

    <slot />

    <!-- Corner studs for the wood variant (decorative) -->
    <template v-if="variant === 'wood' && studs">
      <span class="panel-stud top-1.5 left-1.5" aria-hidden="true" />
      <span class="panel-stud top-1.5 right-1.5" aria-hidden="true" />
      <span class="panel-stud bottom-1.5 left-1.5" aria-hidden="true" />
      <span class="panel-stud bottom-1.5 right-1.5" aria-hidden="true" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** Themed surface container. Variants: wood (default) or parchment. */
const props = withDefaults(
  defineProps<{
    variant?: 'wood' | 'parchment'
    title?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
    /** Show decorative corner studs (wood variant only). */
    studs?: boolean
    /** Show ornamental gilt corner brackets (wood variant only). */
    corners?: boolean
  }>(),
  { variant: 'wood', padding: 'md', studs: true, corners: true }
)

const surfaceClass = computed(() => (props.variant === 'parchment' ? 'panel-parchment' : 'panel-wood'))

const paddingClass = computed(() => {
  switch (props.padding) {
    case 'none':
      return ''
    case 'sm':
      return 'p-2'
    case 'lg':
      return 'p-8'
    default:
      return 'p-4'
  }
})
</script>

<style scoped>
/* Title divider: gilt rule that fades at both ends, plus a centered diamond. */
.panel-header {
  position: relative;
  border-bottom: 1px solid rgba(138, 94, 22, 0.5);
}
.panel-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(240, 200, 80, 0) 0%,
    rgba(240, 200, 80, 0.6) 50%,
    rgba(240, 200, 80, 0) 100%
  );
  pointer-events: none;
}

/* Decorative corner studs (round gilt rivets). */
.panel-stud {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffe9a8, #b8841f 70%, #6b4a16);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 1px 2px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

/* Ornamental gilt L-brackets pinned to each corner. */
.panel-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  pointer-events: none;
  /* Two crossing gilt strokes form the bracket; gradients give a beveled edge. */
  background:
    linear-gradient(180deg, #ffe9a8, #b8841f) left top / 100% 3px no-repeat,
    linear-gradient(90deg, #ffe9a8, #b8841f) left top / 3px 100% no-repeat;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.7));
  opacity: 0.92;
}
.panel-corner--tl {
  top: 4px;
  left: 4px;
}
.panel-corner--tr {
  top: 4px;
  right: 4px;
  transform: scaleX(-1);
}
.panel-corner--bl {
  bottom: 4px;
  left: 4px;
  transform: scaleY(-1);
}
.panel-corner--br {
  bottom: 4px;
  right: 4px;
  transform: scale(-1, -1);
}
</style>
