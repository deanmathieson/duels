<template>
  <Tooltip :text="tooltipText" placement="top">
    <div
      class="hp-root relative select-none"
      :class="[
        small ? 'w-[58px] h-[58px]' : 'w-[68px] h-[68px]',
        { 'hp-usable': usable, 'hp-spent': used, 'cursor-pointer': usable }
      ]"
      @click="onClick"
    >
      <div class="hp-ring">
        <div class="hp-disc" :style="discStyle">
          <img
            v-if="def?.art"
            :src="def.art"
            :alt="def?.name"
            class="w-full h-full object-cover"
            draggable="false"
          />
          <span v-else class="font-engrave font-bold text-gold-light text-[10px] text-center px-0.5 leading-none">
            {{ def?.name }}
          </span>
        </div>
      </div>

      <!-- Used indicator -->
      <div v-if="used" class="hp-used-x" aria-hidden="true">✦</div>

      <!-- Cost gem -->
      <div class="mana-gem hp-cost" :class="small ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'">
        {{ def?.cost ?? cost }}
      </div>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getHeroPower } from '~/game/index'
import type { HeroPowerDef } from '~/game/types'

/** A hero power button: lit when usable, dimmed once spent this turn. */
const props = withDefaults(
  defineProps<{
    /** Hero power id to render. */
    powerId: string
    /** Fallback cost if the def lookup fails. */
    cost?: number
    /** Whether the human may use it right now (turn + mana + not used). */
    usable?: boolean
    /** Already used this turn. */
    used?: boolean
    small?: boolean
  }>(),
  { cost: 2, usable: false, used: false, small: false }
)

const emit = defineEmits<{ (e: 'use'): void }>()

/** Resolve the hero power definition; tolerate unknown ids. */
const def = computed<HeroPowerDef | undefined>(() => {
  try {
    return getHeroPower(props.powerId)
  } catch {
    return undefined
  }
})

const tooltipText = computed(() => {
  if (!def.value) return ''
  return `${def.value.name} (${def.value.cost}) — ${def.value.text}`
})

const discStyle = computed(() => ({
  background: 'radial-gradient(120% 120% at 35% 25%, #7a4fb0 0%, #2a1240 100%)',
}))

function onClick(): void {
  if (props.usable && !props.used) emit('use')
}
</script>

<style scoped>
.hp-root {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, filter 0.15s ease;
}
.hp-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(180deg, #f6da86 0%, #b8841f 50%, #5e420a 100%);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.55),
    inset 0 -2px 5px rgba(0, 0, 0, 0.5),
    0 3px 8px rgba(0, 0, 0, 0.55);
}
.hp-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #4a3209;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6);
}

/* Usable: green pulse glow + lift on hover */
.hp-usable .hp-ring {
  box-shadow:
    0 0 14px 4px rgba(110, 255, 110, 0.6),
    inset 0 -2px 5px rgba(0, 0, 0, 0.5);
  animation: hpPulse 1.8s ease-in-out infinite;
}
.hp-usable:hover {
  transform: translateY(-2px) scale(1.06);
}
@keyframes hpPulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.18);
  }
}

/* Spent: greyed out */
.hp-spent {
  filter: grayscale(0.8) brightness(0.6);
}
.hp-used-x {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 0 1px 3px #000;
  pointer-events: none;
}

.hp-cost {
  position: absolute;
  top: -3px;
  right: -3px;
  z-index: 10;
}
</style>
