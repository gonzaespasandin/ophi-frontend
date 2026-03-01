<script setup>
import {onMounted, ref} from 'vue';
import {getListOfAllergies} from "../../services/ingredients.js";
import AppLoading from "../loadings/AppLoading.vue";
import ListOfFullIngredientsModal from "./ListOfFullIngredientsModal.vue";

const props = defineProps({
  where: String,
  loadingTheme: {
    type: String,
    default: 'blue'
  },
})
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
    <AppLoading  id="load" :class="props.loadingTheme"/>
  </div>

  <ul v-else class="space-y-3 p-3 rounded-[11px] bg-white">
    <li v-for="allergy of allergies" :key="allergy.id">
      <div class=" text-[#005B8E] bg-[#f5f5f5] rounded-[11px] shadow-sm overflow-hidden">

        <button
          type="button"
          class="w-full flex justify-between items-center p-4 font-medium"
          @click="allergy.open = !allergy.open"
        >
          {{ allergy.name }}
          <!-- quantity of ingredients selected -->
          ({{ allergy.ingredients.reduce((v, i) => model.includes(i.id) ? v + 1 : v, 0)}})
          <span
            :class="allergy.open ? 'rotate-180 transition-transform' : 'transition-transform'"
          >
          <i class="fa-solid fa-chevron-down"></i>
          </span>
        </button>

        <div v-if="allergy.open" class="p-4 border-t border-black/20 max-h-0 desplegar" :class="allergy.open ? 'max-h-full transition-all delay-400 duration-200' : 'transition-all duration-100'">
          <ul class="flex flex-wrap gap-2">
            <template v-for="(ingredient, i) of allergy.ingredients.slice(0, 5)" :key="i">
              <li>
                <label
                  class="flex items-center gap-2 px-3 py-1 rounded-[11px] shadow-md cursor-pointer transition"
                  :class="model.includes(ingredient.id) ? 'bg-[#005B8E] text-white' : 'bg-white text-[#005B8E]'"
                >
                  <input
                    type="checkbox"
                    :value="ingredient.id"
                    v-model="model"
                  >
                  {{ ingredient.name }}
                </label>
              </li>
            </template>
          </ul>

          <button
            type="button"
            class="mt-4 text-sm text-[#005B8E] cursor-pointer hover:underline"
            @click="handleShowFullList(allergy.ingredients)"
          >
            Mostrar lista completa
          </button>

          <ListOfFullIngredientsModal @close="showModal = false" v-if="showModal" v-model="model" :list class="modal"/>
        </div>
      </div>
    </li>
  </ul>

</template>

<style scoped>
#load.blue {
  color: #005b8e;
}

#load.white {
  color: white;
}
</style>