<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  uploadChapter,
  updateChapter,
  fetchChapter,
  fetchVolumes,
  DEFAULT_BOOK_ID,
  type VolumeBrief,
} from '@/data/loadNovel'
import { chapterLabel } from '@/utils/chineseNumber'

const route = useRoute()
const router = useRouter()

const editId = computed(() => (route.query.edit as string) || '')
const isEdit = computed(() => !!editId.value)

// 卷:用下拉選。volumeChoice = 卷的 order(字串),或 '__new__' 代表新增卷
const volumes = ref<VolumeBrief[]>([])
const volumeChoice = ref<string>('__new__')
const newVolumeOrder = ref<number | null>(null)
const newVolumeTitle = ref('')

const chapterIndex = ref<number | null>(null)
const title = ref('')
const content = ref('')

const loading = ref(false)
const submitting = ref(false)
const result = ref<{ type: 'ok' | 'err'; text: string } | null>(null)

const isNewVolume = computed(() => volumeChoice.value === '__new__')

// 章號預覽:讓使用者填數字時即時看到會變成「第幾章」
const chapterPreview = computed(() =>
  chapterIndex.value != null && chapterIndex.value >= 1
    ? chapterLabel(chapterIndex.value)
    : '',
)

// 解出最終要送的卷號/卷名
function resolveVolume(): { order: number | null; title: string } {
  if (isNewVolume.value) {
    return { order: newVolumeOrder.value, title: newVolumeTitle.value.trim() }
  }
  const v = volumes.value.find((x) => String(x.order) === volumeChoice.value)
  return v ? { order: v.order, title: v.title } : { order: null, title: '' }
}

async function loadVolumes() {
  try {
    volumes.value = await fetchVolumes(DEFAULT_BOOK_ID)
  } catch {
    volumes.value = []
  }
}

onMounted(async () => {
  loading.value = true
  await loadVolumes()

  if (isEdit.value) {
    try {
      const ch = await fetchChapter(editId.value, DEFAULT_BOOK_ID)
      chapterIndex.value = ch.chapterIndex
      title.value = ch.title
      content.value = ch.content
      // 該章的卷若已在清單,選中它;否則當作新卷帶入
      const exists = volumes.value.find((v) => v.order === ch.volumeOrder)
      if (exists) {
        volumeChoice.value = String(ch.volumeOrder)
      } else {
        volumeChoice.value = '__new__'
        newVolumeOrder.value = ch.volumeOrder
        newVolumeTitle.value = ch.volumeTitle
      }
    } catch (e) {
      result.value = { type: 'err', text: (e as Error).message }
    }
  } else {
    // 新增模式:若已有卷,預設選第一卷;否則維持「新增卷」
    if (volumes.value.length > 0) {
      volumeChoice.value = String(volumes.value[0].order)
    }
  }
  loading.value = false
})

async function submit() {
  result.value = null
  const vol = resolveVolume()

  if (
    vol.order == null ||
    !vol.title ||
    chapterIndex.value == null ||
    !title.value.trim() ||
    !content.value.trim()
  ) {
    result.value = { type: 'err', text: '請填完:卷(號+名)、章號、章名、內文' }
    return
  }

  submitting.value = true
  try {
    const payload = {
      volumeOrder: vol.order,
      volumeTitle: vol.title,
      chapterIndex: chapterIndex.value,
      title: title.value.trim(),
      content: content.value,
    }

    if (isEdit.value) {
      const r = await updateChapter(editId.value, payload, DEFAULT_BOOK_ID)
      result.value = { type: 'ok', text: `${r.message}(${r.file})` }
    } else {
      const r = await uploadChapter(payload, DEFAULT_BOOK_ID)
      result.value = { type: 'ok', text: `${r.message}(${r.file})` }
      // 新增成功 → 章號 +1、清內容;重抓卷清單(可能剛新增了卷)
      chapterIndex.value = chapterIndex.value != null ? chapterIndex.value + 1 : null
      title.value = ''
      content.value = ''
      await loadVolumes()
      // 若剛剛是新增卷,改成選中它(下次接著加同卷)
      if (isNewVolume.value && newVolumeOrder.value != null) {
        const justAdded = volumes.value.find((v) => v.order === newVolumeOrder.value)
        if (justAdded) volumeChoice.value = String(justAdded.order)
      }
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
      {{ isEdit ? '修改後送出會直接覆蓋原 md 檔。' : '填完送出後會寫成 md 檔，回閱讀區即可看到。' }}
    </p>

    <p v-if="loading" class="loading">讀取中…</p>

    <template v-else>
      <!-- 卷:下拉選 + 新增卷 -->
      <div class="row">
        <label>
          卷
          <select v-model="volumeChoice">
            <option v-for="v in volumes" :key="v.order" :value="String(v.order)">
              第{{ v.order }}卷 · {{ v.title }}
            </option>
            <option value="__new__">＋ 新增卷…</option>
          </select>
        </label>
      </div>

      <!-- 選了新增卷才出現:新卷號 + 新卷名 -->
      <div v-if="isNewVolume" class="row two new-vol">
        <label>
          新卷號（數字）
          <input v-model.number="newVolumeOrder" type="number" min="1" placeholder="2" />
        </label>
        <label>
          新卷名
          <input v-model="newVolumeTitle" type="text" placeholder="孤行荒原" />
        </label>
      </div>

      <!-- 章號(自動轉中文預覽) -->
      <div class="row">
        <label>
          第幾章（數字，全書連續編號）
          <input v-model.number="chapterIndex" type="number" min="1" placeholder="26" />
        </label>
        <p v-if="chapterPreview" class="preview">顯示為：{{ chapterPreview }}</p>
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
          <textarea v-model="content" rows="16" placeholder="老馬的蹄聲……&#10;&#10;[洛恩]「住手！」"></textarea>
        </label>
        <p class="speaker-hint">
          配音標記：段落開頭加 <code>[角色名]</code> 代表這段是該角色說的，例如
          <code>[洛恩]「住手！」</code>。沒加的就是旁白。
          標記只用於配音，閱讀時不會顯示出來。
        </p>
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
.new-vol { background: #f6f1e7; padding: 14px; border-radius: 8px; border: 1px solid #e0d4ba; }
label { display: block; font-size: 14px; color: #444; }
input, textarea, select {
  width: 100%; margin-top: 6px; padding: 8px 10px;
  border: 1px solid #ccc; border-radius: 6px; font-size: 14px;
  font-family: inherit; box-sizing: border-box; background: #fff;
}
textarea { resize: vertical; line-height: 1.7; }
.preview { margin-top: 6px; font-size: 13px; color: #1a6b1a; }
.speaker-hint {
  margin-top: 8px; font-size: 12px; color: #777; line-height: 1.6;
  background: #f6f1e7; padding: 10px 12px; border-radius: 6px;
}
.speaker-hint code {
  background: #e8ddc4; padding: 1px 5px; border-radius: 3px;
  font-family: ui-monospace, monospace; color: #5a3a1a;
}
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
