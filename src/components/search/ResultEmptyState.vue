<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  query: { type: String, default: '' },
})

const emit = defineEmits(['edit-search'])
</script>

<template>
  <div>
    <div class="p-[18px] py-[22px] rounded-card bg-white shadow-card text-center">
      <span
        class="grid place-items-center mx-auto mb-[14px] w-14 h-14 rounded-card border-[1.5px] border-dashed border-[#DDE3E9] bg-ophi-surface text-[20px] text-ophi-slate"
        aria-hidden="true"
      >
        <i class="fa-solid fa-box-open"></i>
      </span>

      <h2 class="mb-2 font-roboto-slab font-bold text-[18px] leading-[1.25] text-gray-900">
        No lo tenemos cargado
      </h2>

      <p class="text-[13.5px] leading-[1.55] text-gray-600">
        Buscamos <b class="font-semibold text-gray-900">«{{ query }}»</b> y no hay nada.
        Nuestra base todavía es chica.
      </p>
    </div>

    <div class="flex flex-col gap-[10px] mt-[14px]">
      <button
        type="button"
        data-testid="edit-search"
        class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card bg-ophi-blue font-semibold text-[14.5px] text-white active:bg-ophi-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
        @click="emit('edit-search')"
      >
        <i class="fa-solid fa-pen text-[13px]" aria-hidden="true"></i>
        Cambiar la búsqueda
      </button>

      <!-- Suggesting a product has no backend flow yet, so the offer is drawn
           where the design puts it and left off rather than faked. -->
      <button
        type="button"
        data-testid="suggest"
        disabled
        aria-disabled="true"
        class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card border-2 border-ophi-border bg-white font-semibold text-[14.5px] text-ophi-slate/50 cursor-not-allowed"
      >
        <i class="fa-solid fa-plus text-[13px]" aria-hidden="true"></i>
        Sugerir este producto
      </button>

      <RouterLink
        to="/scanner"
        data-testid="scan"
        class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card font-medium text-[13.5px] text-ophi-slate active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      >
        <i class="fa-solid fa-barcode text-[13px]" aria-hidden="true"></i>
        Escanear el código
      </RouterLink>
    </div>
  </div>
</template>
