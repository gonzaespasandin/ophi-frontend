<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  query: { type: String, default: '' },
})
</script>

<template>
  <section class="step-in">
    <div class="px-[18px] py-[22px] bg-white rounded-card shadow-card text-center">
      <span class="grid place-items-center w-14 h-14 mx-auto mb-[14px] rounded-card bg-ophi-surface border-[1.5px] border-dashed border-[#DDE3E9] text-[20px] text-ophi-slate" aria-hidden="true">
        <i class="fa-solid fa-magnifying-glass"></i>
      </span>
      <h2 class="mb-2 font-roboto-slab font-bold text-[18px]/[1.25] text-gray-900">Sin coincidencias</h2>
      <p class="text-[13.5px]/[1.55] text-gray-600">
        No encontramos nada con <b class="font-semibold text-gray-900">{{ query }}</b>. Nuestra base
        todavía es chica: puede existir y no estar cargado.
      </p>
    </div>

    <div class="flex flex-col gap-[10px] mt-[14px]">
      <RouterLink
        to="/scanner"
        data-test="scan"
        class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card bg-ophi-blue font-semibold text-[14.5px] text-white active:bg-ophi-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      >
        <i class="fa-solid fa-barcode text-[14px]" aria-hidden="true"></i>
        Escanear el código de barras
      </RouterLink>

      <!-- Disabled until there is somewhere to send this: no endpoint exists yet
           for suggesting a product that is not in the database. -->
      <button
        type="button"
        data-test="suggest"
        disabled
        aria-disabled="true"
        class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card border-2 border-ophi-green bg-white font-semibold text-[14.5px] text-ophi-green-dark opacity-50 cursor-not-allowed"
      >
        <i class="fa-solid fa-plus text-[13px]" aria-hidden="true"></i>
        Sugerir este producto
      </button>
    </div>

    <p class="mx-1 mt-[14px] text-[12px]/[1.5] text-ophi-slate">
      Escanear un código desconocido también nos sirve: así sabemos qué falta cargar.
    </p>
  </section>
</template>
