<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref} from "vue";
import Search from "../components/ui/Search.vue";
import History from "../components/ui/History.vue";

  let unsuscribeToAuthObserver = () => {}

  const user = ref({});

  onMounted(() => {
    unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);
  })

  onUnmounted(() => unsuscribeToAuthObserver());
</script>

<template>
  <AuthLayout class="square-with-gradient">
    <!-- <h1 class="text-4xl">Inicio</h1> -->
    <div class="flex justify-center align-center mt-10 p-3 gap-4 mx-3">
        <img src="../assets/img/logo-positivo.png" class="w-30"></img>
        <div class="info-auth flex align-center justify-center mt-3 text-white">
          <i class="fa-solid fa-circle-user text-2xl pe-2"></i>
          <p>{{ user.name }}</p>
        </div>
    </div>
    <div class="mx-3">
      <Search></Search>
    </div>
    <div class="mt-5 mx-3">
      <History></History>
    </div>
  </AuthLayout>
</template>