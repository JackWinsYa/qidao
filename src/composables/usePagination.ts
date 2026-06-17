import { ref, computed, nextTick, watch, type Ref } from 'vue'
import type { FlatChapter } from '@/types/novel'

// 真分頁:量測隱藏容器裡每個段落的實際高度,依可視高度切成多頁。
export function usePagination(opts: {
  viewportRef: Ref<HTMLElement | null>
  measureRef: Ref<HTMLElement | null>
  current: Ref<FlatChapter | undefined>
  fontScale: Ref<number>
  active: Ref<boolean>
}) {
  const { viewportRef, measureRef, current, fontScale, active } = opts

  const pages = ref<string[][]>([])
  const pageIndex = ref(0)

  const totalPages = computed(() => pages.value.length)
  const isFirstPage = computed(() => pageIndex.value === 0)
  const isLastPage = computed(() => pageIndex.value >= totalPages.value - 1)
  const currentPageParas = computed(() => pages.value[pageIndex.value] ?? [])

  // 等字體載入完成(避免量到 fallback 字體的高度)
  async function waitFonts() {
    try {
      // @ts-ignore - document.fonts 在現代瀏覽器皆有
      if (document.fonts?.ready) await document.fonts.ready
    } catch {
      /* 忽略 */
    }
  }

  // 等一個 frame,確保 DOM 已套用最新 font-size / 寬度
  function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()))
  }

  async function paginate() {
    if (!active.value) return
    if (!current.value || !measureRef.value || !viewportRef.value) return

    await nextTick()
    await waitFonts()
    await nextFrame()

    const viewport = viewportRef.value
    const measure = measureRef.value
    if (!viewport || !measure) return

    // 可用高度 = viewport 內容區高度(clientHeight 已不含 border,但含 padding)
    // 扣掉上下 padding 才是真正能放內容的高度
    const cs = getComputedStyle(viewport)
    const padTop = parseFloat(cs.paddingTop) || 0
    const padBottom = parseFloat(cs.paddingBottom) || 0
    const usableH = viewport.clientHeight - padTop - padBottom

    const headerH = (measure.querySelector('.measure-header') as HTMLElement)?.offsetHeight ?? 0
    const paraEls = Array.from(measure.querySelectorAll('.measure-para')) as HTMLElement[]
    const paras = current.value.chapter.paragraphs

    // 量測容器空的或還沒渲染 → 整章當一頁,避免崩
    if (paraEls.length === 0 || usableH <= 0) {
      pages.value = [paras]
      pageIndex.value = 0
      return
    }

    const result: string[][] = []
    let cur: string[] = []
    let curH = headerH // 第一頁要先扣掉標題佔的高度

    for (let i = 0; i < paraEls.length; i++) {
      // offsetHeight 不含 margin,補上 margin-bottom 才準
      const ms = getComputedStyle(paraEls[i])
      const h = paraEls[i].offsetHeight + (parseFloat(ms.marginBottom) || 0)

      if (curH + h > usableH && cur.length > 0) {
        result.push(cur)
        cur = []
        curH = 0
      }
      cur.push(paras[i])
      curH += h
    }
    if (cur.length > 0) result.push(cur)

    pages.value = result.length ? result : [paras]
    if (pageIndex.value > pages.value.length - 1) {
      pageIndex.value = pages.value.length - 1
    }
  }

  // 章節 / 字級變動 → 回第一頁重新分頁
  watch([current, fontScale], async () => {
    if (!active.value) return
    pageIndex.value = 0
    await paginate()
  })

  // 視窗縮放 → 防抖重算
  let resizeTimer: number | undefined
  function onResize() {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => paginate(), 200)
  }

  function goToLastPage() {
    pageIndex.value = totalPages.value - 1
  }
  function resetToFirst() {
    pageIndex.value = 0
  }

  return {
    pages,
    pageIndex,
    totalPages,
    isFirstPage,
    isLastPage,
    currentPageParas,
    paginate,
    onResize,
    goToLastPage,
    resetToFirst,
  }
}
