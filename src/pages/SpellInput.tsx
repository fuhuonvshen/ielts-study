import { useState, useEffect, useRef } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { usePracticeStore } from '@/stores/practiceStore'
import { useAudio } from '@/hooks/useAudio'
import { stopAllAudio } from '@/services/audioService'
import { AudioButton } from '@/components/practice/AudioButton'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { LayoutRatioSlider } from '@/components/practice/LayoutRatioSlider'
import { ContentScaleSlider } from '@/components/practice/ContentScaleSlider'
import { SessionResult } from '@/components/practice/SessionResult'
import { checkSpellingAnswer } from '@/services/practiceService'

export function SpellInput() {
  const { play, isPlaying } = useAudio()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [reviewingPrev, setReviewingPrev] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastPlayedRef = useRef<string | null>(null)
  const { session, currentWord, selectAnswer, nextWord } = usePracticeSession('spell', 10)
  const { layoutRatio, contentScale } = usePracticeStore()

  useEffect(() => {
    if (currentWord && !submitted && !reviewingPrev && lastPlayedRef.current !== currentWord.id) {
      lastPlayedRef.current = currentWord.id
      play(currentWord.headWord)
    }
    setInput('')
    setSubmitted(false)
    inputRef.current?.focus()
    return () => {
      stopAllAudio()
    }
  }, [currentWord?.id])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

  const prevWord = session.currentIndex > 0 ? session.words[session.currentIndex - 1] : null
  const prevAnswer = session.currentIndex > 0 ? session.answers[session.currentIndex - 1] : null

  const isCorrect = submitted && currentWord ? checkSpellingAnswer(input, currentWord.headWord) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    selectAnswer(input.trim())
    setSubmitted(true)
  }

  const handleNext = () => {
    nextWord()
    setInput('')
    setSubmitted(false)
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
              <div>
                <p className="text-sm text-gray-600">Your answer: <span className={prevAnswer.isCorrect ? 'text-success-600' : 'text-danger-600'}>{prevAnswer.userAnswer}</span></p>
                <p className="text-sm text-gray-600">Correct: <span className="text-success-600 font-semibold">{prevWord.headWord}</span></p>
                <p className="mt-1 text-sm text-gray-600">
                  {prevWord.translations.map((t, i) => (
                    <span key={i}>{i > 0 && '；'}{t.pos && <span className="text-xs text-gray-400">[{t.pos}] </span>}{t.tranCn}</span>
                  ))}
                </p>
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
          <ProgressBar current={session.currentIndex + (submitted ? 1 : 0)} total={session.words.length} />
        </div>
        <ContentScaleSlider />
        <LayoutRatioSlider />
      </div>
      <div style={{ transform: `scale(${contentScale})`, transformOrigin: 'top right' }}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左侧：喇叭按钮 */}
          <div className="flex items-center justify-center" style={{ flex: layoutRatio }}>
            <AudioButton onClick={() => currentWord && play(currentWord.headWord)} isPlaying={isPlaying} />
          </div>
          {/* 右侧：输入表单 */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitted}
            placeholder="Type the word you hear..."
            className="w-full rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 text-center text-lg font-medium outline-none transition-colors focus:border-primary-300"
            autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          />
          {!submitted ? (
            <>
              <button type="submit" disabled={!input.trim()}
                className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400">
                Check
              </button>
              {session.currentIndex > 0 && (
                <button type="button" onClick={() => setReviewingPrev(true)} className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50">← Previous word</button>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              {isCorrect ? (
                <p className="text-center text-success-600 font-medium">Correct!</p>
              ) : (
                <div className="text-center">
                  <p className="text-danger-600 font-medium">Incorrect</p>
                  <p className="mt-1 text-sm text-gray-500">Your answer: <span className="text-danger-600">{input}</span></p>
                  <p className="text-sm text-gray-500">Correct: <span className="text-success-600 font-semibold">{currentWord?.headWord}</span>
                    {currentWord?.translations[0]?.pos && (
                      <span className="ml-1 rounded bg-gray-100 px-1 text-xs text-gray-400">{currentWord.translations[0].pos}</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                  {currentWord?.translations.map((t, i) => (
                    <span key={i}>
                      {i > 0 && '；'}
                      {t.pos && <span className="text-gray-400">[{t.pos}] </span>}
                      {t.tranCn}
                    </span>
                  ))}
                </p>
                </div>
              )}
              <button onClick={handleNext} className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white">
                {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
              </button>
            </div>
          )}
        </form>
      </div>
      </div>
    </div>
  )
}
