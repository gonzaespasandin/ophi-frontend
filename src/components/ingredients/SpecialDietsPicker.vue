<script setup>
import {onMounted, ref} from "vue";
import {getListOfSpecialDiets} from "../../services/ingredients.js";
import AppLoading from "../loadings/AppLoading.vue";

const props = defineProps(['where']);
const model = defineModel();

const loading = ref(false);
const specialDiets = ref([]);

onMounted(async () => {
  loading.value = true;

  try {
    console.log({model});
    console.log('Getting special diets')
    specialDiets.value = await getListOfSpecialDiets();
  } catch (error) {
    // TODO: Handle error
    console.log('No se pudo traer las intolerancias', error);
  }

  loading.value = false;
})
</script>

<template>
  <div v-if="loading" class="flex justify-center mt-10">
    <AppLoading  id="load"/>
  </div>

  <template v-else>
    <ul class="flex flex-wrap gap-2 justify-between bg-white rounded-[11px] p-3 text-[#333333]">
      <li v-for="diet of specialDiets"  class="w-45">
        <label class="block w-full h-full  rounded-[11px] shadow-sm  font-medium" :class="model.includes(diet.id) ? 'bg-[#005B8E] text-white' : 'bg-[#f5f5f5] text-[#005B8E]'">
          <input type="checkbox" name="ingredients[]" :value="diet.id" v-model="model" class="m-3">
          {{ diet.name }}
        </label>
      </li>
    </ul>
  </template>
</template>

<style scoped>
#load {
  color: white;
}

</style>