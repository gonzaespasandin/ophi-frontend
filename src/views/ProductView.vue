<script setup>
import { onMounted, ref } from 'vue';
import { findByName } from '../services/product';
import { useRoute, useRouter } from 'vue-router';
import Alert from '../components/ui/Alert.vue';
import { suscribeToAuthObserver } from '../services/auth';
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import AlertSomeUsers from '../components/ui/AlertSomeUsers.vue';
import { useProductSafety } from '../composables/useProductSafety.js';

let unsuscribeToAuthObserver = () => {};

const route = useRoute();
const router = useRouter();



const user = ref({});

const product = ref('');

const { safe, unsafeIngredients, normalizedIngredients, checkAll } = useProductSafety();
const charge = ref(false);

const latestSearches = ref([]);
if(localStorage.getItem('latestSearches')) {
    latestSearches.value = JSON.parse(localStorage.getItem('latestSearches'));
}

onMounted(async () => {
    try {
        product.value = await findByName(route.params.name);

        console.log(product.value);
        // Si no encuentra asbolutamente NINGUIN producto, vamos a not found
        if(product.value === 404 || product.value.length === 0) {
            router.push('/not-found');
            return;
        } else if(product.value.length > 1) { // EN caso de encontrar al menos 2 o más coincidencias en la DB, vamos a la lista de productos, guardando en localStorage lso resultados.
            localStorage.setItem('products', JSON.stringify(product.value));
            router.push(`/search-list/${route.params.name}`);
            return;
        }
        manageLocalStorage(product.value[0].name);
        charge.value = true;
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

function manageLocalStorage(productName) {
    if(latestSearches.value.includes(productName)) {
        latestSearches.value = latestSearches.value.filter(p => p !== productName);
    }

    latestSearches.value.push(productName);

    if(latestSearches.value.length > 4) {
        latestSearches.value.shift();
    } 


    localStorage.setItem('latestSearches', JSON.stringify(latestSearches.value));
}


console.log(safe.value, 'safe?')
</script>

<template>
    <AuthLayout>
        <div v-if="charge">
            <Top/>
            <Back/>
            <div class="bg-white m-3 p-3">
                <h2 class="text-center text-2xl">{{product.name}}</h2>
                <span class="block text-center mb-5">Resultados</span>
                <Alert v-if="user.profiles.length === 1" :safe="safe"></Alert>
                <AlertSomeUsers v-else :safe="safe"></AlertSomeUsers>
            </div>

            <div class="bg-white m-3 p-3">
                <h2 :class="safe.isSafe ? 'text-[#009161]' : 'text-[#C43B52]'" class="text-2xl">{{ (safe.isSafe) ? 'Ingredientes' : unsafeIngredients }}</h2>
                <p>{{ normalizedIngredients }}</p>
            </div>
        </div>
        </AuthLayout>
    

</template>