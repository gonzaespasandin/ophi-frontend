<script setup>
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import { deleteProfileFromAuthUser, logout, suscribeToAuthObserver, updateProfileFromAuthUser } from "../services/auth.js";
import ProfileToast from "../components/ui/ProfileToast.vue";
import AppLoading from "../components/loadings/AppLoading.vue";
import Error from "../components/ui/Error.vue";
import InfoCard from "../components/ui/InfoCard.vue";
import AvatarColorPicker from "../components/profile/AvatarColorPicker.vue";
import EmailChangeForm from "../components/profile/EmailChangeForm.vue";
import NewsletterToggle from "../components/profile/NewsletterToggle.vue";
import ProfileIdentityBand from "../components/profile/ProfileIdentityBand.vue";
import ProfileTabs from "../components/profile/ProfileTabs.vue";
import RestrictionsCard from "../components/profile/RestrictionsCard.vue";
import AccountCardSkeleton from "../components/profile/AccountCardSkeleton.vue";
import ProfileCardSkeleton from "../components/profile/ProfileCardSkeleton.vue";
import AccountErrorState from "../components/profile/AccountErrorState.vue";
import AccountActions from "../components/profile/AccountActions.vue";
import FamilyProfileCard from "../components/profile/FamilyProfileCard.vue";
import FamilyQuotaCard from "../components/profile/FamilyQuotaCard.vue";
import FamilyCtaCard from "../components/profile/FamilyCtaCard.vue";
import DeleteProfileDialogContent from "../components/profile/DeleteProfileDialogContent.vue";
import { useAccount } from "../composables/useAccount.js";
import { useToast } from "../composables/useToast.js";

let unsubscribeToAuthObserver = () => {}

const router = useRouter();
const dialog = useTemplateRef('dialog')
const dialogMode = ref(null)
const deleteProfile = ref({})
const user = ref({});
const activeTab = ref('perfil');
const loading = ref(false);
const serverError = ref(false);

const { toast, showToast, hideToast } = useToast();

const myProfile = computed(() => user.value?.profiles?.filter(p => p.is_main) ?? []);
const otherProfiles = computed(() => user.value?.profiles?.filter(p => !p.is_main) ?? []);
const isPremium = computed(() => user.value?.subscription?.plan?.plan === 'premium');
const bandName = computed(() => myProfile.value[0]?.name || user.value?.name || '');
const bandFallbackEmail = computed(() => user.value?.email ?? '');
const bandAvatarColor = computed(() => myProfile.value[0]?.avatar_color ?? '#005B8E');

const MAX_PROFILES = 10;
const MAX_FAMILY_SLOTS = MAX_PROFILES - 1;

const familyCount = computed(() => otherProfiles.value.length);
const remainingSlots = computed(() => Math.max(MAX_PROFILES - (user.value?.profiles?.length ?? 0), 0));
const familyCta = computed(() => {
  if (!isPremium.value) return 'upgrade';
  if (familyCount.value === 0) return 'empty';
  return 'quota';
});

const { account, error: accountError, loadAccount, changeEmail, toggleNewsletter } = useAccount();

const avatarColor = ref(null);
const profileName = ref('');
const profileNameError = ref(null);
const emailError = ref(null);
const newsletterLoading = ref(false);
const emailChangeLoading = ref(false);
const savingProfile = ref(false);
const accountLoading = ref(true);
const accountLoadFailed = ref(false);

const accountState = computed(() => {
  if (accountLoading.value) return 'loading';
  if (accountLoadFailed.value) return 'error';
  return 'ready';
});

const profileState = computed(() => {
  if (user.value?.profiles === null || user.value?.profiles === undefined) return 'loading';
  return myProfile.value.length > 0 ? 'ready' : 'none';
});

async function initAccount() {
  accountLoading.value = true;

  try {
    await loadAccount();
    accountLoadFailed.value = accountError.value !== null;
  } finally {
    accountLoading.value = false;
  }
}

function handleRetryAccount() {
  accountLoadFailed.value = false;
  initAccount();
}

onMounted(() => {
  localStorage.removeItem('pending_scan_barcode');
  unsubscribeToAuthObserver = suscribeToAuthObserver((state) => user.value = state);

  initAccount();

  if (myProfile.value.length > 0) {
    avatarColor.value = myProfile.value[0].avatar_color ?? null;
    profileName.value = myProfile.value[0].name;
  }

  consumeHandedOffAlert();
})

onUnmounted(() => {
  unsubscribeToAuthObserver();
});

function consumeHandedOffAlert() {
  const stored = sessionStorage.getItem('alert');
  if (!stored) return;

  sessionStorage.removeItem('alert');

  const { message, type } = JSON.parse(stored);
  if (message) showToast(message, type ?? 'success');
}

function handleConfirmLogout() {
  dialogMode.value = 'logout';
  dialog.value.showModal();
}

function handleLogout() {
  dialog.value.close();
  logout();
  router.push("/login");
}

function handleConfirmDeleteProfile(profile) {
  dialogMode.value = 'delete';
  deleteProfile.value = profile;
  dialog.value.showModal();
}

async function handleDeleteProfile() {
  loading.value = true;
  try {
    const result = await deleteProfileFromAuthUser(deleteProfile.value.id);
    dialog.value.close();
    showToast(result, 'success');
  } catch (error) {
    console.log('[ProvileView] -> [handleDeleteProfile], Error: ', error);
    serverError.value = 'Ocurrió un error al eliminar el perfil';
  } finally {
    loading.value = false;
  }
}

async function handleSaveProfile() {
  profileNameError.value = null;
  const trimmedName = profileName.value.trim();

  if (!trimmedName) {
    profileNameError.value = 'El nombre es obligatorio';
    return;
  }

  savingProfile.value = true;
  try {
    await updateProfileFromAuthUser({
      id: myProfile.value[0].id,
      name: trimmedName,
      avatar_color: avatarColor.value,
    });
    profileName.value = trimmedName;
    showToast('Perfil guardado', 'success');
  } catch (error) {
    showToast('No pudimos guardar los cambios', 'error');
  } finally {
    savingProfile.value = false;
  }
}

async function handleChangeEmail({ newEmail, currentPassword }) {
  emailError.value = null;
  emailChangeLoading.value = true;

  try {
    const message = await changeEmail({ newEmail, currentPassword });
    showToast(message, 'success');
  } catch (error) {
    if (error?.response?.status === 429) {
      emailError.value = { field: 'rate-limit' };
    } else {
      const validationErrors = error?.response?.data?.errors;
      if (validationErrors?.current_password) {
        emailError.value = { field: 'password', message: validationErrors.current_password[0] };
      } else if (validationErrors?.new_email) {
        emailError.value = { field: 'email', message: validationErrors.new_email[0] };
      } else {
        emailError.value = accountError.value ?? 'No pudimos procesar el cambio de email';
      }
    }
  } finally {
    emailChangeLoading.value = false;
  }
}

async function handleToggleNewsletter(subscribed) {
  newsletterLoading.value = true;

  try {
    const message = await toggleNewsletter(subscribed);
    showToast(message, 'success');
  } catch (error) {
    showToast('No pudimos actualizar tu preferencia de novedades', 'error');
  } finally {
    newsletterLoading.value = false;
  }
}
</script>

<template>
  <AuthLayout>
    <h1 class="sr-only">Perfil de usuario</h1>

    <Teleport to="body">
      <div
        id="toast-region-success"
        role="status"
        aria-live="polite"
        class="fixed inset-x-0 bottom-[calc(var(--app-bottom-inset)+20px)] z-50 flex justify-center px-4 pointer-events-none"
      >
        <Transition
          enter-active-class="transition duration-200"
          leave-active-class="transition duration-200"
          enter-from-class="opacity-0 translate-y-2"
          leave-to-class="opacity-0 translate-y-2"
        >
          <ProfileToast
            v-if="toast.type === 'success' && toast.message"
            :message="toast.message"
            type="success"
            class="pointer-events-auto w-[min(100%-32px,388px)]"
            @close="hideToast"
          />
        </Transition>
      </div>

      <div
        id="toast-region-error"
        role="alert"
        aria-live="assertive"
        class="fixed inset-x-0 bottom-[calc(var(--app-bottom-inset)+20px)] z-50 flex justify-center px-4 pointer-events-none"
      >
        <Transition
          enter-active-class="transition duration-200"
          leave-active-class="transition duration-200"
          enter-from-class="opacity-0 translate-y-2"
          leave-to-class="opacity-0 translate-y-2"
        >
          <ProfileToast
            v-if="toast.type === 'error' && toast.message"
            :message="toast.message"
            type="error"
            class="pointer-events-auto w-[min(100%-32px,388px)]"
            @close="hideToast"
          />
        </Transition>
      </div>
    </Teleport>

    <Teleport to="#modal-root">
      <dialog
        ref="dialog"
        aria-labelledby="profile-dialog-title"
        class="m-auto w-[min(100%-32px,388px)] rounded-card overflow-hidden open:grid"
      >
        <template v-if="loading">
          <div class="flex justify-center items-center min-h-[250px] p-4">
            <AppLoading/>
          </div>
        </template>
        <template v-else-if="serverError">
          <div class="p-4">
            <div class="flex justify-end text-2xl p-3">
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            </div>
            <Error :errorMessage="serverError"></Error>
            <button class="action-btn mt-4" type="button" @click="dialog.close()">Aceptar</button>
          </div>
        </template>
        <template v-else-if="dialogMode === 'logout'">
          <div class="p-4">
            <p id="profile-dialog-title" class="text-lg font-semibold">¿Querés cerrar sesión?</p>
            <p class="mb-4 text-gray-500">Vas a volver a la pantalla de ingreso.</p>

            <div class="grid grid-cols-2 gap-4">
              <button
                id="cancel-logout"
                class="h-11 px-4 rounded-card border border-gray-300 font-semibold text-gray-700 cursor-pointer"
                type="button"
                @click="dialog.close()"
              >Cancelar</button>
              <button
                id="confirm-logout"
                class="h-11 px-4 rounded-card bg-ophi-danger font-semibold text-white cursor-pointer"
                type="button"
                @click="handleLogout"
              >Cerrar sesión</button>
            </div>
          </div>
        </template>
        <template v-else-if="dialogMode === 'delete'">
          <DeleteProfileDialogContent
            :name="deleteProfile.name"
            :avatar-color="deleteProfile.avatar_color"
            @cancel="dialog.close()"
            @confirm="handleDeleteProfile"
          />
        </template>
      </dialog>
    </Teleport>

    <p id="account-status-region" class="sr-only" role="status" aria-live="polite">{{ accountState === 'loading' ? 'Cargando tu cuenta' : '' }}</p>

    <div class="min-h-full bg-[#F5F5F5] dot-texture-page pb-8">
      <ProfileIdentityBand
        :name="bandName"
        :email="account.email"
        :fallback-email="bandFallbackEmail"
        :avatar-color="bandAvatarColor"
        :is-premium="isPremium"
      >
        <template #tabs>
          <ProfileTabs v-model="activeTab" />
        </template>
      </ProfileIdentityBand>

      <div class="px-4">
        <div
          v-if="activeTab === 'perfil'"
          id="profile-panel-perfil"
          role="tabpanel"
          aria-labelledby="profile-tab-perfil"
          tabindex="0"
          class="grid gap-4 pt-5"
        >
          <InfoCard v-if="profileState === 'loading'" icon="fa-solid fa-id-card" title="Datos del perfil" aria-busy="true">
            <ProfileCardSkeleton />
          </InfoCard>

          <template v-else-if="profileState === 'ready'">
            <InfoCard icon="fa-solid fa-id-card" title="Datos del perfil">
              <form id="profile-form" class="p-4" @submit.prevent="handleSaveProfile">
                <label for="profile-name" class="block mb-[6px] font-medium text-[13px] text-gray-700">
                  Nombre del perfil
                </label>
                <input
                  id="profile-name"
                  v-model="profileName"
                  type="text"
                  required
                  class="w-full h-11 px-3 rounded-card border-[1.5px] border-gray-300 text-[15px] text-gray-900 focus:outline-2 focus:outline-offset-1 focus:outline-ophi-blue focus:border-ophi-blue"
                  :aria-invalid="profileNameError ? 'true' : undefined"
                  :aria-describedby="profileNameError ? 'profile-name-error' : undefined"
                />
                <p
                  v-if="profileNameError"
                  id="profile-name-error"
                  role="alert"
                  class="mt-[7px] flex items-center gap-[6px] font-medium text-[12.5px] text-ophi-danger"
                >
                  <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                  {{ profileNameError }}
                </p>

                <div class="mt-[18px]">
                  <AvatarColorPicker v-model="avatarColor" />
                </div>

                <button
                  class="w-full h-11 mt-[18px] rounded-card bg-ophi-green hover:bg-ophi-green-dark active:bg-ophi-green-dark active:scale-[.98] font-semibold text-[14px] text-white cursor-pointer transition disabled:opacity-60"
                  type="submit"
                  :disabled="savingProfile"
                  :aria-busy="savingProfile"
                >
                  {{ savingProfile ? 'Guardando...' : 'Guardar' }}
                </button>
              </form>
            </InfoCard>

            <RestrictionsCard
              :profile-id="myProfile[0].id"
              :ingredients="myProfile[0].ingredients"
            />
          </template>

          <InfoCard
            id="account-card"
            icon="fa-solid fa-gear"
            title="Cuenta"
            :aria-busy="accountState === 'loading' ? 'true' : undefined"
          >
            <AccountCardSkeleton v-if="accountState === 'loading'" />

            <div v-else-if="accountState === 'error'" class="p-4 border-b border-ophi-border">
              <AccountErrorState @retry="handleRetryAccount" />
            </div>

            <template v-else>
              <EmailChangeForm
                :account="account"
                :loading="emailChangeLoading"
                :error="emailError"
                @submit="handleChangeEmail"
              />

              <NewsletterToggle
                :subscribed="account.newsletter_subscribed"
                :loading="newsletterLoading"
                @change="handleToggleNewsletter"
              />
            </template>

            <AccountActions @logout="handleConfirmLogout" />
          </InfoCard>
        </div>

        <div
          v-else-if="activeTab === 'familiar'"
          id="profile-panel-familiar"
          role="tabpanel"
          aria-labelledby="profile-tab-familiar"
          tabindex="0"
          class="pt-5"
        >
          <div class="flex items-center justify-between mb-[10px]">
            <h2 class="font-roboto-slab font-semibold text-[13px] tracking-[.05em] uppercase text-ophi-blue">
              Perfiles del hogar
            </h2>
            <span
              id="family-counter"
              class="px-[9px] py-[5px] rounded-card bg-ophi-blue-soft font-semibold text-[11px] text-ophi-blue"
            >{{ familyCount }} / {{ MAX_FAMILY_SLOTS }}</span>
          </div>

          <ul v-if="familyCount > 0" class="flex flex-col gap-3">
            <FamilyProfileCard
              v-for="profile of otherProfiles"
              :key="profile.id"
              :profile="profile"
              @delete="handleConfirmDeleteProfile"
            />
          </ul>

          <FamilyCtaCard v-if="familyCta !== 'quota'" :variant="familyCta" />
          <FamilyQuotaCard v-else :remaining-slots="remainingSlots" :max-slots="MAX_FAMILY_SLOTS" />
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
