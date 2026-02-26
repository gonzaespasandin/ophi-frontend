<template>
  <div class="min-h-screen bg-[#0b5c8f] flex flex-col">
    <header class="p-6 flex justify-center">
    <img
        src="../assets/img/logo-positivo.png"
        alt="ophi"
        class="h-17 md:h-16 object-contain"
    />
    </header>

    <main class="flex-1 flex flex-col items-center justify-evenly px-6 text-center text-white">
      <h1 class="text-xl md:text-4xl font-bold mb-4">
        Instalá ophi en tu dispositivo
      </h1>

      <p class="max-w-xl mb-8 text-white/90">
        Usá <span class="font-bold">ophi</span> como una app real: más <span class="font-bold">rápido</span>, sin abrir el navegador y con <span class="font-bold">acceso directo</span> desde tu pantalla de inicio.
      </p>

      <div class="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-gray-800">
        <div class="mb-4">
          <h2 class="text-xl font-semibold mb-2">Elegí, escaneá, disfrutá.</h2>
          <p class="text-sm text-gray-600">
            Instalá la app para escanear productos y saber al instante si son aptos para tu consumo.
          </p>
        </div>

        <button
        v-if="status === 'can-install'"
        @click="install"
        class="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
        Instalar OPHI ahora
        </button>

        <!-- ESTADOS -->
        <div
        v-else-if="status === 'installing'"
        class="w-full py-3 rounded-xl bg-green-100 text-green-800 font-semibold text-center"
        >
        Instalando OPHI… por favor esperá
        </div>

        <div
        v-else-if="status === 'installed'"
        class="w-full py-3 rounded-xl bg-blue-100 text-blue-800 font-semibold text-center"
        >
        OPHI ya está instalada en tu dispositivo ✅
        </div>

        <div v-else-if="status === 'manual'" class="text-sm text-gray-600">
        <p class="mb-2 font-medium">¿No aparece el botón de instalar?</p>
        <ul class="list-disc list-inside text-left space-y-1">
            <li>
            En Android / Chrome: tocá el menú ⋮ y elegí <b>“Instalar app”</b> o <b>“Agregar a pantalla de inicio”</b>.
            </li>
            <li>
            En iPhone (Safari): tocá <b>Compartir</b> y luego <b>“Agregar a pantalla de inicio”</b>.
            </li>
        </ul>
        </div>

        <div v-else class="text-sm text-gray-600 text-center">
        Verificando estado de instalación…
        </div>
      </div>
    </main>

    <footer class="p-4 text-center text-white/70 text-sm">
      © {{ new Date().getFullYear() }} ophi · Elegí, Escaneá, Disfrutá.
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const status = ref('checking'); 

let deferredPrompt = null;

// Chequea si está instalada
const checkInstalled = async () => {
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  ) {
    status.value = 'installed';
    return true;
  }

  // 2) Chrome Android: API para apps relacionadas, hay que probar con otros navegadores porque no está nada estandarizado parece
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const related = await navigator.getInstalledRelatedApps();
      if (related && related.length > 0) {
        status.value = 'installed';
        return true;
      }
    } catch (e) {
      console.warn('getInstalledRelatedApps falló:', e);
    }
  }

  return false;
};

onMounted(async () => {
  const alreadyInstalled = await checkInstalled();

  if (!alreadyInstalled) {
    status.value = 'manual';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (status.value !== 'installed') {
      status.value = 'can-install';
    }
  });

  window.addEventListener('appinstalled', async () => {
    status.value = 'installed';
    deferredPrompt = null;
  });
});

const install = async () => {
  if (!deferredPrompt) return;

  status.value = 'installing';

  try {
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;

    if (result && result.outcome === 'accepted') {
      setTimeout(async () => {
        const ok = await checkInstalled();
        if (!ok) {
          status.value = 'installing';
        }
      }, 1000);
    } else {
      status.value = 'can-install';
    }
  } catch (e) {
    console.error('Error al instalar:', e);
    status.value = 'can-install';
  }
};
</script>