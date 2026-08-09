<script setup>
import { computed } from 'vue'

const props = defineProps({
  remainingSlots: { type: Number, required: true },
  maxSlots: { type: Number, default: 9 },
})

const hasSlots = computed(() => props.remainingSlots > 0)
const slotsCopy = computed(() =>
  props.remainingSlots === 1
    ? 'Te queda 1 lugar'
    : `Te quedan ${props.remainingSlots} lugares`
)
</script>

<template>
  <div
    v-if="hasSlots"
    class="mt-4 p-4 bg-white border-2 border-ophi-green rounded-card shadow-[0_6px_16px_rgb(16_24_40/.05)]"
  >
    <div class="flex items-center gap-[10px] mb-2">
      <span
        class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-[10px] bg-ophi-green-soft text-ophi-green text-[15px]"
      >
        <i class="fa-solid fa-user-plus" aria-hidden="true"></i>
      </span>
      <p class="font-roboto-slab font-semibold text-[15px] text-gray-900">Sumá a tu familia</p>
    </div>

    <p class="mb-[14px] text-[13px] leading-[1.5] text-gray-600">
      {{ slotsCopy }}. Cada perfil tiene su propia lista y al escanear elegís para quién.
    </p>

    <RouterLink
      to="/add-new-profile"
      class="flex items-center justify-center gap-2 w-full h-11 rounded-card bg-ophi-green hover:bg-ophi-green-dark active:bg-ophi-green-dark active:scale-[.98] font-semibold text-[14px] text-white transition"
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      Agregar perfil
    </RouterLink>
  </div>

  <div
    v-else
    class="flex items-center gap-[11px] mt-4 p-4 bg-ophi-surface border-[1.5px] border-[#DBE2E8] rounded-card"
  >
    <span
      class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-full bg-ophi-blue-soft text-ophi-blue text-[14px]"
    >
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
    </span>
    <div>
      <p class="mb-[2px] font-semibold text-[14px] text-gray-900">Llegaste al máximo de perfiles</p>
      <p class="text-[12.5px] leading-[1.45] text-gray-500">
        {{ maxSlots }} de {{ maxSlots }} usados. Eliminá uno para crear otro.
      </p>
    </div>
  </div>
</template>
