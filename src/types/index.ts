export interface WordTranslation {
  pos: string
  tranCn: string
  tranOther?: string
}

export interface WordSentence {
  en: string
  cn: string
}

export interface WordSynonym {
  pos: string
  tran: string
  words: string[]
}

export interface WordPhrase {
  en: string
  cn: string
}

export interface WordRelWord {
  pos: string
  words: { hwd: string; tran: string }[]
}

export interface RawWordData {
  wordRank: number
  headWord: string
  bookId: string
  content: {
    word: {
      wordHead: string
      wordId: string
      content: {
        usphone?: string
        ukphone?: string
        usspeech?: string
        ukspeech?: string
        speech?: string
        trans?: {
          tranCn: string
          descOther?: string
          descCn?: string
          pos?: string
          tranOther?: string
        }[]
        sentence?: {
          sentences?: { sContent: string; sCn: string }[]
          desc?: string
        }
        syno?: {
          synos?: {
            pos: string
            tran: string
            hwds: { w: string }[]
          }[]
          desc?: string
        }
        phrase?: {
          phrases?: { pContent: string; pCn: string }[]
          desc?: string
        }
        relWord?: {
          rels?: {
            pos: string
            words: { hwd: string; tran: string }[]
          }[]
          desc?: string
        }
      }
    }
  }
}

export interface Word {
  id: string
  wordRank: number
  headWord: string
  bookId: string
  usphone: string
  ukphone: string
  usspeech: string
  ukspeech: string
  translations: WordTranslation[]
  sentences: WordSentence[]
  synonyms: WordSynonym[]
  phrases: WordPhrase[]
  relWords: WordRelWord[]
  status: 'new' | 'learning' | 'mastered'
  correctCount: number
  wrongCount: number
  lastPracticeAt: number | null
  isFavorite: boolean
  favoriteTags: string[]
}

export type PracticeMode = 'listen' | 'meaning' | 'spell' | 'reverse'

export interface PracticeRecord {
  id?: number
  wordId: string
  mode: PracticeMode
  isCorrect: boolean
  userAnswer: string
  timestamp: number
  duration: number
}

export interface DailyStats {
  date: string
  totalCount: number
  correctCount: number
  mode: PracticeMode
}

export interface PracticeSession {
  mode: PracticeMode
  words: Word[]
  currentIndex: number
  answers: { wordId: string; isCorrect: boolean; userAnswer: string; duration: number }[]
  startTime: number
  isComplete: boolean
}

export interface PracticeOption {
  word: Word
  isCorrect: boolean
  disabled: boolean
}
