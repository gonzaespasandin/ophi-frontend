<script setup>
import BottomNavigation from "../components/BottomNavigation.vue";
</script>

<template>
  <div id="container">
    <div id="root-app">
      <slot />
    </div>

    <BottomNavigation />
  </div>
</template>

<style scoped>
#container {
  display: grid;
  height: 100dvh;
  grid-template-rows: 1fr auto;
}

#root-app {
  overflow: auto;
}
</style>