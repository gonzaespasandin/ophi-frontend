<script setup>
import { computed } from 'vue'
import InfoCard from '../ui/InfoCard.vue'
import { useRestrictionPreview } from '../../composables/useRestrictionPreview.js'

const props = defineProps({
  profileId: { type: [Number, String], required: true },
  ingredients: { type: Array, default: () => [] },
})

const editRoute = computed(() => `/profile/${props.profileId}/edit`)
const { hasRestrictions, preview, hiddenCount } = useRestrictionPreview(() => props.ingredients)
</script>

<template>
  <InfoCard icon="fa-solid fa-wheat-awn-circle-exclamation" title="Restricción alimenticia">
    <RouterLink
      v-if="hasRestrictions"
      :to="editRoute"
      class="flex items-center gap-3 px-4 py-[15px] hover:bg-ophi-surface active:bg-ophi-surface transition-colors"
    >
      <span class="flex-1 min-w-0">
        <span class="block mb-[3px] font-semibold text-[14px] text-gray-900">
          {{ preview }}
          <span v-if="hiddenCount > 0" class="font-normal text-gray-500">y {{ hiddenCount }} más</span>
        </span>
        <span class="block text-[12px] text-gray-500">Toca para editar la lista completa</span>
      </span>
      <i class="fa-solid fa-chevron-right text-ophi-green text-[13px]" aria-hidden="true"></i>
    </RouterLink>

    <div v-else class="p-4">
      <p class="mb-3 text-[13px] text-gray-500">
        Todavía no cargaste restricciones para este perfil.
      </p>
      <RouterLink
        :to="editRoute"
        class="flex items-center justify-center gap-2 w-full h-11 rounded-card bg-ophi-green hover:bg-ophi-green-dark active:bg-ophi-green-dark active:scale-[.98] text-white font-semibold text-[14px] transition"
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        Agregar restricciones
      </RouterLink>
    </div>
  </InfoCard>
</template>
