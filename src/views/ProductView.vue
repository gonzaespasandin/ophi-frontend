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

let unsuscribeToAuthObserver = () => {};

const route = useRoute();
const router = useRouter();



const user = ref({});

const product = ref('');

const safe = ref([]);
const unsafeIngredients = ref([]);
const charge = ref(false);

const latestSearches = ref([]);
if(localStorage.getItem('latestSearches')) {
    latestSearches.value = JSON.parse(localStorage.getItem('latestSearches'));
}


const normalizedIngredients = ref([]);

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

function checkAll(userProfiles, productIngredeints) {
    // Recorro los user profile
    userProfiles.forEach(userProfile => {
        // Recorro los ingredientes de cada user profile
        userProfile.ingredients.forEach(uIngredients => {
            // Recorro los ingredientes del producto
            productIngredeints.forEach(Pingredient => {
                // Si no está en el array de normalizedIngredients, agrego (sino, se agregaría por cada perfil que tenga el usaurio).
                // Si una paja, pero probe al reves (por cada ingrediente, recorrer los ingredientes del usuario) y lo recorre más veces todavia.
                // TODO: mejorarlo?
                if(!normalizedIngredients.value.includes(Pingredient.name)) {
                    normalizedIngredients.value.push(Pingredient.name);
                }      
        
                if(uIngredients.ingredients.length > 0) {
                    
                    browseIfUserHasMoreThanOneIngredient(uIngredients.ingredients, Pingredient, userProfile); 
                } else {
                 
                    browseIfUserHasOneIngredient(uIngredients, Pingredient, userProfile);
                }
            });
        });
    });
}

function browseIfUserHasMoreThanOneIngredient(uIngredients, Pingredient, userProfile) {
    uIngredients.forEach(uIngredient => {
        // Evalúo si hay coincidencias por id (no sé pq, pero probablemnete sea mas robusto (algo ne mi intuición me lo dice JA PON PPPPON)).
        if(uIngredient.id === Pingredient.id) {
            // Si no esta ne le array unsafeIngredients, agrego los valores.
            if(!unsafeIngredients.value.includes(Pingredient.name)) {
                unsafeIngredients.value.push(Pingredient.name);
            }
            pushValueToSafeArray(userProfile, false, Pingredient);
        }
        pushValueToSafeArray(userProfile, true);
    })
}

function browseIfUserHasOneIngredient(uIngredients, Pingredient, userProfile) {
    // Evalúo si hay coincidencias por id (no sé pq, pero probablemnete sea mas robusto (algo ne mi intuición me lo dice JA PON PPPPON)).
    console.log('Ejecutado 2')
    if(uIngredients.id === Pingredient.id) {
        // Si no esta ne le array unsafeIngredients, agrego los valores.
        if(!unsafeIngredients.value.includes(Pingredient.name)) {
            unsafeIngredients.value.push(Pingredient.name);
        }
        pushValueToSafeArray(userProfile, false, Pingredient);
    }
    pushValueToSafeArray(userProfile, true);
}

function pushValueToSafeArray(userProfile, bool, Pingredient = null) {
  const index = safe.value.findIndex(s => s.forWho === userProfile.name);

  if (index === -1) {
    // Si el perfil no existe todavía, lo creamos
    safe.value.push({
      isSafe: bool,
      forWho: userProfile.name,
      unsafeIngredients: !bool && Pingredient ? [Pingredient.name] : []
    });
  } else {
    // Si ya existe el perfil
    const userSafe = safe.value[index];

    // Si encontramos un ingrediente peligroso
    if (!bool && Pingredient) {
      // Solo agregamos si no está repetido
      if (!userSafe.unsafeIngredients.includes(Pingredient.name)) {
        userSafe.unsafeIngredients.push(Pingredient.name);
      }

      // Marcamos el perfil como no seguro
      userSafe.isSafe = false;
    }

    // Si es seguro y no había estado marcado antes como inseguro, lo mantenemos
    safe.value[index] = userSafe;
  }
}

function manageLocalStorage(productName) {

    // let theNameIsThere = latestSearches.value.some(name => name === productName); 
    // if(theNameIsThere){
    //     console.log(latestSearches.value.findIndex(name => name === productName));
    //     latestSearches.value[0] = productName;
    // }

    // TERMINAR
    if(latestSearches.value.length < 4 && !latestSearches.value.includes(productName)) {
        latestSearches.value.push(productName);
    } else {
        latestSearches.value.shift();
    }
    
    

    console.log(latestSearches.value, 'LOCLA STORAGE');

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