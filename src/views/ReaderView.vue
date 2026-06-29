<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'
import { useReader, useReaderPrefs } from '@/composables/useReader'
import { useIsMobile } from '@/composables/useIsMobile'
import { useSpeech } from '@/composables/useSpeech'
import { useVoiceAssignment } from '@/composables/useVoiceAssignment'
import { fetchBook, emptyBook, DEFAULT_BOOK_ID } from '@/data/loadNovel'
import ReaderTopbar from '@/components/reader/ReaderTopbar.vue'
import ReaderSidebar from '@/components/reader/ReaderSidebar.vue'
import ReaderScroll from '@/components/reader/ReaderScroll.vue'
import ReaderFlip from '@/components/reader/ReaderFlip.vue'
import ReaderToolbar from '@/components/reader/ReaderToolbar.vue'
import ReaderSpeechBar from '@/components/reader/ReaderSpeechBar.vue'

const router = useRouter()
const themeStore = useThemeStore()
const { isMobile } = useIsMobile()

const book = ref(emptyBook())
const loading = ref(true)
const loadError = ref<string | null>(null)

const { current, hasPrev, hasNext, goPrev, goNext, goTo } = useReader(book)
const { fontScale, pageMode, fontDown, fontUp, setPageMode } = useReaderPrefs()

const contentFontSize = computed(() => `${(fontScale.value / 100) * 1.25}rem`)
const effectivePageMode = computed(() => (isMobile.value ? 'scroll' : pageMode.value))

// === 朗讀 ===
const speech = useSpeech()
// 本章 segments(配音用,含 speaker)
const segments = computed(() => current.value?.chapter.segments ?? [])
// 本章出現過的角色(去重、依出現順序),給聲音分配
const speakers = computed(() => {
  const seen: string[] = []
  for (const s of segments.value) {
    if (s.speaker && !seen.includes(s.speaker)) seen.push(s.speaker)
  }
  return seen
})
const { voiceForSpeaker } = useVoiceAssignment(speech.voices, speakers)

// 高亮:只在滑動模式有意義
const highlightIndex = computed(() =>
  effectivePageMode.value === 'scroll' ? speech.currentIndex.value : -1,
)

function startSpeak() {
  speech.play(segments.value, { voiceForSpeaker })
}
// 換章 → 停止朗讀(避免念到別章)
watch(current, () => speech.stop())

async function load() {
  loading.value = true
  loadError.value = null
  try {
    book.value = await fetchBook(DEFAULT_BOOK_ID)
  } catch (e) {
    loadError.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
onMounted(load)

function editChapter(chapterId: string) {
  router.push({ path: '/upload', query: { edit: chapterId } })
}

const sidebarOpen = ref(true)
watch(isMobile, (m) => { sidebarOpen.value = !m }, { immediate: true })
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}
function selectChapter(chapterId: string) {
  goTo(chapterId)
  if (isMobile.value) sidebarOpen.value = false
}
function closeSidebarOnMobile() {
  if (isMobile.value) sidebarOpen.value = false
}

const expandedVolumes = ref<Set<string>>(new Set())
watch(
  current,
  (c) => { if (c) expandedVolumes.value.add(c.volume.id) },
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

    <div v-if="loading" class="reader-state">載入中…</div>
    <div v-else-if="loadError" class="reader-state error">
      載入失敗：{{ loadError }}
      <button @click="load">重試</button>
    </div>
    <div v-else-if="book.volumes.length === 0" class="reader-state">
      還沒有任何章節，先去
      <router-link to="/upload">上傳一篇</router-link>
      吧。
    </div>

    <div v-else class="body">
      <div
        v-if="isMobile && sidebarOpen"
        class="sidebar-overlay"
        @click="closeSidebarOnMobile"
      ></div>

      <ReaderSidebar
        :book="book"
        :open="sidebarOpen"
        :current-chapter-id="current?.chapter.id"
        :expanded-volumes="expandedVolumes"
        @toggle-volume="toggleVolume"
        @select-chapter="selectChapter"
        @edit-chapter="editChapter"
      />

      <main class="content-wrap">
        <button class="sidebar-toggle" :aria-label="sidebarOpen ? '收起目錄' : '展開目錄'" @click="toggleSidebar">
          <PanelLeftClose v-if="sidebarOpen" :size="20" />
          <PanelLeftOpen v-else :size="20" />
        </button>

        <ReaderScroll
          v-if="effectivePageMode === 'scroll'"
          :current="current"
          :font-size="contentFontSize"
          :highlight-index="highlightIndex"
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

        <!-- 朗讀工具列 -->
        <ReaderSpeechBar
          :supported="speech.supported"
          :is-playing="speech.isPlaying.value"
          :is-paused="speech.isPaused.value"
          :rate="speech.rate.value"
          @play="startSpeak"
          @pause="speech.pause"
          @resume="speech.resume"
          @stop="speech.stop"
          @set-rate="speech.setRate"
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

.reader-state {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  color: var(--text-main); font-family: var(--font-body); font-size: 16px;
}
.reader-state.error { color: var(--fire); }
.reader-state button {
  margin-left: 10px; padding: 6px 16px; cursor: pointer;
  background: var(--coffee); color: #f0e6d2; border: none; border-radius: 6px;
}
.reader-state a { color: var(--gold); }

.reader.sidebar-closed :deep(.sidebar) {
  flex-basis: 0; width: 0; opacity: 0; overflow: hidden; border-right-color: transparent;
}

.sidebar-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 35;
  animation: overlay-fade 0.2s ease;
}
@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.content-wrap {
  flex: 1; position: relative; min-width: 0;
  background-image: url('@/assets/images/reader-dark.png');
  background-size: cover; background-position: center;
}
[data-theme='light'] .content-wrap { background-image: url('@/assets/images/reader-light.png'); }

.content-wrap :deep(.page) { max-width: 760px; }
.reader.sidebar-closed .content-wrap :deep(.page) { max-width: 860px; }

.sidebar-toggle {
  position: absolute; top: 16px; left: 16px; z-index: 20;
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
  background: rgba(20,14,8,0.6); border: 1px solid rgba(184,138,59,0.45); border-radius: 8px;
  color: #cda869; cursor: pointer; transition: all 0.2s;
}
.sidebar-toggle:hover { color: #f0d89a; border-color: var(--gold); }

@media (max-width: 1024px) {
  .reader.sidebar-closed :deep(.sidebar) {
    width: revert; flex-basis: revert; opacity: 1; overflow-y: auto;
    transform: translateX(-100%);
    border-right-color: rgba(184,138,59,0.35);
  }
}

@media (max-width: 768px) {
  .content-wrap :deep(.page) { max-width: 100%; }
  .reader.sidebar-closed .content-wrap :deep(.page) { max-width: 100%; }
  .sidebar-toggle { width: 42px; height: 42px; }
}
</style>
