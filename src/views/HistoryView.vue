<script setup>
import { ref, onMounted } from 'vue';
import AuthLayout from "../layouts/AuthLayout.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import HistoryItem from '../components/ui/HistoryItem.vue';
import api from "../config/axios";
import AppLoading from '../components/loadings/AppLoading.vue';

const history = ref([]);
const loading = ref(true);
const error = ref('');
const inputValue = ref('');
const fullHistory = ref([]);
const searchError = ref(false);
console.log(inputValue.value);

const fetchHistory = async () => {
  try {
    loading.value = true;
    const { data } = await api.get('/api/history');
    history.value = data;
    fullHistory.value = data;
  } catch (err) {
    console.error('Error al obtener historial:', err);
    error.value = 'Error al cargar el historial';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHistory();
});


function search() {
  const nomralizedValue = inputValue.value.trim().toLowerCase();
  console.log(nomralizedValue);
  if(nomralizedValue !== '') {
    history.value = fullHistory.value.filter(h => h.product.name_normalized.includes(nomralizedValue));
    console.log(history.value);
    if(history.value.length === 0) {
      searchError.value = true;
    } else {
      searchError.value = false;
    }
  } else {
    history.value = fullHistory.value;
    console.log(history.value);
  } 
}

</script>

<template>
  <AuthLayout>
    <Top/>
    <!-- <Back/> -->
    
  <div class=" bg-[#ffffff]  shadow-md m-3 rounded-[11px] py-5 mt-10">
      <h1 class="text-2xl text-center">Historial de escaneos</h1>
      <div v-if="fullHistory.length > 0" class="flex justify-around items-center max-w-90 bg-[#f5f5f5] m-auto h-12 mt-5 rounded-[11px]" id="search" @click="handleSubmit">
          <input type="text" id="search" name="search"  placeholder="Buscar productos..." v-model="inputValue" class=" border-0 outline-0" @input="search()">
          <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
    </div>
    
    <div class="bg-white shadow-md p-3 rounded-lg m-3">
      <div v-if="loading" class="flex justify-center items-center py-10">
        <AppLoading/>
      </div>

      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <div v-else-if="searchError">
        <p class="text-gray-800 text-lg">No encontramos resultados.</p>
      </div>
      <div v-else-if="history.length === 0" class="px-4 py-8 rounded text-center">
        <p class="text-gray-800 text-lg">No tenés escaneos en tu historial todavía.</p>
        <p class="text-gray-500 text-sm mt-2">Escaneá productos para ver tu historial aquí.</p>
      </div>

      <div v-else class="space-y-4">
        <HistoryItem 
          v-for="item in history" 
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
  </AuthLayout>
</template>