import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Volume2, Star } from 'lucide-react'
import { getWordById, updateWord } from '@/lib/db'
import { useAudio } from '@/hooks/useAudio'
import { AiAnalysisSection } from '@/components/ai/AiAnalysisSection'
import type { Word } from '@/types'

export function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>()
  const navigate = useNavigate()
  const [word, setWord] = useState<Word | null>(null)
  const { play, isPlaying } = useAudio()

  useEffect(() => {
    if (wordId) getWordById(wordId).then((w) => setWord(w ?? null))
  }, [wordId])

  if (!word) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const toggleFavorite = async () => {
    await updateWord(word.id, { isFavorite: !word.isFavorite })
    setWord({ ...word, isFavorite: !word.isFavorite })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-3xl border border-gray-100 bg-white p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{word.headWord}</h1>
              <button
                onClick={() => play(word.headWord)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
              >
                <Volume2 className={`h-5 w-5 ${isPlaying ? 'animate-pulse text-primary-500' : ''}`} />
              </button>
            </div>
            <div className="mt-2 flex gap-3 text-sm text-gray-400">
              <span>US: {word.usphone || '-'}</span>
              <span>UK: {word.ukphone || '-'}</span>
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className={`rounded-full p-2 transition-colors ${
              word.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
            }`}
          >
            <Star className="h-5 w-5" fill={word.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Definitions</h3>
            {word.translations.map((t, i) => (
              <div key={i} className="mb-2 flex gap-2 text-sm">
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                  {t.pos}
                </span>
                <span className="text-gray-700">{t.tranCn}</span>
                {t.tranOther && <span className="text-gray-400">{t.tranOther}</span>}
              </div>
            ))}
          </section>

          {word.sentences.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Sentences</h3>
              <ul className="space-y-2">
                {word.sentences.map((s, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-gray-700">{s.en}</p>
                    <p className="text-gray-400">{s.cn}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {word.synonyms.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Synonyms</h3>
              {word.synonyms.map((s, i) => (
                <div key={i} className="mb-1 text-sm">
                  <span className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">{s.pos}</span>{' '}
                  <span className="text-gray-600">{s.words.join('、')}</span>
                </div>
              ))}
            </section>
          )}

          {word.phrases.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Phrases</h3>
              <ul className="space-y-1">
                {word.phrases.map((p, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium text-gray-700">{p.en}</span>
                    <span className="ml-1 text-gray-400">— {p.cn}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6">
            <AiAnalysisSection word={word} />
          </div>
        </div>
      </div>
    </div>
  )
}
