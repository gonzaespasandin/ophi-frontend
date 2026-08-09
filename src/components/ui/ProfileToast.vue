<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'success' },
})

const emit = defineEmits(['close'])

const isError = computed(() => props.type === 'error')
</script>

<template>
  <div
    :data-type="props.type"
    class="flex items-center gap-[10px] rounded-card py-[13px] px-[14px] text-white shadow-[0_8px_20px_rgb(0_0_0/.16)]"
    :class="isError ? 'bg-[#5C1B27]' : 'bg-[#0F3D2E]'"
  >
    <i
      class="fa-solid shrink-0"
      :class="isError ? 'fa-triangle-exclamation text-[#F5A3B1]' : 'fa-circle-check text-[#4ADE9B]'"
      aria-hidden="true"
    ></i>
    <p class="flex-1 font-medium text-[13.5px]">{{ props.message }}</p>
    <button
      type="button"
      aria-label="Cerrar aviso"
      class="shrink-0 grid place-items-center w-11 h-11 -my-[13px] -mr-[14px] text-white/80 hover:text-white active:text-white active:scale-[.98] cursor-pointer transition focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      @click="emit('close')"
    >
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
  </div>
</template>
