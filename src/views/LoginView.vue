<script setup>
import {ref} from "vue";
import {login} from "../services/auth.js";
import {useRouter} from "vue-router";
import InputPassword from "../components/ui/InputPassword.vue";

const loading = ref(false);
const router = useRouter();

const formDefaultValues = {
  email: '',
  password: '',
}
const formData = ref({...formDefaultValues})
const formErrors = ref({...formDefaultValues})
const generalError = ref(null);

function clearError(field) {
  formErrors.value[field] = '';
  generalError.value = null;
}

async function handleSubmit() {
  formErrors.value = {...formDefaultValues};
  generalError.value = null;
  
  let hasErrors = false;
  
  if(formData.value.email === '') {
    formErrors.value.email = 'El email es obligatorio';
    hasErrors = true;
  }

  if(formData.value.password === '') {
    formErrors.value.password = 'La contraseña es obligatoria';
    hasErrors = true;
  }

  if(hasErrors) {
    return;
  }

  try {
    loading.value = true;
    const data = await login(formData.value);
    router.push('/');
  } catch (error) {
    console.error({error});
    
    if (error.status === 422) {
      const errors = error.response?.data?.errors || {};
      formErrors.value.email = errors.email?.[0] || '';
      formErrors.value.password = errors.password?.[0] || '';
    } 
    else if (error.status === 401) {
      generalError.value = error.response?.data?.message || 'Las credenciales no coinciden';
    } 
    else {
      generalError.value = 'Ha ocurrido un error. Por favor, intenta de nuevo.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
 <div>
    <RouterLink to="/welcome" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink>
    <div class="flex flex-col justify-around min-h-screen">
      <div class="flex flex-col justify-between flex-grow">
        <img src="../assets/img/logo.png" alt="">
        <div class="flex flex-col justify-center mb-5 px-3 h-50">
          <h1 class="text-4xl mb-3 text-center">Iniciar sesión</h1>
          <p>Por favor, completá los siguientes campos.</p>
        </div>
      </div>


      <form action="#" method="post" @submit.prevent="handleSubmit" class="flex flex-col justify-center p-4 min-h-80 bg-[#005B8E]">
        <div v-if="generalError" class="bg-[#C43B52] flex justify-center p-3 mb-4 rounded-[11px] text-white">
          <p>{{ generalError }}</p>
        </div>
        
        <div class="mb-4">
          <label for="email" aria-label="Email"></label>
          <input 
            class="block border" 
            type="email" 
            id="email" 
            name="email" 
            v-model="formData.email" 
            @input="clearError('email')"
            placeholder="Email" 
            autofocus 
            :class="formErrors.email ? 'inputs-wrong' : 'inputs'"
          >
          <p v-if="formErrors.email" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px]">
            {{ formErrors.email }}
          </p>
        </div>

        <div>
          <label for="password" aria-label="Contraseña"></label>
          <InputPassword 
            id="password" 
            name="password" 
            v-model="formData.password"
            @input="clearError('password')"
            placeholder="Contraseña" 
            :class="formErrors.password ? 'inputs-wrong' : 'inputs'" 
          />
          <p v-if="formErrors.password" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px]">
            {{ formErrors.password }}
          </p>
        </div>

        <div>
          <RouterLink to="/forgot-password" class="text-blue-200 underline">¿Olvidaste tu contraseña?</RouterLink>
        </div>

        <button type="submit" :disabled="loading" class="action-btn mt-6">
          {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
 </div>
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