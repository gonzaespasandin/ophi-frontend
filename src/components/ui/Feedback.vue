<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info'
  }
})

const isVisible = ref(true)

const close = () => {
  isVisible.value = false
}

const typeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-100 border-green-400 text-green-800'
    case 'error':
      return 'bg-red-100 border-red-400 text-red-800'
    case 'warning':
      return 'bg-yellow-100 border-yellow-400 text-yellow-800'
    default:
      return 'bg-blue-100 border-blue-400 text-blue-800'
  }
})
</script>

<template>
  <Transition
    appear
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-3"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-3"
  >
    <div
      v-if="isVisible"
      class="absolute right-5 top-2 flex items-start gap-3 border-l-4 p-4 rounded-xl shadow-md"
      :class="typeClasses"
    >
      <div class="flex-1">
        <p class="text-sm font-medium">
          {{ message }}
        </p>
      </div>

      <button
        @click="close"
        class="text-lg leading-none opacity-60 hover:opacity-100 transition"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </Transition>
</template>
