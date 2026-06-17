<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import TheHero from './components/TheHero.vue'
import SectionCards from './components/SectionCards.vue'
</script>

<template>
  <div class="layout">
    <TheHeader />
    <div class="top-section">
      <TheHero />
    </div>
    <SectionCards />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}

.top-section {
  position: relative;
}
</style>