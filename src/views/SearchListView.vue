<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Top from '../components/ui/Top.vue';
import Back from '../components/ui/Back.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import { findByName } from '../services/product';

const route = useRoute();

const products = ref([]);
const currentPage = ref(1);
const disableNextButton = ref(false);
const disablePrevButton = ref(false);
const threePages = ref([1, 2, '...']);
const loading = ref(false);

async function getNewPage() {
    try {
        loading.value = true;
        const result = await findByName(route.params.search, currentPage.value);
        if(result && result.data.length > 0) {
            products.value = result.data;
            disableButtons('prev', result);
            disableButtons('next', result);
            calculatePages(result);
        } 
    } catch (err) {
        console.log('[SearchListView] -> getNewPage(), Error: ', err);
    } finally {
        loading.value = false;
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

async function handlePaginator(direction, page = null) {
  if(direction !== null) {
    direction === 'sig' ? currentPage.value++ : currentPage.value--; 
    await getNewPage();
  } else if (typeof(page) === 'number') {
    currentPage.value = page;
    await getNewPage();
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


onMounted(() => {
    getNewPage();
})

onUnmounted(() => {
    localStorage.removeItem('products');
})
</script>

<template>
    <AuthLayout>
        <Top/>
        <!-- <RouterLink to="/search" class="p-3 mt-4"><i class="fa-solid fa-arrow-left"></i> volver</RouterLink> -->
        <template v-if="products.length > 0">
            <div class="bg-white shadow-md m-3 rounded-[11px] p-3">
                <h2 class="font-light text-2xl  text-center font-regular">Resultados para <span class=" font-semibold">{{ route.params.search }}</span></h2>
            </div>
            <div class="bg-white shadow-md rounded-[11px] m-3 p-3">
                <ul>
                    <li v-for="product of products" :key="product.id" class=" mb-3 bg-[#f8f8f8] search-list-item text-[#005B8E] p-2 px-3">
                        <RouterLink :to="`/product/${product.name}/${product.brand.name}`" class="flex items-center justify-between move">
                            <div>
                                <h3 class=" font-medium">{{ product.name }}</h3>
                                <p class="text-[14px] text-[#005B8E]">{{ product.brand.name }}</p>
                            </div>
                            <i class="fa-solid fa-chevron-right pe-2"></i>
                        </RouterLink>
                    </li>
                </ul>
            </div>
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
        <template v-else>
            <div class="bg-white m-3 p-3">
                <h2 class="font-light text-2xl text-center">¡Lo sentimos!</h2>
                <p class="text-center py-5">No encontramos resultados</p>
            </div>
        </template>
    </AuthLayout>
    
</template>


<style scoped>
    .move {
        i {
            transition: transform .1s ease-out;
        }
    }
    .move:hover {
        i {
            transform: translateX(3px);
        }
    }
</style>