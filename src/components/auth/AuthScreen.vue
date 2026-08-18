<script setup>
import { computed } from 'vue'
import AuthBand from './AuthBand.vue'
import { useAuthBandEntrance } from '../../composables/useAuthBandEntrance.js'

const props = defineProps({
  // 'hero' gives the light area the free space (welcome); 'form' gives it to the
  // band, which then scrolls on its own (login and the wizard).
  layout: { type: String, default: 'form' },
  screen: { type: String, required: true },
})

const heroGrows = computed(() => props.layout === 'hero')
const animateBand = useAuthBandEntrance(props.screen)
</script>

<template>
  <div class="flex flex-col h-dvh overflow-hidden bg-[#F5F5F5]">
    <div
      class="bg-[#F5F5F5] dot-texture-page"
      :class="heroGrows ? 'flex-1 min-h-0 flex flex-col' : 'flex-none'"
    >
      <slot name="hero" />
    </div>

    <AuthBand
      :animate="animateBand"
      :scrolls="!heroGrows"
      :class="heroGrows ? 'flex-none' : 'flex-1 min-h-0'"
    >
      <slot />
    </AuthBand>
  </div>
</template>
