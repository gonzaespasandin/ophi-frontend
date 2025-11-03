<script setup>
import { RouterLink } from 'vue-router'
import HomeIcon from "./icons/HomeIcon.vue"
import ScanBarcodeIcon from "./icons/ScanBarcodeIcon.vue";
import UserIcon from "./icons/UserIcon.vue";
import SearchIcon from "./icons/SearchIcon.vue";
import HistoryIcon from "./icons/HistoryIcon.vue";
</script>

<template>
  <nav>
    <ul class="grid grid-cols-5">
      <li>
        <RouterLink to="/">
          <HomeIcon />
          Inicio
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/search">
          <SearchIcon />
          Buscar
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/scanner">
          <ScanBarcodeIcon />
          Escanear
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/history">
          <HistoryIcon />
          Historial
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/profile">
          <UserIcon />
          Perfil
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>