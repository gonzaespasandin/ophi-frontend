<script setup>


const props = defineProps({
    safe: {
        String
    }
})

console.log(props.safe);

</script>

<template>
    <div :class="props.safe[0].isSafe === false ? 'danger' : 'success' "  class="max-w-80 m-auto flex justify-around items-center text-white h-14">
        <template v-if="props.safe[0].isSafe === false">
            <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
            <p class="w-60">No apto para tu consumo</p>
        </template>
        <template v-else>
            <i class="fa-solid fa-circle-check text-4xl"></i>
            <p class="w-60">Apto para tu consumo</p>
        </template>
    </div>
</template>
