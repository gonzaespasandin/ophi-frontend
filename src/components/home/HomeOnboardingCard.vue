<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  // 'no-restrictions' asks for the list first: without it the scanner cannot
  // return a verdict, so inviting to scan would be a broken promise.
  variant: {
    type: String,
    default: 'no-restrictions',
    validator: (value) => ['no-restrictions', 'ready-to-scan'].includes(value),
  },
  restrictionsCount: { type: Number, default: 0 },
  editRoute: { type: String, default: '/profile' },
})

const isReadyToScan = computed(() => props.variant === 'ready-to-scan')

const restrictionsSummary = computed(() =>
  props.restrictionsCount === 1
    ? 'Tu restricción ya está cargada'
    : `Tus ${props.restrictionsCount} restricciones ya están cargadas`
)
</script>

<template>
  <!-- Restrictions loaded: scanning is now the only thing left to do. -->
  <div
    v-if="isReadyToScan"
    class="py-[26px] px-5 text-center rounded-card bg-ophi-green-soft border-[1.5px] border-[#CFE7DD]"
  >
    <span
      class="grid place-items-center w-[74px] h-[74px] mx-auto mb-4 rounded-[22px] bg-white text-[32px] text-ophi-green shadow-[0_6px_18px_rgb(0_122_80/0.14)]"
      aria-hidden="true"
    >
      <i class="fa-solid fa-barcode"></i>
    </span>

    <h2 class="mb-2 font-roboto-slab font-bold text-[21px] leading-[1.25] text-[#0B3D2C]">
      Escaneá tu primer producto
    </h2>
    <p class="mb-5 text-[14px] leading-[1.55] text-[#3E5B50]">
      Apuntá al código de barras y te decimos si es apto para vos y para tu familia.
    </p>

    <RouterLink
      to="/scanner"
      class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card bg-ophi-green font-semibold text-[15px] text-white active:bg-ophi-green-dark active:scale-[.98] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green-dark"
    >
      <i class="fa-solid fa-barcode" aria-hidden="true"></i>
      Abrir el escáner
    </RouterLink>

    <ul class="flex flex-col gap-[11px] mt-[18px] pt-4 text-left border-t border-[#CFE7DD]">
      <li class="flex items-center gap-[10px] text-[13px] text-[#3E5B50]">
        <i class="fa-solid fa-circle-check text-[13px] text-ophi-green" aria-hidden="true"></i>
        Funciona con productos del super argentino
      </li>
      <li class="flex items-center gap-[10px] text-[13px] text-[#3E5B50]">
        <i class="fa-solid fa-circle-check text-[13px] text-ophi-green" aria-hidden="true"></i>
        {{ restrictionsSummary }}
      </li>
    </ul>
  </div>

  <!-- No restrictions yet: configuration comes before action. -->
  <div v-else>
    <div class="py-[26px] px-5 text-center rounded-card bg-white shadow-card">
      <span
        class="grid place-items-center w-[74px] h-[74px] mx-auto mb-4 rounded-[22px] bg-ophi-blue-soft text-[30px] text-ophi-blue"
        aria-hidden="true"
      >
        <i class="fa-solid fa-list-check"></i>
      </span>

      <h2 class="mb-2 font-roboto-slab font-bold text-[21px] leading-[1.25] text-gray-900">
        Contanos qué evitás
      </h2>
      <p class="mb-5 text-[14px] leading-[1.55] text-gray-600">
        Sin tu lista de ingredientes no podemos decirte si un producto es apto. Se carga una vez y
        la editás cuando quieras.
      </p>

      <RouterLink
        :to="editRoute"
        class="flex items-center justify-center gap-[9px] w-full h-12 rounded-card bg-ophi-blue font-semibold text-[15px] text-white active:bg-ophi-blue-dark active:scale-[.98] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue-dark"
      >
        <i class="fa-solid fa-list-check" aria-hidden="true"></i>
        Cargar mis restricciones
      </RouterLink>

      <p class="mt-[14px] text-[12.5px] leading-[1.5] text-gray-500">Toma menos de un minuto.</p>
    </div>

    <div class="flex items-center gap-[11px] mt-[14px] py-[14px] px-4 rounded-card bg-ophi-surface border border-ophi-border">
      <i class="fa-solid fa-barcode text-[16px] text-gray-400" aria-hidden="true"></i>
      <p class="flex-1 text-[12.5px] leading-[1.45] text-gray-500">
        El escáner se habilita apenas cargues tu lista.
      </p>
    </div>
  </div>
</template>
