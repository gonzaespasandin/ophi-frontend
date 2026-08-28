<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 'neutral' sits under the recent searches; 'green' greets a first-time user,
  // where the scanner is the path we actually want them to take.
  tone: { type: String, default: 'neutral' },
})

const isGreen = computed(() => props.tone === 'green')
</script>

<template>
  <div
    class="flex items-center gap-[13px] p-4 rounded-card"
    :class="isGreen ? 'bg-ophi-green-soft' : 'bg-white shadow-card'"
  >
    <span
      class="grid place-items-center shrink-0 w-[46px] h-[46px] rounded-card text-[18px]"
      :class="isGreen ? 'bg-white text-ophi-green' : 'bg-ophi-blue-soft text-ophi-blue'"
      aria-hidden="true"
    >
      <i class="fa-solid fa-barcode"></i>
    </span>

    <div class="flex-1 min-w-0">
      <p class="mb-[2px] font-semibold text-[13.5px]" :class="isGreen ? 'text-ophi-green-dark' : 'text-gray-900'">
        {{ isGreen ? 'Si lo tenés en la mano, escaneá' : 'Con el producto en la mano' }}
      </p>
      <p class="text-[12.5px]/[1.4]" :class="isGreen ? 'text-[#2F6B55]' : 'text-ophi-slate'">
        {{ isGreen ? 'Es más rápido y más preciso que el nombre.' : 'Escanear el código es más rápido.' }}
      </p>
    </div>
  </div>
</template>
