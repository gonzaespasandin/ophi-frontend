<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import AppLoading from '../components/loadings/AppLoading.vue';
import ImageCropperModal from '../components/ui/ImageCropperModal.vue';
import { useScanner } from '../composables/useScanner.js';
import {
  lookupCatalogByEan,
  createCatalogProduct,
  getBrandOptions,
  getCategoryOptions,
  getOriginOptions,
  extractIngredientsFromPhoto,
  saveCatalogIngredients,
  findSimilarCatalogProducts,
} from '../services/admin.js';

// ─── Estado del flujo ────────────────────────────────────────────────────────
// 'scanner'  → escáner activo, esperando un EAN
// 'product'  → producto identificado, esperando foto
// 'review'   → ingredientes extraídos, esperando confirmación del admin
const step = ref('scanner');

const product = ref(null);
const currentEan = ref('');

// Foto seleccionada en el step 'product'
const imageFile = ref(null);
const imagePreviewUrl = ref('');
const cameraInput = ref(null);
const galleryInput = ref(null);

// Cropper
const pendingImageUrl = ref('');
const showCropper = ref(false);

// Ingredientes en el step 'review' (array para edición individual)
const ingredientsList = ref([]);

// Feedback visual
const isLoadingLookup = ref(false);
const isLoadingOcr = ref(false);
const isSaving = ref(false);
const toast = ref('');   // mensaje transitorio
const errorMsg = ref('');

// Alta manual cuando el EAN no existe
const showMissingProductModal = ref(false);
const showCreateProductForm = ref(false);
const missingProductEan = ref('');
const isCreatingProduct = ref(false);
const createProductError = ref('');
const createProductFieldErrors = ref({});
const createProductForm = ref({
  name: '',
  brand: '',
  category: '',
  origin: 'Argentina',
  rnpa: '',
});
const brandOptions = ref([]);
const categoryOptions = ref([]);
const originOptions = ref([]);
const activeAutocomplete = ref('');
const isLoadingAutocomplete = ref(false);

// Productos similares (mismo nombre base, distinto tamaño)
const similarProducts = ref([]);
const selectedSimilarEans = ref([]);
const isLoadingSimilar = ref(false);

const { scannerError, initializeScannerLibrary, initializeScanner, cleanupScanner, resetLastScanned } = useScanner();

// ─── Helpers ─────────────────────────────────────────────────────────────────
let toastTimer = null;
let autocompleteTimer = null;
let scannerActive = false;
let ignoredScannerEan = '';
let ignoredScannerEanUntil = 0;
function showToast(msg, duration = 3000) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ''), duration);
}

async function startScanner(options = {}) {
  initializeScannerLibrary();
  await nextTick();

  const container = document.querySelector('#admin-camera-container');
  if (!container) return;

  await initializeScanner(container, onBarcodeDetected, options);
  scannerActive = !scannerError.value;
}

async function stopScanner() {
  await cleanupScanner();
  scannerActive = false;
}

async function resetToScanner() {
  const previousEan = normalizeBarcode(currentEan.value);
  ignoredScannerEan = previousEan;
  ignoredScannerEanUntil = Date.now() + 2000;
  await stopScanner();
  step.value = 'scanner';
  product.value = null;
  currentEan.value = '';
  imageFile.value = null;
  imagePreviewUrl.value = '';
  ingredientsList.value = [];
  errorMsg.value = '';
  similarProducts.value = [];
  selectedSimilarEans.value = [];
  pendingImageUrl.value = '';
  showCropper.value = false;
  closeMissingProductModalState();
  resetLastScanned();
  await startScanner({
    ignoredCodes: previousEan ? [previousEan] : [],
    ignoreCodesForMs: 2000,
    startGraceMs: 900,
  });
}

async function fetchSimilarProducts() {
  similarProducts.value = [];
  selectedSimilarEans.value = [];
  isLoadingSimilar.value = true;
  try {
    const data = await findSimilarCatalogProducts(currentEan.value);
    similarProducts.value = data.similar ?? [];
  } catch {
    similarProducts.value = [];
  } finally {
    isLoadingSimilar.value = false;
  }
}

// ─── Step 1: barcode detectado ────────────────────────────────────────────────
function resetCreateProductForm(ean = '') {
  missingProductEan.value = ean;
  showCreateProductForm.value = false;
  createProductError.value = '';
  createProductFieldErrors.value = {};
  createProductForm.value = {
    name: '',
    brand: '',
    category: '',
    origin: 'Argentina',
    rnpa: '',
  };
}

function closeMissingProductModalState() {
  showMissingProductModal.value = false;
  showCreateProductForm.value = false;
  missingProductEan.value = '';
  createProductError.value = '';
  createProductFieldErrors.value = {};
}

async function openMissingProductModal(ean) {
  await stopScanner();
  resetCreateProductForm(ean);
  showMissingProductModal.value = true;
}

async function scanAnotherAfterMissingProduct() {
  const ean = missingProductEan.value;
  closeMissingProductModalState();
  currentEan.value = '';
  errorMsg.value = '';
  resetLastScanned();
  await nextTick();
  await startScanner({
    ignoredCodes: ean ? [ean] : [],
    ignoreCodesForMs: 2000,
    startGraceMs: 900,
  });
}

function openCreateProductForm() {
  showCreateProductForm.value = true;
  createProductError.value = '';
  createProductFieldErrors.value = {};
  loadAutocompleteOptions('brand');
  loadAutocompleteOptions('category');
  loadAutocompleteOptions('origin');
}

function fieldError(field) {
  return createProductFieldErrors.value?.[field]?.[0] ?? '';
}

function optionName(option) {
  return typeof option === 'string' ? option : option?.name ?? '';
}

function autocompleteSource(type) {
  if (type === 'brand') return brandOptions.value;
  if (type === 'category') return categoryOptions.value;
  if (type === 'origin') return originOptions.value;
  return [];
}

function autocompleteOptions(type) {
  const query = createProductForm.value[type].trim().toLowerCase();
  const seen = new Set();
  const options = autocompleteSource(type)
    .map(optionName)
    .map((name) => name.trim())
    .filter(Boolean)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .filter((name) => !query || name.toLowerCase().includes(query))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(query);
      const bStarts = b.toLowerCase().startsWith(query);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return a.localeCompare(b, 'es');
    });

  return options.slice(0, 60);
}

async function loadAutocompleteOptions(type) {
  isLoadingAutocomplete.value = true;
  try {
    if (type === 'brand') {
      brandOptions.value = await getBrandOptions(createProductForm.value.brand);
    } else if (type === 'category') {
      categoryOptions.value = await getCategoryOptions(createProductForm.value.category);
    } else if (type === 'origin') {
      originOptions.value = await getOriginOptions(createProductForm.value.origin);
    }
  } catch (error) {
    console.error(`Error cargando opciones de ${type}`, error);
  } finally {
    isLoadingAutocomplete.value = false;
  }
}

function openAutocomplete(type) {
  activeAutocomplete.value = type;
  loadAutocompleteOptions(type);
}

function updateAutocomplete(type) {
  activeAutocomplete.value = type;
  window.clearTimeout(autocompleteTimer);
  autocompleteTimer = window.setTimeout(() => {
    loadAutocompleteOptions(type);
  }, 180);
}

function closeAutocomplete() {
  window.setTimeout(() => {
    activeAutocomplete.value = '';
  }, 120);
}

function selectAutocompleteOption(type, value) {
  createProductForm.value[type] = value;
  activeAutocomplete.value = '';
}

async function createMissingProduct() {
  createProductError.value = '';
  createProductFieldErrors.value = {};

  const payload = {
    name: createProductForm.value.name.trim(),
    brand: createProductForm.value.brand.trim(),
    category: createProductForm.value.category.trim(),
    origin: createProductForm.value.origin.trim(),
    rnpa: createProductForm.value.rnpa.trim(),
  };

  if (!payload.name || !payload.brand || !payload.category) {
    createProductError.value = 'Completá nombre, marca y categoría para agregar el producto.';
    return;
  }

  isCreatingProduct.value = true;
  try {
    const data = await createCatalogProduct(missingProductEan.value, payload);
    product.value = data;
    currentEan.value = data.ean ?? missingProductEan.value;
    imageFile.value = null;
    imagePreviewUrl.value = '';
    pendingImageUrl.value = '';
    ingredientsList.value = [];
    similarProducts.value = [];
    selectedSimilarEans.value = [];
    closeMissingProductModalState();
    step.value = 'product';
    showToast('Producto agregado. Ahora cargá la foto de ingredientes.');
  } catch (err) {
    createProductFieldErrors.value = err?.response?.data?.errors ?? {};
    createProductError.value = err?.response?.data?.message || 'No se pudo agregar el producto.';
  } finally {
    isCreatingProduct.value = false;
  }
}

const onBarcodeDetected = async (ean) => {
  const normalizedEan = normalizeBarcode(ean);
  if (ignoredScannerEan && normalizedEan === ignoredScannerEan && Date.now() <= ignoredScannerEanUntil) {
    resetLastScanned({ keepIgnoredCodes: true });
    return;
  }

  ignoredScannerEan = '';
  ignoredScannerEanUntil = 0;

  if (isLoadingLookup.value) return;
  currentEan.value = normalizedEan;
  isLoadingLookup.value = true;
  errorMsg.value = '';

  try {
    const data = await lookupCatalogByEan(normalizedEan);
    await stopScanner();
    product.value = data;

    if (data.ingredientes) {
      // Ya tiene ingredientes → ir directo a edición
      ingredientsList.value = data.ingredientes.split(',').map((s) => s.trim()).filter(Boolean);
      ingredientesText.value = ingredientsList.value.join(', ');
      step.value = 'review';
      fetchSimilarProducts();
    } else {
      // Sin ingredientes → paso de foto
      ingredientsList.value = [];
      step.value = 'product';
    }
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) {
      await openMissingProductModal(normalizedEan);
    } else {
      showToast(`Error al consultar el catálogo: ${err?.response?.data?.message ?? err.message}`);
      resetLastScanned();
    }
  } finally {
    isLoadingLookup.value = false;
  }
};

function normalizeBarcode(value) {
  return String(value ?? '').replace(/\D/g, '');
}

// ─── Step 2: foto seleccionada ───────────────────────────────────────────────
function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  pendingImageUrl.value = URL.createObjectURL(file);
  showCropper.value = true;
  event.target.value = '';
  errorMsg.value = '';
}

function openCameraPicker() {
  cameraInput.value?.click();
}

function openGalleryPicker() {
  galleryInput.value?.click();
}

function onCropConfirm(croppedFile) {
  imageFile.value = croppedFile;
  imagePreviewUrl.value = URL.createObjectURL(croppedFile);
  URL.revokeObjectURL(pendingImageUrl.value);
  pendingImageUrl.value = '';
  showCropper.value = false;
}

function onCropCancel() {
  URL.revokeObjectURL(pendingImageUrl.value);
  pendingImageUrl.value = '';
  showCropper.value = false;
}

const extractIngredients = async () => {
  if (!imageFile.value) {
    errorMsg.value = 'Seleccioná una foto primero.';
    return;
  }
  isLoadingOcr.value = true;
  errorMsg.value = '';
  try {
    const result = await extractIngredientsFromPhoto(currentEan.value, imageFile.value);
    if (!result.ingredientes?.length) {
      errorMsg.value = 'No se encontraron ingredientes en la foto. Intentá con otra imagen más clara.';
      return;
    }
    ingredientsList.value = result.ingredientes;
    ingredientesText.value = result.ingredientes.join(', ');
    step.value = 'review';
    fetchSimilarProducts();
  } catch (err) {
    errorMsg.value = `Error al extraer ingredientes: ${err?.response?.data?.message ?? err.message}`;
  } finally {
    isLoadingOcr.value = false;
  }
};

// ─── Step 3: guardar ─────────────────────────────────────────────────────────
// El admin edita ingredientsList directamente (textarea unificado)
const ingredientesText = ref('');

function enterReview() {
  ingredientesText.value = ingredientsList.value.join(', ');
  step.value = 'review';
  fetchSimilarProducts();
}

const saveIngredients = async () => {
  const parsed = ingredientesText.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parsed.length) {
    errorMsg.value = 'La lista de ingredientes no puede estar vacía.';
    return;
  }
  isSaving.value = true;
  errorMsg.value = '';
  try {
    await saveCatalogIngredients(currentEan.value, parsed);
    for (const similarEan of selectedSimilarEans.value) {
      await saveCatalogIngredients(similarEan, parsed);
    }
    const total = 1 + selectedSimilarEans.value.length;
    showToast(`✓ Ingredientes guardados${total > 1 ? ` en ${total} productos` : ' correctamente'}`);
    await resetToScanner();
  } catch (err) {
    errorMsg.value = `Error al guardar: ${err?.response?.data?.message ?? err.message}`;
  } finally {
    isSaving.value = false;
  }
};

// Sincronizar ingredientesText cuando llega del OCR
function onOcrDone(ingredientes) {
  ingredientsList.value = ingredientes;
  ingredientesText.value = ingredientes.join(', ');
  step.value = 'review';
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
  await startScanner();
});

onBeforeUnmount(async () => {
  await cleanupScanner();
  clearTimeout(toastTimer);
  window.clearTimeout(autocompleteTimer);
});
</script>

<template>
  <AuthLayout>
    <div class="relative min-h-screen bg-gray-100">

      <!-- Toast ───────────────────────────────────────────────── -->
      <transition name="fade">
        <div
          v-if="toast"
          class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg max-w-xs text-center"
        >
          {{ toast }}
        </div>
      </transition>

      <!-- Header ──────────────────────────────────────────────── -->
      <div class="bg-[#005B8E] text-white px-4 pt-10 pb-4">
        <p class="text-xs uppercase tracking-widest opacity-70">Panel Admin</p>
        <h1 class="text-2xl font-bold">Scanner de ingredientes</h1>
      </div>

      <!-- ══ STEP 1: Scanner activo ═════════════════════════════ -->
      <template v-if="step === 'scanner'">
        <div class="relative w-full" style="height: 60vh;">
          <div id="admin-camera-container" class="w-full h-full"></div>

          <!-- Overlay de carga mientras se consulta el catálogo -->
          <div
            v-if="isLoadingLookup"
            class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3"
          >
            <AppLoading />
            <p class="text-white text-sm">Buscando en el catálogo…</p>
          </div>
        </div>

        <div class="px-4 py-6 text-center text-gray-500 text-sm">
          <p>Apuntá la cámara al código de barras del producto.</p>
          <p v-if="scannerError" class="mt-2 text-red-500">{{ scannerError }}</p>
        </div>
      </template>

      <!-- ══ STEP 2: Producto identificado — subir foto ═════════ -->
      <template v-else-if="step === 'product'">
        <div class="px-4 py-6 space-y-4">

          <!-- Tarjeta del producto -->
          <div class="bg-white rounded-2xl shadow p-4">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Producto encontrado</p>
            <h2 class="text-xl font-bold mt-1">{{ product.name }}</h2>
            <p v-if="product.brand" class="text-sm text-gray-500">{{ product.brand }}</p>
            <p class="text-xs text-gray-400 mt-1">EAN: {{ product.ean }}</p>
            <div v-if="product.cat1 || product.cat2 || product.cat3" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="cat in [product.cat1, product.cat2, product.cat3].filter(Boolean)"
                :key="cat"
                class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
              >{{ cat }}</span>
            </div>
          </div>

          <!-- Ingredientes ya cargados (si existen) -->
          <div v-if="product.ingredientes" class="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p class="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Ingredientes ya cargados</p>
            <p class="text-sm text-gray-700">{{ product.ingredientes }}</p>
            <p class="text-xs text-gray-400 mt-1" v-if="product.ingredientes_updated_at">
              Actualizado: {{ product.ingredientes_updated_at }}
            </p>
            <button
              type="button"
              class="mt-3 text-sm text-[#005B8E] underline"
              @click="enterReview"
            >
              Editar ingredientes
            </button>
          </div>

          <!-- Upload de foto -->
          <div class="bg-white rounded-2xl shadow p-4 space-y-3">
            <p class="font-semibold text-gray-700">
              {{ product.ingredientes ? 'Reemplazar foto de ingredientes' : 'Foto del listado de ingredientes' }}
            </p>

            <div class="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              <span v-if="!imagePreviewUrl" class="block text-gray-400 text-sm">
                Elegí una imagen clara del listado de ingredientes
              </span>
              <img v-else :src="imagePreviewUrl" alt="Vista previa" class="mx-auto max-h-48 rounded-lg object-contain" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="w-full py-2.5 rounded-full bg-[#005B8E] text-white font-semibold text-sm"
                @click="openCameraPicker"
              >
                Sacar foto
              </button>
              <button
                type="button"
                class="w-full py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold text-sm"
                @click="openGalleryPicker"
              >
                Subir foto
              </button>
            </div>
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="sr-only"
              @change="onFileChange"
            />
            <input
              ref="galleryInput"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="onFileChange"
            />

            <p v-if="errorMsg" class="text-xs text-red-500">{{ errorMsg }}</p>

            <button
              type="button"
              :disabled="!imageFile || isLoadingOcr"
              class="w-full py-3 rounded-full bg-[#00A878] text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              @click="extractIngredients"
            >
              <span v-if="isLoadingOcr">Extrayendo ingredientes…</span>
              <span v-else>Extraer ingredientes con IA</span>
            </button>
          </div>

          <button
            type="button"
            class="w-full py-2 text-sm text-gray-500 underline"
            @click="resetToScanner"
          >
            Escanear otro producto
          </button>
        </div>
      </template>

      <!-- ══ STEP 3: Revisión y confirmación ════════════════════ -->
      <template v-else-if="step === 'review'">
        <div class="px-4 py-6 space-y-4">

          <!-- Producto -->
          <div class="bg-white rounded-2xl shadow p-4">
            <h2 class="font-bold text-gray-800">{{ product?.name }}</h2>
            <p class="text-xs text-gray-400">EAN: {{ currentEan }}</p>
          </div>

          <!-- Imagen de referencia (solo si se subió foto) -->
          <div v-if="imagePreviewUrl" class="bg-white rounded-2xl shadow p-4">
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Foto de referencia</p>
            <img
              :src="imagePreviewUrl"
              alt="Foto de ingredientes"
              class="w-full rounded-xl object-contain max-h-64"
            />
          </div>

          <!-- Ingredientes editables -->
          <div class="bg-white rounded-2xl shadow p-4 space-y-3">
            <p class="font-semibold text-gray-700">Revisá y editá los ingredientes</p>
            <p class="text-xs text-gray-400">Separados por coma. Minúsculas, sin porcentajes ni aditivos.</p>

            <textarea
              v-model="ingredientesText"
              rows="8"
              class="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161] resize-none"
              placeholder="leche entera, azúcar, almidón de maíz, …"
            ></textarea>

            <p v-if="errorMsg" class="text-xs text-red-500">{{ errorMsg }}</p>
          </div>

          <!-- Productos similares (mismo producto, distinto tamaño) -->
          <div v-if="isLoadingSimilar" class="bg-white rounded-2xl shadow p-4">
            <p class="text-sm text-gray-400">Buscando presentaciones similares…</p>
          </div>
          <div
            v-else-if="similarProducts.length > 0"
            class="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3"
          >
            <p class="font-semibold text-amber-800 text-sm">¿Poner estos ingredientes también en…?</p>
            <p class="text-xs text-amber-600">Mismo producto, distintos tamaños — los ingredientes deberían ser iguales.</p>
            <div class="space-y-2">
              <label
                v-for="p in similarProducts"
                :key="p.ean"
                class="flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :value="p.ean"
                  v-model="selectedSimilarEans"
                  class="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#005B8E]"
                />
                <span class="text-sm text-gray-700 leading-snug">
                  {{ p.name }}
                  <span v-if="p.has_ingredients" class="text-xs text-green-600 ml-1">(ya tiene ingredientes)</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Guardar -->
          <button
            type="button"
            :disabled="isSaving"
            class="w-full py-3 rounded-full bg-[#005B8E] text-white font-semibold disabled:opacity-50"
            @click="saveIngredients"
          >
            {{ isSaving ? 'Guardando…' : 'Guardar ingredientes' }}
          </button>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 py-2 rounded-full border border-gray-300 text-gray-600 text-sm"
              @click="step = 'product'"
            >
              {{ product?.ingredientes ? 'Cargar nueva foto' : 'Reintentar OCR' }}
            </button>
            <button
              type="button"
              class="flex-1 py-2 rounded-full border border-gray-300 text-gray-600 text-sm"
              @click="resetToScanner"
            >
              Escanear otro
            </button>
          </div>

        </div>
      </template>

    </div>

    <!-- Cropper modal — se muestra sobre cualquier step -->
    <div
      v-if="showMissingProductModal"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4 pt-10 sm:items-center"
    >
      <div class="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div class="border-b border-gray-100 px-4 py-4">
          <p class="text-xs uppercase tracking-wide text-gray-400">Producto no encontrado</p>
          <h2 class="text-xl font-bold text-gray-900">No encontramos este código</h2>
          <p class="mt-2 text-sm text-gray-600">
            Código escaneado:
            <span class="font-mono font-semibold text-gray-900">{{ missingProductEan }}</span>
          </p>
        </div>

        <div v-if="!showCreateProductForm" class="space-y-4 px-4 py-5">
          <p class="text-sm text-gray-600">
            Revisá que el código coincida con el envase. Si es correcto, podés agregar el producto y después cargar sus ingredientes con OCR.
          </p>

          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-full border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700"
              @click="scanAnotherAfterMissingProduct"
            >
              Escanear otro
            </button>
            <button
              type="button"
              class="flex-1 rounded-full bg-[#005B8E] px-3 py-2.5 text-sm font-semibold text-white"
              @click="openCreateProductForm"
            >
              Agregar producto
            </button>
          </div>
        </div>

        <form v-else class="space-y-3 px-4 py-5" @submit.prevent="createMissingProduct">
          <div>
            <label for="new-product-name" class="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
            <input
              id="new-product-name"
              v-model="createProductForm.name"
              type="text"
              class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161]"
              autocomplete="off"
            />
            <p v-if="fieldError('name')" class="mt-1 text-xs text-red-600">{{ fieldError('name') }}</p>
          </div>

          <div>
            <label for="new-product-brand" class="mb-1 block text-sm font-medium text-gray-700">Marca</label>
            <div class="relative">
              <input
                id="new-product-brand"
                v-model="createProductForm.brand"
                type="text"
                class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161]"
                autocomplete="off"
                @focus="openAutocomplete('brand')"
                @input="updateAutocomplete('brand')"
                @blur="closeAutocomplete"
              />
              <div
                v-if="activeAutocomplete === 'brand' && autocompleteOptions('brand').length"
                class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              >
                <button
                  v-for="option in autocompleteOptions('brand')"
                  :key="`brand-${option}`"
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  @mousedown.prevent="selectAutocompleteOption('brand', option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
            <p v-if="fieldError('brand')" class="mt-1 text-xs text-red-600">{{ fieldError('brand') }}</p>
          </div>

          <div>
            <label for="new-product-category" class="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
            <div class="relative">
              <input
                id="new-product-category"
                v-model="createProductForm.category"
                type="text"
                class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161]"
                autocomplete="off"
                @focus="openAutocomplete('category')"
                @input="updateAutocomplete('category')"
                @blur="closeAutocomplete"
              />
              <div
                v-if="activeAutocomplete === 'category' && autocompleteOptions('category').length"
                class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              >
                <button
                  v-for="option in autocompleteOptions('category')"
                  :key="`category-${option}`"
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  @mousedown.prevent="selectAutocompleteOption('category', option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
            <p v-if="fieldError('category')" class="mt-1 text-xs text-red-600">{{ fieldError('category') }}</p>
          </div>

          <div>
            <label for="new-product-origin" class="mb-1 block text-sm font-medium text-gray-700">Origen</label>
            <div class="relative">
              <input
                id="new-product-origin"
                v-model="createProductForm.origin"
                type="text"
                class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161]"
                autocomplete="off"
                @focus="openAutocomplete('origin')"
                @input="updateAutocomplete('origin')"
                @blur="closeAutocomplete"
              />
              <div
                v-if="activeAutocomplete === 'origin' && autocompleteOptions('origin').length"
                class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
              >
                <button
                  v-for="option in autocompleteOptions('origin')"
                  :key="`origin-${option}`"
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  @mousedown.prevent="selectAutocompleteOption('origin', option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
            <p v-if="fieldError('origin')" class="mt-1 text-xs text-red-600">{{ fieldError('origin') }}</p>
          </div>

          <div>
            <label for="new-product-rnpa" class="mb-1 block text-sm font-medium text-gray-700">RNPA</label>
            <input
              id="new-product-rnpa"
              v-model="createProductForm.rnpa"
              type="text"
              class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009161]"
              autocomplete="off"
              placeholder="Opcional"
            />
            <p v-if="fieldError('rnpa')" class="mt-1 text-xs text-red-600">{{ fieldError('rnpa') }}</p>
          </div>

          <p v-if="createProductError" class="text-sm text-red-600">{{ createProductError }}</p>

          <div class="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              class="w-full rounded-full border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 sm:flex-1"
              @click="scanAnotherAfterMissingProduct"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isCreatingProduct"
              class="w-full rounded-full bg-[#00A878] px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:flex-1"
            >
              {{ isCreatingProduct ? 'Agregando...' : 'Guardar y cargar ingredientes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ImageCropperModal
      v-if="showCropper"
      :image-src="pendingImageUrl"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />
  </AuthLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
