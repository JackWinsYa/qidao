// 小說資料的型別定義
// 一本書 = 書籍資訊 + 多個卷,每卷底下有多個章節

// 段落片段:配音用。speaker 為 null 代表旁白。
export interface Segment {
  speaker: string | null
  text: string
}

export interface Chapter {
  id: string
  index: number
  volumeId: string
  number: string       // 顯示用章節號(後端依 index 自動中文化,如「第二十六章」)
  title: string
  paragraphs: string[] // 顯示用(已去掉 [角色] 標記)
  segments: Segment[]  // 配音用(含 speaker)
}

export interface Volume {
  id: string
  title: string
  order: number
  chapters: Chapter[]
}

export interface Book {
  id: string
  title: string
  author: string
  tags: string[]
  cover: string
  volumes: Volume[]
}

export interface FlatChapter {
  chapter: Chapter
  volume: Volume
}
