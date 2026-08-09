<script setup>
import { computed } from 'vue'
import { useRestrictionPreview } from '../../composables/useRestrictionPreview.js'

const props = defineProps({
  profile: { type: Object, required: true },
})

const emit = defineEmits(['delete'])

const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(
  () => props.profile.ingredients
)

const editRoute = computed(() => `/profile/${props.profile.id}/edit`)
const avatarColor = computed(() => props.profile.avatar_color ?? '#005B8E')
const avatarInitial = computed(() => (props.profile.name ?? '').charAt(0).toUpperCase())
</script>

<template>
  <li class="bg-white rounded-card shadow-card overflow-hidden">
    <div class="flex items-center gap-3 px-4 py-[14px]">
      <span
        data-testid="family-avatar"
        class="grid place-items-center shrink-0 w-[46px] h-[46px] rounded-full font-roboto-slab font-semibold text-[18px] text-white"
        :style="{ backgroundColor: avatarColor }"
        aria-hidden="true"
      >{{ avatarInitial }}</span>

      <div class="flex-1 min-w-0">
        <p class="mb-[2px] font-roboto-slab font-semibold text-[15px] text-gray-900">
          {{ profile.name }}
        </p>
        <p v-if="hasRestrictions" class="text-[12.5px] text-gray-500 truncate">
          {{ preview }}<span v-if="hiddenCount > 0"> y {{ hiddenCount }} más</span>
        </p>
        <p v-else class="text-[12.5px] text-gray-500 truncate">Sin restricciones cargadas</p>
      </div>
    </div>

    <div class="flex border-t border-ophi-border">
      <RouterLink
        :to="editRoute"
        :aria-label="`Editar a ${profile.name}`"
        class="flex flex-1 items-center justify-center gap-[7px] h-[46px] font-semibold text-[13px] text-ophi-blue hover:bg-ophi-blue-soft active:bg-ophi-blue-soft transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
      >
        <i class="fa-solid fa-pen" aria-hidden="true"></i>
        Editar
      </RouterLink>
      <button
        type="button"
        :aria-label="`Eliminar a ${profile.name}`"
        class="flex flex-1 items-center justify-center gap-[7px] h-[46px] border-l border-ophi-border font-semibold text-[13px] text-ophi-danger cursor-pointer hover:bg-ophi-danger-soft active:bg-ophi-danger-soft transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-danger"
        @click="emit('delete', profile)"
      >
        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
        Eliminar
      </button>
    </div>
  </li>
</template>
