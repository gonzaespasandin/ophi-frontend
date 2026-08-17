<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink
    to="/search"
    class="flex items-center gap-3 w-full h-[52px] pl-4 pr-2 rounded-card bg-white shadow-[0_1px_2px_rgb(16_24_40/0.06),0_6px_16px_rgb(16_24_40/0.09)] active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
  >
    <i class="fa-solid fa-magnifying-glass text-[15px] text-ophi-blue" aria-hidden="true"></i>
    <span class="flex-1 text-left font-medium text-[15px] text-[#5B6572]">Buscar productos</span>
    <span
      class="grid place-items-center shrink-0 w-9 h-9 rounded-card bg-ophi-blue-soft text-[12px] text-ophi-blue"
      aria-hidden="true"
    >
      <i class="fa-solid fa-chevron-right"></i>
    </span>
  </RouterLink>
</template>
