<script setup>
</script>

<template>
  <div class="rounded-[11px] max-h-[400px] overflow-auto">
    <div>
      <h2>Términos y Condiciones</h2>
      <p>Última actualización: 18/02/2026</p>
    </div>

    <section>
      <h3>Identificación del servicio</h3>

      <p>
        <span class="font-bold">ophi</span> es una aplicación móvil que permite a los
        usuarios registrar alergias, intolerancias o dietas especiales y escanear códigos
        de barras de productos alimenticios para recibir información orientativa sobre
        su posible aptitud de consumo.
      </p>

      <p>La aplicación es desarrollada con fines académicos y simulados.</p>
    </section>

    <section>
      <h3>Aceptación de los términos</h3>

      <p>
        Al registrarse y utilizar la aplicación, el usuario acepta plenamente estos
        Términos y Condiciones.<br />Si no está de acuerdo, deberá abstenerse de
        utilizar la app.
      </p>
    </section>

    <section>
      <h3>Naturaleza informativa del servicio</h3>
      <p>
        El uso de la aplicación no reemplaza la consulta con profesionales médicos,
        nutricionistas u otros especialistas de la salud.
      </p>

      <p>La información proporcionada:</p>
      <ul>
        <li>Tiene carácter orientativo e informativo</li>
        <li>No constituye diagnóstico médico</li>
        <li>No representa recomendación médica personalizada</li>
      </ul>

      <p>
        El usuario reconoce que la decisión final sobre el consumo de un producto es
        exclusivamente su responsabilidad.
      </p>
    </section>

    <section>
      <h3>Registro de usuario</h3>

      <p>Para utilizar la aplicación es obligatorio crear una cuenta.</p>

      <p>El usuario es responsable de:</p>
      <ul>
        <li>
          La veracidad de los datos ingresados (por ejemplo, alergias o
          intolerancias)
        </li>
        <li>Mantener su información actualizada</li>
        <li>Proteger la confidencialidad de sus credenciales de acceso</li>
      </ul>

      <p>
        <span class="font-bold">ophi</span> no se responsabiliza por daños derivados de
        información incorrecta proporcionada por el usuario.
      </p>
    </section>

    <section>
      <h3>Suscripción Premium</h3>

      <p>La aplicación ofrece un único plan de suscripción premium.</p>

      <p>La suscripción:</p>
      <ul>
        <li>Es de renovación automática (salvo cancelación)</li>
        <li>Permite acceder a funcionalidades adicionales dentro de la app</li>
        <li>No incluye venta de productos físicos</li>
      </ul>

      <p>No se ofrecen garantías de resultados específicos.</p>
    </section>

    <section>
      <h3>Modificaciones del servicio</h3>

      <p><span class="font-bold">ophi</span> se reserva el derecho de:</p>
      <ul>
        <li>Modificar funcionalidades</li>
        <li>Actualizar información</li>
        <li>Cambiar características del servicio</li>
        <li>Interrumpir temporalmente el acceso</li>
      </ul>

      <p>Estas modificaciones podrían realizarse sin previo aviso.</p>
    </section>

    <section>
      <h3>Propiedad intelectual</h3>

      <p>
        Todo el contenido de la aplicación (nombre, diseño, interfaz, textos,
        código, funcionalidades y marca <span class="font-bold">ophi</span>) es
        propiedad de sus desarrolladores.
      </p>

      <p>Queda prohibido:</p>
      <ul>
        <li>Copiar o reproducir el contenido</li>
        <li>Realizar ingeniería inversa</li>
        <li>Usar la marca sin autorización</li>
      </ul>
    </section>

    <section>
      <h3>Limitación de responsabilidad</h3>
      <p><span class="font-bold">ophi</span> no garantiza:</p>

      <ul>
        <li>Exactitud absoluta de la información obtenida mediante escaneo</li>
        <li>Actualización permanente de base de datos de productos</li>
        <li>Compatibilidad total con todos los dispositivos</li>
      </ul>

      <p>
        La app no será responsable por daños directos o indirectos derivados del uso
        del servicio.
      </p>
    </section>

    <section>
      <h3>Jurisdicción</h3>

      <p>
        Para cualquier conflicto derivado del uso de la aplicación, se aplicarán las
        leyes de la República Argentina, sometiéndose las partes a la jurisdicción
        de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.
      </p>
    </section>
  </div>
  <!-- OLD TERMS

  <section class="bg-[#333333] p-4 rounded-[11px] overflow-auto">
    <h2 class="text-xl font-semibold">Términos de condiciones y servicios</h2>
    <div class="mt-3">
      <h3>1. Aceptación de Términos</h3>
      <p class="my-2">El uso de la app no reemplaza la consulta
        con profesionales médicos ni nutricionales.La información proporcionada tiene carácter
        orientativo e informativo, y no debe considerarse
        un diagnóstico ni una recomendación médica
        personalizada.</p>
    </div>
    <div class="mt-3">
      <h3>2. Registro y perfil de usuario</h3>
      <div class="mt-2">
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
    </div>
  </section>
  -->
</template>

<style scoped>
section,
div {
  padding: .5rem;
  background-color: #333;
  color: hsl(0, 0%, 100%);

  &:not(:last-child) {
    border-bottom: 1px solid hsl(0 0% 100% / 0.2);
  }
}

section > *:not(:is(h3, :last-child)) {
  padding-block-end: 1rem;
}

h2 {
  font-size: 1.75em;
  font-weight: bold;
}

h2 + p {
  color: hsl(0 0% 100% / 0.6);
}

h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: .5rem;
}

ul {
  padding-inline-start: 2rem;
  list-style: disc outside;
}
</style>
