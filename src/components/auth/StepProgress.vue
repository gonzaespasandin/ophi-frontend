<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})

const segments = computed(() =>
  Array.from({ length: props.total }, (_, index) => index + 1 <= props.current)
)
</script>

<template>
  <div
    class="flex gap-[5px]"
    role="progressbar"
    aria-label="Progreso del registro"
    :aria-valuenow="current"
    :aria-valuemin="1"
    :aria-valuemax="total"
  >
    <span
      v-for="(isDone, index) of segments"
      :key="index"
      data-testid="step-segment"
      class="flex-1 h-[5px] rounded-card transition-colors duration-300"
      :class="isDone ? 'bg-ophi-action' : 'bg-[#DCE0E4]'"
    ></span>
  </div>
</template>
