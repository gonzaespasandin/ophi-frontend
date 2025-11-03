<script setup>
import { RouterLink } from 'vue-router';

// OBTENEMOS HISTORIAL
let history = [
    {
        id: 1,
        product: 'Fideos Marolio De Sémola',
        result: 'danger', 
        unsafeIngredient: 'Harina de trigo'
    },
    {
        id: 2,
        product: 'Fideos Marolio De Sémola',
        result: 'success',
        unsafeIngredient: ''
    },
    {
        id: 3,
        product: 'Fideos Marolio De Sémola',
        result: 'danger',
        unsafeIngredient: 'Harina de trigo'
    }
]

</script>


<template>
    <div class="bg-white p-3" id="history-component">
        <div class="flex justify-between items-center text-[#005B8E] ">
            <h2 class="text-md">Tus últimos escaneos</h2>
            <RouterLink to="/" class="text-sm">Ver más <i class="fa-solid fa-arrow-right ps-1"></i></RouterLink>
        </div>
        <div class="mt-4">
            <ul class="history-list">
                <li v-for="scan in history" :key="scan.id" :class="scan.result === 'danger' ? 'danger-border' : 'success-border'" class="flex flex-col justify-center">
                   <div class="flex justify-around items-center">
                        <div>
                            <h3>{{ scan.product }}</h3>
                            <p :class="scan.unsafeIngredient ? 'text-[#C43B52]' : 'text-[#009161]'" class="text-center font-medium">{{ scan.unsafeIngredient || 'Seguro' }}</p>
                        </div>
                        <i v-if="scan.result === 'success'" class="fa-solid fa-circle-check text-[#009161]"></i>
                        <i v-else class="fa-solid fa-triangle-exclamation text-[#C43B52]"></i>
                   </div>
                </li>
            </ul>
        </div>
    </div>
</template>