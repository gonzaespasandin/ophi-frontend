<script setup>
import { onMounted, ref } from 'vue'

import axiosInstance from "./config/axios.js";

import AppLoading from "./components/AppLoading.vue";

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
  <AppLoading v-if="loading" />
  <router-view v-else v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" />
      </transition>
  </router-view>
</template>