<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileAvatar from '../ui/ProfileAvatar.vue'

const STACKED_AVATARS = 3

const props = defineProps({
  product: { type: Object, required: true },
  profiles: { type: Array, default: () => [] },
  active: { type: Boolean, default: false },
})

const productRoute = computed(
  () => `/product/${props.product.name}/${props.product.brand?.name ?? ''}`
)

const brandName = computed(() => props.product.brand?.name ?? '')

// The API tells us which profiles can eat this. An older payload without the
// field means the product was already filtered for the whole household.
const safeProfileIds = computed(() => props.product.safe_for_profile_ids ?? null)

const audience = computed(() => {
  if (safeProfileIds.value === null) return props.profiles

  return props.profiles.filter((profile) => safeProfileIds.value.includes(profile.id))
})

const isForEveryProfile = computed(
  () => props.profiles.length > 0 && audience.value.length === props.profiles.length
)

const stackedProfiles = computed(() => audience.value.slice(0, STACKED_AVATARS))

const audienceLabel = computed(() => {
  if (audience.value.length === 1) return `Apto para ${audience.value[0].name}`
  if (isForEveryProfile.value || audience.value.length === 0) return 'Apto para todos'

  return `Apto para ${audience.value.length} perfiles`
})
</script>

<template>
  <RouterLink
    :to="productRoute"
    class="flex flex-col gap-[10px] w-[250px] p-3 rounded-card bg-ophi-blue box-border transition-[height,filter,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
    :class="active
      ? 'h-[252px] shadow-[0_10px_26px_rgb(16_24_40/0.22)]'
      : 'h-[212px] shadow-[0_2px_8px_rgb(16_24_40/0.1)] brightness-[.52] saturate-[.85]'"
  >
    <!-- The photo absorbs whatever the fixed rows below leave over, so the name
         and the brand always keep their place whatever the card height is. -->
    <img
      v-if="product.img"
      :src="product.img"
      :alt="product.img_alt ?? ''"
      class="flex-1 min-h-0 w-full rounded-card object-cover"
    >
    <div
      v-else
      class="grid place-items-center flex-1 min-h-0 w-full px-3 overflow-hidden rounded-card bg-ophi-blue-soft bg-[repeating-linear-gradient(135deg,rgb(0_91_142/0.1)_0_6px,transparent_6px_12px)]"
    >
      <p class="text-center text-[11px] leading-[1.4] text-[#5B7F97]">
        <i class="fa-solid fa-camera block mb-[6px] text-[14px]" aria-hidden="true"></i>
        Ups, Ophi todavía no tiene la foto de este producto
      </p>
    </div>

    <div class="shrink-0">
      <p class="truncate font-semibold text-[15px] leading-[1.3] text-white">
        {{ product.name }}
      </p>
      <p v-if="brandName" class="mt-[3px] truncate text-[12px] text-white/70">{{ brandName }}</p>
    </div>

    <div class="flex items-center gap-[9px] shrink-0 py-2 px-[10px] rounded-card bg-[#F5F5F5]">
      <span v-if="stackedProfiles.length === 1" class="shrink-0">
        <ProfileAvatar
          :name="stackedProfiles[0].name"
          :color="stackedProfiles[0].avatar_color"
          :size="26"
        />
      </span>

      <span v-else-if="stackedProfiles.length > 1" class="flex items-center shrink-0">
        <span
          v-for="(profile, index) of stackedProfiles"
          :key="profile.id"
          class="rounded-full shadow-[0_0_0_2px_#F5F5F5]"
          :class="{ '-ml-[9px]': index > 0 }"
        >
          <ProfileAvatar :name="profile.name" :color="profile.avatar_color" :size="26" />
        </span>
      </span>

      <span class="min-w-0">
        <span class="block truncate font-medium text-[11.5px] text-ophi-blue">{{ audienceLabel }}</span>
        <span class="block mt-px font-bold text-[12px] tracking-[.04em] text-ophi-blue">RECOMENDADO</span>
      </span>
    </div>
  </RouterLink>
</template>
