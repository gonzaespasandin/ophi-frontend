<script setup>
import {ref} from "vue"
import {sendEmailToResetPassword} from "../services/auth.js";

const loading = ref(false)

const formDefaultValues = {
  email: '',
}
const formErrors = ref({...formDefaultValues})
const formData = ref({...formDefaultValues})
const formAlert = ref({
  type: '',
  message: '',
});

async function handleSubmit() {
  loading.value = true

  try {
    const result = await sendEmailToResetPassword(formData.value)

    formAlert.value.type = 'success'
    formAlert.value.message = 'El email fué enviado'
  } catch (error) {
    console.error('ERROR', error)

    if (error.status === 422) {
      console.log('Error 422', error.errors?.email?.[0])
      const errors = error.response?.data?.errors || {};
      formErrors.value.email = errors.email?.[0] || '';
    } else {
      formAlert.value.type = 'error'
      formAlert.value.message = 'Ocurrió un error desconocido'
    }
  }

  loading.value = false
}

function clearError(field) {
  formErrors.value[field] = '';
  formAlert.value.message = '';
}
</script>

<template>
  <div>
    <RouterLink to="/login" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink>
    <div class="flex flex-col justify-around min-h-screen">
      <div class="flex flex-col justify-between flex-grow">
        <!-- TODO: Fix this logo -->
        <img src="../assets/img/logo.png" alt="">
        <div class="flex flex-col justify-center mb-5 px-3 h-50">
          <h1 class="text-4xl mb-3 text-center">Olvidé mi contraseña</h1>
          <p>Introducí tu correo electrónico y te vamos a enviar un email para reiniciar tu contraseña.</p>
        </div>
      </div>

      <form action="#" method="post" @submit.prevent="handleSubmit" class="flex flex-col justify-center p-4 min-h-80 bg-[#005B8E]">
        <div
            v-if="formAlert.message"
            class="flex justify-center p-3 mb-4 rounded-[11px] text-white"
            :class="{
              'bg-[#C43B52]': formAlert.type === 'error',
              'bg-green-700': formAlert.type === 'success'
            }"
        >
          <p>{{ formAlert.message }}</p>
        </div>

        <div class="mb-4">
          <label for="email" aria-label="Email"></label>
          <input
              class="block border"
              type="text"
              id="email"
              name="email"
              v-model="formData.email"
              @input="clearError('email')"
              placeholder="Correo electrónico"
              autofocus
              :class="formErrors.email ? 'inputs-wrong' : 'inputs'"
          >
          <p v-if="formErrors.email" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px]">
            {{ formErrors.email }}
          </p>
        </div>

        <button type="submit" :disabled="loading" class="action-btn mt-6">
          {{ loading ? 'Enviando correo (puede tomar un tiempo)...' : 'Enviar correo de recuperación' }}
        </button>
      </form >
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