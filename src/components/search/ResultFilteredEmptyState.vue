<script setup>
defineProps({
  query: { type: String, default: '' },
})

const emit = defineEmits(['clear-filters', 'adjust-filters'])
</script>

<template>
  <!-- The difference with the empty catalogue: here the products do exist and
       the filters are hiding them, so the exit is removing filters, never
       suggesting a product that is already loaded. -->
  <div class="p-[18px] py-5 rounded-card bg-white shadow-card text-center">
    <span
      class="grid place-items-center mx-auto mb-[13px] w-[52px] h-[52px] rounded-card bg-ophi-blue-soft text-[19px] text-ophi-blue"
      aria-hidden="true"
    >
      <i class="fa-solid fa-filter-circle-xmark"></i>
    </span>

    <h2 class="mb-[7px] font-roboto-slab font-bold text-[17px] leading-[1.25] text-gray-900">
      Ningún resultado con esos filtros
    </h2>

    <!-- The design named how many products «query» has without filters. That
         count is not in the search response, so the copy stays qualitative. -->
    <p class="mb-[14px] text-[13px] leading-[1.55] text-gray-600">
      Hay productos con <b class="font-semibold text-ophi-blue">«{{ query }}»</b> si los sacás.
    </p>

    <button
      type="button"
      data-testid="clear-filters"
      class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card bg-ophi-blue font-semibold text-[14px] text-white active:bg-ophi-blue-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      @click="emit('clear-filters')"
    >
      <i class="fa-solid fa-filter-circle-xmark text-[13px]" aria-hidden="true"></i>
      Quitar los filtros
    </button>

    <button
      type="button"
      data-testid="adjust-filters"
      class="w-full h-12 mt-[10px] rounded-card border-[1.5px] border-[#DDE3E9] bg-white font-semibold text-[14px] text-ophi-blue active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      @click="emit('adjust-filters')"
    >
      Ajustar los filtros
    </button>
  </div>
</template>
