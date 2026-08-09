<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, required: true },
})

const isEmpty = computed(() => props.variant === 'empty')
const icon = computed(() => (isEmpty.value ? 'fa-solid fa-users' : 'fa-solid fa-crown'))
const title = computed(() =>
  isEmpty.value ? 'Aún no tenés perfiles familiares' : 'Sumá a toda tu familia'
)
const actionRoute = computed(() => (isEmpty.value ? '/add-new-profile' : '/subscriptions'))
const actionIcon = computed(() => (isEmpty.value ? 'fa-solid fa-plus' : 'fa-solid fa-crown'))
const actionLabel = computed(() => (isEmpty.value ? 'Crear primer perfil' : 'Hacerme premium'))
</script>

<template>
  <div class="mt-4 px-[18px] py-[26px] bg-white rounded-card shadow-card text-center">
    <span
      class="grid place-items-center w-[52px] h-[52px] mx-auto mb-3 rounded-card bg-ophi-blue-soft text-ophi-blue text-[20px]"
    >
      <i :class="icon" aria-hidden="true"></i>
    </span>

    <p class="mb-[5px] font-roboto-slab font-semibold text-[16px] text-gray-900">{{ title }}</p>

    <p v-if="isEmpty" class="mb-4 text-[13px] leading-[1.55] text-gray-500">
      Creá uno por cada persona del hogar y al escanear elegís para quién.
    </p>
    <p v-else class="mb-4 text-[13px] leading-[1.55] text-gray-500">
      Con <span class="font-semibold text-gray-900">premium</span> creás hasta 9 perfiles
      familiares, cada uno con su propia lista de restricciones.
    </p>

    <RouterLink
      :to="actionRoute"
      class="flex items-center justify-center gap-2 w-full h-11 rounded-card bg-ophi-green hover:bg-ophi-green-dark active:bg-ophi-green-dark active:scale-[.98] font-semibold text-[14px] text-white transition"
    >
      <i :class="actionIcon" aria-hidden="true"></i>
      {{ actionLabel }}
    </RouterLink>
  </div>
</template>
