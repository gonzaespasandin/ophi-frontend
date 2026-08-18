<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import AuthErrorBanner from "../components/auth/AuthErrorBanner.vue";
import { addNewProfileToAuthUser } from "../services/auth.js";

const router = useRouter();

const loading = ref(false);
const formErrors = ref({});
const generalError = ref(null);

async function handleSubmit(formData) {
  loading.value = true;
  formErrors.value = {};
  generalError.value = null;

  try {
    const result = await addNewProfileToAuthUser(formData);
    sessionStorage.setItem('alert', JSON.stringify({message: result.message, type: 'success'}));
    localStorage.removeItem('ophi-step-form')
    await router.push('/profile');
  } catch (error) {
    console.error('[AddNewProfileView] -> handleSubmit(), Error:', error);

    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors
      generalError.value = formErrors.value.name?.[0] ?? 'Revisá los datos del perfil e intentá de nuevo.'
    } else {
      generalError.value = 'Ocurrió un error inesperado. Estamos solucionándolo…'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h1 class="sr-only">Agregar un nuevo perfil</h1>

    <div class="min-h-full bg-[#F5F5F5] dot-texture-page">
      <StepsContainer
        screen="add-profile"
        :steps="['intolerances', 'allergies', 'diets', 'new_profile']"
        :errors="formErrors"
        :loading="loading"
        @submit="handleSubmit"
      >
        <template #banner>
          <AuthErrorBanner
            v-if="generalError"
            title="No pudimos guardar el perfil"
            :message="generalError"
            class="mb-4"
          />
        </template>
      </StepsContainer>
    </div>
  </AuthLayout>
</template>
