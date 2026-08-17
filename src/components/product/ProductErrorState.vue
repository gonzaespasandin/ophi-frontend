<script setup>
import { computed } from 'vue'

const props = defineProps({
  // The scanner already read the code, so the retry never sends anybody back to
  // the shelf to aim again.
  barcode: { type: String, default: '' },
  secondaryLabel: { type: String, default: '' },
})

defineEmits(['retry', 'secondary'])

const title = computed(() =>
  props.barcode ? 'No pudimos consultar el código' : 'No pudimos consultar el producto'
)
</script>

<template>
  <section class="py-6 px-[18px] rounded-card bg-white shadow-card text-center">
    <span
      class="grid place-items-center w-11 h-11 mx-auto mb-[10px] rounded-full bg-ophi-danger-soft text-[17px] text-ophi-danger"
      aria-hidden="true"
    >
      <i class="fa-solid fa-cloud-arrow-down"></i>
    </span>

    <h2 class="mb-1 font-roboto-slab font-semibold text-[15px] text-gray-900">{{ title }}</h2>

    <p class="mb-[14px] text-[12.5px] leading-[1.5] text-gray-500">
      <template v-if="barcode">
        La señal del súper suele fallar. Ya tenemos
        <b class="font-mono text-[12px] text-gray-900">{{ barcode }}</b>
        guardado: reintentá sin volver a apuntar.
      </template>
      <template v-else>
        La señal del súper suele fallar. Reintentá sin volver a escanear.
      </template>
    </p>

    <div class="flex flex-col gap-[9px]">
      <button
        type="button"
        data-testid="error-retry"
        class="flex items-center justify-center gap-2 w-full h-11 rounded-card border-2 border-ophi-green bg-white font-semibold text-[14px] text-ophi-green-dark cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
        @click="$emit('retry')"
      >
        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
        Reintentar
      </button>

      <button
        v-if="secondaryLabel"
        type="button"
        class="w-full h-11 rounded-card font-medium text-[13px] text-gray-500 cursor-pointer active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
        @click="$emit('secondary')"
      >
        {{ secondaryLabel }}
      </button>
    </div>
  </section>
</template>
