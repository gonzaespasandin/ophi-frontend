<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Top from '../components/ui/Top.vue';
import Back from '../components/ui/Back.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

const route = useRoute();

const products = ref([]);


onMounted(() => {
    products.value = JSON.parse(localStorage.getItem('products'));
    console.log(products.value);
})
</script>

<template>
    <AuthLayout>
        <Top/>
        <!-- <RouterLink to="/search" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink> -->
        <template v-if="products.length > 0">
            <div class="bg-white m-3 p-3">
                <h2 class="font-light text-2xl text-center">Resultados para <span class=" font-black">{{ route.params.search }}</span></h2>
            </div>
            <div class="bg-white m-3 p-3">
                <ul>
                    <li v-for="product of products" :key="product.id" class="bg-[#005B8E] mb-3 text-white search-list-item p-2">
                        <RouterLink :to="`/product/${product.name}/${product.brand}`">
                            <h3>{{ product.name }}</h3>
                            <p class="text-[14px]">Marca: {{ product.brand }}</p>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </template>
        <template v-else>
            <div class="bg-white m-3 p-3">
                <h2 class="font-light text-2xl text-center">¡Lo sentimos!</h2>
                <p class="text-center py-5">No encontramos resultados</p>
            </div>
        </template>
    </AuthLayout>
    
</template>