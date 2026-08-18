<script setup>
import { computed } from 'vue'
import FieldError from './FieldError.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: null },
})

const model = defineModel({ type: String, default: '' })

const errorId = computed(() => `${props.id}-error`)
</script>

<template>
  <div>
    <label :for="id" class="block mb-[7px] font-medium text-[13px] text-white/90">{{ label }}</label>

    <input
      :id="id"
      :type="type"
      v-model="model"
      v-bind="$attrs"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      class="w-full h-12 px-3.5 rounded-card bg-white text-[15px] text-[#111827] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      :class="error ? 'border-2 border-ophi-danger' : 'border-[1.5px] border-transparent'"
    >

    <FieldError v-if="error" :id="errorId" :message="error" />
  </div>
</template>
