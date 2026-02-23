<script setup>
import AuthLayout from "../layouts/AuthLayout.vue";
import {deleteProfileFromAuthUser, logout, suscribeToAuthObserver} from "../services/auth.js";
import {onMounted, onUnmounted, ref, useTemplateRef} from "vue";
import {useRouter} from "vue-router";
import SomeUserInfo from "../components/ui/SomeUserInfo.vue";
import Top from "../components/ui/Top.vue";
import Back from '../components/ui/Back.vue';
import Feedback from "../components/ui/Feedback.vue";
import AppLoading from "../components/loadings/AppLoading.vue";
import Error from "../components/ui/Error.vue";


let unsubscribeToAuthObserver = () => {}

const deleteProfile = ref({})
const dialog = useTemplateRef('dialog')
const user = ref({});
const router = useRouter();
const active1 = ref(true);
const active2 = ref(false);
const myProfile = ref([]);
const otherProfiles = ref([]);
const loadPlan = ref(false);
const loading = ref(false);
const feedback = ref({
  message: null,
  type: null
});

const serverError = ref(false);

onMounted(() => {
  localStorage.removeItem('pending_scan_barcode');
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state, loadPlan.value = true);
  console.log(user.value, ' USERs');

  myProfile.value = user.value.profiles.filter(p => p.name === user.value.name);
  otherProfiles.value = [...user.value.profiles];
  let myProfileIndex = user.value.profiles.findIndex(p => p.name === user.value.name);
  if(myProfileIndex !== -1) {
    otherProfiles.value.splice(myProfileIndex, 1);
  }

  setTimeout(() => feedback.value = sessionStorage.getItem('alert') ? JSON.parse(sessionStorage.getItem('alert')) : {message: null, type: null}, 500);
})

onUnmounted(() => {
  unsubscribeToAuthObserver();
  sessionStorage.removeItem('alert');
});

async function handleLogout() {
  try {
    logout()

    await router.push("/login")
  } catch (error) {
    console.error(error);
  }
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

async function handleDeleteProfile() {
  loading.value = true;
  try {
    const result = await deleteProfileFromAuthUser(deleteProfile.value.id);
    feedback.value = {message: null, type: null};
    otherProfiles.value = otherProfiles.value.filter(p => p.id !==  deleteProfile.value.id)
    dialog.value.close();
    setTimeout(() => feedback.value = {message: result, type: 'success'}, 300);
    setTimeout(() => feedback.value = {message: null, type: null}, 2000);
  } catch (error) {
    console.log('[ProvileView] -> [handleDeleteProfile], Error: ', error);
    serverError.value = 'Ocurrió un error al eliminar el perfil';
  } finally {
    loading.value = false;
  }
}

</script>

<template>
  <AuthLayout>
    <Teleport to="#modal-root">
      <dialog ref="dialog" class="m-auto w-[min(100%-32px,388px)] rounded-[11px] p-4 open:grid">
       <template v-if="loading">
        <div class="flex justify-center items-center min-h-[250px]">
          <AppLoading/>
        </div>
       </template>
       <template v-else>
          <template v-if="serverError">
            <div class="flex justify-end text-2xl p-3">
              <i class="fa-solid fa-xmark"></i>
            </div>
            <Error :errorMessage="serverError"></Error>
            <button class="action-btn mt-4" type="button" @click="dialog.close()">Aceptar</button>
          </template>
          <template v-else>
              <p class="text-lg font-semibold">¿Estás seguro de que querés eliminar este perfil?</p>
              <p class="mb-4">Esta acción es irreversible</p>

              <SomeUserInfo :user="{name: deleteProfile.name}" />

              <form action="#" class="grid grid-cols-2 gap-4 mt-4" @submit.prevent="handleDeleteProfile">
                <button class="py-2 px-4 border rounded-[11px]" type="button" @click="dialog.close()">Cancelar</button>
                <button class="py-2 px-4 bg-red-600 rounded-[11px] text-white">Eliminar</button>
              </form>
          </template>
       </template>
       
      </dialog>
    </Teleport>

    <Top/>
    <!-- <Back/> -->
    <div class="relative" v-if="feedback.message !== null">
      <Feedback :message="feedback.message" :type="feedback.type"/>
    </div>
    <div class="flex justify-between items-start px-3 p-3 bg-white">
      <div v-if="loadPlan">
        <p :class="user.subscription.plan_id === 2 ? 'text-[#005B8E]' : ''">Plan {{ user.subscription.plan.plan }}</p>
        <RouterLink to="/subscriptions" class="text-[#009161] underline text-[14px]">Cambiar plan</RouterLink>
      </div>
      <button @click="handleLogout" id="closeSession" class="text-1xl">Cerrar sesión<i class="fa-solid fa-arrow-right-from-bracket ps-2"></i></button>
    </div>
    <SomeUserInfo class="mt-8" :user="user"/>

    <div class=" text-[#686868]" id="togle-perfil">
      <div class="flex mt-10">
        <button @click="handleClick('Perfil')" class="w-[50%] text-center p-3" :class="active1 ? 'togle-perfil-active' : ''">
          <h3>MI PERFIL</h3>
        </button>
        <button @click="handleClick('Perfiles')" class="w-[50%] text-center p-3" :class="active2 ? 'togle-perfil-active' : ''">
          <h3>PERFIL FAMILIAR</h3>
        </button>
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
        <div class="mt-4" v-if="user.subscription.plan_id !== 1 && user.profiles.length < 10">
          <RouterLink to="/add-new-profile" class="action-btn"><i class="fa-solid fa-plus text-xl mr-2"></i>Agregar perfil</RouterLink>
          <p v-if="otherProfiles.length === 0" class="text-center block shadow-md bg-white py-5 rounded-[11px] mt-5">Aún no tenés perfiles familiares</p>
        </div>
        <div class="mt-4" v-if="user.subscription.plan_id !== 1 && user.profiles.length === 10">
          <p class="text-center block shadow-md bg-white py-5 rounded-[11px] mt-5">Llegaste al máximo de perfiles</p>
        </div>
        <div class="mt-4" v-if="user.subscription.plan_id === 1">
          <div class="text-black px-6 py-3 rounded-lg shadow-md bg-white">
            <p class=" text-center">¡Hacete <span class="font-semibold">premium</span> para desbloquear  <span class="font-semibold">más perfiles!</span></p>
             <RouterLink to="/subscriptions" class="action-btn text-white mt-3">Hacerme premuim</RouterLink>
          </div>
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
    <div class="p-3">
      <!--<button @click="handleLogUser" class="w-full py-2 bg-green-600 hover:bg-green-500 transition rounded mt-8 text-white cursor-pointer">Log Usuario</button>-->
    </div>
    
  </AuthLayout>
</template>

<style scoped>
  #closeSession {
    cursor: pointer;
    i {
      transition: all .2s ease-out;
    }
  }
  #closeSession:hover {
    
    i {
      transform: translateX(3px);
    }
  }
</style>