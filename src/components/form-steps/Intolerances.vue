<script setup>
import IntolerancesPicker from "../ingredients/IntolerancesPicker.vue";

const model = defineModel();
const emit = defineEmits(['next', 'previous']);
const props = defineProps({
  where: String
})

console.log(props.where);
</script>

<template>
  <div>
      <!-- <button @click.prevent="emit('previous')">Volver</button> -->
    <h2 class="text-2xl font-semibold text-center" :class="props.where === 'addNew' ? 'text-lg' : ''">¿Tenés alguna intolerancia?</h2>

      <p class="text-center mb-4">Seleccioná todas las que correspondan</p>

      <IntolerancesPicker v-model="model.ingredients"/>

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