<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {logout, suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";

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
</script>

<template>
  <AuthLayout>
    <h2 class="text-4xl">Mi Perfil</h2>

    <dl>
      <dt class="font-semibold text-xl">Usuario ID:</dt>
      <dd>{{ user.id }}</dd>

      <dt class="font-semibold text-xl">Nombre:</dt>
      <dd>{{ user.name }}</dd>

      <dt class="font-semibold text-xl">Email:</dt>
      <dd>{{ user.email }}</dd>

      <dt class="font-semibold text-xl">Email verificado en:</dt>
      <dd>{{ user.email_verified_at ?? 'Nunca se verificó' }}</dd>

      <dt class="font-semibold text-xl">Rol:</dt>
      <dd>{{ user.role }}</dd>

      <dt class="font-semibold text-xl">Última vez actualizado:</dt>
      <dd>{{ user.updated_at }}</dd>

      <dt class="font-semibold text-xl">Fecha de creación:</dt>
      <dd>{{ user.created_at}}</dd>
    </dl>

    <h2 class="text-4xl">Tus perfiles</h2>
    <ul>
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
    </ul>

    <button @click="handleLogUser" class="w-full py-2 bg-green-600 hover:bg-green-500 transition rounded mt-8 text-white cursor-pointer">Log Usuario</button>

    <!-- Definitely not final styling, just something temporal  -->
    <button @click="handleLogout" class="w-full py-2 bg-rose-600 hover:bg-rose-500 transition rounded mt-8 text-white cursor-pointer">Cerrar sesión</button>
  </AuthLayout>
</template>