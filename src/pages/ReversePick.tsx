import { useEffect, useState } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { LayoutRatioSlider } from '@/components/practice/LayoutRatioSlider'
import { ContentScaleSlider } from '@/components/practice/ContentScaleSlider'
import { SessionResult } from '@/components/practice/SessionResult'
import { generateOptions } from '@/services/practiceService'
import { useWordStore } from '@/stores/wordStore'
import { usePracticeStore } from '@/stores/practiceStore'
import type { OptionState } from '@/components/practice/OptionCard'

export function ReversePick() {
  const { session, selectedAnswer, showResult, currentWord, selectAnswer, nextWord } = usePracticeSession('reverse', 10)
  const { words: allWords } = useWordStore()
  const { options, setOptions, layoutRatio, contentScale } = usePracticeStore()
  const [reviewingPrev, setReviewingPrev] = useState(false)

  useEffect(() => {
    if (currentWord && allWords.length > 0 && !showResult) {
      const opts = generateOptions(currentWord, allWords, 4)
      setOptions(opts)
    }
  }, [currentWord?.id, showResult, allWords.length])

  // 键盘快捷键
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (session?.isComplete) return
      if (reviewingPrev) {
        if (e.key === 'Enter' || e.key === 'ArrowRight') setReviewingPrev(false)
        return
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (!showResult) {
        if (e.key === 'ArrowLeft' && session && session.currentIndex > 0) {
          setReviewingPrev(true)
          return
        }
        const optIndex = ['1', '2', '3', '4'].indexOf(e.key)
        if (optIndex >= 0 && options[optIndex]) {
          selectAnswer(options[optIndex].headWord)
        }
      } else {
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          nextWord()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [session, showResult, reviewingPrev, options, selectAnswer, nextWord])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const prevWord = session.currentIndex > 0 ? session.words[session.currentIndex - 1] : null
  const prevAnswer = session.currentIndex > 0 ? session.answers[session.currentIndex - 1] : null

  const getOptionState = (wordHead: string): OptionState => {
    if (!showResult) return 'idle'
    if (wordHead === currentWord!.headWord) return 'correct'
    if (wordHead === selectedAnswer) return 'incorrect'
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
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {prevWord.translations.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span className="text-sm text-gray-700">{t.tranCn}</span>
                      {t.pos && <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-400">[{t.pos}]</span>}
                    </span>
                  ))}
                </div>
              </div>
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex-1">
          <ProgressBar current={session.currentIndex + (showResult ? 1 : 0)} total={session.words.length} />
        </div>
        <ContentScaleSlider />
        <LayoutRatioSlider />
      </div>
      <div style={{ transform: `scale(${contentScale})`, transformOrigin: 'top right' }}>
        <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧：中文释义 */}
        <div className="flex items-center justify-center" style={{ flex: layoutRatio }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {currentWord?.translations.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className="text-xl font-semibold text-gray-700 md:text-2xl">{t.tranCn}</span>
                  {t.pos && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">[{t.pos}]</span>
                  )}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-400">Choose the correct word for this meaning</p>
          </div>
        </div>
        {/* 右侧：选项 */}
        <div className="flex-1 space-y-3">
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
          {!showResult && session.currentIndex > 0 && (
            <button onClick={() => setReviewingPrev(true)} className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50">← Previous word</button>
          )}
          {showResult && currentWord && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currentWord.headWord}</span>
                  {currentWord.translations[0]?.pos && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400">{currentWord.translations[0].pos}</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{currentWord.usphone}</span>
              </div>
              <button onClick={nextWord} className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white">
                {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
