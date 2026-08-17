<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../config/axios';
import AuthLayout from '../layouts/AuthLayout.vue';
import { findByNameAndBrand } from '../services/product';
import { suscribeToAuthObserver } from '../services/auth';
import { useProductVerdict } from '../composables/useProductVerdict.js';
import BarcodeSuggestionAlert from '../components/ui/BarcodeSuggestionAlert.vue';
import ProductVerdictBand from '../components/product/ProductVerdictBand.vue';
import ProductSummaryCard from '../components/product/ProductSummaryCard.vue';
import ProductProfileBreakdown from '../components/product/ProductProfileBreakdown.vue';
import ProductIngredientsCard from '../components/product/ProductIngredientsCard.vue';
import ProductNotFoundCard from '../components/product/ProductNotFoundCard.vue';
import ProductErrorState from '../components/product/ProductErrorState.vue';
import ProductResultSkeleton from '../components/product/ProductResultSkeleton.vue';
import RecommendedCarousel from '../components/home/RecommendedCarousel.vue';

const LATEST_SEARCHES_LIMIT = 4;

const route = useRoute();
const router = useRouter();

let unsuscribeToAuthObserver = () => {};

const user = ref({});
const product = ref(null);
const safeProducts = ref([]);
const state = ref('loading');
const pendingBarcode = ref(null);
const showSuggestionAlert = ref(false);

const profiles = computed(() => user.value?.profiles ?? []);
const productIngredients = computed(() => product.value?.ingredients ?? []);

const {
  filterProfileId,
  verdict,
  profilesWithRestrictions,
  unrestrictedProfiles,
  unsafeProfiles,
  safeProfiles,
  conflicts,
  totalConflictCount,
  traces,
  cleanIngredients,
} = useProductVerdict(profiles, productIngredients);

const isSingleProfile = computed(() => profiles.value.length <= 1);
const hasIngredients = computed(() => productIngredients.value.length > 0);

// While the answer is still travelling the band stays neutral: it never wears a
// colour the app cannot sustain yet.
const bandVerdict = computed(() => (state.value === 'ready' ? verdict.value : 'loading'));


onMounted(async () => {
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => (user.value = state));

  await loadProduct();
  await checkPendingBarcode();
});

onBeforeUnmount(() => {
  clearSuggestionFlow();
  unsuscribeToAuthObserver();
});

async function loadProduct() {
  state.value = 'loading';

  try {
    // The endpoint answers with the matches keyed by position plus the safe
    // alternatives alongside them, so the first match is read by key.
    const result = await findByNameAndBrand(route.params.name, route.params.brand);
    const match = result?.[0];

    if (!match) {
      state.value = 'not-found';
      return;
    }

    product.value = match;
    safeProducts.value = result.safeProducts ?? [];
    state.value = 'ready';

    rememberSearch(product.value);
  } catch (err) {
    if (err.response?.status === 404) {
      state.value = 'not-found';
      return;
    }

    console.error('[ProductView] -> No se pudo obtener el producto por nombre', err);
    state.value = 'error';
  }
}

function rememberSearch({ name, brand }) {
  const stored = JSON.parse(localStorage.getItem('latestSearches') ?? '[]');
  const brandName = brand?.name ?? '';

  const latestSearches = stored
    .filter((search) => !(search.name === name && search.brand === brandName))
    .concat({ name, brand: brandName })
    .slice(-LATEST_SEARCHES_LIMIT);

  localStorage.setItem('latestSearches', JSON.stringify(latestSearches));
}

async function checkPendingBarcode() {
  const storedBarcode = localStorage.getItem('pending_scan_barcode');

  if (!storedBarcode || !product.value || product.value.barcode) return;

  try {
    const { data } = await api.get('/api/scanner/can-suggest', {
      params: { barcode: storedBarcode, product_id: product.value.id },
    });

    if (!data.can_suggest) {
      clearSuggestionFlow();
      return;
    }

    pendingBarcode.value = storedBarcode;
    showSuggestionAlert.value = true;
  } catch (err) {
    console.error('[ProductView] -> Error al verificar si se puede sugerir el código', err);
  }
}

function clearSuggestionFlow() {
  localStorage.removeItem('pending_scan_barcode');
  showSuggestionAlert.value = false;
  api.delete('/api/scanner/clear-pending-barcode').catch(() => {});
}

async function confirmSuggestion() {
  try {
    await api.post('/api/scanner/suggest', {
      barcode: pendingBarcode.value,
      product_id: product.value.id,
    });
  } catch (err) {
    console.error('[ProductView] -> Error al sugerir el código', err);
  } finally {
    clearSuggestionFlow();
  }
}

function goBack() {
  router.back();
}
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-[#F5F5F5] dot-texture-page">
      <ProductVerdictBand
        :verdict="bandVerdict"
        :profiles-count="profiles.length"
        :unsafe-count="unsafeProfiles.length"
        :conflict-count="totalConflictCount"
        @back="goBack"
      />

      <div class="px-4 pb-6 -mt-8">
        <ProductResultSkeleton v-if="state === 'loading'" />

        <ProductErrorState v-else-if="state === 'error'" @retry="loadProduct" />

        <ProductNotFoundCard v-else-if="state === 'not-found'" />

        <template v-else>
          <ProductSummaryCard :product="product">
            <ProductProfileBreakdown
              v-if="!isSingleProfile"
              :unsafe-profiles="unsafeProfiles"
              :safe-profiles="safeProfiles"
              :unrestricted-profiles="unrestrictedProfiles"
            />
          </ProductSummaryCard>

          <BarcodeSuggestionAlert
            v-if="showSuggestionAlert && pendingBarcode"
            class="mt-3"
            :barcode="pendingBarcode"
            @confirm="confirmSuggestion"
            @dismiss="clearSuggestionFlow"
          />

          <h2 class="mt-[22px] mb-[10px] font-roboto-slab font-semibold text-[12px] tracking-[.09em] uppercase text-ophi-blue">
            Ingredientes
          </h2>

          <ProductIngredientsCard
            v-model="filterProfileId"
            :conflicts="conflicts"
            :total-conflicts="totalConflictCount"
            :traces="traces"
            :clean-ingredients="cleanIngredients"
            :filter-profiles="profilesWithRestrictions"
            :single-profile="isSingleProfile"
            :has-ingredients="hasIngredients"
          />

          <div class="mt-[22px]">
            <RecommendedCarousel
              title="También puede interesarte"
              :products="safeProducts"
              :profiles="profiles"
              :state="safeProducts.length ? 'ready' : 'empty'"
              :empty-state="{
                title: 'No encontramos alternativas',
                message: 'Todavía no tenemos productos parecidos que sirvan para todos tus perfiles.',
              }"
            />
          </div>
        </template>
      </div>
    </div>
  </AuthLayout>
</template>
