<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { A11y } from 'swiper/modules'
import 'swiper/css'
import RecommendedProductCard from './RecommendedProductCard.vue'
import RecommendedSkeleton from './RecommendedSkeleton.vue'
import RecommendedEmptyState from './RecommendedEmptyState.vue'

const props = defineProps({
  title: { type: String, default: 'Recomendados para vos' },
  products: { type: Array, default: () => [] },
  profiles: { type: Array, default: () => [] },
  emptyState: { type: Object, default: () => ({}) },
  state: {
    type: String,
    default: 'loading',
    validator: (value) => ['loading', 'empty', 'ready'].includes(value),
  },
})

const modules = [A11y]
const swiper = ref(null)

function onSwiper(instance) {
  swiper.value = instance
}
</script>

<template>
  <section>
    <div class="flex items-center gap-[10px] px-[2px] pb-3">
      <h2 class="flex-1 font-roboto-slab font-semibold text-[16px] text-ophi-green">
        {{ title }}
      </h2>

      <template v-if="state === 'ready'">
        <button
          type="button"
          aria-label="Anterior"
          class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-card border-[1.5px] border-[#CFE7DD] bg-white text-[12px] text-ophi-green cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
          @click="swiper?.slidePrev()"
        >
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          class="grid place-items-center shrink-0 w-[34px] h-[34px] rounded-card border-[1.5px] border-[#CFE7DD] bg-white text-[12px] text-ophi-green cursor-pointer active:bg-ophi-green-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ophi-green"
          @click="swiper?.slideNext()"
        >
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </template>
    </div>

    <RecommendedSkeleton v-if="state === 'loading'" />

    <RecommendedEmptyState v-else-if="state === 'empty'" v-bind="emptyState" />

    <Swiper
      v-else
      :modules="modules"
      slides-per-view="auto"
      :space-between="12"
      :centered-slides="true"
      class="!-mx-4"
      @swiper="onSwiper"
    >
      <SwiperSlide
        v-for="product of products"
        :key="product.id"
        v-slot="{ isActive }"
        class="!w-[250px] flex items-center h-[272px]"
      >
        <RecommendedProductCard :product="product" :profiles="profiles" :active="isActive" />
      </SwiperSlide>
    </Swiper>
  </section>
</template>
