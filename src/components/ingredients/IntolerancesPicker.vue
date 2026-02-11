<script setup>
import {handleError, onMounted, ref} from "vue";
import {getListOfIntolerances} from "../../services/ingredients.js";
import AppLoading from "../loadings/AppLoading.vue";;

const props = defineProps(['where']);
const model = defineModel();

const loading = ref(false);
const intolerances = ref([]);


onMounted(async () => {
  loading.value = true;

  try {
    console.log({model});
    console.log('Getting intolerances')
    intolerances.value = await getListOfIntolerances();
    console.log({Intolerances: intolerances.value});
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

    <ul class="flex flex-wrap justify-between gap-2 bg-[#ffffff] rounded-[11px] p-4">
      <li v-for="intolerance of intolerances" class="text-[#333333]" :class="props.where === 'addNew' ? 'w-40' : 'w-43'">
        <label class="block w-fuul h-full  rounded-[11px] shadow-sm  font-medium" :class="model.includes(intolerance.id) ? 'bg-[#005B8E] text-white' : 'bg-[#f5f5f5] text-[#005B8E]'">
          <input type="checkbox" name="ingredients[]" :value="intolerance.id" v-model="model" class="m-3">
          {{ intolerance.name }}
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