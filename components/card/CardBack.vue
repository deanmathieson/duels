<template>
  <div
    class="hs-card relative rounded-card overflow-hidden"
    :class="small ? 'w-[140px]' : 'w-[200px]'"
    :style="{ aspectRatio: '200 / 280' }"
  >
    <!-- Golden rim -->
    <div class="absolute inset-0 rounded-card" :style="rimStyle" />

    <!-- Deep purple/wood field with an ornamental boss -->
    <div class="absolute inset-[6px] rounded-[10px] overflow-hidden" :style="fieldStyle">
      <!-- Corner filigree flourishes -->
      <span
        v-for="(corner, i) in corners"
        :key="i"
        class="absolute font-engrave text-gold-light/40 leading-none"
        :class="small ? 'text-base' : 'text-xl'"
        :style="corner"
        >&#10070;</span
      >

      <!-- Concentric ornamental rings -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="rounded-full cb-ring-spin"
          :class="small ? 'w-20 h-20' : 'w-28 h-28'"
          :style="ringOuterStyle"
        />
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="rounded-full cb-ring-spin-rev"
          :class="small ? 'w-16 h-16' : 'w-[5.5rem] h-[5.5rem]'"
          :style="ringMidStyle"
        />
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="rounded-full flex items-center justify-center cb-boss"
          :class="small ? 'w-12 h-12' : 'w-16 h-16'"
          :style="ringInnerStyle"
        >
          <!-- Central emblem -->
          <span
            class="font-engrave font-bold text-gold-light"
            :class="small ? 'text-xl' : 'text-3xl'"
            style="text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 10px rgba(240,200,80,0.6)"
            >&#10070;</span
          >
        </div>
      </div>

      <!-- Soft top sheen -->
      <div
        class="absolute inset-x-0 top-0 h-1/3 pointer-events-none"
        style="background: linear-gradient(180deg, rgba(255,255,255,0.12), transparent)"
      />
      <!-- Bottom shadow seat -->
      <div
        class="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
        style="background: linear-gradient(0deg, rgba(0,0,0,0.45), transparent)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/** Decorative card back for the deck, draw pile and opponent hand. */
withDefaults(defineProps<{ small?: boolean }>(), { small: false })

const rimStyle = {
  background: 'linear-gradient(180deg, #f6da86 0%, #b8841f 48%, #5e420a 100%)',
  border: '2px solid #4a3209',
  boxShadow:
    'inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -2px 6px rgba(0,0,0,0.45)'
}

const fieldStyle = {
  background:
    'radial-gradient(120% 120% at 50% 30%, #5a2a78 0%, #3a1b54 45%, #1f0f30 100%)',
  border: '2px solid #2a1240',
  boxShadow: 'inset 0 0 14px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(240,200,80,0.18)'
}

const ringOuterStyle = {
  border: '3px solid rgba(240,200,80,0.32)',
  boxShadow: 'inset 0 0 12px rgba(240,200,80,0.2), 0 0 8px rgba(0,0,0,0.5)',
  borderStyle: 'dashed'
}

const ringMidStyle = {
  border: '1.5px solid rgba(240,200,80,0.22)',
  boxShadow: 'inset 0 0 10px rgba(120,60,160,0.4)'
}

const ringInnerStyle = {
  background: 'radial-gradient(circle at 35% 30%, #6b4a16, #2a1c10)',
  border: '2px solid rgba(240,200,80,0.6)',
  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 0 10px rgba(240,200,80,0.4)'
}

/** Four corner flourishes, rotated to fan inward. */
const corners = [
  { top: '4px', left: '5px', transform: 'rotate(0deg)' },
  { top: '4px', right: '5px', transform: 'rotate(90deg)' },
  { bottom: '4px', left: '5px', transform: 'rotate(-90deg)' },
  { bottom: '4px', right: '5px', transform: 'rotate(180deg)' }
] as const
</script>

<style scoped>
/* Slow counter-rotating rings give the back a faint arcane life. */
.cb-ring-spin {
  animation: cbSpin 28s linear infinite;
}
.cb-ring-spin-rev {
  animation: cbSpin 22s linear infinite reverse;
}
@keyframes cbSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Central boss breathes a soft golden glow. */
.cb-boss {
  animation: cbBossGlow 3.4s ease-in-out infinite;
}
@keyframes cbBossGlow {
  0%,
  100% {
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 0 8px rgba(240, 200, 80, 0.3);
  }
  50% {
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2), 0 0 16px rgba(240, 200, 80, 0.6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cb-ring-spin,
  .cb-ring-spin-rev,
  .cb-boss {
    animation: none;
  }
}
</style>
