<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {logout, suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";
import SomeUserInfo from "../components/ui/SomeUserInfo.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';

let unsuscribeToAuthObserver = () => {}

const user = ref({});
const router = useRouter();

onMounted(() => {
  unsuscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);
  console.log(user.value, ' USERs') 
})

onUnmounted(() => unsuscribeToAuthObserver());

async function handleLogout() {
  try {
    await logout()

    router.push("/login")
  } catch (error) {
    console.error(error);
  }
}

function handleLogUser() {
  console.log('@log user')
  console.log(user.value)
}


</script>

<template>
  <AuthLayout>
    <Top/>
    <Back/>
    <SomeUserInfo :user="user"/>

    <div>
      <h3 class="py-1 px-3">Tus perfiles</h3>
      <ul class="">
        <li v-for="profile of user.profiles" :key="profile.id">
          <details class="mb-2">
            <summary class="bg-white mx-3 px-2 py-1 rounded-t">
              {{ profile.name }}
            </summary>

            <ul class="px-2 mx-3 py-2 rounded-b bg-white/50 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <li v-for="ingredient in profile.ingredients" :key="ingredient.id" class="flex items-start gap-1">
                <span class="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#009160]"></span>
                <span>{{ ingredient.name }}</span>
              </li>
            </ul>
          </details>
        </li>
      </ul>

      <RouterLink to="/add-new-profile" class="mt-4 block w-fit mx-auto p-2.5 rounded-full bg-[#009160] text-white font-semibold text-center">Agregar nuevo perfil</RouterLink>
    </div>


    <button @click="handleLogUser" class="w-full py-2 bg-green-600 hover:bg-green-500 transition rounded mt-8 text-white cursor-pointer">Log Usuario</button>

    <!-- Definitely not final styling, just something temporal  -->
    <button @click="handleLogout" class="w-full py-2 bg-rose-600 hover:bg-rose-500 transition rounded mt-8 text-white cursor-pointer">Cerrar sesión</button>
  </AuthLayout>
</template>