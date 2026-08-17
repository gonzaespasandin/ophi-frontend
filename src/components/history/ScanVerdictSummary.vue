<script setup>
import { computed, ref } from 'vue'
import ProfileAvatar from '../ui/ProfileAvatar.vue'

const CHIPS_BEFORE_COLLAPSE = 4

const props = defineProps({
  results: { type: Array, default: () => [] },
})

const showEveryChip = ref(false)

function toProfile(result) {
  return {
    id: result.id ?? result.profile_id,
    name: result.profile?.name ?? result.profile_name ?? 'Perfil eliminado',
    color: result.profile?.avatar_color ?? null,
    unsafeIngredients: result.unsafe_ingredients ?? [],
  }
}

const safeProfiles = computed(() => props.results.filter((r) => r.is_safe).map(toProfile))
const unsafeProfiles = computed(() => props.results.filter((r) => !r.is_safe).map(toProfile))

const isSingleProfile = computed(() => props.results.length === 1)
const singleVerdictIsSafe = computed(() => props.results[0]?.is_safe === true)
const singleUnsafeIngredients = computed(() => unsafeProfiles.value[0]?.unsafeIngredients ?? [])

const visibleSafeChips = computed(() =>
  showEveryChip.value ? safeProfiles.value : safeProfiles.value.slice(0, CHIPS_BEFORE_COLLAPSE)
)
const hiddenSafeCount = computed(() =>
  Math.max(safeProfiles.value.length - CHIPS_BEFORE_COLLAPSE, 0)
)
const toggleLabel = computed(() => (showEveryChip.value ? 'Ver menos' : `+${hiddenSafeCount.value} más`))

function countLabel(total, verdict) {
  return total === 1 ? `${verdict} para 1 perfil` : `${verdict} para ${total} perfiles`
}

const safeHeading = computed(() => countLabel(safeProfiles.value.length, 'Apto'))
const unsafeHeading = computed(() => countLabel(unsafeProfiles.value.length, 'No apto'))
</script>

<template>
  <div>
    <p class="mb-[10px] font-semibold text-[11.5px] tracking-[.08em] uppercase text-gray-500">
      Resultados
    </p>

    <!-- Single profile: the verdict speaks directly to the person scanning. -->
    <div v-if="isSingleProfile" class="flex items-center gap-[10px] p-3 rounded-card bg-white">
      <span
        class="grid place-items-center shrink-0 w-[26px] h-[26px] rounded-full text-[12px] text-white"
        :class="singleVerdictIsSafe ? 'bg-[#009161]' : 'bg-ophi-danger'"
        aria-hidden="true"
      >
        <i :class="singleVerdictIsSafe ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"></i>
      </span>
      <div class="min-w-0">
        <p
          class="font-semibold text-[13.5px]"
          :class="singleVerdictIsSafe ? 'text-ophi-green-dark' : 'text-ophi-danger'"
        >{{ singleVerdictIsSafe ? 'Apto para vos' : 'No apto para vos' }}</p>
        <p v-if="singleVerdictIsSafe" class="mt-[2px] text-[12px] leading-[1.4] text-gray-600">
          Ningún ingrediente de tu lista.
        </p>
        <p v-else class="mt-[2px] text-[12px] leading-[1.4] text-ophi-danger">
          {{ singleUnsafeIngredients.join(' · ') }}
        </p>
      </div>
    </div>

    <div v-else class="flex flex-col gap-2">
      <!-- Safe profiles are a count with avatar chips: with up to 10 profiles a
           per-person list would eat the whole screen. -->
      <div v-if="safeProfiles.length > 0" class="p-3 rounded-card bg-white">
        <div class="flex items-center gap-[9px] mb-[9px]">
          <span
            class="grid place-items-center shrink-0 w-[26px] h-[26px] rounded-full bg-[#009161] text-[12px] text-white"
            aria-hidden="true"
          >
            <i class="fa-solid fa-check"></i>
          </span>
          <p class="font-semibold text-[13.5px] text-ophi-green-dark">{{ safeHeading }}</p>
        </div>

        <ul class="flex flex-wrap gap-[6px] items-center">
          <li
            v-for="profile of visibleSafeChips"
            :key="profile.id"
            class="flex items-center gap-[6px] py-1 pl-1 pr-[9px] rounded-card bg-ophi-green-soft"
          >
            <ProfileAvatar :name="profile.name" :color="profile.color" :size="20" />
            <span class="font-medium text-[12px] text-[#0B3D2C]">{{ profile.name }}</span>
          </li>

          <li v-if="hiddenSafeCount > 0">
            <button
              type="button"
              class="h-9 px-3 rounded-card border-[1.5px] border-[#CFE7DD] bg-white font-semibold text-[12px] text-ophi-green cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
              :aria-expanded="showEveryChip"
              @click="showEveryChip = !showEveryChip"
            >{{ toggleLabel }}</button>
          </li>
        </ul>
      </div>

      <!-- Unsafe profiles are detailed one by one: here every case matters. -->
      <div v-if="unsafeProfiles.length > 0" class="p-3 rounded-card bg-white">
        <div class="flex items-center gap-[9px] mb-[9px]">
          <span
            class="grid place-items-center shrink-0 w-[26px] h-[26px] rounded-full bg-ophi-danger text-[12px] text-white"
            aria-hidden="true"
          >
            <i class="fa-solid fa-xmark"></i>
          </span>
          <p class="font-semibold text-[13.5px] text-ophi-danger">{{ unsafeHeading }}</p>
        </div>

        <ul class="flex flex-col gap-2">
          <li
            v-for="profile of unsafeProfiles"
            :key="profile.id"
            class="flex items-center gap-[9px] py-[9px] px-[11px] rounded-card bg-ophi-danger-soft"
          >
            <ProfileAvatar :name="profile.name" :color="profile.color" :size="24" />
            <div class="flex-1 min-w-0">
              <p class="mb-[3px] font-semibold text-[12.5px] text-gray-900">{{ profile.name }}</p>
              <p class="text-[11.5px] leading-[1.35] text-ophi-danger">
                {{ profile.unsafeIngredients.join(' · ') }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
