<script setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import { findByName, getMatchesByName } from '../services/product';


const router = useRouter();
const route = useRoute();

const inputValue = ref('');

const products = ref([]);
const productsForSearchListView = ref([]);

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
  } catch(error) {
    console.log(error, 'Error al buscar producto');
  }
}

</script>


<template>
  <AuthLayout>
    <div class="bg-[#005B8E] h-5"></div>

    <!-- Mensaje cuando venís del scanner -->
    <div v-if="fromScanner" class="px-4 py-2 text-sm bg-yellow-100 text-yellow-800">
      <p>
      Busquemos por nombre a <strong v-if="lastCode">{{ lastCode }}</strong>!
      </p>
    </div>

    <form class="flex justify-around items-center m-auto bg-[#dddddd] h-12" @submit.prevent="handleSubmit">
      <i class="fa-solid fa-arrow-left"></i>
      <input type="text" id="searchInput" name="searchInput" placeholder="Buscar productos..." v-model="inputValue" class="border-0 outline-0 w-70" @input="getInput()"/>
      <button type="submit">
        <i class="fa-solid fa-magnifying-glass"></i>
      </button>
    </form>

    <ul class="SearchView-list">
      <li v-if="products.length > 0" v-for="product of products" :key="product.id ?? product" class="bg-[#f5f5f5]">
        <RouterLink :to="`/product/${product.name ?? product}`" class="flex justify-between items-center">
          {{ product.name ?? product }}
          <i v-if="!product.name" class="fa-solid fa-clock-rotate-left"></i>
        </RouterLink>
      </li>
    </ul>
  </AuthLayout>
</template>
