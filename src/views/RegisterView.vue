<script setup>
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import {register} from "../services/auth.js";
import {ref} from "vue";
import { useRouter } from 'vue-router'

const loading = ref(false);
const router = useRouter();

async function handleSubmit(formData) {
  console.log('Registrar usuario', formData)
  loading.value = true;
  try {
    await register({...formData, ...formData.user_data})
    router.push('/')
  } catch (error) {
    console.error({error});
  }

  loading.value = false
}
</script>

<template>
  <StepsContainer @submit="handleSubmit" :steps="['terms', 'all_ingredients', 'new_user_data']" />
</template>