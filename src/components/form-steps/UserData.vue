<script setup>
import { computed, ref } from 'vue'
import InputPassword from '../ui/InputPassword.vue'
import ProfileAvatar from '../ui/ProfileAvatar.vue'
import AuthButton from '../auth/AuthButton.vue'
import AuthTextField from '../auth/AuthTextField.vue'
import FieldError from '../auth/FieldError.vue'
import PasswordRules from '../auth/PasswordRules.vue'
import { isPasswordValid } from '../../utils/passwordRules.js'

const EMAIL_PATTERN = /^([^\s@]+)@[^\s@]+\.[^\s@]{2,}$/

const model = defineModel()
const emit = defineEmits(['next', 'previous'])

const props = defineProps({
  errors: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const nameWasEdited = ref(false)
const mismatchError = ref(null)
const rulesError = ref(null)

const serverError = field => props.errors?.[field]?.[0] ?? null

const nameHint = computed(() => {
  if (nameWasEdited.value) return 'Lo podés cambiar cuando quieras desde tu perfil.'
  if (model.value.name) return 'Lo sacamos de tu email. Cambialo si querés.'

  return 'Lo completamos con tu email, o escribilo vos.'
})

/**
 * Deriving "Lucía" from lucia.mendez@… saves typing, but it is a suggestion:
 * the moment somebody names the profile themselves, the email stops overwriting it.
 */
function inferNameFromEmail(event) {
  if (nameWasEdited.value) return

  const match = EMAIL_PATTERN.exec(event.target.value.trim())
  if (!match) return

  const [firstPart] = match[1].split('.')
  model.value.name = firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
}

function handleNext() {
  mismatchError.value = null
  rulesError.value = null

  // The checklist above already says which rule is missing, so this only has to
  // stop the submit: a button that goes through on a password the list marks as
  // unmet is the screen contradicting itself.
  if (!isPasswordValid(model.value.password)) {
    rulesError.value = 'La contraseña todavía no cumple los requisitos'
    return
  }

  if (model.value.password !== model.value.confirm_password) {
    mismatchError.value = 'Las contraseñas no coinciden'
    return
  }

  if (!model.value.name.trim()) {
    model.value.name = 'Usuario principal'
  }

  emit('next')
}
</script>

<template>
  <div class="flex flex-col flex-1 step-in">
    <h2 class="mb-1 font-roboto-slab font-bold text-[21px]/[1.2] text-white">¡Último paso!</h2>
    <p class="mb-[18px] text-[13.5px]/[1.5] text-white/80">Con esto creamos tu cuenta.</p>

    <AuthTextField
      id="email"
      label="Email"
      type="email"
      placeholder="tu@email.com"
      autocomplete="email"
      v-model="model.email"
      :error="serverError('email')"
      @input="inferNameFromEmail"
    />

    <div class="mt-3.5 p-3 rounded-card bg-white/10 border border-white/25">
      <p class="mb-2.5 font-medium text-[11.5px] uppercase tracking-[.05em] text-white/70">Tu perfil principal</p>

      <div class="flex items-center gap-[11px]">
        <ProfileAvatar :name="model.name" :size="44" class="ring-2 ring-white/55" />

        <input
          id="profile-name"
          aria-label="Nombre del perfil"
          v-model="model.name"
          class="flex-1 min-w-0 h-11 px-3 rounded-card border-[1.5px] border-white/40 bg-black/15 font-semibold text-[14.5px] text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
          @input="nameWasEdited = true"
        >
      </div>

      <p class="mt-2.5 text-[11.5px]/[1.45] text-white/70">{{ nameHint }}</p>
    </div>

    <div class="mt-4">
      <label for="password" class="block mb-[7px] font-medium text-[13px] text-white/90">Contraseña</label>

      <InputPassword
        id="password"
        name="password"
        placeholder="••••••••"
        autocomplete="new-password"
        v-model="model.password"
        aria-describedby="password-rules"
        :invalid="!!serverError('password')"
        :aria-invalid="serverError('password') ? 'true' : undefined"
      />

      <FieldError
        v-if="rulesError || serverError('password')"
        :message="rulesError || serverError('password')"
      />

      <PasswordRules id="password-rules" :password="model.password" class="mt-3.5" />
    </div>

    <div class="mt-4">
      <label for="confirm_password" class="block mb-[7px] font-medium text-[13px] text-white/90">Repetir contraseña</label>

      <InputPassword
        id="confirm_password"
        name="confirm_password"
        placeholder="••••••••"
        autocomplete="new-password"
        v-model="model.confirm_password"
        :invalid="!!(mismatchError || serverError('confirm_password'))"
        :aria-invalid="(mismatchError || serverError('confirm_password')) ? 'true' : undefined"
      />

      <FieldError
        v-if="mismatchError || serverError('confirm_password')"
        :message="mismatchError || serverError('confirm_password')"
      />
    </div>

    <div class="flex-1 min-h-[20px]"></div>

    <AuthButton
      data-testid="complete-registration"
      icon="fa-check"
      icon-placement="start"
      :loading="loading"
      loading-label="Registrando…"
      class="mt-[18px]"
      @click="handleNext"
    >Completar registro</AuthButton>
  </div>
</template>
