<script setup>
import { computed, ref, watch } from 'vue'
import logoPositivo from '../../assets/img/logo-positivo.png'

const props = defineProps({
  modelValue: { type: String, default: '' },
  filterCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'submit', 'back', 'open-filters'])

// The field keeps its own draft so typing never waits on a round trip through
// the parent: the route only changes once the search is actually submitted.
const draft = ref(props.modelValue)

watch(() => props.modelValue, (value) => { draft.value = value })

const hasQuery = computed(() => draft.value.length > 0)
const hasFilters = computed(() => props.filterCount > 0)

const filterLabel = computed(() =>
  hasFilters.value ? `Abrir filtros, ${props.filterCount} activos` : 'Abrir filtros'
)

function onInput(event) {
  draft.value = event.target.value
  emit('update:modelValue', draft.value)
}

function onSubmit() {
  const query = draft.value.trim()

  if (query.length === 0) return

  emit('submit', query)
}

function clearQuery() {
  draft.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="bg-ophi-blue dot-texture-band px-4 pt-3 pb-5 rounded-b-[22px]">
    <div class="flex items-center gap-2 pb-[14px]">
      <button
        type="button"
        aria-label="Volver al buscador"
        class="grid place-items-center shrink-0 -ml-[10px] w-11 h-11 rounded-card text-[17px] text-white active:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="emit('back')"
      >
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </button>

      <h1 class="flex-1 font-poppins font-semibold text-[12px] tracking-[.1em] uppercase text-white/[.78]">
        Resultados
      </h1>

      <img :src="logoPositivo" alt="Ophi" class="shrink-0 w-[88px] h-7 object-contain object-right">
    </div>

    <div class="flex items-center gap-[9px]">
      <!-- The field is a form so the on-screen keyboard offers "buscar" and a
           typo can be fixed here instead of going back a screen. -->
      <form
        class="flex items-center flex-1 min-w-0 rounded-card bg-white overflow-hidden shadow-[0_6px_16px_rgb(0_0_0/0.16)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white"
        role="search"
        @submit.prevent="onSubmit"
      >
        <span class="grid place-items-center shrink-0 w-[42px] h-12 text-[14px] text-gray-400" aria-hidden="true">
          <i class="fa-solid fa-magnifying-glass"></i>
        </span>

        <input
          :value="draft"
          type="search"
          enterkeyhint="search"
          aria-label="Editar la búsqueda"
          class="flex-1 min-w-0 h-12 bg-transparent font-medium text-[15px] text-gray-900 outline-none [&::-webkit-search-cancel-button]:appearance-none"
          @input="onInput"
        >

        <button
          v-if="hasQuery"
          type="button"
          aria-label="Borrar la búsqueda"
          class="grid place-items-center shrink-0 w-[42px] h-12 text-[14px] text-gray-500 active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
          @click="clearQuery"
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </form>

      <button
        type="button"
        data-testid="filter-button"
        :aria-label="filterLabel"
        class="relative grid place-items-center shrink-0 w-12 h-12 rounded-card text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        :class="hasFilters
          ? 'bg-white text-ophi-blue shadow-[0_6px_16px_rgb(0_0_0/0.16)]'
          : 'bg-white/15 border border-white/35 text-white active:bg-white/30'"
        @click="emit('open-filters')"
      >
        <i class="fa-solid fa-filter" aria-hidden="true"></i>

        <span
          v-if="hasFilters"
          class="grid place-items-center absolute -top-[5px] -right-[5px] min-w-5 h-5 px-[5px] rounded-[10px] bg-ophi-action font-bold text-[11px] text-white ring-2 ring-ophi-blue"
          aria-hidden="true"
        >{{ filterCount }}</span>
      </button>
    </div>
  </div>
</template>
