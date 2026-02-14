<script setup>
import StepsContainer from "../components/form-steps/StepsContainer.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import {ref} from "vue";
import {storeProfile} from "../services/profiles.js";
import {useRouter} from "vue-router";
import {addNewProfileToAuthUser} from "../services/auth.js";
import Top from "../components/ui/Top.vue";

const router = useRouter();

const loading = ref(false);
const formErrors = ref(false);

async function handleSubmit(formData) {
  console.log('Registrando nuevo perfil mético...', formData)
  loading.value = true;

  try {
    const result = await addNewProfileToAuthUser(formData);
    if(result.profile.created_at) {
      sessionStorage.setItem('alert', JSON.stringify({message: result.feedback, type: 'success'}))
      await router.push('/profile')
      
    } else {
      formErrors.value = result;
    }
  } catch (error) {
    console.error({error});
  }

  loading.value = false
}
</script>

<template>
  <AuthLayout>
    <Top/>
    
      <div class="bg-white shadow-md  p-3 m-3 rounded-[11px]">
        <h1 class="text-center text-2xl">Agregar nuevo perfil médico</h1>
      </div>
      <StepsContainer
          :steps="['intolerances', 'allergies', 'diets', 'new_profile']"
          :where="'addNew'"
          :errors="formErrors"
          @submit="handleSubmit"
          class="bg-white shadow-md p-3 m-3 rounded-[11px]"
      />
  </AuthLayout>
</template>

<style scoped></style>