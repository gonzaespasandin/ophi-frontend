<script setup>
import { computed } from 'vue'

const props = defineProps({
  isPremium: { type: Boolean, default: false },
})

const label = computed(() => (props.isPremium ? 'PREMIUM · gestionar' : 'GRATUITO · mejorar'))
</script>

<template>
  <RouterLink
    to="/subscriptions"
    class="inline-flex items-center gap-[7px] h-[30px] pl-[9px] pr-[11px] rounded-card border border-white/45 bg-white/16 hover:bg-white/26 active:bg-white/26 active:scale-[.98] text-white font-semibold text-[11.5px] tracking-[.03em] transition"
  >
    <i class="fa-solid fa-crown text-[11px]" aria-hidden="true"></i>
    {{ label }}
    <i class="fa-solid fa-chevron-right text-[9px] opacity-80" aria-hidden="true"></i>
  </RouterLink>
</template>
