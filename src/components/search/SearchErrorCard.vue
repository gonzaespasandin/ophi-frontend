<script setup>
const emit = defineEmits(['retry'])
</script>

<template>
  <!-- Lives below the field, as one more result: the field keeps what was typed
       instead of the whole screen being replaced by a full-page error. -->
  <section class="px-[18px] py-5 bg-white rounded-card shadow-card text-center step-in" role="alert">
    <span class="grid place-items-center w-12 h-12 mx-auto mb-3 rounded-full bg-ophi-danger-soft text-[18px] text-ophi-danger" aria-hidden="true">
      <i class="fa-solid fa-cloud-arrow-down"></i>
    </span>
    <h2 class="mb-[5px] font-roboto-slab font-bold text-[16px] text-gray-900">No pudimos buscar</h2>
    <p class="mb-[14px] text-[13px]/[1.5] text-gray-600">
      La señal del super suele fallar. Tu búsqueda quedó escrita arriba.
    </p>

    <button
      type="button"
      data-test="retry"
      class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card border-2 border-ophi-green bg-white font-semibold text-[14px] text-ophi-green-dark cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
      @click="emit('retry')"
    >
      <i class="fa-solid fa-rotate-right text-[13px]" aria-hidden="true"></i>
      Reintentar
    </button>
  </section>
</template>
