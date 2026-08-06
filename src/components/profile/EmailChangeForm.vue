<script setup>
import { ref } from 'vue'

const props = defineProps({
  account: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
})

const emit = defineEmits(['submit'])

const newEmail = ref('')
const currentPassword = ref('')

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
      v-if="props.error"
      id="email-change-error"
      role="alert"
      class="mb-4 p-3 rounded-[11px] bg-red-50 text-red-700"
    >
      {{ props.error }}
    </p>

    <form
      @submit.prevent="handleSubmit"
      class="grid gap-3"
      :aria-describedby="props.error ? 'email-change-error' : undefined"
    >
      <label class="grid gap-1">
        <span class="text-sm">Nuevo email</span>
        <input
          v-model="newEmail"
          type="email"
          required
          class="border rounded-[11px] p-2"
          autocomplete="email"
          :aria-invalid="props.error ? 'true' : undefined"
        />
      </label>

      <label class="grid gap-1">
        <span class="text-sm">Tu contraseña actual</span>
        <input
          v-model="currentPassword"
          type="password"
          required
          class="border rounded-[11px] p-2"
          autocomplete="current-password"
          :aria-invalid="props.error ? 'true' : undefined"
        />
      </label>

      <button class="action-btn" type="submit" :disabled="props.loading" :aria-busy="props.loading">
        {{ props.loading ? 'Cambiando...' : 'Cambiar email' }}
      </button>
    </form>
  </section>
</template>
