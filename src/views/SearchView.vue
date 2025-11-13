<script setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { getMatchesByName } from '../services/product';


const router = useRouter();

const inputValue = ref('');

const products = ref([]);

const storage = ref(JSON.parse(localStorage.getItem('latestSearches')).reverse() || []);

onMounted(() => {
  products.value = storage.value.length > 0 ? storage.value : [];
}) 

function handleSubmit() {
  const normalizedName = inputValue.value.trim().toLowerCase();
  router.push(`/product/${normalizedName}`);
}

async function getInput() {

  
  try {
    products.value = await getMatchesByName(inputValue.value);
    if(inputValue.value === '') {
      products.value = storage.value.length > 0 ? storage.value : [];
    }
  } catch(error) {
    console.log(error, 'Error al buscar producto');
  }
}

// function storeInLocalStorage(normalizedName) {
  
// }

</script>


<template>
  <AuthLayout>
    <div class="bg-[#005B8E] h-5"></div>
 
     <form class="flex justify-around items-center  m-auto bg-[#dddddd] h-12" @submit.prevent="handleSubmit">
        <i class="fa-solid fa-arrow-left"></i>
        <input type="text" id="searchInput" name="searchInput"  placeholder="Buscar productos..." v-model="inputValue" class=" border-0 outline-0 w-70" @input="getInput()">
        <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
    </form>
    <ul class="SearchView-list">
      <li v-if="products.length > 0" v-for="product of products" :key="product.id" class="bg-[#f5f5f5]">
        <RouterLink :to="`/product/${product.name ?? product}`" class="flex justify-between items-center">{{ product.name ?? product }} <i v-if="!product.name" class="fa-solid fa-clock-rotate-left"></i> </RouterLink>
      </li>
    </ul>
  </AuthLayout>
</template>