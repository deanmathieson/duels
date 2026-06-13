<template>
  <div
    ref="boardRoot"
    class="board-root"
    :class="{ compact }"
    @mousemove="onMouseMove"
    @click="onBoardClick"
    @contextmenu.prevent="cancelSelection"
  >
    <!-- Combat log overlay -->
    <CombatLog />

    <!-- ====================== ENEMY ZONE ====================== -->
    <!-- While aiming with the enemy hero as a legal target, the WHOLE strip is
         face territory: releasing/clicking anywhere in it targets the hero. -->
    <section class="zone enemy-zone" :class="{ 'face-zone': faceZoneActive }">
      <!-- Enemy hand (face-down, fanned) + draw pile -->
      <div class="enemy-hand">
        <div
          v-for="i in enemyHandCount"
          :key="i"
          class="enemy-card"
          :style="enemyCardStyle(i - 1, enemyHandCount)"
        >
          <CardBack small />
        </div>
      </div>

      <!-- Enemy hero row: power | portrait | mana + deck -->
      <div class="hero-row">
        <div class="side-col left">
          <ManaTray v-if="enemy" :current="enemy.mana.current" :max="enemy.mana.max" compact />
        </div>

        <div class="hero-center">
          <HeroPower
            v-if="enemy"
            :power-id="enemy.heroPower.id"
            :cost="enemy.heroPower.cost"
            :usable="false"
            :used="enemy.heroPower.usedThisTurn"
            small
          />
          <div
            :ref="(e) => registerEl(HERO_TARGET(1), e as Element | null)"
            :data-entity-id="HERO_TARGET(1)"
          >
            <HeroPortrait
              v-if="enemy"
              :hero="enemy.hero"
              :weapon="enemy.weapon"
              :targetable="isTargetable(HERO_TARGET(1))"
              :small="compact"
              @select="onEntityClick(HERO_TARGET(1))"
            />
          </div>
        </div>

        <div class="side-col right">
          <div class="deck-pile">
            <div class="deck-scale"><CardBack small /></div>
            <span class="deck-count font-engrave"><span>{{ enemy?.deck.length ?? 0 }}</span></span>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================== BATTLEFIELD ====================== -->
    <section class="battlefield">
      <!-- Enemy minion row -->
      <div class="minion-row enemy-minions">
        <TransitionGroup name="minion-pop">
          <div
            v-for="m in enemyBoard"
            :key="m.instanceId"
            :ref="(e) => registerEl(m.instanceId, e as Element | null)"
            :data-entity-id="m.instanceId"
          >
            <Minion
              :minion="m"
              :targetable="isTargetable(m.instanceId)"
              :small="compact"
              @select="onEntityClick(m.instanceId)"
            />
          </div>
        </TransitionGroup>
        <div v-if="enemyBoard.length === 0" class="empty-row-hint">— enemy board —</div>
      </div>

      <!-- Center divider / phase readout -->
      <div class="center-line">
        <div class="line-rule" />
        <div class="turn-pill font-engrave" :class="{ yours: isHumanTurn, busy: store.busy }">
          {{ phaseLabel }}
        </div>
        <div class="line-rule" />
      </div>

      <!-- Friendly minion row -->
      <div class="minion-row friendly-minions">
        <TransitionGroup name="minion-pop">
          <div
            v-for="m in friendlyBoard"
            :key="m.instanceId"
            :ref="(e) => registerEl(m.instanceId, e as Element | null)"
            :data-entity-id="m.instanceId"
            @pointerdown="onAttackerPointerDown(m.instanceId, $event)"
          >
            <Minion
              :minion="m"
              :can-attack="attackerIds.includes(m.instanceId)"
              :targetable="isTargetable(m.instanceId)"
              :selected="selectedAttackerId === m.instanceId"
              :sleeping="isSleeping(m)"
              :small="compact"
              @select="onFriendlyMinionClick(m.instanceId)"
            />
          </div>
        </TransitionGroup>
        <div v-if="friendlyBoard.length === 0" class="empty-row-hint">— play minions here —</div>
      </div>
    </section>

    <!-- ====================== PLAYER ZONE ====================== -->
    <section class="zone player-zone">
      <div class="hero-row">
        <div class="side-col left">
          <div class="deck-pile">
            <div class="deck-scale"><CardBack small /></div>
            <span class="deck-count font-engrave"><span>{{ human?.deck.length ?? 0 }}</span></span>
          </div>
        </div>

        <div class="hero-center">
          <div :ref="(e) => registerEl('heroPower:0', e as Element | null)">
            <HeroPower
              v-if="human"
              :power-id="human.heroPower.id"
              :cost="human.heroPower.cost"
              :usable="heroPowerUsable"
              :used="human.heroPower.usedThisTurn"
              :small="compact"
              @use="onHeroPowerClick"
            />
          </div>
          <div
            :ref="(e) => registerEl(HERO_TARGET(0), e as Element | null)"
            :data-entity-id="HERO_TARGET(0)"
            @pointerdown="onAttackerPointerDown(HERO_TARGET(0), $event)"
          >
            <HeroPortrait
              v-if="human"
              :hero="human.hero"
              :weapon="human.weapon"
              :can-attack="attackerIds.includes(HERO_TARGET(0))"
              :selected="selectedAttackerId === HERO_TARGET(0)"
              :targetable="isTargetable(HERO_TARGET(0))"
              :small="compact"
              @select="onFriendlyHeroClick()"
            />
          </div>
          <ManaTray v-if="human" :current="human.mana.current" :max="human.mana.max" />
        </div>

        <div class="side-col right">
          <EndTurnButton
            :is-human-turn="isHumanTurn"
            :busy="store.busy"
            :no-plays="noPlaysLeft"
            @end="onEndTurn"
          />
        </div>
      </div>

      <!-- Player hand: full-size cards (HS-style, the fan rides over the hero
           row); drops to the small tier on short viewports. -->
      <PlayerHand
        ref="handRef"
        :small="compact"
        :cards="human?.hand ?? []"
        :playable-ids="playableInstanceIds"
        :selected-id="selectedCardId ?? dragPlayCardId"
        :live-costs="liveCostMap"
        :spell-damage="store.humanSpellDamage"
        @select="onHandCardClick"
        @pointerdown-card="onHandPointerDown"
      />
    </section>

    <!-- ====================== OVERLAYS ====================== -->
    <!-- Targeting arrow -->
    <TargetingArrow v-if="arrowFrom && arrowTo" :from="arrowFrom" :to="arrowTo" />

    <!-- Choose One (from a selected card / hero power, before it is played) -->
    <ChoiceOverlay
      v-if="chooseOne"
      mode="chooseOne"
      :options="chooseOne.options"
      :title="chooseOne.title"
      hint="Pick an option"
      @pick="onChooseOnePick"
      @dismiss="cancelSelection"
      :dismissible="true"
    />

    <!-- Engine pending choice owned by the human (discover / chooseOne) -->
    <ChoiceOverlay
      v-if="enginePendingChoice"
      :mode="enginePendingChoice.type === 'discover' ? 'discover' : 'chooseOne'"
      :options="enginePendingChoice.options"
      :title="enginePendingChoice.type === 'discover' ? 'Discover a card' : 'Choose One'"
      :hint="enginePendingChoice.type === 'discover' ? 'Add one to your hand' : 'Pick an option'"
      @pick="onEnginePick"
    />

    <!-- Floating combat numbers -->
    <DamageSplash
      v-for="s in splashes"
      :key="s.id"
      :amount="s.amount"
      :kind="s.kind"
      :x="s.x"
      :y="s.y"
      @done="removeSplash(s.id)"
    />

    <!-- Turn banners -->
    <TurnBanner kind="you" :trigger="yourTurnTrigger" />
    <TurnBanner kind="enemy" :trigger="enemyTurnTrigger" />

    <!-- Opening-hand mulligan (covers the board until the player confirms) -->
    <MulliganScreen v-if="store.phase === 'mulligan'" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { getCard, getHeroPower, hasCard } from '~/game/index'
import type { ChooseOneOption, GameEvent, MinionInstance } from '~/game/types'
import { CLASS_COLOR } from '~/data/terms'
import { useAnimations } from '~/composables/useAnimations'
import { useAudio } from '~/composables/useAudio'

/**
 * GameBoard — the playable battlefield.
 *
 * External surface:
 *  - props: none (reads the auto-imported `useGameStore`).
 *  - emits: `matchEnded` (winner: PlayerId | 'draw') when the engine reports
 *    gameOver. The run page should also watch `store.phase` / `store.winner`.
 *
 * The board is fully driven by `useGameStore`. It runs GSAP animations off the
 * store's emitted engine events (watched via `store.eventTick`).
 */
const emit = defineEmits<{ (e: 'matchEnded', winner: 0 | 1 | 'draw'): void }>()

const store = useGameStore()
const anim = useAnimations()
const audio = useAudio()
const preview = useCardPreview()

const HERO_TARGET = store.HERO_TARGET

/** True when a target id refers to a hero portrait (vs a minion). */
function isHeroTarget(id: string): boolean {
  return id.startsWith('hero:')
}

/** The calling-colour FX tint for a card id (falls back to neutral). */
function tintForCard(cardId: string): { light: string; glow: string } {
  const c = (hasCard(cardId) ? CLASS_COLOR[getCard(cardId).cardClass] : null) ?? CLASS_COLOR.neutral
  return { light: c.light, glow: c.glow }
}

/** The FX tint for a board/just-died minion instance (resolves its card id by
 *  searching both players' board + graveyard, since a death event only carries
 *  the instance id). Falls back to neutral if the instance can't be found. */
function tintForInstance(instanceId: string): { light: string; glow: string } {
  for (const p of [store.human, store.enemy]) {
    const m =
      p?.board.find((x) => x.instanceId === instanceId) ??
      p?.graveyard?.find((x) => x.instanceId === instanceId)
    if (m) return tintForCard(m.cardId)
  }
  return tintForCard('')
}

/* --------------------------------------------------------------------------
 * Store-derived view state
 * ----------------------------------------------------------------------- */
const human = computed(() => store.human)
const enemy = computed(() => store.enemy)
const isHumanTurn = computed(() => store.isHumanTurn)
const friendlyBoard = computed(() => human.value?.board ?? [])
const enemyBoard = computed(() => enemy.value?.board ?? [])
const enemyHandCount = computed(() => enemy.value?.hand.length ?? 0)
const playableInstanceIds = computed(() => store.playableInstanceIds)
const attackerIds = computed(() => store.attackerIds)
const enginePendingChoice = computed(() =>
  store.pendingChoice && store.pendingChoice.player === 0 ? store.pendingChoice : null
)

const phaseLabel = computed(() => {
  if (store.phase === 'gameOver') return 'Game Over'
  if (store.busy) return 'Enemy Turn'
  if (isHumanTurn.value) return 'Your Turn'
  return 'Enemy Turn'
})

/** Live-cost map for the hand (instanceId -> cost). */
const liveCostMap = computed<Record<string, number>>(() => {
  const out: Record<string, number> = {}
  for (const c of human.value?.hand ?? []) out[c.instanceId] = store.liveCost(c)
  return out
})

/** Hero power usable: human turn, not used, enough mana. */
const heroPowerUsable = computed(() => {
  if (!isHumanTurn.value || !human.value) return false
  const hp = human.value.heroPower
  return !hp.usedThisTurn && human.value.mana.current >= hp.cost
})

/** True when the player has no plays AND no attacks AND can't hero-power. */
const noPlaysLeft = computed(
  () =>
    isHumanTurn.value &&
    playableInstanceIds.value.length === 0 &&
    attackerIds.value.length === 0 &&
    !heroPowerUsable.value
)

/** A friendly minion is "sleeping" if it can't act and isn't otherwise busy. */
function isSleeping(m: MinionInstance): boolean {
  return m.summonedThisTurn && !attackerIds.value.includes(m.instanceId)
}

/* --------------------------------------------------------------------------
 * Element registry (entity id -> DOM node) for animations + arrow anchoring
 * ----------------------------------------------------------------------- */
const elMap = new Map<string, HTMLElement>()
function registerEl(id: string, el: Element | null): void {
  if (el) elMap.set(id, el as HTMLElement)
  else elMap.delete(id)
}
function nodeFor(id: string): HTMLElement | undefined {
  return elMap.get(id)
}

const boardRoot = ref<HTMLElement | null>(null)
const handRef = ref<{ elFor: (id: string) => HTMLElement | undefined } | null>(null)

/* --------------------------------------------------------------------------
 * Compact tier: on short viewports every board element drops to its existing
 * `small` variant (and `.compact` CSS shrinks the layout rows).
 * ----------------------------------------------------------------------- */
const compactQuery =
  typeof window !== 'undefined' ? window.matchMedia('(max-height: 919px)') : null
const compact = ref(compactQuery?.matches ?? false)
function onCompactChange(e: MediaQueryListEvent): void {
  compact.value = e.matches
}
compactQuery?.addEventListener('change', onCompactChange)

/* --------------------------------------------------------------------------
 * Selection / targeting state machine
 * ----------------------------------------------------------------------- */
/** A hand card selected and awaiting a target. */
const selectedCardId = ref<string | null>(null)
/** A friendly minion selected as an attacker. */
const selectedAttackerId = ref<string | null>(null)
/** Hero power selected, awaiting target. */
const heroPowerArmed = ref(false)
/** A pre-chosen chooseOne index for the pending play. */
const pendingChooseOneIndex = ref<number | undefined>(undefined)
/** Whether the armed action is a hero power (vs a card). */
const armedIsHeroPower = ref(false)

/** Legal target ids for the current selection. */
const currentTargets = ref<string[]>([])

/** Choose-One overlay descriptor (for card / hero power, before play). */
const chooseOne = ref<{
  title: string
  options: { index: number; text: string }[]
  /** What to do once an option is picked. */
  kind: 'card' | 'heroPower'
  sourceId?: string
} | null>(null)

/** Whether we're currently aiming at something (arrow visible). */
const isTargeting = computed(
  () => selectedCardId.value !== null || selectedAttackerId.value !== null || heroPowerArmed.value
)

// While aiming, the big hover preview would cover the battlefield — switch the
// global preview off for the duration (it clears any open one on engage).
watch(isTargeting, (v) => preview.setSuppressed(v))

function isTargetable(id: string): boolean {
  return isTargeting.value && currentTargets.value.includes(id)
}

/** Face is a legal target right now — the whole enemy strip accepts the hit. */
const faceZoneActive = computed(
  () => isTargeting.value && currentTargets.value.includes(HERO_TARGET(1))
)

/**
 * Forgiving drop/click target resolution:
 *  1. An exact hit on an entity is authoritative — legal commits, illegal
 *     cancels (no snapping someone's deliberate click onto a neighbour).
 *  2. Anywhere in the enemy zone counts as the enemy hero when face is legal.
 *  3. Otherwise snap to the nearest legal target within SNAP_RADIUS px.
 */
const SNAP_RADIUS = 110
function resolveDropTarget(x: number, y: number): string | null {
  const under = document.elementFromPoint(x, y)
  const entityEl = under?.closest?.('[data-entity-id]') as HTMLElement | null
  const exact = entityEl?.dataset.entityId ?? null
  if (exact) return currentTargets.value.includes(exact) ? exact : null
  if (faceZoneActive.value && under?.closest?.('.enemy-zone')) return HERO_TARGET(1)
  let best: string | null = null
  let bestDist = SNAP_RADIUS
  for (const id of currentTargets.value) {
    const el = nodeFor(id)
    if (!el) continue
    const r = el.getBoundingClientRect()
    const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y)
    if (d < bestDist) {
      bestDist = d
      best = id
    }
  }
  return best
}

/* --------------------------------------------------------------------------
 * Drag-to-target (pointer events)
 *
 * pointerdown on an attacker / playable hand card begins a POTENTIAL drag;
 * moving ≥ 8px commits it (arming the same targeting state a click would).
 * pointerup over a valid target dispatches; anywhere else cancels; under 8px
 * of movement the gesture falls through to the existing click handlers.
 * ----------------------------------------------------------------------- */
const DRAG_THRESHOLD = 8
const dragOrigin = ref<{ x: number; y: number } | null>(null)
let dragSource: { kind: 'attacker' | 'card'; id: string } | null = null
const dragActive = ref(false)
/** A non-targeted (or Choose One) hand card being drag-played: lifted, no arrow. */
const dragPlayCardId = ref<string | null>(null)
/** Clicks fire right after a drag's pointerup — ignore them briefly. */
let suppressClickUntil = 0

function clickSuppressed(): boolean {
  return performance.now() < suppressClickUntil
}

/** Begin a potential drag from an attacker (friendly minion or hero). */
function onAttackerPointerDown(id: string, e: PointerEvent): void {
  if (!isHumanTurn.value || store.busy) return
  if (!attackerIds.value.includes(id)) return
  beginPotentialDrag('attacker', id, e)
}

/** Begin a potential drag from a playable hand card. */
function onHandPointerDown(instanceId: string, e: PointerEvent): void {
  if (!isHumanTurn.value || store.busy) return
  if (!playableInstanceIds.value.includes(instanceId)) return
  beginPotentialDrag('card', instanceId, e)
}

function beginPotentialDrag(kind: 'attacker' | 'card', id: string, e: PointerEvent): void {
  dragOrigin.value = { x: e.clientX, y: e.clientY }
  dragSource = { kind, id }
  dragActive.value = false
  window.addEventListener('pointermove', onDragMove)
  window.addEventListener('pointerup', onDragUp)
}

function onDragMove(e: PointerEvent): void {
  if (!dragOrigin.value || !dragSource) return
  // Keep the arrow tracking even when the pointer leaves the board element.
  cursor.value = { x: e.clientX, y: e.clientY }
  if (dragActive.value) return
  const dx = e.clientX - dragOrigin.value.x
  const dy = e.clientY - dragOrigin.value.y
  if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return

  // Commit the drag: arm exactly the state the equivalent click would.
  dragActive.value = true
  if (dragSource.kind === 'attacker') {
    cancelSelection()
    selectedAttackerId.value = dragSource.id
    store.targetingFrom = dragSource.id
    currentTargets.value = store.attackTargetsFor(dragSource.id)
    return
  }
  const inst = human.value?.hand.find((c) => c.instanceId === dragSource!.id)
  const def = inst && hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  if (def?.targeted && !(def.chooseOne && def.chooseOne.length > 0)) {
    cancelSelection()
    selectedCardId.value = dragSource.id
    store.targetingFrom = dragSource.id
    currentTargets.value = store.validTargetsFor(dragSource.id)
  } else {
    // Non-targeted / Choose One: lift the card; releasing over the board plays it.
    cancelSelection()
    dragPlayCardId.value = dragSource.id
  }
}

function onDragUp(e: PointerEvent): void {
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragUp)
  const wasActive = dragActive.value
  const src = dragSource
  dragOrigin.value = null
  dragSource = null
  dragActive.value = false
  // Under the threshold: a plain click — let the click handlers run normally.
  if (!wasActive || !src) return
  suppressClickUntil = performance.now() + 250

  // Forgiving resolution: exact hit, else the enemy strip as face, else the
  // nearest legal target within reach.
  const targetId = resolveDropTarget(e.clientX, e.clientY)

  if (src.kind === 'attacker') {
    const attackerId = src.id
    if (targetId) {
      cancelSelection()
      void store.humanAttack(attackerId, targetId)
    } else {
      cancelSelection()
    }
    return
  }

  // Targeted card drag: release on (or near) a legal target casts it.
  if (selectedCardId.value === src.id) {
    if (targetId) {
      playSelectedCard(src.id, { targetId, chooseOneIndex: pendingChooseOneIndex.value })
    } else {
      cancelSelection()
    }
    return
  }

  // Drag-play: release anywhere over the battlefield / hero row plays the card
  // (Choose One cards open their option overlay at the drop).
  const cardId = dragPlayCardId.value
  dragPlayCardId.value = null
  if (!cardId) return
  const under = document.elementFromPoint(e.clientX, e.clientY)
  const overBoard = !!under?.closest?.('.battlefield, .player-zone .hero-row')
  if (!overBoard) return
  const inst = human.value?.hand.find((c) => c.instanceId === cardId)
  const def = inst && hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  if (!def) return
  if (def.chooseOne && def.chooseOne.length > 0) {
    selectedCardId.value = cardId
    openChooseOne(def.name, def.chooseOne, 'card', cardId)
    return
  }
  playSelectedCard(cardId, {})
}

/* --------------------------------------------------------------------------
 * Targeting arrow geometry (follows the cursor)
 * ----------------------------------------------------------------------- */
const cursor = ref<{ x: number; y: number }>({ x: 0, y: 0 })
function onMouseMove(e: MouseEvent): void {
  cursor.value = { x: e.clientX, y: e.clientY }
}

const arrowFrom = computed<{ x: number; y: number } | null>(() => {
  if (!isTargeting.value) return null
  let srcEl: HTMLElement | undefined
  if (selectedAttackerId.value) srcEl = nodeFor(selectedAttackerId.value)
  else if (heroPowerArmed.value) srcEl = nodeFor(HERO_TARGET(0))
  else if (selectedCardId.value) srcEl = handRef.value?.elFor(selectedCardId.value)
  const c = anim.centerOf(srcEl)
  return c
})
const arrowTo = computed<{ x: number; y: number } | null>(() => {
  if (!isTargeting.value) return null
  return cursor.value
})

/* --------------------------------------------------------------------------
 * Interaction handlers
 * ----------------------------------------------------------------------- */

/** Clear any in-progress selection / targeting. */
function cancelSelection(): void {
  selectedCardId.value = null
  selectedAttackerId.value = null
  heroPowerArmed.value = false
  armedIsHeroPower.value = false
  pendingChooseOneIndex.value = undefined
  chooseOne.value = null
  currentTargets.value = []
  store.targetingFrom = null
}

/**
 * Clicking board space while aiming: first try the forgiving target resolution
 * (enemy strip = face, near-miss snap) — a resolved target commits the action;
 * a true miss cancels. Clicks on entities, hand cards, overlays and buttons
 * are excluded — their own handlers (which bubble here afterwards) own those.
 */
function onBoardClick(e: MouseEvent): void {
  if (clickSuppressed()) return
  if (!isTargeting.value) return
  const t = e.target as HTMLElement | null
  if (t?.closest('.minion-root, .hero-root, .hand-slot, .choice-overlay, button')) return
  const snapped = resolveDropTarget(e.clientX, e.clientY)
  if (snapped) {
    commitTarget(snapped)
    return
  }
  cancelSelection()
}

/** Escape cancels an in-progress aim (and nothing else). */
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isTargeting.value) cancelSelection()
}

/** Click a hand card. */
function onHandCardClick(instanceId: string): void {
  if (clickSuppressed()) return
  if (!isHumanTurn.value) return
  if (!playableInstanceIds.value.includes(instanceId)) {
    // Clicked a card you can't play right now (usually short on mana) — a brief
    // flat buzz tells you the action was refused instead of a silent dead click.
    audio.tone('error')
    return
  }

  // Toggle off if re-clicking the armed card.
  if (selectedCardId.value === instanceId) {
    cancelSelection()
    return
  }
  cancelSelection()

  const inst = human.value?.hand.find((c) => c.instanceId === instanceId)
  if (!inst) return
  const def = hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  if (!def) return

  // Choose One first (so the chosen option may change targeting needs).
  if (def.chooseOne && def.chooseOne.length > 0) {
    selectedCardId.value = instanceId
    openChooseOne(
      def.name,
      def.chooseOne,
      'card',
      instanceId
    )
    return
  }

  // Targeted card → enter targeting mode.
  if (def.targeted) {
    selectedCardId.value = instanceId
    store.targetingFrom = instanceId
    currentTargets.value = store.validTargetsFor(instanceId)
    return
  }

  // Otherwise play immediately (minion goes to the right end of the board).
  void playSelectedCard(instanceId, {})
}

/** Open the Choose-One overlay for a card or hero power. */
function openChooseOne(
  title: string,
  options: ChooseOneOption[],
  kind: 'card' | 'heroPower',
  sourceId?: string
): void {
  chooseOne.value = {
    title,
    options: options.map((o, i) => ({ index: i, text: o.text })),
    kind,
    sourceId,
  }
}

/** Resolve a Choose-One option pick (card or hero power). */
function onChooseOnePick(pick: { index?: number }): void {
  const idx = pick.index ?? 0
  const desc = chooseOne.value
  chooseOne.value = null
  if (!desc) return

  if (desc.kind === 'heroPower') {
    const def = safeHeroPower(human.value?.heroPower.id ?? '')
    pendingChooseOneIndex.value = idx
    if (def?.targeted) {
      heroPowerArmed.value = true
      armedIsHeroPower.value = true
      currentTargets.value = heroPowerTargets()
      return
    }
    void store.humanHeroPower({ chooseOneIndex: idx })
    cancelSelection()
    return
  }

  // Card choose-one.
  const instanceId = desc.sourceId!
  const inst = human.value?.hand.find((c) => c.instanceId === instanceId)
  const def = inst && hasCard(inst.cardId) ? getCard(inst.cardId) : undefined
  pendingChooseOneIndex.value = idx
  // Only aim if the CHOSEN option actually consumes a target (its effects
  // reference 'chosenTarget') — the card-level `targeted` flag covers the
  // union of options, so e.g. Living Roots' summon option must play directly.
  const option = def?.chooseOne?.[idx]
  const optionNeedsTarget = !!option?.effects?.some(
    (eff) => 'target' in eff && eff.target === 'chosenTarget'
  )
  if (def?.targeted && optionNeedsTarget) {
    selectedCardId.value = instanceId
    store.targetingFrom = instanceId
    currentTargets.value = store.validTargetsFor(instanceId)
    return
  }
  void playSelectedCard(instanceId, { chooseOneIndex: idx })
}

/** Click an entity (minion or hero) — either as an attack/play target. */
function onEntityClick(targetId: string): void {
  if (clickSuppressed()) return
  if (!isTargeting.value) return
  if (!currentTargets.value.includes(targetId)) {
    // Clicking a non-target cancels.
    cancelSelection()
    return
  }
  commitTarget(targetId)
}

/** Dispatch the armed action (attack / hero power / card) at a legal target. */
function commitTarget(targetId: string): void {
  if (selectedAttackerId.value) {
    const attackerId = selectedAttackerId.value
    cancelSelection()
    void store.humanAttack(attackerId, targetId)
    return
  }
  if (heroPowerArmed.value) {
    const idx = pendingChooseOneIndex.value
    cancelSelection()
    void store.humanHeroPower({ targetId, chooseOneIndex: idx })
    return
  }
  if (selectedCardId.value) {
    const instanceId = selectedCardId.value
    const idx = pendingChooseOneIndex.value
    void playSelectedCard(instanceId, { targetId, chooseOneIndex: idx })
  }
}

/** Click a friendly minion — select it as attacker (or it might be a target). */
function onFriendlyMinionClick(instanceId: string): void {
  if (clickSuppressed()) return
  // If we're aiming a spell/hero-power that can target friendly minions, treat as target.
  if (isTargeting.value && (selectedCardId.value || heroPowerArmed.value)) {
    onEntityClick(instanceId)
    return
  }
  if (!isHumanTurn.value) return
  // Toggle attacker selection.
  if (selectedAttackerId.value === instanceId) {
    cancelSelection()
    return
  }
  if (!attackerIds.value.includes(instanceId)) return
  cancelSelection()
  selectedAttackerId.value = instanceId
  store.targetingFrom = instanceId
  currentTargets.value = store.attackTargetsFor(instanceId)
}

/** Click the friendly hero — select it as an attacker (weapon), or treat as a spell target. */
function onFriendlyHeroClick(): void {
  if (clickSuppressed()) return
  const heroId = HERO_TARGET(0)
  // If aiming a spell/hero-power that can target the friendly hero, treat it as the target.
  if (isTargeting.value && (selectedCardId.value || heroPowerArmed.value)) {
    onEntityClick(heroId)
    return
  }
  if (!isHumanTurn.value) return
  // Toggle hero-attacker selection.
  if (selectedAttackerId.value === heroId) {
    cancelSelection()
    return
  }
  if (!attackerIds.value.includes(heroId)) return
  cancelSelection()
  selectedAttackerId.value = heroId
  store.targetingFrom = heroId
  currentTargets.value = store.attackTargetsFor(heroId)
}

/** Click the hero power. */
function onHeroPowerClick(): void {
  if (!heroPowerUsable.value) return
  cancelSelection()
  const def = safeHeroPower(human.value?.heroPower.id ?? '')
  if (!def) return

  if (def.chooseOne && def.chooseOne.length > 0) {
    openChooseOne(def.name, def.chooseOne, 'heroPower')
    return
  }
  if (def.targeted) {
    heroPowerArmed.value = true
    armedIsHeroPower.value = true
    currentTargets.value = heroPowerTargets()
    return
  }
  void store.humanHeroPower({})
}

/** Resolve hero power target ids from its targetFilter, via the same selector. */
function heroPowerTargets(): string[] {
  const def = safeHeroPower(human.value?.heroPower.id ?? '')
  if (!def || !def.targeted) return []
  // Reuse the engine target resolution by faking a card instance is not possible
  // here; instead derive from filter using the board contents.
  return targetsForFilter(def.targetFilter)
}

/** Local target resolution mirroring the engine selectors used by hero powers. */
function targetsForFilter(sel: string | undefined): string[] {
  const friendly = friendlyBoard.value.map((m) => m.instanceId)
  const foe = enemyBoard.value.map((m) => m.instanceId)
  switch (sel) {
    case 'allMinions':
      return [...friendly, ...foe]
    case 'enemyMinions':
      return foe
    case 'friendlyMinions':
      return friendly
    case 'allEnemyCharacters':
      return [...foe, HERO_TARGET(1)]
    case 'allFriendlyCharacters':
      return [...friendly, HERO_TARGET(0)]
    case 'enemyHero':
      return [HERO_TARGET(1)]
    case 'friendlyHero':
      return [HERO_TARGET(0)]
    case 'allCharacters':
    case 'chosenTarget':
    default:
      return [...friendly, ...foe, HERO_TARGET(0), HERO_TARGET(1)]
  }
}

/**
 * Play the selected card. Dispatches IMMEDIATELY — the departing-card flourish
 * is a fire-and-forget ghost clone, so input never waits on an animation.
 */
function playSelectedCard(
  instanceId: string,
  opts: { targetId?: string; chooseOneIndex?: number }
): void {
  const cardEl = handRef.value?.elFor(instanceId)
  const inst = human.value?.hand.find((c) => c.instanceId === instanceId)
  cancelSelection()
  preview.clear()
  anim.cardPlayGhost(cardEl, inst ? tintForCard(inst.cardId) : undefined)
  void store.humanPlayCard(instanceId, opts)
}

/** End the human turn. */
function onEndTurn(): void {
  cancelSelection()
  void store.humanEndTurn()
}

/** Resolve an engine pending choice (discover / chooseOne). */
function onEnginePick(pick: { cardId?: string; index?: number }): void {
  void store.resolve(pick)
}

/** Safe hero power lookup. */
function safeHeroPower(id: string) {
  try {
    return getHeroPower(id)
  } catch {
    return undefined
  }
}

/* --------------------------------------------------------------------------
 * Event-driven animations
 * ----------------------------------------------------------------------- */
interface Splash {
  id: number
  amount: number
  kind: 'damage' | 'heal' | 'lethal'
  x: number
  y: number
}
const splashes = ref<Splash[]>([])
let splashSeq = 0
function spawnSplash(
  targetId: string,
  amount: number,
  kind: 'damage' | 'heal' | 'lethal'
): void {
  const c = anim.centerOf(nodeFor(targetId))
  if (!c) return
  splashes.value.push({ id: ++splashSeq, amount, kind, x: c.x, y: c.y })
}
function removeSplash(id: number): void {
  splashes.value = splashes.value.filter((s) => s.id !== id)
}

/* Turn banner triggers */
const yourTurnTrigger = ref(0)
const enemyTurnTrigger = ref(0)

/**
 * Process a batch of engine events into animations. DOM nodes are read after a
 * tick so newly-summoned minions exist; damage/attacks animate immediately.
 */
async function processEvents(events: GameEvent[]): Promise<void> {
  // Let Vue patch the DOM (new minions, removed ones) before measuring.
  for (const ev of events) {
    switch (ev.type) {
      case 'turnStarted':
        if (ev.player === 0) yourTurnTrigger.value++
        else enemyTurnTrigger.value++
        break
      case 'attack': {
        const a = nodeFor(ev.attackerId)
        const d = nodeFor(ev.targetId)
        audio.play('attack')
        // Wind-up + lunge along the real vector; resolves at the moment of impact.
        await anim.attackLunge(a, d)
        // A light contact flash on the clash. The heavy shake / screen-shake /
        // splash are owned by the following `damage` event so they aren't doubled
        // (and so a shield-absorbed swing still gets a satisfying clash flash).
        anim.impactFlash(d, isHeroTarget(ev.targetId) ? 0.55 : 0.4)
        break
      }
      case 'damage': {
        // Impact lands here (after any attack lunge resolved above). Heroes get
        // the full, heavy thud; minions a softer, slightly higher-pitched hit.
        const face = isHeroTarget(ev.targetId)
        const big = ev.amount >= 5
        const lethal = isLethalDamage(ev.targetId, ev.amount)
        audio.play('heroHit', face ? {} : { gain: 0.55, rate: 1.18 })
        if (face) {
          anim.heroHit(nodeFor(ev.targetId))
          anim.screenShake(boardRoot.value, lethal ? 1 : big ? 0.8 : 0.55)
        } else {
          anim.damageShake(nodeFor(ev.targetId), big ? 0.8 : 0.45)
          anim.impactFlash(nodeFor(ev.targetId), big ? 0.7 : 0.45, 'rgba(255,120,90,0.95)')
          if (big) anim.screenShake(boardRoot.value, 0.4)
        }
        spawnSplash(ev.targetId, ev.amount, lethal ? 'lethal' : 'damage')
        break
      }
      case 'heal':
        audio.tone('heal')
        anim.impactFlash(nodeFor(ev.targetId), 0.4, 'rgba(130,255,140,0.9)')
        spawnSplash(ev.targetId, ev.amount, 'heal')
        break
      case 'death':
        audio.play('death')
        // The board array reactively removes the minion (CSS fade on leave); add
        // a one-off flash + a burst of tumbling shards at its last known spot so
        // a kill carries weight instead of the minion just blinking out.
        anim.impactFlash(nodeFor(ev.instanceId), 0.5, 'rgba(220,220,235,0.9)')
        anim.deathShatter(nodeFor(ev.instanceId), tintForInstance(ev.instanceId))
        break
      case 'cardPlayed': {
        // A spell resolving pulses a class-tinted ring from the caster's hero,
        // so each calling's spells read in its colour (both players).
        const def = hasCard(ev.cardId) ? getCard(ev.cardId) : undefined
        if (def?.type === 'spell') {
          audio.tone('spell')
          anim.castGlow(nodeFor(HERO_TARGET(ev.player)), tintForCard(ev.cardId))
        }
        break
      }
      case 'minionSummoned':
        await nextTick()
        audio.play('cardPlay', { gain: 0.6 })
        anim.summonPop(nodeFor(ev.instanceId), tintForCard(ev.cardId))
        break
      case 'heroPowerUsed':
        audio.tone('heroPower')
        if (ev.player === 0) anim.heroPowerCharge(nodeFor('heroPower:0'))
        break
      case 'gameOver':
        emit('matchEnded', ev.winner)
        break
      default:
        break
    }
  }
}

/**
 * Best-effort lethal check for splash sizing: true when a hero target is taken
 * to (or below) 0 effective health by this hit. Read-only, presentational.
 */
function isLethalDamage(targetId: string, amount: number): boolean {
  if (!isHeroTarget(targetId)) return false
  const pid = targetId.endsWith(':1') ? enemy.value : human.value
  if (!pid) return false
  return pid.hero.health <= 0 || pid.hero.health + pid.hero.armor <= amount
}

watch(
  () => store.eventTick,
  () => {
    const events = store.lastEvents
    if (events && events.length) void processEvents([...events])
  }
)

/**
 * Divine-shield pop detection. Track each board minion's shield flag; when it
 * flips true → false while the minion is still alive, flash a "shield break"
 * ring on its node. Purely presentational — reads, never writes, the store.
 */
const shieldState = new Map<string, boolean>()
watch(
  () => store.eventTick,
  () => {
    const live = [...friendlyBoard.value, ...enemyBoard.value]
    const seen = new Set<string>()
    for (const m of live) {
      seen.add(m.instanceId)
      const had = shieldState.get(m.instanceId)
      if (had === true && !m.divineShield) {
        anim.shieldBreak(nodeFor(m.instanceId))
      }
      shieldState.set(m.instanceId, m.divineShield)
    }
    // Forget minions that have left the board.
    for (const id of [...shieldState.keys()]) if (!seen.has(id)) shieldState.delete(id)
  }
)

// Also watch winner directly (defensive — run page also watches the store).
watch(
  () => store.winner,
  (w) => {
    if (w !== undefined && w !== null) emit('matchEnded', w)
  }
)

onMounted(() => {
  // Kick the opening turn banner only once we're actually in play — during the
  // mulligan phase the real banner fires from the first `turnStarted` event
  // when the player confirms.
  if (store.phase === 'main') {
    if (isHumanTurn.value) yourTurnTrigger.value++
    else enemyTurnTrigger.value++
  }
  // Switch to the tenser board ambience while the battlefield is on screen.
  audio.playMusic('board')
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  // Leaving combat (reward / map / end screens) — back to the calm theme.
  audio.playMusic('menu')
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointermove', onDragMove)
  window.removeEventListener('pointerup', onDragUp)
  compactQuery?.removeEventListener('change', onCompactChange)
  // Never leave the global hover preview switched off for other screens.
  preview.setSuppressed(false)
})

/* --------------------------------------------------------------------------
 * Enemy hand fan geometry
 * ----------------------------------------------------------------------- */
function enemyCardStyle(i: number, n: number): Record<string, string> {
  const center = (n - 1) / 2
  const offset = i - center
  const spacing = Math.min(54, 520 / Math.max(1, n))
  const rot = offset * Math.min(4, 22 / Math.max(1, n))
  const arc = Math.abs(offset) * 6
  return {
    transform: `translateX(${offset * spacing}px) translateY(${arc}px) rotate(${rot}deg) scale(0.6)`,
    zIndex: String(10 + i),
  }
}
</script>

<style scoped>
.board-root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  /* Bottom room sized so the fan's rotated edge-card corners never clip. */
  padding: 6px 0 22px;
}

.zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.enemy-zone {
  gap: 2px;
  padding-top: 2px;
  border-radius: 0 0 26px 26px;
  transition: background 0.25s ease, box-shadow 0.25s ease;
}
/* Face is a legal target: the whole strip glows softly — release anywhere
   up here to hit the enemy hero. */
.enemy-zone.face-zone {
  background: radial-gradient(70% 100% at 50% 0%, rgba(255, 80, 80, 0.13), rgba(255, 80, 80, 0) 75%);
  box-shadow: inset 0 14px 30px -18px rgba(255, 80, 80, 0.55);
  cursor: pointer;
}
.player-zone {
  gap: 0;
  padding-bottom: 2px;
}

/* Hero rows */
.hero-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: min(1400px, 96vw);
  gap: 12px;
}
.side-col {
  display: flex;
  align-items: center;
}
.side-col.left {
  justify-content: flex-end;
  padding-right: 18px;
}
.side-col.right {
  justify-content: flex-start;
  padding-left: 18px;
}
.hero-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

/* Deck pile */
/* Deck pile — a compact 84×118 stack (the full 140×196 CardBack scaled to 0.6).
   Sizing it here keeps the hero rows from inflating to the card back's height. */
.deck-pile {
  position: relative;
  width: 84px;
  height: 118px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6));
}
.deck-scale {
  transform: scale(0.6);
  transform-origin: top left;
}
.deck-count {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
/* The count itself sits in a dark pill chip so it reads against the card-back art. */
.deck-count > span {
  font-weight: 800;
  font-size: 14px;
  line-height: 1;
  color: #ffe9a8;
  text-shadow: 0 1px 2px #000;
  background: rgba(10, 6, 2, 0.72);
  border: 1px solid rgba(240, 200, 80, 0.45);
  border-radius: 999px;
  padding: 2px 9px;
}
.compact .deck-pile {
  width: 70px;
  height: 98px;
}
.compact .deck-scale {
  transform: scale(0.5);
}

/* Enemy hand */
.enemy-hand {
  position: relative;
  height: 60px;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* Display-only: the fanned backs must never intercept clicks aimed at the
     enemy hero portrait beneath them. */
  pointer-events: none;
}
.enemy-card {
  position: absolute;
  top: -26px;
  transform-origin: top center;
}
/* The enemy hero row renders ABOVE the drooping card backs so the portrait is
   always fully visible and targetable. */
.enemy-zone .hero-row {
  position: relative;
  z-index: 30;
}
/* The player hero row rides ABOVE the hand fan (z) AND floats clear of it: the
   transform lifts the whole hero cluster up so the portrait + health/armour
   gems sit in their own band with a comfortable gap above the resting cards,
   instead of the fan crowding up under the portrait. The lift is `transform`
   (not margin) so it doesn't move the hand — it only pulls the hero up into
   the battlefield's spare room. */
.player-zone .hero-row {
  position: relative;
  z-index: 30;
  transform: translateY(-6px);
}
.compact .enemy-hand {
  height: 52px;
}

/* Battlefield */
.battlefield {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 0;
  width: 100%;
  /* Extra bottom padding lifts the centred minion rows up off the player's
     floating hero portrait, so the friendly row, the hero and the hand fan
     each get their own clear band on shorter (≈940px) desktops. */
  padding: 4px 0 40px;
}
.minion-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 152px;
  width: 100%;
  position: relative;
}
.compact .minion-row {
  min-height: 108px;
}
.empty-row-hint {
  position: absolute;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  color: rgba(243, 233, 210, 0.18);
  letter-spacing: 0.1em;
  pointer-events: none;
}

/* Center divider */
.center-line {
  display: flex;
  align-items: center;
  gap: 16px;
  width: min(1400px, 92vw);
  margin: 0 auto;
}
.line-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240, 200, 80, 0.35), transparent);
}
.turn-pill {
  padding: 3px 18px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #cdb888;
  border: 1px solid rgba(240, 200, 80, 0.3);
  background: rgba(20, 14, 8, 0.6);
  text-shadow: 0 1px 2px #000;
  transition: color 0.3s ease, box-shadow 0.3s ease;
}
.turn-pill.yours {
  color: #ffe9a8;
  box-shadow: 0 0 14px rgba(240, 200, 80, 0.45);
  border-color: rgba(240, 200, 80, 0.6);
}
.turn-pill.busy {
  color: #ff9b8c;
  border-color: rgba(226, 80, 58, 0.5);
}

/* Minion enter/leave transitions.
   Enter: a small overshoot pop (GSAP's summonPop layers a flash on top).
   Leave: a "shatter + dissolve" — the minion desaturates, shrinks, spins off
   and blurs away rather than just blinking out. */
.minion-pop-enter-active {
  /* Fade only — GSAP's summonPop owns the scale/overshoot so the two don't fight. */
  transition: opacity 0.3s ease;
}
.minion-pop-leave-active {
  transition: opacity 0.42s ease-in, transform 0.42s cubic-bezier(0.5, 0, 0.75, 0),
    filter 0.42s ease-in;
  position: absolute;
  z-index: 5;
  pointer-events: none;
}
.minion-pop-enter-from {
  opacity: 0;
}
.minion-pop-leave-to {
  opacity: 0;
  transform: scale(0.32) rotate(14deg) translateY(14px);
  filter: grayscale(1) brightness(0.4) blur(3px);
}
.minion-pop-move {
  transition: transform 0.3s ease;
}

/* ---- Phones (narrow viewports) ----
   The hero rows' side columns (deck piles, End Turn) overflow a 375px screen
   and get clipped by the board's overflow:hidden — most critically End Turn,
   without which the game is unplayable. Collapse the side furniture and pin
   End Turn to the right edge above the hand. */
@media (max-width: 640px) {
  .hero-row {
    grid-template-columns: 0 auto 0;
    gap: 0;
    width: 100vw;
  }
  .deck-pile {
    display: none; /* the HUD deck chip carries the count on phones */
  }
  .side-col.left,
  .side-col.right {
    padding: 0;
  }
  .hero-center {
    gap: 6px;
  }
  /* End Turn: pinned floating button, always reachable above the hand fan. */
  .player-zone .side-col.right {
    position: fixed;
    right: 6px;
    bottom: 215px;
    z-index: 45;
    transform: scale(0.82);
    transform-origin: bottom right;
  }
  .minion-row {
    gap: 6px;
  }
}
</style>
