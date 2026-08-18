<script setup>
import { computed, ref } from "vue";
import IntolerancesPicker from "../ingredients/IntolerancesPicker.vue";
import AuthButton from "../auth/AuthButton.vue";

const model = defineModel();
const emit = defineEmits(['next', 'previous']);

const selectedCount = ref(0)

const selectionHint = computed(() => {
  if (selectedCount.value === 0) return 'Podés seguir sin elegir ninguna'

  return selectedCount.value === 1 ? '1 seleccionada' : `${selectedCount.value} seleccionadas`
})
</script>

<template>
  <div class="flex flex-col flex-1 step-in">
    <h2 class="mb-1 font-roboto-slab font-bold text-[21px]/[1.2] text-white">¿Tenés alguna intolerancia?</h2>
    <p class="mb-4 text-[13.5px]/[1.5] text-white/80">Seleccioná todas las que correspondan.</p>

    <IntolerancesPicker v-model="model.ingredients" @update:selected-count="selectedCount = $event" />

    <div class="flex-1 min-h-[18px]"></div>

    <p class="mb-[11px] text-center text-[12.5px] text-white/70">{{ selectionHint }}</p>

    <AuthButton icon="fa-arrow-right" @click="emit('next')">Siguiente</AuthButton>
  </div>
</template>
