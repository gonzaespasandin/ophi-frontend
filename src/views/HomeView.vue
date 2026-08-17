<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import { suscribeToAuthObserver } from "../services/auth.js";
import { getBrands } from "../services/product.js";
import HomeIdentityBand from "../components/home/HomeIdentityBand.vue";
import HomeSearchRow from "../components/home/HomeSearchRow.vue";
import HomeOnboardingCard from "../components/home/HomeOnboardingCard.vue";
import ScanHistoryCard from "../components/home/ScanHistoryCard.vue";
import RecommendedCarousel from "../components/home/RecommendedCarousel.vue";
import { useScanHistory } from "../composables/useScanHistory.js";
import { useSafeProducts } from "../composables/useSafeProducts.js";

let unsuscribeToAuthObserver = () => {}

const user = ref({});

const { scans, state: historyState, load: loadHistory } = useScanHistory();
const { products, state: recommendedState, load: loadRecommended } = useSafeProducts();

const profiles = computed(() => user.value?.profiles ?? []);
const mainProfile = computed(() => profiles.value.find(p => p.is_main) ?? profiles.value[0] ?? null);

const displayName = computed(() => mainProfile.value?.name ?? user.value?.name ?? '');
const avatarColor = computed(() => mainProfile.value?.avatar_color ?? null);

const restrictionsCount = computed(() => mainProfile.value?.ingredients?.length ?? 0);
const hasRestrictions = computed(() => profiles.value.some(p => p.ingredients?.length > 0));

// Somebody who never scanned gets the onboarding block instead of an empty
// history plus an empty carousel: there is only one thing to do next.
const isOnboarding = computed(() => historyState.value === 'empty');
const onboardingVariant = computed(() => hasRestrictions.value ? 'ready-to-scan' : 'no-restrictions');
const restrictionsRoute = computed(() =>
  mainProfile.value ? `/profile/${mainProfile.value.id}/edit` : '/profile'
);

async function loadBrands() {
  try {
    const result = await getBrands();
    if(result && result.data.length > 0) {
      sessionStorage.removeItem('brands');
      sessionStorage.setItem('brands', JSON.stringify(result.data));
    }
  } catch (error) {
    console.error('[HomeView] -> loadBrands(), Error:', error);
  }
}

onMounted(() => {
  localStorage.removeItem('pending_scan_barcode');
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);

  loadHistory();
  loadRecommended();

  if(!sessionStorage.getItem('brands')) {
    loadBrands();
  }
})

onUnmounted(() => unsuscribeToAuthObserver());
</script>

<template>
  <AuthLayout>
    <h1 class="sr-only">Inicio</h1>

    <div class="min-h-full bg-[#F5F5F5] dot-texture-page">
      <HomeIdentityBand :name="displayName" :avatar-color="avatarColor">
        <template #search>
          <HomeSearchRow />
        </template>
      </HomeIdentityBand>

      <div class="px-4 pt-[18px]">
        <HomeOnboardingCard
          v-if="isOnboarding"
          :variant="onboardingVariant"
          :restrictions-count="restrictionsCount"
          :edit-route="restrictionsRoute"
        />

        <template v-else>
          <ScanHistoryCard :scans="scans" :state="historyState" @retry="loadHistory" />

          <div class="mt-[22px]">
            <RecommendedCarousel
              :products="products"
              :profiles="profiles"
              :state="recommendedState"
            />
          </div>
        </template>
      </div>
    </div>
  </AuthLayout>
</template>
