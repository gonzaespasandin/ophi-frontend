<script setup>
const model = defineModel({ type: String, default: null })

const colors = [
  { value: '#005B8E', name: 'Azul' },
  { value: '#007050', name: 'Verde' },
  { value: '#9A3412', name: 'Naranja' },
  { value: '#B91C1C', name: 'Rojo' },
  { value: '#6D28D9', name: 'Violeta' },
  { value: '#374151', name: 'Gris' },
]
</script>

<template>
  <fieldset>
    <legend class="text-[#005B8E] font-semibold mb-2">Color del perfil</legend>
    <div class="flex gap-3 flex-wrap">
      <label
        v-for="color of colors"
        :key="color.value"
        class="cursor-pointer"
      >
        <input
          type="radio"
          class="sr-only peer"
          name="avatar-color"
          :value="color.value"
          v-model="model"
        />
        <span
          class="block w-10 h-10 rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[#005B8E]"
          :class="model === color.value ? 'border-[#005B8E] scale-110' : 'border-transparent'"
          :style="{ backgroundColor: color.value }"
        ></span>
        <span class="sr-only">{{ color.name }}</span>
      </label>
    </div>
  </fieldset>
</template>
