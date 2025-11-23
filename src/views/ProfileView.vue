<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {deleteProfileFromAuthUser, logout, suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref, useTemplateRef} from "vue";
import {useRouter} from "vue-router";
import SomeUserInfo from "../components/ui/SomeUserInfo.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';

let unsubscribeToAuthObserver = () => {}

const deleteProfile = ref({})
const dialog = useTemplateRef('dialog')
const user = ref({});
const router = useRouter();
const active1 = ref(true);
const active2 = ref(false);
const myProfile = ref([]);
const otherProfiles = ref([]);

onMounted(() => {
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);
  console.log(user.value, ' USERs');

  myProfile.value = user.value.profiles.filter(p => p.name === user.value.name);
  otherProfiles.value = [...user.value.profiles];
  let myProfileIndex = user.value.profiles.findIndex(p => p.name === user.value.name);
  if(myProfileIndex !== -1) {
    otherProfiles.value.splice(myProfileIndex, 1);
  }
})

onUnmounted(() => unsubscribeToAuthObserver());

async function handleLogout() {
  try {
    logout()

    await router.push("/login")
  } catch (error) {
    console.error(error);
  }
}

function handleLogUser() {
  console.log('@log user')
  console.log(user.value)
}


function handleClick(who) {
  if(who === 'Perfil') {
    active2.value = false;
    active1.value = true;
  } else {
    active1.value = false;
    active2.value = true;
  }
}

function handleConfirmDeleteProfile(profile) {
  deleteProfile.value = profile;
  dialog.value.showModal()
}

function handleDeleteProfile() {
  deleteProfileFromAuthUser(deleteProfile.value.id)
  otherProfiles.value = otherProfiles.value.filter(p => p.id !== deleteProfile.value.id)
  dialog.value.close()
}

</script>

<template>
  <AuthLayout>
    <Teleport to="#modal-root">
      <dialog ref="dialog" class="m-auto w-[min(100%-32px,388px)]  p-4 open:grid">
        <p class="text-lg font-semibold">¿Estás seguro de que querés eliminar este perfil?</p>
        <p class="mb-4">Esta acción es irreversible</p>

        <SomeUserInfo :user="{name: deleteProfile.name}" />

        <form action="#" class="grid grid-cols-2 gap-4 mt-4" @submit.prevent="handleDeleteProfile">
          <button class="py-2 px-4 border" type="button" @click="dialog.close()">Cancelar</button>
          <button class="py-2 px-4 bg-red-300">Eliminar</button>
        </form>
      </dialog>
    </Teleport>

    <Top/>
    <Back/>
    <SomeUserInfo :user="user"/>

    <div class=" text-[#686868]" id="togle-perfil">
      <div class="flex mt-10">
        <!-- TODO: Esto no es navegable con teclado (Mi perfil / Perfil familiar) -->
        <!--
          Ya sé que es una aplicación mobile, y a lo mejor nadie va a navegar por la APP con algún
          teclado o usando su voz con comandos ("Tab", "Atrás" o lo q sea). Pero como en el "rol
          de desarrollador" pusimos de crear una APP accesible, lo dejo comentado
          -->
        <div @click="handleClick('Perfil')" class="w-[50%] text-center p-3" :class="active1 ? 'togle-perfil-active' : ''">
          <h3>MI PERFIL</h3>
        </div>
        <div @click="handleClick('Perfiles')" class="w-[50%] text-center p-3" :class="active2 ? 'togle-perfil-active' : ''">
          <h3>PERFIL FAMILIAR</h3>
        </div>
      </div>
      <div class="line border-b-2 border-b-[#005B8E] w-[50%]" :class="active2 ? 'translate-x-full transition-all' : 'translate-x-[0%] transition-all'" id="line"></div>
    </div>

    <div class="p-3">
      <div v-if="active2">
        <ul>
          <li v-for="profile of otherProfiles" :key="profile.id" class="bg-white shadow-md  p-5 flex justify-around rounded-[11px] mb-3">
            <div class="mb-2 w-full flex justify-between items-center">
              <div class="w-[20%]">
                <SomeUserInfo :user="{name: profile.name, email: ''}"></SomeUserInfo>
              </div>
              <div class="flex flex-col mx-3 w-[80%]">
                <div class="w-full flex justify-end gap-4">
                  <button aria-label="Eliminar perfil" @click="handleConfirmDeleteProfile(profile)">
                    <i class="fa-solid fa-trash text-[#005B8E] text-2xl"></i>
                  </button>
                  <RouterLink :to="`/profile/${profile.id}/edit`">
                    <i class="fa-solid fa-pen-to-square text-[#005B8E] text-2xl"></i>
                  </RouterLink>
                </div>
                <div class="mx-3">
                  <span class=" block text-[#005B8E]">Restricción Alimenticia</span>
                  <p class="py-1 rounded-b bg-white/50">
                    {{ profile.ingredients.slice(0, 2).map(i => i.name).join(', ') }}...
                  </p>
                </div>
              </div>
              
            </div>
          </li>
        </ul>
        <div class="mt-4">
          <p v-if="otherProfiles.length === 0" class="text-center block shadow-md  bg-white py-5 rounded-[11px] mb-5">Aún no tenés perfiles familiares</p>
          <RouterLink to="/add-new-profile" class="action-btn"><i class="fa-solid fa-plus text-3xl"></i></RouterLink>
        </div>
      </div>
      <div v-else-if="myProfile.length > 0">
        <div class="bg-white shadow-md  p-5 flex justify-between rounded-[11px]">
          <div>
            <h4 class="text-[#005B8E] font-semibold text-xl mb-2">Restricción alimenticia</h4>
            <p>{{ myProfile[0].ingredients.slice(0, 2).map(i => i.name).join(', ') }}...</p>
          </div>
          <RouterLink :to="`/profile/${myProfile[0].id}/edit`">
            <i class="fa-solid fa-pen-to-square text-[#005B8E] text-2xl"></i>
          </RouterLink>
        </div>
      </div>
    </div>

    <button @click="handleLogUser" class="w-full py-2 bg-green-600 hover:bg-green-500 transition rounded mt-8 text-white cursor-pointer">Log Usuario</button>

    <!-- Definitely not final styling, just something temporal  -->
    <button @click="handleLogout" class="w-full py-2 bg-rose-600 hover:bg-rose-500 transition rounded mt-8 text-white cursor-pointer">Cerrar sesión</button>
  </AuthLayout>
</template>

