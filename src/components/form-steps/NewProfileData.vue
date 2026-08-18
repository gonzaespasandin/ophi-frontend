<script setup>
import { onMounted, ref } from 'vue'
import ProfileAvatar from '../ui/ProfileAvatar.vue'
import AuthButton from '../auth/AuthButton.vue'
import FieldError from '../auth/FieldError.vue'

const model = defineModel()
const emit = defineEmits(['next', 'previous'])

defineProps({
  errors: [Object, Boolean, null],
  loading: Boolean,
})

const nameError = ref(null)
const existingProfiles = ref([])

function handleSubmit() {
  nameError.value = null

  const name = model.value.name.trim()

  if (name === '') {
    nameError.value = 'El nombre es obligatorio'
    return
  }

  const isTaken = existingProfiles.value.some(profile => profile.name === name)

  if (isTaken) {
    nameError.value = 'Ya tenés un perfil con ese nombre'
    return
  }

  emit('next')
}

onMounted(() => {
  // A cleared or expired session leaves no cached user behind; the duplicate
  // check is a courtesy here, the server is the one that enforces it.
  existingProfiles.value = JSON.parse(sessionStorage.getItem('ophi-user'))?.profiles ?? []
})
</script>

<template>
  <div class="flex flex-col flex-1 step-in">
    <h2 class="mb-1 font-roboto-slab font-bold text-[21px]/[1.2] text-white">¿De quién estamos hablando?</h2>
    <p class="mb-[18px] text-[13.5px]/[1.5] text-white/80">Poné un nombre que te sirva para reconocerlo.</p>

    <div class="p-3 rounded-card bg-white/10 border border-white/25">
      <label for="profile-name" class="block mb-2.5 font-medium text-[11.5px] uppercase tracking-[.05em] text-white/70">
        Nombre del perfil
      </label>

      <div class="flex items-center gap-[11px]">
        <ProfileAvatar :name="model.name" :size="44" class="ring-2 ring-white/55" />

        <input
          id="profile-name"
          v-model="model.name"
          :aria-invalid="nameError ? 'true' : undefined"
          :aria-describedby="nameError ? 'profile-name-error' : undefined"
          class="flex-1 min-w-0 h-11 px-3 rounded-card bg-black/15 font-semibold text-[14.5px] text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
          :class="nameError ? 'border-2 border-ophi-danger' : 'border-[1.5px] border-white/40'"
        >
      </div>

      <FieldError v-if="nameError" id="profile-name-error" :message="nameError" />
    </div>

    <div class="flex-1 min-h-[20px]"></div>

    <AuthButton
      data-testid="save-profile"
      icon="fa-check"
      icon-placement="start"
      :loading="loading"
      loading-label="Guardando…"
      class="mt-[18px]"
      @click="handleSubmit"
    >Agregar perfil</AuthButton>
  </div>
</template>
