<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { confirmEmailChange } from '../services/account.js'
import AppLoading from '../components/loadings/AppLoading.vue'

const route = useRoute()
const status = ref('loading')
const message = ref('')

onMounted(async () => {
  try {
    const result = await confirmEmailChange(route.params.token)
    status.value = 'success'
    message.value = result?.message ?? 'Tu email fue confirmado.'
  } catch (error) {
    status.value = 'error'
    if (error?.status === 429) {
      message.value = 'Probá de nuevo en unos minutos'
    } else {
      message.value = error?.response?.data?.message ?? 'No pudimos confirmar el cambio'
    }
  }
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-6">
    <div class="bg-white shadow-md p-6 rounded-[11px] text-center max-w-md w-full">
      <template v-if="status === 'loading'">
        <div role="status" aria-live="polite">
          <AppLoading />
          <p class="mt-4">Confirmando tu email...</p>
        </div>
      </template>

      <template v-else-if="status === 'success'">
        <div role="status" aria-live="polite">
          <h1 class="text-[#005B8E] font-semibold text-xl mb-2">¡Listo!</h1>
          <p class="mb-4">{{ message }}</p>
        </div>
        <RouterLink to="/profile" class="action-btn">Ir a mi perfil</RouterLink>
      </template>

      <template v-else>
        <div role="alert">
          <h1 class="text-red-700 font-semibold text-xl mb-2">No pudimos confirmarlo</h1>
          <p class="mb-4">{{ message }}</p>
        </div>
        <RouterLink to="/profile" class="action-btn">Volver a mi perfil</RouterLink>
      </template>
    </div>
  </main>
</template>
