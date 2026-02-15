<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AuthLayout from "../layouts/AuthLayout.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import HistoryItem from '../components/ui/HistoryItem.vue';
import api from "../config/axios";
import AppLoading from '../components/loadings/AppLoading.vue';
import { suscribeToAuthObserver } from '../services/auth';
import { getAmountOfHistory } from '../services/history';

let unsubscribeToAuthObserver = () => {}

const user = ref({});
const history = ref([]);
const loading = ref(true);
const userLoad = ref(false);
const error = ref('');
const inputValue = ref('');
const fullHistory = ref([]);
const searchError = ref(false);
const currentPage = ref(1);
const amountOfScans = ref(0);
const disableNextButton = ref(false);
const disablePrevButton = ref(false);
const threePages = ref([1, 2, '...']);



const fetchHistory = async () => {
  if(userLoad.value) {
    try {
      loading.value = true;
      const { data } = await api.get(`/api/history?page=${currentPage.value}`);
      if(user.value.subscription.plan_id === 1) {
        history.value = data;
        fullHistory.value = data;
      } else {
        disableButtons('prev', data);
        disableButtons('next', data);

        history.value = data.data;
        calculatePages(data);
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

const countHistory = async () => {
  try {
    const result = await getAmountOfHistory();
    amountOfScans.value = result.data;
  } catch (error) {
    console.log('[HistoryView] > [countHistory] -> Error', error);
  }
}

function disableButtons(which, data) {
  switch (which) {
    case 'prev':
      if(data.prev_page_url === null) {
        disablePrevButton.value = true; 
      } else {
        disablePrevButton.value = false;
      }
      break;
  
    default:
      if(data.next_page_url === null) {
        disableNextButton.value = true; 
      } else {
        disableNextButton.value = false;
      }
      break;
  }
} 

onMounted(() => {
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state, userLoad.value = true);
  countHistory();
  fetchHistory();
});

onUnmounted(() => {
  unsubscribeToAuthObserver();
}) 


function search() {
  // const nomralizedValue = inputValue.value.trim().toLowerCase();

  // if(nomralizedValue !== '') {
  //   history.value = fullHistory.value.filter(h => h.product.name_normalized.includes(nomralizedValue));
  //   console.log(history.value);
  //   if(history.value.length === 0) {
  //     searchError.value = true;
  //   } else {
  //     searchError.value = false;
  //   }
  // } else {
  //   history.value = fullHistory.value;
  //   console.log(history.value);
  // } 

  
}

async function handlePaginator(direction, page = null) {
  if(direction !== null) {
    direction === 'sig' ? currentPage.value++ : currentPage.value--; 
    console.log(currentPage.value)
    await fetchHistory();
  } else if (typeof(page) === 'number') {
    currentPage.value = page;
    await fetchHistory();
  }
}


function calculatePages(data) {
  const total = data.last_page;
  const current = data.current_page;

  let pages = [];

  if (total <= 3) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    console.log(pages);
  } else {
    if (current === 1) {
      pages = [1, 2, 3, '...', total];
    } else if (current === total) {
      pages = [1, '...', total - 2, total - 1, total];
    } else if (current - 1 === 1) {
      pages = [1, '...', current, current + 1, '...', total];
    } else {
      pages = [1, '...', current - 1, current, current + 1, '...', total];
      current - 1 !== 1 ? '' : pages.shift();
      current + 1 === total ? pages.splice(4, 2) : '';
    }
  }

  threePages.value = pages;
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
          <p v-if="user.subscription.plan_id === 1" class="text-center text-[14px] text-gray-600">{{ amountOfScans }}/10 escaneos guardados</p>
          <RouterLink to="/subscriptions" v-if="amountOfScans >= 10" class="text-center action-btn mx-20 mt-2">Hacerme premium</RouterLink>
        </div>
        <p v-else class="text-center">{{ amountOfScans }} escaneos guardados</p>
      </template>
      <div v-if="fullHistory.length > 0" class="flex justify-around items-center max-w-90 bg-[#f5f5f5] m-auto h-12 mt-5 rounded-[11px]" id="search" @click="handleSubmit">
          <input type="text" id="search" name="search"  placeholder="Buscar productos..." v-model="inputValue" class=" border-0 outline-0" @input="search()">
          <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
    </div>
    <template v-if="userLoad && user.subscription.plan_id === 2">
      <div class="bg-white shadow-md p-3 rounded-lg m-3 flex justify-center">
        <div class="flex  gap-3">
          <button @click="handlePaginator('prev')" :disabled="disablePrevButton"><i class="fa-solid fa-chevron-left"></i></button>
          <ul class="flex gap-2">
            <li v-for="(page, i) of threePages" :key=i :class="page === currentPage ? 'font-semibold' : ''" @click="handlePaginator(null, page)" class="p-2 text-[18px] cursor-pointer">
              {{ page }}
            </li>
          </ul>
          <button @click="handlePaginator('sig')" :disabled="disableNextButton"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </template>

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