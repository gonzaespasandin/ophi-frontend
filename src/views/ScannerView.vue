<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { onBeforeRouteLeave, useRouter, RouterLink } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { suscribeToAuthObserver } from '../services/auth';
import { useProductVerdict } from '../composables/useProductVerdict.js';
import { useScanner } from '../composables/useScanner.js';
import { processBarcode } from '../services/scanner.js';
import { saveToHistory } from '../services/history.js';
import { getMatchesByName, search } from '../services/product';
import ScanResultSheet, { SHEET_SETTLE_MS } from '../components/scanner/ScanResultSheet.vue';
import ScanResultBand from '../components/scanner/ScanResultBand.vue';
import ScanNameFallbackCard from '../components/scanner/ScanNameFallbackCard.vue';
import ScanSessionExpiredCard from '../components/scanner/ScanSessionExpiredCard.vue';
import ScanNoRestrictionsCard from '../components/scanner/ScanNoRestrictionsCard.vue';
import CameraErrorScreen from '../components/scanner/CameraErrorScreen.vue';
import ProductSummaryCard from '../components/product/ProductSummaryCard.vue';
import ProductProfileBreakdown from '../components/product/ProductProfileBreakdown.vue';
import ProductIngredientsCard from '../components/product/ProductIngredientsCard.vue';
import ProductErrorState from '../components/product/ProductErrorState.vue';
import ProductResultSkeleton from '../components/product/ProductResultSkeleton.vue';
import RecommendedCarousel from '../components/home/RecommendedCarousel.vue';
import { useSafeProducts } from '../composables/useSafeProducts.js';

const router = useRouter();

let unsuscribeToAuthObserver = () => {};
let resumeTimer = null;

const user = ref({});
const product = ref(null);
// hidden | loading | result | not-found | network-error | session-expired
const sheetState = ref('hidden');
const scannedCode = ref('');
const cameraError = ref('');
const isLeavingOnPurpose = ref(false);

const nameSearch = ref('');
const nameError = ref('');
const nameMatches = ref([]);

const {
  scannerError,
  initializeScannerLibrary,
  initializeScanner,
  cleanupScanner,
  pauseScanner,
  resumeScanner,
  resetLastScanned,
} = useScanner();

const { products: safeProducts, state: safeProductsState, load: loadSafeProducts } = useSafeProducts();

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
  allMatches,
  traces,
  cleanIngredients,
} = useProductVerdict(profiles, productIngredients);

const isSingleProfile = computed(() => profiles.value.length <= 1);
const hasIngredients = computed(() => productIngredients.value.length > 0);
const hasRestrictions = computed(() => profilesWithRestrictions.value.length > 0);

// The band never wears a colour the app cannot sustain yet: slate while the
// answer travels, slate again when there is nothing to compare against.
const bandVariant = computed(() => ({
  loading: 'loading',
  'not-found': 'not-found',
  'network-error': 'neutral',
  'session-expired': 'neutral',
}[sheetState.value] ?? verdict.value));

const productRoute = computed(() => {
  const brand = product.value?.brand?.name;

  return product.value?.name && brand ? `/product/${product.value.name}/${brand}` : null;
});

// One row per profile, traces included: the history has to record the whole hit,
// not only the declared ingredients.
const historyResults = computed(() =>
  profiles.value.map((profile) => {
    const hits = allMatches.value.filter(
      (match) => match.profiles.some((affected) => affected.id === profile.id)
    );

    return {
      forWho: profile.name,
      isSafe: hits.length === 0,
      unsafeIngredients: hits.map((match) => match.name),
    };
  })
);

const onBarcodeDetected = async (codigo) => {
  scannedCode.value = codigo;
  sheetState.value = 'loading';
  filterProfileId.value = null;

  try {
    const data = await processBarcode(codigo);

    product.value = data;
    sheetState.value = 'result';

    await persistHistory(data);
  } catch (err) {
    product.value = null;
    nameSearch.value = '';
    nameError.value = '';
    nameMatches.value = [];

    sheetState.value = errorStateFor(err?.response?.status);

    if (sheetState.value === 'not-found') {
      localStorage.setItem('pending_scan_barcode', codigo);
    }
  }
};

function errorStateFor(status) {
  if (status === 404) return 'not-found';
  if (status === 401) return 'session-expired';

  return 'network-error';
}

// A failed history write must never turn a good verdict into an error screen:
// the answer is already on screen and it is the part that matters.
async function persistHistory(data) {
  const isOphiProduct = !data.from_catalog && data.id;

  if (!isOphiProduct || !hasIngredients.value || profiles.value.length === 0) return;

  try {
    await saveToHistory(data, historyResults.value, profiles.value);
  } catch (err) {
    console.error('[ScannerView] -> No se pudo guardar el escaneo en el historial', err);
  }
}

function retryScan() {
  if (!scannedCode.value) return;

  onBarcodeDetected(scannedCode.value);
}

const handleNameInput = async () => {
  const term = nameSearch.value.trim();

  if (!term) {
    nameMatches.value = [];
    return;
  }

  try {
    nameMatches.value = await getMatchesByName(term);
  } catch (error) {
    console.error('[ScannerView] -> Error al buscar coincidencias por nombre', error);
  }
};

const confirmNameSearch = async () => {
  const normalizedName = nameSearch.value.trim().toLowerCase();

  if (!normalizedName) {
    nameError.value = 'Ingresá el nombre del producto';
    return;
  }

  nameError.value = '';

  try {
    const result = await search(normalizedName);

    if (result) {
      localStorage.setItem('products', JSON.stringify(result));
      router.push(`/search-list/${normalizedName}`);
    }
  } catch (error) {
    console.error('[ScannerView] -> Error al buscar productos por nombre', error);
  }
};

// The panel leaves altogether here, so there is nothing left to wait for: any
// resume still on the clock is stale and the camera comes back right away.
function dismissScanResult() {
  window.clearTimeout(resumeTimer);
  sheetState.value = 'hidden';
  product.value = null;
  resumeScanner();
  resetLastScanned();
}

// Leaving the scanner on purpose and closing the panel are different intents,
// and the route guard below has to tell them apart.
function allowNavigation() {
  isLeavingOnPurpose.value = true;
}

// Covered by the panel the camera has nothing to show and nobody watching, so
// it stops working instead of burning battery behind an opaque screen.
//
// Stopping is free and helps the panel climb. Starting is not: from the first
// frame back, every frame runs a barcode detection pass over the video, and
// doing that while the panel is still shrinking is what made the way down feel
// like it stuttered. So the camera waits for the panel to land. Nothing is lost
// by waiting — half covered by the panel it had nothing readable to look at.
function onFullChange(isFull) {
  window.clearTimeout(resumeTimer);

  if (isFull) {
    pauseScanner();
    return;
  }

  resumeTimer = window.setTimeout(resumeScanner, SHEET_SETTLE_MS);
}

async function startCamera() {
  cameraError.value = '';

  const container = document.querySelector('#camera-view-container');
  await initializeScanner(container, onBarcodeDetected);

  if (scannerError.value) {
    cameraError.value = scannerError.value;
  }
}

async function retryCamera() {
  await cleanupScanner();
  await startCamera();
}

// The hardware back button closes the panel instead of leaving the scanner, so
// somebody can scan ten products in a row. Anything the user aimed at on
// purpose still gets through.
onBeforeRouteLeave(() => {
  if (isLeavingOnPurpose.value) return true;

  if (sheetState.value !== 'hidden') {
    dismissScanResult();
    return false;
  }

  return true;
});

onMounted(async () => {
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => (user.value = state));
  initializeScannerLibrary();
  loadSafeProducts();
  await startCamera();
});

onBeforeUnmount(async () => {
  window.clearTimeout(resumeTimer);
  await cleanupScanner();
  unsuscribeToAuthObserver();
});
</script>

<template>
  <AuthLayout :padded="false">
    <div class="relative h-full min-h-full overflow-hidden bg-black">
      <div class="square-with-gradient-scanner scanner-top">
        <img src="../assets/img/logo-positivo.png" alt="Logo de ophi" class="m-auto mt-20">
      </div>
      <h1 class="sr-only text-4xl">Escaner</h1>

      <div class="absolute inset-0 w-full h-full" id="camera-view-container"></div>

      <CameraErrorScreen v-if="cameraError" :message="cameraError" @retry="retryCamera" />

      <Transition v-else name="sheet">
        <ScanResultSheet
          v-if="sheetState !== 'hidden'"
          id="results"
          :expandable="sheetState === 'result'"
          @dismiss="dismissScanResult"
          @leave="allowNavigation"
          @update:full="onFullChange"
        >
          <template #band="{ full, collapse }">
            <ScanResultBand
              :variant="bandVariant"
              :barcode="scannedCode"
              :profiles-count="profiles.length"
              :unsafe-count="unsafeProfiles.length"
              :conflict-count="totalConflictCount"
              :full="full"
              @dismiss="dismissScanResult"
              @collapse="collapse"
            />
          </template>

          <ProductResultSkeleton v-if="sheetState === 'loading'" />

          <template v-else-if="sheetState === 'result' && product">
            <ProductSummaryCard :product="product">
              <ProductProfileBreakdown
                v-if="!isSingleProfile && verdict !== 'unknown'"
                :unsafe-profiles="unsafeProfiles"
                :safe-profiles="safeProfiles"
                :unrestricted-profiles="unrestrictedProfiles"
              />
            </ProductSummaryCard>

            <ScanNoRestrictionsCard v-if="!hasRestrictions" class="mt-3" />

            <template v-else>
              <h2 class="mt-5 mb-[10px] px-1 font-roboto-slab font-semibold text-[12px] tracking-[.09em] uppercase text-ophi-blue">
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
            </template>

            <RouterLink
              v-if="productRoute"
              :to="productRoute"
              class="flex items-center justify-center gap-2 mt-[14px] w-full h-11 rounded-card border-2 border-ophi-green bg-white font-semibold text-[14px] text-ophi-green-dark active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
            >
              Ver la ficha completa
              <i class="fa-solid fa-arrow-right text-[12px]" aria-hidden="true"></i>
            </RouterLink>

            <!--
              Always in the tree, always below the fold. The panel does not grow
              to reveal it: it grows because you were already reading towards it.
            -->
            <div class="mt-[22px]">
              <RecommendedCarousel
                title="También puede interesarte"
                :products="safeProducts"
                :profiles="profiles"
                :state="safeProductsState"
                :empty-state="{
                  title: 'No encontramos alternativas',
                  message: 'Todavía no tenemos productos que sirvan para todos tus perfiles.',
                }"
              />
            </div>
          </template>

          <ScanNameFallbackCard
            v-else-if="sheetState === 'not-found'"
            v-model="nameSearch"
            :matches="nameMatches"
            :error="nameError"
            @search="handleNameInput"
            @confirm="confirmNameSearch"
          />

          <ProductErrorState
            v-else-if="sheetState === 'network-error'"
            :barcode="scannedCode"
            secondary-label="Escanear otro"
            @retry="retryScan"
            @secondary="dismissScanResult"
          />

          <ScanSessionExpiredCard v-else-if="sheetState === 'session-expired'" />
        </ScanResultSheet>
      </Transition>
    </div>
  </AuthLayout>
</template>

<style scoped>
.scanner-top {
  position: absolute;
  z-index: 3;
  width: 100%;
  height: 650px;
}

.sheet-enter-active {
  transition: opacity .28s ease-out;
}

.sheet-leave-active {
  transition: opacity .2s ease-in;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .sheet-enter-active,
  .sheet-leave-active {
    transition: none;
  }
}
</style>
