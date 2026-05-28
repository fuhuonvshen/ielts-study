import { useEffect, useState } from 'react'
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
  const [reviewingPrev, setReviewingPrev] = useState(false)

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

  const prevWord = session.currentIndex > 0 ? session.words[session.currentIndex - 1] : null
  const prevAnswer = session.currentIndex > 0 ? session.answers[session.currentIndex - 1] : null

  const getOptionState = (tranCn: string): OptionState => {
    if (!showResult) return 'idle'
    const correctCn = currentWord!.translations[0]?.tranCn ?? ''
    if (tranCn === correctCn) return 'correct'
    if (tranCn === selectedAnswer) return 'incorrect'
    return 'idle'
  }

  // 回顾上一题弹窗
  if (reviewingPrev && prevWord && prevAnswer) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setReviewingPrev(false)} />
        <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col animate-slide-up rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl sm:m-4" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
          <div className="shrink-0 px-5 pt-3 pb-2">
            <p className="mb-1 text-center text-xs text-gray-400">Previous word</p>
            <div className={`text-center ${prevAnswer.isCorrect ? 'text-success-600' : 'text-danger-600'}`}>
              <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                {prevAnswer.isCorrect ? <><span className="text-2xl">&#10003;</span> Correct!</> : <><span className="text-2xl">&#10007;</span> Not quite</>}
              </span>
              {!prevAnswer.isCorrect && <p className="mt-0.5 text-sm text-gray-400">You selected: <span className="text-danger-500">{prevAnswer.userAnswer}</span></p>}
            </div>
          </div>
          <div className="overflow-y-auto px-5 pb-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{prevWord.headWord}</span>
                  {prevWord.translations[0]?.pos && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">[{prevWord.translations[0].pos}]</span>}
                </div>
                <div className="mt-1 text-xs text-gray-400">US: {prevWord.usphone || '-'} / UK: {prevWord.ukphone || '-'}</div>
              </div>
              <section>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Definitions</h3>
                {prevWord.translations.map((t, i) => (
                  <div key={i} className="mb-1.5 flex gap-2 text-sm">
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">{t.pos}</span>
                    <span className="text-gray-700">{t.tranCn}</span>
                    {t.tranOther && <span className="text-gray-400">{t.tranOther}</span>}
                  </div>
                ))}
              </section>
            </div>
          </div>
          <div className="shrink-0 px-5 pb-5 pt-2">
            <button onClick={() => setReviewingPrev(false)} className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white hover:bg-primary-600 active:scale-[0.98]">Back to current</button>
          </div>
        </div>
      </div>
    )
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
              text={pos ? <><span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400 mr-1.5">[{pos}]</span>{meaning}</> : meaning}
              state={getOptionState(meaning)}
              onClick={() => { if (!showResult) selectAnswer(meaning) }}
              showIcon={showResult}
            />
          )
        })}
      </div>
      {!showResult && session.currentIndex > 0 && (
        <button onClick={() => setReviewingPrev(true)} className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50">← Previous word</button>
      )}
      {showResult && (
        <button onClick={nextWord} className="mt-6 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white">
          {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
        </button>
      )}
    </div>
  )
}
