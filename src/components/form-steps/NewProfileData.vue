<script setup>
import {  ref } from 'vue';
import AppLoading from '../loadings/AppLoading.vue';

const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const nameError = ref(null); 

const props = defineProps({
  where: String,
  errors: [Object, Boolean, null],
  loading: Boolean
})

function handleSubmitt() {
  if(model.value.name === '') {
    nameError.value = 'El nombre es obligatorio';
    console.log('aa', 'REFACHAREFACAH')
    return;
  }
  nameError.value = null;
  emit('next');
}
</script>

<template>


    <div>
      <!-- <button type="button" @click="emit('previous')">Volver</button> -->
      <h2 class="text-2xl font-semibold text-center" :class="props.where === 'addNew' ? 'text-lg' : 'text-2xl'">¿De quién estamos hablando?</h2>

      <div class="mt-3">
        <label for="name">Nombre</label>
        <input
          id="name"
          class="block border-b-1  text-black w-full p-2 mb-2 rounded-t-[.2rem] bg-[#f5f5f5]"
          type="text"
          name="name"
          :class="(props.where === 'addNew' && nameError) ? 'border-b-red-600' : 'border-b-[#009161]'"
          v-model="model.name"
        >
        <div v-if="props.where === 'addNew' && nameError" class=" text-red-600 pb-4">
          {{ nameError }}
        </div>
      </div>
 
      <button
          class="action-btn w-full"
          @click="handleSubmitt()"
      >Agregar perfil</button>
    </div>

</template>

<style scoped>

</style>