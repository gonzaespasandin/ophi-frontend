<script setup>
import { computed, ref } from 'vue'
import { useSwipeGesture } from '../../composables/useSwipeGesture.js'

// The floor is 2 and not 0 because iOS bounces the scroll past its own end.
const AT_TOP = 2

defineProps({
  label: { type: String, default: 'Resultado del escaneo' },
})

const emit = defineEmits(['dismiss', 'leave'])

const bodyRef = ref(null)

// Dragging the panel away only makes sense with the list already at the top.
// Anywhere else it would fight the scroll.
const { translateY, getTouch, moveTouch, endTouch } = useSwipeGesture(
  () => isAtTop(),
  () => emit('dismiss'),
)

const isDragging = computed(() => translateY.value > 0)

// The panel rests at one height and never takes the screen: the camera is the
// point of this view, and whoever wants the whole story has the product page a
// tap away. The only thing the drag can do is push the panel off the bottom.
const sheetStyle = computed(() => ({
  transform: `translateY(${translateY.value}px)`,
  transition: isDragging.value ? 'none' : 'transform .3s ease-out',
  maxHeight: '78svh',
}))

function isAtTop() {
  return (bodyRef.value?.scrollTop ?? 0) <= AT_TOP
}

// The view keeps a route guard so the hardware back button closes the panel
// instead of leaving the scanner, and that guard cancels every exit alike. A
// link inside the panel is an exit on purpose, so it is announced in the
// capture phase, before the router ever sees the navigation.
function stepAsideForLinks(event) {
  if (event.target.closest?.('a[href]')) emit('leave')
}
</script>

<template>
  <div class="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm">
    <section
      role="dialog"
      aria-modal="true"
      :aria-label="label"
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
        <slot name="band" />
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
        @click.capture="stepAsideForLinks"
      >
        <slot />
      </div>
    </section>
  </div>
</template>
