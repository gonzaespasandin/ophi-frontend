<script setup>
import logo from '../../assets/img/logo.png'

defineProps({
  // A title turns the row into a wizard header: back, what you are answering,
  // and the logo pushed to the far edge. Without one the logo sits next to the
  // back button, where it reads as the screen's own mark.
  title: { type: String, default: null },
  subtitle: { type: String, default: null },
  to: { type: String, default: null },
})

const emit = defineEmits(['back'])
</script>

<template>
  <div class="flex items-center gap-1.5">
    <component
      :is="to ? 'RouterLink' : 'button'"
      :to="to"
      :type="to ? undefined : 'button'"
      aria-label="Volver"
      class="grid place-items-center shrink-0 w-11 h-11 -ml-2.5 rounded-card text-[17px] text-ophi-blue active:bg-ophi-blue-soft transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-blue"
      @click="to ? null : emit('back')"
    >
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
    </component>

    <img v-if="!title" :src="logo" alt="Ophi" class="shrink-0 h-8 object-contain object-left">

    <template v-else>
      <div class="flex-1 min-w-0">
        <p class="font-roboto-slab font-bold text-[17px]/[1.2] text-[#111827]">{{ title }}</p>
        <p v-if="subtitle" class="mt-px font-medium text-[11.5px] text-ophi-slate">{{ subtitle }}</p>
      </div>

      <img :src="logo" alt="Ophi" class="shrink-0 h-[30px] object-contain object-right">
    </template>
  </div>
</template>
