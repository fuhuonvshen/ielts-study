import { useState, useCallback } from 'react'
import { speakWord, type Accent } from '@/services/audioService'

export function useAudio(accent: Accent = 'us') {
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback(
    async (word: string) => {
      setIsPlaying(true)
      try {
        await speakWord(word, accent)
      } finally {
        setIsPlaying(false)
      }
    },
    [accent]
  )

  return { play, isPlaying }
}
