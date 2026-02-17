<script setup>
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import {ref} from "vue";
import {storeProfile} from "../services/profiles.js";
import {useRouter} from "vue-router";
import {addNewProfileToAuthUser} from "../services/auth.js";
import Top from "../components/ui/Top.vue";
import AppLoading from "../components/loadings/AppLoading.vue";
import Error from "../components/ui/Error.vue";

const router = useRouter();

const loading = ref(false);
const formErrors = ref(false);
const serverError = ref(null)

async function handleSubmit(formData) {
  console.log('Registrando nuevo perfil mético...', formData)
  loading.value = true;

  try {
    const result = await addNewProfileToAuthUser(formData);
    sessionStorage.setItem('alert', JSON.stringify({message: result.feedback, type: 'success'}));
    await router.push('/profile');
  } catch (error) {
    console.error({error});
    if (error.response.status === 422) {
      formErrors.value = error.response.data.errors
    } else {
      serverError.value = 'Ocurrió un error inesperado. Estamos solucionándolo...'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <Top/>

      <div class="bg-white shadow-md  p-3 m-3 rounded-[11px]">
          <h1 class="text-center text-2xl">Agregar nuevo perfil médico</h1>
      </div>

        <StepsContainer
            :steps="['intolerances', 'allergies', 'diets', 'new_profile']"
            :where="'addNew'"
            :errors="null"
            :loading="loading"
            @submit="handleSubmit"
            class="bg-white shadow-md p-3 m-3 rounded-[11px]"
        />
      <div v-if="formErrors">
        <Error :errorMessage="formErrors.name?.join('')"></Error>
      </div>
      <div v-if="serverError">
        <Error :errorMessage="serverError"></Error>
      </div>

  </AuthLayout>
</template>

<style scoped></style>