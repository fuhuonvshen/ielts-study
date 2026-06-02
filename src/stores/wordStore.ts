import { create } from 'zustand'
import type { Word } from '@/types'
import { getAllWords } from '@/lib/db'

interface WordState {
  words: Word[]
  isLoading: boolean
  searchQuery: string
  isImported: boolean
  wordListPage: number
  loadWords: () => Promise<void>
  setSearchQuery: (q: string) => void
  filteredWords: () => Word[]
  setImported: (v: boolean) => void
  setWordListPage: (p: number) => void
}

export const useWordStore = create<WordState>((set, get) => ({
  words: [],
  isLoading: false,
  searchQuery: '',
  isImported: false,
  wordListPage: 1,

  loadWords: async () => {
    set({ isLoading: true })
    const words = await getAllWords()
    set({ words, isLoading: false })
  },

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  filteredWords: () => {
    const { words, searchQuery } = get()
    if (!searchQuery.trim()) return words
    const lower = searchQuery.toLowerCase()
    return words.filter(
      (w) =>
        w.headWord.toLowerCase().includes(lower) ||
        w.translations.some((t) => t.tranCn.includes(searchQuery))
    )
  },

  setImported: (v: boolean) => set({ isImported: v }),
  setWordListPage: (p: number) => set({ wordListPage: p }),
}))
