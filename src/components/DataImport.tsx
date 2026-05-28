import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { addWords } from '@/lib/db'
import { parseLine, transformWord } from '@/services/importService'
import { useWordStore } from '@/stores/wordStore'
import type { Word } from '@/types'

export function DataImport() {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const { loadWords, setImported } = useWordStore()

  const handleImport = async () => {
    setIsImporting(true)
    setProgress(0)
    try {
      const response = await fetch('/IELTSword.json')
      if (!response.ok) throw new Error('Failed to load JSON')
      const text = await response.text()
      const lines = text.trim().split('\n')
      const words: Word[] = []
      for (let i = 0; i < lines.length; i++) {
        const raw = parseLine(lines[i])
        if (raw && raw.headWord) words.push(transformWord(raw))
        setProgress((i + 1) / lines.length)
      }
      const BATCH = 500
      for (let i = 0; i < words.length; i += BATCH) {
        await addWords(words.slice(i, i + BATCH))
      }
      setImported(true)
      await loadWords()
    } catch (err) { console.error('Import error:', err) }
    finally { setIsImporting(false) }
  }

  return (
    <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
          <Upload className="h-8 w-8 text-primary-500" />
        </div>
      </div>
      <h2 className="mb-2 text-lg font-semibold">Import IELTS Vocabulary</h2>
      <p className="mb-6 text-sm text-gray-500">Load words from IELTSword.json to get started with your practice</p>
      <button onClick={handleImport} disabled={isImporting}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:bg-gray-200 disabled:text-gray-400">
        {isImporting ? <><Loader2 className="h-4 w-4 animate-spin" /> Importing... {Math.round(progress * 100)}%</> : <><Upload className="h-4 w-4" /> Import Words</>}
      </button>
      {isImporting && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-primary-500 transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  )
}
