import { create } from 'zustand'
import type { Word, PracticeMode, PracticeSession } from '@/types'

interface PracticeState {
  session: PracticeSession | null
  options: Word[]
  selectedAnswer: string | null
  showResult: boolean

  startSession: (mode: PracticeMode, words: Word[]) => void
  selectAnswer: (answer: string) => void
  setOptions: (options: Word[]) => void
  nextWord: () => void
  endSession: () => void
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  session: null,
  options: [],
  selectedAnswer: null,
  showResult: false,

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
    }))
  },
}))
