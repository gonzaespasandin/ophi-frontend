<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {suscribeToAuthObserver, updateProfileFromAuthUser} from "../services/auth.js";
import IntolerancesPicker from "../components/ingredients/IntolerancesPicker.vue";
import AllergiesPicker from "../components/ingredients/AllergiesPicker.vue";
import SpecialDietsPicker from "../components/ingredients/SpecialDietsPicker.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import SomeUserInfo from "../components/ui/SomeUserInfo.vue";
import Top from "../components/ui/Top.vue";

const route = useRoute();
const router = useRouter();

const loading = ref(false);

const currentSection = ref('intolerances');
const sections = {
  'intolerances': IntolerancesPicker,
  'allergies': AllergiesPicker,
  'diets': SpecialDietsPicker
};

const user = ref({});
const model = ref([]);
const profile = ref({});
let unsubscribeToAuthObserver = () => null

onMounted(() => {
  unsubscribeToAuthObserver = suscribeToAuthObserver(state => user.value = state);
  profile.value = user.value.profiles.find((prof, index) => +prof.id === +route.params.id);
  model.value = profile.value.ingredients.map(ing => ing.id);
})

onUnmounted(() => unsubscribeToAuthObserver())

async function handleSubmit() {
  console.log('@handleSubmit')
  loading.value = true

  try {
    await updateProfileFromAuthUser({
      id: profile.value.id,
      ingredients: model.value
    })
    await router.push('/profile')
  } catch (error) {
    console.log('[ProfileEditView.vue handleSubmit()] Error updating user profile', error)
  }

  loading.value = false;
}
</script>

<template>
  <AuthLayout>
    <Top/>
    <h1 class="sr-only">Editar perfil: {{profile.name}}</h1>

    <SomeUserInfo
        class="my-8"
        :user="{
          name: profile.name,
          email: user.email
        }"
    />
    <!-- TODO: Editar nombre del perfil y avatar -->

    <form action="#" @submit.prevent="handleSubmit">

      <!-- <p class="bg-pink-200 px-4 py-2">Model: {{ model }}</p> -->

      <div class="grid grid-cols-3 text-center text-black/40 capitalize">
        <label class="border-b-3 border-b-transparent py-2 has-checked:border-b-blue-900 has-focus-visible:ring-1 has-checked:text-blue-900">
          <input class="sr-only" type="radio" name="section" value="intolerances" v-model="currentSection">
          Intolerancias
        </label>

        <label class="border-b-3 border-b-transparent py-2 has-checked:border-b-blue-900 has-focus-visible:ring-1 has-checked:text-blue-900">
          <input class="sr-only" type="radio" name="section" value="allergies" v-model="currentSection">
          Alergias
        </label>

        <label class="border-b-3 border-b-transparent py-2 has-checked:border-b-blue-900 has-focus-visible:ring-1 has-checked:text-blue-900">
          <input class="sr-only" type="radio" name="section" value="diets" v-model="currentSection">
          Dietas
        </label>
      </div>

      <div class="p-4">
        <component
            :is="sections[currentSection]"
            v-model="model"
        />

        <button
            class="action-btn mt-4 w-full"
            :disabled="loading"
        >Guardar cambios</button>
      </div>
    </form>

    <button
        class="py-2 w-full my-4 border"
        @click="console.log(profile)"
    >Log Profile</button>
  </AuthLayout>
</template>