<script setup>
import BottomNavigation from "../components/BottomNavigation.vue";

const props = defineProps({
  padded: { type: Boolean, default: true },
});
</script>

<template>
  <div id="container">
    <div id="root-app" :class="{ 'is-bleed': !props.padded }">
      <slot />
    </div>

    <BottomNavigation />
  </div>
</template>

<style scoped>
#container {
  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  height: 100dvh;
  background-color: var(--main-bg);
}

#root-app {
  overflow: auto;
  padding-bottom: var(--app-bottom-inset);
  scroll-padding-bottom: var(--app-bottom-inset);
}

#root-app.is-bleed {
  padding-bottom: 0;
  scroll-padding-bottom: 0;
}
</style>
