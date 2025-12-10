<script setup>
import AllergiesPicker from "../ingredients/AllergiesPicker.vue";


const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const props = defineProps({
  where: String
})


</script>

<template>
    <!-- <button @click.prevent="emit('previous')">Volver</button> -->
    <div>
      <h2 class="text-2xl font-semibold text-center">¿Tenés alguna alergia?</h2>
      <p class="text-center mb-3 mt-2">Seleccioná todas las que correspondan</p>
    </div>

    <div class="flex flex-col justify-between grow">
      <AllergiesPicker v-model="model.ingredients" />
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

  .modal {
    margin: auto;
    padding: 14px;
    border-radius: 11px;
  }

  .modal::backdrop {
    background-color: rgba(0, 0, 0, 0.685);
  }
</style>