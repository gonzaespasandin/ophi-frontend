<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  suggestions: { type: Array, default: () => [] },
  query: { type: String, default: '' },
})

const emit = defineEmits(['see-all'])

// The API answers with the brand as an object or as a plain string depending on
// the endpoint, and the product route needs its name either way.
function brandName(brand) {
  return typeof brand === 'string' ? brand : (brand?.name ?? '')
}

// Split instead of a regex + v-html: the query is user input, so building markup
// out of it would be both an injection hole and broken for names with brackets.
const rows = computed(() =>
  props.suggestions.map((product) => {
    const name = product.name ?? ''
    const at = props.query ? name.toLowerCase().indexOf(props.query.toLowerCase()) : -1

    return {
      product,
      brand: brandName(product.brand),
      before: at === -1 ? name : name.slice(0, at),
      match: at === -1 ? '' : name.slice(at, at + props.query.length),
      after: at === -1 ? '' : name.slice(at + props.query.length),
    }
  })
)
</script>

<template>
  <section class="step-in">
    <h2 class="mx-1 mb-[10px] font-roboto-slab font-semibold text-[12px] leading-none tracking-[.09em] uppercase text-ophi-blue">
      Sugerencias
    </h2>

    <div class="bg-white rounded-card shadow-card overflow-hidden">
      <RouterLink
        v-for="row of rows"
        :key="row.product.id ?? `${row.product.name}-${row.brand}`"
        data-test="suggestion"
        :to="`/product/${row.product.name}/${row.brand}`"
        class="flex items-center gap-3 w-full min-h-[62px] px-[14px] py-[11px] border-b border-ophi-border active:bg-ophi-surface transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
      >
        <span class="flex-1 min-w-0">
          <span class="block truncate text-[14px] text-gray-900">
            {{ row.before }}<b v-if="row.match" data-test="match" class="font-bold text-ophi-blue">{{ row.match }}</b>{{ row.after }}
          </span>
          <span class="block mt-[2px] text-[12px] text-ophi-slate">{{ row.brand }}</span>
        </span>
        <i class="fa-solid fa-chevron-right shrink-0 text-[12px] text-gray-400" aria-hidden="true"></i>
      </RouterLink>

      <!-- This row *is* the Enter key, made visible: tapping a suggestion opens one
           product sheet, while this opens the full result list on another screen. -->
      <button
        type="button"
        data-test="see-all"
        class="flex items-center gap-3 w-full min-h-[58px] px-[14px] py-[11px] bg-ophi-blue-soft cursor-pointer text-left active:bg-[#D8E7F0] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
        @click="emit('see-all')"
      >
        <span class="grid place-items-center shrink-0 w-[30px] h-[30px] rounded-[9px] bg-ophi-blue text-[12px] text-white" aria-hidden="true">
          <i class="fa-solid fa-list-ul"></i>
        </span>
        <span class="flex-1 min-w-0 truncate font-semibold text-[13.5px] text-ophi-blue">
          Ver todos los resultados de «{{ query }}»
        </span>
        <i class="fa-solid fa-arrow-right shrink-0 text-[12px] text-ophi-blue" aria-hidden="true"></i>
      </button>
    </div>

    <p class="mx-1 mt-3 text-[12px]/[1.5] text-ophi-slate">
      Tocá una sugerencia para ir directo a su ficha, o abrí la lista completa.
    </p>
  </section>
</template>
