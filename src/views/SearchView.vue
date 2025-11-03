<script setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import { useRouter } from 'vue-router';
import { ref } from 'vue';


const router = useRouter();

const inputValue = ref('');


function handleSubmit() {
    const normalizedName = inputValue.value.trim().toLowerCase();
    console.log(normalizedName);
    router.push(`/product/${normalizedName}`)
}
</script>


<template>
  <AuthLayout>
    <div class="bg-[#005B8E] h-5"></div>
 
     <form class="flex justify-around items-center  m-auto bg-[#dddddd] h-12" @submit.prevent="handleSubmit">
        <i class="fa-solid fa-arrow-left"></i>
        <input type="text" id="search" name="search"  placeholder="Buscar productos..." v-model="inputValue" class=" border-0 outline-0 w-70">
        <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
    </form>
  </AuthLayout>
</template>