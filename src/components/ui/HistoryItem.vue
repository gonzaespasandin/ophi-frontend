<script setup>
import { ref, computed } from 'vue';
import Alert from './Alert.vue';
import AlertSomeUsers from './AlertSomeUsers.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const isExpanded = ref(false);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getSafeData = (results) => {
  return results.map(result => ({
    isSafe: result.is_safe,
    forWho: result.profile.name,
    unsafeIngredients: result.unsafe_ingredients || []
  }));
};

const isDanger = computed(() => {
  return props.item.results.some(r => !r.is_safe);
});

const toggleResults = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div 
      class="p-4 transition-colors"
      @click="toggleResults"
    >
      <div class="flex items-start justify-between gap-3">

        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-800 truncate">
            {{ item.product.name }}
          </h2>
          <p class="text-sm text-gray-500 mt-1">{{ item.product.brand }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ formatDate(item.scanned_at) }}
          </p>
        </div>

        <div class="flex-shrink-0">
          <i 
            class="fa-solid fa-chevron-down text-gray-400 text-lg transition-transform duration-300"
            :class="{ 'rotate-180': isExpanded }"
          ></i>
        </div>
      </div>
    </div>

    <div 
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="px-4 pb-4 border-t border-gray-200 pt-3">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Resultados:</h3>
        
        <Alert
          v-if="item.results.length === 1"
          :safe="item.results"
        />

        <AlertSomeUsers
          v-else-if="item.results.length > 1"
          :safe="getSafeData(item.results)"
        />
      </div>
    </div>
  </div>
</template>

