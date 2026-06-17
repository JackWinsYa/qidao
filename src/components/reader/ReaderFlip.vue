<script setup lang="ts">
import { ref, toRef, onMounted, onUnmounted, nextTick, } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { FlatChapter } from '@/types/novel'
import ReaderChapterBody from './ReaderChapterBody.vue'
import { usePagination } from '@/composables/usePagination'

const props = defineProps<{
  current: FlatChapter | undefined
  fontSize: string
  fontScale: number
  hasPrev: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  prevChapter: []
  nextChapter: []
}>()

const flipViewport = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLElement | null>(null)
const active = ref(true) // 此元件只在翻頁模式被掛載,恆為 true

const {
  pageIndex, totalPages, isFirstPage, isLastPage, currentPageParas,
  paginate, onResize, goToLastPage, resetToFirst,
} = usePagination({
  viewportRef: flipViewport,
  measureRef: measureEl,
  current: toRef(props, 'current'),
  fontScale: toRef(props, 'fontScale'),
  active,
})

const canFlipPrev = () => !isFirstPage.value || props.hasPrev
const canFlipNext = () => !isLastPage.value || props.hasNext

function flipPrev() {
  if (!isFirstPage.value) {
    pageIndex.value--
  } else if (props.hasPrev) {
    emit('prevChapter')
    // 換到上一章後跳到最後一頁
    nextTick(async () => {
      await paginate()
      goToLastPage()
    })
  }
}
function flipNext() {
  if (!isLastPage.value) {
    pageIndex.value++
  } else if (props.hasNext) {
    emit('nextChapter')
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') flipPrev()
  if (e.key === 'ArrowRight') flipNext()
}

// 切回此章第一頁(由父層換章時 current 變化已在 composable 內處理,
// 但首次掛載要主動跑一次)
onMounted(async () => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  resetToFirst()
  await paginate()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
})

defineExpose({ flipPrev, flipNext })
</script>

<template>
  <div class="flip-wrap" :style="{ fontSize }">
    <div ref="flipViewport" class="flip-viewport">
      <div class="page" v-if="current">
        <ReaderChapterBody
          :volume="current.volume"
          :chapter="current.chapter"
          :paragraphs="currentPageParas"
          :show-header="pageIndex === 0"
        />
      </div>
    </div>

    <div class="flip-pageinfo" v-if="totalPages > 1">{{ pageIndex + 1 }} / {{ totalPages }}</div>

    <!-- 隱藏量測層:與 flip-viewport 完全同寬同 padding 同字級,
         用來量整章內容、算出每頁該放幾段 -->
    <div class="measure-layer" aria-hidden="true">
      <div ref="measureEl" class="page measure">
        <div class="measure-header" v-if="current">
          <ReaderChapterBody
            :volume="current.volume"
            :chapter="current.chapter"
            :paragraphs="[]"
            :show-header="true"
          />
        </div>
        <p v-for="(para, i) in current?.chapter.paragraphs" :key="i" class="para measure-para">{{ para }}</p>
      </div>
    </div>

    <button class="flip-btn flip-prev" :disabled="!canFlipPrev()" aria-label="上一頁" @click="flipPrev">
      <ChevronLeft :size="32" />
    </button>
    <button class="flip-btn flip-next" :disabled="!canFlipNext()" aria-label="下一頁" @click="flipNext">
      <ChevronRight :size="32" />
    </button>
  </div>
</template>

<style scoped>
.flip-wrap { position: relative; height: 100%; }
.flip-viewport { height: 100%; padding: 60px 90px 140px; overflow: hidden; }
.flip-viewport .page { height: 100%; margin: 0 auto; }

.flip-pageinfo {
  position: absolute; bottom: 84px; left: 50%; transform: translateX(-50%);
  font-family: var(--font-body); font-size: 13px; letter-spacing: 1px;
  color: var(--coffee); opacity: 0.6;
}
[data-theme='dark'] .flip-pageinfo { color: #c8a96a; }

/* 量測層:與 .flip-viewport 同 padding,藏在畫面外但有真實寬高 */
.measure-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  padding: 60px 90px 90px;     /* 必須與 .flip-viewport 一致 */
  visibility: hidden;
  pointer-events: none;
  overflow: visible;
  z-index: -1;
}
.measure {
  margin: 0 auto;
  height: auto;
}

/* 量測段落:字級行高要與真正內文(ReaderChapterBody .para)完全一致 */
.measure-para {
  font-family: var(--font-body);
  line-height: 2.1;
  margin-bottom: 4px;
  text-align: justify;
}

.flip-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #2a1c10, #1c1208);
  border: 2px solid var(--gold);
  color: #f0d89a; cursor: pointer; z-index: 18;
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
  transition: all 0.2s;
}
.flip-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #3a2616, #271a0d);
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 6px 20px rgba(184,138,59,0.4);
}
.flip-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.flip-prev { left: 24px; }
.flip-next { right: 24px; }

@media (max-width: 768px) {
  .flip-viewport { padding: 50px 64px 80px; }
  .flip-btn { width: 44px; height: 44px; }
  .flip-prev { left: 10px; }
  .flip-next { right: 10px; }
}
</style>
