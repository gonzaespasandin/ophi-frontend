<script setup>
import { computed, ref, watch } from 'vue'
import { useSwipeGesture } from '../../composables/useSwipeGesture.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  brands: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'apply', 'search-brands'])

// Only Marcas reaches the backend: ProductService::search filters on brand_id
// and nothing else. The other two tabs are drawn so switching them on later
// needs no redesign, and they stay disabled until there is a query param to send.
const TABS = [
  { id: 'brands', label: 'Marcas', enabled: true },
  { id: 'categories', label: 'Categorías', enabled: false },
  { id: 'origins', label: 'Origen', enabled: false },
]

const draft = ref([...props.selected])
const brandQuery = ref('')

// Every opening starts from what is actually filtering the list, so a cancelled
// session never leaks into the next one.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    draft.value = [...props.selected]
    brandQuery.value = ''
  }
)

const { translateY, getTouch, moveTouch, endTouch } = useSwipeGesture(
  () => props.open,
  () => emit('close')
)

const draftIds = computed(() => draft.value.map((brand) => brand.id))
const hasDraft = computed(() => draft.value.length > 0)
const hasBrands = computed(() => props.brands.length > 0)

function isPicked(brand) {
  return draftIds.value.includes(brand.id)
}

function toggle(brand) {
  draft.value = isPicked(brand)
    ? draft.value.filter((picked) => picked.id !== brand.id)
    : draft.value.concat(brand)
}

function onBrandQuery(event) {
  brandQuery.value = event.target.value
  emit('search-brands', brandQuery.value)
}
</script>

<template>
  <template v-if="open">
    <div
      data-testid="filter-backdrop"
      class="fixed inset-0 z-[100] bg-black/55"
      @click="emit('close')"
    ></div>

    <!-- 76% instead of a fixed half: with many brands the chip list was
         strangled and the footer buttons were pushed out of reach. -->
    <div
      data-testid="filter-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros"
      class="fixed inset-x-0 bottom-0 z-[110] flex flex-col max-h-[76%] rounded-t-[22px] bg-[#F5F5F5] shadow-[0_-12px_40px_rgb(0_0_0/0.35)] band-rise"
      :style="translateY ? { transform: `translateY(${translateY}px)` } : null"
    >
      <div
        data-testid="drawer-handle"
        class="shrink-0 px-4"
        @touchstart="getTouch"
        @touchmove="moveTouch"
        @touchend="endTouch"
      >
        <div class="grid place-items-center h-[30px]">
          <span class="w-[44%] h-[5px] rounded-card bg-[#CBD2D9]" aria-hidden="true"></span>
        </div>

        <div class="flex items-center gap-[9px] pb-3">
          <h2 class="flex-1 font-roboto-slab font-bold text-[18px] text-gray-900">Filtros</h2>

          <button
            v-if="hasDraft"
            type="button"
            data-testid="clear-draft"
            class="min-h-9 px-[11px] rounded-card font-medium text-[12.5px] text-ophi-slate underline active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
            @click="draft = []"
          >
            Limpiar todo
          </button>

          <button
            type="button"
            aria-label="Cerrar filtros"
            class="grid place-items-center shrink-0 -mr-2 w-11 h-11 rounded-card text-[16px] text-ophi-slate active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <div class="flex gap-[6px] p-1 rounded-card bg-[#E7EAED]">
          <button
            v-for="tab of TABS"
            :key="tab.id"
            type="button"
            data-testid="filter-tab"
            :disabled="!tab.enabled"
            :aria-disabled="!tab.enabled"
            :aria-pressed="tab.enabled"
            class="flex items-center justify-center gap-[6px] flex-1 min-h-10 rounded-[9px] font-semibold text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
            :class="tab.enabled
              ? 'bg-white text-ophi-blue shadow-[0_1px_3px_rgb(16_24_40/0.1)]'
              : 'text-ophi-slate/45 cursor-not-allowed'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto px-4 pt-[14px] pb-1">
        <div class="flex items-center mb-[14px] rounded-card bg-white overflow-hidden shadow-[0_1px_3px_rgb(16_24_40/0.1)] has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ophi-blue">
          <span class="grid place-items-center shrink-0 w-[42px] h-11 text-[13px] text-gray-400" aria-hidden="true">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            :value="brandQuery"
            type="search"
            aria-label="Buscar una marca"
            placeholder="Buscar marca…"
            class="flex-1 min-w-0 h-11 bg-transparent text-[14px] text-gray-900 outline-none [&::-webkit-search-cancel-button]:appearance-none"
            @input="onBrandQuery"
          >
        </div>

        <ul v-if="hasBrands" class="flex flex-wrap gap-2">
          <li v-for="brand of brands" :key="brand.id">
            <button
              type="button"
              data-testid="brand-chip"
              :aria-pressed="isPicked(brand)"
              class="flex items-center gap-[7px] min-h-11 px-[13px] rounded-card shadow-[0_1px_3px_rgb(16_24_40/0.1)] font-medium text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
              :class="isPicked(brand) ? 'bg-ophi-blue text-white' : 'bg-white text-ophi-blue'"
              @click="toggle(brand)"
            >
              <i v-if="isPicked(brand)" class="fa-solid fa-check text-[10px]" aria-hidden="true"></i>
              {{ brand.name }}
            </button>
          </li>
        </ul>

        <p v-else class="m-1 text-[13px] leading-[1.5] text-ophi-slate">
          Ninguna marca coincide con eso.
        </p>
      </div>

      <div class="shrink-0 px-4 pt-3 pb-5 border-t border-ophi-border bg-white">
        <div class="flex items-center gap-[10px]">
          <!-- Cancelar is narrow and Aplicar takes the width: the real
               hierarchy, instead of two stacked buttons of equal weight. -->
          <button
            type="button"
            data-testid="cancel-filters"
            class="shrink-0 min-w-24 h-12 px-[14px] rounded-card border-[1.5px] border-[#DDE3E9] bg-white font-semibold text-[14px] text-ophi-slate active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
            @click="emit('close')"
          >
            Cancelar
          </button>

          <!-- The design announced how many results the filters would leave.
               That needs a count the search endpoint does not return, so the
               label stays a plain verb until it does. -->
          <button
            type="button"
            data-testid="apply-filters"
            class="flex items-center justify-center flex-1 h-12 rounded-card bg-ophi-action font-semibold text-[14.5px] text-white active:bg-ophi-green-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-action"
            @click="emit('apply', draft)"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  </template>
</template>
