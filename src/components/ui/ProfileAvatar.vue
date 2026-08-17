<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  color: { type: String, default: null },
  size: { type: Number, default: 26 },
})

const initial = computed(() => props.name?.trim()?.[0]?.toUpperCase() ?? '?')
const backgroundColor = computed(() => props.color ?? '#005B8E')

const dimensions = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.44)}px`,
  backgroundColor: backgroundColor.value,
}))
</script>

<template>
  <span
    data-testid="profile-avatar"
    class="grid place-items-center shrink-0 rounded-full font-roboto-slab font-semibold text-white"
    :style="dimensions"
    aria-hidden="true"
  >{{ initial }}</span>
</template>
