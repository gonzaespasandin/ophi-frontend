<script setup>
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue"
import {resetPassword} from "../services/auth.js";
import InputPassword from "../components/ui/InputPassword.vue";

const route =  useRoute();
const router = useRouter();
const loading = ref(false)

const formDefaultValues = {
  token: route.params.token,
  email: route.params.email,
  password: '',
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
    await resetPassword(formData.value)
    router.push('/login')
  } catch (error) {
    console.error('ERROR', error)

    if (error.status === 422) {
      const errors = error.response?.data?.errors || {};
      formErrors.value.password = errors.password?.[0] || '';
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
    <div class="flex flex-col justify-around min-h-screen">
      <div class="flex flex-col justify-between flex-grow">
        <img src="../assets/img/logo.png" alt="">
        <div class="flex flex-col justify-center mb-5 px-3 h-50">
          <h1 class="text-4xl mb-3 text-center">Reiniciar contraseña</h1>
          <p>Introducí tu nueva contraseña en el campo de abajo.</p>
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

        <input type="hidden" name="token" :value="route.params.token">

        <input type="hidden" name="email" :value="route.params.email">

        <div class="mb-4">
          <label for="password" aria-label="Nueva contraseña"></label>
          <InputPassword
              id="password"
              name="password"
              v-model="formData.password"
              autofocus
              @input="clearError('password')"
              placeholder="Nueva contraseña"
              :class="formErrors.password ? 'inputs-wrong' : 'inputs'"
          />
          <p v-if="formErrors.password" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px]">
            {{ formErrors.password }}
          </p>
          <p class="text-xs text-gray-300 mt-1">Mínimo 8 caracteres, al menos 1 mayúscula y 1 minúscula</p>
        </div>

        <button type="submit" :disabled="loading" class="action-btn mt-6">
          {{ loading ? 'Enviando...' : 'Reiniciar contraseña' }}
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