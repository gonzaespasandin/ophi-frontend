<script setup>
import { computed, ref } from 'vue'
import ProfileAvatar from '../ui/ProfileAvatar.vue'

const props = defineProps({
  conflicts: { type: Array, default: () => [] },
  totalConflicts: { type: Number, default: null },
  traces: { type: Array, default: () => [] },
  cleanIngredients: { type: Array, default: () => [] },
  filterProfiles: { type: Array, default: () => [] },
  modelValue: { type: Number, default: null },
  singleProfile: { type: Boolean, default: false },
  hasIngredients: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const showCleanIngredients = ref(false)

// Nothing to narrow down when the product is fine for everybody. The count is
// the unfiltered one, so filtering into a clean profile never removes the
// control the user needs to get back out.
const conflictsInProduct = computed(() => props.totalConflicts ?? props.conflicts.length)

const showFilter = computed(() => props.filterProfiles.length > 1 && conflictsInProduct.value > 0)

const conflictTitle = computed(() =>
  props.conflicts.length === 1
    ? '1 ingrediente en conflicto'
    : `${props.conflicts.length} ingredientes en conflicto`
)

const cleanToggleLabel = computed(() =>
  showCleanIngredients.value
    ? `Ocultar los ${props.cleanIngredients.length} sin conflictos`
    : `Ver los ${props.cleanIngredients.length} ingredientes sin conflictos`
)

const traceNames = computed(() => props.traces.map((trace) => trace.name).join(', '))

// "Almendras molidas" collides with "Frutos secos": naming the restriction is
// what makes the hierarchy readable standing in the aisle.
function conflictReason(conflict) {
  const restrictions = conflict.restrictions.map((name) => `"${name}"`).join(' y ')

  if (!restrictions) return ''

  const owner = !props.singleProfile && conflict.profiles.length === 1
    ? ` de ${conflict.profiles[0].name}`
    : ''

  return `Choca con ${restrictions}${owner}`
}
</script>

<template>
  <section class="bg-white rounded-card shadow-card overflow-hidden">
    <div v-if="showFilter && hasIngredients" class="py-3 px-[14px] border-b border-ophi-border">
      <p id="conflict-filter-label" class="mb-[9px] font-medium text-[11.5px] tracking-[.06em] uppercase text-gray-500">
        Ver conflictos de
      </p>

      <div class="flex flex-wrap gap-[7px]" role="group" aria-labelledby="conflict-filter-label">
        <button
          type="button"
          data-testid="filter-all"
          :aria-pressed="modelValue === null"
          class="h-9 px-3 rounded-card border-[1.5px] font-semibold text-[12.5px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
          :class="modelValue === null
            ? 'border-ophi-blue bg-ophi-blue text-white'
            : 'border-ophi-border bg-white text-gray-600'"
          @click="emit('update:modelValue', null)"
        >
          Todos
        </button>

        <button
          v-for="profile of filterProfiles"
          :key="profile.id"
          type="button"
          :data-testid="`filter-${profile.id}`"
          :aria-pressed="modelValue === profile.id"
          class="flex items-center gap-[7px] h-9 pl-1 pr-[11px] rounded-card border-[1.5px] font-semibold text-[12.5px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
          :class="modelValue === profile.id
            ? 'border-ophi-blue bg-ophi-blue text-white'
            : 'border-ophi-border bg-white text-gray-600'"
          @click="emit('update:modelValue', profile.id)"
        >
          <ProfileAvatar :name="profile.name" :color="profile.avatar_color" :size="26" />
          {{ profile.name }}
        </button>
      </div>
    </div>

    <div v-if="!hasIngredients" class="py-5 px-4 text-center">
      <span
        class="grid place-items-center w-12 h-12 mx-auto mb-[11px] rounded-card border-[1.5px] border-dashed border-[#C3CBD3] bg-ophi-surface text-[18px] text-gray-400"
        aria-hidden="true"
      >
        <i class="fa-solid fa-file-circle-question"></i>
      </span>
      <p class="mb-[5px] font-roboto-slab font-semibold text-[14.5px] text-gray-900">
        Todavía no tenemos la lista
      </p>
      <p class="text-[12.5px] leading-[1.5] text-gray-500">
        Sin ingredientes no podemos darte un veredicto para este producto.
      </p>
    </div>

    <div v-else class="py-3 px-[14px]">
      <p
        v-if="conflicts.length"
        class="flex items-center gap-2 mb-[10px] font-semibold text-[13px] text-ophi-danger"
      >
        <i class="fa-solid fa-circle-exclamation text-[13px]" aria-hidden="true"></i>
        {{ conflictTitle }}
      </p>
      <p v-else class="flex items-center gap-2 mb-[10px] font-medium text-[12.5px] text-ophi-green-dark">
        <i class="fa-solid fa-circle-check text-[12px] text-[#009161]" aria-hidden="true"></i>
        Sin conflictos con tu lista
      </p>

      <ul v-if="conflicts.length" class="flex flex-col gap-2">
        <li
          v-for="conflict of conflicts"
          :key="conflict.id"
          class="py-[11px] px-3 rounded-card bg-ophi-danger-soft"
        >
          <div class="flex items-center gap-[9px]">
            <p class="flex-1 min-w-0 font-semibold text-[14px] text-gray-900">{{ conflict.name }}</p>

            <span class="flex items-center shrink-0">
              <span
                v-for="(profile, index) of conflict.profiles"
                :key="profile.id"
                class="rounded-full shadow-[0_0_0_2px_#FDF2F4]"
                :class="{ '-ml-[7px]': index > 0 }"
              >
                <ProfileAvatar :name="profile.name" :color="profile.avatar_color" :size="24" />
              </span>
            </span>
          </div>

          <p class="mt-[5px] text-[12px] leading-[1.4] text-[#8C2F42]">{{ conflictReason(conflict) }}</p>
        </li>
      </ul>

      <div
        v-if="traces.length"
        data-testid="traces"
        class="mt-3 py-[11px] px-3 rounded-card border-[1.5px] border-dashed border-[#E6D3B3] bg-[#FFFBF5]"
      >
        <p class="flex items-center gap-2 mb-1 font-semibold text-[12.5px] text-[#8A5A0B]">
          <i class="fa-solid fa-triangle-exclamation text-[12px]" aria-hidden="true"></i>
          Puede contener trazas
        </p>
        <p class="text-[12px] leading-[1.45] text-[#5A4318]">
          Se elabora en una línea que también procesa <b>{{ traceNames }}</b>. El envase no lo
          garantiza libre.
        </p>
      </div>

      <template v-if="cleanIngredients.length">
        <button
          type="button"
          data-testid="toggle-clean-ingredients"
          :aria-expanded="showCleanIngredients"
          class="flex items-center gap-[9px] mt-3 w-full min-h-11 py-[11px] px-3 rounded-card border-[1.5px] border-ophi-border bg-ophi-surface text-left cursor-pointer active:bg-ophi-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
          @click="showCleanIngredients = !showCleanIngredients"
        >
          <i class="fa-solid fa-list text-[12px] text-gray-500" aria-hidden="true"></i>
          <span class="flex-1 font-medium text-[13px] text-gray-600">{{ cleanToggleLabel }}</span>
          <i
            class="fa-solid fa-chevron-down text-[11px] text-gray-500 transition-transform duration-200"
            :class="{ 'rotate-180': showCleanIngredients }"
            aria-hidden="true"
          ></i>
        </button>

        <p v-if="showCleanIngredients" class="mt-[10px] text-[12.5px] leading-[1.6] text-gray-500">
          {{ cleanIngredients.join(', ') }}
        </p>
      </template>
    </div>
  </section>
</template>
