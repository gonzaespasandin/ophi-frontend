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
    rotatable: false,
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

function cancel() {
  emit('cancel');
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-full max-w-lg rounded-2xl shadow-xl overflow-hidden bg-gray-900 p-0"
    @close="cancel"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-gray-900">
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
      <div class="bg-black" style="max-height: 65vh; overflow: hidden;">
        <img
          ref="imgRef"
          :src="imageSrc"
          alt="Imagen a recortar"
          style="display: block; max-width: 100%;"
        />
      </div>

      <!-- Hint -->
      <p class="text-xs text-gray-400 text-center px-4 pt-3 pb-1">
        Ajustá el recuadro para incluir solo el listado de ingredientes.
      </p>

      <!-- Actions -->
      <div class="flex gap-3 px-4 py-4">
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
</style>
