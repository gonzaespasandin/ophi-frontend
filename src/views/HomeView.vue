<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref} from "vue";
import Search from "../components/ui/Search.vue";
import History from "../components/ui/History.vue";
import RecomendedProducts from "../components/ui/RecomendedProducts.vue";

  let unsuscribeToAuthObserver = () => {}

  const user = ref({});
  const userNameLength = ref(3);

  onMounted(() => {
    localStorage.removeItem('pending_scan_barcode');
    unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);
    userNameLength.value = user.value.name.length;
  })
  

  onUnmounted(() => unsuscribeToAuthObserver());
</script>

<template>
  <AuthLayout class="square-with-gradient">
    <!-- <h1 class="text-4xl">Inicio</h1> -->
    <div class="flex justify-between align-center mt-10 p-3 gap-4 mx-3" :class="userNameLength > 15 ? 'flex-col items-center' : 'flex-row'">
        <img src="../assets/img/logo-positivo.png"></img>
        <RouterLink to="/profile" class="info-auth flex align-center justify-center mt-4 text-white">
          <i class="fa-solid fa-circle-user text-2xl pe-2"></i>
          <div>
            <p>{{ user.name }}</p>
          </div>
        </RouterLink>
    </div>
    <div class="mx-3 mt-4">
      <Search></Search>
    </div>
    <div class="mt-6 mx-3">
      <History></History>
    </div>
    <div>
      <RecomendedProducts v-if="user && user.profiles" :user="user.profiles" :subscription="user.subscription.plan_id"></RecomendedProducts>
    </div>
  </AuthLayout>
</template>

<style scoped>
img {
  width: 120px;
}

@media (min-width: 400px) {
  img {
    width: 160px;
  }
}
</style>