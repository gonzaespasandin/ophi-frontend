<script setup>
import { computed, ref } from 'vue'

const model = defineModel()

defineOptions({ inheritAttrs: false })

const props = defineProps({
  invalid: { type: Boolean, default: false },
  // 'band' sits on the blue auth band, where the white fill is the field's edge.
  // 'light' sits on a white card, where it has to draw its own.
  tone: { type: String, default: 'band' },
})

const isLight = computed(() => props.tone === 'light')

const isVisible = ref(false)

const currentType = computed(() => isVisible.value ? 'text' : 'password')
const icon = computed(() => isVisible.value ? 'fa-eye-slash' : 'fa-eye')
const toggleLabel = computed(() => isVisible.value ? 'Ocultar contraseña' : 'Mostrar contraseña')

// The inner input is outline:none so it can share one rounded box with the eye
// button, so the box carries the focus ring for it.
const focusClasses = computed(() => isLight.value
  ? 'focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ophi-blue focus-within:border-ophi-blue'
  : 'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white'
)

const borderClasses = computed(() => {
  if (props.invalid) return 'border-2 border-ophi-danger'

  return isLight.value ? 'border-gray-300' : 'border-transparent'
})

function toggleVisibility() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div
    data-testid="password-field"
    class="flex items-center min-w-0 rounded-card overflow-hidden bg-white border-[1.5px]"
    :class="[borderClasses, focusClasses]"
  >
    <input
      class="grow min-w-0 pl-3 pr-1 border-none outline-none bg-transparent text-[15px] text-[#111827]"
      :class="isLight ? 'h-11' : 'h-12'"
      :type="currentType"
      v-model="model"
      v-bind="$attrs"
    >

    <button
      type="button"
      class="grid place-items-center shrink-0 text-[15px] text-ophi-green active:bg-ophi-green-soft transition-colors cursor-pointer"
      :class="isLight ? 'w-11 h-11' : 'w-12 h-12'"
      :aria-label="toggleLabel"
      @click="toggleVisibility"
    ><i class="fa-solid" :class="icon" aria-hidden="true"></i></button>
  </div>
</template>
