<script setup lang="ts">
import type { Volume, Chapter } from '@/types/novel'

// 章節標題 + 分隔線 + 段落。滑動模式與翻頁模式共用。
// highlightIndex: 正在朗讀的段落 index(-1 = 無);只在滑動模式會傳入。
defineProps<{
  volume: Volume
  chapter: Chapter
  paragraphs: string[]
  showHeader?: boolean
  highlightIndex?: number
}>()
</script>

<template>
  <div class="chapter-body">
    <template v-if="showHeader">
      <p class="vol-label">第{{ volume.order }}卷：{{ volume.title }}</p>
      <h2 class="chap-title">{{ chapter.number }} {{ chapter.title }}</h2>
      <div class="divider">
        <span class="divider-line"></span>
        <span class="divider-mark">✦</span>
        <span class="divider-line"></span>
      </div>
    </template>
    <p
      v-for="(para, i) in paragraphs"
      :key="i"
      class="para"
      :class="{ speaking: highlightIndex === i }"
    >{{ para }}</p>
  </div>
</template>

<style scoped>
.vol-label {
  text-align: center;
  font-family: var(--font-title);
  font-size: 16px;
  color: var(--coffee);
  opacity: 0.75;
  margin-bottom: 12px;
}
[data-theme='dark'] .vol-label { color: #c8a96a; }

.chap-title {
  text-align: center;
  font-family: var(--font-title);
  font-size: 32px;
  font-weight: 900;
  color: var(--coffee);
  letter-spacing: 2px;
}
[data-theme='dark'] .chap-title { color: #f0d89a; }

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 420px;
  margin: 26px auto 40px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.divider-mark { color: var(--gold); font-size: 14px; }

.para {
  font-family: var(--font-body);
  line-height: 2.1;
  color: var(--coffee);
  margin-bottom: 4px;
  text-align: justify;
  transition: background 0.3s, box-shadow 0.3s;
  border-radius: 4px;
}
[data-theme='dark'] .para { color: #e3d3b0; }

/* 正在朗讀的段落:淡金底 + 左側標記 */
.para.speaking {
  background: rgba(184, 138, 59, 0.18);
  box-shadow: inset 3px 0 0 var(--gold);
  padding-left: 12px;
  margin-left: -12px;
}
[data-theme='light'] .para.speaking {
  background: rgba(154, 111, 42, 0.14);
}

@media (max-width: 768px) {
  .chap-title { font-size: 26px; }
}
</style>
