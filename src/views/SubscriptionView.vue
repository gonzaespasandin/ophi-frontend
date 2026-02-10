<script setup>
import AuthLayout from '../layouts/AuthLayout.vue'
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { suscribeToAuthObserver } from '../services/auth';
import AppLoading from '../components/loadings/AppLoading.vue';

let unsubscribeToAuthObserver = () => {}
const user = ref({});

const router = useRouter();
const route = useRoute();

const loading = ref(true)

onMounted(() => {
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => {user.value = state, loading.value = false});
}) 

onUnmounted(() => {
  unsubscribeToAuthObserver();
})
</script>


<template>
  <AuthLayout>
    <Top/>
    <Back/>
    <div class="trama" v-if="!loading">
        <h1 class="text-3xl text-center">Planes de ophi</h1>
        <div class="flex flex-col  items-center gap-6 p-6  ">

            <div class="bg-white rounded-[11px] shadow-md w-80 p-6 flex flex-col items-center ">
                <i class="fas fa-user-circle text-4xl text-gray-400 mb-4"></i>
                <h2 class="text-xl font-bold text-gray-800 mb-4">Plan Free</h2>
                
                <ul class="text-gray-600 mb-2 space-y-2">
                    <li><i class="fas fa-user mr-2 text-[#005B8E]"></i>1 solo perfil</li>
                    <li><i class="fas fa-history mr-2 text-[#005B8E]"></i>Historial de escaneos limitado</li>
                    <li><i class="fas fa-wifi mr-2 text-[#005B8E]"></i>Escaneo únicamente con WiFi</li>
                    <li><i class="fas fa-ad mr-2 text-[#005B8E]"></i>Ads</li>
                </ul>

                <p class="text-3xl pb-2">$0</p>

                <button class=" text-white font-semibold px-6 py-2 rounded-[11px]  transition-colors" :class="user.subscription.plan_id === 1 ? 'bg-gray-400' : 'bg-[#009161] hover:bg-[#007a50]'">
                {{ user.subscription.plan_id === 1 ? 'Tu plan actual' : 'Cambiar a free'  }}
                </button>
            </div>

            <!-- Premium Plan -->
            <div class="bg-white rounded-[11px] shadow-md w-80 p-6 flex flex-col items-center  border-2 border-[#009161]">
                <i class="fas fa-star text-4xl text-[#009161] mb-4"></i>
                <h2 class="text-xl font-bold text-gray-800 mb-4">Plan Premium</h2>
                
                <ul class="text-gray-600 mb-2 space-y-2">
                <li><i class="fas fa-users mr-2 text-[#005B8E]"></i>Hasta 10 perfiles</li>
                <li><i class="fas fa-history mr-2 text-[#005B8E]"></i>Historial de escaneo ilimitado</li>
                <li><i class="fas fa-signal-slash mr-2 text-[#005B8E]"></i>Modo sin conexión</li>
                <li><i class="fas fa-ban mr-2 text-[#005B8E]"></i>Sin ads</li>
                </ul>

                <p class="pb-2"><span class="text-3xl">$4999</span> por mes</p>

                <button class="text-white font-semibold px-6 py-2 rounded-[11px] cursor-pointer transition-colors" :class="user.subscription.plan_id === 2 ? 'bg-gray-400' : 'bg-[#009161] hover:bg-[#007a50]'">
                {{ user.subscription.plan_id === 2 ? 'Tu plan actual' : 'Activar premium'  }}
                </button>
            </div>

        </div>
    </div>
    <div v-else class="flex justify-center mt-90">
        <AppLoading/>
    </div>
  </AuthLayout>
</template>

<style scoped>
  .trama {
        background-image: url('../assets/img/tramas/1x/Artboard\ 1test-trama.png');
        background-position: center center;
        background-size: cover;
        background-repeat: no-repeat;
    }
</style>