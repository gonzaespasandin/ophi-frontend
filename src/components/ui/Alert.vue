<script setup>


const props = defineProps({
    safe: {
        String
    }
})

</script>

<template>
    <div :class="props.safe === false ? 'danger' : 'success' "  class="max-w-80 m-auto flex justify-around items-center text-white h-14">
        <template v-if="props.safe === false">
            <i class="fa-solid fa-triangle-exclamation text-4xl"></i>
            <p class="w-60">No apto para tu consumo</p>
        </template>
        <template v-else>
            <i class="fa-solid fa-circle-check text-4xl"></i>
            <p class="w-60">Apto para tu consumo</p>
        </template>
    </div>
</template>
