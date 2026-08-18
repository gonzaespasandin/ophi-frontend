<script setup>
import { computed, onMounted, ref } from 'vue'
import { getListOfAllergies } from '../../services/ingredients.js'
import { useIngredientOptions } from '../../composables/useIngredientOptions.js'
import IngredientOption from './IngredientOption.vue'
import IngredientPickerError from './IngredientPickerError.vue'
import ListOfFullIngredientsModal from './ListOfFullIngredientsModal.vue'
import SkeletonBlock from '../ui/SkeletonBlock.vue'

// Only the first handful is shown per group; the rest live behind the modal.
const PREVIEW_SIZE = 5

const model = defineModel({ type: Array, default: () => [] })

const { options: groups, state, load } = useIngredientOptions(getListOfAllergies)

// One group open at a time, and the first one open on arrival: a column of
// closed rows gives no clue that anything is tappable inside them.
const openGroupId = ref(null)
const expandedGroup = ref(null)

const selectedCountByGroup = computed(() => new Map(
  groups.value.map(group => [
    group.id,
    group.ingredients.filter(ingredient => model.value.includes(ingredient.id)).length,
  ])
))

onMounted(async () => {
  await load()
  openGroupId.value = groups.value[0]?.id ?? null
})

function toggleGroup(group) {
  openGroupId.value = openGroupId.value === group.id ? null : group.id
}
</script>

<template>
  <div v-if="state === 'loading'" class="flex flex-col gap-2.5">
    <SkeletonBlock v-for="n in 4" :key="n" class="h-[52px]" />
    <p class="sr-only" role="status">Cargando alergias…</p>
  </div>

  <div v-else-if="state === 'error'" class="rounded-card bg-white shadow-[0_6px_16px_rgba(0,0,0,.12)]">
    <IngredientPickerError @retry="load" />
  </div>

  <ul v-else class="flex flex-col gap-2.5">
    <li
      v-for="group of groups"
      :key="group.id"
      class="rounded-card overflow-hidden bg-white shadow-[0_6px_16px_rgba(0,0,0,.12)]"
    >
      <h3>
        <button
          type="button"
          :aria-expanded="openGroupId === group.id"
          :aria-controls="`allergy-group-${group.id}`"
          class="flex items-center gap-2.5 w-full min-h-[52px] px-3.5 py-3 bg-ophi-surface text-left active:bg-ophi-blue-soft transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ophi-blue"
          @click="toggleGroup(group)"
        >
          <span class="flex-1 font-semibold text-[14px] text-ophi-blue">{{ group.name }}</span>

          <span
            v-if="selectedCountByGroup.get(group.id) > 0"
            class="grid place-items-center shrink-0 min-w-[22px] h-[22px] px-[7px] rounded-card bg-ophi-action font-semibold text-[11px] text-white"
          >{{ selectedCountByGroup.get(group.id) }}<span class="sr-only"> seleccionados</span></span>

          <i
            class="fa-solid fa-chevron-down shrink-0 text-[12px] text-ophi-blue transition-transform duration-200"
            :class="openGroupId === group.id && 'rotate-180'"
            aria-hidden="true"
          ></i>
        </button>
      </h3>

      <div
        v-if="openGroupId === group.id"
        :id="`allergy-group-${group.id}`"
        class="px-3.5 py-3 border-t border-ophi-border step-in"
      >
        <ul class="flex flex-wrap gap-2">
          <li v-for="ingredient of group.ingredients.slice(0, PREVIEW_SIZE)" :key="ingredient.id">
            <IngredientOption
              v-model="model"
              :value="ingredient.id"
              :label="ingredient.name"
              variant="chip"
            />
          </li>
        </ul>

        <button
          v-if="group.ingredients.length > PREVIEW_SIZE"
          type="button"
          class="flex items-center justify-center gap-2 w-full min-h-11 mt-3 rounded-card border-[1.5px] border-ophi-border bg-ophi-surface font-semibold text-[12.5px] text-ophi-blue active:bg-ophi-blue-soft transition-colors cursor-pointer"
          @click="expandedGroup = group"
        >
          <i class="fa-solid fa-list text-[11px]" aria-hidden="true"></i>Ver la lista completa
        </button>
      </div>
    </li>
  </ul>

  <ListOfFullIngredientsModal
    v-if="expandedGroup"
    v-model="model"
    :list="expandedGroup.ingredients"
    :title="expandedGroup.name"
    @close="expandedGroup = null"
  />
</template>
