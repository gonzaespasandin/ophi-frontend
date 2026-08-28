<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import AuthLayout from '../layouts/AuthLayout.vue';
import SearchField from '../components/search/SearchField.vue';
import SearchRecentList from '../components/search/SearchRecentList.vue';
import SearchScanNudge from '../components/search/SearchScanNudge.vue';
import SearchIntroCard from '../components/search/SearchIntroCard.vue';
import SearchSuggestionList from '../components/search/SearchSuggestionList.vue';
import SearchEmptyState from '../components/search/SearchEmptyState.vue';
import SearchScannerHandoff from '../components/search/SearchScannerHandoff.vue';
import SearchBarcodeReceipt from '../components/search/SearchBarcodeReceipt.vue';
import SearchErrorCard from '../components/search/SearchErrorCard.vue';
import { useRecentSearches } from '../composables/useRecentSearches.js';
import { useSearchSuggestions } from '../composables/useSearchSuggestions.js';
import { search } from '../services/product';
import { suscribeToAuthObserver } from '../services/auth';
import logoPositivo from '../assets/img/logo-positivo.png';

const router = useRouter();
const route = useRoute();

// Kept only for the premium block at the bottom of the template, which is not
// ours to decide on: the screen itself no longer waits for the session.
let unsubscribeToAuthObserver = () => {};
const user = ref({});

const query = ref('');
const searchFailed = ref(false);

const { searches, wasEmptiedByHand, remove, clear } = useRecentSearches();
const { suggestions, status, search: suggest, cancel } = useSearchSuggestions();

const trimmedQuery = computed(() => query.value.trim());
const fromScanner = computed(() => route.query.from === 'scanner');
const scannedCode = computed(() => route.query.code ?? '');

/**
 * One panel at a time. "Nothing typed yet" and "we found nothing" used to share
 * the same silent paragraph, which meant a brand-new user read an error first.
 */
const panel = computed(() => {
  if (searchFailed.value) return 'error';

  if (!trimmedQuery.value) {
    if (fromScanner.value) return 'scanner';
    return searches.value.length > 0 || wasEmptiedByHand.value ? 'recent' : 'intro';
  }

  return status.value === 'empty' ? 'no-matches' : 'suggestions';
});

onMounted(() => {
  localStorage.removeItem('pending_scan_barcode');
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => (user.value = state));
});

onUnmounted(() => {
  cancel();
  unsubscribeToAuthObserver();
});

function handleInput(value) {
  query.value = value;
  // Editing the search is the person retrying by hand: the error stops applying.
  searchFailed.value = false;
  suggest(value);
}

function runShortcut(shortcut) {
  query.value = shortcut;
  suggest(shortcut);
  handleSubmit();
}

async function handleSubmit() {
  const normalizedName = trimmedQuery.value.toLowerCase();

  if (!normalizedName) return;

  searchFailed.value = false;

  try {
    const result = await search(normalizedName);

    // The service returns the HTTP status code instead of throwing when the
    // request fails, so a payload without a list is a failure too.
    if (!Array.isArray(result?.data)) {
      throw new Error('[SearchView] -> respuesta inesperada de search()');
    }

    localStorage.setItem('products', JSON.stringify(result.data));
    router.push(`/search-list/${normalizedName}`);
  } catch (err) {
    console.error('[SearchView] -> handleSubmit(), Error:', err);
    searchFailed.value = true;
  }
}
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-[#F5F5F5] dot-texture-page">
      <div class="bg-ophi-blue dot-texture-band px-4 pt-4 pb-5 rounded-b-[22px]">
        <!-- The back arrow exists only here: coming from the scanner there is a
             concrete place to go back to. On the default entry it had no handler
             and no unambiguous destination. -->
        <div v-if="fromScanner" class="flex items-center gap-2 pb-[14px]">
          <RouterLink
            to="/scanner"
            aria-label="Volver al escáner"
            class="grid place-items-center shrink-0 w-11 h-11 -ml-[10px] rounded-card text-[17px] text-white active:bg-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </RouterLink>
          <h1 class="flex-1 font-poppins font-semibold text-[12px] tracking-[.1em] uppercase text-white/80">
            Buscar por nombre
          </h1>
        </div>

        <div v-else class="flex items-center justify-between pb-4">
          <img :src="logoPositivo" alt="Ophi" class="shrink-0 w-[104px] h-[30px] object-contain object-left">
          <h1 class="font-poppins font-semibold text-[12px] tracking-[.1em] uppercase text-white/80">
            Buscar
          </h1>
        </div>

        <SearchBarcodeReceipt v-if="fromScanner && scannedCode" :code="scannedCode" class="mb-[14px]" />

        <SearchField
          :model-value="query"
          :placeholder="fromScanner ? '¿Cómo se llama el producto?' : 'Buscar productos…'"
          @update:model-value="handleInput"
          @submit="handleSubmit"
        />
      </div>

      <div class="px-3 pt-[18px] pb-6">
        <SearchRecentList
          v-if="panel === 'recent'"
          :searches="searches"
          :emptied="wasEmptiedByHand"
          @remove="remove"
          @clear="clear"
        >
          <template #nudge>
            <div class="mt-[22px]">
              <SearchScanNudge />
            </div>
          </template>
        </SearchRecentList>

        <SearchIntroCard v-else-if="panel === 'intro'" @shortcut="runShortcut" />

        <SearchScannerHandoff v-else-if="panel === 'scanner'" />

        <SearchSuggestionList
          v-else-if="panel === 'suggestions'"
          :suggestions="suggestions"
          :query="trimmedQuery"
          @see-all="handleSubmit"
        />

        <SearchEmptyState v-else-if="panel === 'no-matches'" :query="trimmedQuery" />

        <SearchErrorCard v-else-if="panel === 'error'" @retry="handleSubmit" />
      </div>
    </div>

    <!-- <template v-else>
        <Top/>
        <div class="flex flex-col flex-1 h-[80%] justify-center">
          <div class="p-3">
            <div class="text-black px-6 py-3 rounded-lg shadow-md bg-white mt-10">
              <p class="text-[18px] font-semibold pb-2">Hola, {{ user.name }}</p>
              <p class=" text-center text-gray-800">¡Hacete <span class="font-semibold">premium</span> para <span class="font-semibold">buscar productos!</span></p>
              <RouterLink to="/subscriptions" class="action-btn text-white mt-3">Hacerme premuim</RouterLink>
            </div>
          </div>
      </div>
    </template> -->
  </AuthLayout>
</template>
