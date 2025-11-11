<script setup>
import {onMounted, ref} from "vue";
import {getListOfIntolerances} from "../../services/ingredients.js";

const intolerances = ref([])
const model = defineModel()
const emit = defineEmits(['next', 'previous'])

onMounted(async () => {
  try {
    intolerances.value = await getListOfIntolerances()
  } catch (error) {
    // TODO: Handle error
    console.log('No se pudo traer las intolerancias', error)
  }
})
</script>

<template>
  <button @click.prevent="emit('previous')">Volver</button>
  <h2 class="text-2xl font-semibold">¿Tenés alguna intolerancia?</h2>

  <p>Seleccioná todas las que correspondan</p>

  <!-- TODO: Pre-load intolerances -->
  <ul>
    <li v-for="intolerance of intolerances">
      <label>
        <input type="checkbox" name="ingredients[]" :value="intolerance.id" v-model="model.ingredients">
        {{ intolerance.name }}
      </label>
    </li>
  </ul>

  <button
      class="action-btn mt-6 w-full"
      @click="emit('next')"
  >Siguiente</button>
</template>