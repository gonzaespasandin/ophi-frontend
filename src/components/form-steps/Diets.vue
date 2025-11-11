<script setup>
import {onMounted, ref} from "vue";
import {getListOfSpecialDiets} from "../../services/ingredients.js";

const specialDiets = ref([])
const model = defineModel()
const emit = defineEmits(['next', 'previous'])

onMounted(async () => {
  try {
    specialDiets.value = await getListOfSpecialDiets()
  } catch (error) {
    // TODO: Handle error
    console.log('No se pudo traer las intolerancias', error)
  }
})
</script>

<template>
  <button @click.prevent="emit('previous')">Volver</button>
  <h2 class="text-2xl font-semibold">¿Seguís alguna dieta especial?</h2>

  <p>Seleccioná todas las que correspondan</p>

  <!-- TODO: Pre-load specialDiets -->
  <ul>
    <li v-for="diet of specialDiets">
      <label>
        <input type="checkbox" name="ingredients[]" :value="diet.id" v-model="model.ingredients">
        {{ diet.name }}
      </label>
    </li>
  </ul>

  <button
      class="action-btn mt-6 w-full"
      @click="emit('next')"
  >Siguiente</button>
</template>