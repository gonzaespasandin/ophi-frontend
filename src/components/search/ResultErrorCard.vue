<script setup>
const emit = defineEmits(['retry'])
</script>

<template>
  <!-- The error lives under the search field like one more result, so what was
       typed survives the failure instead of the whole screen being replaced. -->
  <div class="p-[18px] py-5 rounded-card bg-white shadow-card text-center">
    <span
      class="grid place-items-center mx-auto mb-3 w-12 h-12 rounded-full bg-ophi-danger-soft text-[18px] text-ophi-danger"
      aria-hidden="true"
    >
      <i class="fa-solid fa-cloud-arrow-down"></i>
    </span>

    <h2 class="mb-[5px] font-roboto-slab font-bold text-[16px] text-gray-900">No pudimos buscar</h2>

    <p class="mb-[14px] text-[13px] leading-[1.5] text-gray-600">
      La señal del súper suele fallar. Tu búsqueda quedó escrita arriba.
    </p>

    <button
      type="button"
      data-testid="retry"
      class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card border-2 border-ophi-green bg-white font-semibold text-[14px] text-ophi-green-dark active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
      @click="emit('retry')"
    >
      <i class="fa-solid fa-rotate-right text-[13px]" aria-hidden="true"></i>
      Reintentar
    </button>
  </div>
</template>
