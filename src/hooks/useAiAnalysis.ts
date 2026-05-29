import { useState, useCallback, useEffect } from 'react'
import type { Word, PersonaId, AiAnalysisContent } from '@/types'
import { getAiAnalysis, setAiAnalysis } from '@/lib/db'
import { analyzeWord } from '@/services/aiService'

interface UseAiAnalysisReturn {
  analysis: AiAnalysisContent | null
  isLoading: boolean
  error: string | null
  analyze: () => void
}

export function useAiAnalysis(word: Word, persona: PersonaId): UseAiAnalysisReturn {
  const [analysis, setAnalysis] = useState<AiAnalysisContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check cache on mount or when word/persona changes
  useEffect(() => {
    let cancelled = false
    getAiAnalysis(word.id, persona).then((cached) => {
      if (cancelled) return
      if (cached) {
        setAnalysis(cached.content)
        setError(null)
      } else {
        setAnalysis(null)
        setError(null)
      }
    })
    return () => { cancelled = true }
  }, [word.id, persona])

  const analyze = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await analyzeWord(word, persona)
      await setAiAnalysis({
        wordId: word.id,
        persona,
        content: result,
        createdAt: Date.now(),
      })
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [word, persona])

  return { analysis, isLoading, error, analyze }
}
