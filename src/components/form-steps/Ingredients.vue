<script setup>
import {onBeforeMount, ref} from "vue";
import {getAllIngredients} from "../../services/ingredients.js";

const ingredients = ref([]);
const model = defineModel()
const emit = defineEmits(['next', 'previous'])

onBeforeMount(async () => {
  ingredients.value = await getAllIngredients();
})


</script>

<template>
<!-- Este paso va a ser suplantado eventualmente, porque la idea
 es mostrarle al usuario grupos de ingredientes, en lugar de todos
 los ingredientes a la vez.-->
  <button @click.prevent="emit('previous')">Volver</button>

  <h2 class="text-2xl font-semibold">¿Qué es aquello que deberías evitar?</h2>

  <!-- TODO: Fix shifting -->
  <div v-for="ingredient of ingredients" :key="ingredient.id">
    <label>
      <input type="checkbox" name="ingredients[]" :value="ingredient.id" v-model="model.ingredients">
      {{ ingredient.name }}
    </label>
  </div>

  <button
      class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer"
      @click="emit('next')"
  >Siguiente</button>
</template>