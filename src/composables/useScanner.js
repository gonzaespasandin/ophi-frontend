import { ref } from 'vue';

export const useScanner = () => {
  let cvRouter = null;
  let cameraEnhancer = null;
  let cameraView = null;
  let lastScannedCode = null;

  const scannerError = ref('');

  const initializeDynamsoft = () => {
    Dynamsoft.License.LicenseManager.initLicense(import.meta.env.VITE_SCANNER_LICENSE);
    Dynamsoft.Core.CoreModule.loadWasm();
  };

  const initializeScanner = async (containerEl, onBarcodeDetected) => {
    try {
      cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();

      Dynamsoft.DCE.CameraView.defaultUIElementURL = '/templates/dce.ui.html';
      cameraView = await Dynamsoft.DCE.CameraView.createInstance();

      cameraView.setScanRegionMaskStyle({
        lineWidth: 7,
        strokeStyle: '#005B8E',
      });
      cameraView.setVideoFit('cover');

      cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(cameraView);
      cameraEnhancer.setResolution({ width: 1080, height: 1920 });
      cameraEnhancer.setScanRegion({
        x: 5,
        y: 35,
        width: 90,
        height: 30,
        isMeasuredInPercentage: true,
      });

      Dynamsoft.DCE.DrawingStyleManager.updateDrawingStyle(3, {
        fontFamily: 'sans-serif',
        fillStyle: 'rgb(0, 145, 97, 0.5)',
        fontSize: 25,
        lineWidth: 5,
        paintMode: 'strokeAndFill',
        strokeStyle: 'rgb(0, 145, 97)',
      });

      containerEl.append(cameraView.getUIElement());

      cvRouter.setInput(cameraEnhancer);

      cvRouter.addResultReceiver({
        onDecodedBarcodesReceived: async (result) => {
          if (!result.barcodeResultItems?.length) return;
          for (const item of result.barcodeResultItems) {
            const codigo = item.text.trim();
            if (codigo === lastScannedCode) return;
            lastScannedCode = codigo;
            Dynamsoft.DCE.Feedback.beep();
            await onBarcodeDetected(codigo);
          }
        },
      });

      const filter = new Dynamsoft.Utility.MultiFrameResultCrossFilter();
      filter.enableResultCrossVerification('barcode', true);
      filter.enableResultDeduplication('barcode', true);
      await cvRouter.addResultFilter(filter);

      await cameraEnhancer.open();

      const settings = await cvRouter.getSimplifiedSettings('ReadSingleBarcode');
      settings.barcodeSettings.barcodeFormatIds =
        Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_13 |
        Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_8;
      await cvRouter.updateSettings('ReadSingleBarcode', settings);

      await cvRouter.startCapturing('ReadSingleBarcode');
    } catch (error) {
      scannerError.value = `Error al inicializar el escáner: ${error?.message || error}`;
    }
  };

  const cleanupScanner = async () => {
    try {
      if (cvRouter) await cvRouter.stopCapturing();
      if (cameraEnhancer) {
        await cameraEnhancer.close();
        cameraEnhancer.dispose();
      }
      if (cameraView) cameraView.dispose();
      if (cvRouter) cvRouter.dispose();
    } catch (error) {
      console.error('Error al limpiar el escáner:', error);
    } finally {
      cvRouter = null;
      cameraEnhancer = null;
      cameraView = null;
      lastScannedCode = null;
    }
  };

  const resetLastScanned = () => {
    lastScannedCode = null;
  };

  return { scannerError, initializeDynamsoft, initializeScanner, cleanupScanner, resetLastScanned };
};
