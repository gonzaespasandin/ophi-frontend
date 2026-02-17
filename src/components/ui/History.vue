<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import HistoryItem from './HistoryItem.vue';
import { getLatestScans } from '../../services/history';
import Error from './Error.vue';


const history = ref(null);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');


const fetchRecentHistory = async () => {
  try {
    loading.value = true;
    const result = await getLatestScans();
    history.value = result.length === 0 ? null : result;
  } catch (err) {
    console.error('Error al obtener historial:', err);
    error.value = true;
    errorMessage.value = 'No se pudo obtener el historial';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecentHistory();

});
</script>

<template>
  <div class="bg-white p-3 shadow-md rounded-lg" id="history-component">
    <div class="flex justify-between items-center text-[#005B8E] mb-4">
      <h2 class="text-lg font-semibold">Tus últimos escaneos</h2>
      <RouterLink to="/history" class="text-sm hover:underline">
        Ver más <i class="fa-solid fa-arrow-right ps-1"></i>
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-4">
      <p class="text-sm">Cargando...</p>
    </div>

    <template v-else-if="error">
      <Error :errorMessage="errorMessage"/>
    </template>

    <div v-else-if="history === null && !error" class="text-center text-gray-500 py-4">
      <p class="text-sm">No hay escaneos todavía</p>
    </div>

    

    <template v-else>
      <div class="space-y-3">
        <HistoryItem 
          v-for="item in history" 
          :key="item.id"
          :item="item"
        />
      </div>
    </template>
  </div>
</template>