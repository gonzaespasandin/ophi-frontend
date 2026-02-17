<script setup>
import { onMounted, ref } from 'vue';
import { findByNameAndBrand } from '../services/product';
import { useRoute } from 'vue-router';
import Alert from '../components/ui/Alert.vue';
import { suscribeToAuthObserver } from '../services/auth';
import Top from "../components/ui/Top.vue";
import AuthLayout from '../layouts/AuthLayout.vue';
import AlertSomeUsers from '../components/ui/AlertSomeUsers.vue';
import { useProductSafety } from '../composables/useProductSafety.js';
import AppLoading from '../components/loadings/AppLoading.vue';
import Error from '../components/ui/Error.vue';

let unsuscribeToAuthObserver = () => {};

const route = useRoute();
const user = ref({});
const loading = ref(true)
const product = ref(null);
const { safe, unsafeIngredients, normalizedIngredients, checkAll, unrestrictedProfiles } = useProductSafety();
const error = ref(false);
const errorMessage = ref('');

const latestSearches = ref([]);
if(localStorage.getItem('latestSearches')) {
    latestSearches.value = JSON.parse(localStorage.getItem('latestSearches'));
}

onMounted(async () => {
    try {
        const result = await findByNameAndBrand(route.params.name, route.params.brand);
        if (!result || result.length === 0) {
            product.value = null;
        } else {
            product.value = result;
            manageLocalStorage(product.value[0].name, product.value[0].brand.name);
        }
        loading.value = false;
    } catch (err) {
        console.error('[ProductView] -> No se pudo obtener el producto por nombre', err);
        error.value = true;
        errorMessage.value = 'Error al obtener el producto';
    } finally {
        loading.value = false;
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

    latestSearches.value.push({name: productName, brand: productBrand});

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
        <template v-if="loading">
            <div class="flex justify-center mt-90">
                <AppLoading/>
            </div>
        </template>
        <template v-else-if="error">
            <Error :errorMessage="errorMessage"/>
        </template>
        <template v-else-if="!product">
            <div class="bg-white m-3 shadow-md p-3 rounded-lg">
                <h2 class="font-light text-2xl text-center">¡Lo sentimos!</h2>
                <p class="text-center py-5">No encontramos resultados</p>
            </div>
        </template>
        <template v-else>
            <div>
                <div class="bg-white shadow-md  m-3 p-3 rounded-lg">
                    <h2 class="text-center text-2xl">{{product.name}}</h2>
                    <h3 class="text-center font-semibold">{{ product.brand.name }}</h3>
                    <span class="block text-center mb-5">Resultados</span>
                    <Alert v-if="user.profiles.length === 1" :safe="safe"></Alert>
                    <AlertSomeUsers v-else :safe="safe" :unrestrictedProfiles="unrestrictedProfiles"></AlertSomeUsers>
                </div>

                <div class="bg-white shadow-md  m-3 p-3 rounded-lg">
                    <h2 v-if="safe.length === 1" :class="(safe[0].isSafe) ? 'text-[#009161]' : 'text-[#C43B52]'" class="text-2xl">{{ (safe[0].isSafe) ? 'Ingredientes' : unsafeIngredients }}</h2>
                    <h2 v-else class="text-[#C43B52] text-2xl">{{ unsafeIngredients }}</h2>
                    <p>{{ normalizedIngredients }}</p>
                </div>
            </div>

        </template>

    </AuthLayout>
</template>