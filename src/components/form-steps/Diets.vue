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
  <div>
    <h2 class="text-2xl font-semibold text-center">¿Seguís alguna dieta especial?</h2>
    <p class="mb-3 text-center mt-2">Seleccioná todas las que correspondan</p>
  </div>
  
  <div class="flex flex-col justify-between grow">
    <SpecialDietsPicker v-model="model.ingredients" />
  
    <button
        class="action-btn mt-6 w-full"
        @click="emit('next')"
    >Siguiente</button>
  </div>
</template>
<style scoped>
  #load {
    color: white;
  }

</style>