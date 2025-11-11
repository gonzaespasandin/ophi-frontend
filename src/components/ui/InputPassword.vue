<script setup>
import {useTemplateRef, ref} from "vue";


const model = defineModel()

defineOptions({inheritAttrs: false})
const currentType = ref('password')
const typeValues = {
  'password': {
    toggleTo: 'text',
    icon: 'fa-solid fa-eye fa-xl icon',
  },
  'text': {
    toggleTo: 'password',
    icon: 'fa-solid fa-eye-slash fa-xl icon',
  }
}

function handleClick() {
  currentType.value = typeValues[currentType.value].toggleTo
}
</script>

<template>
  <div class="flex bg-white rounded-t-[.2rem] border-b border-b-[#009161]">
    <input
        class="grow-1 p-2"
        ref="input"
        :type="currentType"
        v-model="model"
        v-bind="$attrs"
    >
    <button
        type="button"
        class="p-2"
        aria-label="Mostrar / Ocultar contraseña"
        @click="handleClick"

    ><i :class="typeValues[currentType].icon"></i></button>
  </div>
</template>

<style scoped>
.icon {
  color: #009161
}
</style>