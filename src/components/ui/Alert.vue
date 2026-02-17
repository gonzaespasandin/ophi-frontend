<script setup>


const props = defineProps({
    safe: {
        type: Array,
        default: [{isSafe: true}]
    }
})
const isSafe = props.safe[0]?.isSafe;

console.log('[Alert.vue]');
console.log({isSafe});

</script>

<template>
    <div v-if="isSafe !== undefined" :class="!isSafe ? 'danger' : 'success' "  class="max-w-80 m-auto flex justify-around items-center text-white h-14">
        <template v-if="!isSafe">
            <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
            <p class="w-60">No apto para tu consumo</p>
        </template>
        <template v-if="isSafe">
            <i class="fa-solid fa-circle-check text-4xl"></i>
            <p class="w-60">Apto para tu consumo</p>
        </template>
    </div>
    <div v-else class="flex flex-col justify-center items-center text-black p-3 mt-3 bg-[#f5f5f5] rounded-[11px]">
      <span>Tu perfil no tiene ninguna restricción cargada</span>
    </div>
</template>
