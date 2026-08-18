<script setup>
import AuthScreen from '../components/auth/AuthScreen.vue'
import AuthButton from '../components/auth/AuthButton.vue'
import logo from '../assets/img/logo.png'
</script>

<template>
  <AuthScreen screen="welcome" layout="hero">
    <template #hero>
      <div class="flex-1 flex flex-col justify-center items-center px-6 pb-5 text-center">
        <img :src="logo" alt="Ophi" class="h-[46px] mb-[38px] object-contain">

        <h1 class="mb-3.5 font-roboto-slab font-bold text-[34px]/[1.15] text-[#111827]">
          Te damos la<br>bienvenida
        </h1>

        <p class="max-w-[290px] text-[15px]/[1.6] text-[#4B5563]">
          Somos <b class="font-semibold text-ophi-blue">ophi</b> y queremos ayudarte a comer sin preocupaciones.
        </p>
      </div>
    </template>

    <div class="px-5 pt-[30px] pb-[30px]">
      <AuthButton to="/register" icon="fa-arrow-right">Empezar</AuthButton>

      <AuthButton to="/login" variant="secondary" class="mt-[11px]">Ya tengo una cuenta</AuthButton>
    </div>
  </AuthScreen>
</template>
