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

console.log(user.value)
</script>

<template>
  <AuthLayout>
    <Top/>
    <Back/>
    <SomeUserInfo :user="user"/>

    <RouterLink to="/">
      <div>
        <h3>{{user}}Restricción alimenticia</h3>
      </div>
    </RouterLink>
    <!-- <ul>
      <li v-for="profile of user.profiles" :key="profile.id" class="border">
        <details>
          <summary>
            <img :src="profile.avatar" :alt="`Avatar de ${profile.name}`">
            {{ profile.name }}
          </summary>

          <ul>
            <li v-for="ingredient of profile.ingredients">
              {{ ingredient.name }}
            </li>
          </ul>
        </details>
      </li>
    </ul> -->


    <button @click="handleLogUser" class="w-full py-2 bg-green-600 hover:bg-green-500 transition rounded mt-8 text-white cursor-pointer">Log Usuario</button>

    <!-- Definitely not final styling, just something temporal  -->
    <button @click="handleLogout" class="w-full py-2 bg-rose-600 hover:bg-rose-500 transition rounded mt-8 text-white cursor-pointer">Cerrar sesión</button>
  </AuthLayout>
</template>