<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from "../layouts/AuthLayout.vue";
import api from "../config/axios";
import { suscribeToAuthObserver } from '../services/auth';
import { useProductSafety } from '../composables/useProductSafety.js';
import Alert from '../components/ui/Alert.vue';
import AlertSomeUsers from '../components/ui/AlertSomeUsers.vue';
import { findByName, getMatchesByName } from '../services/product';

const router = useRouter();

let cvRouter = null;
let cameraEnhancer = null;
let cameraView = null;
let lastScannedCode = null;

let unsuscribeToAuthObserver = () => {};
const user = ref({});
const product = ref(null);
const showProduct = ref(false);
const showError = ref(false);
const errorMessage = ref('');
const safetyDataReady = ref(false);
const scannedCode = ref('');
const { safe, unsafeIngredients, normalizedIngredients, checkAll, resetSafety } = useProductSafety();

const showNameFallback = ref(false);
const nameSearch = ref('');
const nameError = ref('');
const nameMatches = ref([]);
const productsForSearchListView = ref([]);

// Inicializar licencia y cargar WASM (solo una vez)
const initializeDynamsoft = () => {
  Dynamsoft.License.LicenseManager.initLicense(import.meta.env.VITE_SCANNER_LICENSE);
  /* Si llegasemos a usar el sdk de Dynamsoft tendriamos que poner la ruta de los archivos wasm, worker, etc
  Dynamsoft.Core.CoreModule.engineResourcePaths.rootDirectory = "https://cdn.jsdelivr.net/npm/";
  */
  // Cargar el wasm por adelantado para reducir el tiempo de carga
  Dynamsoft.Core.CoreModule.loadWasm();
};

// Configurar el receptor de resultados de códigos de barras
const setupResultReceiver = () => {
  cvRouter.addResultReceiver({
    onDecodedBarcodesReceived: async (result) => {
      if (result.barcodeResultItems?.length) {
        for (let item of result.barcodeResultItems) {
          const codigo = item.text.trim();
          
          if (codigo === lastScannedCode) {
            return;
          }
          
          lastScannedCode = codigo;
          scannedCode.value = codigo;
          Dynamsoft.DCE.Feedback.beep();

          try {
            const { data } = await api.post('/api/scanner/process', { codigo });
            
            resetSafety();
            safetyDataReady.value = false;
            product.value = data;
            
            console.log('Usuario:', user.value);
            console.log('Perfiles:', user.value.profiles);
            console.log('Ingredientes del producto:', data.ingredients);
            
            if (user.value.profiles && user.value.profiles.length > 0 && data.ingredients) {
              checkAll(user.value.profiles, data.ingredients);
              console.log('Safe después de checkAll:', safe.value);
              console.log('normalizedIngredients:', normalizedIngredients.value);
              console.log('unsafeIngredients:', unsafeIngredients.value);
              safetyDataReady.value = true;

              await saveToHistory(data, safe.value);
              console.log('Escaneo guardado en el historial correctamente');
            }
            
            showError.value = false;
            showProduct.value = true;
            showNameFallback.value = false;
          } catch (err) {
            const status = err?.response?.status;
            showProduct.value = false;
            showError.value = true;

            // resetear el formulario de nombre cada vez que hay error
            nameSearch.value = '';
            nameError.value = '';
            nameMatches.value = [];
            
            if (status === 404) {
              showNameFallback.value = true;
              errorMessage.value = '';
              localStorage.setItem('pending_scan_barcode', codigo);
            } else {
                showNameFallback.value = false;
                errorMessage.value = `Error al consultar: ${err?.message || 'Error desconocido'}`;
            }if (status === 401) {
              errorMessage.value ='Tu sesión expiró o no estás autenticado. Volvé a iniciar sesión para poder escanear.';
            } else {
                const backendMsg = err?.response?.data?.message;
                errorMessage.value = `Error al consultar: ${backendMsg || err?.message || 'Error desconocido'}`;
            }
          }
        }
      }
    }
  });
};

// Inicializar el escáner
const initializeScanner = async () => {
  try {
    // Crear instancias
    cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
    
    Dynamsoft.DCE.CameraView.defaultUIElementURL = '/templates/dce.ui.html';
    cameraView = await Dynamsoft.DCE.CameraView.createInstance();

    // Configuracion del marco exterior de la region de escaneo
    cameraView.setScanRegionMaskStyle({
      lineWidth: 7,
      strokeStyle: "#005B8E",
    });
  
    cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);

    // Configuracion de la region de escaneo
    cameraEnhancer.setScanRegion({
      x: 5,
      y: 35,
      width: 90,
      height: 30,
      isMeasuredInPercentage: true,
    });

    // Configuracion del marco interior de la region de escaneo
    // strokeStyle: color del borde, fillStyle: color del fondo
    Dynamsoft.DCE.DrawingStyleManager.updateDrawingStyle(3, {
    fontFamily: "sans-serif",
    fillStyle: "rgb(0, 145, 97, 0.5)",
    fontSize: 25,
    lineWidth: 5,
    paintMode: "strokeAndFill",
    strokeStyle: "rgb(0, 145, 97)",
    });

    // Agregar vista de cámara al DOM
    const cameraContainer = document.querySelector("#camera-view-container");
    if (cameraContainer) {
      cameraContainer.append(cameraView.getUIElement());
    }
    // Configurar router
    cvRouter.setInput(cameraEnhancer);

    // Configurar receptor de resultados
    setupResultReceiver();

    // Configurar filtros
    const filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
    filter.enableResultCrossVerification("barcode", true);
    filter.enableResultDeduplication("barcode", true);
    await cvRouter.addResultFilter(filter);

    // Abrir cámara
    await cameraEnhancer.open();

    // Configurar settings para lectura de códigos
    /*
     * ReadSingleBarcode para leer rapidamente un solo codigo de barras
     * ReadDistinctBarcodes para leer codigos de barras desde lejos
     */
    const settings = await cvRouter.getSimplifiedSettings("ReadSingleBarcode");
    settings.barcodeSettings.barcodeFormatIds = 
      Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_13 | 
      Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_8;
    await cvRouter.updateSettings("ReadSingleBarcode", settings);
    
    // Iniciar captura
    await cvRouter.startCapturing("ReadSingleBarcode");
  } catch (error) {
    console.error('Error al inicializar el escáner:', error);
    showError.value = true;
    errorMessage.value = `Error al inicializar el escáner: ${error?.message || error}`;
  }
};

// Limpiar recursos al salir de la vista
const cleanupScanner = async () => {
  try {
    // Detener la captura
    if (cvRouter) {
      await cvRouter.stopCapturing();
    }

    // Cerrar la cámara
    if (cameraEnhancer) {
      await cameraEnhancer.close();
      cameraEnhancer.dispose();
    }

    // Limpiar vista de cámara
    if (cameraView) {
      cameraView.dispose();
    }

    // Limpiar router
    if (cvRouter) {
      cvRouter.dispose();
    }

    // Resetear referencias
    cvRouter = null;
    cameraEnhancer = null;
    cameraView = null;
    
    // Resetear control de código anterior
    lastScannedCode = null;
  } catch (error) {
    console.error('Error al limpiar el escáner:', error);
  }
};

// Autocompletado de nombre
const handleNameInput = async () => {
  try {
    const term = nameSearch.value.trim();
    if (!term) {
      nameMatches.value = [];
      return;
    }
    nameMatches.value = await getMatchesByName(term);
  } catch (error) {
    console.error('Error al buscar coincidencias por nombre desde el scanner', error);
  }
};
// Confirmar nombre
const confirmNameSearch = async () => {
  const normalizedName = nameSearch.value.trim().toLowerCase();
  if (!normalizedName) {
    nameError.value = 'Ingresá el nombre del producto';
    return;
  }
  nameError.value = '';
  
  try {
    const result = await findByName(normalizedName);
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
//Resaltar coincidencia copiado de SearchView
function boldProductName(productName) {
  if (!nameSearch.value) {
    return productName;
  }
  const regex = new RegExp(nameSearch.value, "i");
  return productName.replace(regex, match => `<span class="font-semibold">${match}</span>`);
}

// Guardar en el historial
const saveToHistory = async (productData, safetyResults) => {
  try {
    const results = safetyResults.map(result => ({
      profile_id: user.value.profiles.find(p => p.name === result.forWho)?.id,
      is_safe: result.isSafe,
      unsafe_ingredients: result.unsafeIngredients || []
    }));

    const validResults = results.filter(r => r.profile_id);

    await api.post('/api/history', {
      product_id: productData.id,
      results: validResults,
    });

    console.log('Escaneo guardado en el historial correctamente');
  } catch (error) {
    console.error('Error al guardar en el historial', error);
  }
};

// Lifecycle hooks
onMounted(async () => {
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);
  initializeDynamsoft();
  await initializeScanner();
});

onBeforeUnmount(async () => {
  await cleanupScanner();
  unsuscribeToAuthObserver();
});

</script>

<template>
  <AuthLayout>
    <h1 class="sr-only text-4xl">Escaner</h1>

    <!-- Cámara ocupa la parte superior -->
    <div class="w-full h-[50%]" id="camera-view-container"></div>

    <!-- Parte inferior: resultados / fallback -->
    <div class="h-[50%] overflow-y-auto" id="results">
      <div v-if="showProduct && product">
        <div class="bg-white shadow-md m-3 p-3 rounded-[11px]">
          <h2 class="text-center text-2xl">{{ product.name }}</h2>
          <!-- <p class="text-center text-m text-gray-700">{{ product.brand.name }}</p> -->
          <span class="block text-center mt-3 mb-3">Resultados</span>
          <template v-if="safetyDataReady">
            <Alert
              v-if="user.profiles && user.profiles.length === 1 && safe.length > 0"
              :safe="safe"
            />
            <AlertSomeUsers
              v-else-if="user.profiles && user.profiles.length > 1 && safe.length > 0"
              :safe="safe"
            />
          </template>
        </div>

        <div v-if="safetyDataReady" class="bg-white shadow-md m-3 p-3 rounded-[11px]">
          <h3 class="text-xl mb-2">Ingredientes:</h3>
          <p>{{ normalizedIngredients.join(', ') }}</p>
        </div>
      </div>

      <!-- Bloque de error / fallback -->
      <div
        v-else-if="showError"
        class="w-full p-4 flex flex-col items-center justify-center min-h-full"
      >
        <!-- Caso: no se encontró el código (404) → panel con input de nombre -->
        <template v-if="showNameFallback">
          <div class="bg-white rounded-t-2xl shadow-md w-full max-w-md p-4 mb-4">
            <h2 class="text-center text-xl font-semibold mb-2">¡Lo sentimos!</h2>
            <p class="text-center text-sm text-gray-700">
              No pudimos escanear el código de barras.
            </p>
            <p v-if="scannedCode" class="text-center text-xs text-gray-500 mt-1">
              Código escaneado: <strong>{{ scannedCode }}</strong>
            </p>
          </div>

          <div class="bg-white rounded-b-2xl shadow-md w-full max-w-md p-4">
            <label
              for="fallbackName"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
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

            <!-- Sugerencias, igual que en SearchView -->
            <ul
              v-if="nameMatches.length > 0"
              class="mt-4 w-full max-w-md"
            >
              <li
                v-for="product in nameMatches"
                :key="product.id ?? undefined"
                class="bg-[#f5f5f5] px-3 py-2 mb-2 rounded"
              >
                <RouterLink
                  :to="`/product/${product.name}/${product.brand.name}`"
                  class="flex justify-between items-center"
                >
                  <div class="flex flex-col text-left">
                    <span v-html="boldProductName(product.name)"></span>
                    <span class="font-medium text-sm">{{ product.brand.name }}</span>
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
  </AuthLayout>
</template>

<style scoped>
canvas {
  border-radius: 12px;
  border: 3px solid #005B8E;
}
</style>