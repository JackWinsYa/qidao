<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  uploadChapter,
  updateChapter,
  fetchChapter,
  DEFAULT_BOOK_ID,
} from '@/data/loadNovel'

const route = useRoute()
const router = useRouter()

// ?edit=<chapterId> → 編輯模式
const editId = computed(() => (route.query.edit as string) || '')
const isEdit = computed(() => !!editId.value)

const volumeOrder = ref<number | null>(null)
const volumeTitle = ref('')
const chapterIndex = ref<number | null>(null)
const number = ref('')
const title = ref('')
const content = ref('')

const loading = ref(false)
const submitting = ref(false)
const result = ref<{ type: 'ok' | 'err'; text: string } | null>(null)

// 編輯模式:進來先抓原章資料帶入
onMounted(async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const ch = await fetchChapter(editId.value, DEFAULT_BOOK_ID)
    volumeOrder.value = ch.volumeOrder
    volumeTitle.value = ch.volumeTitle
    chapterIndex.value = ch.chapterIndex
    number.value = ch.number
    title.value = ch.title
    content.value = ch.content
  } catch (e) {
    result.value = { type: 'err', text: (e as Error).message }
  } finally {
    loading.value = false
  }
})

async function submit() {
  result.value = null
  if (
    volumeOrder.value == null ||
    !volumeTitle.value.trim() ||
    chapterIndex.value == null ||
    !title.value.trim() ||
    !content.value.trim()
  ) {
    result.value = { type: 'err', text: '請填完:卷號、卷名、章號、章名、內文' }
    return
  }

  submitting.value = true
  try {
    const payload = {
      volumeOrder: volumeOrder.value,
      volumeTitle: volumeTitle.value.trim(),
      chapterIndex: chapterIndex.value,
      number: number.value.trim() || undefined,
      title: title.value.trim(),
      content: content.value,
    }

    if (isEdit.value) {
      const r = await updateChapter(editId.value, payload, DEFAULT_BOOK_ID)
      result.value = { type: 'ok', text: `${r.message}(${r.file})` }
    } else {
      const r = await uploadChapter(payload, DEFAULT_BOOK_ID)
      result.value = { type: 'ok', text: `${r.message}(${r.file})` }
      // 新增成功 → 清章內容,章號 +1 方便連續上傳
      chapterIndex.value = chapterIndex.value != null ? chapterIndex.value + 1 : null
      number.value = ''
      title.value = ''
      content.value = ''
    }
  } catch (e) {
    result.value = { type: 'err', text: (e as Error).message }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="upload">
    <h1>{{ isEdit ? '編輯章節' : '上傳章節' }} · {{ DEFAULT_BOOK_ID }}</h1>
    <p class="hint">
      {{ isEdit ? '修改後送出會直接覆蓋原 md 檔。' : '填完送出後會寫成 md 檔到 src/content/，回閱讀區即可看到。' }}
    </p>

    <p v-if="loading" class="loading">讀取原章節中…</p>

    <template v-else>
      <div class="row two">
        <label>
          第幾卷(數字)
          <input v-model.number="volumeOrder" type="number" min="1" placeholder="2" />
        </label>
        <label>
          卷名
          <input v-model="volumeTitle" type="text" placeholder="孤行荒原" />
        </label>
      </div>

      <div class="row two">
        <label>
          第幾章(數字，全書連續編號)
          <input v-model.number="chapterIndex" type="number" min="1" placeholder="26" />
        </label>
        <label>
          顯示章節號(可留空，自動補「第N章」)
          <input v-model="number" type="text" placeholder="第二十六章" />
        </label>
      </div>

      <div class="row">
        <label>
          章名
          <input v-model="title" type="text" placeholder="沒有屋簷的夜" />
        </label>
      </div>

      <div class="row">
        <label>
          內文（空一行代表分段）
          <textarea v-model="content" rows="16" placeholder="老馬的蹄聲……"></textarea>
        </label>
      </div>

      <button :disabled="submitting" @click="submit">
        {{ submitting ? '處理中…' : isEdit ? '儲存修改' : '送出' }}
      </button>

      <p v-if="result" class="result" :class="result.type">{{ result.text }}</p>
    </template>

    <button class="back" @click="router.push('/read')">← 回閱讀區</button>
  </div>
</template>

<style scoped>
.upload {
  max-width: 720px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, sans-serif;
  color: #222;
}
h1 { font-size: 22px; margin-bottom: 4px; }
.hint { color: #777; font-size: 13px; margin-bottom: 24px; }
.loading { color: #777; padding: 40px 0; }
.row { margin-bottom: 16px; }
.row.two { display: flex; gap: 16px; }
.row.two label { flex: 1; }
label { display: block; font-size: 14px; color: #444; }
input, textarea {
  width: 100%; margin-top: 6px; padding: 8px 10px;
  border: 1px solid #ccc; border-radius: 6px; font-size: 14px;
  font-family: inherit; box-sizing: border-box;
}
textarea { resize: vertical; line-height: 1.7; }
button {
  margin-top: 8px; padding: 10px 28px; font-size: 15px;
  background: #3a2415; color: #f0e6d2; border: none; border-radius: 6px; cursor: pointer;
}
button:disabled { opacity: 0.5; cursor: not-allowed; }
.result { margin-top: 16px; padding: 10px 14px; border-radius: 6px; font-size: 14px; }
.result.ok { background: #e7f6e7; color: #1a6b1a; }
.result.err { background: #fbe6e6; color: #a11; }
.back {
  display: inline-block; margin-top: 24px; background: transparent;
  color: #3a2415; font-size: 14px; padding: 0; border: none; cursor: pointer;
}
</style>
