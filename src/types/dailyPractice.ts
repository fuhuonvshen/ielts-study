export interface DailyPracticeData {
  date: string
  articles: DailyArticle[]
}

export interface DailyArticle {
  id: number
  category: 'education' | 'sports' | 'society' | 'technology' | 'military'
  source: string
  sourceUrl: string
  title: string
  titleCn: string
  summary: string
  summaryCn: string
  wordCount: number
  audioFile: string
  paragraphs: ArticleParagraph[]
  blanks: BlankItem[]
  fullText: string
  fullTextCn: string
}

export interface ArticleParagraph {
  en: string // contains {{id}} markers at blank positions
  cn: string
}

export interface BlankItem {
  id: number
  answer: string
  hint: string
  difficulty: 'easy' | 'medium' | 'hard'
}
