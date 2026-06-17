<script setup lang="ts">
import { Bookmark, ChevronDown, ChevronRight, List, Settings } from 'lucide-vue-next'
import type { Book } from '@/types/novel'

defineProps<{
  book: Book
  open: boolean
  currentChapterId: string | undefined
  expandedVolumes: Set<string>
}>()

const emit = defineEmits<{
  toggleVolume: [id: string]
  selectChapter: [chapterId: string]
  editChapter: [chapterId: string]
}>()
</script>

<template>
  <aside class="sidebar" :class="{ open }">
    <div class="book-card">
      <div class="book-cover">
        <img :src="book.cover" alt="" @error="($event.target as HTMLImageElement).style.display = 'none'" />
      </div>
      <div class="book-meta">
        <h1 class="book-title">{{ book.title }}</h1>
        <p class="book-author">作者：{{ book.author }}</p>
        <p class="book-tags">{{ book.tags.join(' · ') }}</p>
      </div>
    </div>

    <div class="toc-head">
      <span class="toc-deco">✦</span>
      <span>章節目錄</span>
    </div>

    <nav class="toc">
      <div v-for="volume in book.volumes" :key="volume.id" class="vol">
        <button class="vol-head" @click="emit('toggleVolume', volume.id)">
          <span>第{{ volume.order }}卷 · {{ volume.title }}</span>
          <ChevronDown :size="16" class="vol-chevron" :class="{ rotated: expandedVolumes.has(volume.id) }" />
        </button>
        <transition name="collapse">
          <ul v-show="expandedVolumes.has(volume.id)" class="chap-list">
            <li
              v-for="ch in volume.chapters"
              :key="ch.id"
              class="chap"
              :class="{ active: currentChapterId === ch.id }"
              @click="emit('selectChapter', ch.id)"
            >
              <span class="chap-text">{{ ch.number }} {{ ch.title }}</span>
              <span class="chap-icons">
                <!-- 齒輪:編輯該章(在書籤左邊)。stop 避免觸發選章 -->
                <Settings
                  :size="14"
                  class="chap-edit"
                  role="button"
                  aria-label="編輯本章"
                  @click.stop="emit('editChapter', ch.id)"
                />
                <Bookmark :size="14" class="chap-bm" />
              </span>
            </li>
          </ul>
        </transition>
      </div>
    </nav>

    <button class="toc-full">
      <List :size="18" />
      <span>完整章節列表</span>
      <ChevronRight :size="16" />
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  flex: 0 0 300px; width: 300px;
  background: linear-gradient(180deg, #14100c, #0f0b08);
  border-right: 1px solid rgba(184,138,59,0.35);
  display: flex; flex-direction: column; overflow-y: auto;
  transition: width 0.35s ease, flex-basis 0.35s ease, opacity 0.25s ease;

  /* 隱藏捲軸外觀(仍可捲動)：展開卷時不再冒出那條 scroll bar */
  scrollbar-width: none;            /* Firefox */
  -ms-overflow-style: none;         /* 舊版 Edge/IE */
}
.sidebar::-webkit-scrollbar { width: 0; height: 0; display: none; } /* WebKit */

.book-card { display: flex; gap: 14px; padding: 20px 18px; margin: 14px; border: 1px solid rgba(184,138,59,0.4); border-radius: 8px; background: rgba(0,0,0,0.25); }
.book-cover { flex: 0 0 64px; height: 84px; border-radius: 4px; overflow: hidden; background: linear-gradient(160deg, #2a2018, #15100b); border: 1px solid rgba(184,138,59,0.3); }
.book-cover img { width: 100%; height: 100%; object-fit: cover; }
.book-meta { min-width: 0; }
.book-title { font-family: var(--font-title); font-size: 18px; font-weight: 700; color: #f0d89a; line-height: 1.4; margin-bottom: 6px; }
.book-author, .book-tags { font-size: 12px; color: #b08d56; line-height: 1.6; }

.toc-head { display: flex; align-items: center; gap: 8px; margin: 6px 18px 10px; padding: 10px 12px; border: 1px solid rgba(184,138,59,0.4); border-radius: 6px; color: #e8c987; font-family: var(--font-title); font-weight: 700; }
.toc-deco { color: var(--gold); }

.toc { flex: 1; padding: 0 10px; }
.vol-head { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: transparent; border: none; color: #cda869; font-family: var(--font-title); font-size: 15px; font-weight: 700; cursor: pointer; transition: color 0.2s; }
.vol-head:hover { color: #f0d89a; }
.vol-chevron { transition: transform 0.25s; }
.vol-chevron.rotated { transform: rotate(180deg); }
.chap-list { list-style: none; }
.chap { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px 11px 26px; color: #a98c5e; font-size: 14px; cursor: pointer; border-radius: 6px; transition: background 0.2s, color 0.2s; }
.chap:hover { color: #e8d4a8; background: rgba(184,138,59,0.08); }
.chap.active { color: #f3e2b3; background: rgba(184,138,59,0.16); box-shadow: inset 2px 0 0 var(--gold); }
.chap-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 章節右側兩顆 icon:齒輪 + 書籤 */
.chap-icons { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.chap-edit { opacity: 0.35; cursor: pointer; transition: opacity 0.2s, color 0.2s; }
.chap-edit:hover { opacity: 1; color: #f0d89a; }
.chap-bm { opacity: 0.35; }

.toc-full { display: flex; align-items: center; gap: 10px; margin: 10px 14px 18px; padding: 14px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(184,138,59,0.4); border-radius: 8px; color: #cda869; font-family: var(--font-title); font-size: 15px; cursor: pointer; transition: all 0.2s; }
.toc-full:hover { color: #f0d89a; border-color: var(--gold); }
.toc-full span { flex: 1; text-align: left; }

.collapse-enter-active, .collapse-leave-active { transition: all 0.25s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 1000px; }

@media (max-width: 1024px) {
  .sidebar { position: absolute; top: 64px; bottom: 0; left: 0; z-index: 40; box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
}
</style>
