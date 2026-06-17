<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FlatChapter } from '@/types/novel'
import ReaderChapterBody from './ReaderChapterBody.vue'

const props = defineProps<{
  current: FlatChapter | undefined
  fontSize: string
}>()

const scrollEl = ref<HTMLElement | null>(null)

// 換章回到頂部
watch(
  () => props.current,
  () => scrollEl.value?.scrollTo({ top: 0, behavior: 'smooth' }),
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
      />
    </div>
  </article>
</template>

<style scoped>

/* 自訂捲軸:明顯的金色 */
.content.scroll {
  scrollbar-width: auto;                          /* Firefox:正常寬度 */
  scrollbar-color: var(--gold) rgba(58,36,21,0.15);
}
.content.scroll::-webkit-scrollbar {
  width: 14px;
}
.content.scroll::-webkit-scrollbar-track {
  background: rgba(58,36,21,0.12);                /* 軌道:淡咖啡 */
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
