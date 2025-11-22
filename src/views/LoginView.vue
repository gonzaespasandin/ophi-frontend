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
const formErrorsFront = ref({...formDefaultValues});
const unauthorizedError = ref(null);

async function handleSubmit() {
  let errors = false;
  if(formData.value.email === '') {
    formErrors.value.email = ['El email es obligatorio'];
    errors = true;
  } else {
    errors = false
    formErrors.value.email = '';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if(!emailRegex.test(formData.value.email)) {
    formErrors.value.email = ['El email no es válido'];
    errors = true;
  } else {
    errors = false
    formErrors.value.email = '';
  }

  if(formData.value.password === '') {
    formErrors.value.password = ['La contraseña es obligatoria']
    errors = true;
  } else {
    errors = false;
    formErrors.value.password = '';
  }

  if(errors) {
    confirm.log('erros')
  }

  try {
    loading.value = true
    const data = await login(formData.value)
    console.log('REDIRECT')
    router.push('/')
  } catch (error) {
    console.log({error})
    if (error.status === 422) {
      console.error('Error de validación', error.response.data.errors.email)

      if(error.response.data.errors.email) {
        formErrors.value.email = error.response.data.errors.email ?? ''
      } else {
        formErrors.value.email = ''
      }

      if(error.response.data.errors.password) {
        formErrors.value.password = error.response.data.errors.password ?? '';
      } else {
        formErrors.value.password = ''
      }
    } else {
      formErrors.value.email = ''
      formErrors.value.password = ''
    }
    if (error.status === 401) {
      console.error('No autorizado');
      unauthorizedError.value = 'El email o la contraseña no coinciden';
    } else {
      unauthorizedError.value = null;
    }
  }

  loading.value = false
}
</script>

<template>
 <div>
    <RouterLink to="/welcome" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink>
    <div class="flex flex-col justify-around min-h-screen">
      <div class="flex flex-col justify-between flex-grow">
        <img src="../assets/img/logo.png" alt="">
        <div class="flex flex-col justify-center mb-5 px-3 h-50">
          <h1 class="text-4xl text-center">Iniciar sesión</h1>
          <p>Por favor, completá los siguientes campos.</p>
        </div>
      </div>


      <form action="#" method="post" @submit.prevent="handleSubmit" class="flex flex-col justify-center p-4 min-h-80 bg-[#005B8E]">
        <div v-if="unauthorizedError !== null" class="bg-[#C43B52] flex justify-center p-2 mb-4 rounded-[11px] text-white">
          <p>{{ unauthorizedError }}</p>
        </div>
        <div class="mb-4">
          <label for="email" aria-label="Email"></label>
          <input class="block border " type="text" id="email" name="email" v-model="formData.email" placeholder="Email" autofocus :class="formErrors.email ? 'inputs-wrong' : 'inputs'">
          <p v-if="formErrors.email" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px]">{{ formErrors.email.join('') ?? '' }}</p>
        </div>

        <div>
          <label for="password" aria-label="Contraseña"></label>
          <InputPassword id="password" name="password" v-model="formData.password" placeholder="Contraseña" :class="formErrors.password ? 'inputs-wrong' : 'inputs'" />
          <!-- <input class="block border inputs" type="password" id="password" name="password" v-model="formData.password" placeholder="Contraseña" > -->
          <p v-if="formErrors.password" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px]">{{ formErrors.password.join('') ?? '' }}</p>
        </div>

        <button type="submit" class="action-btn mt-6">Iniciar Sesión</button>
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