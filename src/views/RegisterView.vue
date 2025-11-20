<script setup>
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import {register} from "../services/auth.js";
import {ref} from "vue";
import { useRouter } from 'vue-router'

const loading = ref(false);
const router = useRouter();

async function handleSubmit(formData) {
  console.log('Registrar usuario', formData)
  loading.value = true;
  try {
    await register({...formData, ...formData.user_data})
    router.push('/')
  } catch (error) {
    console.error({error});
  }

  loading.value = false
}
</script>

<template>
  <div class="flex flex-col justify-around min-h-screen">
    <div class="flex flex-col justify-between flex-grow">
        <img src="../assets/img/logo.png" alt="">
        <div class="flex flex-col justify-center mb-5 px-3 h-50">
          <h1 class="text-3xl text-center">Registro</h1>
        </div>
      </div>
  
      <StepsContainer
        :steps="['terms', 'intolerances', 'allergies', 'diets', 'new_user_data']"
        @submit="handleSubmit"
        class="bg-[#005B8E] text-white p-3 min-h-80"  
    />
  </div>
</template>


<style scoped>
  div > div > div:first-child {
    background-image: url(../assets/img/tramas/Artboard\ 1trama-1.png);

    background-repeat: no-repeat;
    background-size: 175%;
  }

  img {
    display: block;
    margin: 4rem auto;
  }
</style>