<script setup>
import { ref, onMounted } from 'vue';
import AuthLayout from "../layouts/AuthLayout.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import HistoryItem from '../components/ui/HistoryItem.vue';
import api from "../config/axios";

const history = ref([]);
const loading = ref(true);
const error = ref('');

const fetchHistory = async () => {
  try {
    loading.value = true;
    const { data } = await api.get('/api/history');
    history.value = data;
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
</script>

<template>
  <AuthLayout>
    <Top/>
    <Back/>
    <h1 class="text-4xl mb-6">Historial</h1>

    <div v-if="loading" class="flex justify-center items-center py-10">
      <p class="text-gray-600">Cargando historial...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else-if="history.length === 0" class="bg-gray-100 px-4 py-8 rounded text-center">
      <p class="text-gray-600 text-lg">No tenés escaneos en tu historial todavía.</p>
      <p class="text-gray-500 text-sm mt-2">Escaneá productos para ver tu historial aquí.</p>
    </div>

    <div v-else class="space-y-4">
      <HistoryItem 
        v-for="item in history" 
        :key="item.id"
        :item="item"
      />
    </div>
  </AuthLayout>
</template>