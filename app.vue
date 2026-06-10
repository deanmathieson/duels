<template>
  <div class="app-root">
    <NuxtPage />
    <!-- Global hovered-card preview: a single viewport-clamped overlay shared by
         every card so hover-to-read never clips at a container or screen edge. -->
    <CardPreview />
  </div>
</template>

<script setup lang="ts">
// Root shell. Pages live in /pages (index = main menu, run = the run controller).
</script>

<style>
.app-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
