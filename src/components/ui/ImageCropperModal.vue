<script setup>
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps({
  imageSrc: { type: String, required: true },
});

const emit = defineEmits(['confirm', 'cancel']);

const dialog = useTemplateRef('dialog');
const imgRef = useTemplateRef('imgRef');
let cropper = null;

onMounted(() => {
  dialog.value.showModal();
  cropper = new Cropper(imgRef.value, {
    aspectRatio: NaN,
    viewMode: 1,
    autoCropArea: 0.9,
    movable: true,
    zoomable: true,
    rotatable: true,
    scalable: false,
  });
});

onBeforeUnmount(() => {
  cropper?.destroy();
  cropper = null;
});

function confirm() {
  cropper.getCroppedCanvas({ maxWidth: 2048, maxHeight: 2048 }).toBlob(
    (blob) => {
      const file = new File([blob], 'ingredientes-recortado.jpg', { type: 'image/jpeg' });
      emit('confirm', file);
    },
    'image/jpeg',
    0.92,
  );
}

function rotate(deg) {
  cropper?.rotate(deg);
}

function cancel() {
  emit('cancel');
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-hidden bg-gray-900 p-0 sm:m-auto sm:h-[min(760px,calc(100dvh-2rem))] sm:w-full sm:max-w-lg sm:rounded-2xl sm:shadow-xl"
    @close="cancel"
  >
    <div class="flex h-full min-h-0 flex-col">
      <!-- Header -->
      <div class="flex shrink-0 items-center justify-between px-4 py-3 bg-gray-900">
        <p class="text-white font-semibold text-sm">Recortá la foto</p>
        <button
          type="button"
          class="text-gray-400 hover:text-white p-1"
          @click="cancel"
          aria-label="Cancelar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Cropper area -->
      <div class="cropper-frame min-h-0 flex-1 overflow-hidden bg-black">
        <img
          ref="imgRef"
          :src="imageSrc"
          alt="Imagen a recortar"
          class="block h-full max-h-full w-full object-contain"
        />
      </div>

      <!-- Hint -->
      <p class="shrink-0 text-xs text-gray-400 text-center px-4 pt-3 pb-1">
        Ajustá el recuadro para incluir solo el listado de ingredientes.
      </p>

      <!-- Rotate -->
      <div class="shrink-0 flex justify-center gap-4 px-4 pb-2">
        <button type="button" class="text-gray-400 hover:text-white flex items-center gap-1 text-sm" @click="rotate(-90)" aria-label="Rotar a la izquierda">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          90°
        </button>
        <button type="button" class="text-gray-400 hover:text-white flex items-center gap-1 text-sm" @click="rotate(90)" aria-label="Rotar a la derecha">
          90°
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
          </svg>
        </button>
      </div>

      <!-- Actions -->
      <div class="shrink-0 flex gap-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          class="flex-1 py-2.5 rounded-full border border-gray-600 text-gray-300 text-sm"
          @click="cancel"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="flex-1 py-2.5 rounded-full bg-[#00A878] text-white font-semibold text-sm"
          @click="confirm"
        >
          Recortar y continuar
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.75);
}

.cropper-frame :deep(.cropper-container) {
  max-height: 100%;
  max-width: 100%;
}
</style>
