<script setup>
import {onMounted, ref} from "vue";
import {getListOfIntolerances} from "../../services/ingredients.js";
import InlineLoading from "../loadings/InlineLoading.vue";

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
  } catch (error) {
    // TODO: Handle error
    console.log('No se pudo traer las intolerancias', error);
  }

  loading.value = false;
})
</script>

<template>
  <InlineLoading v-if="loading" />

  <template v-else>

    <ul class="flex flex-wrap bg-[#f5f5f5] rounded-[11px] p-4">
      <li v-for="intolerance of intolerances" class="text-[#333333]" :class="props.where === 'addNew' ? 'w-42' : 'w-45'">
        <label>
          <input type="checkbox" name="ingredients[]" :value="intolerance.id" v-model="model" class="m-3">
          {{ intolerance.name }}
        </label>
      </li>
    </ul>
  </template>
</template>