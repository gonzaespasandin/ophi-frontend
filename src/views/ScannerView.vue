<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import { suscribeToAuthObserver } from '../services/auth';
import { useProductSafety } from '../composables/useProductSafety.js';
import { useScanner } from '../composables/useScanner.js';
import { useSwipeGesture } from '../composables/useSwipeGesture.js';
import { processBarcode } from '../services/scanner.js';
import { saveToHistory } from '../services/history.js';
import { getMatchesByName, search } from '../services/product';
import Alert from '../components/ui/Alert.vue';
import AlertSomeUsers from '../components/ui/AlertSomeUsers.vue';
import AppLoading from '../components/loadings/AppLoading.vue';

const router = useRouter();

let unsuscribeToAuthObserver = () => {};
const user = ref({});
const product = ref(null);
const showProduct = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const safetyDataReady = ref(false);
const scannedCode = ref('');
const lastFailedCode = ref('');
const isProcessing = ref(false);

const { safe, unsafeIngredients, normalizedIngredients, checkAll, resetSafety, unrestrictedProfiles } = useProductSafety();
const { scannerError, initializeDynamsoft, initializeScanner, cleanupScanner, resetLastScanned } = useScanner();

const showNameFallback = ref(false);
const nameSearch = ref('');
const nameError = ref('');
const nameMatches = ref([]);
const productsForSearchListView = ref([]);

const productIngredients = computed(() =>
  product.value?.ingredients?.map(i => i.name) ?? []
);

const onBarcodeDetected = async (codigo) => {
  scannedCode.value = codigo;
  isProcessing.value = true;
  showError.value = false;
  showProduct.value = false;

  try {
    const data = await processBarcode(codigo);

    resetSafety();
    safetyDataReady.value = false;
    product.value = data;

    if (user.value.profiles?.length > 0 && data.ingredients) {
      checkAll(user.value.profiles, data.ingredients);
      safetyDataReady.value = true;
      await saveToHistory(data, safe.value, user.value.profiles);
    }

    showError.value = false;
    showProduct.value = true;
    showNameFallback.value = false;
  } catch (err) {
    const status = err?.response?.status;
    showProduct.value = false;
    showError.value = true;
    nameSearch.value = '';
    nameError.value = '';
    nameMatches.value = [];

    if (status === 404) {
      lastFailedCode.value = codigo;
      showNameFallback.value = true;
      errorMessage.value = '';
      localStorage.setItem('pending_scan_barcode', codigo);
    } else if (status === 401) {
      showNameFallback.value = false;
      errorMessage.value = 'Tu sesión expiró o no estás autenticado. Volvé a iniciar sesión para poder escanear.';
    } else {
      showNameFallback.value = false;
      const backendMsg = err?.response?.data?.message;
      errorMessage.value = `Error al consultar: ${backendMsg || err?.message || 'Error desconocido'}`;
    }
  } finally {
    isProcessing.value = false;
  }
};

const handleNameInput = async () => {
  const term = nameSearch.value.trim();
  if (!term) {
    nameMatches.value = [];
    return;
  }
  try {
    nameMatches.value = await getMatchesByName(term);
  } catch (error) {
    console.error('Error al buscar coincidencias por nombre desde el scanner', error);
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
      productsForSearchListView.value = result;
      localStorage.removeItem('products');
      localStorage.setItem('products', JSON.stringify(productsForSearchListView.value));
      router.push(`/search-list/${normalizedName}`);
    }
  } catch (error) {
    console.error('Error al buscar productos por nombre desde el scanner', error);
  }
};

function boldProductName(productName) {
  if (!nameSearch.value) return productName;
  const regex = new RegExp(nameSearch.value, 'i');
  return productName.replace(regex, match => `<span class="font-semibold">${match}</span>`);
}

const { translateY, getTouch, moveTouch, endTouch } = useSwipeGesture(
  () => showProduct.value || showError.value,
  () => {
    showProduct.value = false;
    showError.value = false;
    resetLastScanned();
  }
);

onMounted(async () => {
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => (user.value = state));
  initializeDynamsoft();
  const container = document.querySelector('#camera-view-container');
  await initializeScanner(container, onBarcodeDetected);
  if (scannerError.value) {
    showError.value = true;
    errorMessage.value = scannerError.value;
  }
});

onBeforeUnmount(async () => {
  await cleanupScanner();
  unsuscribeToAuthObserver();
});
</script>

<template>
  <AuthLayout>
    <div class="relative h-900vh" @touchstart="getTouch" @touchmove="moveTouch" @touchend="endTouch">
      <div class="square-with-gradient-scanner scanner-top">
        <img src="../assets/img/logo-positivo.png" alt="Logo de ophi" class="m-auto mt-20">
      </div>
      <h1 class="sr-only text-4xl">Escaner</h1>

      <!-- Cámara ocupa la parte superior -->
      <div class="w-full h-full" id="camera-view-container"></div>

      <!-- Parte inferior: resultados / fallback -->
      <div id="results" class="h-full absolute bottom-0 w-full flex items-end justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" :class="(showProduct && product || showError || isProcessing) ? 'bg-black/70 backdrop-blur-sm opacity-100' : 'opacity-0 pointer-events-none'">
        <div v-if="isProcessing" class="bg-[#f5f5f5] w-full rounded-t-[11px] flex justify-center items-center py-10">
          <AppLoading />
        </div>
        <div v-if="showProduct && product" class="bg-[#f5f5f5] w-full rounded-t-[11px] transition-all duration-300 ease-out" :style="{ transform: `translateY(${translateY}px)` }">
          <div class="h-[5px] bg-gray-300 m-3 w-[40%] mx-auto rounded-[11px]"></div>
          <div class="bg-white shadow-md m-3 p-3 rounded-[11px]">
            <h2 class="text-center text-2xl">{{ product.name }}</h2>
            <span class="block text-center mt-3 mb-3">Resultados</span>
            <template v-if="safetyDataReady">
              <Alert
                v-if="user.profiles && user.profiles.length === 1"
                :safe="safe"
              />
              <AlertSomeUsers
                v-else-if="user.profiles && user.profiles.length > 1"
                :safe="safe"
                :unrestrictedProfiles="unrestrictedProfiles"
              />
            </template>
          </div>

          <div v-if="safetyDataReady" class="bg-white shadow-md m-3 p-3 rounded-[11px]">
            <h3 class="sr-only">Ingredientes</h3>
            <p v-if="normalizedIngredients.length === 0" class="text-2xl font-roboto-slab">Ingredientes</p>
            <p v-else-if="safe.length === 1" :class="safe[0].isSafe ? 'text-[#009161]' : 'text-[#C43B52]'" class="text-2xl font-roboto-slab">{{ safe[0].isSafe ? 'Ingredientes' : unsafeIngredients.join(', ') }}</p>
            <p v-else class="text-[#C43B52] text-2xl font-roboto-slab">{{ unsafeIngredients.join(', ') }}</p>
            <p>{{ (normalizedIngredients.length === 0) ? productIngredients.join(', ') : normalizedIngredients.join(', ') }}</p>
          </div>
        </div>

        <!-- Bloque de error / fallback -->
        <div
          v-else-if="showError"
          class="bg-[#f5f5f5] w-full rounded-t-[11px] transition-all duration-300 ease-out min-h-[35vh]"
          :style="{ transform: `translateY(${translateY}px)` }"
        >
          <!-- Caso: no se encontró el código (404) → panel con input de nombre -->
          <template v-if="showNameFallback">
            <div class="mb-5">
              <div class="h-[5px] bg-gray-300 m-3 w-[40%] mx-auto rounded-[11px]"></div>
              <h2 class="text-center text-xl font-semibold mb-2">Producto no encontrado</h2>
              <p class="text-center text-sm text-gray-700">
                ¡Lo sentimos! No encontramos ningún producto asociado a este código de barras
              </p>
              <p v-if="lastFailedCode" class="text-center text-xs text-gray-500 mt-1">
                Código escaneado: <strong>{{ lastFailedCode }}</strong>
              </p>
            </div>

            <div class="bg-white rounded-b-2xl shadow-md w-full max-w-md p-4">
              <label for="fallbackName" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto
              </label>
              <input
                id="fallbackName"
                v-model="nameSearch"
                type="text"
                placeholder="Ej: Yogur descremado frutilla"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161]"
                @input="handleNameInput"
              />
              <p v-if="nameError" class="mt-1 text-xs text-red-600">
                {{ nameError }}
              </p>

              <ul v-if="nameMatches.length > 0" class="mt-4 w-full max-w-md">
                <li
                  v-for="match in nameMatches"
                  :key="match.id ?? undefined"
                  class="bg-[#f5f5f5] px-3 py-2 mb-2 rounded"
                >
                  <RouterLink
                    :to="`/product/${match.name}/${match.brand.name}`"
                    class="flex justify-between items-center"
                  >
                    <div class="flex flex-col text-left">
                      <span v-html="boldProductName(match.name)"></span>
                      <span class="font-medium text-sm">{{ match.brand.name }}</span>
                    </div>
                  </RouterLink>
                </li>
              </ul>

              <button
                type="button"
                class="mt-4 w-full py-2 rounded-full bg-[#00A878] text-white font-semibold"
                @click="confirmNameSearch"
              >
                Confirmar
              </button>
            </div>
          </template>

          <!-- Otros errores (auth, server, etc.) -->
          <template v-else>
            <p class="text-lg font-semibold mb-4 text-center">
              {{ errorMessage }}
            </p>
          </template>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
canvas {
  border-radius: 12px;
  border: 3px solid #005B8E;
}

.scanner-top {
  position: absolute;
  z-index: 3;
  width: 100%;
  height: 650px;
}

#results {
  z-index: 10;
}
</style>
