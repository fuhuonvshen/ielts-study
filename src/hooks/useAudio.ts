import { useState, useCallback, useRef } from 'react'
import { speakWord, stopAllAudio, type Accent } from '@/services/audioService'
import { usePracticeStore } from '@/stores/practiceStore'

export function useAudio(accent: Accent = 'uk') {
  const [isPlaying, setIsPlaying] = useState(false)
  const abortRef = useRef(false)

  const play = useCallback(
    async (word: string) => {
      abortRef.current = false
      setIsPlaying(true)
      try {
        const { playbackRate: rate, repeatCount } = usePracticeStore.getState()
        for (let i = 0; i < repeatCount; i++) {
          if (abortRef.current) break
          await speakWord(word, accent, rate)
        }
      } finally {
        setIsPlaying(false)
      }
    },
    [accent]
  )

  const stop = useCallback(() => {
    abortRef.current = true
    stopAllAudio()
  }, [])

  return { play, isPlaying, stop }
}
