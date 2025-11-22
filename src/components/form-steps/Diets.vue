<script setup>
import {onMounted, ref} from "vue";
import {getListOfSpecialDiets} from "../../services/ingredients.js";
import AppLoading from "../AppLoading.vue";

const specialDiets = ref([])
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const loading = ref(true);
const props = defineProps({
  where: String
})

onMounted(async () => {
  try {
    specialDiets.value = await getListOfSpecialDiets();
    loading.value = false;
  } catch (error) {
    // TODO: Handle error
    console.log('No se pudo traer las intolerancias', error)
  }
})
</script>

<template>
  <!-- <button @click.prevent="emit('previous')">Volver</button> -->
  <h2 class="text-2xl font-semibold text-center">¿Seguís alguna dieta especial?</h2>

  <template v-if="!loading">
    <p class="mb-3 text-center">Seleccioná todas las que correspondan</p>

    <!-- TODO: Pre-load specialDiets -->
    <ul class="flex flex-wrap bg-[#f5f5f5] rounded-[11px] p-3 text-[#333333]">
      <li v-for="diet of specialDiets"  class="w-45">
        <label>
          <input type="checkbox" name="ingredients[]" :value="diet.id" v-model="model.ingredients" class="m-3">
          {{ diet.name }}
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
        <AppLoading id="load"></AppLoading>
      </div>
  </template>
</template>


<style scoped>
  #load {
    color: white;
  }

</style>