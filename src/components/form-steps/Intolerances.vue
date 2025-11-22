<script setup>
import {onMounted, ref, Text} from "vue";
import {getListOfIntolerances} from "../../services/ingredients.js";
import AppLoading from "../AppLoading.vue";

const intolerances = ref([]);
const model = defineModel();
const emit = defineEmits(['next', 'previous']);
const loading = ref(true);
const props = defineProps({
  where: String
})

console.log(props.where);

onMounted(async () => {
  try {
    intolerances.value = await getListOfIntolerances();
    loading.value = false;
  } catch (error) {
    // TODO: Handle error
    console.log('No se pudo traer las intolerancias', error)
  }
})
</script>

<template>
  <div>
      <!-- <button @click.prevent="emit('previous')">Volver</button> -->
    <h2 class="text-2xl font-semibold text-center" :class="props.where === 'addNew' ? 'text-lg' : ''">¿Tenés alguna intolerancia?</h2>

    <template v-if="!loading">
      <p class="text-center mb-4">Seleccioná todas las que correspondan</p>

      <!-- TODO: Pre-load intolerances -->
      <ul class="flex flex-wrap bg-[#f5f5f5] rounded-[11px] p-4">
        <li v-for="intolerance of intolerances" class="text-[#333333]" :class="props.where === 'addNew' ? 'w-42' : 'w-45'">
          <label>
            <input type="checkbox" name="ingredients[]" :value="intolerance.id" v-model="model.ingredients" class="m-3">
            {{ intolerance.name }}
          </label>
        </li>
      </ul>

      <button
          class="action-btn mt-6 w-full"
          @click="emit('next')"
      >Siguiente</button>
    </template>
    <template v-else>
      <div class="flex justify-center mt-30">
        <AppLoading :id="props.where === 'addNew' ? '' : 'load'"></AppLoading>
      </div>
    </template>
  </div>
  
</template>

<style scoped>
  #load {
    color: white;
  }

</style>