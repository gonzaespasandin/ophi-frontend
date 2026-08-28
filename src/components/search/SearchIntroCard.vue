<script setup>
import SearchScanNudge from './SearchScanNudge.vue'

// Hardcoded on purpose for now: these should come from the real product
// categories once the backend exposes them, and any label that returns nothing
// has to be dropped from the list — a shortcut that dead-ends is worse than none.
const SHORTCUTS = ['Galletitas', 'Leche', 'Yogur', 'Barritas de cereal', 'Fideos']

const emit = defineEmits(['shortcut'])
</script>

<template>
  <section class="step-in">
    <div class="px-[18px] py-[22px] bg-white rounded-card shadow-card text-center">
      <span class="grid place-items-center w-[60px] h-[60px] mx-auto mb-[14px] rounded-card bg-ophi-blue-soft text-[22px] text-ophi-blue" aria-hidden="true">
        <i class="fa-solid fa-magnifying-glass"></i>
      </span>
      <h2 class="mb-2 font-roboto-slab font-bold text-[19px]/[1.25] text-gray-900">
        Buscá por nombre o marca
      </h2>
      <p class="text-[13.5px]/[1.55] text-gray-600">
        Escribí las primeras letras y te vamos mostrando lo que tenemos.
      </p>
    </div>

    <div class="mt-[14px]">
      <SearchScanNudge tone="green" />
    </div>

    <h2 class="mx-1 mt-[22px] mb-[10px] font-roboto-slab font-semibold text-[12px] leading-none tracking-[.09em] uppercase text-ophi-blue">
      Probá con algo así
    </h2>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="shortcut of SHORTCUTS"
        :key="shortcut"
        type="button"
        data-test="shortcut"
        class="min-h-11 px-[14px] rounded-card bg-white font-medium text-[13.5px] text-ophi-blue cursor-pointer shadow-[0_1px_3px_rgb(16_24_40/0.1)] active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
        @click="emit('shortcut', shortcut)"
      >
        {{ shortcut }}
      </button>
    </div>
  </section>
</template>
