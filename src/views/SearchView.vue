<script setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { findByName, getMatchesByName } from '../services/product';
import { suscribeToAuthObserver } from '../services/auth';

let unsubscribeToAuthObserver = () => {}
const user = ref({});

const router = useRouter();
const route = useRoute();

const inputValue = ref('');

const products = ref([]);
const productsForSearchListView = ref([]);

const loading = ref(true)

//Arreglo local storage
const storage = ref([]);
const rawStorage = localStorage.getItem('latestSearches');
if (rawStorage) {
  try {
    storage.value = JSON.parse(rawStorage).reverse();
  } catch (error) {
    console.error('Error al parsear latestSearches desde localStorage', error);
    storage.value = [];
  }
}
//contexto del escaner para el template
const fromScanner = computed(() => route.query.from === 'scanner');
const lastCode = computed(() => route.query.code || '');

onMounted(() => {
  products.value = storage.value.length > 0 ? storage.value : [];
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => {user.value = state, loading.value = false});
}) 

onUnmounted(() => {
  unsubscribeToAuthObserver();
})

async function handleSubmit() {
  const normalizedName = inputValue.value.trim().toLowerCase();
  if (!normalizedName) return;
  try {
    const result = await findByName(normalizedName);
    if(result) {
      productsForSearchListView.value = result;
      localStorage.removeItem('products');
      localStorage.setItem('products', JSON.stringify(productsForSearchListView.value));
      router.push(`/search-list/${normalizedName}`);
    }
  } catch (error) {
    console.error('Error al buscar productos por nombre', error);
  }
  // router.push(`/product/${normalizedName}`);
}

async function getInput() {
  try {
    if(inputValue.value === '') {
      products.value = storage.value.length > 0 ? storage.value : [];
      return;
    }
    products.value = await getMatchesByName(inputValue.value);
    console.log({ProductsMatches: products.value})
    // Para de vuelta limpiar
    if(inputValue.value === '') {
      products.value = storage.value.length > 0 ? storage.value : [];
      return;
    }
  } catch(error) {
    console.log(error, 'Error al buscar producto');
  }
}


function bold(productName) {
  if(!inputValue.value) {
    return;
  }
  const regex = new RegExp(inputValue.value, "i");
  return productName.replace(regex, match => `<span class="font-semibold">${match}</span>`);
}

</script>


<template>
  <AuthLayout>
      <div v-if="!loading">
        <div :class="user.subscription.plan_id === 1 ? 'trama h-[90vh]' : ''">
          <template v-if="user.subscription.plan_id !== 1">
            <div class="bg-[#005B8E] h-5"></div>

            <!-- Mensaje cuando venís del scanner -->
            <div v-if="fromScanner" class="px-4 py-2 text-sm bg-yellow-100 text-yellow-800">
              <p>
                Buscar por nombre <strong v-if="lastCode">{{ lastCode }}</strong>!
              </p>
            </div>

            <form class="flex justify-around items-center m-auto mb-0.5 shadow-[0_2px_2px_#dbe0e5] h-15" @submit.prevent="handleSubmit">
              <i class="fa-solid fa-arrow-left"></i>
              <input type="text" id="searchInput" name="searchInput" placeholder="Buscar productos..." v-model="inputValue" @change="bold(inputValue, productName)" class="border-0 outline-0 w-70" @input="getInput()" autocomplete="off"/>
              <button type="submit">
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>

            <ul class="SearchView-list">
              <li v-if="products.length > 0" v-for="product of products" :key="product.id ?? undefined" class="bg-[#f5f5f5]">
                <RouterLink :to="`/product/${product.name}/${product.brand.name}`" class="flex justify-between items-center">
                  <div class="flex flex-col">
                    <span v-if="!product.barcode" class="text-sm">{{ product.name }}</span>
                    <p v-else v-html="bold(product.name)" class="text-sm"></p>
                    <span class="font-medium text-[13px]">{{ product.brand.name }}</span>
                  </div>
                  <i v-if="!product.barcode" class="fa-solid fa-clock-rotate-left"></i>
                  <i v-else class="fa-solid fa-arrow-right"></i>
                </RouterLink>
              </li>
            </ul>
          </template>
          <template v-else>
              <Top/>
              <div class="flex flex-col flex-1 h-[80%] justify-center">
                <div class="p-3">
                  <div class="text-black px-6 py-3 rounded-lg shadow-md bg-white mt-10">
                    <p class="text-[18px] font-semibold pb-2">Hola, {{ user.name }}</p>
                    <p class=" text-center text-gray-800">¡Hacete <span class="font-semibold">premium</span> para <span class="font-semibold">buscar productos!</span></p>
                    <RouterLink to="/subscriptions" class="action-btn text-white mt-3">Hacerme premuim</RouterLink>
                  </div>
                </div>
            </div>
          </template>
        </div>
      </div>
  </AuthLayout>
</template>


<style scoped>
    .trama {
        background-image: url('../assets/img/tramas/1x/Artboard\ 1test-trama.png');
        background-position: bottom;
        background-size: cover;
        background-repeat: no-repeat;
    }
</style>