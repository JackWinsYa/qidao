<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

const navItems = [
  { label: '首頁', en: 'HOME' },
  { label: '閱讀', en: 'READ' },
  { label: '設定集', en: 'LORE' },
  { label: '角色', en: 'CHARACTERS' },
  { label: '地圖', en: 'WORLD' },
  { label: '無旗酒館', en: 'FORUM' },
  { label: '關於', en: 'ABOUT' },
]

const menuOpen = ref(false)
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

const themeStore = useThemeStore()
</script>

<template>
  <header class="header">
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="棄道 QIDAO" />
    </div>

    <nav class="nav" :class="{ open: menuOpen }">
    <a
        v-for="item in navItems"
        :key="item.en"
        class="nav-item"
        href="#"
        @click="menuOpen = false"
      >
        <span class="nav-cn">{{ item.label }}</span>
        <span class="nav-en">{{ item.en }}</span>
      </a>
    </nav>

    <div class="actions">
      <button class="icon-btn" aria-label="搜尋">
      <Search :size="50" style="margin-top: 5px;" />
      </button>
      <button class="icon-btn theme-btn" aria-label="切換深淺色" @click="themeStore.toggle($event)">
  <img
    :src="themeStore.isDark
      ? '/src/assets/images/icon-sun.png'
      : '/src/assets/images/icon-moon.png'"
    alt="切換深淺色"
  />
</button>
      <button class="icon-btn hamburger" aria-label="選單" @click="toggleMenu">☰</button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 180px;
  padding: 0 50px;
  background-image: url('@/assets/images/nav-paper.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: transparent;
}

.logo {
  flex: 1;
  display: flex;
  align-items: center;
}

.logo img {
  height: 100px;
  width: auto;
  display: block;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0 5px;
}

.nav-item {
    padding: 0 22px;
  border-left: 1px solid rgba(58, 36, 21, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--coffee);
  transition: color 0.2s;
}

.nav-item:first-child {
  border-left: none;
}

.nav-item:hover {
  color: var(--fire);
}

.nav-cn {
  font-family: var(--font-title);
  font-size: 25px;
  font-weight: 700;
}

.nav-en {
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 900;
}

.actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.icon-btn {
  background: transparent;
  border: none;
  width: auto;
  height: auto;
  padding: 0;
  color: var(--coffee);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn img {
  width: 65px;
  height: 65px;
  display: block;
}

.icon-btn:hover {
  color: var(--fire);
}

.hamburger {
  display: none;
  font-size: 35px;
  margin-top: -5px;
}

/* === 1024px 以下：LOGO 置中放大 + 漢堡選單 === */
@media (max-width: 1024px) {
  .header {
    position: relative;
  }

  /* LOGO 置中、放大 */
  .logo {
    flex: 1;
    justify-content: center;
  }

  .logo img {
    height: 80px;
  }

  /* 隱藏搜尋和深淺切換，只留漢堡 */
  .icon-btn {
    display: none;
  }

  .hamburger {
    display: block;
  }

  /* actions 不佔空間，漢堡浮在右邊（讓 LOGO 真正置中）*/
  .actions {
    flex: 0;
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
  }

  /* 選單改成從導覽列下方展開 */
  .nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background-color: var(--stone);
    border-top: 2px solid var(--gold);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    z-index: 10;
  }

  .nav.open {
    max-height: 500px;
  }

  .nav-item {
    flex-direction: row;
    gap: 10px;
    padding: 16px 24px;
    width: 100%;
    color: var(--text-main);
    border-bottom: 1px solid rgba(184, 138, 59, 0.2);
  }

  .nav-en {
    opacity: 0.4;
  }
}

/* === 768px 以下：手機版微調 === */
@media (max-width: 768px) {
  .header {
    min-height: 90px;
    padding: 0 20px;
  }

  .logo img {
    height: 60px;
  }

  .actions {
    right: 20px;
  }
}
</style>