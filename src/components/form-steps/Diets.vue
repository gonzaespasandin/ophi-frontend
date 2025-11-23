<script setup>
import {ref} from "vue";
import SpecialDietsPicker from "../ingredients/SpecialDietsPicker.vue";

const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const props = defineProps({
  where: String
})
</script>

<template>
  <!-- <button @click.prevent="emit('previous')">Volver</button> -->
  <h2 class="text-2xl font-semibold text-center">¿Seguís alguna dieta especial?</h2>

    <p class="mb-3 text-center">Seleccioná todas las que correspondan</p>

    <SpecialDietsPicker v-model="model.ingredients" />

    <button
        class="action-btn mt-6 w-full"
        @click="emit('next')"
    >Siguiente</button>
</template>
<style scoped>
  #load {
    color: white;
  }

</style>