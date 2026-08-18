<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], required: true },
  label: { type: String, required: true },
  // 'grid' fills a two-column cell; 'chip' wraps inside an allergy group.
  variant: { type: String, default: 'grid' },
})

const model = defineModel({ type: Array, default: () => [] })

const isSelected = computed(() => model.value.includes(props.value))

const sizeClasses = computed(() => props.variant === 'chip'
  ? 'min-h-11 px-[13px] gap-[7px]'
  : 'min-h-12 px-3 py-2.5 gap-2 text-left'
)

function toggle() {
  model.value = isSelected.value
    ? model.value.filter(id => id !== props.value)
    : [...model.value, props.value]
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="isSelected"
    class="flex items-center w-full rounded-card shadow-[0_1px_3px_rgba(16,24,40,.12)] font-medium text-[13px]/[1.3] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
    :class="[sizeClasses, isSelected ? 'bg-ophi-blue text-white' : 'bg-[#F5F5F5] text-ophi-blue']"
    @click="toggle"
  >
    <i v-if="isSelected" class="fa-solid fa-check shrink-0 text-[11px]" aria-hidden="true"></i>
    <span class="flex-1">{{ label }}</span>
  </button>
</template>
