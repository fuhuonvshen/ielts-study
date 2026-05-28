import { useEffect } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import { generateOptions } from '@/services/practiceService'
import { useWordStore } from '@/stores/wordStore'
import { usePracticeStore } from '@/stores/practiceStore'
import type { OptionState } from '@/components/practice/OptionCard'

export function MeaningPick() {
  const { session, selectedAnswer, showResult, currentWord, selectAnswer, nextWord } = usePracticeSession('meaning', 10)
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

  const getOptionState = (tranCn: string): OptionState => {
    if (!showResult) return 'idle'
    const correctCn = currentWord!.translations[0]?.tranCn ?? ''
    if (tranCn === correctCn) return 'correct'
    if (tranCn === selectedAnswer) return 'incorrect'
    return 'idle'
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (showResult ? 1 : 0)} total={session.words.length} />
      </div>
      <div className="mb-8 text-center">
        <span className="text-3xl font-bold">{currentWord?.headWord}</span>
        {currentWord?.translations[0]?.pos && (
          <span className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm text-gray-400">
            {[...new Set(currentWord.translations.map((t) => t.pos).filter(Boolean))].join('/')}
          </span>
        )}
        <span className="ml-2 text-sm text-gray-400">{currentWord?.usphone}</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => {
          const pos = opt.translations[0]?.pos
          const meaning = opt.translations[0]?.tranCn ?? opt.headWord
          return (
            <OptionCard
              key={opt.id}
              text={pos ? `[${pos}] ${meaning}` : meaning}
              state={getOptionState(meaning)}
              onClick={() => { if (!showResult) selectAnswer(meaning) }}
              showIcon={showResult}
            />
          )
        })}
      </div>
      {showResult && (
        <button onClick={nextWord} className="mt-6 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white">
          {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
        </button>
      )}
    </div>
  )
}
