<script setup>
const model = defineModel()
const emit = defineEmits(['next', 'previous'])
</script>

<template>
  <!-- <button @click.prevent="emit('previous')">Volver</button> -->

  <div class="bg-[#333333] p-2 rounded-[11px] max-h-[20rem] overflow-auto">
    <h2 class="text-2xl font-semibold">Términos de condiciones y servicios</h2>
    <div>
      <h3>1. Aceptación de Términos</h3>
      <p class="my-4">El uso de la app no reemplaza la consulta
      con profesionales médicos ni nutricionales.La información proporcionada tiene carácter
      orientativo e informativo, y no debe considerarse
      un diagnóstico ni una recomendación médica
      personalizada.</p>
    </div>
    <div>
      <h3>2. Registro y perfil de usuario</h3>
      <p>
        Para acceder a ciertas funciones, el usuario deberá
        crear una cuenta y completar su perfil médico. El usuario es responsable de:
      </p>
      <ul>
        <li>
          La veracidad de los datos ingresados (por ejemplo, alergias o intolerancias).
        </li>
        <li>
          Mantener su información actualizada.
        </li>
        <li>
          Proteger la confidencialidad de sus credencialesde acceso
        </li>
      </ul>
    </div>
    <div class="p-1 text-center mt-4 rounded-[11px] bg-[#ffffff] text-[#333333]">
      <label>
        <input type="checkbox" name="terms_and_conditions" v-model="model.terms_and_conditions">
        Acepto los términos de condiciones y servicios
      </label>
    </div>
  </div>

  
  <!-- TODO: Replace this buttons with components -->
  <button
      class="py-2 px-4 w-full bg-blue-900 text-white disabled:bg-gray-700 disabled:opacity-50 not-disabled:cursor-pointer mt-5 action-btn"
      :disabled="!model.terms_and_conditions"
      @click="emit('next')"
  >Siguiente</button>
</template>

<style scoped>

</style>