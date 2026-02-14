<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AuthLayout from "../layouts/AuthLayout.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import HistoryItem from '../components/ui/HistoryItem.vue';
import api from "../config/axios";
import AppLoading from '../components/loadings/AppLoading.vue';
import { suscribeToAuthObserver } from '../services/auth';
import { getNewPage } from '../services/history';

let unsubscribeToAuthObserver = () => {}

const user = ref({});
const history = ref([]);
const loading = ref(true);
const userLoad = ref(false);
const error = ref('');
const inputValue = ref('');
const fullHistory = ref([]);
const searchError = ref(false);
const currentPage = ref(1)

console.log(inputValue.value);

const fetchHistory = async () => {
  if(userLoad.value) {
    try {
      loading.value = true;
      const { data } = await api.get(`/api/history?page=${currentPage.value}`);
      if(user.value.subscription.plan_id === 1) {
        history.value = data;
        fullHistory.value = data;
      } else {
        history.value = data.data;
        currentPage.value = data.current_page;
        console.log(currentPage.value, 'facascs')
        fullHistory.value = data.data;
      }
    } catch (err) {
      console.error('Error al obtener historial:', err);
      error.value = 'Error al cargar el historial';
    } finally {
      loading.value = false;
    }
  }
};

onMounted(() => {
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state, userLoad.value = true);
  fetchHistory();
});

onUnmounted(() => {
  unsubscribeToAuthObserver();
}) 


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

async function handlePaginator(direction) {
  direction === 'sig' ? currentPage.value++ : currentPage.value--; 
  console.log(currentPage.value)
  await fetchHistory();
}

</script>

<template>
  <AuthLayout>
    <Top/>
    <!-- <Back/> -->
    
  <div class=" bg-[#ffffff]  shadow-md m-3 rounded-[11px] py-5 mt-10">
      <h1 class="text-2xl text-center">Historial de escaneos</h1>
      <template v-if="userLoad">
        <div v-if="user.subscription.plan_id === 1">
          <p v-if="user.subscription.plan_id === 1" class="text-center text-[14px] text-gray-600">{{ history.length }}/10 escaneos guardados</p>
          <RouterLink to="/subscriptions" v-if="history.length >= 10" class="text-center action-btn mx-20 mt-2">Hacerme premium</RouterLink>
        </div>
        <p v-else class="text-center">{{ history.length }} escaneos guardados</p>
      </template>
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
    <template v-if="userLoad && user.subscription.plan_id === 2">
      <div class="bg-white shadow-md p-3 rounded-lg m-3">
        <p>Päginadro</p>
        <button @click="handlePaginator('prev')">Previo</button>
        <button @click="handlePaginator('sig')">Siguiente</button>
      </div>
    </template>
  </AuthLayout>
</template>