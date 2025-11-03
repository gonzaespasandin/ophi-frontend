<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import api from "../config/axios";
import {onMounted, onUnmounted, useTemplateRef} from "vue";

// TODO: Mover esto a un servicio? Para que quede más ordenado
// TODO: De ser posible, importarlo en el proyecto (npm i ..., etc), y no como CDN

onMounted(() => {
  const $cameraViewContainer = useTemplateRef('$cameraViewContainer-view-container');
  const $results = useTemplateRef('results');

  // Inicializo la licencia del scanner de barras
  Dynamsoft.License.LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMTA0Njc1ODAyLU1UQTBOamMxT0RBeUxYZGxZaTFVY21saGJGQnliMm8iLCJtYWluU2VydmVyVVJMIjoiaHR0cHM6Ly9tZGxzLmR5bmFtc29mdG9ubGluZS5jb20iLCJvcmdhbml6YXRpb25JRCI6IjEwNDY3NTgwMiIsInN0YW5kYnlTZXJ2ZXJVUkwiOiJodHRwczovL3NkbHMuZHluYW1zb2Z0b25saW5lLmNvbSIsImNoZWNrQ29kZSI6LTE5NDg1MDM5MzV9");
  /* Si llegasemos a usar vue tendriamos que poner la ruta de los archivos wasm, worker, etc TODO: Esto
  Dynamsoft.Core.CoreModule.engineResourcePaths.rootDirectory = "https://cdn.jsdelivr.net/npm/";
  */
// Cargar el wasm por adelantado para reducir el tiempo de carga
  Dynamsoft.Core.CoreModule.loadWasm();

  let pCvRouter = null; //Helper para evitar que se cree una nueva instancia de cvRouter cada vez que se ejecuta la función
  let cvRouter = null;

  (async () => {
    cvRouter = await (pCvRouter = pCvRouter || Dynamsoft.CVR.CaptureVisionRouter.createInstance());
    let cameraView = await Dynamsoft.DCE.CameraView.createInstance();
    let cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
    cameraEnhancer.setScanRegion({
      x: 25,
      y: 25,
      width: 50,
      height: 50,
      isMeasuredInPercentage: true,
    });
    $cameraViewContainer.value.append(cameraView.getUIElement());
    cvRouter.setInput(cameraEnhancer);

    const resultsContainer = $results.value;
    cvRouter.addResultReceiver({
      onDecodedBarcodesReceived: async (result) => {
        if (result.barcodeResultItems?.length) {
          resultsContainer.textContent = '';
          Dynamsoft.DCE.Feedback.beep();

          for (let item of result.barcodeResultItems) {
            const codigo = item.text.trim();
            resultsContainer.textContent += `${item.formatString}: ${codigo}\n\n`;

            try {
              const { data } = await api.post('/api/scanner/process', {codigo});
              resultsContainer.textContent += `✅ Código encontrado: ${data.name || 'sin nombre'}`;

            } catch (err) {
              const status = err?.response?.status;
              if (status === 404) {
                resultsContainer.textContent += `❌ Código no encontrado: ${codigo}`;
              } else {
                resultsContainer.textContent += `❌ Error al consultar el backend: ${err?.message || err}`;
              }
            }
          }
        }
      }
    });

    let filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
    filter.enableResultCrossVerification("barcode", true);
    filter.enableResultDeduplication("barcode", true);
    await cvRouter.addResultFilter(filter);

    await cameraEnhancer.open();
    /*
    * ReadSingleBarcode para leer rapidamente un solo codigo de barras
    * ReadDistinctBarcodes para leer codigos de barras desde lejos
    */
    let settings = await cvRouter.getSimplifiedSettings("ReadSingleBarcode");
    settings.barcodeSettings.barcodeFormatIds = Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_13 | Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_8;
    await cvRouter.updateSettings("ReadSingleBarcode", settings);
    await cvRouter.startCapturing("ReadSingleBarcode");
  })();
})



onUnmounted(() => {
  // TODO: Frenar la cámara y el escaneo
})
</script>

<template>
  <AuthLayout>
    <h1 class="sr-only text-4xl">Escaner</h1>

    <div id="camera-view-container" ref="camera-view-container"></div>

    <div id="results" ref="results"></div>
  </AuthLayout>
</template>

<style scoped>
#camera-view-container {
  width: 100%;
  height: 100%;
}
</style>