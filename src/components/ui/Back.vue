<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
    <button
        class="border border-black/20 hover:bg-black/10 m-2 hover:border-black/30 transition cursor-pointer inline-flex items-center py-2 px-4 gap-2  mb-2 rounded-[11px]"
        @click="router.go(-1)"
    ><i class="fa-solid fa-chevron-left pe-2"></i> Volver</button>
</template>

<style scoped>
i {
  transition: 300ms ease;
}

button:hover i {
  transform: translateX(-3px);
}
</style>