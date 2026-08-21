<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router'
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import AuthErrorBanner from "../components/auth/AuthErrorBanner.vue";
import { register } from "../services/auth.js";

const loading = ref(false);
const router = useRouter();
const registrationErrors = ref({});
const generalError = ref(null);

async function handleSubmit(formData) {
  loading.value = true;
  registrationErrors.value = {};
  generalError.value = null;

  try {
    await register(formData)
    localStorage.removeItem('ophi-step-form')
    router.push('/')
  } catch (error) {
    console.error('[RegisterView] -> handleSubmit(), Error:', error);

    if (error.status === 422) {
      const errors = error.response?.data?.errors;

      // The API can answer 422 with `errors` as a plain message instead of a
      // map of fields. Pointing at "los campos marcados" would then highlight
      // nothing and hide the only reason the person was given.
      if (typeof errors === 'string') {
        generalError.value = errors;
      } else {
        registrationErrors.value = errors || {};
        generalError.value = 'Revisá los campos marcados. Todo lo que cargaste en los pasos anteriores quedó guardado.';
      }
    }
    else {
      generalError.value = 'Ha ocurrido un error al registrar. Por favor, intentá de nuevo.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="h-dvh overflow-hidden bg-[#F5F5F5]">
    <h1 class="sr-only">Crear una cuenta en Ophi</h1>

    <StepsContainer
      fill
      screen="register"
      :steps="['terms', 'skip_to_last_step', 'intolerances', 'allergies', 'diets', 'new_user_data']"
      :errors="registrationErrors"
      :loading="loading"
      @submit="handleSubmit"
    >
      <template #banner>
        <AuthErrorBanner
          v-if="generalError"
          title="No pudimos crear tu cuenta"
          :message="generalError"
          class="mb-4"
        />
      </template>
    </StepsContainer>
  </div>
</template>
