<script setup>

const props = defineProps({
    errorMessage: {
        String
    }
})


</script>

<template>
    <div class="flex flex-col items-center mt-10 mx-3 bg-red-100 rounded-[11px] border-red-400 text-red-700 px-4 py-3">
        <p>{{ errorMessage }}</p>
    </div>
</template>
