import { create } from 'zustand'
import type { Word, PracticeMode, PracticeSession } from '@/types'

export type LayoutRatio = 0.5 | 1 | 2
export type ContentScale = 1 | 1.15 | 1.3
export type PlaybackRate = 0.75 | 1 | 1.25 | 1.5 | 2
export type RepeatCount = 1 | 5 | 10

interface PracticeState {
  session: PracticeSession | null
  options: Word[]
  selectedAnswer: string | null
  showResult: boolean
  layoutRatio: LayoutRatio
  contentScale: ContentScale
  practicePool: Word[] | null
  isWrongBookSession: boolean
  playbackRate: PlaybackRate
  repeatCount: RepeatCount

  startSession: (mode: PracticeMode, words: Word[]) => void
  selectAnswer: (answer: string) => void
  setOptions: (options: Word[]) => void
  nextWord: () => void
  endSession: () => void
  setLayoutRatio: (ratio: LayoutRatio) => void
  setContentScale: (scale: ContentScale) => void
  setPracticePool: (pool: Word[] | null) => void
  setWrongBookSession: (v: boolean) => void
  setPlaybackRate: (rate: PlaybackRate) => void
  setRepeatCount: (count: RepeatCount) => void
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  session: null,
  options: [],
  selectedAnswer: null,
  showResult: false,
  layoutRatio: 0.5,
  contentScale: 1.3,
  practicePool: null,
  isWrongBookSession: false,
  playbackRate: 1,
  repeatCount: 1,

  startSession: (mode, words) => {
    set({
      session: {
        mode,
        words,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
        isComplete: false,
      },
      selectedAnswer: null,
      showResult: false,
      options: [],
    })
  },

  selectAnswer: (answer) => {
    const { session } = get()
    if (!session || session.isComplete) return

    set({
      selectedAnswer: answer,
      showResult: true,
    })
  },

  setOptions: (options) => set({ options }),

  nextWord: () => {
    const { session, selectedAnswer } = get()
    if (!session || !selectedAnswer) return

    const word = session.words[session.currentIndex]
    const useMeaningCompare = session.mode === 'listen' || session.mode === 'meaning'
    const isCorrect = useMeaningCompare
      ? selectedAnswer === (word.translations[0]?.tranCn ?? '')
      : selectedAnswer.toLowerCase() === word.headWord.toLowerCase()
    const answers = [...session.answers, { wordId: word.id, isCorrect, userAnswer: selectedAnswer, duration: 0 }]
    const nextIndex = session.currentIndex + 1
    const isComplete = nextIndex >= session.words.length

    set({
      session: {
        ...session,
        currentIndex: isComplete ? session.currentIndex : nextIndex,
        answers,
        isComplete,
      },
      selectedAnswer: null,
      showResult: false,
      options: [],
    })
  },

  endSession: () => {
    set((state) => ({
      session: state.session ? { ...state.session, isComplete: true } : null,
      isWrongBookSession: false,
    }))
  },

  setLayoutRatio: (ratio) => set({ layoutRatio: ratio }),
  setContentScale: (scale) => set({ contentScale: scale }),
  setPracticePool: (pool) => set({ practicePool: pool }),
  setWrongBookSession: (v) => set({ isWrongBookSession: v }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setRepeatCount: (count) => set({ repeatCount: count }),
}))
