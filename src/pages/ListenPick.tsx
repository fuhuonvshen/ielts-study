import { useEffect, useState } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { usePracticeStore } from '@/stores/practiceStore'
import { useAudio } from '@/hooks/useAudio'
import { AudioButton } from '@/components/practice/AudioButton'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { LayoutRatioSlider } from '@/components/practice/LayoutRatioSlider'
import { ContentScaleSlider } from '@/components/practice/ContentScaleSlider'
import { SessionResult } from '@/components/practice/SessionResult'
import { updateWord } from '@/lib/db'
import type { OptionState } from '@/components/practice/OptionCard'

export function ListenPick() {
  const { play, isPlaying } = useAudio()
  const {
    session, options, selectedAnswer, showResult, currentWord,
    selectAnswer, nextWord,
  } = usePracticeSession('listen', 10)
  const { layoutRatio, contentScale } = usePracticeStore()
  const [isFav, setIsFav] = useState(false)
  const [reviewingPrev, setReviewingPrev] = useState(false)

  useEffect(() => {
    if (currentWord && !showResult && !session?.isComplete) {
      const timer = setTimeout(() => play(currentWord.headWord), 300)
      return () => clearTimeout(timer)
    }
  }, [currentWord?.id, showResult, session?.isComplete])

  // 同步收藏状态
  useEffect(() => {
    if (currentWord) {
      setIsFav(currentWord.isFavorite ?? false)
    }
  }, [currentWord?.id])

  const toggleFav = async (word: typeof currentWord) => {
    if (!word) return
    const newFav = !isFav
    setIsFav(newFav)
    await updateWord(word.id, { isFavorite: newFav })
  }

  const prevWord = session && session.currentIndex > 0 ? session.words[session.currentIndex - 1] : null
  const prevAnswer = session && session.currentIndex > 0 ? session.answers[session.currentIndex - 1] : null

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading practice session...</p></div>
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

  // ---- 回顾上一题的弹窗 ----
  if (reviewingPrev && prevWord && prevAnswer) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setReviewingPrev(false)} />
        <div
          className="relative flex max-h-[90vh] w-full max-w-lg flex-col animate-slide-up rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl sm:m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
          <div className="shrink-0 px-5 pt-3 pb-2">
            <p className="mb-1 text-center text-xs text-gray-400">Previous word</p>
            <div className={`text-center ${prevAnswer.isCorrect ? 'text-success-600' : 'text-danger-600'}`}>
              <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                {prevAnswer.isCorrect ? (
                  <><span className="text-2xl">&#10003;</span> Correct!</>
                ) : (
                  <><span className="text-2xl">&#10007;</span> Not quite</>
                )}
              </span>
              {!prevAnswer.isCorrect && (
                <p className="mt-0.5 text-sm text-gray-400">You selected: <span className="text-danger-500">{prevAnswer.userAnswer}</span></p>
              )}
            </div>
          </div>
          <div className="overflow-y-auto px-5 pb-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">{prevWord.headWord}</span>
                    {prevWord.translations[0]?.pos && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">[{prevWord.translations[0].pos}]</span>
                    )}
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-gray-400">
                    <span>US: {prevWord.usphone || '-'}</span>
                    <span>UK: {prevWord.ukphone || '-'}</span>
                  </div>
                </div>
                <button
                  onClick={() => play(prevWord.headWord)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-500"
                >
                  <span className={`text-lg ${isPlaying ? 'animate-pulse text-primary-500' : ''}`}>🔊</span>
                </button>
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
              {prevWord.sentences.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Sentences</h3>
                  <ul className="space-y-1.5">
                    {prevWord.sentences.map((s, i) => (
                      <li key={i} className="text-sm"><p className="text-gray-700">{s.en}</p><p className="text-gray-400">{s.cn}</p></li>
                    ))}
                  </ul>
                </section>
              )}
              {prevWord.synonyms.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Synonyms</h3>
                  {prevWord.synonyms.map((s, i) => (
                    <div key={i} className="mb-1 text-sm">
                      <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">{s.pos}</span>{' '}
                      <span className="text-gray-600">{s.words.join('、')}</span>
                    </div>
                  ))}
                </section>
              )}
              {prevWord.phrases.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Phrases</h3>
                  <ul className="space-y-1">
                    {prevWord.phrases.map((p, i) => (
                      <li key={i} className="text-sm"><span className="font-medium text-gray-700">{p.en}</span><span className="ml-1 text-gray-400">— {p.cn}</span></li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
          <div className="shrink-0 px-5 pb-5 pt-2">
            <button
              onClick={() => setReviewingPrev(false)}
              className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 active:scale-[0.98]"
            >
              Back to current
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- 正常答题界面 + 答题后弹窗 ----
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
          {/* 左侧：喇叭按钮 */}
          <div className="flex items-center justify-center" style={{ flex: layoutRatio }}>
            <AudioButton onClick={() => currentWord && play(currentWord.headWord)} isPlaying={isPlaying} />
          </div>
          {/* 右侧：选项 */}
          <div className="flex-1 space-y-3">
            <p className="text-center text-sm text-gray-400 md:text-left">
              Listen and choose the correct meaning
            </p>
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
            {/* 上一题按钮 */}
            {!showResult && session.currentIndex > 0 && (
              <button
                onClick={() => setReviewingPrev(true)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50"
              >
                ← Previous word
              </button>
            )}
          </div>
        </div>
      </div>
      {/* 答题后弹窗 */}
      {showResult && currentWord && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col animate-slide-up rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl sm:m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-200 sm:hidden" />
            <div className="shrink-0 px-5 pt-3 pb-2">
              <div className={`text-center ${selectedAnswer === (currentWord.translations[0]?.tranCn ?? '') ? 'text-success-600' : 'text-danger-600'}`}>
                <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                  {selectedAnswer === (currentWord.translations[0]?.tranCn ?? '') ? (
                    <><span className="text-2xl">&#10003;</span> Correct!</>
                  ) : (
                    <><span className="text-2xl">&#10007;</span> Not quite</>
                  )}
                </span>
                {selectedAnswer !== (currentWord.translations[0]?.tranCn ?? '') && (
                  <p className="mt-0.5 text-sm text-gray-400">You selected: <span className="text-danger-500">{selectedAnswer}</span></p>
                )}
              </div>
            </div>
            <div className="overflow-y-auto px-5 pb-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">{currentWord.headWord}</span>
                      {currentWord.translations[0]?.pos && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">[{currentWord.translations[0].pos}]</span>
                      )}
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-gray-400">
                      <span>US: {currentWord.usphone || '-'}</span>
                      <span>UK: {currentWord.ukphone || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => play(currentWord.headWord)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-primary-50 hover:text-primary-500"
                    >
                      <span className={`text-lg ${isPlaying ? 'animate-pulse text-primary-500' : ''}`}>🔊</span>
                    </button>
                    <button
                      onClick={() => toggleFav(currentWord)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-300 hover:bg-yellow-50 hover:text-yellow-400"
                    >
                      <span className="text-lg">{isFav ? '⭐' : '☆'}</span>
                    </button>
                  </div>
                </div>
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Definitions</h3>
                  {currentWord.translations.map((t, i) => (
                    <div key={i} className="mb-1.5 flex gap-2 text-sm">
                      <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">{t.pos}</span>
                      <span className="text-gray-700">{t.tranCn}</span>
                      {t.tranOther && <span className="text-gray-400">{t.tranOther}</span>}
                    </div>
                  ))}
                </section>
                {currentWord.sentences.length > 0 && (
                  <section>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Sentences</h3>
                    <ul className="space-y-1.5">
                      {currentWord.sentences.map((s, i) => (
                        <li key={i} className="text-sm"><p className="text-gray-700">{s.en}</p><p className="text-gray-400">{s.cn}</p></li>
                      ))}
                    </ul>
                  </section>
                )}
                {currentWord.synonyms.length > 0 && (
                  <section>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Synonyms</h3>
                    {currentWord.synonyms.map((s, i) => (
                      <div key={i} className="mb-1 text-sm">
                        <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">{s.pos}</span>{' '}
                        <span className="text-gray-600">{s.words.join('、')}</span>
                      </div>
                    ))}
                  </section>
                )}
                {currentWord.phrases.length > 0 && (
                  <section>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Phrases</h3>
                    <ul className="space-y-1">
                      {currentWord.phrases.map((p, i) => (
                        <li key={i} className="text-sm"><span className="font-medium text-gray-700">{p.en}</span><span className="ml-1 text-gray-400">— {p.cn}</span></li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </div>
            <div className="shrink-0 px-5 pb-5 pt-2">
              <button
                onClick={nextWord}
                className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 active:scale-[0.98]"
              >
                {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}