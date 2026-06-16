<script setup lang="ts">
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <!-- 板塊一:標題 LOGO(只有「棄道」二字)-->
      <div class="hero-logo">
  <img class="logo-dark" src="@/assets/images/logo-2.png" alt="棄道" />
  <img class="logo-light" src="@/assets/images/logo-1.png" alt="棄道" />
</div>

      <!-- 板塊二:標語 -->
      <p class="hero-subtitle">
        在將人鍛成器的世界裡,<br />
        他仍選擇成為人。
      </p>

      <!-- 板塊三:兩顆按鈕 -->
      <div class="hero-actions">
  <button class="btn btn-primary">
    <span class="btn-cn">開始閱讀</span>
    <span class="btn-en">READ NOW</span>
  </button>
  <button class="btn btn-secondary">
    <span class="btn-cn">進入書庫</span>
    <span class="btn-en">LIBRARY</span>
  </button>
</div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 60px;
  padding-top: 200px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--bg-dark);
}
[data-theme='dark'] .hero {
  background-image: url('@/assets/images/hero-dark.png');
}

[data-theme='light'] .hero {
  background-image: url('@/assets/images/hero-light.png');
}

/* 左側內容區:三個板塊垂直堆疊 */
.hero-content {
  max-width: 520px;
  display: flex;
  margin-left: 140px;
  flex-direction: column;
  gap: 36px;
}

/* logo 共同尺寸(不要寫 display) */
.hero-logo img {
  height: 120px;
  width: auto;
}

/* 預設兩張都藏起來 */
.logo-dark,
.logo-light {
  display: none;
}

/* 深色模式只顯示 logo-2 */
[data-theme='dark'] .logo-dark {
  display: block;
}

/* 淺色模式只顯示 logo-1 */
[data-theme='light'] .logo-light {
  display: block;
}
/* 板塊二:標語 */
.hero-subtitle {
  font-family: var(--font-title);
  font-size: 26px;
  font-weight: 800;
  line-height: 2.1;
  letter-spacing: 3px;
  color: var(--text-main);
  padding-left: 20px;
  border-left: 3px solid var(--gold);
}

/* 板塊三:按鈕 */
.hero-actions {
  display: flex;
  gap: 20px;
margin-left: -60px;
}

.btn {
  font-family: var(--font-title);
  font-weight: 700;
  padding: 18px 44px;
  cursor: pointer;
  background: transparent;
  color: #f0e6d2;
  transition: all 0.2s;

  /* 讓中英文上下排列、置中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  border-style: solid;
  border-width: 24px;
  border-image-slice: 80 fill;
  border-image-repeat: stretch;
}

.btn-cn {
  font-size: 18px;
  letter-spacing: 2px;
}

.btn-en {
  font-size: 10px;
  letter-spacing: 3px;
  opacity: 0.7;
}

/* 開始閱讀:暗紅底圖 */
.btn-primary {
  border-image-source: url('@/assets/images/btn-read.png');
}

/* 進入書庫:金色底圖 */
.btn-secondary {
  border-image-source: url('@/assets/images/btn-library.png');
}

.btn:hover {
  filter: brightness(1.2);
}

/* 手機版 */
/* === 平板:768px ~ 1024px === */
@media (max-width: 1024px) {
  .hero {
    min-height: 90vh;
    padding: 160px 40px 60px;
  }

  .hero-content {
    margin-left: 40px;
    max-width: 440px;
    gap: 28px;
  }

  .hero-logo img {
    height: 90px;
  }

  .hero-subtitle {
    font-size: 22px;
    line-height: 1.9;
  }
}

/* === 手機:≤ 768px === */
@media (max-width: 768px) {
  .hero {
    min-height: 85vh;
    padding: 140px 24px 50px;
    /* 文字置中對齊 */
    justify-content: center;
    text-align: center;
  }

  /* 圖上加半透明深色遮罩,讓文字浮出來 */
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(20, 14, 8, 0.55);
    z-index: 0;
  }

  /* 內容區置中、移除左邊距、疊在遮罩上層 */
  .hero-content {
    position: relative;
    z-index: 1;
    margin-left: 0;
    max-width: 100%;
    align-items: center;
    gap: 24px;
  }

  .hero-logo img {
    height: 72px;
  }

  /* 標語置中,拿掉左邊那條金線(置中時左線會怪)*/
  .hero-subtitle {
    font-size: 18px;
    line-height: 1.9;
    letter-spacing: 2px;
    text-align: center;
    padding-left: 0;
    border-left: none;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    margin-left: 0;
    width: 100%;
  }

  .btn {
    width: 100%;
    max-width: 280px;
  }
}
</style>