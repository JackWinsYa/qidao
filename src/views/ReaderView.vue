<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

// 側欄開合
const sidebarOpen = ref(true)
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

// 展開的卷(預設展開當前章所在卷)
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
</script>

<template>
  <div class="reader" :class="{ 'sidebar-closed': !sidebarOpen }">
    <ReaderTopbar :title="book.title" />

    <div class="body">
      <ReaderSidebar
        :book="book"
        :open="sidebarOpen"
        :current-chapter-id="current?.chapter.id"
        :expanded-volumes="expandedVolumes"
        @toggle-volume="toggleVolume"
        @select-chapter="goTo"
      />

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

.body { flex: 1; display: flex; min-height: 0; }

/* 側欄收合 */
.reader.sidebar-closed :deep(.sidebar) {
  flex-basis: 0; width: 0; opacity: 0; overflow: hidden; border-right-color: transparent;
}

.content-wrap {
  flex: 1; position: relative; min-width: 0;
  background-image: url('@/assets/images/reader-dark.png');
  background-size: cover; background-position: center;
}
[data-theme='light'] .content-wrap { background-image: url('@/assets/images/reader-light.png'); }

/* 內文寬度:側欄收合時變寬。用 :deep 觸及子元件的 .page */
.content-wrap :deep(.page) { max-width: 760px; }
.reader.sidebar-closed .content-wrap :deep(.page) { max-width: 860px; }

.sidebar-toggle {
  position: absolute; top: 16px; left: 16px; z-index: 20;
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
  background: rgba(20,14,8,0.6); border: 1px solid rgba(184,138,59,0.45); border-radius: 8px;
  color: #cda869; cursor: pointer; transition: all 0.2s;
}
.sidebar-toggle:hover { color: #f0d89a; border-color: var(--gold); }
</style>
