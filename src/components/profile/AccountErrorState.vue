<script setup>
const emit = defineEmits(['retry'])
</script>

<template>
  <div role="alert" class="bg-white rounded-card px-4 py-[22px] text-center">
    <p
      class="grid place-items-center w-11 h-11 mx-auto mb-[10px] rounded-full bg-[#FBEAEE] text-ophi-danger text-[17px]"
    >
      <i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i>
    </p>

    <h3 class="mb-1 font-roboto-slab font-semibold text-[15px] text-gray-900">
      No pudimos cargar tu cuenta
    </h3>
    <p class="mb-[14px] text-[12.5px] leading-[1.5] text-[#6B7280]">
      Revisá tu conexión y volvé a intentarlo.
    </p>

    <button
      type="button"
      class="w-full h-11 rounded-card border-2 border-ophi-green bg-white hover:bg-ophi-green-soft active:bg-ophi-green-soft active:scale-[.98] font-semibold text-[14px] text-ophi-green cursor-pointer transition"
      @click="emit('retry')"
    >
      <i class="fa-solid fa-rotate-right mr-[6px]" aria-hidden="true"></i>Reintentar
    </button>
  </div>
</template>
