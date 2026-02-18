<script setup>
defineProps({
    barcode: {
        type: String,
        required: true
    }
});

defineEmits(['confirm', 'dismiss']);
</script>

<template>
    <div class="bg-white shadow-md m-3 p-4 rounded-[11px] border border-[#005B8E]">
        <div class="flex items-center gap-3 mb-3">
            <i class="fa-solid fa-barcode text-2xl text-[#005B8E]"></i>
            <p class="font-semibold text-[#005B8E]">¿Este es el producto de este código?</p>
        </div>
        <p class="text-sm text-gray-600 mb-1">
            Escaneaste el código <strong>{{ barcode }}</strong> y no lo encontramos en nuestra base de datos.
        </p>
        <p class="text-sm text-gray-600 mb-4">
            Si este producto corresponde a ese código, ayudanos confirmándolo.
        </p>
        <div class="flex gap-3">
            <button
                type="button"
                class="flex-1 py-2 rounded-full bg-[#00A878] text-white font-semibold text-sm"
                @click="$emit('confirm')"
            >
                <i class="fa-solid fa-check mr-1"></i> Sí, es este
            </button>
            <button
                type="button"
                class="flex-1 py-2 rounded-full border border-gray-300 text-gray-600 font-semibold text-sm"
                @click="$emit('dismiss')"
            >
                <i class="fa-solid fa-xmark mr-1"></i> No es este
            </button>
        </div>
    </div>
</template>