<script setup>
import {onMounted, ref} from 'vue';
import {getListOfAllergies} from "../../services/ingredients.js";
import AppLoading from "../loadings/AppLoading.vue";
import ListOfFullIngredientsModal from "./ListOfFullIngredientsModal.vue";

const props = defineProps(['where']);
const model = defineModel();

const list = ref([])
const loading = ref(true);
const allergies = ref([]);
const showModal = ref(false)

onMounted(async () => {
  try {
    allergies.value = await getListOfAllergies();
    loading.value = false;
  } catch (error) {
    console.log('No se pudo traer las alergias', error)
  }
})

function handleShowFullList(argList) {
  console.log(argList)
  list.value = argList
  showModal.value = true
}
</script>

<template>
  <div v-if="loading" class="flex justify-center mt-10">
    <AppLoading  id="load"/>
  </div>

  <template v-else>
    <ul class="bg-[#f5f5f5] rounded-[11px] text-[#333333] p-3">
      <li v-for="allergy of allergies">
        <details>
          <summary>{{ allergy.name }}</summary>

          <ul>
            <template v-for="(ingredient, i) of allergy.ingredients" :key="i">
              <li v-if="ingredient.is_group || model.includes(ingredient.id)">
                <label>
                  <input type="checkbox" name="ingredients[]" :value="ingredient.id" v-model="model">
                  {{ ingredient.name }}
                </label>
              </li>
            </template>
          </ul>

          <button type="button" @click="handleShowFullList(allergy.ingredients)">Mostrar lista completa</button>
        </details>
      </li>
    </ul>

    <ListOfFullIngredientsModal @close="showModal = false" v-if="showModal" v-model="model" :list class="modal"/>
  </template>
</template>

<style scoped>
#load {
  color: white;
}

</style>