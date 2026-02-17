<script setup>
import IntolerancesPicker from "../ingredients/IntolerancesPicker.vue";

const model = defineModel();
const emit = defineEmits(['next', 'previous']);
const props = defineProps({
  where: String
})


</script>

<template>
  <div class="flex flex-col grow">
    <button @click.prevent="emit('previous')"><i class="fa-solid fa-chevron-left pe-2"></i>Volver</button>
    <div>
      <h2 class="text-2xl font-semibold text-center">¿Tenés alguna intolerancia?</h2>
      <p class="text-center mb-4 mt-2">Seleccioná todas las que correspondan</p>
    </div>

    <div class="flex flex-col justify-between grow">
        <IntolerancesPicker v-model="model.ingredients" :where="where"/>
    
        <button
            class="action-btn mt-6 w-full"
            @click="emit('next')"
        >Siguiente</button>
    </div>

  </div>
</template>

<style scoped>
  #load {
    color: white;
  }

</style>