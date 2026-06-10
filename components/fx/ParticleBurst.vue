<template>
  <div ref="root" class="particle-burst pointer-events-none" aria-hidden="true">
    <span
      v-for="s in shards"
      :key="s.id"
      ref="shardEls"
      class="pb-shard"
      :style="s.style"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

/**
 * One-shot radial particle burst (golden shards by default). Fires on mount
 * with GSAP, then can repeat on an interval. Used for the victory celebration;
 * reusable anywhere a triumphant pop of particles is wanted.
 */
const props = withDefaults(
  defineProps<{
    /** Number of shards per burst. */
    count?: number
    /** Shard fill colours, cycled across the burst. */
    colors?: string[]
    /** How far (px) shards travel outward. */
    spread?: number
    /** Repeat the burst every N ms (0 = fire once on mount). */
    repeatEvery?: number
  }>(),
  {
    count: 28,
    colors: () => ['#ffe9a8', '#f0c850', '#d8a830', '#fff6dc'],
    spread: 260,
    repeatEvery: 0,
  }
)

interface Shard {
  id: number
  style: Record<string, string>
}

const root = ref<HTMLElement | null>(null)
const shardEls = ref<HTMLElement[]>([])
const shards = ref<Shard[]>([])

let ctx: gsap.Context | null = null
let timer: ReturnType<typeof setInterval> | null = null
let reduced = false

function buildShards(): void {
  shards.value = Array.from({ length: props.count }, (_, id) => {
    const size = 5 + Math.random() * 8
    return {
      id,
      style: {
        background: props.colors[id % props.colors.length],
        width: `${size}px`,
        height: `${size * (0.5 + Math.random())}px`,
      },
    }
  })
}

/** Animate every shard outward along a random radial vector, then fade. */
function fire(): void {
  if (reduced || !shardEls.value.length) return
  ctx?.add(() => {
    shardEls.value.forEach((el) => {
      const angle = Math.random() * Math.PI * 2
      const dist = props.spread * (0.4 + Math.random() * 0.8)
      gsap.set(el, { x: 0, y: 0, scale: 0, opacity: 1, rotation: Math.random() * 360 })
      gsap
        .timeline()
        .to(el, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40, // slight upward bias
          scale: 0.6 + Math.random() * 0.9,
          rotation: `+=${Math.random() * 420 - 210}`,
          duration: 0.9 + Math.random() * 0.7,
          ease: 'power3.out',
        })
        .to(el, { opacity: 0, y: '+=70', duration: 0.6, ease: 'power1.in' }, '-=0.45')
    })
  })
}

onMounted(() => {
  reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  buildShards()
  if (reduced) return
  ctx = gsap.context(() => {}, root.value!)
  // Defer one frame so refs are populated, then fire.
  requestAnimationFrame(() => {
    fire()
    if (props.repeatEvery > 0) {
      timer = setInterval(fire, props.repeatEvery)
    }
  })
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  ctx?.revert()
})
</script>

<style scoped>
.particle-burst {
  position: absolute;
  left: 50%;
  top: 38%;
  width: 0;
  height: 0;
  z-index: 5;
}
.pb-shard {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 2px;
  opacity: 0;
  box-shadow: 0 0 8px rgba(240, 200, 80, 0.7);
  will-change: transform, opacity;
}
</style>
