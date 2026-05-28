import { Download, Upload, Loader2 } from 'lucide-react'
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
      const data = JSON.stringify({ words, records, stats }, null, 2)
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
      } finally {
        setIsImporting(false)
        window.location.reload()
      }
    }
    input.click()
  }

  return (
    <div className="flex gap-3">
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
  )
}
