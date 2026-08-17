<script setup>
defineProps({
  title: { type: String, default: 'Todavía no tenemos sugerencias' },
  message: { type: String, default: 'Escaneá un par de productos y empezamos a recomendarte.' },
})
</script>

<template>
  <div class="flex items-center gap-[13px] py-5 px-[18px] rounded-card bg-ophi-green-soft border-[1.5px] border-dashed border-[#CFE7DD]">
    <span
      class="grid place-items-center shrink-0 w-11 h-11 rounded-card bg-white text-[17px] text-ophi-green"
      aria-hidden="true"
    >
      <i class="fa-solid fa-basket-shopping"></i>
    </span>

    <div>
      <p class="mb-[3px] font-roboto-slab font-semibold text-[14.5px] text-[#0B3D2C]">
        {{ title }}
      </p>
      <p class="text-[12.5px] leading-[1.5] text-[#3E5B50]">
        {{ message }}
      </p>
    </div>
  </div>
</template>
