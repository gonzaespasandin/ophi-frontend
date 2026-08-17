<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import ProfileAvatar from '../ui/ProfileAvatar.vue'
import logoPositivo from '../../assets/img/logo-positivo.png'

const props = defineProps({
  name: { type: String, default: '' },
  avatarColor: { type: String, default: null },
})

const firstName = computed(() => props.name?.trim()?.split(/\s+/)[0] ?? '')
</script>

<template>
  <div class="bg-ophi-blue dot-texture-band px-4 pt-4 pb-[18px] rounded-b-[22px]">
    <div class="flex items-center gap-3">
      <img :src="logoPositivo" alt="Ophi" class="shrink-0 w-[118px] h-9 object-contain object-left">

      <span class="flex-1"></span>

      <RouterLink
        to="/profile"
        aria-label="Ir a mi perfil"
        class="flex items-center gap-2 shrink-0 min-w-0 max-w-[150px] h-11 pl-[5px] pr-[10px] rounded-[22px] border border-white/30 bg-white/15 active:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ProfileAvatar :name="firstName" :color="avatarColor" :size="34" />
        <span class="min-w-0 truncate font-semibold text-[13.5px] text-white">{{ firstName }}</span>
      </RouterLink>
    </div>

    <div class="mt-[14px]">
      <slot name="search" />
    </div>
  </div>
</template>
