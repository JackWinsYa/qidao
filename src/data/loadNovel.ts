import type { Book, Volume, Chapter } from '@/types/novel'

// === Markdown 章節格式說明 ===
// 每個章節是一個 .md 檔,放在 src/content/<bookId>/ 底下。
// 檔名建議:卷號-章號.md,例如 02-26.md(第二卷第26章),方便排序。
// 檔案最上面用 frontmatter 設定中繼資料,內文直接寫:
//
//   ---
//   volume: 孤行荒原
//   volumeId: vol2
//   volumeOrder: 2
//   number: 第二十六章
//   title: 沒有屋簷的夜
//   index: 26
//   ---
//
//   老馬的蹄聲,在荒路上響了整整七天。
//   第七天清晨,洛恩是在車廂角落裡醒來的。
//
//   (空一行代表分段落)

interface ParsedMd {
  meta: Record<string, string>
  body: string
}

// 解析 frontmatter 與內文
function parseFrontmatter(raw: string): ParsedMd {
  const meta: Record<string, string> = {}
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  let body = raw
  if (fmMatch) {
    const fmBlock = fmMatch[1]
    body = raw.slice(fmMatch[0].length)
    for (const line of fmBlock.split('\n')) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (key) meta[key] = val
    }
  }
  return { meta, body: body.trim() }
}

// 把內文切成段落:以空行分段,單一換行也視為段落(小說常見一句一行)
function toParagraphs(body: string): string[] {
  // 先用「空行」切大段;每個大段內若有單換行,也各自成段
  return body
    .split(/\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

// 用 Vite glob 掃描某本書資料夾底下所有 md(eager 直接讀字串)
// 注意:glob 路徑必須是字面量,所以這裡針對 loen 這本書寫死路徑。
// 之後要加新書,複製一份這個 loader、改路徑即可。
const loenFiles = import.meta.glob('@/content/loen/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function buildBookFromFiles(
  bookMeta: Omit<Book, 'volumes'>,
  files: Record<string, string>,
): Book {
  const volumeMap = new Map<string, Volume>()

  // 依檔名排序,確保章節順序穩定
  const entries = Object.entries(files).sort(([a], [b]) => a.localeCompare(b))

  for (const [, raw] of entries) {
    const { meta, body } = parseFrontmatter(raw)
    const volumeId = meta.volumeId || 'vol1'

    if (!volumeMap.has(volumeId)) {
      volumeMap.set(volumeId, {
        id: volumeId,
        title: meta.volume || '未命名卷',
        order: Number(meta.volumeOrder ?? 1),
        chapters: [],
      })
    }

    const chapter: Chapter = {
      id: meta.id || `ch${meta.index ?? volumeMap.get(volumeId)!.chapters.length + 1}`,
      index: Number(meta.index ?? 0),
      volumeId,
      number: meta.number || '',
      title: meta.title || '未命名章節',
      paragraphs: toParagraphs(body),
    }
    volumeMap.get(volumeId)!.chapters.push(chapter)
  }

  const volumes = Array.from(volumeMap.values()).sort((a, b) => a.order - b.order)
  // 每卷內章節依 index 排序
  for (const v of volumes) {
    v.chapters.sort((a, b) => a.index - b.index)
  }

  return { ...bookMeta, volumes }
}

// === 對外匯出:洛恩傳這本書 ===
export const loenBook: Book = buildBookFromFiles(
  {
    id: 'loen',
    title: '棄道',
    author: '髒髒',
    tags: ['奇幻', '冒險', '成長'],
    cover: '/src/assets/images/cover-loen.png',
  },
  loenFiles,
)

// 之後若有多本書,在這裡集中匯出
export const books: Book[] = [loenBook]

export function getBook(id: string): Book | undefined {
  return books.find((b) => b.id === id)
}
