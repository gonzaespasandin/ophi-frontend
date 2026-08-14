<script setup>
import { computed, ref } from 'vue'
import InputPassword from '../ui/InputPassword.vue'
import PendingEmailNotice from './PendingEmailNotice.vue'
import RateLimitNotice from './RateLimitNotice.vue'

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

const isRateLimited = computed(() => errorField.value === 'rate-limit')

function handleSubmit() {
  emit('submit', { newEmail: newEmail.value, currentPassword: currentPassword.value })
  currentPassword.value = ''
}
</script>

<template>
  <div class="p-4 border-b border-ophi-border">
    <h3 class="mb-3 font-semibold text-[14px] text-gray-900">Cambiar email</h3>
    <p class="mb-3 text-[13px] text-gray-500">{{ props.account.email }}</p>

    <PendingEmailNotice
      v-if="props.account.pending_email"
      :email="props.account.pending_email"
      class="mb-3"
    />

    <RateLimitNotice v-if="isRateLimited" class="mb-3" />

    <p
      v-if="errorMessage && !errorField"
      id="email-change-error"
      role="alert"
      class="mb-3 p-3 rounded-card bg-ophi-danger-soft text-[12.5px] font-medium text-ophi-danger"
    >
      {{ errorMessage }}
    </p>

    <form
      @submit.prevent="handleSubmit"
      class="grid gap-3 min-w-0"
      :aria-describedby="errorMessage && !errorField ? 'email-change-error' : undefined"
    >
      <label class="grid gap-[6px] min-w-0">
        <span class="font-medium text-[13px] text-gray-700">Nuevo email</span>
        <input
          v-model="newEmail"
          type="email"
          required
          class="w-full min-w-0 h-11 px-3 rounded-card border-[1.5px] border-gray-300 text-[15px] text-gray-900 focus:outline-2 focus:outline-offset-1 focus:outline-ophi-blue focus:border-ophi-blue"
          autocomplete="email"
          :aria-invalid="errorField === 'email' ? 'true' : undefined"
          :aria-describedby="errorField === 'email' ? 'email-change-email-error' : undefined"
        />
        <span
          v-if="errorField === 'email'"
          id="email-change-email-error"
          role="alert"
          class="font-medium text-[12.5px] text-ophi-danger"
        >
          {{ errorMessage }}
        </span>
        <span
          v-if="errorField === 'email'"
          id="email-change-email-hint"
          class="mt-[6px] text-[12px] text-[#6B7280]"
        >
          ¿Es tuyo? Iniciá sesión con esa cuenta.
        </span>
      </label>

      <label class="grid gap-[6px] min-w-0">
        <span class="font-medium text-[13px] text-gray-700">Tu contraseña actual</span>
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
          class="font-medium text-[12.5px] text-ophi-danger"
        >
          {{ errorMessage }}
        </span>
      </label>

      <button
        class="w-full h-11 mt-1 rounded-card border-2 border-ophi-green bg-white hover:bg-ophi-green-soft active:bg-ophi-green-soft active:scale-[.98] text-ophi-green font-semibold text-[14px] cursor-pointer transition disabled:opacity-60"
        type="submit"
        :disabled="props.loading"
        :aria-busy="props.loading"
      >
        {{ props.loading ? 'Cambiando...' : 'Cambiar email' }}
      </button>
    </form>
  </div>
</template>
