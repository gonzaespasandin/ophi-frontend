<script setup>
import { computed, onMounted, watch } from 'vue'
import { useIngredientOptions } from '../../composables/useIngredientOptions.js'
import IngredientOption from './IngredientOption.vue'
import IngredientPickerError from './IngredientPickerError.vue'
import SkeletonBlock from '../ui/SkeletonBlock.vue'

const props = defineProps({
  fetchOptions: { type: Function, required: true },
  label: { type: String, required: true },
})

const model = defineModel({ type: Array, default: () => [] })

const emit = defineEmits(['update:selectedCount'])

const { options, state, load } = useIngredientOptions(props.fetchOptions)

// The wizard keeps every restriction in one flat array, so a step cannot count
// its own answers by reading the model's length — only the intersection with
// the options this picker actually offers means anything.
const selectedCount = computed(() =>
  options.value.filter(option => model.value.includes(option.id)).length
)

watch(selectedCount, count => emit('update:selectedCount', count), { immediate: true })

onMounted(load)
</script>

<template>
  <div class="p-3 rounded-card bg-white shadow-[0_6px_16px_rgba(0,0,0,.12)]">
    <!-- Skeletons keep the two-column grid, so the step does not jump in height
         the moment the real list lands. -->
    <div v-if="state === 'loading'" class="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2">
      <SkeletonBlock v-for="n in 6" :key="n" class="h-12" />
      <p class="sr-only" role="status">Cargando opciones…</p>
    </div>

    <IngredientPickerError v-else-if="state === 'error'" @retry="load" />

    <ul
      v-else
      class="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2"
      role="group"
      :aria-label="label"
    >
      <li v-for="option of options" :key="option.id">
        <IngredientOption v-model="model" :value="option.id" :label="option.name" />
      </li>
    </ul>
  </div>
</template>
