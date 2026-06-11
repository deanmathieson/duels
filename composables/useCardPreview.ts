import { ref } from 'vue'
import type { CardDef } from '~/game/types'

/**
 * Global single hovered-card preview. Any CardView / MiniCard calls `show(card, el)`
 * on hover; a single top-level <CardPreview> overlay renders a large, viewport-clamped
 * copy so the card is always fully readable and never clipped by container or screen
 * edges. A short hide debounce prevents flicker when moving between adjacent cards.
 */
const card = ref<CardDef | null>(null)
const anchor = ref<DOMRect | null>(null)
/** Owner's Spell Damage bonus for the previewed card, so the big preview shows
 *  the same "Deal N(+B) damage" boost the in-hand card does. 0 unless passed. */
const spellDamage = ref(0)
/** While true (e.g. mid-targeting), show() is a no-op so the big preview never
 *  covers the board during an aimed action. Owned by GameBoard. */
const suppressed = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | null = null

export function useCardPreview() {
  /** Show the preview for a card, anchored to the given element. */
  function show(c: CardDef, el: HTMLElement | null, sd = 0): void {
    if (suppressed.value || !el) return
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    card.value = c
    spellDamage.value = sd
    anchor.value = el.getBoundingClientRect()
  }

  /** Hide the preview (debounced so card-to-card moves don't flicker). */
  function hide(): void {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      card.value = null
      anchor.value = null
      hideTimer = null
    }, 50)
  }

  /** Immediately clear the preview (e.g. on click / unmount). */
  function clear(): void {
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = null
    card.value = null
    anchor.value = null
  }

  /**
   * Globally enable/disable the preview. Engaging suppression also clears any
   * preview already on screen (e.g. you hovered a minion the instant you armed
   * a spell).
   */
  function setSuppressed(v: boolean): void {
    suppressed.value = v
    if (v) clear()
  }

  return { card, anchor, spellDamage, show, hide, clear, setSuppressed }
}
