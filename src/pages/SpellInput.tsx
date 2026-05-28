import { useState, useEffect, useRef } from 'react'
import { usePracticeSession } from '@/hooks/usePracticeSession'
import { useAudio } from '@/hooks/useAudio'
import { AudioButton } from '@/components/practice/AudioButton'
import { ProgressBar } from '@/components/practice/ProgressBar'
import { SessionResult } from '@/components/practice/SessionResult'
import { checkSpellingAnswer } from '@/services/practiceService'

export function SpellInput() {
  const { play, isPlaying } = useAudio()
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { session, currentWord, selectAnswer, nextWord } = usePracticeSession('spell', 10)

  useEffect(() => {
    if (currentWord && !submitted) {
      play(currentWord.headWord)
    }
    setInput('')
    setSubmitted(false)
    inputRef.current?.focus()
  }, [currentWord?.id])

  if (!session) {
    return <div className="py-20 text-center"><p className="text-gray-400">Loading...</p></div>
  }

  if (session.isComplete) {
    return <SessionResult words={session.words} answers={session.answers} />
  }

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

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <ProgressBar current={session.currentIndex + (submitted ? 1 : 0)} total={session.words.length} />
      </div>
      <div className="mb-8 flex justify-center">
        <AudioButton onClick={() => currentWord && play(currentWord.headWord)} isPlaying={isPlaying} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <button type="submit" disabled={!input.trim()}
            className="w-full rounded-xl bg-primary-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400">
            Check
          </button>
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
                <p className="mt-1 text-xs text-gray-400">{currentWord?.translations.map((t) => t.tranCn).join('；')}</p>
              </div>
            )}
            <button onClick={handleNext} className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white">
              {session.currentIndex + 1 >= session.words.length ? 'Finish' : 'Next Word'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
