<template>
  <div class="body">
    <div class="app">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.app {
  background-color: #F5F5F5;
  min-height: 100dvh;
  display: grid;
}

.body {
  width: 100%;
  height: 100dvh;

  background-color: gray;
}

@media(width >= 48rem) {
  .app {
    width: 27rem;
    box-shadow: 0 2px 6px 0 hsla(0, 0%, 0%, 0.2);

    overflow-y: auto;
  }

  .body {
    display: grid;
    place-content: center;

    background-color: #eff3f6;
  }
}
</style>
<script setup lang="ts">
</script>