<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import AuthLayout from "../layouts/AuthLayout.vue";
import api from "../config/axios";

// TODO: Mover esto a un servicio? Para que quede más ordenado
// TODO: De ser posible, importarlo en el proyecto (npm i ..., etc), y no como CDN

let cvRouter = null;
let cameraEnhancer = null;
let cameraView = null;
let resultsContainer = null;
let lastScannedCode = null;

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
          
          resultsContainer.textContent = '';
          Dynamsoft.DCE.Feedback.beep();

          try {
            const { data } = await api.post('/api/scanner/process', { codigo });
            resultsContainer.innerHTML += `
              <div class="flex flex-col justify-center items-center bg-green-500 p-2 m-4 rounded-md">
                <p class="text-white">Producto encontrado:</p>
                <p class="text-white">${data.name || 'Sin nombre'}</p>
                <p class="text-white">${data.brand || 'Sin marca'}</p>
              </div>
            `;
          } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
              resultsContainer.innerHTML += `
                <div class="flex flex-col justify-center items-center bg-red-500 p-2 m-4 rounded-md">
                  <p class="text-white">Código no encontrado: ${codigo}</p>
                </div>
              `;
            } else {
              resultsContainer.innerHTML += `
                <div class="flex flex-col justify-center items-center bg-red-500 p-2 m-4 rounded-md">
                  <p class="text-white">Error al consultar el backend: ${err?.message || err}</p>
                </div>
              `;
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
    if (resultsContainer) {
      resultsContainer.textContent = `❌ Error al inicializar el escáner: ${error?.message || error}`;
    }
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
  resultsContainer = document.querySelector("#results");
  initializeDynamsoft();
  await initializeScanner();
});

onBeforeUnmount(async () => {
  await cleanupScanner();
});

</script>

<template>
  <AuthLayout>
    <h1 class="sr-only text-4xl">Escaner</h1>

    <div id="camera-view-container"></div>

    <div id="results"></div>
  </AuthLayout>
</template>

<style scoped>
#camera-view-container {
  width: 100%;
  height: 70%;
}

#results {
  height: 30%;
}
</style>