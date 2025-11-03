<script setup>
import {onBeforeMount, onUnmounted, ref} from "vue";
import {useRoute} from 'vue-router'
import {findProductById} from "../services/product.js";
import {suscribeToAuthObserver} from "../services/auth.js";
import AuthLayout from "../layouts/AuthLayout.vue";

const route = useRoute()

const product = ref({})
let ingredients = ref('');

const user = ref({})
let unsuscribeToAuthObserver = () => {}

onBeforeMount(async () => {
  console.log(route.params.id + ' otro id')
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state)
  product.value = await findProductById(route.params.id);

  ingredients = product.value.ingredients.map((ingredient) => ingredient.name).join(', ')
  console.log({EstasViendo: product.value})
  // TODO: Guardar en el historial ¿?
})

onUnmounted(() => unsuscribeToAuthObserver());
</script>

<template>
  <AuthLayout>
    <template v-if="product">
      <h1>{{ product.name }}</h1>

      <h2>Ingredientes</h2>
      <p>{{ ingredients }}</p>

      <h2>Compatibilidad</h2>
      <ul>
        <li v-for="profile of user.profiles">
          <details>
            <summary>{{ profile.name }}: {{ product.compatibility[profile.id].result ?? '' }}</summary>

            <template v-if="!product.compatibility[profile.id].matches.length">
              No hay ningún match de ingredientes
            </template>
            <template v-else>
              {{ product.compatibility[profile.id].matches }}
            </template>
          </details>
        </li>
      </ul>
    </template>
  </AuthLayout>
</template>

<style scoped>

</style>