<script setup>
import { RouterLink } from 'vue-router';

// OBTENEMOS HISTORIAL
let history = [
    {
        id: 1,
        product: 'Bandejita de tomatitos cherry',
        result: 'danger', 
        unsafeIngredient: 'Tomate cherry'
    },
    {
        id: 2,
        product: 'Cepita de durazno',
        result: 'success',
        unsafeIngredient: ''
    },
    {
        id: 3,
        product: 'Coca-cola de durazno',
        result: 'success',
        unsafeIngredient: ''
    }
]

</script>


<template>
    <div class="bg-white p-3" id="history-component">
        <div class="flex justify-between items-center text-[#005B8E]">
            <h2 class="text-md">Tus últimos escaneos</h2>
            <RouterLink to="/" class="text-sm">Ver más <i class="fa-solid fa-arrow-right ps-1"></i></RouterLink>
        </div>
        <div class="mt-4">
            <ul class="history-list">
                <li v-for="scan in history" :key="scan.id" :class="scan.result === 'danger' ? 'danger' : 'success'" class="flex flex-col justify-center">
                   <div class="flex justify-start px-5 items-center gap-3 text-white">
                        <i v-if="scan.result === 'success'" class="fa-solid fa-circle-check text-[white] text-5xl"></i>
                        <i v-else class="fa-solid fa-triangle-exclamation text-[white] text-5xl"></i>
                        <div>
                            <h3>{{ scan.product }}</h3>
                            <p class="text-md font-extralight">Detalles...</p>
                        </div>
                        
                   </div>
                </li>
            </ul>
        </div>
    </div>
</template>