import { useEffect } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import { generateOptions } from '@/services/practiceService'
import { useWordStore } from '@/stores/wordStore'
import { usePracticeStore } from '@/stores/practiceStore'
import type { OptionState } from '@/components/practice/OptionCard'

export function ReversePick() {
  const { session, selectedAnswer, showResult, currentWord, selectAnswer, nextWord } = usePracticeSession('reverse', 10)
  const { words: allWords } = useWordStore()
  const { options, setOptions } = usePracticeStore()

  useEffect(() => {
    if (currentWord && allWords.length > 0 && !showResult) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [currentWord?.id, showResult, allWords.length])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const getOptionState = (wordHead: string): OptionState => {
    if (!showResult) return 'idle'
    if (wordHead === currentWord!.headWord) return 'correct'
    if (wordHead === selectedAnswer) return 'incorrect'
    return 'idle'
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (showResult ? 1 : 0)} total={session.words.length} />
      </div>
      <div className="mb-8 text-center">
        <span className="text-xl font-semibold text-gray-700">
          {currentWord?.translations[0]?.tranCn}
        </span>
      </div>
      <div className="mb-4 text-center text-sm text-gray-400">
        Choose the correct word for this meaning
      </div>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            text={opt.headWord}
            state={getOptionState(opt.headWord)}
            onClick={() => { if (!showResult) selectAnswer(opt.headWord) }}
            showIcon={showResult}
          />
        ))}
      </div>
      {showResult && currentWord && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <span className="text-lg font-bold">{currentWord.headWord}</span>
          {currentWord.translations[0]?.pos && (
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">{currentWord.translations[0].pos}</span>
          )}
          <span className="ml-2 text-sm text-gray-400">{currentWord.usphone}</span>
          <button onClick={nextWord} className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white">
            {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
          </button>
        </div>
      )}
    </div>
  )
}
