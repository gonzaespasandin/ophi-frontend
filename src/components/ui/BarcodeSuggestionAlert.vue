<script setup>
defineProps({
  barcode: {
    type: String,
    required: true
  }
});

defineEmits(['confirm', 'dismiss']);
</script>

<template>
  <section class="p-4 rounded-card border-2 border-ophi-blue bg-white shadow-card">
    <div class="flex items-center gap-[11px] mb-[9px]">
      <span
        class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-[10px] bg-ophi-blue-soft text-[15px] text-ophi-blue"
        aria-hidden="true"
      >
        <i class="fa-solid fa-barcode"></i>
      </span>
      <h2 class="font-roboto-slab font-semibold text-[15px] text-gray-900">¿Es este el producto?</h2>
    </div>

    <p class="mb-[14px] text-[12.5px] leading-[1.5] text-gray-600">
      Escaneaste <b class="font-mono text-[12px] text-gray-900">{{ barcode }}</b> y este producto no
      tiene código asignado. Si lo confirmás, lo asociamos para todos.
    </p>

    <div class="flex gap-[10px]">
      <button
        type="button"
        class="flex items-center justify-center gap-[7px] flex-1 h-11 rounded-card bg-ophi-green font-semibold text-[13.5px] text-white cursor-pointer active:bg-ophi-green-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
        @click="$emit('confirm')"
      >
        <i class="fa-solid fa-check" aria-hidden="true"></i>
        Sí, es este
      </button>

      <button
        type="button"
        class="flex-1 h-11 rounded-card border-[1.5px] border-gray-300 bg-white font-semibold text-[13.5px] text-gray-600 cursor-pointer active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
        @click="$emit('dismiss')"
      >
        No es este
      </button>
    </div>
  </section>
</template>
