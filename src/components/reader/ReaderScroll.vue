<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { FlatChapter } from '@/types/novel'
import ReaderChapterBody from './ReaderChapterBody.vue'

const props = defineProps<{
  current: FlatChapter | undefined
  fontSize: string
  highlightIndex?: number
}>()

const scrollEl = ref<HTMLElement | null>(null)

// 換章回到頂部
watch(
  () => props.current,
  () => scrollEl.value?.scrollTo({ top: 0, behavior: 'smooth' }),
)

// 朗讀進度變化 → 自動捲到正在念的段落,讓它保持在視野中
watch(
  () => props.highlightIndex,
  async (idx) => {
    if (idx == null || idx < 0 || !scrollEl.value) return
    await nextTick()
    const paras = scrollEl.value.querySelectorAll('.para')
    const target = paras[idx] as HTMLElement | undefined
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  },
)
</script>

<template>
  <article ref="scrollEl" class="content scroll" :style="{ fontSize }">
    <div class="page" v-if="current">
      <ReaderChapterBody
        :volume="current.volume"
        :chapter="current.chapter"
        :paragraphs="current.chapter.paragraphs"
        :show-header="true"
        :highlight-index="highlightIndex"
      />
    </div>
  </article>
</template>

<style scoped>
.content.scroll {
  scrollbar-width: auto;
  scrollbar-color: var(--gold) rgba(58,36,21,0.15);
}
.content.scroll::-webkit-scrollbar { width: 14px; }
.content.scroll::-webkit-scrollbar-track {
  background: rgba(58,36,21,0.12);
  border-radius: 7px;
}
.content.scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c89b4b, #9a6f2a);
  border-radius: 7px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.content.scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #e0b860, #b88a3b);
}
.content.scroll { height: 100%; overflow-y: auto; padding: 60px 40px 110px; }
.page { margin: 0 auto; transition: max-width 0.35s ease; }

@media (max-width: 768px) {
  .content.scroll { padding: 50px 22px 120px; }
}
</style>
