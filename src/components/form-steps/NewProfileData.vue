<script setup>
import {  onMounted, ref } from 'vue';
import AppLoading from '../loadings/AppLoading.vue';

const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const nameError = ref(null); 
const userProfiles = ref([]);
const repeatedNameError = ref(null);

const props = defineProps({
  where: String,
  errors: [Object, Boolean, null],
  loading: Boolean
})

function handleSubmit() {
  nameError.value = null;
  repeatedNameError.value = null;
  if(model.value.name === '') {
    nameError.value = 'El nombre es obligatorio';
    return;
  }
  userProfiles.value.forEach(profile => {
    if(profile.name === model.value.name) {
      repeatedNameError.value = 'Ya tenés un perfil con ese nombre';
    }
  });
  if(repeatedNameError.value) {
    return;
  }
  nameError.value = null;
  repeatedNameError.value = null;
  emit('next');
}

onMounted(() => {
  userProfiles.value = JSON.parse(sessionStorage.getItem('ophi-user')).profiles;
}) 
</script>

<template>


    <div>
      <button
          type="button"
          class="border border-black/20 hover:bg-black/10 hover:border-black/30 transition cursor-pointer inline-flex items-center py-2 px-4 gap-2 me-auto mb-2 rounded-[11px]"
          @click.prevent="emit('previous')"
      ><i class="fa-solid fa-chevron-left pe-2"></i> Volver</button>

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
        <div v-if="props.where === 'addNew' && repeatedNameError" class=" text-red-600 pb-4">
          {{ repeatedNameError }}
        </div>
      </div>
 
      <button
          type="submit"
          class="action-btn w-full"
          @click="handleSubmit()"
          :disabled="props.loading"
          :class="props.loading ? 'opacity-60 cursor-not-allowed' : ''"
      >
        <span v-if="props.loading"><i class="fa-solid fa-spinner fa-spin me-2"></i>Guardando...</span>
        <span v-else>Agregar perfil</span>
      </button>
    </div>

</template>

<style scoped>

</style>