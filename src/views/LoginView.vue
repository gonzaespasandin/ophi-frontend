<script setup>
import { ref } from "vue";
import { login } from "../services/auth.js";
import { useRouter } from "vue-router";
import InputPassword from "../components/ui/InputPassword.vue";
import AuthScreen from "../components/auth/AuthScreen.vue";
import AuthHeader from "../components/auth/AuthHeader.vue";
import AuthButton from "../components/auth/AuthButton.vue";
import AuthTextField from "../components/auth/AuthTextField.vue";
import AuthErrorBanner from "../components/auth/AuthErrorBanner.vue";
import FieldError from "../components/auth/FieldError.vue";

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
  } else if(!formData.value.email.includes('@')) {
    formErrors.value.email = 'El email debe contener @';
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
    await login(formData.value);
    router.push('/');
  } catch (error) {
    if (error.status === 422) {
      const errors = error.response?.data?.errors || {};
      formErrors.value.email = errors.email?.[0] || '';
      formErrors.value.password = errors.password?.[0] || '';
    }
    else if (error.status === 401) {
      generalError.value = error.response?.data?.message || 'Las credenciales no coinciden.';
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
  <AuthScreen screen="login">
    <template #hero>
      <div class="px-5 pt-4 pb-[22px]">
        <AuthHeader to="/welcome" />

        <h1 class="mt-3.5 mb-1.5 font-roboto-slab font-bold text-[28px]/[1.15] text-[#111827]">Iniciar sesión</h1>
        <p class="text-[14px]/[1.5] text-[#4B5563]">Completá tus datos para entrar.</p>
      </div>
    </template>

    <form
      action="#"
      method="post"
      @submit.prevent="handleSubmit"
      class="px-5 pt-[22px] pb-7"
      novalidate
    >
      <AuthErrorBanner v-if="generalError" :message="generalError" class="mb-[18px]" />

      <AuthTextField
        id="email"
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autocomplete="email"
        autofocus
        v-model="formData.email"
        :error="formErrors.email || null"
        @input="clearError('email')"
      />

      <div class="mt-[18px]">
        <label for="password" class="block mb-[7px] font-medium text-[13px] text-white/90">Contraseña</label>

        <InputPassword
          id="password"
          name="password"
          placeholder="••••••••"
          autocomplete="current-password"
          v-model="formData.password"
          :invalid="!!formErrors.password"
          :aria-invalid="formErrors.password ? 'true' : undefined"
          :aria-describedby="formErrors.password ? 'password-error' : undefined"
          @input="clearError('password')"
        />

        <FieldError v-if="formErrors.password" id="password-error" :message="formErrors.password" />
      </div>

      <div class="mt-3 flex justify-end">
        <RouterLink
          to="/forgot-password"
          class="flex items-center h-11 px-1 font-medium text-[13.5px] text-[#B9DCF0] underline"
        >¿Olvidaste tu contraseña?</RouterLink>
      </div>

      <AuthButton type="submit" :loading="loading" loading-label="Iniciando…" class="mt-2">
        Iniciar sesión
      </AuthButton>

      <div class="mt-5 pt-[18px] border-t border-white/20 flex items-center justify-center gap-2">
        <span class="text-[13.5px] text-white/80">¿No tenés cuenta?</span>
        <RouterLink
          to="/register"
          class="flex items-center h-11 px-1 font-semibold text-[13.5px] text-white underline"
        >Registrate</RouterLink>
      </div>
    </form>
  </AuthScreen>
</template>
