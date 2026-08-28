<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="step-in">
    <div class="p-4 bg-white rounded-card shadow-card">
      <h2 class="flex items-center gap-[9px] mb-[10px] font-poppins font-semibold text-[13.5px] text-ophi-blue">
        <i class="fa-solid fa-hand-holding-heart text-[13px]" aria-hidden="true"></i>
        Buscalo por nombre y nos ayudás
      </h2>
      <p class="text-[13px]/[1.6] text-gray-600">
        Cuando lo encuentres, te preguntamos si este código es de ese producto. Si varias personas lo
        confirman, queda asociado <b class="font-semibold text-gray-900">para todos</b> — y el próximo
        que lo escanee tiene el resultado al instante.
      </p>
    </div>

    <h2 class="mx-1 mt-[22px] mb-[10px] font-roboto-slab font-semibold text-[12px] leading-none tracking-[.09em] uppercase text-ophi-blue">
      O si preferís
    </h2>

    <div class="flex flex-col gap-[10px]">
      <RouterLink
        to="/scanner"
        data-test="scan-again"
        class="flex items-center gap-3 w-full min-h-14 px-[14px] py-3 rounded-card bg-white shadow-card active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      >
        <span class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-[9px] bg-ophi-blue-soft text-[13px] text-ophi-blue" aria-hidden="true">
          <i class="fa-solid fa-barcode"></i>
        </span>
        <span class="flex-1 font-medium text-[13.5px] text-gray-900">Escanear otro producto</span>
        <i class="fa-solid fa-chevron-right shrink-0 text-[12px] text-gray-400" aria-hidden="true"></i>
      </RouterLink>

      <!-- Disabled until there is somewhere to send this: no endpoint exists yet
           for suggesting a product that is not in the database. -->
      <button
        type="button"
        data-test="suggest"
        disabled
        aria-disabled="true"
        class="flex items-center gap-3 w-full min-h-14 px-[14px] py-3 rounded-card bg-white shadow-card text-left opacity-50 cursor-not-allowed"
      >
        <span class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-[9px] bg-ophi-green-soft text-[13px] text-ophi-green" aria-hidden="true">
          <i class="fa-solid fa-plus"></i>
        </span>
        <span class="flex-1 font-medium text-[13.5px] text-gray-900">Sugerir este producto</span>
        <i class="fa-solid fa-chevron-right shrink-0 text-[12px] text-gray-400" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>
