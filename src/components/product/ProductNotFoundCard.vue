<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  barcode: { type: String, default: '' },
})
</script>

<template>
  <section class="py-6 px-[18px] rounded-card bg-white shadow-card text-center">
    <span
      class="grid place-items-center w-14 h-14 mx-auto mb-3 rounded-card bg-ophi-blue-soft text-[23px] text-ophi-blue"
      aria-hidden="true"
    >
      <i class="fa-solid fa-barcode"></i>
    </span>

    <h2 class="mb-[6px] font-roboto-slab font-bold text-[17px] text-gray-900">
      No tenemos este producto
    </h2>

    <p v-if="barcode" class="mb-2 text-[13px] leading-[1.5] text-gray-600">
      El código <b class="font-mono text-[12.5px] text-gray-900">{{ barcode }}</b> todavía no está en
      la base.
    </p>
    <p v-else class="mb-2 text-[13px] leading-[1.5] text-gray-600">
      Todavía no está en la base.
    </p>

    <p class="mb-4 text-[12.5px] leading-[1.5] text-gray-500">
      Podés buscarlo por nombre, o escanear otro.
    </p>

    <div class="flex flex-col gap-[9px]">
      <RouterLink
        to="/search"
        class="flex items-center justify-center gap-2 w-full h-11 rounded-card bg-ophi-blue font-semibold text-[14px] text-white active:bg-ophi-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      >
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        Buscarlo por nombre
      </RouterLink>

      <RouterLink
        to="/scanner"
        class="flex items-center justify-center gap-2 w-full h-11 rounded-card border-2 border-ophi-green bg-white font-semibold text-[14px] text-ophi-green-dark active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
      >
        <i class="fa-solid fa-barcode" aria-hidden="true"></i>
        Escanear otro
      </RouterLink>
    </div>
  </section>
</template>
