<script setup>
import { computed, ref } from 'vue'
import InputPassword from '../ui/InputPassword.vue'

const props = defineProps({
  account: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: [String, Object], default: null },
})

const emit = defineEmits(['submit'])

const newEmail = ref('')
const currentPassword = ref('')

const errorMessage = computed(() => {
  if (!props.error) return null
  return typeof props.error === 'string' ? props.error : props.error.message
})

const errorField = computed(() => {
  if (!props.error || typeof props.error === 'string') return null
  return props.error.field ?? null
})

function handleSubmit() {
  emit('submit', { newEmail: newEmail.value, currentPassword: currentPassword.value })
  currentPassword.value = ''
}
</script>

<template>
  <section class="bg-white shadow-md p-5 rounded-[11px]">
    <h2 class="text-[#005B8E] font-semibold text-xl mb-2">Email</h2>
    <p class="mb-4">{{ props.account.email }}</p>

    <p
      v-if="props.account.pending_email"
      role="status"
      class="mb-4 p-3 rounded-[11px] bg-blue-50 text-[#005B8E]"
    >
      Te enviamos un mail a <strong>{{ props.account.pending_email }}</strong> para confirmar el cambio.
      Hasta que lo confirmes, seguís ingresando con tu email actual.
    </p>

    <p
      v-if="errorMessage && !errorField"
      id="email-change-error"
      role="alert"
      class="mb-4 p-3 rounded-[11px] bg-red-50 text-red-700"
    >
      {{ errorMessage }}
    </p>

    <form
      @submit.prevent="handleSubmit"
      class="grid gap-3"
      :aria-describedby="errorMessage && !errorField ? 'email-change-error' : undefined"
    >
      <label class="grid gap-1">
        <span class="text-sm">Nuevo email</span>
        <input
          v-model="newEmail"
          type="email"
          required
          class="border rounded-[11px] p-2"
          autocomplete="email"
          :aria-invalid="errorField === 'email' ? 'true' : undefined"
          :aria-describedby="errorField === 'email' ? 'email-change-email-error' : undefined"
        />
        <span
          v-if="errorField === 'email'"
          id="email-change-email-error"
          role="alert"
          class="text-sm text-red-700"
        >
          {{ errorMessage }}
        </span>
      </label>

      <label class="grid gap-1">
        <span class="text-sm">Tu contraseña actual</span>
        <InputPassword
          v-model="currentPassword"
          required
          autocomplete="current-password"
          :aria-invalid="errorField === 'password' ? 'true' : undefined"
          :aria-describedby="errorField === 'password' ? 'email-change-password-error' : undefined"
        />
        <span
          v-if="errorField === 'password'"
          id="email-change-password-error"
          role="alert"
          class="text-sm text-red-700"
        >
          {{ errorMessage }}
        </span>
      </label>

      <button class="action-btn" type="submit" :disabled="props.loading" :aria-busy="props.loading">
        {{ props.loading ? 'Cambiando...' : 'Cambiar email' }}
      </button>
    </form>
  </section>
</template>
