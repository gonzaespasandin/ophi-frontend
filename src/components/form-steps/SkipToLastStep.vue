<script setup>
import AuthButton from "../auth/AuthButton.vue";

const emit = defineEmits(['next', 'previous', 'golast'])
</script>

<template>
  <div class="flex flex-col flex-1 step-in">
    <div class="flex-1 flex flex-col justify-center pt-2.5 pb-6 text-center">
      <span class="grid place-items-center w-[66px] h-[66px] mx-auto mb-[18px] rounded-[18px] bg-white/15 border border-white/30 text-[27px] text-white">
        <i class="fa-solid fa-list-check" aria-hidden="true"></i>
      </span>

      <h2 class="mb-2.5 font-roboto-slab font-bold text-[23px]/[1.25] text-white">
        ¿Cargamos tu perfil<br>alimenticio ahora?
      </h2>

      <p class="mx-auto max-w-[290px] text-[13.5px]/[1.6] text-white/85">
        Son tres pantallas de tildar opciones: intolerancias, alergias y dietas.
        <b class="font-semibold text-white">Sin esto no podemos darte veredictos</b>, pero podés
        hacerlo más tarde desde tu perfil.
      </p>
    </div>

    <AuthButton icon="fa-arrow-right" @click="emit('next')">Sí, lo cargo ahora</AuthButton>

    <AuthButton variant="secondary" class="mt-[11px]" @click="emit('golast')">
      No, lo completo después
    </AuthButton>
  </div>
</template>
