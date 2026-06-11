<template>
  <div class="hand-root" :style="{ height: small ? '156px' : '176px' }">
    <div class="hand-fan">
      <div
        v-for="(card, i) in cards"
        :key="card.instanceId"
        :ref="(elm) => registerEl(card.instanceId, elm as Element | null)"
        class="hand-slot"
        :class="{ 'is-playable': playableIds.includes(card.instanceId), 'is-selected': selectedId === card.instanceId }"
        :style="slotStyle(i)"
        @click="$emit('select', card.instanceId)"
        @pointerdown="$emit('pointerdownCard', card.instanceId, $event)"
        @mouseenter="onSlotEnter(i, card)"
        @mouseleave="onSlotLeave()"
      >
        <div class="card-holder" :style="holderStyle(i)">
          <CardView
            :card="defFor(card)"
            :playable="playableIds.includes(card.instanceId)"
            :small="small"
            :display-cost="costFor(card)"
            :spell-damage="spellDamage"
            no-hover
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CardDef, CardInstance } from '~/game/types'
import { getCard, hasCard } from '~/game/index'

/**
 * The player's hand, fanned with an arc + rotation, lifting the hovered card.
 * Emits `select` with the card instance id on click. Exposes `elFor` so the
 * board can grab a card's DOM node for play animations.
 */
const props = withDefaults(
  defineProps<{
    /** Hand card instances (left → right). */
    cards: CardInstance[]
    /** Instance ids currently playable (golden glow). */
    playableIds?: string[]
    /** The currently selected card (awaiting a target). */
    selectedId?: string | null
    /** Live cost per instance id (aura/reduction adjusted). */
    liveCosts?: Record<string, number>
    /** Owner's current Spell Damage bonus (spell text numbers render boosted). */
    spellDamage?: number
    small?: boolean
  }>(),
  { playableIds: () => [], selectedId: null, liveCosts: () => ({}), spellDamage: 0, small: false }
)

defineEmits<{
  (e: 'select', instanceId: string): void
  (e: 'pointerdownCard', instanceId: string, ev: PointerEvent): void
}>()

const hoverIndex = ref(-1)
const els = new Map<string, HTMLElement>()
const preview = useCardPreview()

/** Hover a slot: lift it and surface the big, viewport-clamped preview overlay
 *  (carrying the owner's Spell Damage so the preview shows the same boost). */
function onSlotEnter(i: number, inst: CardInstance): void {
  hoverIndex.value = i
  preview.show(defFor(inst), els.get(inst.instanceId) ?? null, props.spellDamage)
}
function onSlotLeave(): void {
  hoverIndex.value = -1
  preview.hide()
}

/** Register / unregister a card's DOM node by instance id. */
function registerEl(id: string, elm: Element | null): void {
  if (elm) els.set(id, elm as HTMLElement)
  else els.delete(id)
}

/**
 * Expose a card's element to the parent (board) for animations — the inner
 * holder, so play ghosts and the targeting arrow track the lifted visual
 * rather than the resting slot.
 */
function elFor(id: string): HTMLElement | undefined {
  const slot = els.get(id)
  if (!slot) return undefined
  return slot.querySelector<HTMLElement>('.card-holder') ?? slot
}
defineExpose({ elFor })

/** Card definition for an instance (tolerates unknown ids). */
function defFor(inst: CardInstance): CardDef {
  return hasCard(inst.cardId)
    ? getCard(inst.cardId)
    : ({ id: inst.cardId, name: '?', cost: inst.cost, type: 'spell', cardClass: 'neutral', rarity: 'common', text: '' } as CardDef)
}

/** Live cost for an instance, falling back to base. */
function costFor(inst: CardInstance): number {
  return props.liveCosts[inst.instanceId] ?? inst.cost
}

const count = computed(() => props.cards.length)

/** Shared fan geometry for slot i: spread, rotation, arc and base scale. */
function fanGeometry(i: number): { offset: number; spacing: number; rot: number; arc: number; tuck: number; scale: number } {
  const n = count.value
  const center = (n - 1) / 2
  const offset = i - center
  // Per-card horizontal spacing shrinks as the hand grows.
  const spacing = Math.min(props.small ? 96 : 110, (props.small ? 760 : 1080) / Math.max(1, n))
  const rotStep = n > 1 ? Math.min(5, 26 / n) : 0
  const rot = offset * rotStep
  // Arc: cards toward the edges sit slightly lower (capped so edge cards never
  // drop below the viewport). A small base lift keeps the whole fan in view.
  const arc = Math.min(props.small ? 8 : 12, Math.abs(offset) * (props.small ? 4 : 8))

  // HS-style tuck: resting full-size cards sit low (their bottom rides off the
  // board edge) so the hero portrait + health gem above stay fully visible.
  const tuck = props.small ? 0 : 56

  // Full cards render at 0.84 (≈168px visual, fully readable); the small tier
  // shrinks a little harder for short viewports.
  const scale = props.small ? 0.88 : 0.84
  return { offset, spacing, rot, arc, tuck, scale }
}

/**
 * Fan placement for the slot: resting x/y/rotation/scale plus neighbour
 * nudges and z-order only. The hover/selected lift lives on the inner
 * `.card-holder` (holderStyle) so the slot's hover/click hitbox stays put at
 * the resting position while the visual pops up — the cursor can't fall out
 * of the card mid-lift, and clicks on the resting footprint always land.
 */
function slotStyle(i: number): Record<string, string> {
  const { offset, spacing, rot, arc, tuck, scale } = fanGeometry(i)

  let x = offset * spacing
  let z = 10 + i

  if (props.selectedId === props.cards[i]?.instanceId) {
    z = 80
  } else if (hoverIndex.value === i) {
    z = 90
  } else if (hoverIndex.value >= 0) {
    // Nudge neighbours away from the hovered card.
    const dir = i < hoverIndex.value ? -1 : 1
    const dist = Math.abs(i - hoverIndex.value)
    if (dist <= 2) x += dir * (props.small ? 18 : 30) * (1 / dist)
  }

  return {
    transform: `translateX(${x}px) translateY(${arc + tuck}px) rotate(${rot}deg) scale(${scale})`,
    zIndex: String(z),
  }
}

/**
 * Hover/selected pop on the inner holder. Composed inside the slot's
 * transform, so: the leading counter-rotation cancels the slot's fan tilt
 * (straightening the card and making the translate that follows lift straight
 * up in screen space), and lift/scale are divided by the slot's base scale so
 * the final screen position and size match the pre-split values exactly.
 */
function holderStyle(i: number): Record<string, string> {
  const { rot, tuck, scale } = fanGeometry(i)

  let lift = 0
  let targetScale = scale
  if (props.selectedId === props.cards[i]?.instanceId) {
    // Armed (selected / being drag-played): hold the card visibly raised and
    // straightened so it can't be mistaken for a resting card.
    lift = props.small ? 30 : tuck + 40
    targetScale = props.small ? 0.95 : 0.9
  } else if (hoverIndex.value === i) {
    // Pop the hovered card up to full size + straighten it — readable in place.
    // The viewport-clamped <CardPreview> overlay still covers edge cases.
    lift = props.small ? 54 : tuck + 74
    targetScale = props.small ? 1.12 : 1.0
  } else {
    return { transform: 'rotate(0deg) translateY(0px) scale(1)' }
  }

  return {
    transform: `rotate(${-rot}deg) translateY(${-lift / scale}px) scale(${targetScale / scale})`,
  }
}
</script>

<style scoped>
.hand-root {
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.hand-fan {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.hand-slot {
  position: absolute;
  bottom: 0;
  transform-origin: bottom center;
  /* Slot transition covers the neighbour-nudge x shifts; the hover lift
     transitions on .card-holder so the hitbox here never animates away. */
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
  cursor: pointer;
  will-change: transform;
}
.card-holder {
  position: relative;
  transform-origin: bottom center;
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.3, 1);
  will-change: transform;
}

/* Selected (awaiting target): persistent lift + ring */
.hand-slot.is-selected {
  filter: drop-shadow(0 0 16px rgba(240, 200, 80, 0.9));
}

/* (Live cost now renders inside CardView's own mana gem via :display-cost.) */
</style>
