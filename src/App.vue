<script setup lang="ts">
import TheHeader from './components/TheHeader.vue'
import TheHero from './components/TheHero.vue'
import SectionCards from './components/SectionCards.vue'
</script>

<template>
  <div class="layout">
    <div class="top-section">
      <div class="header-overlay">
        <TheHeader />
      </div>
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

/* 導覽列絕對定位,浮在英雄區最上方 */
.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
</style>