<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Search } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'

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
const router = useRouter()
const scrolled = ref(false)
const expanded = ref(false)   // 小方塊點開後,導覽列是否展開

function handleScroll() {
  scrolled.value = window.scrollY > 400
  if (!scrolled.value) {
    menuOpen.value = false
    expanded.value = false   // 捲回頂部時,收起展開狀態
  }
}

function toggleExpand() {
  expanded.value = !expanded.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <!-- 完整導覽列:捲動後往左滑走 -->
  <header class="header" :class="{ hidden: scrolled && !expanded }">
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="棄道 QIDAO" />
    </div>

    <nav class="nav" :class="{ open: menuOpen }">
      <a
        v-for="item in navItems"
        :key="item.en"
        class="nav-item"
        href="#"
        @click.prevent="item.en === 'READ' ? router.push('/read') : (menuOpen = false)"
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

       <button
    v-if="scrolled && expanded"
    class="icon-btn collapse-btn"
    aria-label="收回選單"
    @click="toggleExpand"
  >
    <img src="@/assets/images/fast-forward.png" alt="收回" />
  </button>
    </div>
  </header>

 <!-- 精簡小方塊 -->
<div class="mini-bar" :class="{ show: scrolled && !expanded }">
  <img class="mini-logo" src="@/assets/images/logo.png" alt="棄道" />
  <button class="mini-arrow" aria-label="展開選單" @click="toggleExpand">
    <img src="@/assets/images/fast-forward.png" alt="展開" />
  </button>
</div>
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

  /* fixed 黏頂 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: transform 0.5s ease;
}

/* 捲動後:整條往左滑走藏起來 */
.header.hidden {
  transform: translateX(-100%);
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

/* === 精簡小方塊 === */
.mini-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background-image: url('@/assets/images/nav-paper.png');
  background-size: cover;
  background-position: right center;

  /* 預設藏在左邊 */
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.mini-bar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 40px;
  background-image: url('@/assets/images/nav-paper.png');
  background-size: cover;
  background-position: right center;

  transform: translateX(-100%);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.mini-bar.show {
  transform: translateX(0);
  opacity: 1;
}

.mini-logo {
  height: 70px;
  width: auto;
  display: block;
}

.mini-arrow {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.25s;
}

.mini-arrow img {
  height: 44px;
  width: auto;
  display: block;
}

.mini-arrow:hover {
  transform: translateX(8px);
}

/* 收回按鈕:箭頭水平翻轉,變成指左(收回) */
.collapse-btn img {
  height: 44px;
  width: auto;
  display: block;
  transform: scaleX(-1);
}

.collapse-btn:hover {
  transform: translateX(-8px);
}
/* === 1024px 以下:LOGO 置中放大 + 漢堡選單 === */
@media (max-width: 1024px) {
  .header {
    position: relative;
  }

  .header.hidden {
    transform: none;
  }

  .mini-bar {
    display: none;
  }

  .logo {
    flex: 1;
    justify-content: center;
  }

  .logo img {
    height: 80px;
  }

  .icon-btn {
    display: none;
  }

  .hamburger {
    display: block;
  }

  .actions {
    flex: 0;
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
  }

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

/* === 768px 以下 === */
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