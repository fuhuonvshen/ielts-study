import { useState, useCallback } from 'react'
import { speakWord, type Accent } from '@/services/audioService'
import { usePracticeStore } from '@/stores/practiceStore'

export function useAudio(accent: Accent = 'uk') {
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback(
    async (word: string) => {
      setIsPlaying(true)
      try {
        const rate = usePracticeStore.getState().playbackRate
        await speakWord(word, accent, rate)
      } finally {
        setIsPlaying(false)
      }
    },
    [accent]
  )

  return { play, isPlaying }
}
