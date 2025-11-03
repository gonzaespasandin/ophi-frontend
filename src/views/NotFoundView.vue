<script setup>
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
</script>

<template>
    <Top/>
    <RouterLink to="/" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink>
    <h1>Lo sentimos! No encontramos el resultado que buscabas</h1>
</template>