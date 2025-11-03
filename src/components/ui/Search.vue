<script setup>
import { ref } from 'vue';
import {useRouter} from "vue-router";


const router = useRouter();

const inputValue = ref('');


function handleSubmit() {
    const normalizedName = inputValue.value.trim().toLowerCase();
    console.log(normalizedName);
    router.push(`/product/${normalizedName}`)
}


</script>

<template>
    <form  class="flex justify-around items-center max-w-90 m-auto bg-[#f5f5f5] h-12" id="search" @submit.prevent="handleSubmit">
        <input type="text" id="search" name="search"  placeholder="Buscar productos..." v-model="inputValue" class=" border-0 outline-0">
        <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
    </form>
</template>