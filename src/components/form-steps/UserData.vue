<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
const props = defineProps({
  where: String,
  errors: {type: Object, default: () => ({})},
  loading: {type: Boolean, default: false}
})
</script>

<template>
  <div class="flex flex-col grow">
    <!-- <button type="button" @click="emit('previous')">Volver</button> -->

    <h2 class="text-2xl font-semibold text-center">¡Último paso!</h2>

    <div class="flex flex-col justify-between grow p-4 min-h-80 bg-[#005B8E]">
      <div>
        <div class="mb-3">
          <label for="name">Nombre</label>
          <input
              id="name"
              :class="[errors.name ? 'inputs-wrong' : 'inputs', 'block border text-black']"
              type="text"
              name="name"
              placeholder="Ej: Juan Pérez"
              v-model="model.name">
          <p v-if="errors.name" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px] text-sm">
            {{ errors.name[0] }}
          </p>
        </div>

        <div class="mb-3">
          <label for="email">Email</label>
          <input
              id="email"
              :class="[errors.email ? 'inputs-wrong' : 'inputs', 'block border text-black']"
              type="email"
              name="email"
              placeholder="tu@email.com"
              v-model="model.email">
          <p v-if="errors.email" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px] text-sm">
            {{ errors.email[0] }}
          </p>
        </div>

        <div class="mb-3">
          <label for="password">Contraseña</label>
          <input
              id="password"
              :class="[errors.password ? 'inputs-wrong' : 'inputs', 'block border text-black']"
              type="password"
              name="password"
              v-model="model.password"
          >
          <p v-if="errors.password" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px] text-sm">
            {{ errors.password[0] }}
          </p>
          <p class="text-xs text-gray-300 mt-1">Mínimo 8 caracteres, al menos 1 mayúscula y 1 minúscula</p>
        </div>

        <div class="mb-3">
          <label for="confirm_password">Confirmar contraseña</label>
          <input
              id="confirm_password"
              :class="[errors.confirm_password ? 'inputs-wrong' : 'inputs', 'block border text-black']"
              type="password"
              name="confirm_password"
              v-model="model.confirm_password">
          <p v-if="errors.confirm_password" class="text-white bg-[#C43B52] w-fit px-2 mt-1 rounded-[11px] text-sm">
            {{ errors.confirm_password[0] }}
          </p>
        </div>
      </div>

      <button
          class="action-btn mt-6"
          :disabled="loading"
          @click="emit('next')"
      >{{ loading ? 'Registrando...' : 'Completar registro' }}</button>
    </div>
  </div>
</template>

<style scoped>

</style>