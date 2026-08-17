<script setup>
const emit = defineEmits(['retry'])
</script>

<template>
  <div class="py-6 px-4 text-center">
    <span
      class="grid place-items-center w-11 h-11 mx-auto mb-[10px] rounded-full bg-ophi-danger-soft text-[17px] text-ophi-danger"
      aria-hidden="true"
    >
      <i class="fa-solid fa-cloud-arrow-down"></i>
    </span>

    <p class="mb-1 font-roboto-slab font-semibold text-[15px] text-gray-900">
      No pudimos traer tu historial
    </p>
    <p class="mb-[14px] text-[12.5px] leading-[1.5] text-gray-500">
      Revisá tu conexión. El escáner sigue funcionando.
    </p>

    <button
      type="button"
      class="flex items-center justify-center gap-2 w-full h-11 rounded-card border-2 border-[#009161] bg-white font-semibold text-[14px] text-ophi-green-dark cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
      @click="emit('retry')"
    >
      <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
      Reintentar
    </button>
  </div>
</template>
