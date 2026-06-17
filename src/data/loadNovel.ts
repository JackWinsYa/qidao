import type { Book } from '@/types/novel'

// 執行時打後端 API。dev 透過 vite.config 的 proxy 轉到 http://localhost:3001
const API_BASE = '/api'

export const DEFAULT_BOOK_ID = 'loen'

export function emptyBook(id = DEFAULT_BOOK_ID): Book {
  return { id, title: '載入中…', author: '', tags: [], cover: '', volumes: [] }
}

export async function fetchBook(id: string = DEFAULT_BOOK_ID): Promise<Book> {
  const res = await fetch(`${API_BASE}/books/${id}`)
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(msg.error || `讀取失敗(${res.status})`)
  }
  return (await res.json()) as Book
}

export interface ChapterPayload {
  volumeOrder: number
  volumeTitle: string
  chapterIndex: number
  number?: string
  title: string
  content: string
}

export interface ChapterDetail extends Required<ChapterPayload> {
  file: string
}

// 讀單一章節(編輯帶入用)
export async function fetchChapter(
  chapterId: string,
  bookId: string = DEFAULT_BOOK_ID,
): Promise<ChapterDetail> {
  const res = await fetch(`${API_BASE}/books/${bookId}/chapters/${chapterId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `讀取失敗(${res.status})`)
  return data as ChapterDetail
}

// 新增章節
export async function uploadChapter(
  payload: ChapterPayload,
  bookId: string = DEFAULT_BOOK_ID,
): Promise<{ ok: boolean; file: string; message: string }> {
  const res = await fetch(`${API_BASE}/books/${bookId}/chapters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `新增失敗(${res.status})`)
  return data
}

// 更新章節
export async function updateChapter(
  chapterId: string,
  payload: ChapterPayload,
  bookId: string = DEFAULT_BOOK_ID,
): Promise<{ ok: boolean; file: string; message: string }> {
  const res = await fetch(`${API_BASE}/books/${bookId}/chapters/${chapterId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `更新失敗(${res.status})`)
  return data
}
