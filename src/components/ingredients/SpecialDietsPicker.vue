<script setup>
import { getListOfSpecialDiets } from "../../services/ingredients.js";
import OptionsPicker from "./OptionsPicker.vue";

const model = defineModel({ type: Array, default: () => [] });
</script>

<template>
  <OptionsPicker v-model="model" :fetch-options="getListOfSpecialDiets" label="Dietas especiales" />
</template>
