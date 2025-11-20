<script setup>
import {onMounted, ref} from "vue";
import {getListOfAllergies} from "../../services/ingredients.js";
import ListOfFullIngredientsModal from "../ingredients/ListOfFullIngredientsModal.vue";
import AppLoading from "../AppLoading.vue";


const allergies = ref([])
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const showModal = ref(false)
const list = ref([])
const loading = ref(true);

onMounted(async () => {
  try {
    allergies.value = await getListOfAllergies();
    loading.value = false;
  } catch (error) {
    // TODO: Handle error
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
    <!-- <button @click.prevent="emit('previous')">Volver</button> -->
    <h2 class="text-2xl font-semibold">¿Tenés alguna alergia?</h2>
  <template v-if="!loading">
    

    <p>Seleccioná todas las que correspondan</p>

    <!-- TODO: Pre-load allergies -->
    <ul class="bg-[#f5f5f5] rounded-[11px] text-[#333333] p-3">
      <li v-for="allergy of allergies">
        <details>
          <summary>{{ allergy.name }}</summary>

          <ul>
            <template v-for="(ingredient, i) of allergy.ingredients" :key="i">
              <li v-if="ingredient.is_group || model.ingredients.includes(ingredient.id)">
                <label>
                  <input type="checkbox" name="ingredients[]" :value="ingredient.id" v-model="model.ingredients">
                  {{ ingredient.name }}
                </label>
              </li>
            </template>
          </ul>

          <button type="button" @click="handleShowFullList(allergy.ingredients)">Mostrar lista completa</button>
        </details>
      </li>
    </ul>

 
    <ListOfFullIngredientsModal @close="showModal = false" v-if="showModal" v-model="model.ingredients" :list class="modal"/>


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

  .modal {
    margin: auto;
    padding: 14px;
    border-radius: 11px;
  }

  .modal::backdrop {
    background-color: rgba(0, 0, 0, 0.685);
  }
</style>