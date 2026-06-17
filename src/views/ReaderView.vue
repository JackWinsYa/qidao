<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useReader, useReaderPrefs } from '@/composables/useReader'
import { loenBook } from '@/data/loadNovel'
import ReaderTopbar from '@/components/reader/ReaderTopbar.vue'
import ReaderSidebar from '@/components/reader/ReaderSidebar.vue'
import ReaderScroll from '@/components/reader/ReaderScroll.vue'
import ReaderFlip from '@/components/reader/ReaderFlip.vue'
import ReaderToolbar from '@/components/reader/ReaderToolbar.vue'

const themeStore = useThemeStore()

const book = ref(loenBook)
const { current, hasPrev, hasNext, goPrev, goNext, goTo } = useReader(book)
const { fontScale, pageMode, fontDown, fontUp, setPageMode } = useReaderPrefs()

const contentFontSize = computed(() => `${(fontScale.value / 100) * 1.25}rem`)

// ===== 響應式斷點偵測 =====
// narrow: <=1024px(平板+手機,側欄改抽屜)  mobile: <=768px(手機,極簡)
const winW = ref(window.innerWidth)
const isNarrow = computed(() => winW.value <= 1024)
const isMobile = computed(() => winW.value <= 768)

function onResize() {
  winW.value = window.innerWidth
}

// ===== 側欄開合 =====
// 桌機預設開、窄版預設收
const sidebarOpen = ref(window.innerWidth > 1024)
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
function closeSidebar() {
  sidebarOpen.value = false
}

// 視窗跨越斷點時,自動切換側欄預設狀態
watch(isNarrow, (narrow) => {
  sidebarOpen.value = !narrow // 變窄→收起;變寬→展開
})

// 手機進入時偏好滑動模式(翻頁在手機體驗差)
watch(
  isMobile,
  (mobile) => {
    if (mobile && pageMode.value === 'flip') setPageMode('scroll')
  },
  { immediate: true },
)

// 窄版時,選章節後自動收側欄
function onSelectChapter(chapterId: string) {
  goTo(chapterId)
  if (isNarrow.value) closeSidebar()
}

// ===== 展開的卷 =====
const expandedVolumes = ref<Set<string>>(new Set())
watch(
  current,
  (c) => {
    if (c) expandedVolumes.value.add(c.volume.id)
  },
  { immediate: true },
)
function toggleVolume(id: string) {
  const next = new Set(expandedVolumes.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedVolumes.value = next
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <div
    class="reader"
    :class="{ 'sidebar-closed': !sidebarOpen, narrow: isNarrow, 'sidebar-open': sidebarOpen }"
  >
    <ReaderTopbar :title="book.title" />

    <div class="body">
      <ReaderSidebar
        :book="book"
        :open="sidebarOpen"
        :current-chapter-id="current?.chapter.id"
        :expanded-volumes="expandedVolumes"
        @toggle-volume="toggleVolume"
        @select-chapter="onSelectChapter"
      />

      <!-- 窄版抽屜遮罩 -->
      <div
        v-if="isNarrow && sidebarOpen"
        class="sidebar-overlay"
        @click="closeSidebar"
      ></div>

      <main class="content-wrap">
        <button class="sidebar-toggle" :aria-label="sidebarOpen ? '收起目錄' : '展開目錄'" @click="toggleSidebar">
          <PanelLeftClose v-if="sidebarOpen" :size="20" />
          <PanelLeftOpen v-else :size="20" />
        </button>

        <ReaderScroll
          v-if="pageMode === 'scroll'"
          :current="current"
          :font-size="contentFontSize"
        />
        <ReaderFlip
          v-else
          :key="current?.chapter.id"
          :current="current"
          :font-size="contentFontSize"
          :font-scale="fontScale"
          :has-prev="hasPrev"
          :has-next="hasNext"
          @prev-chapter="goPrev"
          @next-chapter="goNext"
        />

        <ReaderToolbar
          :font-scale="fontScale"
          :page-mode="pageMode"
          :is-dark="themeStore.isDark"
          :has-prev="hasPrev"
          :has-next="hasNext"
          :is-mobile="isMobile"
          @font-down="fontDown"
          @font-up="fontUp"
          @set-page-mode="setPageMode"
          @toggle-theme="themeStore.toggle($event)"
          @prev-chapter="goPrev"
          @next-chapter="goNext"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.reader {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.body { flex: 1; display: flex; min-height: 0; position: relative; }

/* ===== 桌機:側欄常駐推開內文 ===== */
.reader.sidebar-closed :deep(.sidebar) {
  flex-basis: 0; width: 0; opacity: 0; overflow: hidden; border-right-color: transparent;
}

.content-wrap {
  flex: 1; position: relative; min-width: 0;
  background-image: url('@/assets/images/reader-dark.png');
  background-size: cover; background-position: center;
}
[data-theme='light'] .content-wrap { background-image: url('@/assets/images/reader-light.png'); }

/* 內文寬度:側欄收合時變寬 */
.content-wrap :deep(.page) { max-width: 760px; }
.reader.sidebar-closed .content-wrap :deep(.page) { max-width: 860px; }

.sidebar-toggle {
  position: absolute; top: 16px; left: 16px; z-index: 30;
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
  background: rgba(20,14,8,0.6); border: 1px solid rgba(184,138,59,0.45); border-radius: 8px;
  color: #cda869; cursor: pointer; transition: all 0.2s;
}
.sidebar-toggle:hover { color: #f0d89a; border-color: var(--gold); }

/* ===== 窄版(平板+手機):側欄變抽屜浮層 ===== */
.reader.narrow :deep(.sidebar) {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  width: 300px; flex-basis: 300px;
  z-index: 40;
  transform: translateX(-100%);
  opacity: 1;
  box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  transition: transform 0.32s ease;
}
.reader.narrow.sidebar-open :deep(.sidebar) {
  transform: translateX(0);
}
/* 窄版時內文恆為全寬基準,不被側欄推 */
.reader.narrow .content-wrap :deep(.page) { max-width: 760px; }

/* 抽屜遮罩 */
.sidebar-overlay {
  position: absolute;
  inset: 0;
  z-index: 35;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(1px);
}

/* 手機:抽屜佔比加大、好點 */
@media (max-width: 768px) {
  .reader.narrow :deep(.sidebar) {
    width: 84vw; flex-basis: 84vw; max-width: 320px;
  }
  .sidebar-toggle {
    top: 12px; left: 12px;
    width: 34px; height: 34px;
  }
}
</style>
