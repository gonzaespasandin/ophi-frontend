<script setup>
import {handleError, onMounted, ref} from "vue";
import {getListOfIntolerances} from "../../services/ingredients.js";
import AppLoading from "../loadings/AppLoading.vue";;


const model = defineModel();

const loading = ref(false);
const intolerances = ref([]);

const props = defineProps({
  where: String,
  loadingTheme: {
    type: String,
    default: 'blue'
  },
})

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
    <AppLoading  id="load" :class="props.loadingTheme"/>
  </div>

  <template v-else>

    <ul class="grid xs:grid-cols-2 gap-2 bg-[#ffffff] rounded-[11px] p-2 text-[#333333]">
      <li v-for="intolerance of intolerances">
        <label class="flex gap-2 py-3 px-2 h-full rounded-[11px] shadow-sm font-medium" :class="model.includes(intolerance.id) ? 'bg-[#005B8E] text-white' : 'bg-[#f5f5f5] text-[#005B8E]'">
          <input type="checkbox" name="ingredients[]" :value="intolerance.id" v-model="model">
          {{ intolerance.name }}
        </label>
      </li>
    </ul>
  </template>
</template>

<style scoped>
#load.blue {
  color: #005b8e;
}

#load.white {
  color: white;
}
</style>