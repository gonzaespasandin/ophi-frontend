<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { findByNameAndBrand } from '../services/product';
import { useRoute, useRouter } from 'vue-router';
import Alert from '../components/ui/Alert.vue';
import { suscribeToAuthObserver } from '../services/auth';
import Top from "../components/ui/Top.vue";
import AuthLayout from '../layouts/AuthLayout.vue';
import AlertSomeUsers from '../components/ui/AlertSomeUsers.vue';
import { useProductSafety } from '../composables/useProductSafety.js';
import AppLoading from '../components/loadings/AppLoading.vue';

let unsuscribeToAuthObserver = () => {};

const route = useRoute();
const user = ref({});
const loading = ref(true)
const product = ref('');
const { safe, unsafeIngredients, normalizedIngredients, checkAll } = useProductSafety();
const charge = ref(false);

const latestSearches = ref([]);
if(localStorage.getItem('latestSearches')) {
    latestSearches.value = JSON.parse(localStorage.getItem('latestSearches'));
}

onMounted(async () => {
    try {
        product.value = await findByNameAndBrand(route.params.name, route.params.brand);
        // const brands = product.value.map(p => p.brand);
        console.log({Product: product.value});

        if (product.value.length === 0 || product.value === 404) {
            product.value = null;
            return;
        }
        manageLocalStorage(product.value[0].name, product.value[0].brand.name);
        loading.value = false;
    } catch (error) {
        console.error('No se pudo obtener el producto por nombre', error);
    }

    unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);


    // EN caso de que sea UN PRODUCTO
    product.value = product.value[0];

    // Obtengo todos los perifles médicos del usuario.
    const userProfiles = user.value.profiles;

    // Obtengo los ingredientes del producto
    const productIngredeints = product.value.ingredients;

    // Chequeo (funcion aparte).
    checkAll(userProfiles, productIngredeints);    
  
    normalizedIngredients.value = normalizedIngredients.value.join(', ');

    unsafeIngredients.value = unsafeIngredients.value.join(' - ');
  
});

function manageLocalStorage(productName, productBrand) {
    latestSearches.value = latestSearches.value.filter(
        p => !(p.name === productName && p.brand === productBrand)
    );

    latestSearches.value.push({name: productName, brand: {name: productBrand}});

    if(latestSearches.value.length > 4) {
        latestSearches.value.shift();
    } 


    localStorage.setItem('latestSearches', JSON.stringify(latestSearches.value));
}

</script>

<template>
    <!-- Es pero ILEGIBLE pero funca -->
    <AuthLayout :class="(!loading) ? (user?.profiles?.length === 1) ? (safe[0]?.isSafe) ? 'square-with-gradient-success' : 'square-with-gradient-danger' : '' : ''">
        <Top/>
        <!-- <Back/> -->
        <template  v-if="!loading">
            <div>
                <div class="bg-white shadow-md  m-3 p-3 rounded-[.5rem]">
                    <h2 class="text-center text-2xl">{{product.name}}</h2>
                    <h3 class="text-center font-semibold">{{ product.brand.name }}</h3>
                    <span class="block text-center mb-5">Resultados</span>
                    <Alert v-if="user.profiles.length === 1" :safe="safe"></Alert>
                    <AlertSomeUsers v-else :safe="safe"></AlertSomeUsers>
                </div>

                <div class="bg-white shadow-md  m-3 p-3 rounded-[.5rem]">
                    <h2 v-if="safe.length === 1" :class="(safe[0].isSafe) ? 'text-[#009161]' : 'text-[#C43B52]'" class="text-2xl">{{ (safe[0].isSafe) ? 'Ingredientes' : unsafeIngredients }}</h2>
                    <h2 v-else class="text-[#C43B52] text-2xl">{{ unsafeIngredients }}</h2>
                    <p>{{ normalizedIngredients }}</p>
                </div>
            </div>
            <div v-if="product === null">
                <div class="bg-white m-3 shadow-md p-3 rounded-[.5rem]">
                    <h2 class="font-light text-2xl text-center">¡Lo sentimos!</h2>
                    <p class="text-center py-5">No encontramos resultados</p>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="flex justify-center mt-90">
                <AppLoading/>
            </div>
        </template>
    </AuthLayout>
</template>