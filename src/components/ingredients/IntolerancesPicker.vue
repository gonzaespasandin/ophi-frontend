<script setup>
import { getListOfIntolerances } from "../../services/ingredients.js";
import OptionsPicker from "./OptionsPicker.vue";

const model = defineModel({ type: Array, default: () => [] });
</script>

<template>
  <OptionsPicker v-model="model" :fetch-options="getListOfIntolerances" label="Intolerancias" />
</template>
