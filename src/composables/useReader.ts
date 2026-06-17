import { computed, ref, type Ref } from 'vue'
import type { Book, FlatChapter } from '@/types/novel'

// 把整本書的卷/章攤平成一維陣列,方便算「上一章/下一章」與目錄渲染
export function useReader(book: Ref<Book>) {
  const flatChapters = computed<FlatChapter[]>(() => {
    const list: FlatChapter[] = []
    for (const volume of book.value.volumes) {
      for (const chapter of volume.chapters) {
        list.push({ chapter, volume })
      }
    }
    return list
  })

  const currentIndex = ref(0)

  const current = computed(() => flatChapters.value[currentIndex.value])
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(() => currentIndex.value < flatChapters.value.length - 1)

  function goPrev() {
    if (hasPrev.value) currentIndex.value--
  }
  function goNext() {
    if (hasNext.value) currentIndex.value++
  }
  function goTo(chapterId: string) {
    const idx = flatChapters.value.findIndex((f) => f.chapter.id === chapterId)
    if (idx !== -1) currentIndex.value = idx
  }

  return { flatChapters, currentIndex, current, hasPrev, hasNext, goPrev, goNext, goTo }
}

const FONT_MIN = 80
const FONT_MAX = 160
const FONT_STEP = 10

export function useReaderPrefs() {
  const fontScale = ref(100)
  const pageMode = ref<'scroll' | 'flip'>('scroll')

  function fontDown() {
    fontScale.value = Math.max(FONT_MIN, fontScale.value - FONT_STEP)
  }
  function fontUp() {
    fontScale.value = Math.min(FONT_MAX, fontScale.value + FONT_STEP)
  }
  function setPageMode(mode: 'scroll' | 'flip') {
    pageMode.value = mode
  }

  return { fontScale, pageMode, fontDown, fontUp, setPageMode }
}
