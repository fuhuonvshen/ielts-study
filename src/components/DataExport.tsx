import { Download, Upload, Loader2, Trash2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { db, addWords } from '@/lib/db'

export function DataExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const words = await db.words.toArray()
      const records = await db.practiceRecords.toArray()
      const stats = await db.dailyStats.toArray()
      const analyses = await db.aiAnalyses.toArray()
      const data = JSON.stringify({ words, records, stats, analyses }, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ielts-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setIsImporting(true)
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.words) {
          await db.words.clear()
          await addWords(data.words)
        }
        if (data.records) {
          await db.practiceRecords.clear()
          await db.practiceRecords.bulkAdd(data.records)
        }
        if (data.stats) {
          await db.dailyStats.clear()
          await db.dailyStats.bulkAdd(data.stats)
        }
        if (data.analyses) {
          await db.aiAnalyses.clear()
          await db.aiAnalyses.bulkAdd(data.analyses)
        }
      } finally {
        setIsImporting(false)
        window.location.reload()
      }
    }
    input.click()
  }

  const handleClearRecords = async () => {
    if (!window.confirm('This will clear all practice records, daily stats, and reset word progress. Your word data will be kept. Continue?')) return
    await db.practiceRecords.clear()
    await db.dailyStats.clear()
    // 重置所有单词的学习状态
    const words = await db.words.toArray()
    for (const w of words) {
      await db.words.update(w.id, { status: 'new', correctCount: 0, wrongCount: 0 })
    }
    window.location.reload()
  }

  const handleResetAll = async () => {
    if (!window.confirm('This will delete ALL data including words, records, and stats. This cannot be undone! Continue?')) return
    await db.words.clear()
    await db.practiceRecords.clear()
    await db.dailyStats.clear()
    await db.aiAnalyses.clear()
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button onClick={handleExport} disabled={isExporting}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export Data
        </button>
        <button onClick={handleImport} disabled={isImporting}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
          {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Import Backup
        </button>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Data Management</p>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleClearRecords}
            className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100">
            <RotateCcw className="h-4 w-4" />
            Reset Learning Progress
          </button>
          <button onClick={handleResetAll}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
            <Trash2 className="h-4 w-4" />
            Clear All Data
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          "Reset Learning Progress" keeps words but clears practice history. "Clear All Data" removes everything.
        </p>
      </div>
    </div>
  )
}
