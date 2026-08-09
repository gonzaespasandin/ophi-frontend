<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  avatarColor: { type: String, default: '#005B8E' },
})

const emit = defineEmits(['cancel', 'confirm'])

const initial = computed(() => props.name.charAt(0).toUpperCase())
const color = computed(() => props.avatarColor ?? '#005B8E')
</script>

<template>
  <div>
    <div class="px-5 py-[22px] text-center">
      <span
        data-testid="delete-dialog-avatar"
        class="grid place-items-center w-[60px] h-[60px] mx-auto mb-3 rounded-full font-roboto-slab font-semibold text-[24px] text-white shadow-[0_0_0_3px_rgb(16_24_40/.06)]"
        :style="{ backgroundColor: color }"
        aria-hidden="true"
      >{{ initial }}</span>

      <h3
        id="profile-dialog-title"
        class="mb-[6px] font-roboto-slab font-semibold text-[18px] text-gray-900"
      >¿Eliminar a {{ name }}?</h3>

      <p class="text-[13.5px] leading-[1.55] text-gray-600">
        Se borra el perfil y sus restricciones.
      </p>

      <p
        class="inline-flex items-center gap-[7px] mt-[10px] px-[11px] py-2 rounded-card bg-ophi-danger-soft font-medium text-[12.5px] text-ophi-danger"
      >
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        No se puede deshacer
      </p>
    </div>

    <div class="flex border-t border-ophi-border">
      <button
        data-testid="cancel-delete-profile"
        type="button"
        class="flex-1 h-[52px] font-semibold text-[14px] text-gray-700 cursor-pointer hover:bg-[#F5F7F9] active:bg-[#F5F7F9] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-blue"
        @click="emit('cancel')"
      >Cancelar</button>
      <button
        data-testid="confirm-delete-profile"
        type="button"
        class="flex-1 h-[52px] border-l border-ophi-border font-bold text-[14px] text-ophi-danger cursor-pointer hover:bg-ophi-danger-soft active:bg-ophi-danger-soft transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ophi-danger"
        @click="emit('confirm')"
      >Eliminar</button>
    </div>
  </div>
</template>
