<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
    <div @click="router.go(-1)" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</div>
</template>