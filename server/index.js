// 棄道 — 後端
// 路由:
//   GET  /api/books/:bookId                          讀整本書
//   GET  /api/books/:bookId/chapters/:chapterId       讀單一章節(編輯時帶入用)
//   POST /api/books/:bookId/chapters                  新增章節(寫 md,重複會擋)
//   PUT  /api/books/:bookId/chapters/:chapterId       更新章節(可覆蓋;改卷章號會搬檔)

import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const contentDir = (bookId) => path.join(ROOT, 'src', 'content', bookId)

const app = express()
app.use(express.json({ limit: '2mb' }))

// 安撫 Chrome DevTools 的探測請求,避免 console 紅字
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end()
})

// === 共用解析(與前端 loadNovel 同邏輯)===
function parseFrontmatter(raw) {
  const meta = {}
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  let body = raw
  if (fmMatch) {
    body = raw.slice(fmMatch[0].length)
    for (const line of fmMatch[1].split('\n')) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (key) meta[key] = val
    }
  }
  return { meta, body: body.trim() }
}

function toParagraphs(body) {
  return body
    .split(/\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

const pad = (n) => String(n).padStart(2, '0')
const fileNameOf = (volOrder, chapIdx) => `${pad(volOrder)}-${pad(chapIdx)}.md`

// 產生一章的 md 字串
function buildMd({ volumeTitle, volumeOrder, number, title, chapterIndex, content }) {
  const volumeId = `vol${volumeOrder}`
  const normalizedBody = String(content)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .trim()
  return (
    `---\n` +
    `volume: ${String(volumeTitle).trim()}\n` +
    `volumeId: ${volumeId}\n` +
    `volumeOrder: ${volumeOrder}\n` +
    `number: ${number ? String(number).trim() : `第${chapterIndex}章`}\n` +
    `title: ${String(title).trim()}\n` +
    `index: ${chapterIndex}\n` +
    `---\n\n` +
    normalizedBody +
    `\n`
  )
}

async function buildBook(bookId, bookMeta) {
  const dir = contentDir(bookId)
  let files = []
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'))
  } catch {
    return { ...bookMeta, volumes: [] }
  }
  files.sort((a, b) => a.localeCompare(b))

  const volumeMap = new Map()
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), 'utf-8')
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
    const vol = volumeMap.get(volumeId)
    vol.chapters.push({
      id: meta.id || `ch${meta.index ?? vol.chapters.length + 1}`,
      index: Number(meta.index ?? 0),
      volumeId,
      number: meta.number || '',
      title: meta.title || '未命名章節',
      paragraphs: toParagraphs(body),
      // 編輯用:回傳原始檔名與原始內文(段落用 \n\n 接回),方便前端帶入
      _file: file,
      _rawBody: body.trim(),
    })
  }

  const volumes = [...volumeMap.values()].sort((a, b) => a.order - b.order)
  for (const v of volumes) v.chapters.sort((a, b) => a.index - b.index)
  return { ...bookMeta, volumes }
}

// 書籍中繼資料
const BOOK_META = {
  loen: {
    id: 'loen',
    title: '棄道',
    author: '髒髒',
    tags: ['奇幻', '冒險', '成長'],
    cover: '/src/assets/images/cover-loen.png',
  },
}

// === 讀整本書 ===
app.get('/api/books/:bookId', async (req, res) => {
  const meta = BOOK_META[req.params.bookId]
  if (!meta) return res.status(404).json({ error: '找不到這本書' })
  try {
    res.json(await buildBook(req.params.bookId, meta))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '讀取失敗' })
  }
})

// === 讀單一章節(編輯帶入用)===
app.get('/api/books/:bookId/chapters/:chapterId', async (req, res) => {
  const { bookId, chapterId } = req.params
  const meta = BOOK_META[bookId]
  if (!meta) return res.status(404).json({ error: '找不到這本書' })
  try {
    const book = await buildBook(bookId, meta)
    for (const v of book.volumes) {
      const ch = v.chapters.find((c) => c.id === chapterId)
      if (ch) {
        return res.json({
          volumeOrder: v.order,
          volumeTitle: v.title,
          chapterIndex: ch.index,
          number: ch.number,
          title: ch.title,
          content: ch._rawBody,
          file: ch._file,
        })
      }
    }
    res.status(404).json({ error: '找不到這個章節' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '讀取失敗' })
  }
})

// 驗證 payload
function validate(body) {
  const errors = []
  const volOrderNum = Number(body.volumeOrder)
  const chapIdxNum = Number(body.chapterIndex)
  if (!Number.isInteger(volOrderNum) || volOrderNum < 1) errors.push('卷號需為正整數')
  if (!body.volumeTitle || !String(body.volumeTitle).trim()) errors.push('缺少卷名')
  if (!Number.isInteger(chapIdxNum) || chapIdxNum < 1) errors.push('章號需為正整數')
  if (!body.title || !String(body.title).trim()) errors.push('缺少章名')
  if (!body.content || !String(body.content).trim()) errors.push('缺少內文')
  return { errors, volOrderNum, chapIdxNum }
}

// === 新增章節 ===
app.post('/api/books/:bookId/chapters', async (req, res) => {
  const { bookId } = req.params
  if (!BOOK_META[bookId]) return res.status(404).json({ error: '找不到這本書' })

  const { errors, volOrderNum, chapIdxNum } = validate(req.body || {})
  if (errors.length) return res.status(400).json({ error: errors.join('、') })

  const dir = contentDir(bookId)
  await fs.mkdir(dir, { recursive: true })
  const fileName = fileNameOf(volOrderNum, chapIdxNum)
  const filePath = path.join(dir, fileName)

  try {
    await fs.access(filePath)
    return res.status(409).json({ error: `檔案已存在:${fileName}(此卷此章已上傳過)` })
  } catch {
    /* 不存在,往下寫 */
  }

  try {
    await fs.writeFile(
      filePath,
      buildMd({ ...req.body, volumeOrder: volOrderNum, chapterIndex: chapIdxNum }),
      'utf-8',
    )
    res.json({ ok: true, file: fileName, message: '已新增,可回閱讀區查看' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '寫檔失敗' })
  }
})

// === 更新章節 ===
// chapterId 用來定位原本那一章;新內容若改了卷/章號,會搬到新檔名並刪舊檔
app.put('/api/books/:bookId/chapters/:chapterId', async (req, res) => {
  const { bookId, chapterId } = req.params
  const meta = BOOK_META[bookId]
  if (!meta) return res.status(404).json({ error: '找不到這本書' })

  const { errors, volOrderNum, chapIdxNum } = validate(req.body || {})
  if (errors.length) return res.status(400).json({ error: errors.join('、') })

  const dir = contentDir(bookId)

  // 先找出原本那章的檔名
  let oldFile = null
  try {
    const book = await buildBook(bookId, meta)
    for (const v of book.volumes) {
      const ch = v.chapters.find((c) => c.id === chapterId)
      if (ch) { oldFile = ch._file; break }
    }
  } catch {
    /* ignore */
  }
  if (!oldFile) return res.status(404).json({ error: '找不到要更新的章節' })

  const newFile = fileNameOf(volOrderNum, chapIdxNum)
  const newPath = path.join(dir, newFile)

  // 若改了卷/章號(檔名變了),新檔名不可撞到「別的」既有檔
  if (newFile !== oldFile) {
    try {
      await fs.access(newPath)
      return res.status(409).json({ error: `目標檔名已被佔用:${newFile}(該卷該章已存在)` })
    } catch {
      /* 沒撞到,OK */
    }
  }

  try {
    await fs.writeFile(
      newPath,
      buildMd({ ...req.body, volumeOrder: volOrderNum, chapterIndex: chapIdxNum }),
      'utf-8',
    )
    // 檔名換了 → 刪掉舊檔
    if (newFile !== oldFile) {
      await fs.rm(path.join(dir, oldFile), { force: true })
    }
    res.json({ ok: true, file: newFile, message: '已更新,可回閱讀區查看' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '更新失敗' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[棄道後端] http://localhost:${PORT}`)
})
