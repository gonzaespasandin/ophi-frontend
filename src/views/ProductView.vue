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

const safe = ref({isSafe: true, forWho: ''});
const unsafeIngredients = ref([]);
const charge = ref(false);

const normalizedIngredients = ref([]);

onMounted(async () => {
    try {
        product.value = await findByName(route.params.name);

        // Si no encuentra asbolutamente NINGUIN producto, vamos a not found
        if(product.value === 404) {
            router.push('/not-found');
            return;
        } else if(product.value.length > 1) { // EN caso de encontrar al menos 2 o más coincidencias en la DB, vamos a la lista de productos, guardando en localStorage lso resultados.
            localStorage.setItem('products', JSON.stringify(product.value));
            router.push(`/search-list/${route.params.name}`);
            return;
        }
        charge.value = true;
    } catch (error) {
        console.error('No se pudo obtener el producto por nombre', error);
    }

    unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);


    // EN caso de que sea UN PRODUCTO
    product.value = product.value[0];

    // Obtengo todos los perifles médicos del usuario.
    const userProfilesIngredients = user.value.profiles;

    // Obtengo los ingredientes del producto
    const productIngredeints = product.value.ingredients;

    // Chequeo (funcion aparte).
    checkAll(userProfilesIngredients, productIngredeints);    
  
    normalizedIngredients.value = normalizedIngredients.value.join(', ');

    unsafeIngredients.value = unsafeIngredients.value.join(' - ');
  
});

function checkAll(userProfilesIngredients, productIngredeints) {
    // Recorro los user profile
    userProfilesIngredients.forEach(userProfileIngredients => {
        
        // Recorro los ingredientes de cada user profile
        userProfileIngredients.ingredients.forEach(uIngredients => {
            // Recorro los ingredientes del producto
            productIngredeints.forEach(Pingredient => {
                // Si no está en el array de normalizedIngredients, agrego (sino, se agregaría por cada perfil que tenga el usaurio).
                // Si una paja, pero probe al reves (por cada ingrediente, recorrer los ingredientes del usuario) y lo recorre más veces todavia.
                // TODO: mejorarlo?
                if(!normalizedIngredients.value.includes(Pingredient.name)) {
                    normalizedIngredients.value.push(Pingredient.name);
                }      
                
              
               if(uIngredients.ingredients === []) {
                browseIfUserHasMoreThanOneIngredient(uIngredients.ingredients, Pingredient); 
               } else {
                browseIfUserHasOneIngredient(uIngredients, Pingredient);
               }
            });
        });
    });
}

function browseIfUserHasMoreThanOneIngredient(uIngredients, Pingredient) {
   uIngredients.forEach(uIngredient => {
        // Evalúo si hay coincidencias por id (no sé pq, pero probablemnete sea mas robusto (algo ne mi intuición me lo dice JA PON PPPPON)).
        
        if(uIngredient.id === Pingredient.id) {
            // Si no esta ne le array unsafeIngredients, agrego los valores.
            if(!unsafeIngredients.value.includes(Pingredient.name)) {
                unsafeIngredients.value.push(Pingredient.name);
            }
            // Cambio a safe como falso (una vez es suficiente).
            if(safe.value.isSafe) {
                safe.value.isSafe = false;
            } 
        }
    })
}

function browseIfUserHasOneIngredient(uIngredients, Pingredient) {

        // Evalúo si hay coincidencias por id (no sé pq, pero probablemnete sea mas robusto (algo ne mi intuición me lo dice JA PON PPPPON)).

        if(uIngredients.id === Pingredient.id) {
            // Si no esta ne le array unsafeIngredients, agrego los valores.
            if(!unsafeIngredients.value.includes(Pingredient.name)) {
                unsafeIngredients.value.push(Pingredient.name);
            }
            // Cambio a safe como falso (una vez es suficiente).
            if(safe.value.isSafe) {
                safe.value.isSafe = false;
            } 
        }
}


</script>

<template>
    <AuthLayout>
        <div v-if="charge">
            <Top/>
            <Back/>
            <div class="bg-white m-3 p-3">
                <h2 class="text-center text-2xl">{{product.name}}</h2>
                <span class="block text-center mb-5">Resultados</span>
                <Alert :safe="safe.isSafe"></Alert>
            </div>

            <div class="bg-white m-3 p-3">
                <h2 :class="safe.isSafe ? 'text-[#009161]' : 'text-[#C43B52]'" class="text-2xl">{{ (safe.isSafe) ? 'Ingredientes' : unsafeIngredients }}</h2>
                <p>{{ normalizedIngredients }}</p>
            </div>
        </div>
        </AuthLayout>
    

</template>