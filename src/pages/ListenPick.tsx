import { useEffect } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useAudio } from '@/hooks/useAudio'
import { AudioButton } from '@/components/practice/AudioButton'
import { OptionCard } from '@/components/practice/OptionCard'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import type { OptionState } from '@/components/practice/OptionCard'

export function ListenPick() {
  const { play, isPlaying } = useAudio()
  const {
    session, options, selectedAnswer, showResult, currentWord,
    selectAnswer, nextWord,
  } = usePracticeSession('listen', 10)

  useEffect(() => {
    if (currentWord && !showResult) {
      const timer = setTimeout(() => play(currentWord.headWord), 300)
      return () => clearTimeout(timer)
    }
  }, [currentWord?.id, showResult])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading practice session...</p></div>
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
      <div className="mb-8 flex justify-center">
        <AudioButton onClick={() => currentWord && play(currentWord.headWord)} isPlaying={isPlaying} />
      </div>
      <div className="mb-4 text-center text-sm text-gray-400">
        Listen and choose the correct word
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
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-bold">{currentWord.headWord}</span>
            <span className="text-sm text-gray-400">{currentWord.usphone}</span>
          </div>
          <p className="text-sm text-gray-600">
            {currentWord.translations.map((t) => t.tranCn).join('；')}
          </p>
          {currentWord.sentences[0] && (
            <div className="mt-2 border-t border-gray-50 pt-2">
              <p className="text-xs text-gray-400">{currentWord.sentences[0].en}</p>
              <p className="text-xs text-gray-300">{currentWord.sentences[0].cn}</p>
            </div>
          )}
          <button
            onClick={nextWord}
            className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
          </button>
        </div>
      )}
    </div>
  )
}
