<script setup>
import SpecialDietsPicker from "../ingredients/SpecialDietsPicker.vue";
import AuthButton from "../auth/AuthButton.vue";

const model = defineModel()
const emit = defineEmits(['next', 'previous'])
</script>

<template>
  <div class="flex flex-col flex-1 step-in">
    <h2 class="mb-1 font-roboto-slab font-bold text-[21px]/[1.2] text-white">¿Seguís alguna dieta especial?</h2>
    <p class="mb-4 text-[13.5px]/[1.5] text-white/80">Seleccioná todas las que correspondan.</p>

    <SpecialDietsPicker v-model="model.ingredients" />

    <div class="flex-1 min-h-[18px]"></div>

    <AuthButton icon="fa-arrow-right" @click="emit('next')">Siguiente</AuthButton>
  </div>
</template>
