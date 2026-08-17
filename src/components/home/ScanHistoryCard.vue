<script setup>
import { RouterLink } from 'vue-router'
import ScanHistoryItem from '../history/ScanHistoryItem.vue'
import ScanHistorySkeleton from './ScanHistorySkeleton.vue'
import ScanHistoryErrorState from './ScanHistoryErrorState.vue'

const props = defineProps({
  scans: { type: Array, default: () => [] },
  state: {
    type: String,
    default: 'loading',
    validator: (value) => ['loading', 'error', 'empty', 'ready'].includes(value),
  },
})

const emit = defineEmits(['retry'])
</script>

<template>
  <section class="bg-white rounded-card shadow-card overflow-hidden" :aria-busy="state === 'loading' || undefined">
    <div class="flex items-center gap-[10px] py-[14px] px-4 border-b border-ophi-border">
      <span
        class="grid place-items-center shrink-0 w-[30px] h-[30px] rounded-[9px] bg-ophi-blue-soft text-[13px] text-ophi-blue"
        aria-hidden="true"
      >
        <i class="fa-solid fa-clock-rotate-left"></i>
      </span>

      <h2 class="flex-1 font-roboto-slab font-semibold text-[16px] text-ophi-blue">
        Tus últimos escaneos
      </h2>

      <RouterLink
        v-if="state === 'ready'"
        to="/history"
        class="flex items-center gap-[6px] h-9 px-[10px] rounded-card font-semibold text-[13px] text-ophi-green active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
      >
        Ver más
        <i class="fa-solid fa-arrow-right text-[11px]" aria-hidden="true"></i>
      </RouterLink>
    </div>

    <ScanHistorySkeleton v-if="state === 'loading'" />

    <ScanHistoryErrorState v-else-if="state === 'error'" @retry="emit('retry')" />

    <p v-else-if="state === 'empty'" class="py-6 px-4 text-center text-[13px] text-gray-500">
      Todavía no escaneaste ningún producto.
    </p>

    <ul v-else class="flex flex-col gap-[10px] pt-3 px-3 pb-[14px]">
      <ScanHistoryItem v-for="scan of scans" :key="scan.id" :scan="scan" />
    </ul>
  </section>
</template>
