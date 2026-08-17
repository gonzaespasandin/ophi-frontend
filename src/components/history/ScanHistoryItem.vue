<script setup>
import { computed, ref, useId } from 'vue'
import { RouterLink } from 'vue-router'
import ScanVerdictSummary from './ScanVerdictSummary.vue'
import { formatScanDate } from '../../utils/formatScanDate.js'

const props = defineProps({
  scan: { type: Object, required: true },
})

const panelId = useId()
const isExpanded = ref(false)

const productName = computed(() => props.scan.product?.name ?? 'Producto sin nombre')
const scannedAt = computed(() => formatScanDate(props.scan.scanned_at))
const results = computed(() => props.scan.results ?? [])
const hasResults = computed(() => results.value.length > 0)

// Without a brand the product detail cannot be resolved, so the name stays plain
// text instead of becoming a link that leads nowhere.
const brandName = computed(() => props.scan.product?.brand?.name ?? null)
const productRoute = computed(() =>
  brandName.value ? `/product/${props.scan.product.name}/${brandName.value}` : null
)
</script>

<template>
  <li class="rounded-card bg-[#F5F5F5] overflow-hidden">
    <div class="relative">
      <!-- The toggle sits behind the row so tapping anywhere but the product
           name opens the results. A link cannot be nested inside a button. -->
      <button
        type="button"
        class="absolute inset-0 w-full cursor-pointer active:bg-ophi-border transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
        :aria-expanded="isExpanded"
        :aria-controls="panelId"
        @click="isExpanded = !isExpanded"
      >
        <span class="sr-only">Ver resultados de {{ productName }}</span>
      </button>

      <div class="relative flex items-center gap-3 min-h-[60px] py-3 px-[14px] pointer-events-none">
        <span class="flex-1 min-w-0">
          <!-- inline-block, never block: a block link would stretch across the
               whole row and swallow taps on the empty space beside the name. -->
          <RouterLink
            v-if="productRoute"
            :to="productRoute"
            class="inline-block align-top max-w-full truncate font-semibold text-[14.5px] text-ophi-blue pointer-events-auto hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
          >{{ productName }}</RouterLink>
          <span
            v-else
            class="block truncate font-semibold text-[14.5px] text-ophi-blue"
          >{{ productName }}</span>

          <span class="block mt-[2px] text-[12px] text-gray-500">{{ scannedAt }}</span>
        </span>

        <span
          class="grid place-items-center shrink-0 w-7 h-7 rounded-full bg-white text-[12px] text-ophi-blue transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          aria-hidden="true"
        >
          <i class="fa-solid fa-chevron-down"></i>
        </span>
      </div>
    </div>

    <div v-show="isExpanded" :id="panelId" class="px-[14px] pb-[14px]">
      <ScanVerdictSummary v-if="hasResults" :results="results" />
      <p v-else class="py-2 text-[12.5px] text-gray-500">
        No guardamos el resultado de este escaneo.
      </p>
    </div>
  </li>
</template>
