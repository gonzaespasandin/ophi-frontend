<script setup>
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
</script>

<template>
    <div>
      <Top/>
      <RouterLink
          to="/"
          class="border border-black/20 hover:bg-black/10 m-2 hover:border-black/30 transition cursor-pointer inline-flex items-center py-2 px-4 gap-2  mb-2 rounded-[11px]"
      ><i class="fa-solid fa-chevron-left pe-2"></i> Volver</RouterLink>

      <h1 class="px-4 text-2xl">Lo sentimos! No encontramos el resultado que buscabas</h1>
    </div>
</template>