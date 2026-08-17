import { ref } from 'vue';
import Quagga from '@ericblade/quagga2';

const RETAIL_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
const SCAN_CONFIRMATION_WINDOW_MS = 550;
const SCAN_CONFIRMATION_MIN_HITS = 2;
const SCAN_CONFIRMATION_MIN_SHARE = 0.6;
const SCAN_START_GRACE_MS = 650;
const SCAN_IGNORED_CODE_MS = 5000;

let lastScannedCode = null;
let lastScannedAt = 0;
let scanCandidates = [];
let scanConfirmationTimer = null;
let scannerSessionId = 0;
let scanAcceptsAt = 0;
let ignoredCodes = new Map();
let detectedHandler = null;
let scannerContainer = null;
let nativeStream = null;
let nativeVideo = null;
let nativeFrameRequest = null;
let nativeScanFrame = null;
let isScannerPaused = false;
let isHandlingDetection = false;
let isScanLocked = false;
let quaggaStarted = false;
let activeScannerStatus = null;

export const useScanner = () => {
  const scannerError = ref('');
  const scannerStatus = ref('');
  activeScannerStatus = scannerStatus;

  const initializeScannerLibrary = () => {
    scannerError.value = '';
    scannerStatus.value = '';
  };

  const initializeScanner = async (containerEl, onBarcodeDetected, options = {}) => {
    if (!containerEl) {
      scannerError.value = 'No se encontro el contenedor de la camara.';
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      scannerError.value = 'Este navegador no permite acceder a la camara.';
      return;
    }

    scannerContainer = containerEl;
    scannerContainer.classList.add('quagga-camera');
    scannerContainer.innerHTML = '';
    const sessionId = beginScannerSession(options);

    try {
      const nativeStarted = await tryStartNativeScanner(scannerContainer, onBarcodeDetected, sessionId);

      if (!nativeStarted) {
        await startQuaggaScanner(scannerContainer, onBarcodeDetected, sessionId);
      }
    } catch (error) {
      if (isActiveScannerSession(sessionId)) {
        scannerError.value = `Error al inicializar el escaner: ${error?.message || error}`;
      }
    }
  };

  const cleanupScanner = async () => {
    try {
      invalidateScannerSession();
      stopNativeScanner();

      if (detectedHandler) {
        Quagga.offDetected(detectedHandler);
      }

      if (quaggaStarted) {
        Quagga.stop();
      }
    } catch (error) {
      console.error('Error al limpiar el escaner:', error);
    } finally {
      if (scannerContainer) {
        scannerContainer.classList.remove('quagga-camera');
        scannerContainer.innerHTML = '';
      }

      detectedHandler = null;
      scannerContainer = null;
      lastScannedCode = null;
      lastScannedAt = 0;
      clearScanCandidates();
      ignoredCodes.clear();
      scanAcceptsAt = 0;
      isHandlingDetection = false;
      isScanLocked = false;
      quaggaStarted = false;
      scannerStatus.value = '';
      activeScannerStatus = null;
    }
  };

  // While the result panel covers the whole screen there is nothing to read and
  // nobody to read it for: the frame loop and the video stop burning battery,
  // and the stream stays open so coming back is instant instead of asking for
  // the camera again.
  const pauseScanner = () => {
    if (isScannerPaused) return;

    isScannerPaused = true;

    if (nativeFrameRequest) {
      window.cancelAnimationFrame(nativeFrameRequest);
      nativeFrameRequest = null;
    }

    nativeVideo?.pause();

    if (quaggaStarted) {
      try {
        Quagga.pause();
      } catch {
        // Quagga was already stopped.
      }
    }
  };

  const resumeScanner = () => {
    if (!isScannerPaused) return;

    isScannerPaused = false;

    if (nativeVideo && nativeScanFrame) {
      nativeVideo.play().catch(() => {});
      nativeFrameRequest = window.requestAnimationFrame(nativeScanFrame);
    }

    if (quaggaStarted) {
      try {
        Quagga.start();
      } catch {
        // Quagga was already stopped.
      }
    }
  };

  const resetLastScanned = (options = {}) => {
    lastScannedCode = null;
    lastScannedAt = 0;
    clearScanCandidates();
    if (!options.keepIgnoredCodes) {
      ignoredCodes.clear();
    }
    scanAcceptsAt = Date.now() + SCAN_START_GRACE_MS;
    isHandlingDetection = false;
    isScanLocked = false;
    if (scannerContainer) {
      scannerStatusFor(scannerContainer, 'Apunta al codigo de barras');
    }
  };

  return {
    scannerError,
    scannerStatus,
    initializeScannerLibrary,
    initializeScanner,
    cleanupScanner,
    pauseScanner,
    resumeScanner,
    resetLastScanned,
  };
};

async function tryStartNativeScanner(target, onBarcodeDetected, sessionId) {
  if (!('BarcodeDetector' in window)) {
    return false;
  }

  const supportedFormats = await getSupportedBarcodeFormats();
  const formats = RETAIL_FORMATS.filter((format) => supportedFormats.includes(format));

  if (formats.length === 0) {
    return false;
  }

  if (!isActiveScannerSession(sessionId)) {
    return true;
  }

  scannerStatusFor(target, 'Iniciando camara...');

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: getCameraConstraints(),
  });

  if (!isActiveScannerSession(sessionId)) {
    stream.getTracks().forEach((track) => track.stop());
    return true;
  }

  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  nativeStream = stream;
  nativeVideo = video;
  target.append(video);

  await video.play();

  if (!isActiveScannerSession(sessionId)) {
    stopNativeScanner();
    return true;
  }

  const detector = new window.BarcodeDetector({ formats });
  scannerStatusFor(target, 'Apunta al codigo de barras');

  const scanFrame = async () => {
    if (!isActiveScannerSession(sessionId) || !nativeVideo) {
      return;
    }

    try {
      if (!isScanLocked && !isHandlingDetection && nativeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const barcodes = await detector.detect(nativeVideo);
        if (!isActiveScannerSession(sessionId)) {
          return;
        }

        const detected = barcodes.find((barcode) => isValidRetailCode(normalizeCode(barcode.rawValue)));

        if (detected) {
          await handleDetectedCode(normalizeCode(detected.rawValue), onBarcodeDetected, sessionId);
        }
      }
    } catch {
      // Some frames can fail while the camera is adjusting focus.
    }

    if (isActiveScannerSession(sessionId)) {
      nativeFrameRequest = window.requestAnimationFrame(scanFrame);
    }
  };

  nativeScanFrame = scanFrame;
  nativeFrameRequest = window.requestAnimationFrame(scanFrame);
  return true;
}

async function getSupportedBarcodeFormats() {
  if (typeof window.BarcodeDetector.getSupportedFormats !== 'function') {
    return RETAIL_FORMATS;
  }

  return window.BarcodeDetector.getSupportedFormats();
}

function stopNativeScanner() {
  if (nativeFrameRequest) {
    window.cancelAnimationFrame(nativeFrameRequest);
  }

  if (nativeStream) {
    nativeStream.getTracks().forEach((track) => track.stop());
  }

  if (nativeVideo) {
    nativeVideo.pause();
    nativeVideo.srcObject = null;
    nativeVideo.remove();
  }

  nativeFrameRequest = null;
  nativeScanFrame = null;
  nativeStream = null;
  nativeVideo = null;
  isScannerPaused = false;
}

async function startQuaggaScanner(target, onBarcodeDetected, sessionId) {
  scannerStatusFor(target, 'Iniciando camara...');
  await initQuagga(target);

  if (!isActiveScannerSession(sessionId)) {
    try {
      Quagga.stop();
    } catch {
      // Scanner was cancelled while Quagga was initializing.
    }
    return;
  }

  detectedHandler = async (result) => {
    if (!isActiveScannerSession(sessionId) || isScanLocked || isHandlingDetection) {
      return;
    }

    const codigo = normalizeCode(result?.codeResult?.code);

    if (!isValidRetailCode(codigo)) {
      return;
    }

    await handleDetectedCode(codigo, onBarcodeDetected, sessionId);
  };

  Quagga.onDetected(detectedHandler);
  Quagga.start();
  quaggaStarted = true;
  scannerStatusFor(target, 'Apunta al codigo de barras');
}

function initQuagga(target) {
  return new Promise((resolve, reject) => {
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target,
          constraints: getCameraConstraints(),
        },
        locator: {
          patchSize: 'large',
          halfSample: false,
        },
        numOfWorkers: 0,
        frequency: 12,
        locate: true,
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'],
          multiple: false,
        },
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    );
  });
}

function getCameraConstraints() {
  return {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  };
}

async function handleDetectedCode(code, onBarcodeDetected, sessionId) {
  if (
    !isActiveScannerSession(sessionId)
    || Date.now() < scanAcceptsAt
    || isIgnoredCode(code)
    || isScanLocked
    || isHandlingDetection
    || isRecentDuplicate(code)
  ) {
    return;
  }

  const confirmedCode = collectScanCandidate(code);
  if (!confirmedCode) {
    if (scannerContainer) {
      scannerStatusFor(scannerContainer, 'Confirmando codigo...');
    }
    scheduleScanCandidateReset();
    return;
  }

  await processConfirmedCode(confirmedCode, onBarcodeDetected, sessionId);
}

async function processConfirmedCode(code, onBarcodeDetected, sessionId) {
  if (!isActiveScannerSession(sessionId)) {
    return;
  }

  isHandlingDetection = true;
  isScanLocked = true;
  clearScanCandidates();
  lastScannedCode = code;
  lastScannedAt = Date.now();
  if (scannerContainer) {
    scannerStatusFor(scannerContainer, 'Codigo detectado');
  }
  playBeep();

  try {
    if (isActiveScannerSession(sessionId)) {
      await onBarcodeDetected(code);
    }
  } finally {
    if (isActiveScannerSession(sessionId)) {
      isHandlingDetection = false;
    }
  }
}

function beginScannerSession(options = {}) {
  scannerSessionId += 1;
  const now = Date.now();
  const startGraceMs = options.startGraceMs ?? SCAN_START_GRACE_MS;
  const ignoreCodesForMs = options.ignoreCodesForMs ?? SCAN_IGNORED_CODE_MS;

  scanAcceptsAt = now + startGraceMs;
  ignoredCodes = new Map(
    (options.ignoredCodes ?? [])
      .map(normalizeCode)
      .filter(Boolean)
      .map((code) => [code, now + ignoreCodesForMs]),
  );
  clearScanCandidates();
  lastScannedCode = null;
  lastScannedAt = 0;
  isHandlingDetection = false;
  isScanLocked = false;
  return scannerSessionId;
}

function invalidateScannerSession() {
  scannerSessionId += 1;
  clearScanCandidates();
  ignoredCodes.clear();
}

function isActiveScannerSession(sessionId) {
  return sessionId === scannerSessionId;
}

function isIgnoredCode(code) {
  const ignoredUntil = ignoredCodes.get(code);
  if (!ignoredUntil) {
    return false;
  }

  if (Date.now() <= ignoredUntil) {
    return true;
  }

  ignoredCodes.delete(code);
  return false;
}

function collectScanCandidate(code) {
  const now = Date.now();
  scanCandidates = scanCandidates.filter((candidate) => now - candidate.at <= SCAN_CONFIRMATION_WINDOW_MS);
  scanCandidates.push({ code, at: now });

  const counts = scanCandidates.reduce((acc, candidate) => {
    acc.set(candidate.code, (acc.get(candidate.code) ?? 0) + 1);
    return acc;
  }, new Map());

  let topCode = null;
  let topHits = 0;

  counts.forEach((hits, candidateCode) => {
    if (hits > topHits) {
      topCode = candidateCode;
      topHits = hits;
    }
  });

  const share = topHits / scanCandidates.length;

  if (topHits >= SCAN_CONFIRMATION_MIN_HITS && share >= SCAN_CONFIRMATION_MIN_SHARE) {
    return topCode;
  }

  return null;
}

function scheduleScanCandidateReset() {
  window.clearTimeout(scanConfirmationTimer);
  scanConfirmationTimer = window.setTimeout(() => {
    clearScanCandidates();
    if (!isScanLocked && !isHandlingDetection && scannerContainer) {
      scannerStatusFor(scannerContainer, 'Apunta al codigo de barras');
    }
  }, SCAN_CONFIRMATION_WINDOW_MS);
}

function clearScanCandidates() {
  scanCandidates = [];
  window.clearTimeout(scanConfirmationTimer);
  scanConfirmationTimer = null;
}

function scannerStatusFor(target, message) {
  target.dataset.scannerStatus = message;
  if (activeScannerStatus) {
    activeScannerStatus.value = message;
  }
}

function isRecentDuplicate(code) {
  return code === lastScannedCode && Date.now() - lastScannedAt < 2500;
}

function normalizeCode(code) {
  return String(code ?? '').replace(/\D/g, '');
}

function isValidRetailCode(code) {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$/.test(code ?? '')) {
    return false;
  }

  const digits = code.split('').map(Number);
  const checkDigit = digits.pop();
  let sum = 0;
  let weight = 3;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    sum += digits[index] * weight;
    weight = weight === 3 ? 1 : 3;
  }

  return (10 - (sum % 10)) % 10 === checkDigit;
}

function playBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.05;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
    oscillator.onended = () => audioContext.close();
  } catch {
    // Audio feedback is optional.
  }
}
