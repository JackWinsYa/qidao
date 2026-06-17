// 小說資料的型別定義
// 一本書 = 書籍資訊 + 多個卷,每卷底下有多個章節

export interface Chapter {
  id: string          // 章節唯一 id,例如 'ch26'
  index: number       // 全書第幾章(連續編號,用於上一章/下一章)
  volumeId: string    // 所屬卷 id
  number: string      // 顯示用章節號,例如 '第二十六章'
  title: string       // 章節標題,例如 '沒有屋簷的夜'
  paragraphs: string[] // 內文段落(已從 Markdown 解析成一段一段)
}

export interface Volume {
  id: string          // 卷 id,例如 'vol2'
  title: string       // 卷名,例如 '孤行荒原'
  order: number       // 第幾卷
  chapters: Chapter[]
}

export interface Book {
  id: string          // 書 id,例如 'loen'
  title: string       // 書名,例如 '灰燼之風 · 洛恩傳'
  author: string      // 作者,例如 '墨痕'
  tags: string[]      // 分類標籤,例如 ['奇幻', '冒險', '成長']
  cover: string       // 封面圖路徑
  volumes: Volume[]
}

// 攤平後的章節清單項目,給目錄與導覽用
export interface FlatChapter {
  chapter: Chapter
  volume: Volume
}
