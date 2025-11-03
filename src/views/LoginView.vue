<script setup>

import {ref} from "vue";
import {login} from "../services/auth.js";
import {useRouter} from "vue-router";


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
  <RouterLink to="/welcome">Ir a la página de bienvenida</RouterLink>
  <h1 class="text-4xl">Iniciar sesión</h1>


  <form action="#" method="post" @submit.prevent="handleSubmit">
    <div>
      <label for="email">Email</label>
      <input class="block border" type="text" id="email" name="email" v-model="formData.email" autofocus>
      <small>{{ formErrors.email }}</small>
    </div>

    <div>
      <label for="password">Password</label>
      <input class="block border" type="password" id="password" name="password" v-model="formData.password">
      <small>{{ formErrors.password }}</small>
    </div>

    <button>Iniciar Sesión</button>
  </form>
</template>