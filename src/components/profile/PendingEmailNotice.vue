<script setup>
const props = defineProps({
  email: { type: String, required: true },
})
</script>

<template>
  <div
    role="status"
    class="flex gap-[11px] p-[14px] rounded-card bg-[#F8FAFB] border-[1.5px] border-[#B9D2E0]"
  >
    <p
      class="grid place-items-center shrink-0 w-[30px] h-[30px] rounded-full bg-ophi-blue-soft text-ophi-blue text-[13px]"
    >
      <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
    </p>

    <div class="min-w-0">
      <h4 class="mb-[3px] font-semibold text-[13.5px] text-ophi-blue">Confirmá tu nuevo email</h4>
      <p class="mb-2 text-[12.5px] leading-[1.5] text-[#4B5563]">
        Te enviamos un mail a <strong class="font-semibold text-gray-900 break-all">{{ props.email }}</strong>.
        Hasta que lo confirmes, seguís ingresando con tu email actual.
      </p>

      <button
        type="button"
        disabled
        aria-disabled="true"
        class="h-11 px-3 rounded-card border-[1.5px] border-[#D1D5DB] font-semibold text-[12.5px] text-[#6B7280] cursor-default"
      >
        Reenviar link
      </button>
      <p class="mt-[6px] text-[12px] text-[#6B7280]">Próximamente vas a poder reenviarlo</p>
    </div>
  </div>
</template>
