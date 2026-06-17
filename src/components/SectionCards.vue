<script setup lang="ts">
</script>

<template>
  <section class="cards-section">

     <!-- 跨在交界處的捲軸 bar -->
    <div class="divider-bar"></div>

    <div class="cards-container">
      <!-- 第一欄:最新章節 -->
      <div class="card">
        <h2 class="card-title">最新章節</h2>
        <p class="card-en">LATEST CHAPTER</p>
        <div class="card-body">
          <p>（最新章節內容之後放這裡）</p>
        </div>
      </div>

      <!-- 第二欄:書庫分類 -->
      <div class="card">
        <h2 class="card-title">書庫分類</h2>
        <p class="card-en">LIBRARY CATEGORIES</p>
        <div class="card-body">
          <p>（書庫分類內容之後放這裡）</p>
        </div>
      </div>

      <!-- 第三欄:無旗酒館 -->
      <div class="card">
        <h2 class="card-title">無旗酒館</h2>
        <p class="card-en">CROW'S TAVERN</p>
        <div class="card-body">
          <p>（論壇討論內容之後放這裡）</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cards-section {
  padding: 80px 50px;
  background-color: transparent;
}

.divider-bar {
  width: 100%;
  max-width: 1600px;
  height: 90px;
  margin: 0 auto;
  /* 往上拉,讓 bar 騎在英雄區和主區塊的交界線上 */
  margin-top: -70px;
  margin-bottom: 20px;
  background-image: url('@/assets/images/scroll-bar.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 5;
}
.cards-container {
  max-width: 1600px;
  margin:  0 auto;
  display: grid;
  grid-template-columns: 4fr 3fr 2fr;
  gap: 32px;
}

.card {
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  min-height: 420px;
  padding: 70px 40px 50px;
}

/* 第一、三欄用 card-bg */
.card:nth-child(1),
.card:nth-child(3) {
  background-image: url('@/assets/images/card-bg.png');
}

/* 第二欄用 card-bg1 */
.card:nth-child(2) {
  background-image: url('@/assets/images/card-bg1.png');
}

.card-title {
  font-family: var(--font-title);
  font-size: 28px;
  font-weight: 900;
  color: var(--gold);
  margin-bottom: 4px;
}

.card-en {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-main);
  opacity: 0.5;
  margin-bottom: 24px;
}

.card-body {
  color: var(--text-main);
}

/* === 平板:兩欄 === */
@media (max-width: 1024px) {
  .cards-container {
    grid-template-columns: 1fr 1fr;
  }
}

/* === 手機:單欄 === */
@media (max-width: 768px) {
  .cards-section {
    padding: 50px 24px;
  }

  .cards-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .card {
    min-height: auto;
  }
}
</style>