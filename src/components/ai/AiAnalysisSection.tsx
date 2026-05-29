import { useState } from 'react'
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import type { Word, PersonaId } from '@/types'
import { DEFAULT_PERSONA } from '@/types'
import { useAiAnalysis } from '@/hooks/useAiAnalysis'
import { PersonaSelector } from './PersonaSelector'
import { AiAnalysisDisplay } from './AiAnalysisDisplay'

interface AiAnalysisSectionProps {
  word: Word
}

function getPersonaKey(): PersonaId {
  try {
    const stored = localStorage.getItem('ai-persona')
    if (stored) return stored as PersonaId
  } catch { /* ignore */ }
  return DEFAULT_PERSONA
}

function setPersonaKey(id: PersonaId) {
  try {
    localStorage.setItem('ai-persona', id)
  } catch { /* ignore */ }
}

export function AiAnalysisSection({ word }: AiAnalysisSectionProps) {
  const [persona, setPersona] = useState<PersonaId>(getPersonaKey)
  const { analysis, isLoading, error, analyze } = useAiAnalysis(word, persona)

  const handlePersonaChange = (id: PersonaId) => {
    setPersona(id)
    setPersonaKey(id)
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-700">AI Analysis</h3>
        {analysis && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            Cached
          </span>
        )}
      </div>

      {!apiKey && (
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <AlertCircle className="mx-auto mb-1 h-5 w-5 text-amber-500" />
          <p className="text-sm text-amber-700">
            Please set <code className="rounded bg-amber-100 px-1 text-xs">VITE_ANTHROPIC_API_KEY</code> in <code className="rounded bg-amber-100 px-1 text-xs">.env</code>
          </p>
        </div>
      )}

      {apiKey && (
        <>
          <div className="mb-3">
            <PersonaSelector selected={persona} onChange={handlePersonaChange} />
          </div>

          {error && (
            <div className="mb-3 rounded-xl bg-red-50 p-3">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
              <button
                onClick={analyze}
                className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-gray-50 p-3.5 animate-pulse">
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full rounded bg-gray-200" />
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!analysis && !isLoading && !error && (
            <button
              onClick={analyze}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              AI Parse
            </button>
          )}

          {analysis && !isLoading && (
            <AiAnalysisDisplay content={analysis} />
          )}
        </>
      )}
    </section>
  )
}
