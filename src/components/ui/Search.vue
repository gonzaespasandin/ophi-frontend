<script setup>
import { ref } from 'vue';
import {useRouter} from "vue-router";


const router = useRouter();



// const inputValue = ref('');


function handleSubmit() {
    router.push('/search');
}


</script>

<template>
    <div class="flex justify-around items-center shadow-md max-w-90 m-auto bg-[#f5f5f5] h-12 rounded-[11px]" id="search" @click="handleSubmit">
        <input type="text" id="search" name="search"  placeholder="Buscar productos..." v-model="inputValue" class=" border-0 outline-0">
        <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
    </div>
</template>