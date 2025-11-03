<script setup>
import { onMounted, ref } from 'vue';
import { findByName } from '../services/product';
import { useRoute, useRouter } from 'vue-router';
import Alert from '../components/ui/Alert.vue';
import { suscribeToAuthObserver } from '../services/auth';
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import AuthLayout from '../layouts/AuthLayout.vue';

let unsuscribeToAuthObserver = () => {};

const route = useRoute();
const router = useRouter();



const user = ref({});

const product = ref('');

const safe = ref(true);
const unsafeIngredients = ref([]);
const charge = ref(false);

const normalizedIngredients = ref([]);

onMounted(async () => {
    try {
        product.value = await findByName(route.params.name);
        console.log(product.value)
        // Si no encuentra asbolutamente NINGUIN producto, vamos a not found
        if(product.value === 404) {
            router.push('/not-found');
            return;
        } else if(product.value.length > 1) { // EN caso de encontrar al menos 2 o más coincidencias en la DB, vamos a la lista de productos, guardando en localStorage lso resultados.
            localStorage.setItem('products', JSON.stringify(product.value));
            router.push(`/search-list/${route.params.name}`);
            return;
        }
        console.log(product.value)
        charge.value = true;
    } catch (error) {
        console.error('No se pudo obtener el producto por nombre', error);
    }

    unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);


    // EN caso de que sea UN PRODUCTO
    product.value = product.value[0];

    // Obtengo el perfil médico del PROPIO usuario (asuymo que debe ser siempre el de posición 0, el primero que crea)
    const userProfileIngredients = user.value.profiles[0].ingredients;
    // Obtengo los ingredeitnes del producto
    console.log(product.value.ingredients);
    const productIngredeints = product.value.ingredients;

    // Recorro los ingredientes del producto
    productIngredeints.forEach(Pingredient => {
        // Agrego cada uno a un array, para luego hacer un párrafo.
        normalizedIngredients.value.push(Pingredient.name);

        // Por cada ingrediente, recorro los ingredientes que tiene que evitar el usuario, para ver si el alimento es seguro para el o no lo es.
        userProfileIngredients.forEach(Uingredient => {
            if(Pingredient.name === Uingredient.name) {
                unsafeIngredients.value.push(Pingredient.name);
                safe.value = false;
            }
        })
    
    });
  
    normalizedIngredients.value = normalizedIngredients.value.join(', ');

    unsafeIngredients.value = unsafeIngredients.value.join(', ');
    console.log(safe.value);
});



</script>

<template>
    <AuthLayout>
        <div v-if="charge">
            <Top/>
            <Back/>
            <div class="bg-white m-3 p-3">
                <h2 class="text-center text-2xl">{{product.name}}</h2>
                <span class="block text-center mb-5">Resultados</span>
                <Alert :safe="safe"></Alert>
            </div>

            <div class="bg-white m-3 p-3">
                <h2 :class="safe ? 'text-[#009161]' : 'text-[#C43B52]'" class="text-2xl">{{ (safe) ? 'Ingredientes' : unsafeIngredients }}</h2>
                <p>{{ normalizedIngredients }}</p>
            </div>
        </div>
        </AuthLayout>
    

</template>