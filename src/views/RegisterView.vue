<script setup>
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import {register} from "../services/auth.js";
import {ref} from "vue";
import { useRouter } from 'vue-router'

const loading = ref(false);
const router = useRouter();
const registrationErrors = ref({});
const generalError = ref(null);

async function handleSubmit(formData) {
  console.log('Registrar usuario', formData)
  loading.value = true;
  registrationErrors.value = {};
  generalError.value = null;
  
  try {
    await register(formData)
    router.push('/')
  } catch (error) {
    console.error({error});
    
    if (error.status === 422) {
      registrationErrors.value = error.response?.data?.errors || {};
      generalError.value = 'Por favor, corregí los errores en el formulario';
    } 
    else {
      generalError.value = 'Ha ocurrido un error al registrar. Por favor, intenta de nuevo.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen">

    <!-- HEADER -->
    <div class="flex flex-col">
      <img src="../assets/img/logo.png" alt="">
      <div class="flex flex-col justify-center mb-5 px-3 h-30">
        <h1 class="text-3xl text-center">Registro</h1>
      </div>
    </div>

    <!-- CONTENIDO CENTRAL QUE CRECE -->
    <div class="flex flex-col grow justify-start">

      <div 
        v-if="generalError" 
        class="bg-[#C43B52] p-3 mx-3 mb-2 rounded-[11px] text-white text-center"
      >
        <p>{{ generalError }}</p>
      </div>

      <StepsContainer
        :steps="['terms', 'intolerances', 'allergies', 'diets', 'new_user_data']"
        @submit="handleSubmit"
        :where="'register'"
        :errors="registrationErrors"
        :loading="loading"
        class="bg-[#005B8E] flex flex-col justify-between py-6 text-white p-3 grow"  
      />
    </div>
  </div>|
</template>



<style scoped>
  div > div > div:first-child {
    background-image: url(../assets/img/tramas/Artboard\ 1trama-1.png);

    background-repeat: no-repeat;
    background-size: 175%;
  }

  img {
    display: block;
    margin: 4rem auto;
  }
</style>