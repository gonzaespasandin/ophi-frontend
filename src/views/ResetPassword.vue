<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { resetPassword } from '../services/auth.js'
import { isPasswordValid } from '../utils/passwordRules.js'
import AuthScreen from '../components/auth/AuthScreen.vue'
import AuthHeader from '../components/auth/AuthHeader.vue'
import AuthButton from '../components/auth/AuthButton.vue'
import AuthErrorBanner from '../components/auth/AuthErrorBanner.vue'
import FieldError from '../components/auth/FieldError.vue'
import PasswordRules from '../components/auth/PasswordRules.vue'
import InputPassword from '../components/ui/InputPassword.vue'
import { statusOf } from '../utils/httpStatus.js'

// Laravel answers a spent or expired link with these keys. They travel as
// codes, not as translated text, so the branch survives a copy edit.
const DEAD_LINK_CODES = ['passwords.token', 'passwords.user']

const HEADINGS = {
  form: { title: 'Elegí tu contraseña nueva', lead: 'Con esto entrás de nuevo a tu cuenta.' },
  done: { title: 'Listo, ya está cambiada', lead: 'Usá la contraseña nueva para entrar.' },
  expired: {
    title: 'Este enlace ya no sirve',
    lead: 'Los enlaces vencen a los 60 minutos, y cada uno se puede usar una sola vez.',
  },
}

const route = useRoute()

const account = { token: route.params.token, email: route.params.email }

const password = ref('')
const loading = ref(false)
const stage = ref('form')
const fieldError = ref(null)
const generalError = ref(null)

const heading = computed(() => HEADINGS[stage.value])
const canSubmit = computed(() => isPasswordValid(password.value) && !loading.value)

function handleFailure(error) {
  if (statusOf(error) !== 422) {
    generalError.value = true
    return
  }

  if (DEAD_LINK_CODES.includes(error.response?.data?.code)) {
    stage.value = 'expired'
    return
  }

  fieldError.value = error.response?.data?.errors?.password?.[0] ?? 'Revisá la contraseña e intentá de nuevo'
}

async function handleSubmit() {
  fieldError.value = null
  generalError.value = null
  loading.value = true

  try {
    await resetPassword({ ...account, password: password.value })
    stage.value = 'done'
  } catch (error) {
    handleFailure(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthScreen screen="reset-password">
    <template #hero>
      <div class="px-5 pt-4 pb-[22px]">
        <AuthHeader to="/login" />

        <h1 class="mt-3.5 mb-1.5 font-roboto-slab font-bold text-[28px]/[1.15] text-[#111827]">{{ heading.title }}</h1>
        <p class="max-w-[320px] text-[14px]/[1.55] text-[#4B5563]">{{ heading.lead }}</p>
      </div>
    </template>

    <div class="px-5 pt-[22px] pb-7">
      <form v-if="stage === 'form'" action="#" method="post" @submit.prevent="handleSubmit" novalidate>
        <AuthErrorBanner
          v-if="generalError"
          title="No pudimos confirmar el cambio"
          message="Probá entrar con la contraseña nueva. Si no funciona, seguí usando la anterior."
          class="mb-[18px]"
        />

        <div class="flex items-center gap-[11px] p-3 rounded-card bg-white/12 border border-white/25">
          <span class="grid place-items-center shrink-0 w-[38px] h-[38px] rounded-card bg-white/15 text-[14px] text-white">
            <i class="fa-solid fa-user" aria-hidden="true"></i>
          </span>

          <div class="flex-1 min-w-0">
            <p class="mb-px font-medium text-[11px] uppercase tracking-[.05em] text-white/70">Cuenta</p>
            <p class="truncate font-semibold text-[13.5px] text-white">{{ account.email }}</p>
          </div>
        </div>

        <div class="mt-5">
          <label for="password" class="block mb-[7px] font-medium text-[13px] text-white/90">Contraseña nueva</label>

          <InputPassword
            id="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            autofocus
            v-model="password"
            aria-describedby="password-rules"
            :invalid="!!fieldError"
            :aria-invalid="fieldError ? 'true' : undefined"
          />

          <FieldError v-if="fieldError" :message="fieldError" />

          <PasswordRules id="password-rules" :password="password" class="mt-3.5" />
        </div>

        <AuthButton
          data-testid="save-password"
          type="submit"
          icon="fa-check"
          icon-placement="start"
          :loading="loading"
          loading-label="Guardando…"
          :disabled="!canSubmit"
          class="mt-5"
        >Guardar contraseña</AuthButton>

        <p class="mt-4 text-[12.5px]/[1.5] text-white/75">
          Este enlace vale por 60 minutos desde que pediste el correo.
        </p>
      </form>

      <div v-else-if="stage === 'done'" class="step-in">
        <div class="p-4 rounded-card bg-white shadow-card text-center">
          <span class="grid place-items-center w-14 h-14 mx-auto mb-3 rounded-full bg-ophi-action text-[22px] text-white">
            <i class="fa-solid fa-check" aria-hidden="true"></i>
          </span>

          <p class="font-roboto-slab font-bold text-[17px]/[1.25] text-[#111827]">Contraseña actualizada</p>

          <p class="mt-3.5 px-3 py-2.5 rounded-card bg-ophi-surface border border-ophi-border break-all font-semibold text-[13px] text-ophi-blue">
            {{ account.email }}
          </p>
        </div>

        <AuthButton data-testid="go-to-login" to="/login" icon="fa-arrow-right" class="mt-[18px]">
          Iniciar sesión
        </AuthButton>
      </div>

      <div v-else class="step-in">
        <div class="p-4 rounded-card bg-white shadow-card text-center">
          <span class="grid place-items-center w-13 h-13 mx-auto mb-3 rounded-card bg-ophi-danger-soft text-[20px] text-ophi-danger">
            <i class="fa-solid fa-link-slash" aria-hidden="true"></i>
          </span>

          <p class="font-roboto-slab font-bold text-[17px]/[1.25] text-[#111827]">Enlace expirado</p>
        </div>

        <AuthButton
          data-testid="ask-new-email"
          to="/forgot-password"
          icon="fa-envelope"
          icon-placement="start"
          class="mt-[18px]"
        >Pedir un correo nuevo</AuthButton>

        <AuthButton to="/login" variant="secondary" class="mt-[11px]">Volver a iniciar sesión</AuthButton>
      </div>
    </div>
  </AuthScreen>
</template>
