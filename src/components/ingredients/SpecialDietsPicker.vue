<script setup>
import {onMounted, ref} from "vue";
import {getListOfSpecialDiets} from "../../services/ingredients.js";
import AppLoading from "../loadings/AppLoading.vue";


const model = defineModel();

const props = defineProps({
  where: String,
  loadingTheme: {
    type: String,
    default: 'blue'
  },
})

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
    <AppLoading  id="load" :class="props.loadingTheme"/>
  </div>

  <template v-else>
    <ul class="grid xs:grid-cols-2 gap-2 bg-[#ffffff] rounded-[11px] p-2 text-[#333333]">
      <li v-for="diet of specialDiets">
        <label class="flex gap-2 py-3 px-2 h-full rounded-[11px] shadow-sm font-medium" :class="model.includes(diet.id) ? 'bg-[#005B8E] text-white' : 'bg-[#f5f5f5] text-[#005B8E]'">
          <input type="checkbox" name="ingredients[]" :value="diet.id" v-model="model">
          {{ diet.name }}
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