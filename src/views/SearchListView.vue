<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Top from '../components/ui/Top.vue';
import Back from '../components/ui/Back.vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import {  getBrandsByName, search } from '../services/product';
import AppLoading from '../components/loadings/AppLoading.vue';

const route = useRoute();

const products = ref([]);
const currentPage = ref(1);
const disableNextButton = ref(false);
const disablePrevButton = ref(false);
const threePages = ref([1, 2, '...']);
const loading = ref(false);
const showFilterDrawer = ref(false);
const filters = ref('');
const filtersValues = ref({
  brands: [],
  categories: [],
  origins: []
});
const selectedBrands = ref([]);
const selectedCategories = ref([]);
const selectedOrigins = ref([]);
const noResults = ref(null);
const searchedBrand = ref('');
const searchedCategory = ref('');
const searchedOrigin = ref('');

async function getNewPage() {
    try {
        loading.value = true;
        const result = await search(route.params.search, currentPage.value, filters.value);
        if(result && result.data.length > 0) {
          products.value = result.data;
          console.log(products.value)
          disableButtons('prev', result);
          disableButtons('next', result);
          calculatePages(result);
          showFilterDrawer.value = false;
          noResults.value = null;
        } else {
          showFilterDrawer.value = false;
          noResults.value = 'No encontramos resultados para esos filtros';
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

function createFilterDrawer() {
  showFilterDrawer.value = true;
}

const touchStart = ref(0);
const currentPosition = ref();
const translateY = ref(0);

const getTouch = (e) => {
  if (!showFilterDrawer.value) return;
  touchStart.value = e.touches[0].clientY;

  console.log(touchStart.value);
}

const moveTouch = (e) => {
  if (!showFilterDrawer.value) return;
  currentPosition.value =  e.touches[0].clientY;
  const move = currentPosition.value - touchStart.value;
  
  if(move > 0) {
    translateY.value = move;
  }
}


const endTouch = (e) => {
  if (!showFilterDrawer.value) return;

  if (translateY.value > 120) {
    showFilterDrawer.value = false;
  }

  translateY.value = 0
}


function handleSubmit() {
  let query = '';
  currentPage.value = 1;
  if(selectedBrands.value.length > 0) {
    query += '&brands='
    query += selectedBrands.value.join(',')
  }

  // if(selectedCategories.value.length > 0) {
  //   query += '&categories='
  //   query += selectedCategories.value.join(',')
  // }

  // if(selectedOrigins.value.length > 0) {
  //   query += '&origins='
  //   query += selectedOrigins.value.join(',')
  // }

  filters.value = query;
  getNewPage();
}

function searchFront(which, searched) {
  if(searched === '') {
     filtersValues.value[which] = JSON.parse(sessionStorage.getItem(which));
  }
  const result = filtersValues.value[which].filter(v =>
    v.name.toLowerCase().includes(searched.toLowerCase())
  )
  if(result.length > 0) {
    filtersValues.value[which]= result;
  } else {
    searchBack();
  }
}

async function searchBack() {
  try {
    const result = await getBrandsByName(searchedBrand.value);
    console.log(result.data);
    if(result && result.data.length > 0) {
      filtersValues.value.brands = result.data;
    }
  } catch (error) {
    console.log('[SearchListView] -> [searchBack] -> Error: ', error);
  }
}

function checkSomeSelectedValue() {
  const param = route.params.search?.toLowerCase();
  if (!filtersValues.value?.brands || !param) return;
  let selectedBrand = filtersValues.value.brands.filter(v => v.name.toLowerCase() === param);
  selectedBrands.value = selectedBrand.map(v => v.id);
  console.log(selectedBrands.value, 'AHREX');
}



onMounted(() => {
  getNewPage();
  filtersValues.value.brands = JSON.parse(sessionStorage.getItem('brands'));
  // filtersValues.value.origins = JSON.parse(sessionStorage.getItem('origins'));
  // filtersValues.value.categories = JSON.parse(sessionStorage.getItem('categories'));

  checkSomeSelectedValue();
})

onUnmounted(() => {
    localStorage.removeItem('products');
})
</script>

<template>
    <AuthLayout>
        <Top/>
        <template v-if="loading">
          <div class="flex justify-center items-center h-full">
            <AppLoading/>
          </div>
        </template>
        <template v-else-if="products.length > 0">
            <!-- Termporary height. Idk if it would work -->
            <div class="relative h-[82.3vh]">
                <div class="flex flex-col items-center bg-white shadow-md m-3 rounded-[11px] p-3">
                    <h2 class="font-light text-2xl  text-center font-regular">Resultados para <span class=" font-semibold">{{ route.params.search }}</span></h2>
                    <button class="action-btn p-4 mt-4" @click="createFilterDrawer()">
                      <i class="fa-solid fa-filter"></i>
                    </button>
                    <div v-if="noResults">
                        <p>{{ noResults }}</p>
                    </div>
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
                <div v-if="showFilterDrawer" class="bg-black/70 opacity-100 h-full absolute w-full top-[-12px]" @touchstart="getTouch" @touchmove="moveTouch" @touchend="endTouch" ></div>
                <template v-if="showFilterDrawer">
                  <div class="absolute flex flex-col h-[50%] bottom-0 bg-white w-full  rounded-t-[11px]" :style="{ transform: `translateY(${translateY}px)`}">
                    <div class="px-3 py-3" @touchstart="getTouch" @touchmove="moveTouch" @touchend="endTouch">
                      <div class="h-[5px] bg-gray-300 m-3 w-[40%] mx-auto rounded-[11px]"></div>
                    </div>
                    <form @submit.prevent="handleSubmit()" class="flex flex-col overflow-auto h-full scroll-smooth">
                      <div class="w-full flex justify-center text-[25px]">
                        <a href="#brands">Marcas</a>
                        <!-- <a href="#categories" class="h-[30%]">Categorías</a>
                        <a href="#origins" class="h-[30%]">Origen</a> -->
                      </div>
                      <div class="flex flex-col w-full p-3 overflow-y-auto scroll-smooth">
                        <!-- Brands -->
                        <div v-if="filtersValues.brands && filtersValues.brands.length > 0" class="my-3 flex flex-col gap-10 justify-around" id="brands">
                          
                          <ul class="flex flex-wrap justify-center gap-3">
                            <div class="bg-[#f5f5f5] rounded-[11px] p-3 mb-3 w-[85%] shadow-md flex items-center justify-around">
                              <input type="search" class=" focus:outline-0" @input="searchFront('brands', searchedBrand)" v-model="searchedBrand" placeholder="Buscar marca...">
                              <i class="fa-solid fa-magnifying-glass"></i>
                            </div>
                            <li v-for="(brand, i) of filtersValues.brands" :key="i">
                              <label :for="`brand-${brand.id}`" class=" px-3 py-1 rounded-[11px] shadow-md cursor-pointer transition"
                                :class="selectedBrands.includes(brand.id) ? 'bg-[#005B8E] text-white' : 'bg-white text-[#005B8E]'">
                                <input
                                  type="checkbox"
                                  :id="`brand-${brand.id}`"
                                  :value="brand.id"
                                  v-model="selectedBrands"
                                />
                                {{ brand.name }}                                
                              </label>
                            </li>
                          </ul>
                        </div>
                        <!-- Categories -->
                        <!-- <div v-if="filtersValues.categories && filtersValues.categories.length > 0" class="my-10 flex gap-4 justify-around" id="categories">
                          <ul  class="flex flex-wrap justify-center gap-3 w-[70%]">
                            <input type="search" class="bg-[#f5f5f5] rounded-[11px] p-2" @input="searchFront('categories', searchedCategory)" v-model="searchedCategory">
                            <li v-for="(category, i) of filtersValues.categories" :key="i">
                              <label :for="`category-${category.id}`" class=" px-3 py-1 rounded-[11px] shadow-md cursor-pointer transition"
                                :class="selectedCategories.includes(category.id) ? 'bg-[#005B8E] text-white' : 'bg-white text-[#005B8E]'">
                                <input
                                  type="checkbox"
                                  :id="`category-${category.id}`"
                                  :value="category.id"
                                  v-model="selectedCategories"
                                />
                                {{ category.name }}
                              </label>
                            </li>
                          </ul>
                        </div> -->
                        <!-- Origins -->
                        <!-- <div v-if="filtersValues.origins && filtersValues.origins.length > 0" class="flex flex-col  gap-4 justify-around" id="origins">
                          <ul class="flex flex-wrap justify-center gap-3 w-[70%]">
                            <input type="search" class="bg-[#f5f5f5] rounded-[11px] p-2" @input="searchFront('origins', searchedOrigin)" v-model="searchedOrigin">
                            <li v-for="(origin, i) of filtersValues.origins" :key="i">
                              <label :for="`origin-${i}`"  class="px-3 py-1 rounded-[11px] shadow-md cursor-pointer transition"
                                :class="selectedOrigins.includes(origin.name) ? 'bg-[#005B8E] text-white' : 'bg-white text-[#005B8E]'">
                                <input
                                  type="checkbox"
                                  :id="`origin-${i}`"
                                  :value="origin.name"
                                  v-model="selectedOrigins"
                                />
                                {{ origin.name }}
                              </label>
                            </li>
                          </ul>
                        </div>
                      -->
                        <div class="flex justify-center items-center mb-10 mt-10">
                         <button type="submit" class="action-btn w-[80%]">Aplicar</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </template>
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