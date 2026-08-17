<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileAvatar from '../ui/ProfileAvatar.vue'

const COLLAPSED_SAFE_PROFILES = 2

const props = defineProps({
  unsafeProfiles: { type: Array, default: () => [] },
  safeProfiles: { type: Array, default: () => [] },
  unrestrictedProfiles: { type: Array, default: () => [] },
})

const allSafeShown = ref(false)

const hiddenSafeCount = computed(() =>
  Math.max(props.safeProfiles.length - COLLAPSED_SAFE_PROFILES, 0)
)

const visibleSafeProfiles = computed(() =>
  allSafeShown.value ? props.safeProfiles : props.safeProfiles.slice(0, COLLAPSED_SAFE_PROFILES)
)

const unrestrictedNames = computed(() =>
  props.unrestrictedProfiles.map((profile) => profile.name).join(', ')
)

function profileCount(profiles) {
  return profiles.length === 1 ? '1 perfil' : `${profiles.length} perfiles`
}
</script>

<template>
  <div class="flex flex-col gap-[10px]">
    <section v-if="unsafeProfiles.length" class="p-3 rounded-card bg-ophi-danger-soft">
      <div class="flex items-center gap-[9px] mb-[10px]">
        <span
          class="grid place-items-center shrink-0 w-[26px] h-[26px] rounded-full bg-ophi-danger text-[12px] text-white"
          aria-hidden="true"
        >
          <i class="fa-solid fa-xmark"></i>
        </span>
        <h3 class="flex-1 font-semibold text-[14px] text-ophi-danger">
          No apto para {{ profileCount(unsafeProfiles) }}
        </h3>
      </div>

      <ul class="flex flex-col gap-2">
        <li
          v-for="profile of unsafeProfiles"
          :key="profile.id"
          class="flex items-center gap-[10px] py-[10px] px-[11px] rounded-card bg-white"
        >
          <ProfileAvatar :name="profile.name" :color="profile.avatar_color" :size="28" />

          <div class="min-w-0 flex-1">
            <p class="font-semibold text-[13.5px] text-gray-900">{{ profile.name }}</p>
            <ul class="flex flex-wrap gap-[5px] mt-[3px]">
              <li
                v-for="restriction of profile.restrictions"
                :key="restriction"
                class="py-[3px] px-2 rounded-card bg-ophi-danger-soft font-semibold text-[11px] text-ophi-danger"
              >
                {{ restriction }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </section>

    <section v-if="safeProfiles.length" class="p-3 rounded-card bg-ophi-green-soft">
      <div class="flex items-center gap-[9px] mb-[9px]">
        <span
          class="grid place-items-center shrink-0 w-[26px] h-[26px] rounded-full bg-[#009161] text-[12px] text-white"
          aria-hidden="true"
        >
          <i class="fa-solid fa-check"></i>
        </span>
        <h3 class="flex-1 font-semibold text-[14px] text-ophi-green-dark">
          Apto para {{ profileCount(safeProfiles) }}
        </h3>
      </div>

      <ul class="flex flex-wrap items-center gap-[6px]">
        <li
          v-for="profile of visibleSafeProfiles"
          :key="profile.id"
          class="flex items-center gap-[6px] py-1 pl-1 pr-[9px] rounded-card bg-white"
        >
          <ProfileAvatar :name="profile.name" :color="profile.avatar_color" :size="20" />
          <span class="font-medium text-[12px] text-[#0B3D2C]">{{ profile.name }}</span>
        </li>

        <li v-if="hiddenSafeCount">
          <button
            type="button"
            data-testid="toggle-safe-profiles"
            :aria-expanded="allSafeShown"
            class="h-9 px-3 rounded-card border-[1.5px] border-[#CFE7DD] bg-white font-semibold text-[12px] text-ophi-green cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
            @click="allSafeShown = !allSafeShown"
          >{{ allSafeShown ? 'Ver menos' : `+${hiddenSafeCount} más` }}</button>
        </li>
      </ul>
    </section>

    <RouterLink
      v-if="unrestrictedProfiles.length"
      to="/profile"
      data-testid="unrestricted-profiles"
      class="flex items-center gap-[10px] py-[11px] px-3 rounded-card border border-ophi-border bg-ophi-surface active:bg-ophi-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
    >
      <i class="fa-solid fa-circle-info shrink-0 text-[14px] text-gray-400" aria-hidden="true"></i>
      <p class="flex-1 text-[12px] leading-[1.45] text-gray-500">
        Sin restricciones cargadas: <b class="text-gray-600">{{ unrestrictedNames }}</b>
      </p>
      <i class="fa-solid fa-chevron-right shrink-0 text-[11px] text-gray-400" aria-hidden="true"></i>
    </RouterLink>
  </div>
</template>
