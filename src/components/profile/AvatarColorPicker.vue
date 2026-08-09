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
    <legend class="mb-[9px] font-medium text-[13px] text-gray-700">Color del avatar</legend>
    <div class="grid grid-cols-6 gap-2 justify-items-center">
      <label
        v-for="color of colors"
        :key="color.value"
        class="relative grid place-items-center w-11 h-11 rounded-full cursor-pointer"
      >
        <input
          type="radio"
          class="sr-only peer"
          name="avatar-color"
          :value="color.value"
          v-model="model"
        />
        <span
          class="absolute inset-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ophi-blue"
          :style="{ backgroundColor: color.value }"
        ></span>
        <span
          v-if="model === color.value"
          class="absolute -inset-1 rounded-full border-[2.5px]"
          :style="{ borderColor: color.value }"
        ></span>
        <i
          v-if="model === color.value"
          class="fa-solid fa-check relative text-[17px] text-white drop-shadow-[0_1px_2px_rgb(0_0_0/.35)]"
          aria-hidden="true"
        ></i>
        <span class="sr-only">{{ color.name }}</span>
      </label>
    </div>
  </fieldset>
</template>
