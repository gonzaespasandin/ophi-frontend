<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import HistoryItem from './HistoryItem.vue';
import api from '../../config/axios';

const history = ref([]);
const loading = ref(true);

const fetchRecentHistory = async () => {
  try {
    loading.value = true;
    const { data } = await api.get('/api/history/latest');
    history.value = data;
  } catch (err) {
    console.error('Error al obtener historial:', err);
    history.value = [];
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

    <div v-else-if="history.length === 0" class="text-center text-gray-500 py-4">
      <p class="text-sm">No hay escaneos todavía</p>
    </div>

    <div v-else class="space-y-3">
      <HistoryItem 
        v-for="item in history" 
        :key="item.id"
        :item="item"
      />
    </div>
  </div>
</template>