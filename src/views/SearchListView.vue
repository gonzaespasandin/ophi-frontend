<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { getBrandsByName } from '../services/product';
import { suscribeToAuthObserver } from '../services/auth';
import { useSearchResults } from '../composables/useSearchResults.js';
import ResultsBand from '../components/search/ResultsBand.vue';
import ResultRow from '../components/search/ResultRow.vue';
import ResultSkeleton from '../components/search/ResultSkeleton.vue';
import ResultEmptyState from '../components/search/ResultEmptyState.vue';
import ResultFilteredEmptyState from '../components/search/ResultFilteredEmptyState.vue';
import ResultErrorCard from '../components/search/ResultErrorCard.vue';
import FilterChips from '../components/search/FilterChips.vue';
import FilterDrawer from '../components/search/FilterDrawer.vue';

const route = useRoute();
const router = useRouter();

let unsuscribeToAuthObserver = () => {};

const user = ref({});
const queryDraft = ref('');
const showFilterDrawer = ref(false);
const allBrands = ref([]);
const visibleBrands = ref([]);

const {
  query,
  products,
  total,
  state,
  isLoadingMore,
  hasMore,
  shownLabel,
  nextBatchCount,
  brandFilters,
  filterCount,
  start,
  loadMore,
  applyBrands,
  removeBrand,
  clearBrands,
  retry,
} = useSearchResults();

const profiles = computed(() => user.value?.profiles ?? []);
const isFirstLoad = computed(() => state.value === 'loading' || state.value === 'idle');
const hasRows = computed(() => state.value === 'ready');

const moreLabel = computed(() =>
  nextBatchCount.value > 0 ? `Ver ${nextBatchCount.value} más` : 'Ver más'
);

onMounted(() => {
  unsuscribeToAuthObserver = suscribeToAuthObserver((authState) => (user.value = authState));

  // HomeView caches the brand list in sessionStorage; a session that never
  // passed through it just starts with an empty list and searches the server.
  allBrands.value = readCachedBrands();
  visibleBrands.value = allBrands.value;
});

onBeforeUnmount(() => {
  unsuscribeToAuthObserver();
});

// The route is the single source of truth for the query, so editing the field
// pushes a new URL and the search follows from there — back and forward keep
// working, and one submit never fires two requests.
watch(
  () => route.params.search,
  (routeQuery) => {
    queryDraft.value = routeQuery ?? '';
    start(routeQuery ?? '');
  },
  { immediate: true }
);

function readCachedBrands() {
  try {
    return JSON.parse(sessionStorage.getItem('brands')) ?? [];
  } catch (err) {
    console.error('[SearchListView] -> No se pudieron leer las marcas cacheadas', err);
    return [];
  }
}

function submitQuery(newQuery) {
  router.push(`/search-list/${encodeURIComponent(newQuery)}`);
}

function openFilters() {
  visibleBrands.value = allBrands.value;
  showFilterDrawer.value = true;
}

async function onApplyFilters(brands) {
  showFilterDrawer.value = false;
  await applyBrands(brands);
}

// Local first: the cached list answers instantly and the server only gets asked
// for the brands this session never downloaded.
async function onSearchBrands(text) {
  const term = text.trim().toLowerCase();

  if (term === '') {
    visibleBrands.value = allBrands.value;
    return;
  }

  const local = allBrands.value.filter((brand) => brand.name.toLowerCase().includes(term));

  if (local.length > 0) {
    visibleBrands.value = local;
    return;
  }

  try {
    const result = await getBrandsByName(text);
    visibleBrands.value = result?.data ?? [];
  } catch (err) {
    console.error('[SearchListView] -> No se pudieron buscar marcas por nombre', err);
    visibleBrands.value = [];
  }
}
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-[#F5F5F5] dot-texture-page">
      <ResultsBand
        v-model="queryDraft"
        :filter-count="filterCount"
        @submit="submitQuery"
        @back="router.back()"
        @open-filters="openFilters"
      />

      <div class="px-3 pt-4 pb-6">
        <ResultSkeleton v-if="isFirstLoad" />

        <template v-else>
          <FilterChips
            :filters="brandFilters"
            @remove="removeBrand"
            @clear="clearBrands"
          />

          <template v-if="hasRows">
            <div class="flex items-baseline gap-2 mx-1 mb-[10px]">
              <!-- The design also showed "de N sin filtros" here. That needs an
                   unfiltered count the search endpoint does not return, so the
                   heading stays with the count it can actually prove. -->
              <h2
                data-testid="results-heading"
                class="flex-1 font-roboto-slab font-semibold text-[12px] leading-[1.3] tracking-[.09em] uppercase text-ophi-blue"
              >
                {{ total }} resultados
              </h2>
              <span data-testid="shown-label" class="text-[11.5px] text-ophi-slate">{{ shownLabel }}</span>
            </div>

            <ul class="rounded-card bg-white shadow-card overflow-hidden">
              <ResultRow
                v-for="product of products"
                :key="product.id"
                data-testid="result-row"
                :product="product"
                :profiles="profiles"
              />
            </ul>

            <!-- Batches accumulate instead of swapping: a numeric paginator was
                 the only desktop-style control left in a thumb-driven PWA. -->
            <button
              v-if="hasMore"
              type="button"
              data-testid="load-more"
              class="flex items-center justify-center gap-[9px] w-full h-12 mt-[14px] rounded-card border-2 border-ophi-green bg-white font-semibold text-[14.5px] text-ophi-green-dark active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green disabled:opacity-60"
              :disabled="isLoadingMore"
              @click="loadMore"
            >
              <i
                class="fa-solid text-[12px]"
                :class="isLoadingMore ? 'fa-circle-notch animate-spin' : 'fa-arrow-down'"
                aria-hidden="true"
              ></i>
              {{ isLoadingMore ? 'Cargando…' : moreLabel }}
            </button>

            <p
              v-else
              data-testid="end-of-list"
              class="mt-4 mx-1 text-center text-[12.5px] leading-[1.5] text-ophi-slate"
            >
              Eso es todo lo que tenemos con «{{ query }}».
            </p>
          </template>

          <ResultEmptyState
            v-else-if="state === 'empty'"
            :query="query"
            @edit-search="queryDraft = ''"
          />

          <ResultFilteredEmptyState
            v-else-if="state === 'filtered-empty'"
            :query="query"
            @clear-filters="clearBrands"
            @adjust-filters="openFilters"
          />

          <ResultErrorCard v-else-if="state === 'error'" @retry="retry" />
        </template>
      </div>
    </div>

    <FilterDrawer
      :open="showFilterDrawer"
      :brands="visibleBrands"
      :selected="brandFilters"
      @close="showFilterDrawer = false"
      @apply="onApplyFilters"
      @search-brands="onSearchBrands"
    />
  </AuthLayout>
</template>
