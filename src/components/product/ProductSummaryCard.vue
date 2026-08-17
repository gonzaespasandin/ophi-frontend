<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
})

const brandLine = computed(() =>
  [props.product.brand?.name, props.product.weight].filter(Boolean).join(' · ')
)
</script>

<template>
  <section class="bg-white rounded-card shadow-card overflow-hidden">
    <div
      class="flex items-center gap-[13px] p-[14px]"
      :class="{ 'border-b border-ophi-border': $slots.default }"
    >
      <img
        v-if="product.img"
        :src="product.img"
        :alt="product.img_alt ?? ''"
        class="shrink-0 w-[78px] h-[78px] rounded-card object-cover"
      >
      <div
        v-else
        class="grid place-items-center shrink-0 w-[78px] h-[78px] p-1 overflow-hidden rounded-card bg-ophi-blue-soft bg-[repeating-linear-gradient(135deg,rgb(0_91_142/0.1)_0_6px,transparent_6px_12px)]"
      >
        <p class="text-center text-[9px] leading-[1.35] text-[#5B7F97]">
          <i class="fa-solid fa-camera block mb-1 text-[13px]" aria-hidden="true"></i>
          Ophi todavía no tiene la foto
        </p>
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="font-roboto-slab font-bold text-[18px] leading-[1.2] text-gray-900">
          {{ product.name }}
        </h2>
        <p v-if="brandLine" class="mt-[3px] font-medium text-[13px] text-gray-500">{{ brandLine }}</p>
      </div>
    </div>

    <div v-if="$slots.default" class="p-[14px]">
      <slot />
    </div>
  </section>
</template>
