<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import AuthLayout from '../layouts/AuthLayout.vue';
import AppLoading from '../components/loadings/AppLoading.vue';
import { useScanner } from '../composables/useScanner.js';
import {
  lookupCatalogByEan,
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

// Ingredientes en el step 'review' (array para edición individual)
const ingredientsList = ref([]);

// Feedback visual
const isLoadingLookup = ref(false);
const isLoadingOcr = ref(false);
const isSaving = ref(false);
const toast = ref('');   // mensaje transitorio
const errorMsg = ref('');

// Productos similares (mismo nombre base, distinto tamaño)
const similarProducts = ref([]);
const selectedSimilarEans = ref([]);
const isLoadingSimilar = ref(false);

const { scannerError, initializeDynamsoft, initializeScanner, cleanupScanner, resetLastScanned } = useScanner();

// ─── Helpers ─────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, duration = 3000) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ''), duration);
}

function resetToScanner() {
  step.value = 'scanner';
  product.value = null;
  currentEan.value = '';
  imageFile.value = null;
  imagePreviewUrl.value = '';
  ingredientsList.value = [];
  errorMsg.value = '';
  similarProducts.value = [];
  selectedSimilarEans.value = [];
  resetLastScanned();
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
const onBarcodeDetected = async (ean) => {
  if (isLoadingLookup.value) return;
  currentEan.value = ean;
  isLoadingLookup.value = true;
  errorMsg.value = '';

  try {
    const data = await lookupCatalogByEan(ean);
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
      showToast('Producto no encontrado en el catálogo. Intentá con otro código.');
    } else {
      showToast(`Error al consultar el catálogo: ${err?.response?.data?.message ?? err.message}`);
    }
    resetLastScanned();
  } finally {
    isLoadingLookup.value = false;
  }
};

// ─── Step 2: foto seleccionada ───────────────────────────────────────────────
function onFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreviewUrl.value = URL.createObjectURL(file);
  errorMsg.value = '';
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
    resetToScanner();
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
  initializeDynamsoft();
  const container = document.querySelector('#admin-camera-container');
  await initializeScanner(container, onBarcodeDetected);
});

onBeforeUnmount(async () => {
  await cleanupScanner();
  clearTimeout(toastTimer);
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

            <label
              for="ingredientes-photo"
              class="block w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#005B8E] transition-colors"
            >
              <span v-if="!imagePreviewUrl" class="text-gray-400 text-sm">
                Tocá para seleccionar o sacar foto
              </span>
              <img v-else :src="imagePreviewUrl" alt="Vista previa" class="mx-auto max-h-48 rounded-lg object-contain" />
            </label>
            <input
              id="ingredientes-photo"
              type="file"
              accept="image/*"
              capture="environment"
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
