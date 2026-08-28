<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ResultVerdictChip from './ResultVerdictChip.vue'

const props = defineProps({
  product: { type: Object, required: true },
  profiles: { type: Array, default: () => [] },
})

const brandName = computed(() => props.product.brand?.name ?? '')

// The product detail is resolved by name and brand, so a product without a
// brand has no route to offer.
const productRoute = computed(() =>
  brandName.value ? `/product/${props.product.name}/${brandName.value}` : null
)

const ingredients = computed(() => props.product.ingredients ?? [])
</script>

<template>
  <li class="border-b border-ophi-border last:border-b-0">
    <component
      :is="productRoute ? RouterLink : 'div'"
      :to="productRoute ?? undefined"
      class="flex items-center gap-3 w-full min-h-[74px] px-[14px] py-3 text-left transition-colors"
      :class="productRoute
        ? 'active:bg-ophi-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue'
        : ''"
    >
      <img
        v-if="product.img"
        :src="product.img"
        :alt="product.img_alt ?? ''"
        class="shrink-0 w-12 h-12 rounded-card object-cover"
      >
      <span
        v-else
        data-testid="row-photo-placeholder"
        class="grid place-items-center shrink-0 w-12 h-12 rounded-card bg-ophi-blue-soft bg-[repeating-linear-gradient(135deg,rgb(0_91_142/0.1)_0_6px,transparent_6px_12px)] text-[#5B7F97]"
        aria-hidden="true"
      >
        <i class="fa-solid fa-camera text-[13px]"></i>
      </span>

      <span class="flex-1 min-w-0">
        <span class="block truncate font-semibold text-[14px] text-gray-900">{{ product.name }}</span>
        <span v-if="brandName" class="block mt-[2px] mb-[5px] truncate text-[12px] text-ophi-slate">{{ brandName }}</span>
        <ResultVerdictChip :profiles="profiles" :ingredients="ingredients" />
      </span>

      <i v-if="productRoute" class="fa-solid fa-chevron-right shrink-0 text-[12px] text-gray-400" aria-hidden="true"></i>
    </component>
  </li>
</template>
