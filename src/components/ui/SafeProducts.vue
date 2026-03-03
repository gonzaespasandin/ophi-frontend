<script setup>
import { ref, onMounted } from "vue";
import { getSafeProducts } from "../../services/product.js";
import {Swiper, SwiperSlide} from "swiper/vue";
import {A11y, Virtual} from "swiper/modules";
import AppLoading from "../loadings/AppLoading.vue";

const products = ref([]);
const loading = ref(false);
const modules = [A11y, Virtual];

onMounted(async function () {
  loading.value = true

  try {
    products.value = await getSafeProducts();
  } catch (e) {
    console.error({ERROR: e})
  }

  loading.value = false;
})
</script>

<template>
    <div>
      <AppLoading class="mx-auto my-8" v-show="loading" />
      <swiper
          v-if="products.length"
          :modules="modules"
          :slides-per-view="1.5"
          :space-between="50"
          :centered-slides="true"
          :initial-slide="products.length / 2"
          :virtual="true"
      >
        <template v-for="(product, index) of products" :key="index">
          <swiper-slide :virtual-index="index" v-slot="{ isActive }" class="py-4">
            <div :class="isActive ? 'min-h-[150px] recomended-card-active' : 'min-h-[100px] mt-2 recomended-card-inactive'" class="flex bg-[#005B8E] p-5 rounded-[11px] flex-col justify-center text-white transition-all ">
              <h3 class="text-sm text-center font-regular text-white"><RouterLink :to="'/product/' + product.name + '/' + product.brand.name">{{ product.name }}</RouterLink></h3>
              <div class="bg-[#f5f5f5] text-[#005B8E] p-1 mt-1 rounded-[11px]">
                <span class="block text-center text-sm">Apto para todos</span>
                <p class="text-lg font-bold text-center">RECOMENDADO</p>
              </div>
            </div>
          </swiper-slide>
        </template>
      </swiper>
    </div>
</template>