<template>
  <div class="combat-log font-body" :class="{ collapsed }">
    <button class="log-toggle font-engrave" @click="collapsed = !collapsed">
      <span>Combat Log</span>
      <span class="log-chevron">{{ collapsed ? '▸' : '▾' }}</span>
    </button>
    <div v-show="!collapsed" ref="scroller" class="log-scroll">
      <p v-if="lines.length === 0" class="log-empty">The battle begins…</p>
      <p v-for="line in lines" :key="line.id" class="log-line" :class="`log-${line.kind}`">
        {{ line.text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

/** A scrolling combat log of cards played, attacks, damage, heals and deaths. */
const store = useGameStore()
const collapsed = ref(false)
const scroller = ref<HTMLElement | null>(null)
const lines = computed(() => store.logLines)

/** Auto-scroll to the newest entry. */
watch(
  () => store.logLines.length,
  async () => {
    await nextTick()
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  }
)
</script>

<style scoped>
.combat-log {
  position: absolute;
  top: 60px;
  right: 8px;
  z-index: 45;
  width: 200px;
  border: 1px solid #6b4a16;
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(42, 28, 16, 0.92), rgba(20, 14, 8, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 245, 210, 0.08), 0 8px 20px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  overflow: hidden;
}
.combat-log.collapsed {
  width: 120px;
}

.log-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 9px;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #ffe9a8;
  background: linear-gradient(180deg, #4d3620, #2a1c10);
  border: none;
  border-bottom: 1px solid #6b4a16;
  cursor: pointer;
}
.log-chevron {
  color: #d8a830;
}

.log-scroll {
  max-height: 40vh;
  overflow-y: auto;
  padding: 6px 9px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.log-empty {
  font-size: 10px;
  color: rgba(243, 233, 210, 0.35);
  font-style: italic;
}
.log-line {
  font-size: 10.5px;
  line-height: 1.3;
  color: rgba(243, 233, 210, 0.82);
}
/* per-kind tints */
.log-turn {
  margin: 3px 0;
  text-align: center;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: #f0c850;
  border-top: 1px solid rgba(240, 200, 80, 0.2);
  padding-top: 3px;
}
.log-you {
  color: #cfe0a0;
}
.log-foe {
  color: #e0b0a0;
}
.log-damage {
  color: #e2705a;
}
.log-heal {
  color: #88d29a;
}
.log-death {
  color: rgba(243, 233, 210, 0.5);
  font-style: italic;
}
.log-attack {
  color: #d8c8a0;
}
</style>
