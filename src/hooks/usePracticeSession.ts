import { useEffect, useCallback, useRef } from 'react'
import { usePracticeStore } from '@/stores/practiceStore'
import { useWordStore } from '@/stores/wordStore'
import { generateOptions, getRandomWordsForSession } from '@/services/practiceService'
import { pickRandom } from '@/lib/utils'
import { savePracticeRecord, updateWordPracticeStats } from '@/services/statsService'
import { removeFromWrongBook } from '@/lib/db'
import type { PracticeMode } from '@/types'

export function usePracticeSession(mode: PracticeMode, count: number = 10) {
  const {
    session, options, selectedAnswer, showResult,
    startSession, selectAnswer, setOptions, nextWord: storeNextWord, endSession,
    setPracticePool,
  } = usePracticeStore()
  const { words: allWords, loadWords } = useWordStore()
  const sessionEpochRef = useRef(0)

  useEffect(() => {
    loadWords()
  }, [loadWords])

  const initSession = useCallback(async () => {
    const epoch = ++sessionEpochRef.current
    // 如果有预设词池（如错题本），优先使用
    const pool = usePracticeStore.getState().practicePool
    let words
    if (pool && pool.length > 0) {
      words = pickRandom(pool, Math.min(count, pool.length))
      setPracticePool(null)
    } else {
      words = await getRandomWordsForSession(count)
      usePracticeStore.getState().setWrongBookSession(false)
    }
    if (words.length > 0 && epoch === sessionEpochRef.current) {
      startSession(mode, words)
    }
  }, [mode, count, startSession, setPracticePool])

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
    const useMeaningCompare = state.session.mode === 'listen' || state.session.mode === 'meaning'
    const isCorrect = useMeaningCompare
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

    // If this is a wrong-book session and answer is correct, remove from wrong book
    if (isCorrect && usePracticeStore.getState().isWrongBookSession) {
      await removeFromWrongBook(word.id)
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
