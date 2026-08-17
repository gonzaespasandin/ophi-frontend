<script>
// How long the panel takes to travel between its two heights. Whoever reacts to
// that trip needs the same number, so it lives here — next to the transition it
// describes — instead of being copied as a literal somewhere else.
export const SHEET_SETTLE_MS = 340
</script>

<script setup>
import { computed, ref } from 'vue'
import { useSwipeGesture } from '../../composables/useSwipeGesture.js'

const SETTLE = `${SHEET_SETTLE_MS}ms cubic-bezier(.2,.8,.2,1)`

// Scrolling is the whole gesture. Past this the panel takes the screen; back at
// the top it gives it away again. The floor is 2 and not 0 because iOS bounces
// the scroll past its own end and a 0 would flicker the panel shut.
const EXPAND_AT = 48
const COLLAPSE_AT = 2

const props = defineProps({
  label: { type: String, default: 'Resultado del escaneo' },
  // Only a resolved product has enough below the fold to be worth the screen.
  expandable: { type: Boolean, default: false },
})

const emit = defineEmits(['dismiss', 'leave', 'update:full'])

const full = ref(false)
const bodyRef = ref(null)

// Dragging the panel away only makes sense from its resting height and with the
// list already at the top. Anywhere else it would fight the scroll.
const { translateY, getTouch, moveTouch, endTouch } = useSwipeGesture(
  () => !full.value && isAtTop(),
  () => emit('dismiss'),
)

const isDragging = computed(() => translateY.value > 0)

// The panel is anchored to the floor and grows by height, never by moving: that
// is what lets it rise without the content underneath jumping a pixel.
const sheetStyle = computed(() => {
  const motion = {
    transform: `translateY(${translateY.value}px)`,
    transition: isDragging.value
      ? 'none'
      : `height ${SETTLE}, border-radius ${SETTLE}, transform .3s ease-out`,
  }

  // The short states (a retry, an expired session) hug their card instead of
  // holding open a panel that has nothing to show.
  if (!props.expandable) return { ...motion, maxHeight: '78svh' }

  return {
    ...motion,
    height: full.value ? '100%' : '78svh',
    borderRadius: full.value ? '0px' : '22px 22px 0 0',
  }
})

function isAtTop() {
  return (bodyRef.value?.scrollTop ?? 0) <= COLLAPSE_AT
}

function onScroll(event) {
  if (!props.expandable) return

  const top = event.target.scrollTop

  if (!full.value && top > EXPAND_AT) setFull(true)
  else if (full.value && top <= COLLAPSE_AT) setFull(false)
}

function setFull(value) {
  full.value = value
  emit('update:full', value)
}

// Collapsing is not a state change, it is a scroll: letting the same handler
// close the panel keeps one source of truth and cannot loop against itself.
function collapse() {
  bodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

// The view keeps a route guard so the hardware back button closes the panel
// instead of leaving the scanner, and that guard cancels every exit alike. A
// link inside the panel is an exit on purpose, so it is announced in the
// capture phase, before the router ever sees the navigation.
function stepAsideForLinks(event) {
  if (event.target.closest?.('a[href]')) emit('leave')
}

defineExpose({ collapse })
</script>

<template>
  <div
    class="absolute inset-0 z-10 backdrop-blur-sm transition-colors duration-[340ms]"
    :class="full ? 'bg-black' : 'bg-black/70'"
  >
    <section
      role="dialog"
      aria-modal="true"
      :aria-label="label"
      :data-full="full"
      class="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[22px] overflow-hidden bg-[#F5F5F5] dot-texture-page shadow-[0_-12px_40px_rgb(0_0_0/0.4)]"
      :style="sheetStyle"
    >
      <div
        data-testid="sheet-grip"
        class="shrink-0 touch-none"
        @touchstart="getTouch"
        @touchmove="moveTouch"
        @touchend="endTouch"
      >
        <slot name="band" :full="full" :collapse="collapse" />
      </div>

      <!--
        The horizontal axis is pinned shut on purpose. CSS resolves overflow-x to
        auto as soon as overflow-y is not visible, so any card that bleeds past
        the padding — the carousel does, by design — would turn into a sideways
        scrollbar instead of being clipped at the edge of the screen.
      -->
      <div
        ref="bodyRef"
        data-testid="sheet-body"
        class="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-[var(--app-bottom-inset)] -mt-8"
        @scroll="onScroll"
        @click.capture="stepAsideForLinks"
      >
        <slot />
      </div>
    </section>
  </div>
</template>
