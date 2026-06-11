<template>
  <div
    class="hero-root relative select-none"
    :class="[
      small ? 'w-[110px] h-[110px]' : 'w-[136px] h-[136px]',
      {
        'cursor-pointer': targetable || canAttack,
        'hero-target': targetable,
        'hero-attacker': canAttack,
        'hero-selected': selected
      }
    ]"
    @click="$emit('select')"
  >
    <!-- Equipped weapon (badge left of the portrait). Shows ⚔ + durability only:
         the weapon's attack already appears in the hero attack gem, and the old
         duplicate collided with it at the portrait's bottom-left corner. -->
    <div
      v-if="weapon"
      class="weapon-badge"
      :title="`Weapon — ${weapon.attack} Attack, ${weapon.durability} Durability`"
    >
      <span class="weapon-icon" aria-hidden="true">⚔</span>
      <span class="weapon-dur-gem">{{ weapon.durability }}</span>
    </div>

    <!-- Generous invisible hit area while this hero is a legal target — the
         visible disc alone is a fiddly click/drop target. -->
    <div v-if="targetable" class="hit-pad" aria-hidden="true" />

    <!-- Portrait ring -->
    <div class="hero-ring" :class="{ 'attack-ready': canAttack }">
      <div class="hero-disc" :style="portraitStyle">
        <img
          v-if="hero.art"
          :src="hero.art"
          :alt="hero.name"
          class="w-full h-full object-cover"
          draggable="false"
        />
        <span
          v-else
          class="font-engrave font-bold text-gold-light text-center px-1 leading-tight"
          :class="small ? 'text-xs' : 'text-sm'"
          style="text-shadow: 0 2px 6px rgba(0,0,0,0.8)"
          >{{ hero.name }}</span
        >
      </div>
      <!-- attackable target glow -->
      <div v-if="targetable" class="target-ring" aria-hidden="true" />
    </div>

    <!-- Hero attack value (this turn) bottom-left -->
    <div
      v-if="hero.attack > 0"
      class="stat-gem stat-gem-attack hero-attack-gem"
      :class="small ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'"
    >
      {{ hero.attack }}
    </div>

    <!-- Armor shield (top-right) if any -->
    <div v-if="hero.armor > 0" class="armor-gem">
      <span>{{ hero.armor }}</span>
    </div>

    <!-- Health gem (bottom-right) -->
    <div
      class="health-gem"
      :class="[small ? 'w-9 h-9 text-base' : 'w-11 h-11 text-lg', { 'low-health': hero.health <= 10 }]"
    >
      {{ hero.health }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardClass, HeroState, WeaponInstance } from '~/game/types'

/** A hero portrait with health, armor, weapon and attack indicators. */
const props = withDefaults(
  defineProps<{
    hero: HeroState
    weapon?: WeaponInstance | null
    /** Legal attack target (enemy hero) — show red glow. */
    targetable?: boolean
    /** Hero can attack (has weapon/attack and attacks left) — show ready glow. */
    canAttack?: boolean
    /** Selected as the current attacker — show a stronger ring. */
    selected?: boolean
    small?: boolean
  }>(),
  { weapon: null, targetable: false, canAttack: false, selected: false, small: false }
)

defineEmits<{ (e: 'select'): void }>()

const CLASS_GRADIENT: Record<CardClass, [string, string]> = {
  neutral: ['#8b7355', '#3a2c1d'],
  druid: ['#6b8f3a', '#26410f'],
  hunter: ['#3f7a2e', '#16310d'],
  mage: ['#3f7fd6', '#11335f'],
  paladin: ['#d6b23f', '#6b5410'],
  priest: ['#e8e4d8', '#8b8674'],
  rogue: ['#5a5f66', '#1d2024'],
  shaman: ['#2f5fd6', '#11275f'],
  warlock: ['#8a3fd6', '#3a115f'],
  warrior: ['#b3402a', '#5a1810'],
}

const portraitStyle = computed(() => {
  const g = CLASS_GRADIENT[props.hero.cardClass] ?? CLASS_GRADIENT.neutral
  return { background: `radial-gradient(120% 120% at 35% 22%, ${g[0]} 0%, ${g[1]} 100%)` }
})
</script>

<style scoped>
.hero-root {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, filter 0.15s ease;
}

/* Invisible padded hit zone (rendered only while targetable): clicks and drag
   releases that land just beside the portrait still count as the hero. */
.hit-pad {
  position: absolute;
  inset: -24px;
  border-radius: 38px;
}

.hero-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(180deg, #f6da86 0%, #b8841f 50%, #5e420a 100%);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.6),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.6);
  position: relative;
}
.hero-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #4a3209;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6);
}

/* Hero is ready to attack */
.attack-ready {
  box-shadow:
    0 0 16px 4px rgba(110, 255, 110, 0.6),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5);
}

/* Targetable enemy hero */
.target-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  box-shadow: 0 0 18px 6px rgba(255, 80, 80, 0.85);
  animation: heroTargetPulse 1s ease-in-out infinite;
  pointer-events: none;
}
@keyframes heroTargetPulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}
.hero-attacker:hover,
.hero-target:hover {
  transform: scale(1.06);
}
/* Cursor actually on the hero target: faster, brighter pulse — "release here". */
.hero-target:hover .target-ring {
  animation-duration: 0.5s;
  box-shadow: 0 0 26px 10px rgba(255, 80, 80, 1);
}

/* Selected as the current attacker — strong golden ring. */
.hero-selected .hero-ring {
  box-shadow:
    0 0 22px 6px rgba(240, 200, 80, 0.85),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5);
}
.hero-selected {
  transform: scale(1.05);
}

/* Health gem (red drop) */
.health-gem {
  position: absolute;
  bottom: -4px;
  right: -6px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
  background: radial-gradient(circle at 34% 28%, #ff9b8c 0%, #e2503a 30%, #b32414 65%, #6d0f06 100%);
  border: 2px solid #5e0d05;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.55),
    inset 0 -4px 8px rgba(0, 0, 0, 0.5),
    0 2px 5px rgba(0, 0, 0, 0.6);
}
.low-health {
  animation: lowHp 1.1s ease-in-out infinite;
}
@keyframes lowHp {
  0%,
  100% {
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.55),
      0 0 6px 2px rgba(255, 60, 50, 0.6);
  }
  50% {
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.55),
      0 0 16px 6px rgba(255, 60, 50, 0.95);
  }
}

/* Armor (slate shield) top-right */
.armor-gem {
  position: absolute;
  top: -2px;
  right: -4px;
  z-index: 21;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 12px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.95);
  background: radial-gradient(circle at 34% 28%, #cfe0ff 0%, #7c93b8 35%, #3a4a6b 70%, #1a2336 100%);
  border: 2px solid #1a2336;
  clip-path: polygon(50% 0, 100% 22%, 100% 70%, 50% 100%, 0 70%, 0 22%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.6);
}

/* Hero attack (weapon / buff) bottom-left */
.hero-attack-gem {
  position: absolute;
  bottom: -4px;
  left: -6px;
  z-index: 20;
}

/* Equipped weapon badge (left of the hero portrait) */
.weapon-badge {
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 25;
  width: 46px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px 5px 12px 5px;
  background: linear-gradient(180deg, #d4d7df 0%, #9498a2 45%, #4a4e58 100%);
  border: 2px solid #23262e;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.65),
    inset 0 -3px 6px rgba(0, 0, 0, 0.5),
    0 3px 9px rgba(0, 0, 0, 0.7);
}
.weapon-icon {
  font-size: 22px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.85)) saturate(0.9);
}
.weapon-dur-gem {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 13px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.7);
  color: #fff;
  background: radial-gradient(circle at 34% 28%, #cfeecf 0%, #5aa06a 42%, #2f6b3a 100%);
  border: 2px solid #1d3a22;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
</style>
