<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref} from "vue";
import Search from "../components/ui/Search.vue";
import History from "../components/ui/History.vue";
import RecomendedProducts from "../components/ui/RecomendedProducts.vue";
import { getBrands, getCategory, getOrigins } from "../services/product.js";

  let unsuscribeToAuthObserver = () => {}

  const user = ref({});
  const userNameLength = ref(3);

  async function loadBrands() {
    try {
      const result = await getBrands();
      if(result && result.data.length > 0) {
        sessionStorage.removeItem('brands');
        sessionStorage.setItem('brands', JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('[HomeView] -> loadBrands(), Error:', error);
    }
  }

  async function loadOirigns() {
    try {
      const result = await getOrigins();
      if(result && result.data.length > 0) {
        sessionStorage.removeItem('origins');
        sessionStorage.setItem('origins', JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('[HomeView] -> loadOirigns(), Error:', error);
    }
  }

  async function loadCategories() {
    try {
      const result = await getCategory();
      if(result && result.data.length > 0) {
        sessionStorage.removeItem('categories');
        sessionStorage.setItem('categories', JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('[HomeView] -> loadCategories(), Error:', error);
    }
  }

  onMounted(() => {
    localStorage.removeItem('pending_scan_barcode');
    unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);
    userNameLength.value = user.value.name.length;

    

    if(!sessionStorage.getItem('brands') && !sessionStorage.getItem('categories') && !sessionStorage.getItem('origins')) {
      Promise.allSettled([
        loadBrands(),
        loadOirigns(),
        loadCategories(),
      ]);
    }
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