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

async function handleSubmit() {
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
        console.log('set something')
        formErrors.value.email = error.response.data.errors.email ?? ''
      }

      if(error.response.data.errors.password) {
        formErrors.value.password = error.response.data.errors.password ?? ''
      }
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
        <div class="mb-4">
          <label for="email" aria-label="Email"></label>
          <input class="block border inputs" type="text" id="email" name="email" v-model="formData.email" placeholder="Email" autofocus>
          <small>{{ formErrors.email }}</small>
        </div>

        <div>
          <label for="password" aria-label="Contraseña"></label>
          <InputPassword id="password" name="password" v-model="formData.password" placeholder="Contraseña" />
          <!-- <input class="block border inputs" type="password" id="password" name="password" v-model="formData.password" placeholder="Contraseña" > -->
          <small>{{ formErrors.password }}</small>
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