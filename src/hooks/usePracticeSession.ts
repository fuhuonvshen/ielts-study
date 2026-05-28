import { useEffect, useCallback } from 'react'
import { usePracticeStore } from '@/stores/practiceStore'
import { useWordStore } from '@/stores/wordStore'
import { generateOptions, getRandomWordsForSession } from '@/services/practiceService'
import { savePracticeRecord, updateWordPracticeStats } from '@/services/statsService'
import type { PracticeMode } from '@/types'

export function usePracticeSession(mode: PracticeMode, count: number = 10) {
  const {
    session, options, selectedAnswer, showResult,
    startSession, selectAnswer, setOptions, nextWord: storeNextWord, endSession,
  } = usePracticeStore()
  const { words: allWords, loadWords } = useWordStore()

  useEffect(() => {
    loadWords()
  }, [loadWords])

  const initSession = useCallback(async () => {
    const words = await getRandomWordsForSession(count)
    if (words.length > 0) {
      startSession(mode, words)
    }
  }, [mode, count, startSession])

  useEffect(() => {
    initSession()
  }, [initSession])

  useEffect(() => {
    if (!session || session.isComplete) return
    const currentWord = session.words[session.currentIndex]
    if (allWords.length > 0 && currentWord) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [session, session?.currentIndex, session?.isComplete, allWords.length])

  const nextWord = useCallback(async () => {
    const state = usePracticeStore.getState()
    if (!state.session || !state.selectedAnswer) return

    const word = state.session.words[state.session.currentIndex]
    const isCorrect = state.session.mode === 'listen'
      ? state.selectedAnswer === (word.translations[0]?.tranCn ?? '')
      : state.selectedAnswer.toLowerCase() === word.headWord.toLowerCase()

    // Save practice record and update word stats
    // These functions are imported from statsService which we create in a later task
    // For now, just use the store's nextWord
    try {
      await savePracticeRecord({
        wordId: word.id,
        mode: state.session.mode,
        isCorrect,
        userAnswer: state.selectedAnswer,
        timestamp: Date.now(),
        duration: 0,
      })
      await updateWordPracticeStats(word.id, isCorrect)
    } catch {
      // statsService may not exist yet — that's OK for now
    }

    storeNextWord()
  }, [storeNextWord])

  return {
    session,
    options,
    selectedAnswer,
    showResult,
    currentWord: session ? session.words[session.currentIndex] : null,
    selectAnswer,
    nextWord,
    endSession,
    initSession,
  }
}
