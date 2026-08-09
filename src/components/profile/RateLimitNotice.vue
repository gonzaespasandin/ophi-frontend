<template>
  <div
    role="alert"
    class="flex items-start gap-[11px] p-[14px] rounded-card bg-[#FFFBF5] border-[1.5px] border-[#E6D3B3]"
  >
    <p
      class="grid place-items-center shrink-0 w-[30px] h-[30px] rounded-full bg-[#F5E9D6] text-[#8A5A0B] text-[13px]"
    >
      <i class="fa-solid fa-hourglass-half" aria-hidden="true"></i>
    </p>

    <div class="min-w-0">
      <h4 class="mb-[3px] font-semibold text-[13.5px] text-[#8A5A0B]">Esperá un momento</h4>
      <p class="text-[12.5px] leading-[1.5] text-[#5A4318]">
        Alcanzaste el límite de 6 intentos por minuto. Probá de nuevo en un minuto.
      </p>
    </div>
  </div>
</template>
