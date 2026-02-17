<script setup>
import { onMounted, ref } from 'vue'
import {useRoute} from "vue-router";

import axiosInstance from "./config/axios.js";

import AppLoading from "./components/loadings/AppLoading.vue";

const route = useRoute();
const loading = ref(false)

/** CSRF-COOKIE */
onMounted(async  () => {
  try {
    loading.value = true

    console.log('Getting CSRF cookie from Sanctum....')
    const response = await axiosInstance.get('/sanctum/csrf-cookie')

    if (response.status === 204) {
      console.log('Cookies are up to date!')
    }
  } catch (error) {
    console.error('Error getting this cookie thing', error)
  }

  loading.value = false
})
</script>

<template>
  <RouterView v-slot="{ Component }" :key="route.path">
    <transition >
      <component :is="Component"/>
    </transition>
  </RouterView>
</template>