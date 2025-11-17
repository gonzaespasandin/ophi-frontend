<script setup>
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import {ref} from "vue";
import {storeProfile} from "../services/profiles.js";
import {useRouter} from "vue-router";
import {addNewProfileToAuthUser} from "../services/auth.js";

const router = useRouter();

const loading = ref(false);

async function handleSubmit(formData) {
  console.log('Registrando nuevo perfil mético...', formData)
  loading.value = true;

  try {
    await addNewProfileToAuthUser(formData);
    await router.push('/profile')
  } catch (error) {
    console.error({error});
  }

  loading.value = false
}
</script>

<template>
  <AuthLayout>
    <StepsContainer
        :steps="['intolerances', 'allergies', 'diets', 'new_profile']"
        @submit="handleSubmit"
    />
  </AuthLayout>
</template>

<style scoped></style>