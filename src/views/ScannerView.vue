<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import AuthLayout from "../layouts/AuthLayout.vue";
import api from "../config/axios";
import { suscribeToAuthObserver } from '../services/auth';
import { useProductSafety } from '../composables/useProductSafety.js';
import Alert from '../components/ui/Alert.vue';
import AlertSomeUsers from '../components/ui/AlertSomeUsers.vue';

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
const { safe, unsafeIngredients, normalizedIngredients, checkAll, resetSafety } = useProductSafety();

// Inicializar licencia y cargar WASM (solo una vez)
const initializeDynamsoft = () => {
  Dynamsoft.License.LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMTA0Njc1ODAyLU1UQTBOamMxT0RBeUxYZGxZaTFVY21saGJGQnliMm8iLCJtYWluU2VydmVyVVJMIjoiaHR0cHM6Ly9tZGxzLmR5bmFtc29mdG9ubGluZS5jb20iLCJvcmdhbml6YXRpb25JRCI6IjEwNDY3NTgwMiIsInN0YW5kYnlTZXJ2ZXJVUkwiOiJodHRwczovL3NkbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsImNoZWNrQ29kZSI6LTE5NDg1MDM5MzV9");
  /* Si llegasemos a usar vue tendriamos que poner la ruta de los archivos wasm, worker, etc
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
            }
            
            showError.value = false;
            showProduct.value = true;
          } catch (err) {
            const status = err?.response?.status;
            showProduct.value = false;
            showError.value = true;
            
            if (status === 404) {
              errorMessage.value = `Código no encontrado: ${codigo}`;
            } else {
              errorMessage.value = `Error al consultar: ${err?.message || 'Error desconocido'}`;
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
    cameraView = await Dynamsoft.DCE.CameraView.createInstance();
    cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);

    // Configurar región de escaneo
    cameraEnhancer.setScanRegion({
      x: 5,
      y: 35,
      width: 90,
      height: 30,
      isMeasuredInPercentage: true,
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

    <div class="w-full h-[50%]" id="camera-view-container"></div>

    <div class="h-[50%] overflow-y-auto" id="results">
      <div v-if="showProduct && product">
        <div class="bg-white m-3 p-3">
          <h2 class="text-center text-2xl">{{ product.name }}</h2>
          <span class="block text-center mb-5">Resultados</span>
          <template v-if="safetyDataReady">
            <Alert v-if="user.profiles && user.profiles.length === 1 && safe.length > 0" :safe="safe[0].isSafe"></Alert>
            <AlertSomeUsers v-else-if="user.profiles && user.profiles.length > 1 && safe.length > 0" :safe="safe"></AlertSomeUsers>
          </template>
        </div>

        <div v-if="safetyDataReady" class="bg-white m-3 p-3">
          <h3 :class="safe.length > 0 && safe.some(s => !s.isSafe) ? 'text-[#C43B52]' : 'text-[#009161]'" class="text-2xl">
            {{ safe.length > 0 && safe.some(s => !s.isSafe) ? unsafeIngredients.join(' - ') || 'Ingredientes' : 'Ingredientes' }}
          </h3>
          <p>{{ normalizedIngredients.join(', ') }}</p>
        </div>
      </div>

      <div v-else-if="showError" class="text-center w-full p-4 flex flex-col items-center justify-center min-h-full">
        <p class="text-lg font-semibold mb-4">{{ errorMessage }}</p>
      </div>
    </div>
  </AuthLayout>
</template>