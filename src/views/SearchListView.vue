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
    console.log({ListOfProducts: products.value});
})
</script>

<template>
    <AuthLayout>
        <Top/>
        <!-- <RouterLink to="/search" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink> -->
        <template v-if="products.length > 0">
            <div class="bg-white shadow-md m-3 rounded-[11px] p-3">
                <h2 class="font-light text-2xl  text-center font-regular">Resultados para <span class=" font-semibold">{{ route.params.search }}</span></h2>
            </div>
            <div class="bg-white shadow-md rounded-[11px] m-3 p-3">
                <ul>
                    <li v-for="product of products" :key="product.id" class=" mb-3 bg-[#f8f8f8] search-list-item text-[#005B8E] p-2 px-3">
                        <RouterLink :to="`/product/${product.name}/${product.brand.name}`" class="flex items-center justify-between move">
                            <div>
                                <h3 class=" font-medium">{{ product.name }}</h3>
                                <p class="text-[14px] text-[#005B8E]">{{ product.brand.name }}</p>
                            </div>
                            <i class="fa-solid fa-chevron-right pe-2"></i>
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


<style scoped>
    .move {
        i {
            transition: transform .1s ease-out;
        }
    }
    .move:hover {
        i {
            transform: translateX(3px);
        }
    }
</style>