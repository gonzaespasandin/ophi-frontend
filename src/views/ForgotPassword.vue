<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { sendEmailToResetPassword } from '../services/auth.js'
import AuthScreen from '../components/auth/AuthScreen.vue'
import AuthHeader from '../components/auth/AuthHeader.vue'
import AuthButton from '../components/auth/AuthButton.vue'
import AuthTextField from '../components/auth/AuthTextField.vue'
import AuthErrorBanner from '../components/auth/AuthErrorBanner.vue'
import { statusOf } from '../utils/httpStatus.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RESEND_COOLDOWN_SECONDS = 30

const HEADINGS = {
  form: {
    title: 'Olvidé mi contraseña',
    lead: 'Escribí el email de tu cuenta y te mandamos un enlace para elegir una nueva.',
  },
  sent: {
    title: 'Te mandamos un enlace',
    lead: 'Seguí desde tu casilla para elegir la contraseña nueva.',
  },
}

const email = ref('')
const sent = ref(false)
const loading = ref(false)
const fieldError = ref(null)
const generalError = ref(false)
const secondsLeft = ref(0)

let countdown = null
// Every request carries the generation it was fired in. A reply from an older
// generation — the resend that was in flight when the address was corrected —
// must not drag the screen back to the sent card.
let generation = 0

const heading = computed(() => HEADINGS[sent.value ? 'sent' : 'form'])
const resendLabel = computed(() => secondsLeft.value ? `Reenviar en ${secondsLeft.value}s` : 'Reenviar')

/**
 * A resend that fires on every tap sends four mails, and only the last link
 * works — so the person picks the wrong one from their inbox.
 */
function startCooldown() {
  clearInterval(countdown)
  secondsLeft.value = RESEND_COOLDOWN_SECONDS

  countdown = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) clearInterval(countdown)
  }, 1000)
}

onUnmounted(() => clearInterval(countdown))

async function requestLink() {
  const firedIn = ++generation

  fieldError.value = null
  generalError.value = false
  loading.value = true

  try {
    await sendEmailToResetPassword({ email: email.value.trim() })
    if (firedIn !== generation) return

    sent.value = true
  } catch (error) {
    if (firedIn !== generation) return

    if (statusOf(error) === 422) {
      fieldError.value = error.response?.data?.errors?.email?.[0] ?? 'Escribí un email válido'
    } else {
      generalError.value = true
    }
  } finally {
    if (firedIn === generation) {
      loading.value = false
      // The pause starts either way: a failed send is exactly when somebody taps
      // again, and hammering a recovery endpoint helps nobody.
      startCooldown()
    }
  }
}

function handleSubmit() {
  fieldError.value = null
  generalError.value = false

  if (!EMAIL_PATTERN.test(email.value.trim())) {
    fieldError.value = 'Escribí un email válido'
    return
  }

  return requestLink()
}

function editEmail() {
  generation += 1
  sent.value = false
  fieldError.value = null
  generalError.value = false
  clearInterval(countdown)
  secondsLeft.value = 0
}
</script>

<template>
  <AuthScreen screen="forgot-password">
    <template #hero>
      <div class="px-5 pt-4 pb-[22px]">
        <AuthHeader to="/login" />

        <h1 class="mt-3.5 mb-1.5 font-roboto-slab font-bold text-[28px]/[1.15] text-[#111827]">{{ heading.title }}</h1>
        <p class="max-w-[320px] text-[14px]/[1.55] text-[#4B5563]">{{ heading.lead }}</p>
      </div>
    </template>

    <div class="px-5 pt-[22px] pb-7">
      <form v-if="!sent" action="#" method="post" @submit.prevent="handleSubmit" novalidate>
        <AuthErrorBanner
          v-if="generalError"
          title="No pudimos enviar el correo"
          message="Puede ser la conexión. Probá de nuevo en un momento."
          class="mb-[18px]"
        />

        <AuthTextField
          id="email"
          label="Email de tu cuenta"
          type="email"
          placeholder="tu@email.com"
          autocomplete="email"
          autofocus
          v-model="email"
          :error="fieldError"
          @input="fieldError = null"
        />

        <AuthButton
          data-testid="send-link"
          type="submit"
          :loading="loading"
          loading-label="Enviando…"
          class="mt-[18px]"
        >Enviar enlace</AuthButton>

        <p class="mt-4 text-[12.5px]/[1.5] text-white/75">
          El enlace vale por 60 minutos desde que lo pedís.
        </p>
      </form>

      <div v-else class="step-in">
        <AuthErrorBanner
          v-if="generalError || fieldError"
          title="No pudimos enviar el correo"
          :message="fieldError || 'Puede ser la conexión. Probá de nuevo en un momento.'"
          class="mb-[18px]"
        />

        <div class="p-4 rounded-card bg-white shadow-card text-center">
          <span class="grid place-items-center w-14 h-14 mx-auto mb-3.5 rounded-card bg-ophi-green-soft text-[22px] text-ophi-green">
            <i class="fa-solid fa-envelope-open-text" aria-hidden="true"></i>
          </span>

          <p class="mb-2 font-roboto-slab font-bold text-[19px]/[1.25] text-[#111827]">Revisá tu correo</p>

          <p class="mb-3.5 text-[13.5px]/[1.55] text-[#4B5563]">
            Si hay una cuenta con este email, ya salió el enlace para elegir una contraseña nueva.
          </p>

          <p class="px-3 py-2.5 rounded-card bg-ophi-surface border border-ophi-border break-all font-semibold text-[13.5px] text-ophi-blue">
            {{ email }}
          </p>

          <div class="mt-4 pt-3.5 border-t border-ophi-border text-left">
            <p class="flex items-start gap-2.5 text-[12.5px]/[1.5] text-[#4B5563]">
              <i class="fa-solid fa-folder-open w-3.5 mt-[3px] text-[12px] text-ophi-green" aria-hidden="true"></i>
              Si no aparece, mirá en correo no deseado.
            </p>
          </div>
        </div>

        <AuthButton
          data-testid="edit-email"
          variant="secondary"
          icon="fa-pen"
          icon-placement="start"
          class="mt-[18px]"
          @click="editEmail"
        >Escribí otra dirección</AuthButton>

        <div class="mt-5 pt-4 border-t border-white/20 flex items-center justify-center gap-2">
          <span class="text-[13px] text-white/80">¿No te llegó?</span>

          <button
            data-testid="resend"
            type="button"
            :disabled="secondsLeft > 0 || loading"
            class="min-h-11 px-1 font-semibold text-[13px] text-white underline not-disabled:cursor-pointer disabled:text-white/55"
            @click="requestLink"
          >{{ resendLabel }}</button>
        </div>
      </div>
    </div>
  </AuthScreen>
</template>
