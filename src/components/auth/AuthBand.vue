<script setup>
defineProps({
  animate: { type: Boolean, default: false },
  scrolls: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="bg-ophi-blue dot-texture-band rounded-t-[22px]"
    :class="[animate && 'band-rise', scrolls && 'overflow-y-auto scrollbar-none']"
  >
    <slot />
  </div>
</template>
